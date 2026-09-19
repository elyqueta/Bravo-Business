import { Component, inject } from "@angular/core";
import { ActivatedRoute } from "@angular/router";

@Component({
  selector: "app-info-page",
  standalone: true,
  templateUrl: "./info-page.component.html",
})
export class InfoPageComponent {
  readonly route = inject(ActivatedRoute);
  title = this.route.snapshot.data["title"] as string;
  text = this.route.snapshot.data["text"] as string;
}
