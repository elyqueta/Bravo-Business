import { CommonModule } from "@angular/common";
import { Component, inject } from "@angular/core";
import { RouterLink, RouterLinkActive, RouterOutlet } from "@angular/router";
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
  logout(): void {
    this.auth.logout();
  }
}
