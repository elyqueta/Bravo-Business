import { CommonModule } from "@angular/common";
import { Component, OnInit, inject, signal } from "@angular/core";
import {
  FormBuilder,
  FormControl,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { AdminApiService } from "../../core/admin-api.service";
import { CategoryApi, ProductApi, ProductBadge } from "../../core/api.models";
import { MoneyService } from "../../core/money.service";
import { ToastService } from "../../shared/toast/toast.service";

@Component({
  selector: "app-admin-product-form",
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: "./admin-product-form.component.html",
  styleUrls: ["./admin-page.component.scss"],
})
export class AdminProductFormComponent implements OnInit {
  private readonly api = inject(AdminApiService);
  private readonly money = inject(MoneyService);
  private readonly toast = inject(ToastService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly categories = signal<CategoryApi[]>([]);
  readonly product = signal<ProductApi | null>(null);
  readonly loading = signal(false);
  readonly imagePreview = signal("");
  readonly galleryPreviews = signal<string[]>([]);
  readonly existingGallery = signal<string[]>([]);
  readonly features = signal<string[]>([]);
  featureCtrl = new FormControl("");
  editingId: string | null = null;
  imageFile: File | null = null;
  galleryFiles: File[] = [];
  private objectUrls: string[] = [];
  private initialState: {
    categorySlug: string;
    name: string;
    description: string;
    price: string;
    oldPrice: string;
    badge: string;
    gallery: string;
    features: string[];
    imageFile: boolean;
    galleryFiles: boolean;
  } | null = null;
  readonly form = this.formBuilder.nonNullable.group({
    categorySlug: ["", Validators.required],
    name: ["", [Validators.required, Validators.maxLength(200)]],
    description: [""],
    price: ["", Validators.required],
    oldPrice: [""],
    badge: ["" as ProductBadge | ""],
    gallery: [""],
  });
  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get("id");
    if (id) {
      this.editingId = id;
    }
    this.api.categories().subscribe({
      next: (response) => {
        this.categories.set(response.data);
        if (!this.editingId) {
          this.form.patchValue({
            categorySlug: this.categories()[0]?.slug || "",
          });
        }
      },
      error: () => this.toast.error("Não foi possível carregar categorias."),
    });
    if (id) {
      this.loading.set(true);
      this.api.productById(id).subscribe({
        next: (response) => {
          const product = response.data;
          this.product.set(product);
          if (product) {
            const galleryText = (product.gallery || []).join("\n");
            this.form.patchValue({
              categorySlug: product.categorySlug,
              name: product.name,
              description: product.description || "",
              price: this.money.format(product.price),
              oldPrice:
                product.oldPrice !== null && product.oldPrice !== undefined
                  ? this.money.format(product.oldPrice)
                  : "",
              badge: product.badge || "",
              gallery: galleryText,
            });
            this.features.set(product.features || []);
            this.existingGallery.set(product.gallery || []);
            this.initialState = {
              categorySlug: product.categorySlug,
              name: product.name,
              description: product.description || "",
              price: this.money.format(product.price),
              oldPrice:
                product.oldPrice !== null && product.oldPrice !== undefined
                  ? this.money.format(product.oldPrice)
                  : "",
              badge: product.badge || "",
              gallery: galleryText,
              features: product.features ? [...product.features] : [],
              imageFile: false,
              galleryFiles: false,
            };
          }
          this.loading.set(false);
        },
        error: () => {
          this.toast.error("Não foi possível carregar o produto.");
          this.loading.set(false);
        },
      });
    }
  }
  ngOnDestroy(): void {
    this.objectUrls.forEach((url) => URL.revokeObjectURL(url));
  }
  private trackObjectUrl(url: string): void {
    this.objectUrls.push(url);
  }
  addFeature(): void {
    const text = this.featureCtrl.value?.trim();
    if (!text) return;
    if (this.features().includes(text)) {
      this.toast.error("Essa característica já foi adicionada.");
      return;
    }
    this.features.update((items) => [...items, text]);
    this.featureCtrl.setValue("");
  }
  removeFeature(index: number): void {
    this.features.update((items) => items.filter((_, i) => i !== index));
  }
  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] || null;
    if (!file) return;
    if (!file.type.startsWith("image/") || file.size > 5 * 1024 * 1024) {
      this.toast.error("Escolhe uma imagem válida até 5 MB.");
      input.value = "";
      return;
    }
    this.imageFile = file;
    const url = URL.createObjectURL(file);
    this.trackObjectUrl(url);
    this.imagePreview.set(url);
  }
  onGallerySelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files || []);
    const invalid = files.find(
      (file) => !file.type.startsWith("image/") || file.size > 5 * 1024 * 1024,
    );
    if (invalid) {
      this.toast.error(
        "Todas as imagens devem ser válidas e ter no máximo 5 MB.",
      );
      input.value = "";
      return;
    }
    this.galleryFiles = [...this.galleryFiles, ...files];
    const urls = files.map((file) => URL.createObjectURL(file));
    urls.forEach((url) => this.trackObjectUrl(url));
    this.galleryPreviews.update((items) => [...items, ...urls]);
    input.value = "";
  }
  removeGalleryPreview(index: number): void {
    this.galleryPreviews.update((items) => items.filter((_, i) => i !== index));
    this.galleryFiles = this.galleryFiles.filter((_, i) => i !== index);
  }
  removeExistingGallery(index: number): void {
    this.existingGallery.update((items) => items.filter((_, i) => i !== index));
  }
  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    if (this.editingId && !this.hasChanges()) {
      this.toast.info("Não foram detectadas alterações para guardar.");
      return;
    }
    if (!this.editingId && !this.imageFile) {
      this.toast.error("Selecciona uma imagem principal para o produto.");
      return;
    }
    const value = this.form.getRawValue();
    const price = this.money.parse(value.price);
    const oldPrice = this.money.parse(value.oldPrice);
    if (price === null) {
      this.toast.error("Introduz um preço válido.");
      return;
    }
    const payload = new FormData();
    payload.append("categorySlug", value.categorySlug);
    payload.append("name", value.name);
    payload.append("description", value.description);
    payload.append("price", String(price));
    if (oldPrice !== null) {
      payload.append("oldPrice", String(oldPrice));
    }
    if (value.badge) payload.append("badge", value.badge);
    const features = this.features();
    if (features.length) {
      payload.append("features", JSON.stringify(features));
    } else {
      payload.append("features", "[]");
    }
    const gallery = this.existingGallery();
    payload.append("galleryUrls", JSON.stringify(gallery));
    if (this.imageFile)
      payload.append("img", this.imageFile, this.imageFile.name);
    this.galleryFiles.forEach((file) =>
      payload.append("gallery[]", file, file.name),
    );
    this.loading.set(true);
    const request = this.editingId
      ? this.api.updateProduct(this.editingId, payload)
      : this.api.createProduct(payload);
    request.subscribe({
      next: () => {
        this.toast.success(
          this.editingId ? "Produto actualizado." : "Produto criado.",
        );
        void this.router.navigateByUrl("/admin/produtos");
      },
      error: (response: {
        error?: {
          message?: string;
          details?: Array<{ field?: string; message?: string }>;
        };
      }) => {
        const details = response.error?.details
          ?.map(
            (detail) =>
              `${detail.field || "campo"}: ${detail.message || "valor inválido"}`,
          )
          .join(" ");
        this.toast.error(
          details ||
            response.error?.message ||
            "Não foi possível guardar o produto.",
        );
        this.loading.set(false);
      },
    });
  }
  private hasChanges(): boolean {
    if (!this.initialState) return true;
    const value = this.form.getRawValue();
    if (value.categorySlug !== this.initialState.categorySlug) return true;
    if (value.name !== this.initialState.name) return true;
    if ((value.description || "") !== this.initialState.description)
      return true;
    if (
      this.money.parse(value.price) !==
      this.money.parse(this.initialState.price)
    )
      return true;
    if (
      this.money.parse(value.oldPrice) !==
      this.money.parse(this.initialState.oldPrice)
    )
      return true;
    if ((value.badge || "") !== this.initialState.badge) return true;
    const initialStateGallery = (this.initialState?.gallery || "")
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean);
    const currentGallery = this.existingGallery();
    if (currentGallery.length !== initialStateGallery.length) return true;
    if (currentGallery.some((url, index) => url !== initialStateGallery[index]))
      return true;
    const initialStateFeatures = this.initialState?.features || [];
    const currentFeatures = this.features();
    if (currentFeatures.length !== initialStateFeatures.length) return true;
    if (
      currentFeatures.some(
        (feature, index) => feature !== initialStateFeatures[index],
      )
    )
      return true;
    if (this.imageFile) return true;
    if (this.galleryFiles.length) return true;
    return false;
  }
}
