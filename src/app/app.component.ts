import { Component } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { HeaderComponent } from './header/header.component';
import { ChatbotComponent } from './chatbot/chatbot.component';
import { CommonModule } from '@angular/common';
import { ToastComponent } from './shared/components/toast/toast.component';
import { ToastService } from './core/services/toast.service';
import { FooterComponent } from './footer/footer.component';
import * as AOS from 'aos'

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterModule,
    HeaderComponent,
    ChatbotComponent,
    CommonModule,
    ToastComponent,
    FooterComponent
  ],
  template: `
    <app-header></app-header>
    <router-outlet></router-outlet>
    <!-- Toast de notifications -->
    <app-toast></app-toast>
    <!-- Chatbot flottant -->
    <app-chatbot *ngIf="showChatbot" class="floating-chatbot"></app-chatbot>

    <!-- Bouton flottant pour activer/désactiver le chatbot -->
    <button
      class="btn btn-primary rounded-circle chatbot-toggle-btn"
      (click)="toggleChatbot()">
      <i class="bi bi-chat-dots-fill"></i>
    </button>
<app-footer></app-footer>
  `
})
export class AppComponent {
  showChatbot: boolean = false;

  constructor(private toastService: ToastService) {
    // Test : afficher un toast après 1 seconde
    setTimeout(() => {
      this.toastService.show('Bienvenue dans Xaalis Menager 🎉', 'success');
    }, 1000);
  }
  ngOnInit() {
    AOS.init({
      duration: 1000,
      easing: 'ease-in-out',
      once: true
    });
  }
  toggleChatbot(): void {
    this.showChatbot = !this.showChatbot;
  }
}
