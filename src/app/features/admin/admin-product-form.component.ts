import { CommonModule } from "@angular/common";
import { Component, OnInit, inject } from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { AdminApiService } from "../../core/admin-api.service";
import { CategoryApi, ProductApi, ProductBadge } from "../../core/api.models";

@Component({
  selector: "app-admin-product-form",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: "./admin-product-form.component.html",
  styleUrls: ["./admin-page.component.scss"],
})
export class AdminProductFormComponent implements OnInit {
  private readonly api = inject(AdminApiService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  categories: CategoryApi[] = [];
  product?: ProductApi;
  editingId: string | null = null;
  loading = false;
  error = "";
  imageFile: File | null = null;
  imagePreview = "";
  galleryFiles: File[] = [];
  galleryPreviews: string[] = [];
  readonly form = this.formBuilder.nonNullable.group({
    categorySlug: ["", Validators.required],
    name: ["", [Validators.required, Validators.maxLength(200)]],
    description: [""],
    price: [0, [Validators.required, Validators.min(0)]],
    oldPrice: [0],
    img: [""],
    badge: ["" as ProductBadge | ""],
    gallery: [""],
  });
  ngOnInit(): void {
    this.api.categories().subscribe({
      next: (response) => {
        this.categories = response.data;
        this.form.patchValue({ categorySlug: this.categories[0]?.slug || "" });
      },
      error: () => (this.error = "Não foi possível carregar categorias."),
    });
    const id = this.route.snapshot.paramMap.get("id");
    if (id) {
      this.editingId = id;
      this.api.products(id).subscribe({
        next: (response) => {
          this.product = response.data.find((item) => item.id === id);
          if (this.product)
            this.form.patchValue({
              categorySlug: this.product.categorySlug,
              name: this.product.name,
              description: this.product.description || "",
              price: this.product.price,
              oldPrice: this.product.oldPrice || 0,
              img: this.product.img,
              badge: this.product.badge || "",
              gallery: (this.product.gallery || []).join("\n"),
            });
        },
        error: () => (this.error = "Não foi possível carregar o produto."),
      });
    }
  }
  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] || null;
    if (!file) return;
    if (!file.type.startsWith("image/") || file.size > 5 * 1024 * 1024) {
      this.error = "Escolhe uma imagem válida até 5 MB.";
      input.value = "";
      return;
    }
    this.imageFile = file;
    this.imagePreview = URL.createObjectURL(file);
    this.error = "";
  }
  onGallerySelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files || []);
    const invalid = files.find(
      (file) => !file.type.startsWith("image/") || file.size > 5 * 1024 * 1024,
    );
    if (invalid) {
      this.error = "Todas as imagens devem ser válidas e ter no máximo 5 MB.";
      input.value = "";
      return;
    }
    this.galleryFiles = files;
    this.galleryPreviews = files.map((file) => URL.createObjectURL(file));
    this.error = "";
  }
  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    if (!this.editingId && !this.imageFile) {
      this.error = "Selecciona uma imagem principal para o produto.";
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
    const gallery = value.gallery
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean);
    if (gallery.length) payload.append("galleryUrls", JSON.stringify(gallery));
    if (this.imageFile)
      payload.append("img", this.imageFile, this.imageFile.name);
    this.galleryFiles.forEach((file) =>
      payload.append("gallery", file, file.name),
    );
    this.loading = true;
    const request = this.editingId
      ? this.api.updateProduct(this.editingId, payload)
      : this.api.createProduct(payload);
    request.subscribe({
      next: () => void this.router.navigateByUrl("/admin/produtos"),
      error: (response: { error?: { message?: string; details?: Array<{ field?: string; message?: string }> } }) => {
        const details = response.error?.details?.map((detail) => `${detail.field || "campo"}: ${detail.message || "valor inválido"}`).join(" ");
        this.error = details || response.error?.message || "Não foi possível guardar o produto.";
        this.loading = false;
      },
    });
  }
}
