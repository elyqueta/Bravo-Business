import { Component, inject } from '@angular/core';
import { AuthService } from '@core/services/auth';
import { ThemeService } from '@core/services/theme';

@Component({
  selector: 'app-footer',
  standalone: false,
  templateUrl: './footer.html',
  styleUrl: './footer.css'
})
export class Footer {
  auth = inject(AuthService);
  theme = inject(ThemeService);
  currentYear = new Date().getFullYear();
}
