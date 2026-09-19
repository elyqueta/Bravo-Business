import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { GlobalService, Product } from '@core/services/global';

@Component({
  selector: 'app-home',
  standalone: false,
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home implements OnInit {
  global = inject(GlobalService);
  private slideIndex = 0;
  private slideInterval: any;

  ngOnInit(): void {
    this.global.currentCat = 'all';
    this.startSlider();
  }

  ngOnDestroy(): void {
    if (this.slideInterval) clearInterval(this.slideInterval);
  }

  startSlider(): void {
    this.slideInterval = setInterval(() => {
      this.slideIndex = (this.slideIndex + 1) % 3;
    }, 10000);
  }

  goSlide(n: number): void {
    this.slideIndex = n;
    if (this.slideInterval) clearInterval(this.slideInterval);
    this.startSlider();
  }

  getProducts(): Product[] {
    return this.global.getProducts();
  }

  getFilteredProducts(): Product[] {
    return this.global.getProductsByCat(this.global.currentCat);
  }

  getCatMeta() {
    return this.global.getCatMeta() as Record<string, {label: string; icon: string; anchor: string}>;
  }

  getCategories() {
    return Object.keys(this.global.getCatMeta());
  }

  selectCat(cat: string): void {
    this.global.currentCat = cat;
  }

  openModal(product: Product): void {
    this.global.openModal(product.id);
  }

  toggleWish(id: string): void {
    this.global.toggleWish(id);
  }

  addToCart(id: string): void {
    this.global.addCart(id);
  }
}
