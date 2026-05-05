import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration: number;
}

/**
 * Service for displaying toast notifications
 */
@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private toastCounter = 0;
  toasts = signal<Toast[]>([]);

  /**
   * Show a toast notification
   */
  show(message: string, type: Toast['type'] = 'info', duration: number = 3000): void {
    const toast: Toast = {
      id: this.toastCounter++,
      message,
      type,
      duration,
    };

    this.toasts.update((toasts) => [...toasts, toast]);

    // Auto-remove after duration
    setTimeout(() => {
      this.remove(toast.id);
    }, duration);
  }

  /**
   * Remove a specific toast
   */
  remove(id: number): void {
    this.toasts.update((toasts) => toasts.filter((t) => t.id !== id));
  }

  /**
   * Show success toast
   */
  success(message: string, duration?: number): void {
    this.show(message, 'success', duration);
  }

  /**
   * Show error toast
   */
  error(message: string, duration?: number): void {
    this.show(message, 'error', duration);
  }

  /**
   * Show info toast
   */
  info(message: string, duration?: number): void {
    this.show(message, 'info', duration);
  }

  /**
   * Show warning toast
   */
  warning(message: string, duration?: number): void {
    this.show(message, 'warning', duration);
  }
}
