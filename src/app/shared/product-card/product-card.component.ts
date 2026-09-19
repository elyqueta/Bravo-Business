import { CommonModule } from "@angular/common";
import { Component, EventEmitter, inject, Input, Output } from "@angular/core";
import { Router, RouterLink } from "@angular/router";
import { Product, StoreService } from "../../core/store.service";

@Component({
  selector: "app-product-card",
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: "./product-card.component.html",
})
export class ProductCardComponent {
  @Input({ required: true }) product!: Product;
  @Output() added = new EventEmitter<void>();
  readonly store = inject(StoreService);
  private readonly router = inject(Router);
  badgeClass(badge?: string): string {
    return badge === "Sale" ? "sale" : badge === "Premium" ? "premium" : "";
  }
  add(): void {
    this.store.addCart(this.product);
    this.added.emit();
  }
  openDetails(): void {
    void this.router.navigate(["/loja/produto", this.product.id]);
  }
}
