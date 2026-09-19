import { Component, inject } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { FooterComponent } from "./shared/footer/footer.component";
import { NavbarComponent } from "./shared/navbar/navbar.component";
import { Router } from "@angular/router";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, FooterComponent],
  templateUrl: "./app.component.html",
})
export class AppComponent {
  private readonly router = inject(Router);
  isAdminRoute(): boolean {
    return this.router.url.startsWith("/admin");
  }
}
