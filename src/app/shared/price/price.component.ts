import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MoneyPipe } from './money.pipe';

@Component({
  selector: 'app-price',
  standalone: true,
  imports: [CommonModule, MoneyPipe],
  templateUrl: './price.component.html',
  styleUrls: ['./price.component.scss']
})
export class PriceComponent {
  readonly price = input.required<number>();
  readonly oldPrice = input<number | null>(null);
}
