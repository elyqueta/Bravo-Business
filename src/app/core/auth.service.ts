import { Injectable, signal } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Router } from "@angular/router";
import { Observable, tap } from "rxjs";
import { environment } from "../../environments/environment";
import { ApiResponse, AuthResult, UserApi } from "./api.models";

@Injectable({ providedIn: "root" })
export class AuthService {
  private readonly tokenKey = "bravo-admin-token";
  private readonly userKey = "bravo-admin-user";
  readonly user = signal<UserApi | null>(this.restoreUser());
  constructor(
    private readonly http: HttpClient,
    private readonly router: Router,
  ) {}
  login(email: string, password: string): Observable<ApiResponse<AuthResult>> {
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
        }),
      );
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
  private restoreUser(): UserApi | null {
    try {
      const value = localStorage.getItem(this.userKey);
      return value ? (JSON.parse(value) as UserApi) : null;
    } catch {
      return null;
    }
  }
}
