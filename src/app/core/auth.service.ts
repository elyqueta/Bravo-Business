import { Injectable, signal } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Router } from "@angular/router";
import { Observable, catchError, tap, throwError } from "rxjs";
import { environment } from "../../environments/environment";
import { ApiResponse, AuthResult, UserApi } from "./api.models";

@Injectable({ providedIn: "root" })
export class AuthService {
  private readonly tokenKey = "bravo-admin-token";
  private readonly userKey = "bravo-admin-user";
  private readonly failedAttemptsKey = "bravo-login-failed-attempts";
  private readonly lockUntilKey = "bravo-login-lock-until";
  private readonly maxAttempts = 3;
  private readonly lockMinutes = 30;
  readonly user = signal<UserApi | null>(this.restoreUser());
  constructor(
    private readonly http: HttpClient,
    private readonly router: Router,
  ) {}
  login(email: string, password: string): Observable<ApiResponse<AuthResult>> {
    if (this.isLoginLocked()) {
      return throwError(() => ({ status: 429, error: { message: this.lockMessage() } }));
    }
    return this.http
      .post<
        ApiResponse<AuthResult>
      >(`${environment.apiUrl}/auth/login`, { email, password })
      .pipe(
        tap((response) => {
          localStorage.setItem(this.tokenKey, response.data.accessToken);
          localStorage.setItem(
            this.userKey,
            JSON.stringify(response.data.user),
          );
          this.user.set(response.data.user);
          this.clearLoginAttempts();
        }),
        catchError((error) => {
          const status = error?.status;
          if (status === 401 || status === 429) {
            this.recordFailedLogin();
          }
          return throwError(() => error);
        }),
      );
  }
  isLoginLocked(): boolean {
    const lockUntil = Number(localStorage.getItem(this.lockUntilKey) || 0);
    if (lockUntil > Date.now()) return true;
    this.clearLock();
    return false;
  }
  getRemainingLockTime(): number {
    const lockUntil = Number(localStorage.getItem(this.lockUntilKey) || 0);
    return Math.max(0, lockUntil - Date.now());
  }
  lockMessage(): string {
    const remaining = this.getRemainingLockTime();
    if (remaining <= 0) return "Não foi possível iniciar sessão.";
    const minutes = Math.floor(remaining / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);
    return `Demasiadas tentativas inválidas. Tenta novamente em ${minutes}m ${seconds}s.`;
  }
  me(): Observable<ApiResponse<UserApi>> {
    return this.http
      .get<ApiResponse<UserApi>>(`${environment.apiUrl}/admin/me`)
      .pipe(
        tap((response) => {
          this.user.set(response.data);
          localStorage.setItem(this.userKey, JSON.stringify(response.data));
        }),
      );
  }
  token(): string | null {
    return localStorage.getItem(this.tokenKey);
  }
  isAuthenticated(): boolean {
    return !!this.token();
  }
  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this.user.set(null);
    void this.router.navigateByUrl("/admin/login");
  }
  private recordFailedLogin(): void {
    const attempts = Number(localStorage.getItem(this.failedAttemptsKey) || 0) + 1;
    localStorage.setItem(this.failedAttemptsKey, String(attempts));
    if (attempts >= this.maxAttempts) {
      const lockUntil = Date.now() + this.lockMinutes * 60 * 1000;
      localStorage.setItem(this.lockUntilKey, String(lockUntil));
    }
  }
  private clearLoginAttempts(): void {
    localStorage.removeItem(this.failedAttemptsKey);
    localStorage.removeItem(this.lockUntilKey);
  }
  private clearLock(): void {
    localStorage.removeItem(this.lockUntilKey);
  }
  private restoreUser(): UserApi | null {
    try {
      const value = localStorage.getItem(this.userKey);
      return value ? (JSON.parse(value) as UserApi) : null;
    } catch {
      return null;
    }
  }
}
