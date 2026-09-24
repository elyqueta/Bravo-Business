import { CommonModule } from "@angular/common";
import { Component, OnInit, inject, signal } from "@angular/core";
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from "@angular/forms";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { AdminApiService } from "../../core/admin-api.service";
import { CategoryApi, ProductApi, ProductBadge } from "../../core/api.models";
import { ToastService } from "../../shared/toast/toast.service";

@Component({
  selector: "app-admin-product-form",
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink],
  templateUrl: "./admin-product-form.component.html",
  styleUrls: ["./admin-page.component.scss"],
})
export class AdminProductFormComponent implements OnInit {
  private readonly api = inject(AdminApiService);
  private readonly toast = inject(ToastService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly categories = signal<CategoryApi[]>([]);
  readonly product = signal<ProductApi | null>(null);
  readonly loading = signal(false);
  readonly imagePreview = signal("");
  readonly galleryPreviews = signal<string[]>([]);
  readonly features = signal<string[]>([]);
  readonly featureText = signal("");
  editingId: string | null = null;
  imageFile: File | null = null;
  galleryFiles: File[] = [];
  private objectUrls: string[] = [];
  readonly form = this.formBuilder.nonNullable.group({
    categorySlug: ["", Validators.required],
    name: ["", [Validators.required, Validators.maxLength(200)]],
    description: [""],
    price: [0, [Validators.required, Validators.min(0)]],
    oldPrice: [0],
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
          this.form.patchValue({ categorySlug: this.categories()[0]?.slug || "" });
        }
      },
      error: () => this.toast.error("Não foi possível carregar categorias."),
    });
    if (id) {
      this.api.products(id).subscribe({
        next: (response) => {
          this.product.set(
            response.data.find((item) => item.id === id) ?? null
          );
          if (this.product()) {
            this.form.patchValue({
              categorySlug: this.product()!.categorySlug,
              name: this.product()!.name,
              description: this.product()!.description || "",
              price: this.product()!.price,
              oldPrice: this.product()!.oldPrice || 0,
              badge: this.product()!.badge || "",
              gallery: (this.product()!.gallery || []).join("\n"),
            });
            this.features.set(this.product()!.features || []);
          }
        },
        error: () => this.toast.error("Não foi possível carregar o produto."),
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
    const text = this.featureText().trim();
    if (!text) return;
    if (this.features().includes(text)) {
      this.toast.error("Essa característica já foi adicionada.");
      return;
    }
    this.features.update((items) => [...items, text]);
    this.featureText.set("");
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
      this.toast.error("Todas as imagens devem ser válidas e ter no máximo 5 MB.");
      input.value = "";
      return;
    }
    this.galleryFiles = files;
    const urls = files.map((file) => URL.createObjectURL(file));
    urls.forEach((url) => this.trackObjectUrl(url));
    this.galleryPreviews.set(urls);
  }
  removeGalleryPreview(index: number): void {
    this.galleryPreviews.update((items) => items.filter((_, i) => i !== index));
    this.galleryFiles = this.galleryFiles.filter((_, i) => i !== index);
  }
  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    if (!this.editingId && !this.imageFile) {
      this.toast.error("Selecciona uma imagem principal para o produto.");
      return;
    }
    const value = this.form.getRawValue();
    const payload = new FormData();
    payload.append("categorySlug", value.categorySlug);
    payload.append("name", value.name);
    payload.append("description", value.description);
    const price =
      typeof value.price === "number"
        ? value.price
        : Number(String(value.price).replace(",", "."));
    const oldPrice =
      typeof value.oldPrice === "number"
        ? value.oldPrice
        : Number(String(value.oldPrice).replace(",", "."));
    payload.append("price", String(Number.isNaN(price) ? 0 : price));
    payload.append("oldPrice", String(Number.isNaN(oldPrice) ? 0 : oldPrice));
    if (value.badge) payload.append("badge", value.badge);
    payload.append("features", JSON.stringify(this.features()));
    const gallery = value.gallery
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean);
    if (gallery.length) payload.append("gallery", JSON.stringify(gallery));
    if (this.imageFile)
      payload.append("img", this.imageFile, this.imageFile.name);
    this.galleryFiles.forEach((file) =>
      payload.append("gallery", file, file.name),
    );
    this.loading.set(true);
    const request = this.editingId
      ? this.api.updateProduct(this.editingId, payload)
      : this.api.createProduct(payload);
    request.subscribe({
      next: () => {
        this.toast.success(this.editingId ? "Produto actualizado." : "Produto criado.");
        void this.router.navigateByUrl("/admin/produtos");
      },
      error: (response: { error?: { message?: string; details?: Array<{ field?: string; message?: string }> } }) => {
        const details = response.error?.details?.map((detail) => `${detail.field || "campo"}: ${detail.message || "valor inválido"}`).join(" ");
        this.toast.error(details || response.error?.message || "Não foi possível guardar o produto.");
        this.loading.set(false);
      },
    });
  }
}
