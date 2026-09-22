import { CommonModule } from "@angular/common";
import { Component, inject, signal } from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { Router, RouterLink } from "@angular/router";
import { AuthService } from "../../core/auth.service";

@Component({
  selector: "app-admin-login",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: "./admin-login.component.html",
  styleUrls: ["./admin-login.component.scss"],
})
export class AdminLoginComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  readonly form = this.formBuilder.nonNullable.group({
    email: ["", [Validators.required, Validators.email]],
    password: ["", [Validators.required, Validators.minLength(6)]],
  });
  readonly loading = signal(false);
  readonly error = signal("");
  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    this.error.set("");
    this.auth.login(this.form.value.email!, this.form.value.password!).subscribe({
      next: () => this.router.navigateByUrl("/admin"),
      error: (error: { error?: { message?: string } }) => {
        this.loading.set(false);
        this.error.set(
          error.error?.message || "Não foi possível iniciar sessão."
        );
      },
    });
  }
}
