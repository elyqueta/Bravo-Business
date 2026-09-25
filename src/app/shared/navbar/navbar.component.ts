import { CommonModule } from "@angular/common";
import { Component, inject } from "@angular/core";
import { RouterLink, RouterLinkActive } from "@angular/router";
import { StoreService } from "../../core/store.service";

@Component({
  selector: "app-navbar",
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: "./navbar.component.html",
})
export class NavbarComponent {
  readonly store = inject(StoreService);
  mobileOpen = false;
  closeMobile(): void {
    this.mobileOpen = false;
  }
  toggleMobile(): void {
    this.mobileOpen = !this.mobileOpen;
  }
}
