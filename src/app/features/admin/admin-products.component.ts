import { CommonModule } from "@angular/common";
import { Component, OnInit, inject, signal } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { RouterLink } from "@angular/router";
import { AdminApiService } from "../../core/admin-api.service";
import { ProductApi } from "../../core/api.models";
import { ConfirmDialogService } from "../../shared/confirm-dialog/confirm-dialog.service";
import { MoneyPipe } from "../../shared/pipes/money.pipe";
import { ToastService } from "../../shared/toast/toast.service";
import { SkeletonRowComponent } from "../../shared/skeleton/skeleton-row.component";

@Component({
  selector: "app-admin-products",
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink, SkeletonRowComponent, MoneyPipe],
  templateUrl: "./admin-products.component.html",
  styleUrls: ["./admin-page.component.scss"],
})
export class AdminProductsComponent implements OnInit {
  readonly api = inject(AdminApiService);
  private readonly confirm = inject(ConfirmDialogService);
  private readonly toast = inject(ToastService);
  readonly products = signal<ProductApi[]>([]);
  private readonly allProducts = signal<ProductApi[]>([]);
  readonly search = signal("");
  readonly loading = signal(false);
  readonly deletingId = signal<string | null>(null);
  readonly deleteState = signal<'idle' | 'removing'>('idle');
  private loadTimeout?: number;
  ngOnInit(): void {
    this.loadAll();
  }
  onSearchChange(value: string): void {
    this.search.set(value);
    clearTimeout(this.loadTimeout);
    this.loadTimeout = window.setTimeout(() => this.filterProducts(), 150);
  }
  loadAll(): void {
    this.loading.set(true);
    this.api.products("").subscribe({
      next: (response) => {
        this.allProducts.set(response.data);
        this.filterProducts();
        this.loading.set(false);
      },
      error: () => {
        this.toast.error("Não foi possível carregar os produtos. Confirma se a API está activa.");
        this.loading.set(false);
      },
    });
  }
  private filterProducts(): void {
    const term = this.search().trim().toLowerCase();
    if (!term) {
      this.products.set(this.allProducts());
      return;
    }
    this.products.set(
      this.allProducts().filter(
        (product) =>
          product.name.toLowerCase().includes(term) ||
          product.id.toLowerCase().includes(term)
      )
    );
  }
  delete(product: ProductApi): void {
    this.confirm.ask({
      title: "Remover produto",
      message: `Tens a certeza que queres remover "${product.name}"? Esta acção não pode ser revertida.`,
      confirmLabel: "Remover",
      danger: true,
    }).then((confirmed) => {
      if (!confirmed) return;
      this.deleteState.set('removing');
      this.deletingId.set(product.id);
      this.api.deleteProduct(product.id).subscribe({
        next: () => {
          this.deleteState.set('idle');
          this.deletingId.set(null);
          this.loadAll();
        },
        error: () => {
          this.deleteState.set('idle');
          this.deletingId.set(null);
          this.toast.error("Não foi possível remover o produto.");
        },
      });
    });
  }
}
