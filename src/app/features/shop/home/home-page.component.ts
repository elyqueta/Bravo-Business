import { CommonModule } from "@angular/common";
import { Component, OnDestroy, OnInit, inject } from "@angular/core";
import { RouterLink } from "@angular/router";
import { ProductCardComponent } from "../../../shared/product-card/product-card.component";
import { SkeletonCardComponent } from "../../../shared/skeleton/skeleton-card.component";
import { Category, StoreService } from "../../../core/store.service";

@Component({
  selector: "app-home-page",
  standalone: true,
  imports: [CommonModule, RouterLink, ProductCardComponent, SkeletonCardComponent],
  templateUrl: "./home-page.component.html",
})
export class HomePageComponent implements OnInit, OnDestroy {
  readonly store = inject(StoreService);
  get categories(): Category[] {
    return this.store.categorySlugs();
  }
  readonly slides = [
    {
      bg: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1600&q=80",
      tag: "Nova Coleção 2026",
      icon: "fa-bolt",
      title: ["VISTA-SE", "COM ESTILO"],
      sub: "Moda urbana de qualidade premium para quem não abdica do estilo no dia a dia.",
      href: "/loja/produtos",
      action: "Explorar",
    },
    {
      bg: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1600&q=80",
      tag: "Calçados em Destaque",
      icon: "fa-star",
      title: ["PISA", "COM FORÇA"],
      sub: "Os modelos mais exclusivos para quem não passa despercebido. Conforto e atitude em cada passo.",
      href: "/loja/calcados",
      action: "Ver Calçados",
    },
    {
      bg: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1600&q=80",
      tag: "Acessórios Premium",
      icon: "fa-gem",
      title: ["DETALHES", "QUE FAZEM", "A DIFERENÇA"],
      sub: "Completa o teu look com os acessórios certos. Elegância nos pequenos detalhes.",
      href: "/loja/acessorios",
      action: "Ver Acessórios",
    },
  ];
  currentSlide = 0;
  private timer?: ReturnType<typeof setInterval>;
  ngOnInit(): void {
    this.timer = setInterval(
      () => (this.currentSlide = (this.currentSlide + 1) % this.slides.length),
      10000,
    );
  }
  ngOnDestroy(): void {
    if (this.timer) clearInterval(this.timer);
  }
  productsFor(category: Category) {
    return this.store.productsFor(category).slice(0, 4);
  }
}
