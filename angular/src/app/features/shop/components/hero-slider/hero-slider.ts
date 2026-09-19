import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-hero-slider',
  standalone: false,
  templateUrl: './hero-slider.html',
  styleUrl: './hero-slider.css'
})
export class HeroSlider {
  current = signal(0);
  slides = [
    {
      bg: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1600&q=80',
      tag: '<i class="fa-solid fa-bolt"></i> Nova Coleção 2026',
      title: 'VISTA-SE<br>COM ESTILO',
      sub: 'Moda urbana de qualidade premium para quem não abdica do estilo no dia a dia.',
      btns: [
        { text: '<i class="fa-solid fa-arrow-down"></i> Explorar', link: '/products', cls: 'btn-prim' },
        { text: '<i class="fa-brands fa-whatsapp"></i> Falar Connosco', link: 'https://wa.me/244957103656', cls: 'btn-ghost', external: true }
      ]
    },
    {
      bg: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1600&q=80',
      tag: '<i class="fa-solid fa-star"></i> Calçados em Destaque',
      title: 'PISA<br>COM FORÇA',
      sub: 'Os modelos mais exclusivos para quem não passa despercebido.',
      btns: [
        { text: '<i class="fa-solid fa-shoe-prints"></i> Ver Calçados', link: '/products', cls: 'btn-prim' }
      ]
    },
    {
      bg: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1600&q=80',
      tag: '<i class="fa-solid fa-gem"></i> Acessórios Premium',
      title: 'DETALHES<br>QUE FAZEM<br>A DIFERENÇA',
      sub: 'Completa o teu look com os acessórios certos.',
      btns: [
        { text: '<i class="fa-solid fa-gem"></i> Ver Acessórios', link: '/products', cls: 'btn-prim' }
      ]
    }
  ];

  goSlide(i: number) {
    this.current.set(i);
  }

  next() {
    this.current.set((this.current() + 1) % this.slides.length);
  }

  prev() {
    this.current.set((this.current() - 1 + this.slides.length) % this.slides.length);
  }

  get currentSlide() {
    return this.slides[this.current()];
  }
}
