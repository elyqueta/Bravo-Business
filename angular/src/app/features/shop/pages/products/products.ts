import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { ProductsService, Product } from '@core/services/products';
import { CategoryNav } from '../../components/category-nav/category-nav';
import { ProductCard } from '../../components/product-card/product-card';
import { UiStateService } from '@core/services/ui-state';

@Component({
  selector: 'app-products',
  standalone: false,
  templateUrl: './products.html',
  styleUrl: './products.css'
})
export class Products {
  productsService = inject(ProductsService);
  ui = inject(UiStateService);
  route = inject(ActivatedRoute);
  products = signal<Product[]>([]);
  filtered = signal<Product[]>([]);
  loading = signal(true);
  selectedCat = signal('all');

  constructor() {
    this.productsService.getAll().subscribe(p => {
      this.products.set(p);
      this.loading.set(false);
    });

    this.route.paramMap.subscribe(params => {
      const cat = params.get('category');
      if (cat) {
        this.selectedCat.set(cat);
        this.productsService.getByCategory(cat).subscribe(list => {
          this.filtered.set(list);
        });
      } else {
        this.selectedCat.set('all');
        this.filtered.set(this.products());
      }
    });
  }

  onCategory(cat: string) {
    this.selectedCat.set(cat);
    if (cat === 'all') {
      this.filtered.set(this.products());
    } else {
      this.filtered.set(this.products().filter(p => p.category === cat));
    }
  }

  openProduct(product: Product) {
    this.ui.openModal(product);
  }
}
