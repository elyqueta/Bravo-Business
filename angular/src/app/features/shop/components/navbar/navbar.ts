import { Component, inject } from '@angular/core';
import { GlobalService } from '@core/services/global';

@Component({
  selector: 'app-navbar',
  standalone: false,
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar {
  global = inject(GlobalService);
  mobileOpen = false;

  toggleTheme() { this.global.toggleTheme(); }
  toggleMobile() { this.mobileOpen = !this.mobileOpen; }
  closeMobile() { this.mobileOpen = false; }
  openCart() { /* handled by cart drawer component */ }
  openWishlist() { /* handled by wishlist drawer component */ }
  cartCount(): number { return this.global.cart.reduce((s, x) => s + x.qty, 0); }
}
