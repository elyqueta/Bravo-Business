import { Component, inject } from '@angular/core';
import { GlobalService } from '@core/services/global';

@Component({
  selector: 'app-cart-drawer',
  standalone: false,
  templateUrl: './cart-drawer.html',
  styleUrl: './cart-drawer.css'
})
export class CartDrawer {
  global = inject(GlobalService);

  get items() { return this.global.cart; }
  get total(): number { return this.global.cart.reduce((s, x) => s + x.price * x.qty, 0); }
  get isOpen(): boolean { return this.global.cart.length > 0; }

  close() { /* overlay click closes via template */ }

  chQty(id: string, d: number): void {
    this.global.chQty(id, d);
  }

  rmCart(id: string): void {
    this.global.rmCart(id);
  }

  checkoutWhatsApp(): void {
    if (!this.global.cart.length) return;
    const lines = this.global.cart.map(i => `• ${i.name} (${i.id}) x${i.qty} = ${this.global.fmt(i.price * i.qty)}`).join('\n');
    const total = this.global.cart.reduce((s, x) => s + x.price * x.qty, 0);
    const msg = `*Olá, Bravo Business!*\n\nGostaria de encomendar:\n\n${lines}\n\n*Total: ${this.global.fmt(total)}*\n\nAguardo confirmação. Obrigado! 😊`;
    window.open(`https://wa.me/244957103656?text=${encodeURIComponent(msg)}`, '_blank');
  }
}
