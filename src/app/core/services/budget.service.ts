import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Budget } from '../../models/budget';

@Injectable({
  providedIn: 'root'
})
export class BudgetService {
  private storageKey = 'budgets';
  private budgetsSubject = new BehaviorSubject<Budget[]>(this.getBudgetsFromStorage());
  budgets$ = this.budgetsSubject.asObservable();

  constructor() {}

  private getBudgetsFromStorage(): Budget[] {
    const data = localStorage.getItem(this.storageKey);
    return data ? JSON.parse(data) : [];
  }

  private saveBudgetsToStorage(budgets: Budget[]): void {
    localStorage.setItem(this.storageKey, JSON.stringify(budgets));
  }

  getBudgets(): Budget[] {
    return this.budgetsSubject.value;
  }

  setBudget(category: string, amount: number): void {
    const budgets = this.budgetsSubject.value;
    const index = budgets.findIndex(b => b.category === category);

    if (index !== -1) {
      budgets[index].amount = amount;
    } else {
      budgets.push({ category, amount });
    }

    this.saveBudgetsToStorage(budgets);
    this.budgetsSubject.next([...budgets]);
  }

  getBudgetForCategory(category: string): number {
    return this.getBudgets().find(b => b.category === category)?.amount ?? 0;
  }

  clearAllBudgets(): void {
    localStorage.removeItem(this.storageKey);
    this.budgetsSubject.next([]);
  }

  getBudget(category: string): Budget | undefined {
    return this.getBudgets().find(b => b.category.toLowerCase() === category.toLowerCase());
  }
}
