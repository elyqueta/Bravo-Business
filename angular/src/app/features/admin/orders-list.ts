import { Component } from '@angular/core';

@Component({
  selector: 'app-orders-list',
  standalone: false,
  template: `
    <div class="admin-placeholder">
      <i class="fa-solid fa-receipt"></i>
      <h2>Gestão de Pedidos</h2>
      <p>Em desenvolvimento...</p>
    </div>
  `,
  styles: [`
    .admin-placeholder {
    }
  `]
})
export class OrdersList {}
