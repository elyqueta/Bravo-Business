import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '@core/services/auth';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  email = '';
  password = '';
  error = '';
  loading = false;

  constructor(private auth: AuthService, private router: Router) {}

  submit() {
    if (!this.email || !this.password) return;
    this.loading = true;
    this.error = '';
    setTimeout(() => {
      if (this.auth.login(this.email, this.password)) {
        this.router.navigate(['/admin/dashboard']);
      } else {
        this.error = 'Credenciais inválidas. Tente admin@bravo.com / admin123';
      }
      this.loading = false;
    }, 500);
  }
}
