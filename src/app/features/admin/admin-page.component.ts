import { CommonModule } from "@angular/common";
import { Component, OnInit, inject } from "@angular/core";
import {
  FormBuilder,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { AdminApiService } from "../../core/admin-api.service";
import { RouterLink, RouterLinkActive } from "@angular/router";
import { AuthService } from "../../core/auth.service";
import {
  CategoryApi,
  CreateProductInput,
  ProductApi,
  ProductBadge,
} from "../../core/api.models";

@Component({
  selector: "app-admin-page",
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterLink,
    RouterLinkActive,
  ],
  templateUrl: "./admin-page.component.html",
  styleUrls: ["./admin-page.component.scss"],
})
export class AdminPageComponent implements OnInit {
  readonly api = inject(AdminApiService);
  readonly auth = inject(AuthService);
  private readonly formBuilder = inject(FormBuilder);
  products: ProductApi[] = [];
  categories: CategoryApi[] = [];
  activeTab: "overview" | "products" | "categories" = "overview";
  search = "";
  loading = false;
  error = "";
  success = "";
  editingId: string | null = null;
  readonly productForm = this.formBuilder.nonNullable.group({
    categorySlug: ["roupas", Validators.required],
    name: ["", [Validators.required, Validators.maxLength(200)]],
    description: [""],
    price: [0, [Validators.required, Validators.min(0)]],
    oldPrice: [0],
    img: ["", Validators.required],
    badge: ["" as ProductBadge | ""],
    gallery: [""],
  });
  readonly categoryForm = this.formBuilder.nonNullable.group({
    label: ["", [Validators.required, Validators.maxLength(100)]],
    icon: ["fa-box"],
    prefix: ["", [Validators.required, Validators.maxLength(1)]],
    anchor: ["", [Validators.required, Validators.maxLength(50)]],
  });
  ngOnInit(): void {
    this.loadAll();
  }
  loadAll(): void {
    this.loading = true;
    this.error = "";
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
    this.api.categories().subscribe({
      next: (response) => (this.categories = response.data),
      error: () => (this.error = "Não foi possível carregar as categorias."),
    });
  }
  filterProducts(): void {
    this.api.products(this.search).subscribe({
      next: (response) => (this.products = response.data),
      error: () => (this.error = "Não foi possível pesquisar produtos."),
    });
  }
  startEdit(product: ProductApi): void {
    this.editingId = product.id;
    this.productForm.patchValue({
      categorySlug: product.categorySlug,
      name: product.name,
      description: product.description || "",
      price: product.price,
      oldPrice: product.oldPrice || 0,
      img: product.img,
      badge: product.badge || "",
      gallery: (product.gallery || []).join("\n"),
    });
    this.activeTab = "products";
  }
  cancelEdit(): void {
    this.editingId = null;
    this.productForm.reset({
      categorySlug: "roupas",
      name: "",
      description: "",
      price: 0,
      oldPrice: 0,
      img: "",
      badge: "",
      gallery: "",
    });
  }
  saveProduct(): void {
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      return;
    }
    const value = this.productForm.getRawValue();
    const input: CreateProductInput = {
      ...value,
      badge: value.badge || null,
      oldPrice: value.oldPrice || null,
      gallery: value.gallery
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean),
    };
    this.loading = true;
    const request = this.editingId
      ? this.api.updateProduct(this.editingId, input)
      : this.api.createProduct(input);
    request.subscribe({
      next: () => {
        this.success = this.editingId
          ? "Produto actualizado."
          : "Produto criado.";
        this.cancelEdit();
        this.loadAll();
      },
      error: () => {
        this.error = "Não foi possível guardar o produto.";
        this.loading = false;
      },
    });
  }
  deleteProduct(product: ProductApi): void {
    if (!window.confirm(`Remover ${product.name}?`)) return;
    this.api.deleteProduct(product.id).subscribe({
      next: () => {
        this.success = "Produto removido.";
        this.loadAll();
      },
      error: () => (this.error = "Não foi possível remover o produto."),
    });
  }
  saveCategory(): void {
    if (this.categoryForm.invalid) {
      this.categoryForm.markAllAsTouched();
      return;
    }
    this.api.createCategory(this.categoryForm.getRawValue()).subscribe({
      next: () => {
        this.success = "Categoria criada.";
        this.categoryForm.reset({
          label: "",
          icon: "fa-box",
          prefix: "",
          anchor: "",
        });
        this.loadAll();
      },
      error: () => (this.error = "Não foi possível criar a categoria."),
    });
  }
  deleteCategory(category: CategoryApi): void {
    if (!window.confirm(`Remover ${category.label}?`)) return;
    this.api.deleteCategory(category.id).subscribe({
      next: () => {
        this.success = "Categoria removida.";
        this.loadAll();
      },
      error: () => (this.error = "Não foi possível remover a categoria."),
    });
  }
  logout(): void {
    this.auth.logout();
  }
}
