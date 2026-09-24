import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-product-badge',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-badge.component.html',
  styleUrls: ['./product-badge.component.scss']
})
export class ProductBadgeComponent {
  readonly badge = input.required<string>();
}
