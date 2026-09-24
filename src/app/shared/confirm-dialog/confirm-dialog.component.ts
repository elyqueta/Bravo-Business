import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfirmDialogService } from './confirm-dialog.service';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.scss']
})
export class ConfirmDialogComponent {
  readonly options = this.confirmDialog.options;

  constructor(private readonly confirmDialog: ConfirmDialogService) {}

  onConfirm(): void {
    this.confirmDialog.confirm(true);
  }

  onCancel(): void {
    this.confirmDialog.confirm(false);
  }
}
