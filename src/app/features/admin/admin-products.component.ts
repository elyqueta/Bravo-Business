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
  readonly search = signal("");
  readonly loading = signal(false);
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
        this.toast.error("Não foi possível carregar os produtos. Confirma se a API está activa.");
        this.loading.set(false);
      },
    });
  }
  delete(product: ProductApi): void {
    this.confirm.ask({
      title: "Remover produto",
      message: `Tens a certeza que queres remover "${product.name}"? Esta acção não pode ser revertida.`,
      confirmLabel: "Remover",
      danger: true,
    }).then((confirmed) => {
      if (!confirmed) return;
      this.deletingId.set(product.id);
      this.api.deleteProduct(product.id).subscribe({
        next: () => {
          this.deletingId.set(null);
          this.load();
        },
        error: () => {
          this.deletingId.set(null);
          this.toast.error("Não foi possível remover o produto.");
        },
      });
    });
  }
}
