import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { WishlistService } from '@core/services/wishlist';
import { CartService } from '@core/services/cart';
import { Product } from '@core/services/products';

@Component({
  selector: 'app-product-card',
  standalone: false,
  templateUrl: './product-card.html',
  styleUrl: './product-card.css'
})
export class ProductCard {
  @Input({ required: true }) product!: Product;
  @Output() onSelect = new EventEmitter<Product>();
  @Output() onCart = new EventEmitter<Product>();

  wishlist = inject(WishlistService);
  cart = inject(CartService);

  isWishlisted(id: string): boolean {
    return this.wishlist.isInWishlist(id);
  }

  toggleWishlist(product: Product, event: Event) {
    event.stopPropagation();
    this.wishlist.toggle({
      id: product.id,
      name: product.name,
      price: product.price,
      oldPrice: product.oldPrice,
      image: product.images[0],
      badge: product.badge
    });
  }

  addToCart(product: Product, event: Event) {
    event.stopPropagation();
    this.cart.addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      oldPrice: product.oldPrice,
      image: product.images[0]
    });
  }
}
