import { CommonModule } from "@angular/common";
import { Component, OnInit, inject, signal } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { RouterLink } from "@angular/router";
import { AdminApiService } from "../../core/admin-api.service";
import { ProductApi } from "../../core/api.models";

@Component({
  selector: "app-admin-products",
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink],
  templateUrl: "./admin-products.component.html",
  styleUrls: ["./admin-page.component.scss"],
})
export class AdminProductsComponent implements OnInit {
  readonly api = inject(AdminApiService);
  readonly products = signal<ProductApi[]>([]);
  readonly search = signal("");
  readonly loading = signal(false);
  readonly error = signal("");
  readonly deletingId = signal<string | null>(null);
  private loadTimeout?: number;
  ngOnInit(): void {
    this.load();
  }
  onSearchChange(value: string): void {
    this.search.set(value);
    clearTimeout(this.loadTimeout);
    this.loadTimeout = window.setTimeout(() => this.load(), 350);
  }
  load(): void {
    this.loading.set(true);
    this.api.products(this.search()).subscribe({
      next: (response) => {
        this.products.set(response.data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set(
          "Não foi possível carregar os produtos. Confirma se a API está activa."
        );
        this.loading.set(false);
      },
    });
  }
  delete(product: ProductApi): void {
    if (!window.confirm(`Remover ${product.name}?`)) return;
    this.deletingId.set(product.id);
    this.api.deleteProduct(product.id).subscribe({
      next: () => {
        this.deletingId.set(null);
        this.load();
      },
      error: () => {
        this.deletingId.set(null);
        this.error.set("Não foi possível remover o produto.");
      },
    });
  }
}
