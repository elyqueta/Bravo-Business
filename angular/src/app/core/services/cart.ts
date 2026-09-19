import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  oldPrice?: number;
  image: string;
  quantity: number;
  size?: string;
  color?: string;
}

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly STORAGE_KEY = 'bravo_cart';
  private cartSubject = new BehaviorSubject<CartItem[]>(this.loadCart());
  readonly cart$ = this.cartSubject.asObservable();

  get items(): CartItem[] {
    return this.cartSubject.value;
  }

  get total(): number {
    return this.cartSubject.value.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }

  get count(): number {
    return this.cartSubject.value.reduce((sum, item) => sum + item.quantity, 0);
  }

  addItem(item: Omit<CartItem, 'quantity'>): void {
    const items = this.cartSubject.value;
    const existing = items.find(i => i.id === item.id && i.size === item.size && i.color === item.color);
    if (existing) {
      existing.quantity += 1;
    } else {
      items.push({ ...item, quantity: 1 });
    }
    this.save(items);
  }

  removeItem(id: string, size?: string, color?: string): void {
    this.save(this.cartSubject.value.filter(i => !(i.id === id && i.size === size && i.color === color)));
  }

  updateQuantity(id: string, quantity: number, size?: string, color?: string): void {
    const items = this.cartSubject.value;
    const item = items.find(i => i.id === id && i.size === size && i.color === color);
    if (item) {
      item.quantity = Math.max(0, quantity);
      if (item.quantity === 0) {
        this.removeItem(id, size, color);
        return;
      }
    }
    this.save(items);
  }

  clear(): void {
    this.save([]);
  }

  private save(items: CartItem[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(items));
    this.cartSubject.next(items);
  }

  private loadCart(): CartItem[] {
    const raw = localStorage.getItem(this.STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  }
}
