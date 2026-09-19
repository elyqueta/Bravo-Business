import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from '@core/services/auth';

@Component({
  selector: 'app-admin-layout',
  standalone: false,
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.css'
})
export class AdminLayout {
  auth = inject(AuthService);
  year = new Date().getFullYear();

  constructor() {
    if (!this.auth.isAdmin) {
      // Guard handles redirect
    }
  }
}
