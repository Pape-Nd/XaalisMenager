
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-toast',
  template: `
    <div class="toast-container position-fixed 	top-0 start-50  translate-middle-x p-3" >
      <div
        *ngFor="let toast of toasts"
        class="toast align-items-center text-white border-0 show mb-2"
        [ngClass]="{
          'bg-success': toast.type === 'success',
          'bg-danger': toast.type === 'danger',
          'bg-info': toast.type === 'info'
        }"
        role="alert"
      >
      <div class="d-flex">
          <div class="toast-body">{{ toast.message }}</div>
          <button
            type="button"
            class="btn-close btn-close-white me-2 m-auto"
            (click)="removeToast(toast)"
          ></button>
        </div>
      </div>
    </div>
  `,
  standalone: true,
  imports: [CommonModule]
})
export class ToastComponent implements OnInit {
  toasts: any[] = [];

  constructor(private toastService: ToastService) { }

  ngOnInit(): void {
    this.toastService.toastMessages$.subscribe(toast => {
      this.toasts.push(toast);
      setTimeout(() => this.removeToast(toast), 3000);
    });
  }

  removeToast(toast: any) {
    this.toasts = this.toasts.filter(t => t !== toast);
  }
}
