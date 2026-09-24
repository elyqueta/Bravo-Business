import { CommonModule } from "@angular/common";
import { Component, inject, signal } from "@angular/core";
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from "@angular/router";
import { AuthService } from "../../../core/auth.service";

@Component({
  selector: "app-admin-shell",
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: "./admin-shell.component.html",
  styleUrls: ["./admin-shell.component.scss"],
})
export class AdminShellComponent {
  readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  readonly mobileOpen = signal(false);
  toggleMobile(): void {
    this.mobileOpen.set(!this.mobileOpen());
  }
  closeMobile(): void {
    this.mobileOpen.set(false);
  }
  logout(): void {
    this.auth.logout();
  }
  constructor() {
    this.router.events.subscribe(() => this.closeMobile());
  }
}
