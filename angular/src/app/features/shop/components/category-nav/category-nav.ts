import { Component, output, EventEmitter, input } from '@angular/core';

@Component({
  selector: 'app-category-nav',
  standalone: false,
  templateUrl: './category-nav.html',
  styleUrl: './category-nav.css'
})
export class CategoryNav {
  selectedCategory = output<string>();
  categories = [
    { key: 'all', label: 'Todos', icon: 'fa-solid fa-store' },
    { key: 'roupas', label: 'Roupas', icon: 'fa-solid fa-shirt' },
    { key: 'tenis', label: 'Calçados', icon: 'fa-solid fa-shoe-prints' },
    { key: 'acessorios', label: 'Acessórios', icon: 'fa-solid fa-gem' }
  ];
}
