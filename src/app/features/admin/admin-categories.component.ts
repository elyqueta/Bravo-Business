import { CommonModule } from "@angular/common";
import { Component, OnInit, inject } from "@angular/core";
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
  categories: CategoryApi[] = [];
  error = "";
  ngOnInit(): void {
    this.load();
  }
  load(): void {
    this.api
      .categories()
      .subscribe({
        next: (response) => (this.categories = response.data),
        error: () => (this.error = "Não foi possível carregar as categorias."),
      });
  }
  delete(category: CategoryApi): void {
    if (!window.confirm(`Remover ${category.label}?`)) return;
    this.api
      .deleteCategory(category.id)
      .subscribe({
        next: () => this.load(),
        error: () => (this.error = "Não foi possível remover a categoria."),
      });
  }
}
