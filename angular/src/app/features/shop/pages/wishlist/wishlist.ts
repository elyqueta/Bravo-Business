import { Component, inject } from '@angular/core';
import { WishlistService } from '@core/services/wishlist';

@Component({
  selector: 'app-wishlist',
  standalone: false,
  templateUrl: './wishlist.html',
  styleUrl: './wishlist.css'
})
export class Wishlist {
  wishlist = inject(WishlistService);

  get items() { return this.wishlist.items; }
  get count() { return this.wishlist.count; }

  remove(id: string) {
    this.wishlist.toggle({ id, name: '', price: 0, image: '' });
  }

  checkoutWhatsApp() {
    if (this.items.length === 0) return;
    let msg = 'Olá! Gostaria de pedir informações sobre os meus favoritos:\n\n';
    this.items.forEach(item => {
      msg += `▪ ${item.name} - ${item.price.toLocaleString('pt-AO')} Kz\n`;
    });
    window.open(`https://wa.me/244957103656?text=${encodeURIComponent(msg)}`, '_blank');
  }
}
