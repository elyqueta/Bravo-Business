import { CommonModule } from "@angular/common";
import { Component, inject } from "@angular/core";
import { StoreService } from "../../core/store.service";

@Component({
  selector: "app-admin-page",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./admin-page.component.html",
})
export class AdminPageComponent {
  readonly store = inject(StoreService);
}
