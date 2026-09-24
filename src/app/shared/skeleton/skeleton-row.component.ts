import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-skeleton-row',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './skeleton-row.component.html',
  styleUrls: ['./skeleton-row.component.scss']
})
export class SkeletonRowComponent {
  readonly count = input(5);

  get items(): unknown[] {
    return Array.from({ length: this.count() });
  }
}
