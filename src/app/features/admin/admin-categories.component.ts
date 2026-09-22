import { CommonModule } from "@angular/common";
import { Component, OnInit, inject, signal } from "@angular/core";
import { RouterLink } from "@angular/router";
import { AdminApiService } from "../../core/admin-api.service";
import { CategoryApi } from "../../core/api.models";

@Component({
  selector: "app-admin-categories",
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: "./admin-categories.component.html",
  styleUrls: ["./admin-page.component.scss"],
})
export class AdminCategoriesComponent implements OnInit {
  readonly api = inject(AdminApiService);
  readonly categories = signal<CategoryApi[]>([]);
  readonly error = signal("");
  readonly deletingId = signal<string | null>(null);
  ngOnInit(): void {
    this.load();
  }
  load(): void {
    this.api
      .categories()
      .subscribe({
        next: (response) => this.categories.set(response.data),
        error: () => (this.error.set("Não foi possível carregar as categorias.")),
      });
  }
  delete(category: CategoryApi): void {
    if (!window.confirm(`Remover ${category.label}?`)) return;
    this.deletingId.set(category.id);
    this.api.deleteCategory(category.id).subscribe({
      next: () => {
        this.deletingId.set(null);
        this.load();
      },
      error: () => {
        this.deletingId.set(null);
        this.error.set("Não foi possível remover a categoria.");
      },
    });
  }
}
