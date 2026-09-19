import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProductsService, Product } from '@core/services/products';
import { CartService } from '@core/services/cart';
import { UiStateService } from '@core/services/ui-state';

@Component({
  selector: 'app-product-detail',
  standalone: false,
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.css'
})
export class ProductDetail {
  route = inject(ActivatedRoute);
  products = inject(ProductsService);
  cart = inject(CartService);
  ui = inject(UiStateService);
  product = signal<Product | null>(null);
  related = signal<Product[]>([]);
  loading = signal(true);

  constructor() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.products.getById(id).subscribe(p => {
          this.product.set(p ?? null);
          if (p) {
            this.products.getByCategory(p.category).subscribe(related => {
              this.related.set(related.filter(r => r.id !== p.id).slice(0, 4));
            });
          }
          this.loading.set(false);
        });
      }
    });
  }

  get current() { return this.product(); }

  addToCart() {
    if (!this.current) return;
    this.cart.addItem({
      id: this.current.id,
      name: this.current.name,
      price: this.current.price,
      oldPrice: this.current.oldPrice,
      image: this.current.images[0]
    });
  }

  openProduct(product: Product) {
    this.ui.openModal(product);
  }
}
