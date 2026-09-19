import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface WishlistItem {
  id: string;
  name: string;
  price: number;
  oldPrice?: number;
  image: string;
  badge?: string;
}

@Injectable({ providedIn: 'root' })
export class WishlistService {
  private readonly STORAGE_KEY = 'bravo_wishlist';
  private wishlistSubject = new BehaviorSubject<WishlistItem[]>(this.load());
  readonly wishlist$ = this.wishlistSubject.asObservable();

  get items(): WishlistItem[] {
    return this.wishlistSubject.value;
  }

  get count(): number {
    return this.wishlistSubject.value.length;
  }

  toggle(item: WishlistItem): boolean {
    const items = this.wishlistSubject.value;
    const index = items.findIndex(i => i.id === item.id);
    if (index >= 0) {
      items.splice(index, 1);
      this.save(items);
      return false;
    }
    items.push(item);
    this.save(items);
    return true;
  }

  isInWishlist(id: string): boolean {
    return this.wishlistSubject.value.some(i => i.id === id);
  }

  private save(items: WishlistItem[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(items));
    this.wishlistSubject.next(items);
  }

  private load(): WishlistItem[] {
    const raw = localStorage.getItem(this.STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  }
}
