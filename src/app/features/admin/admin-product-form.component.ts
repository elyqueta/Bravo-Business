import { CommonModule } from "@angular/common";
import { Component, OnInit, inject, signal } from "@angular/core";
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormsModule,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { AdminApiService } from "../../core/admin-api.service";
import { CategoryApi, ProductApi, ProductBadge } from "../../core/api.models";
import { MoneyService } from "../../core/money.service";
import { ToastService } from "../../shared/toast/toast.service";
import { FormFieldComponent } from "../../shared/form-field/form-field.component";

@Component({
  selector: "app-admin-product-form",
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, FormFieldComponent],
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
  readonly submitState = signal<'idle' | 'submitting' | 'success'>('idle');
  readonly imagePreview = signal("");
  readonly galleryPreviews = signal<string[]>([]);
  readonly existingGallery = signal<string[]>([]);
  readonly features = signal<string[]>([]);
  readonly featureSuccess = signal(false);
  featureCtrl = new FormControl("");
  editingId: string | null = null;
  imageFile: File | null = null;
  galleryFiles: File[] = [];
  imageDragOver = signal(false);
  galleryDragOver = signal(false);
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
    price: [this.money.format(0), {
      validators: [Validators.required, this.moneyValidator.bind(this)],
      updateOn: 'change'
    }],
    oldPrice: ["", {
      validators: [this.moneyValidator.bind(this)],
      updateOn: 'change'
    }],
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
            this.features.set(this.sanitizeFeatures(product.features || []));
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
              features: this.sanitizeFeatures(product.features || []),
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
    this.featureSuccess.set(true);
    setTimeout(() => this.featureSuccess.set(false), 1200);
  }
  removeFeature(index: number): void {
    this.features.update((items) => items.filter((_, i) => i !== index));
  }
  priceState(): 'default' | 'error' | 'success' {
    const control = this.form.controls.price;
    if (control.touched && control.invalid) return 'error';
    if (control.touched && !control.invalid && control.value !== this.money.format(0)) return 'success';
    return 'default';
  }
  priceHelp(): string {
    const control = this.form.controls.price;
    if (control.touched && control.invalid) return 'Introduz um preço válido.';
    return '';
  }
  oldPriceState(): 'default' | 'error' | 'success' {
    const control = this.form.controls.oldPrice;
    if (control.touched && control.invalid) return 'error';
    if (control.touched && !control.invalid && control.value) return 'success';
    return 'default';
  }
  oldPriceHelp(): string {
    const control = this.form.controls.oldPrice;
    if (control.touched && control.invalid) return 'Introduz um preço válido.';
    return '';
  }
  private moneyValidator(control: AbstractControl<string | null, string | null>): ValidationErrors | null {
    const value = control.value;
    if (!value || value.trim() === "") {
      return { required: true };
    }
    const parsed = this.money.parse(value);
    return parsed === null ? { invalidMoney: true } : null;
  }
  private centsFromFormatted(value: string): number {
    const digitsOnly = value.replace(/\D/g, "");
    return digitsOnly ? parseInt(digitsOnly, 10) : 0;
  }
  private formatFromCents(cents: number): string {
    const value = cents / 100;
    return value.toLocaleString('pt-AO', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }
  onPriceInput(controlName: "price" | "oldPrice", event: Event): void {
    const input = event.target as HTMLInputElement;
    const cents = this.centsFromFormatted(input.value);
    const formatted = this.formatFromCents(cents);
    this.form.get(controlName)?.setValue(formatted, { emitEvent: false });
    requestAnimationFrame(() => {
      const end = input.value.length;
      input.setSelectionRange(end, end);
    });
  }
  onPriceKeydown(controlName: "price" | "oldPrice", event: KeyboardEvent): void {
    if (event.key !== 'Backspace') return;
    event.preventDefault();
    const current = this.form.get(controlName)?.value || '';
    const cents = Math.floor(this.centsFromFormatted(current) / 10);
    this.form.get(controlName)?.setValue(this.formatFromCents(cents), { emitEvent: false });
  }
  private sanitizeFeatures(features: string[]): string[] {
    return [...new Set(features.map((f) => f.trim()).filter((f) => f.length > 0))];
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
  onImageDragOver(event: DragEvent): void {
    event.preventDefault();
    this.imageDragOver.set(true);
  }
  onImageDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.imageDragOver.set(false);
  }
  onImageDrop(event: DragEvent): void {
    event.preventDefault();
    this.imageDragOver.set(false);
    const file = event.dataTransfer?.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/") || file.size > 5 * 1024 * 1024) {
      this.toast.error("Escolhe uma imagem válida até 5 MB.");
      return;
    }
    this.imageFile = file;
    const url = URL.createObjectURL(file);
    this.trackObjectUrl(url);
    this.imagePreview.set(url);
  }
  onGalleryDragOver(event: DragEvent): void {
    event.preventDefault();
    this.galleryDragOver.set(true);
  }
  onGalleryDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.galleryDragOver.set(false);
  }
  onGalleryDrop(event: DragEvent): void {
    event.preventDefault();
    this.galleryDragOver.set(false);
    const files = Array.from(event.dataTransfer?.files || []);
    const invalid = files.find(
      (file) => !file.type.startsWith("image/") || file.size > 5 * 1024 * 1024,
    );
    if (invalid) {
      this.toast.error(
        "Todas as imagens devem ser válidas e ter no máximo 5 MB.",
      );
      return;
    }
    this.galleryFiles = [...this.galleryFiles, ...files];
    const urls = files.map((file) => URL.createObjectURL(file));
    urls.forEach((url) => this.trackObjectUrl(url));
    this.galleryPreviews.update((items) => [...items, ...urls]);
  }
  triggerImagePicker(input: HTMLInputElement): void {
    input.click();
  }
  triggerGalleryPicker(input: HTMLInputElement): void {
    input.click();
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
      this.form.get("price")?.setErrors({ ...this.form.get("price")?.errors, invalidMoney: true });
      this.form.get("price")?.markAsTouched();
      this.toast.error("Introduz um preço válido.");
      return;
    }
    this.submitState.set('submitting');
    const payload = new FormData();
    payload.append("categorySlug", value.categorySlug);
    payload.append("name", value.name);
    payload.append("description", value.description);
    payload.append("price", String(price));
    if (oldPrice !== null) {
      payload.append("oldPrice", String(oldPrice));
    }
    if (value.badge) payload.append("badge", value.badge);
    const features = this.sanitizeFeatures(this.features());
    features.forEach((feature) => payload.append("features[]", feature));
    const gallery = this.existingGallery();
    payload.append("galleryUrls", JSON.stringify(gallery));
    if (this.imageFile)
      payload.append("img", this.imageFile, this.imageFile.name);
    this.galleryFiles.forEach((file) =>
      payload.append("gallery[]", file, file.name),
    );
    const request = this.editingId
      ? this.api.updateProduct(this.editingId, payload)
      : this.api.createProduct(payload);
    request.subscribe({
      next: () => {
        this.submitState.set('success');
        setTimeout(() => {
          this.toast.success(
            this.editingId ? "Produto actualizado." : "Produto criado.",
          );
          void this.router.navigateByUrl("/admin/produtos");
        }, 600);
      },
      error: (response: {
        error?: {
          message?: string;
          details?: Array<{ field?: string; message?: string }>;
        };
      }) => {
        this.submitState.set('idle');
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
