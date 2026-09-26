import { CommonModule } from "@angular/common";
import { Component, OnInit, effect, inject } from "@angular/core";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { Product, StoreService } from "../../../core/store.service";
import { SkeletonDetailComponent } from "../../../shared/skeleton/skeleton-detail.component";

@Component({
  selector: "app-product-detail-page",
  standalone: true,
  imports: [CommonModule, RouterLink, SkeletonDetailComponent],
  templateUrl: "./product-detail-page.component.html",
  styleUrls: ["./product-detail-page.component.scss"],
})
export class ProductDetailPageComponent implements OnInit {
  readonly store = inject(StoreService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  product?: Product;
  selectedImage = 0;
  private productId = "";

  constructor() {
    effect(() => {
      this.store.catalogVersion();
      this.updateFromCatalog();
    });
  }

  readonly galleries: Record<string, string[]> = {
    "BB-R001": [
      "assets/images/produtos/roupas/colete2.jpeg",
      "assets/images/produtos/roupas/colete.jpeg",
    ],
    "BB-R002": [
      "assets/images/produtos/roupas/Colete_Cardigan.jpeg",
      "assets/images/produtos/roupas/Colete_Cardigan2.jpeg",
      "assets/images/produtos/roupas/Colete_Cardigan3.jpeg",
    ],
    "BB-R003": [
      "assets/images/produtos/roupas/equipamento_barca.jpeg",
      "assets/images/produtos/roupas/equipamento_petro.jpeg",
    ],
    "BB-R004": [
      "assets/images/produtos/roupas/tshirtAll2.jpeg",
      "assets/images/produtos/roupas/tshirtAll.jpeg",
      "assets/images/produtos/roupas/tshirtAll3.jpeg",
    ],
    "BB-R005": [
      "assets/images/produtos/roupas/fato2.jpeg",
      "assets/images/produtos/roupas/fato1.jpeg",
    ],
    "BB-C001": [
      "assets/images/produtos/calcados/chuteira.jpeg",
      "assets/images/produtos/calcados/chuteira2.jpeg",
      "assets/images/produtos/calcados/chuteira3.jpeg",
    ],
    "BB-C002": [
      "assets/images/produtos/calcados/chuteira_sem_pitao.jpeg",
      "assets/images/produtos/calcados/chuteira_sem_pitao2.jpeg",
    ],
    "BB-A005": [
      "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=1000&q=85",
      "https://images.unsplash.com/photo-1473496169904-658ba7574b0d?w=1000&q=85",
    ],
  };

  readonly descriptions: Record<string, string> = {
    "BB-R001":
      "Colete versátil com acabamento cuidado, pensado para criar combinações elegantes e descontraídas no dia a dia.",
    "BB-R002":
      "Colete cardigan confortável e actual, uma camada leve para completar o teu look com personalidade.",
    "BB-R003":
      "Equipamento desportivo funcional para acompanhar o teu ritmo, com conforto e liberdade de movimento.",
    "BB-R004":
      "T-shirts lisas essenciais, disponíveis em várias cores para construíres combinações simples e marcantes.",
    "BB-R005":
      "Fato social de presença elegante, pensado para ocasiões em que o corte e o acabamento fazem a diferença.",
    "BB-C001":
      "Chuteira de futebol com construção preparada para dar estabilidade, conforto e confiança em cada jogada.",
    "BB-C002":
      "Chuteira de futsal leve e resistente, com aderência para movimentos rápidos dentro de campo.",
    "BB-A005":
      "Em breve, uma selecção de acessórios para completar o teu estilo com os detalhes certos.",
  };

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      this.productId = params.get("id") || "";
      this.updateFromCatalog();
    });
  }

  private updateFromCatalog(): void {
    if (!this.productId) return;
    const product = this.store.products.find(
      (item) => item.id === this.productId,
    );
    if (!product) {
      if (this.store.catalogReady())
        void this.router.navigateByUrl("/loja/produtos");
      return;
    }
    this.product = product;
    this.selectedImage = 0;
  }

  images(): string[] {
    return this.product
      ? this.product.gallery?.length
        ? [this.product.img, ...this.product.gallery]
        : this.galleries[this.product.id] || [this.product.img]
      : [];
  }
  description(): string {
    return this.product
      ? this.product.description ||
          this.descriptions[this.product.id] ||
          "Produto seleccionado pela Bravo Business com atenção à qualidade e ao detalhe."
      : "";
  }
  selectImage(index: number): void {
    this.selectedImage = index;
  }
  badgeClass(badge?: string): string {
    return badge === "Sale" ? "sale" : badge === "Premium" ? "premium" : "";
  }
  addToCart(): void {
    if (this.product) this.store.addCart(this.product);
  }
  toggleWish(): void {
    if (this.product) this.store.toggleWish(this.product);
  }
}
