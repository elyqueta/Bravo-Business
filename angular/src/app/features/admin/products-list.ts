import { Component } from '@angular/core';

@Component({
  selector: 'app-products-list',
  standalone: false,
  template: `
    <div class="admin-placeholder">
      <i class="fa-solid fa-box"></i>
      <h2>Gestão de Produtos</h2>
      <p>Em desenvolvimento...</p>
    </div>
  `,
  styles: [`
    .admin-placeholder {
    }
  `]
})
export class ProductsList {}
