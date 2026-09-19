import { Component, inject } from '@angular/core';
import { CartService } from '@core/services/cart';

@Component({
  selector: 'app-cart',
  standalone: false,
  templateUrl: './cart.html',
  styleUrl: './cart.css'
})
export class Cart {
  cart = inject(CartService);

  get items() { return this.cart.items; }
  get total() { return this.cart.total; }
  get count() { return this.cart.count; }

  removeItem(id: string, size?: string, color?: string) {
    this.cart.removeItem(id, size, color);
  }

  updateQty(id: string, delta: number, size?: string, color?: string) {
    const item = this.items.find(i => i.id === id);
    if (item) {
      this.cart.updateQuantity(id, item.quantity + delta, size, color);
    }
  }

  checkoutWhatsApp() {
    if (this.items.length === 0) return;
    let msg = 'Olá! Gostaria de finalizar o meu pedido:\n\n';
    this.items.forEach(item => {
      msg += `▪ ${item.name} (x${item.quantity}) - ${(item.price * item.quantity).toLocaleString('pt-AO')} Kz\n`;
    });
    msg += `\n*Total: ${this.total.toLocaleString('pt-AO')} Kz*`;
    window.open(`https://wa.me/244957103656?text=${encodeURIComponent(msg)}`, '_blank');
  }
}
