import { Injectable, signal } from "@angular/core";

export type Category = "roupas" | "tenis" | "acessorios";

export interface Product {
  id: string;
  name: string;
  cat: Category;
  price: number;
  img: string;
  oldPrice?: number;
  badge?: string;
}

export interface CartItem extends Product {
  qty: number;
}

@Injectable({ providedIn: "root" })
export class StoreService {
  private readonly cartStorageKey = "bravo-business-cart";
  private readonly wishlistStorageKey = "bravo-business-wishlist";
  readonly products: Product[] = [
    {
      id: "BB-R001",
      name: "Coletes",
      cat: "roupas",
      price: 14500,
      oldPrice: 16000,
      img: "assets/images/produtos/roupas/colete2.jpeg",
      badge: "Sale",
    },
    {
      id: "BB-R002",
      name: "Colete Cardigan",
      cat: "roupas",
      price: 8000,
      oldPrice: 9500,
      img: "assets/images/produtos/roupas/Colete_Cardigan.jpeg",
      badge: "Sale",
    },
    {
      id: "BB-R003",
      name: "Equipamento Desportivos",
      cat: "roupas",
      price: 7500,
      img: "assets/images/produtos/roupas/equipamento_barca.jpeg",
    },
    {
      id: "BB-R004",
      name: "T-Shirt Lisas (todas as cores)",
      cat: "roupas",
      price: 6000,
      img: "assets/images/produtos/roupas/tshirtAll2.jpeg",
    },
    {
      id: "BB-R005",
      name: "Fato Social",
      cat: "roupas",
      price: 65000,
      oldPrice: 80000,
      img: "assets/images/produtos/roupas/fato2.jpeg",
      badge: "Sale",
    },
    {
      id: "BB-C001",
      name: "Chuteira de Futebol",
      cat: "tenis",
      price: 25000,
      img: "assets/images/produtos/calcados/chuteira.jpeg",
      badge: "Novo",
    },
    {
      id: "BB-C002",
      name: "Chuteira de Futsal",
      cat: "tenis",
      price: 14000,
      img: "assets/images/produtos/calcados/chuteira_sem_pitao.jpeg",
    },
    {
      id: "BB-A005",
      name: "Brevemente teremos acessórios..",
      cat: "acessorios",
      price: 0,
      img: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600&q=80",
      badge: "Novo",
    },
  ];
  readonly categoryMeta: Record<
    Category,
    { label: string; icon: string; route: string }
  > = {
    roupas: { label: "Roupas", icon: "fa-shirt", route: "/loja/roupas" },
    tenis: {
      label: "Calçados",
      icon: "fa-shoe-prints",
      route: "/loja/calcados",
    },
    acessorios: {
      label: "Acessórios",
      icon: "fa-gem",
      route: "/loja/acessorios",
    },
  };
  readonly cart = signal<CartItem[]>([]);
  readonly wishlist = signal<string[]>([]);
  readonly dark = signal(false);

  constructor() {
    this.restoreCart();
    this.restoreWishlist();
  }

  formatPrice(value: number): string {
    return `${value.toLocaleString("pt-AO")} Kz`;
  }
  categoryLabel(category: Category): string {
    return this.categoryMeta[category].label;
  }
  productsFor(category?: Category): Product[] {
    return category
      ? this.products.filter((product) => product.cat === category)
      : this.products;
  }
  cartCount(): number {
    return this.cart().reduce((total, item) => total + item.qty, 0);
  }
  cartTotal(): number {
    return this.cart().reduce(
      (total, item) => total + item.price * item.qty,
      0,
    );
  }
  isWishlisted(id: string): boolean {
    return this.wishlist().includes(id);
  }
  addCart(product: Product): void {
    const items = [...this.cart()];
    const item = items.find((entry) => entry.id === product.id);
    if (item) item.qty++;
    else items.push({ ...product, qty: 1 });
    this.cart.set(items);
    this.persistCart(items);
  }
  changeQuantity(id: string, change: number): void {
    const items = this.cart()
      .map((item) =>
        item.id === id ? { ...item, qty: item.qty + change } : item,
      )
      .filter((item) => item.qty > 0);
    this.cart.set(items);
    this.persistCart(items);
  }
  toggleWish(product: Product): void {
    const ids = this.wishlist();
    const updatedIds = ids.includes(product.id)
      ? ids.filter((id) => id !== product.id)
      : [...ids, product.id];
    this.wishlist.set(updatedIds);
    this.persistWishlist(updatedIds);
  }

  private restoreCart(): void {
    const stored = this.readStorage(this.cartStorageKey);
    if (!Array.isArray(stored)) return;
    const restored = stored
      .map((entry: unknown) => {
        if (
          !this.isStorageRecord(entry) ||
          typeof entry["id"] !== "string" ||
          typeof entry["qty"] !== "number"
        )
          return null;
        const product = this.products.find((item) => item.id === entry["id"]);
        return product && Number.isInteger(entry["qty"]) && entry["qty"] > 0
          ? { ...product, qty: entry["qty"] }
          : null;
      })
      .filter((item): item is CartItem => item !== null);
    this.cart.set(restored);
  }

  private restoreWishlist(): void {
    const stored = this.readStorage(this.wishlistStorageKey);
    if (!Array.isArray(stored)) return;
    const restored = stored.filter(
      (id: unknown): id is string =>
        typeof id === "string" &&
        this.products.some((product) => product.id === id),
    );
    this.wishlist.set(restored);
  }

  private persistCart(items: CartItem[]): void {
    this.writeStorage(
      this.cartStorageKey,
      items.map(({ id, qty }) => ({ id, qty })),
    );
  }

  private persistWishlist(ids: string[]): void {
    this.writeStorage(this.wishlistStorageKey, ids);
  }

  private readStorage(key: string): unknown {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : null;
    } catch {
      return null;
    }
  }

  private writeStorage(key: string, value: unknown): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {}
  }

  private isStorageRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null;
  }
  toggleTheme(): void {
    this.dark.update((value) => !value);
    document.documentElement.setAttribute(
      "data-theme",
      this.dark() ? "dark" : "light",
    );
  }
  openWhatsApp(message: string): void {
    window.open(
      `https://wa.me/244957103656?text=${encodeURIComponent(message)}`,
      "_blank",
    );
  }
}
