import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

export interface User {
  email: string;
  name: string;
  role: 'user' | 'admin';
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly STORAGE_KEY = 'bravo_auth';
  private currentUserSubject = new BehaviorSubject<User | null>(this.loadUser());
  readonly currentUser$ = this.currentUserSubject.asObservable();

  constructor(private router: Router) {}

  private loadUser(): User | null {
    const raw = localStorage.getItem(this.STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  }

  get currentUser(): User | null {
    return this.currentUserSubject.value;
  }

  get isAuthenticated(): boolean {
    return !!this.currentUser;
  }

  get isAdmin(): boolean {
    return this.currentUser?.role === 'admin';
  }

  login(email: string, password: string): boolean {
    if (email === 'admin@bravo.com' && password === 'admin123') {
      const user: User = { email, name: 'Administrador', role: 'admin' };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(user));
      this.currentUserSubject.next(user);
      return true;
    }
    return false;
  }

  logout(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    this.currentUserSubject.next(null);
    this.router.navigate(['/admin/login']);
  }
}
