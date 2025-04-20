import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {

  private currentTheme: 'light' | 'dark' = 'light';

  constructor() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || savedTheme === 'light') {
      this.currentTheme = savedTheme as 'light' | 'dark';
    }
    this.applyTheme(this.currentTheme);
  }

  getCurrentTheme(): 'light' | 'dark' {
    return this.currentTheme;
  }

  applyTheme(theme: 'light' | 'dark'): void {
    this.currentTheme = theme;
    localStorage.setItem('theme', theme);

    // Supprime les deux classes possibles
    document.body.classList.remove('light', 'dark');

    // Ajoute la bonne classe
    document.body.classList.add(theme);
  }
}
