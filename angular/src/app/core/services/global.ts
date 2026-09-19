import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

export interface Product {
  id: string;
  name: string;
  cat: 'roupas' | 'tenis' | 'acessorios';
  price: number;
  oldPrice?: number;
  img: string;
  badge?: string;
}

export interface CartItem extends Product {
  qty: number;
}

@Injectable({ providedIn: 'root' })
export class GlobalService {
  private products: Product[] = [
    { id:'BB-R001', name:'Coletes', cat:'roupas', price:14500, oldPrice:16000, img:'assets/produtos/roupas/colete2.jpeg', badge:'Sale' },
    { id:'BB-R002', name:'Colete Cardigan', cat:'roupas', price:8000, oldPrice:9500, img:'assets/produtos/roupas/Colete_Cardigan.jpeg', badge:'Sale' },
    { id:'BB-R003', name:'Equipamento Desportivos', cat:'roupas', price:7500, img:'assets/produtos/roupas/equipamento_barca.jpeg' },
    { id:'BB-R004', name:'T-Shirt Lisas (todas as cores)', cat:'roupas', price:6000, img:'assets/produtos/roupas/tshirtAll2.jpeg' },
    { id:'BB-R005', name:'Fato Social', cat:'roupas', price:65000, oldPrice:80000, img:'assets/produtos/roupas/fato2.jpeg', badge:'Sale' },
    { id:'BB-C001', name:'Chuteira de Futebol', cat:'tenis', price:25000, img:'assets/produtos/calcados/chuteira.jpeg', badge:'Novo' },
    { id:'BB-C002', name:'Chuteira de Futsal', cat:'tenis', price:14000, img:'assets/produtos/calcados/chuteira_sem_pitao.jpeg' },
    { id:'BB-A005', name:'Brevemente teremos acessórios..', cat:'acessorios', price:0, img:'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600&q=80', badge:'Novo' },
  ];

  private catMeta = {
    roupas:    {label:'Roupas',     icon:'fa-shirt',       anchor:'s-roupas'},
    tenis:     {label:'Calçados',      icon:'fa-shoe-prints', anchor:'s-calcados'},
    acessorios:{label:'Acessórios', icon:'fa-gem',         anchor:'s-acessorios'},
  };

  cart: CartItem[] = [];
  wishlist: string[] = [];
  currentCat = 'all';
  dark = false;
  currentModalId: string | null = null;

  constructor(private router: Router) {}

  getProducts() { return this.products; }
  getProduct(id: string) { return this.products.find(p => p.id === id); }
  getProductsByCat(cat: string) { return this.products.filter(p => p.cat === cat); }
  getCatMeta() { return this.catMeta; }

  fmt(n: number): string { return n.toLocaleString('pt-AO') + ' Kz'; }

  addCart(id: string): void {
    const p = this.products.find(x => x.id === id);
    if (!p) return;
    const ex = this.cart.find(x => x.id === id);
    if (ex) ex.qty++; else this.cart.push({ ...p, qty: 1 });
  }

  rmCart(id: string): void {
    this.cart = this.cart.filter(x => x.id !== id);
  }

  chQty(id: string, d: number): void {
    const item = this.cart.find(x => x.id === id);
    if (!item) return;
    item.qty += d;
    if (item.qty <= 0) { this.rmCart(id); return; }
  }

  toggleWish(id: string): boolean {
    const idx = this.wishlist.indexOf(id);
    if (idx === -1) { this.wishlist.push(id); return true; }
    this.wishlist.splice(idx, 1); return false;
  }

  isWishlisted(id: string): boolean {
    return this.wishlist.includes(id);
  }

  toggleTheme(): void {
    this.dark = !this.dark;
    document.documentElement.setAttribute('data-theme', this.dark ? 'dark' : 'light');
  }

  openModal(id: string): void {
    this.currentModalId = id;
    document.body.style.overflow = 'hidden';
  }

  closeModal(): void {
    this.currentModalId = null;
    document.body.style.overflow = '';
  }

  toast(msg: string, el: HTMLElement | null = null): void {
    if (!el) return;
    const txt = el.querySelector('#toastTxt');
    if (txt) txt.textContent = msg;
    el.classList.add('on');
    setTimeout(() => el.classList.remove('on'), 2800);
  }

  scrollTo(el: HTMLElement | null): void {
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}
