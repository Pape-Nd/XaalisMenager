import { Component, OnInit } from '@angular/core';
import { BudgetService } from '../core/services/budget.service';
import { TransactionService } from '../core/services/transaction.service';
import { ToastService } from '../core/services/toast.service';
import { ThemeService } from '../core/services/theme.service';
import { Budget } from '../models/budget';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CategoryService } from '../core/services/category.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
  ]
})
export class SettingsComponent implements OnInit {
  categories: string[] = ['Alimentaire', 'Transport', 'Logement', 'Loisirs', 'Santé'];
  selectedCategory: string = 'Alimentaire';
  newCategory: string = '';
  budgetAmount: number = 0;
  budgets: Budget[] = [];
  isEditing: boolean = false;
  budgetToEdit: string | null = null;
  showConfirmationModal: boolean = false;

  selectedTheme: 'light' | 'dark' = 'light';

  constructor(
    private budgetService: BudgetService,
    private transactionService: TransactionService,
    private toastService: ToastService,
    private themeService: ThemeService,
    private categoryService: CategoryService
  ) {}

  ngOnInit(): void {
    this.categoryService.categories$.subscribe(categories => {
      this.categories = categories;
    });

    this.budgetService.budgets$.subscribe(budgets => {
      this.budgets = budgets;
    });

    this.selectedTheme = this.themeService.getCurrentTheme();
  }

  changeTheme(): void {
    this.themeService.applyTheme(this.selectedTheme);
  }

  saveBudget(): void {
    if (this.budgetAmount > 0) {
      if (this.isEditing && this.budgetToEdit) {
        this.budgetService.setBudget(this.budgetToEdit, this.budgetAmount);
        this.toastService.show('Budget modifié avec succès 💾', 'success');
        this.isEditing = false;
        this.budgetToEdit = null;
      } else {
        this.budgetService.setBudget(this.selectedCategory, this.budgetAmount);
        this.toastService.show('Budget enregistré ✅', 'success');
      }
      this.budgetAmount = 0;
    }
  }

  editBudget(category: string): void {
    const budgetToEdit = this.budgets.find(b => b.category === category);
    if (budgetToEdit) {
      this.selectedCategory = category;
      this.budgetAmount = budgetToEdit.amount;
      this.isEditing = true;
      this.budgetToEdit = category;
    }
  }

  removeBudget(category: string): void {
    const updatedBudgets = this.budgets.filter(b => b.category !== category);
    this.budgetService.clearAllBudgets();
    updatedBudgets.forEach(b => {
      this.budgetService.setBudget(b.category, b.amount);
    });
  }

  confirmAndRemoveBudget(category: string): void {
    const confirmation = window.confirm(`Voulez-vous vraiment supprimer le budget pour la catégorie "${category}" ?`);
    if (confirmation) {
      this.removeBudget(category);
    }
  }

  resetAllData(): void {
    if (confirm('Es-tu sûr de vouloir tout réinitialiser ? Cette action est irréversible !')) {
      this.transactionService.clearAll();
      this.budgetService.clearAllBudgets();
      this.categoryService.resetCategories(); // ✅ Reset centralisé
      this.toastService.show('Toutes les données ont été réinitialisées 🧹', 'danger');
    }
  }

  addCategory(): void {
    const trimmed = this.newCategory.trim();
    if (!trimmed) {
      this.toastService.show('Le nom de la catégorie ne peut pas être vide ❌', 'danger');
      return;
    }

    if (this.categories.includes(trimmed)) {
      this.toastService.show('Cette catégorie existe déjà ⚠️', 'info');
      return;
    }

    this.categoryService.addCategory(trimmed);
    this.newCategory = '';
    this.toastService.show('Nouvelle catégorie ajoutée avec succès 🎉', 'success');
  }

  openConfirmationModal(): void {
    this.showConfirmationModal = true;
  }

  closeConfirmationModal(): void {
    this.showConfirmationModal = false;
  }

  confirmReset(): void {
    this.resetAllData();
    this.closeConfirmationModal();
  }

  someAction(): void {
    this.toastService.show('Action réussie 🎉', 'success');
  }
}
