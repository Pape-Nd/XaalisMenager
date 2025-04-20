import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export type ToastType = 'success' | 'danger' | 'info';

@Injectable({ providedIn: 'root' })
export class ToastService {
  private toastSubject = new Subject<{ message: string; type: ToastType }>();
  toastMessages$ = this.toastSubject.asObservable();

  show(message: string, type: ToastType = 'info') {
    this.toastSubject.next({ message, type });
  }
}
