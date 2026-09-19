import { CommonModule } from "@angular/common";
import { Component, OnInit, inject } from "@angular/core";
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
  products: ProductApi[] = [];
  search = "";
  loading = false;
  error = "";
  ngOnInit(): void {
    this.load();
  }
  load(): void {
    this.loading = true;
    this.api.products(this.search).subscribe({
      next: (response) => {
        this.products = response.data;
        this.loading = false;
      },
      error: () => {
        this.error =
          "Não foi possível carregar os produtos. Confirma se a API está activa.";
        this.loading = false;
      },
    });
  }
  delete(product: ProductApi): void {
    if (!window.confirm(`Remover ${product.name}?`)) return;
    this.api
      .deleteProduct(product.id)
      .subscribe({
        next: () => this.load(),
        error: () => (this.error = "Não foi possível remover o produto."),
      });
  }
}
