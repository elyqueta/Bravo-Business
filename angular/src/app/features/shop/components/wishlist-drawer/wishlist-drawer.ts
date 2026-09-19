import { Component, inject } from '@angular/core';
import { GlobalService } from '@core/services/global';

@Component({
  selector: 'app-wishlist-drawer',
  standalone: false,
  templateUrl: './wishlist-drawer.html',
  styleUrl: './wishlist-drawer.css'
})
export class WishlistDrawer {
  global = inject(GlobalService);

  get isOpen(): boolean { return this.global.wishlist.length > 0; }
  
  get product() {
    if (!this.global.currentModalId) return null;
    return this.global.getProduct(this.global.currentModalId);
  }

  close() { /* handled by overlay click */ }

  toggleWish(id: string): void {
    this.global.toggleWish(id);
  }

  addToCart(id: string): void {
    this.global.addCart(id);
  }

  checkoutWhatsApp(): void {
    if (!this.global.wishlist.length) return;
    const lines = this.global.wishlist.map(id => {
      const p = this.global.getProduct(id);
      return p ? `• ${p.name} (${p.id}) — ${this.global.fmt(p.price)}` : '';
    }).join('\n');
    const msg = `*Olá, Bravo Business!*\n\nTenho interesse nestes produtos:\n\n${lines}\n\nPodem confirmar disponibilidade? Obrigado!`;
    window.open(`https://wa.me/244957103656?text=${encodeURIComponent(msg)}`, '_blank');
  }
}
