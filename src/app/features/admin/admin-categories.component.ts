import { CommonModule } from "@angular/common";
import { Component, OnInit, inject, signal } from "@angular/core";
import { RouterLink } from "@angular/router";
import { AdminApiService } from "../../core/admin-api.service";
import { CategoryApi } from "../../core/api.models";
import { ConfirmDialogService } from "../../shared/confirm-dialog/confirm-dialog.service";
import { ToastService } from "../../shared/toast/toast.service";
import { SkeletonCardComponent } from "../../shared/skeleton/skeleton-card.component";

@Component({
  selector: "app-admin-categories",
  standalone: true,
  imports: [CommonModule, RouterLink, SkeletonCardComponent],
  templateUrl: "./admin-categories.component.html",
  styleUrls: ["./admin-page.component.scss"],
})
export class AdminCategoriesComponent implements OnInit {
  readonly api = inject(AdminApiService);
  private readonly confirm = inject(ConfirmDialogService);
  private readonly toast = inject(ToastService);
  readonly categories = signal<CategoryApi[]>([]);
  readonly loading = signal(false);
  readonly deletingId = signal<string | null>(null);
  ngOnInit(): void {
    this.load();
  }
  load(): void {
    this.loading.set(true);
    this.api
      .categories()
      .subscribe({
        next: (response) => {
          this.categories.set(response.data);
          this.loading.set(false);
        },
        error: () => {
          this.toast.error("Não foi possível carregar as categorias.");
          this.loading.set(false);
        },
      });
  }
  delete(category: CategoryApi): void {
    this.confirm.ask({
      title: "Remover categoria",
      message: `Tens a certeza que queres remover "${category.label}"? Esta acção não pode ser revertida.`,
      confirmLabel: "Remover",
      danger: true,
    }).then((confirmed) => {
      if (!confirmed) return;
      this.deletingId.set(category.id);
      this.api.deleteCategory(category.id).subscribe({
        next: () => {
          this.deletingId.set(null);
          this.load();
        },
        error: () => {
          this.deletingId.set(null);
          this.toast.error("Não foi possível remover a categoria.");
        },
      });
    });
  }
}
