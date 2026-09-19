import { Injectable } from '@angular/core';
import { Signal, signal } from '@angular/core';
import { Product } from './products';

@Injectable({ providedIn: 'root' })
export class UiStateService {
  private readonly _cartOpen = signal(false);
  private readonly _wishlistOpen = signal(false);
  private readonly _modalProduct = signal<Product | null>(null);

  get cartOpen(): Signal<boolean> { return this._cartOpen.asReadonly(); }
  get wishlistOpen(): Signal<boolean> { return this._wishlistOpen.asReadonly(); }
  get modalProduct(): Signal<Product | null> { return this._modalProduct.asReadonly(); }
  get isModalOpen(): boolean { return this._modalProduct() !== null; }

  openCart(): void { this._cartOpen.set(true); }
  closeCart(): void { this._cartOpen.set(false); }
  toggleCart(): void { this._cartOpen.update(v => !v); }

  openWishlist(): void { this._wishlistOpen.set(true); }
  closeWishlist(): void { this._wishlistOpen.set(false); }
  toggleWishlist(): void { this._wishlistOpen.update(v => !v); }

  openModal(product: Product): void {
    this._modalProduct.set(product);
    document.body.style.overflow = 'hidden';
  }

  closeModal(): void {
    this._modalProduct.set(null);
    document.body.style.overflow = '';
  }
}
