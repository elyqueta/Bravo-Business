import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable, catchError, of, switchMap, tap, throwError } from "rxjs";
import { environment } from "../../environments/environment";
import { ApiResponse, RefreshResponse } from "./api.models";

@Injectable({ providedIn: "root" })
export class RefreshService {
  private readonly refreshKey = "bravo-admin-refresh-token";
  constructor(private readonly http: HttpClient) {}
  refresh(): Observable<ApiResponse<{ accessToken: string; refreshToken: string }>> {
    const refreshToken = localStorage.getItem(this.refreshKey);
    if (!refreshToken) {
      return throwError(() => ({ status: 401 }));
    }
    return this.http
      .post<RefreshResponse>(`${environment.apiUrl}/auth/refresh`, {
        refreshToken,
      })
      .pipe(
        tap((response) => {
          localStorage.setItem(
            "bravo-admin-token",
            response.data.accessToken,
          );
          localStorage.setItem(this.refreshKey, response.data.refreshToken);
        }),
        catchError((error) => {
          this.clear();
          return throwError(() => error);
        }),
      );
  }
  setRefreshToken(token: string): void {
    localStorage.setItem(this.refreshKey, token);
  }
  clear(): void {
    localStorage.removeItem(this.refreshKey);
  }
}
