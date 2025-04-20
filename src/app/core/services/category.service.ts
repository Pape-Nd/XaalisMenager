import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private defaultCategories = ['Alimentaire', 'Transport', 'Logement', 'Loisirs', 'Santé'];
  private categoriesSubject = new BehaviorSubject<string[]>(this.loadCategories());
  categories$ = this.categoriesSubject.asObservable();

  private loadCategories(): string[] {
    const stored = localStorage.getItem('customCategories');
    return stored ? JSON.parse(stored) : [...this.defaultCategories];
  }

  private saveCategories(categories: string[]) {
    localStorage.setItem('customCategories', JSON.stringify(categories));
    this.categoriesSubject.next(categories);
  }

  getCategories(): string[] {
    return this.categoriesSubject.value;
  }

  addCategory(newCat: string) {
    const trimmed = newCat.trim();
    const current = this.getCategories();
    if (!trimmed || current.includes(trimmed)) return;
    this.saveCategories([...current, trimmed]);
  }

  removeCategory(name: string) {
    const updated = this.getCategories().filter(c => c !== name);
    this.saveCategories(updated);
  }

  resetCategories() {
    this.saveCategories([...this.defaultCategories]);
  }
}
