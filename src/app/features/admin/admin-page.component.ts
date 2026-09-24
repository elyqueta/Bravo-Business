import { CommonModule } from "@angular/common";
import { Component, OnInit, inject, signal } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { AdminApiService } from "../../core/admin-api.service";
import { CategoryApi, ProductApi } from "../../core/api.models";
import { ToastService } from "../../shared/toast/toast.service";

@Component({
  selector: "app-admin-page",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
  ],
  templateUrl: "./admin-page.component.html",
  styleUrls: ["./admin-page.component.scss"],
})
export class AdminPageComponent implements OnInit {
  private readonly toast = inject(ToastService);
  readonly api = inject(AdminApiService);
  readonly products = signal<ProductApi[]>([]);
  readonly categories = signal<CategoryApi[]>([]);
  readonly loading = signal(false);
  ngOnInit(): void {
    this.loadAll();
  }
  loadAll(): void {
    this.loading.set(true);
    this.api.products("").subscribe({
      next: (response) => {
        this.products.set(response.data);
        this.loading.set(false);
      },
      error: () => {
        this.toast.error("Não foi possível carregar os produtos. Confirma se a API está activa.");
        this.loading.set(false);
      },
    });
    this.api.categories().subscribe({
      next: (response) => this.categories.set(response.data),
      error: () => this.toast.error("Não foi possível carregar as categorias."),
    });
  }
}
