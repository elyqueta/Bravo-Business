import { CommonModule } from "@angular/common";
import { Component, OnDestroy, inject, signal } from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { Router, RouterLink } from "@angular/router";
import { AuthService } from "../../core/auth.service";
import { ToastService } from "../../shared/toast/toast.service";

@Component({
  selector: "app-admin-login",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: "./admin-login.component.html",
  styleUrls: ["./admin-login.component.scss"],
})
export class AdminLoginComponent implements OnDestroy {
  readonly auth = inject(AuthService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);
  readonly form = this.formBuilder.nonNullable.group({
    email: ["", [Validators.required, Validators.email]],
    password: ["", [Validators.required, Validators.minLength(6)]],
  });
  readonly loading = signal(false);
  readonly lockRemaining = signal(this.auth.getRemainingLockTime());
  readonly lockTimer: ReturnType<typeof setInterval> | undefined;
  constructor() {
    this.lockTimer = setInterval(() => {
      this.lockRemaining.set(this.auth.getRemainingLockTime());
    }, 1000);
  }
  ngOnDestroy(): void {
    if (this.lockTimer) clearInterval(this.lockTimer);
  }
  formatLockTime(ms: number): string {
    if (ms <= 0) return "";
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}min ${seconds}s restantes`;
  }
  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    if (this.auth.isLoginLocked()) {
      this.toast.error(this.auth.lockMessage());
      return;
    }
    this.loading.set(true);
    this.auth.login(this.form.value.email!, this.form.value.password!).subscribe({
      next: () => {
        this.loading.set(false);
        void this.router.navigateByUrl("/admin");
      },
      error: (error: { status?: number; error?: { message?: string } }) => {
        this.loading.set(false);
        const message = error.error?.message || this.auth.lockMessage();
        this.toast.error(message);
      },
    });
  }
}
