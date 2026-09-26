import { Component, ContentChild, ElementRef, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

export type FieldState = 'default' | 'error' | 'success';

@Component({
  selector: 'app-form-field',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './form-field.component.html',
  styleUrls: ['./form-field.component.scss'],
})
export class FormFieldComponent {
  readonly caption = input<string>('');
  readonly state = input<FieldState>('default');
  readonly helpText = input<string>('');
  readonly errorText = input<string>('');
  readonly maxLength = input<number | null>(null);
  readonly currentLength = input<number>(0);
  readonly disabled = input(false);
  readonly showClear = input(false);
  readonly clear = input<() => void>(() => {});

  private static instanceCounter = 0;
  readonly instanceId = `form-field-${++FormFieldComponent.instanceCounter}-${Math.random().toString(36).slice(2, 8)}`;
}
