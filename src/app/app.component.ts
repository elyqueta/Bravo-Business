import { Component, inject } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { FooterComponent } from "./shared/footer/footer.component";
import { NavbarComponent } from "./shared/navbar/navbar.component";
import { Router } from "@angular/router";
import { ToastContainerComponent } from "./shared/toast/toast-container.component";
import { ConfirmDialogComponent } from "./shared/confirm-dialog/confirm-dialog.component";
import { AuthService } from "./core/auth.service";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, FooterComponent, ToastContainerComponent, ConfirmDialogComponent],
  templateUrl: "./app.component.html",
})
export class AppComponent {
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);
  constructor() {
    this.auth.bootstrap().subscribe();
  }
  isAdminRoute(): boolean {
    return this.router.url.startsWith("/admin");
  }
}
