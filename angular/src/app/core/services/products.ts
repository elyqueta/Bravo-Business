import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { delay, catchError } from 'rxjs/operators';

export interface Product {
  id: string;
  code: string;
  name: string;
  category: 'roupas' | 'tenis' | 'acessorios';
  price: number;
  oldPrice?: number;
  description: string;
  features: string[];
  images: string[];
  badge?: string;
  sizes?: string[];
  colors?: { name: string; hex: string }[];
}

@Injectable({ providedIn: 'root' })
export class ProductsService {
  private readonly products: Product[] = [
    {
      id: 'p1',
      code: 'BB-001',
      name: 'Camiseta Urban Premium',
      category: 'roupas',
      price: 8500,
      oldPrice: 10600,
      description: 'Camiseta de algodão egípcio com corte moderno. Perfeita para o dia a dia urbano.',
      features: ['100% Algodão Egípcio', 'Corte Regular Fit', 'Estampa Exclusiva'],
      images: ['assets/produtos/roupas/tshirtAll.jpeg', 'assets/produtos/roupas/tshirtAll2.jpeg', 'assets/produtos/roupas/tshirtAll3.jpeg'],
      badge: '-20%',
      sizes: ['S', 'M', 'L', 'XL'],
      colors: [{ name: 'Preto', hex: '#000' }, { name: 'Branco', hex: '#fff' }]
    },
    {
      id: 'p2',
      code: 'BB-002',
      name: 'Ténis Air Runner X',
      category: 'tenis',
      price: 45000,
      description: 'Ténis de running com tecnologia de amortecimento avançado.',
      features: ['Amortecimento Air Gel', 'Solado em Borracha', 'Design Aerodinâmico'],
      images: ['assets/produtos/calcados/NB_tenis.jpeg', 'assets/produtos/calcados/chuteira2.jpeg'],
      sizes: ['39', '40', '41', '42', '43', '44']
    },
    {
      id: 'p3',
      code: 'BB-003',
      name: 'Colete Cardigan',
      category: 'roupas',
      price: 12000,
      oldPrice: 15000,
      description: 'Colete cardigan elegante para qualquer ocasião.',
      features: ['Tecido Premium', 'Corte Moderno', 'Fácil de Combinar'],
      images: ['assets/produtos/roupas/Colete_Cardigan.jpeg', 'assets/produtos/roupas/Colete_Cardigan2.jpeg', 'assets/produtos/roupas/Colete_Cardigan3.jpeg'],
      badge: 'Novo',
      colors: [{ name: 'Bege', hex: '#D2B48C' }, { name: 'Cinza', hex: '#808080' }]
    },
    {
      id: 'p4',
      code: 'BB-004',
      name: 'Fato Executivo',
      category: 'roupas',
      price: 55000,
      description: 'Fato executivo de alta qualidade para o profissional moderno.',
      features: ['Tecido Anti-rugas', 'Corte Slim', 'Forro em Seda'],
      images: ['assets/produtos/roupas/fato1.jpeg', 'assets/produtos/roupas/fato2.jpeg'],
      sizes: ['38', '40', '42', '44', '46']
    },
    {
      id: 'p5',
      code: 'BB-005',
      name: 'Chuteira Profissional',
      category: 'tenis',
      price: 35000,
      oldPrice: 42000,
      description: 'Chuteira profissional com tecnologia de ponta para máximo desempenho.',
      features: ['Palmilha Memory Foam', 'Solado Leve', 'Design Aerodinâmico'],
      images: ['assets/produtos/calcados/chuteira.jpeg', 'assets/produtos/calcados/chuteira3.jpeg', 'assets/produtos/calcados/chuteira4.jpeg'],
      badge: '-15%',
      sizes: ['38', '39', '40', '41', '42', '43']
    },
    {
      id: 'p6',
      code: 'BB-006',
      name: 'Colete Desportivo',
      category: 'roupas',
      price: 18000,
      description: 'Colete desportivo para treinos e actividades físicas.',
      features: ['Tecido Respirável', 'Bolso C/ziper', 'Design Moderno'],
      images: ['assets/produtos/roupas/colete.jpeg', 'assets/produtos/roupas/colete2.jpeg'],
      badge: '-10%',
      sizes: ['M', 'L', 'XL', 'XXL']
    },
    {
      id: 'p7',
      code: 'BB-007',
      name: 'Chuteira sem Pitão',
      category: 'tenis',
      price: 28000,
      description: 'Chuteira sem pitão para superfícies artificiais e indoor.',
      features: ['Solado Flat', 'Tecido Respirável', 'Amortecimento Extra'],
      images: ['assets/produtos/calcados/chuteira_sem_pitao.jpeg', 'assets/produtos/calcados/chuteira_sem_pitao2.jpeg'],
      sizes: ['39', '40', '41', '42', '43']
    },
    {
      id: 'p8',
      code: 'BB-008',
      name: 'Kit Chuteiras',
      category: 'tenis',
      price: 65000,
      oldPrice: 78000,
      description: 'Kit completo com várias chuteiras para diferentes superfícies.',
      features: ['6 Modelos Diferentes', 'Qualidade Premium', 'Variedade de Tamanhos'],
      images: ['assets/produtos/calcados/chuteira5.jpeg', 'assets/produtos/calcados/chuteira6.jpeg', 'assets/produtos/calcados/croques.jpeg'],
      badge: 'Promo',
      sizes: ['38', '39', '40', '41', '42', '43', '44']
    }
  ];

  getAll(): Observable<Product[]> {
    return of([...this.products]).pipe(delay(300));
  }

  getByCategory(category: string): Observable<Product[]> {
    return of(this.products.filter(p => p.category === category)).pipe(delay(200));
  }

  getById(id: string): Observable<Product | undefined> {
    return of(this.products.find(p => p.id === id)).pipe(delay(150));
  }

  search(query: string): Observable<Product[]> {
    const q = query.toLowerCase();
    return of(this.products.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.code.toLowerCase().includes(q)
    )).pipe(delay(200));
  }
}
