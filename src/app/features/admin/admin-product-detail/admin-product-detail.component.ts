import { CommonModule } from "@angular/common";
import { Component, OnInit, inject, signal } from "@angular/core";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { AdminApiService } from "../../../core/admin-api.service";
import { ProductApi } from "../../../core/api.models";
import { ToastService } from "../../../shared/toast/toast.service";
import { ConfirmDialogService } from "../../../shared/confirm-dialog/confirm-dialog.service";

@Component({
  selector: "app-admin-product-detail",
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: "./admin-product-detail.component.html",
  styleUrls: ["./admin-product-detail.component.scss"]
})
export class AdminProductDetailComponent implements OnInit {
  private readonly api = inject(AdminApiService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);
  private readonly confirm = inject(ConfirmDialogService);
  private readonly route = inject(ActivatedRoute);
  readonly product = signal<ProductApi | null>(null);
  readonly loading = signal(false);
  readonly selectedImage = signal(0);
  private id: string | null | undefined;
  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get("id");
    if (this.id) {
      this.load();
    }
  }
  load(): void {
    if (!this.id) return;
    this.loading.set(true);
    this.api.products("").subscribe({
      next: (response: { data: ProductApi[] }) => {
        const found = response.data.find((item) => item.id === this.id) ?? null;
        this.product.set(found);
        this.loading.set(false);
        if (!found) {
          this.toast.error("Produto não encontrado.");
          void this.router.navigateByUrl("/admin/produtos");
        }
      },
      error: () => {
        this.toast.error("Não foi possível carregar o produto.");
        this.loading.set(false);
      },
    });
  }
  images(): string[] {
    const main = this.product()?.img;
    const gallery = this.product()?.gallery || [];
    const items = [main, ...gallery].filter((url): url is string => !!url);
    return items;
  }
  selectImage(index: number): void {
    this.selectedImage.set(index);
  }
  delete(): void {
    if (!this.product() || !this.id) return;
    const productId = this.id;
    this.confirm.ask({
      title: "Remover produto",
      message: `Tens a certeza que queres remover "${this.product()!.name}"? Esta acção não pode ser revertida.`,
      confirmLabel: "Remover",
      danger: true,
    }).then((confirmed: boolean) => {
      if (!confirmed) return;
      this.api.deleteProduct(productId).subscribe({
        next: () => {
          this.toast.success("Produto removido.");
          void this.router.navigateByUrl("/admin/produtos");
        },
        error: () => this.toast.error("Não foi possível remover o produto."),
      });
    });
  }
}