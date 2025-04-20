import { Component, ElementRef, ViewChild, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TransactionService } from '../core/services/transaction.service';
import { BudgetService } from '../core/services/budget.service';
import { AiService } from '../core/services/ai.service';

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chatbot.component.html',
  styleUrls: ['./chatbot.component.scss']
})
export class ChatbotComponent implements AfterViewChecked {
  messages: { from: 'user' | 'bot', text: string }[] = [];
  userInput = '';
  isBotTyping = false;

  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;

  constructor(
    private transactionService: TransactionService,
    private budgetService: BudgetService,
    private aiService: AiService
  ) { }

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  scrollToBottom(): void {
    try {
      this.scrollContainer.nativeElement.scrollTo({
        top: this.scrollContainer.nativeElement.scrollHeight,
        behavior: 'smooth'
      });
    } catch (err) {
      console.error('Erreur de scroll :', err);
    }
  }

  async sendMessage(): Promise<void> {
    const input = this.userInput.trim();
    if (!input) return;

    this.messages.push({ from: 'user', text: input });
    this.userInput = '';
    this.isBotTyping = true;

    // Message temporaire pendant "réflexion"
    this.messages.push({ from: 'bot', text: 'typing' });

    await new Promise(resolve => setTimeout(resolve, 1000));
    await this.processMessage(input.toLowerCase());

    this.isBotTyping = false;
  }

  async processMessage(input: string): Promise<void> {
    let response = "Désolé, je n'ai pas compris. Essaie avec une autre formulation 😊";

    const containsAll = (text: string, keywords: string[]) =>
      keywords.every(k => text.includes(k));

    if (input.includes('solde')) {
      const solde = this.transactionService.getSolde();
      response = `Ton solde actuel est de ${solde} FCFA 💰`;

    } else if (containsAll(input, ['dépenses', 'mois'])) {
      const totalDepenses = this.transactionService.getTotalDepenses();
      response = `Tu as dépensé ${totalDepenses} FCFA ce mois-ci.`;

    } else if (input.includes('revenu')) {
      const totalRevenus = this.transactionService.getTotalRevenus();
      response = `Tu as gagné ${totalRevenus} FCFA ce mois-ci.`;

    } else if (containsAll(input, ['budget', 'pour'])) {
      const match = input.match(/budget.*pour\s+(\w+)/);
      if (match) {
        const category = match[1];
        const budget = this.budgetService.getBudget(category);
        response = budget
          ? `Le budget pour ${category} est de ${budget.amount} FCFA.`
          : `Il n'y a pas encore de budget pour ${category}.`;
      }

    } else if (containsAll(input, ['mettre à jour', 'budget'])) {
      const match = input.match(/mettre à jour.*budget.*pour\s+(\w+)\s+à\s+(\d+)/);
      if (match) {
        const category = match[1];
        const amount = parseFloat(match[2]);
        this.budgetService.setBudget(category, amount);
        response = `Le budget pour ${category} a été mis à jour à ${amount} FCFA.`;
      }

    } else if (containsAll(input, ['catégories', 'dépenses'])) {
      const categories = this.transactionService.getTransactions().map(t => t.category);
      const uniqueCategories = [...new Set(categories)];
      response = `Voici tes catégories de dépenses : ${uniqueCategories.join(', ')}.`;

    } else if (containsAll(input, ['réinitialiser', 'budgets'])) {
      this.budgetService.clearAllBudgets();
      response = `Tous tes budgets ont été réinitialisés.`;

    } else if (input.includes('aide') || input.includes('que peux-tu faire')) {
      response = `Je peux t'aider à :
- Consulter ton solde 💰
- Voir tes dépenses / revenus
- Gérer tes budgets (ajouter / voir / modifier)
- Ajouter des transactions
- Répondre à des questions sur la gestion financière`;

    } else if (input.includes('économiser')) {
      response = "Pour économiser, commence par suivre tes dépenses, définis un budget réaliste, et élimine les achats impulsifs.";

    } else if (input.includes('définir un budget')) {
      response = "Définir un budget consiste à allouer une partie de tes revenus à chaque catégorie de dépenses (nourriture, logement, transport, etc.) en fonction de tes priorités.";

    } else if (input.includes('développement financier')) {
      response = "Le développement financier repose sur une bonne gestion de ton argent : faire un budget, épargner régulièrement, investir intelligemment et éviter les dettes inutiles.";

    } else if (input.includes('comment mieux gérer mon argent')) {
      response = "Commence par suivre tes dépenses, établis un budget mensuel, fixe-toi des objectifs d’épargne, et évite les crédits non essentiels.";

    } else if (input.includes('épargne') || input.includes('comment épargner')) {
      response = "Essaie de mettre de côté un pourcentage de chaque revenu, même petit. Automatise l’épargne si possible et crée un fonds d’urgence.";
    }

    const lastTypingIndex = this.messages.findIndex(m => m.text === 'typing');
    if (lastTypingIndex !== -1) {
      this.messages[lastTypingIndex] = { from: 'bot', text: response };
    } else {
      this.messages.push({ from: 'bot', text: response });
    }

  }
}
