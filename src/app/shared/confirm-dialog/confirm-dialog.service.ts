import { Injectable } from '@angular/core';
import { signal } from '@angular/core';

export interface ConfirmDialogOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
}

@Injectable({ providedIn: 'root' })
export class ConfirmDialogService {
  private resolve?: (value: boolean) => void;
  readonly options = signal<ConfirmDialogOptions | null>(null);

  ask(options: ConfirmDialogOptions): Promise<boolean> {
    return new Promise<boolean>(resolve => {
      this.resolve = resolve;
      this.options.set(options);
    });
  }

  confirm(value: boolean): void {
    if (this.resolve) {
      this.resolve(value);
      this.resolve = undefined;
    }
    this.options.set(null);
  }
}
