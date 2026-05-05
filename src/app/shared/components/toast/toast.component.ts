import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-toast',
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      @for (toast of toastService.toasts(); track toast.id) {
      <div class="toast" [class]="'toast-' + toast.type">
        <div class="toast-icon">
          @if (toast.type === 'success') {
          <i class="fas fa-check-circle"></i>
          } @else if (toast.type === 'error') {
          <i class="fas fa-exclamation-circle"></i>
          } @else if (toast.type === 'warning') {
          <i class="fas fa-exclamation-triangle"></i>
          } @else {
          <i class="fas fa-info-circle"></i>
          }
        </div>
        <div class="toast-message">{{ toast.message }}</div>
        <button class="toast-close" (click)="toastService.remove(toast.id)">
          <i class="fas fa-times"></i>
        </button>
      </div>
      }
    </div>
  `,
  styles: [
    `
      .toast-container {
        position: fixed;
        top: 5rem;
        right: 2rem;
        z-index: 9999;
        display: flex;
        flex-direction: column;
        gap: 1rem;
        max-width: 400px;
        direction: rtl;
      }

      .toast {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 1rem 1.25rem;
        border-radius: 12px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        animation: slideIn 0.3s ease;
        background: white;
        direction: rtl;
        text-align: right;
      }

      @keyframes slideIn {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }

      .toast-icon {
        font-size: 1.5rem;
        flex-shrink: 0;
      }

      .toast-message {
        flex: 1;
        font-size: 0.9rem;
        line-height: 1.5;
      }

      .toast-close {
        background: none;
        border: none;
        font-size: 1rem;
        cursor: pointer;
        color: inherit;
        opacity: 0.6;
        padding: 0;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 4px;
        transition: all 0.2s ease;
        flex-shrink: 0;
      }

      .toast-close:hover {
        opacity: 1;
        background: rgba(0, 0, 0, 0.1);
      }

      .toast-success {
        background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
        border-right: 4px solid var(--color-success);
        color: var(--color-success);
        box-shadow: 0 4px 12px var(--color-white-dark);
      }

      .toast-success .toast-icon {
        color: var(--color-success);
      }

      .toast-error {
        background: linear-gradient(135deg, var(--color--error-light) 90%, var(--color--error-light) 10%);
        border-right: 4px solid var(--color-error);
        color: var(--color-error);
        box-shadow: 0 4px 12px var(--color-white-dark);
      }

      .toast-error .toast-icon {
        color: var(--color-error);
      }

      .toast-warning {
        background: linear-gradient(135deg, var(--color-warning-light) 100%, var(--color-warning) 100%);
        border-right: 4px solid var(--color-warning);
        color: var(--color-warning);
        box-shadow: 0 4px 12px var(--color-white-dark);
      }

      .toast-warning .toast-icon {
        color: var(--color-warning);
      }

      .toast-info {
        background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
        border-right: 4px solid var(--color-info);
        color: var(--color-info-dark);
        box-shadow: 0 4px 12px var(--color-white-dark);
      }

      .toast-info .toast-icon {
        color: var(--color-info);
      }

      @media (max-width: 768px) {
        .toast-container {
          top: 1rem;
          right: 1rem;
          left: 1rem;
          max-width: none;
        }
      }
    `,
  ],
})
export class ToastComponent {
  constructor(protected toastService: ToastService) {}
}
