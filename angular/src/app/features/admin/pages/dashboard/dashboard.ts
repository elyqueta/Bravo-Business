import { Component, inject } from '@angular/core';
import { AuthService } from '@core/services/auth';

@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard {
  auth = inject(AuthService);
}
