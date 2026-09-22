import { CommonModule } from "@angular/common";
import { Component, OnInit, inject, signal } from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { AdminApiService } from "../../core/admin-api.service";
import { CategoryApi } from "../../core/api.models";

@Component({
  selector: "app-admin-category-form",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: "./admin-category-form.component.html",
  styleUrls: ["./admin-page.component.scss"],
})
export class AdminCategoryFormComponent implements OnInit {
  private readonly api = inject(AdminApiService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly category = signal<CategoryApi | null>(null);
  readonly loading = signal(false);
  readonly error = signal("");
  readonly iconPickerOpen = signal(false);
  editingId: string | null = null;
  readonly iconOptions = [
    "fa-shirt",
    "fa-shoe-prints",
    "fa-gem",
    "fa-box",
    "fa-bag-shopping",
    "fa-watch",
    "fa-glasses",
    "fa-hat-cowboy",
    "fa-vest",
    "fa-person-running",
    "fa-dumbbell",
    "fa-ring",
    "fa-sunglasses",
    "fa-wallet",
    "fa-backpack",
    "fa-crown",
    "fa-star",
    "fa-fire",
    "fa-tags",
    "fa-gift",
  ];
  readonly form = this.formBuilder.nonNullable.group({
    label: ["", [Validators.required, Validators.maxLength(100)]],
    icon: ["fa-box"],
    prefix: ["", [Validators.required, Validators.maxLength(1)]],
    anchor: ["", [Validators.required, Validators.maxLength(50)]],
  });
  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get("id");
    if (!id) return;
    this.editingId = id;
    this.api.categories().subscribe({
      next: (response) => {
        this.category.set(
          response.data.find((item) => item.id === id) ?? null
        );
        if (this.category()) {
          this.form.patchValue({
            label: this.category()!.label,
            icon: this.category()!.icon || "fa-box",
            prefix: this.category()!.prefix,
            anchor: this.category()!.anchor,
          });
        }
      },
      error: () => (this.error.set("Não foi possível carregar a categoria.")),
    });
  }
  selectIcon(icon: string): void {
    this.form.patchValue({ icon });
    this.iconPickerOpen.set(false);
  }
  openIconPicker(): void {
    this.iconPickerOpen.set(true);
  }
  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    const request = this.editingId
      ? this.api.updateCategory(this.editingId, this.form.getRawValue())
      : this.api.createCategory(this.form.getRawValue());
    request.subscribe({
      next: () => void this.router.navigateByUrl("/admin/categorias"),
      error: () => {
        this.error.set("Não foi possível guardar a categoria.");
        this.loading.set(false);
      },
    });
  }
}
