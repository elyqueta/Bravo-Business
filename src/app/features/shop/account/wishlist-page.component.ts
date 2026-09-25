import { CommonModule } from "@angular/common";
import { Component, inject } from "@angular/core";
import { RouterLink } from "@angular/router";
import { ProductCardComponent } from "../../../shared/product-card/product-card.component";
import { StoreService } from "../../../core/store.service";

@Component({
  selector: "app-wishlist-page",
  standalone: true,
  imports: [CommonModule, RouterLink, ProductCardComponent],
  templateUrl: "./wishlist-page.component.html",
  styleUrls: ["./wishlist-page.component.scss"],
})
export class WishlistPageComponent {
  readonly store = inject(StoreService);
  products() {
    return this.store
      .wishlist()
      .map((id) => this.store.products.find((product) => product.id === id))
      .filter((product) => !!product);
  }
}
