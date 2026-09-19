import { CommonModule } from "@angular/common";
import { Component, inject } from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { RouterLink } from "@angular/router";
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
  readonly form = this.formBuilder.nonNullable.group({
    email: ["", [Validators.required, Validators.email]],
    password: ["", [Validators.required, Validators.minLength(6)]],
  });
  loading = false;
  error = "";
  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading = true;
    this.error = "";
    this.auth
      .login(this.form.value.email!, this.form.value.password!)
      .subscribe({
        next: () => window.location.assign("/admin"),
        error: (error: { error?: { message?: string } }) => {
          this.loading = false;
          this.error =
            error.error?.message || "Não foi possível iniciar sessão.";
        },
      });
  }
}
