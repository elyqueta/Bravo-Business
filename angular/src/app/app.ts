import { Component, inject } from '@angular/core';
import { ThemeService } from '@core/services/theme';

@Component({
  selector: 'app-root',
  standalone: false,
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  private theme = inject(ThemeService);

  constructor() {
    this.theme.init();
  }
}
