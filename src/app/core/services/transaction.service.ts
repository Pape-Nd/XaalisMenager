import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Transaction } from '../../models/transaction';

@Injectable({
  providedIn: 'root',
})
export class TransactionService {
  private storageKey = 'money-tracker-transactions';
  private transactionsSubject = new BehaviorSubject<Transaction[]>(this.getFromStorage());
  public transactions$ = this.transactionsSubject.asObservable();

  constructor() {}

  private getFromStorage(): Transaction[] {
    const data = localStorage.getItem(this.storageKey);
    return data ? JSON.parse(data) : [];
  }

  private saveToStorage(transactions: Transaction[]) {
    localStorage.setItem(this.storageKey, JSON.stringify(transactions));
  }

  getTransactions(): Transaction[] {
    return this.transactionsSubject.value;
  }

  addTransaction(transaction: Transaction) {
    const updated = [transaction, ...this.transactionsSubject.value];
    this.saveToStorage(updated);
    this.transactionsSubject.next(updated);
  }

  deleteTransaction(id: string) {
    const updated = this.transactionsSubject.value.filter(t => t.id !== id);
    this.saveToStorage(updated);
    this.transactionsSubject.next(updated);
  }

  clearAll() {
    localStorage.removeItem(this.storageKey);
    this.transactionsSubject.next([]);
  }

  // ✅ Calcul du solde
  getSolde(): number {
    return this.transactionsSubject.value.reduce((total, t) => {
      return t.type === 'income' ? total + t.amount : total - t.amount;
    }, 0);
  }

  // ✅ Total des dépenses
  getTotalDepenses(): number {
    return this.transactionsSubject.value
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
  }

  // ✅ Total des revenus
  getTotalRevenus(): number {
    return this.transactionsSubject.value
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
  }
}
