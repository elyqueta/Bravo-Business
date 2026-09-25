import { CommonModule } from "@angular/common";
import { Component, inject } from "@angular/core";
import { RouterLink } from "@angular/router";
import { StoreService } from "../../../core/store.service";

@Component({
  selector: "app-cart-page",
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: "./cart-page.component.html",
})
export class CartPageComponent {
  readonly store = inject(StoreService);
  clearCart(): void {
    this.store.clearCart();
  }
  checkout(): void {
    const lines = this.store
      .cart()
      .map(
        (item) =>
          `• ${item.name} (${item.id}) x${item.qty} = ${this.store.formatPrice(item.price * item.qty)}`,
      )
      .join("\n");
    this.store.openWhatsApp(
      `*Olá, Bravo Business!*\n\nGostaria de encomendar:\n\n${lines}\n\n*Total: ${this.store.formatPrice(this.store.cartTotal())}*`,
    );
  }
}
