import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TransactionService } from '../../core/services/transaction.service';
import { Transaction } from '../../models/transaction';
import { CategoryService } from '../../core/services/category.service';

declare var bootstrap: any;

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './transactions.component.html',
  styleUrls: ['./transactions.component.scss']
})
export class TransactionsComponent implements OnInit {
  selectedMonth = '';
  selectedCategory = '';
  selectedType = '';

  transactions: Transaction[] = [];
  transactionToDelete: Transaction | null = null;

  transaction: Transaction = {
    id:'',
    date: '',
    description: '',
    amount: 0,
    type: 'expense',
    category: ''
  };


  categories: string[] = [];

  constructor(private transactionService: TransactionService,
            private categoryService: CategoryService
  ) {}

  ngOnInit(): void {
    this.transactionService.transactions$.subscribe(tx => {
      this.transactions = tx;
    });

    this.categoryService.categories$.subscribe(cat => {
      this.categories = cat;
    });
  }

  get filteredTransactions() {
    return this.transactions.filter(tx => {
      const txMonth = tx.date?.slice(0, 7);
      const matchMonth = !this.selectedMonth || txMonth === String(this.selectedMonth);
      const matchCategory = !this.selectedCategory || tx.category === this.selectedCategory;
      const matchType = !this.selectedType || tx.type === this.selectedType;
      return matchMonth && matchCategory && matchType;
    });
  }

  get balance(): number {
    return this.filteredTransactions.reduce((acc, tx) => acc + (Number(tx.amount) || 0), 0);
  }

  addTransaction() {
    if (this.transaction.description && this.transaction.amount && this.transaction.category && this.transaction.date) {
      const rawAmount = Number(this.transaction.amount);
      const calculatedAmount = this.transaction.type === 'expense'
        ? -Math.abs(rawAmount)
        : Math.abs(rawAmount);
  
      const newTx: Transaction = {
        ...this.transaction,
        id: Date.now().toString(), // 🔁 Tu avais oublié de régénérer l'id
        amount: calculatedAmount   // ✅ On met bien le montant selon le type
      };
  
      this.transactionService.addTransaction(newTx);
  
      // Réinitialisation
      this.transaction = {
        id: '',
        date: '',
        description: '',
        amount: 0,
        type: 'expense',
        category: ''
      };
    }
  }
  
  openDeleteModal(index: number) {
    const tx = this.filteredTransactions[index];
    this.transactionToDelete = tx;

    const modalEl = document.getElementById('confirmDeleteModal');
    if (modalEl) {
      const modal = new bootstrap.Modal(modalEl);
      modal.show();
    }
  }

  confirmDelete() {
    if (this.transactionToDelete) {
      this.transactionService.deleteTransaction(this.transactionToDelete.id);
      this.transactionToDelete = null;

      const modalEl = document.getElementById('confirmDeleteModal');
      if (modalEl) {
        const modal = bootstrap.Modal.getInstance(modalEl);
        modal?.hide();
      }
    }
  }

  resetFilters() {
    this.selectedMonth = '';
    this.selectedCategory = '';
    this.selectedType = '';
  }

  async exportToPDF() {
    const jsPDFModule = await import('jspdf');
    const autoTableModule = await import('jspdf-autotable');
    const doc = new jsPDFModule.jsPDF();
    const autoTable = autoTableModule.default;
    const pageWidth = doc.internal.pageSize.getWidth();
  
    // En-tête
    doc.setFillColor(0, 123, 255);
    doc.rect(0, 0, pageWidth, 30, 'F');
    doc.setTextColor(255);
    doc.setFontSize(16);
    doc.text('Xaalis Menager - Rapport des Transactions', 10, 18);
    doc.setFontSize(10);
    const today = new Date().toLocaleString();
    doc.text(`Généré le : ${today}`, 10, 25);
  
    // Résumé des totaux
    const totalExpenses = this.filteredTransactions.filter(tx => tx.type === 'expense')
      .reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0);
    const totalIncome = this.filteredTransactions.filter(tx => tx.type === 'income')
      .reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0);
  
    doc.setFillColor(245, 245, 245);
    doc.rect(10, 35, pageWidth - 20, 25, 'F');
    doc.setTextColor(40);
    doc.setFontSize(11);
    doc.text(`Total revenus : ${totalIncome.toLocaleString('fr-FR')} FCFA`, 15, 45);
    doc.text(`Total dépenses : ${totalExpenses.toLocaleString('fr-FR')} FCFA`, 15, 52);
  
    // Solde
    if (this.balance >= 0) {
      doc.setTextColor(0, 150, 0);
    } else {
      doc.setTextColor(200, 0, 0);
    }
    doc.text(`Solde actuel : ${this.balance.toLocaleString('fr-FR')} FCFA`, pageWidth - 15, 45, { align: 'right' });
  
    // Tableau
    autoTable(doc, {
      startY: 65,
      head: [['Date', 'Description', 'Catégorie', 'Type', 'Montant']],
      body: this.filteredTransactions.map(tx => [
        tx.date,
        tx.description,
        tx.category,
        tx.type === 'expense' ? 'Dépense' : 'Revenu',
        (Number(tx.amount) || 0).toLocaleString('fr-FR') + ' FCFA'
      ])
    });
  
    // Pagination
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(9);
      doc.setTextColor(150);
      doc.text(`Page ${i} / ${pageCount}`, pageWidth - 15, doc.internal.pageSize.getHeight() - 10, { align: 'right' });
    }
  
    // Sauvegarde
    const filename = `rapport_transactions_${today.replace(/[\/,:]/g, '-')}.pdf`;
    doc.save(filename);
  }  
}
