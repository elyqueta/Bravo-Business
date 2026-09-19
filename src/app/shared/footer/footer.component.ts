import { CommonModule } from "@angular/common";
import { Component, inject } from "@angular/core";
import { RouterLink } from "@angular/router";
import { StoreService } from "../../core/store.service";

@Component({
  selector: "app-footer",
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: "./footer.component.html",
})
export class FooterComponent {
  readonly store = inject(StoreService);
}
