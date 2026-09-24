import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, ToastMessage } from './toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast-container.component.html',
  styleUrls: ['./toast-container.component.scss']
})
export class ToastContainerComponent {
  readonly toasts = this.toastService.toasts;

  constructor(private readonly toastService: ToastService) {}

  trackById(_index: number, toast: ToastMessage): number {
    return toast.id;
  }

  iconFor(type: ToastMessage['type']): string {
    switch (type) {
      case 'success':
        return 'fa-solid fa-circle-check';
      case 'error':
        return 'fa-solid fa-circle-exclamation';
      default:
        return 'fa-solid fa-circle-info';
    }
  }

  dismiss(toast: ToastMessage): void {
    this.toastService.dismiss(toast.id);
  }
}
