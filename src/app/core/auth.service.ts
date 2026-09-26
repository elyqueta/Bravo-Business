import { Injectable, signal } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Router } from "@angular/router";
import { Observable, catchError, map, of, switchMap, tap, throwError } from "rxjs";
import { environment } from "../../environments/environment";
import { ApiResponse, AuthResult, UserApi } from "./api.models";
import { RefreshService } from "./refresh.service";

@Injectable({ providedIn: "root" })
export class AuthService {
  private readonly _accessToken = signal<string | null>(null);
  readonly user = signal<UserApi | null>(null);
  private readonly failedAttemptsKey = "bravo-login-failed-attempts";
  private readonly lockUntilKey = "bravo-login-lock-until";
  private readonly maxAttempts = 3;
  private readonly lockMinutes = 30;
  private bootstrapDone = false;

  constructor(
    private readonly http: HttpClient,
    private readonly router: Router,
    private readonly refreshService: RefreshService,
  ) {}

  token(): string | null {
    return this._accessToken();
  }
  isAuthenticated(): boolean {
    return !!this._accessToken();
  }

  login(email: string, password: string): Observable<ApiResponse<AuthResult>> {
    if (this.isLoginLocked()) {
      return throwError(() => ({ status: 429, error: { message: this.lockMessage() } }));
    }
    return this.http
      .post<ApiResponse<AuthResult>>(`${environment.apiUrl}/auth/login`, { email, password }, { withCredentials: true })
      .pipe(
        tap((response) => {
          this._accessToken.set(response.data.accessToken);
          this.user.set(response.data.user);
          this.clearLoginAttempts();
        }),
        catchError((error) => {
          const status = error?.status;
          if (status === 401 || status === 429) {
            this.applyServerLock(error);
            this.recordFailedLogin();
          }
          return throwError(() => error);
        }),
      );
  }

  bootstrap(): Observable<boolean> {
    if (this.bootstrapDone) return of(!!this._accessToken());
    this.bootstrapDone = true;
    return this.refreshService.refresh().pipe(
      tap((response) => this._accessToken.set(response.data.accessToken)),
      switchMap(() => this.me()),
      map(() => true),
      catchError(() => {
        this._accessToken.set(null);
        this.user.set(null);
        return of(false);
      }),
    );
  }

  refresh(): Observable<ApiResponse<{ accessToken: string; refreshToken: string }>> {
    return this.refreshService.refresh();
  }

  me(): Observable<ApiResponse<UserApi>> {
    return this.http
      .get<ApiResponse<UserApi>>(`${environment.apiUrl}/admin/me`, { withCredentials: true })
      .pipe(
        tap((response) => {
          this.user.set(response.data);
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
  applyServerLock(error: { status?: number; error?: { retryAfter?: number } }): void {
    if (error?.status === 429 && error.error?.retryAfter) {
      const lockUntil = Date.now() + error.error.retryAfter * 1000;
      localStorage.setItem(this.lockUntilKey, String(lockUntil));
      localStorage.setItem(this.failedAttemptsKey, String(this.maxAttempts));
    }
  }

  logout(): void {
    this.http.post(`${environment.apiUrl}/auth/logout`, {}, { withCredentials: true }).subscribe({
      next: () => {},
      error: () => {},
    });
    this._accessToken.set(null);
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
}
