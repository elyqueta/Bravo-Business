import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Component, OnInit, inject } from "@angular/core";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { Product, Category, StoreService } from "../../../core/store.service";
import { ProductCardComponent } from "../../../shared/product-card/product-card.component";

@Component({
  selector: "app-catalog-page",
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, ProductCardComponent],
  templateUrl: "./catalog-page.component.html",
  styleUrls: ["./catalog-page.component.scss"],
})
export class CatalogPageComponent implements OnInit {
  readonly store = inject(StoreService);
  readonly route = inject(ActivatedRoute);
  readonly categories: Category[] = ["roupas", "tenis", "acessorios"];
  products: Product[] = [];
  category?: Category;
  search = "";
  maxPrice = 100000;
  sort = "featured";
  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const value = params.get("category") as Category | null;
      this.category =
        value && value in this.store.categoryMeta ? value : undefined;
      this.apply();
    });
  }
  apply(): void {
    let result = [...this.store.productsFor(this.category)];
    const query = this.search.trim().toLowerCase();
    if (query)
      result = result.filter((product) =>
        `${product.name} ${product.id}`.toLowerCase().includes(query),
      );
    result = result.filter((product) => product.price <= this.maxPrice);
    if (this.sort === "price-low") result.sort((a, b) => a.price - b.price);
    if (this.sort === "price-high") result.sort((a, b) => b.price - a.price);
    this.products = result;
  }
  clear(): void {
    this.search = "";
    this.maxPrice = 100000;
    this.sort = "featured";
    this.apply();
  }
  title(): string {
    return this.category
      ? this.store.categoryLabel(this.category)
      : "Todos os produtos";
  }
}
