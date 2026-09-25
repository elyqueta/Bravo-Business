import { CommonModule } from "@angular/common";
import { Component, OnInit, inject, signal } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { AdminApiService } from "../../core/admin-api.service";
import { CategoryApi, ProductApi } from "../../core/api.models";
import { ToastService } from "../../shared/toast/toast.service";
import { SkeletonCardComponent } from "../../shared/skeleton/skeleton-card.component";

@Component({
  selector: "app-admin-page",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SkeletonCardComponent,
  ],
  templateUrl: "./admin-page.component.html",
  styleUrls: ["./admin-page.component.scss"],
})
export class AdminPageComponent implements OnInit {
  private readonly toast = inject(ToastService);
  readonly api = inject(AdminApiService);
  readonly products = signal<ProductApi[]>([]);
  readonly categories = signal<CategoryApi[]>([]);
  readonly productsLoading = signal(false);
  readonly categoriesLoading = signal(false);
  readonly productsError = signal<string | null>(null);
  readonly categoriesError = signal<string | null>(null);
  readonly hasLoadedOnce = signal(false);
  ngOnInit(): void {
    this.loadAll();
  }
  loadAll(): void {
    this.productsError.set(null);
    this.categoriesError.set(null);
    this.productsLoading.set(true);
    this.categoriesLoading.set(true);
    this.api.products("").subscribe({
      next: (response) => {
        this.products.set(response.data);
        this.productsLoading.set(false);
        this.hasLoadedOnce.set(true);
      },
      error: () => {
        this.productsLoading.set(false);
        this.hasLoadedOnce.set(true);
        this.productsError.set("Não foi possível carregar os produtos. Confirma se a API está activa.");
        this.toast.error("Não foi possível carregar os produtos. Confirma se a API está activa.");
      },
    });
    this.api.categories().subscribe({
      next: (response) => {
        this.categories.set(response.data);
        this.categoriesLoading.set(false);
        this.hasLoadedOnce.set(true);
      },
      error: () => {
        this.categoriesLoading.set(false);
        this.hasLoadedOnce.set(true);
        this.categoriesError.set("Não foi possível carregar as categorias.");
        this.toast.error("Não foi possível carregar as categorias.");
      },
    });
  }
}
