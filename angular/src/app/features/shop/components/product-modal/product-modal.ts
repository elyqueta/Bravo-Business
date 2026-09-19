import { Component, inject } from '@angular/core';
import { GlobalService, Product } from '@core/services/global';

@Component({
  selector: 'app-product-modal',
  standalone: false,
  templateUrl: './product-modal.html',
  styleUrl: './product-modal.css'
})
export class ProductModal {
  global = inject(GlobalService);
  currentImgIndex = 0;
  images: string[] = [];

  get product(): Product | null {
    if (!this.global.currentModalId) return null;
    return this.global.getProduct(this.global.currentModalId) || null;
  }

  get currentImg(): string {
    return this.images[this.currentImgIndex] || '';
  }

  get catIcon(): string {
    if (!this.product) return '';
    const icons: any = { roupas: 'fa-shirt', tenis: 'fa-shoe-prints', acessorios: 'fa-gem' };
    return icons[this.product.cat] || '';
  }

  get catLabel(): string {
    if (!this.product) return '';
    const meta = this.global.getCatMeta();
    return meta[this.product.cat]?.label || this.product.cat;
  }

  get description(): string {
    if (!this.product) return '';
    const descs: any = {
      roupas: {
        'BB-R001': 'Camisa de linho premium com corte regular, botões de madrepérola e acabamento impecável. Respirável e leve, ideal para dias quentes em Luanda. Disponível em branco, azul e areia.',
        'BB-R002': 'Hoodie oversized de algodão pesado com interior fleece ultra-macio. Design urbano com bolso canguru e capuz ajustável. A peça essencial do streetwear moderno.',
        'BB-R003': 'Pack de 2 t-shirts básicas de algodão penteado 180g. Corte slim sem ser justo, costuras reforçadas e gola ribana duradoura. O básico que não falha.',
        'BB-R004': 'Calça cargo com 6 bolsos funcionais, cintura ajustável e tecido ripstop resistente. Perfeita para o dia a dia ou aventuras urbanas.',
        'BB-R005': 'Bomber jacket com forro de cetim, punhos e barra em ribana, zíper YKK e bolsos internos. O ícone do streetwear que nunca sai de moda.',
      },
      tenis: {
        'BB-C001': 'Calçados running de alta performance com entressola de espuma reactiva, upper em mesh respirável e sola de borracha Adiwear. Para correr mais e melhor.',
        'BB-C002': 'Clássico low-top em couro sintético com sola de borracha vulcanizada. O branco limpo que combina com tudo e nunca passa de moda.',
      },
      acessorios: {
        'BB-A005': 'Brevemente teremos acessórios premium seleccionados para complementar o teu estilo.',
      }
    };
    return descs[this.product.cat]?.[this.product.id] || 'Produto de qualidade premium seleccionado pela Bravo Business.';
  }

  get features(): string[] {
    if (!this.product) return [];
    const feats: any = {
      'BB-R001': ['Material: 100% Linho natural','Disponível: S, M, L, XL, XXL','Lavagem: Máquina 30°C','Origem: Portugal'],
      'BB-R002': ['Material: 80% Algodão, 20% Poliéster','Interior: Fleece premium','Disponível: S, M, L, XL','Lavagem: Máquina 40°C'],
      'BB-R003': ['Material: 100% Algodão 180g','Pack com 2 unidades','Disponível: S, M, L, XL, XXL','Lavagem: Máquina 40°C'],
      'BB-R004': ['Material: Ripstop 65% Poliéster 35% Algodão','6 bolsos funcionais','Disponível: 28 ao 36','Lavagem: Máquina 30°C'],
      'BB-R005': ['Material: 100% Poliéster + forro cetim','Zíper YKK','Disponível: S, M, L, XL','Lavagem: Máquina 30°C'],
      'BB-C001': ['Entressola: Espuma reactiva','Upper: Mesh respirável','Tamanhos: 38 ao 42','Género: Unissexo'],
      'BB-C002': ['Material: Couro sintético','Sola: Borracha vulcanizada','Tamanhos: 36 ao 42','Género: Unissexo'],
      'BB-A005': ['Brevemente disponível','Novidades em breve','Acessórios premium','Follow para novidades'],
    };
    return feats[this.product.id] || ['Produto de qualidade premium', 'Garantia de 30 dias', 'Entrega em Luanda'];
  }

  constructor() {
    const extraImgs: any = {
      'BB-R001': ['assets/produtos/roupas/colete2.jpeg','assets/produtos/roupas/colete.jpeg'],
      'BB-R002': ['assets/produtos/roupas/Colete_Cardigan.jpeg','assets/produtos/roupas/Colete_Cardigan2.jpeg','assets/produtos/roupas/Colete_Cardigan3.jpeg'],
      'BB-R003': ['assets/produtos/roupas/equipamento_barca.jpeg','assets/produtos/roupas/equipamento_barca.jpeg'],
      'BB-R004': ['assets/produtos/roupas/tshirtAll2.jpeg','assets/produtos/roupas/tshirtAll.jpeg','assets/produtos/roupas/tshirtAll3.jpeg'],
      'BB-R005': ['assets/produtos/roupas/fato2.jpeg'],
      'BB-C001': ['assets/produtos/calcados/chuteira.jpeg'],
      'BB-C002': ['assets/produtos/calcados/chuteira_sem_pitao.jpeg','assets/produtos/calcados/chuteira_sem_pitao2.jpeg'],
    };
    
    const id = this.global.currentModalId;
    if (id && extraImgs[id]) {
      this.images = extraImgs[id];
    } else if (this.product) {
      this.images = [this.product.img];
    }
  }

  switchImg(img: string, index: number): void {
    this.currentImgIndex = index;
  }

  close(): void {
    this.global.closeModal();
    this.currentImgIndex = 0;
  }

  addToCart(): void {
    if (this.product) {
      this.global.addCart(this.product.id);
    }
  }

  toggleWish(): void {
    if (this.product) {
      this.global.toggleWish(this.product.id);
    }
  }
}
