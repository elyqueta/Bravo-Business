import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, catchError, throwError } from "rxjs";
import { environment } from "../../environments/environment";
import { ApiResponse } from "./api.models";

@Injectable({ providedIn: "root" })
export class RefreshService {
  constructor(private readonly http: HttpClient) {}
  refresh(): Observable<ApiResponse<{ accessToken: string; refreshToken: string; refreshExpiresAt: string }>> {
    return this.http
      .post<ApiResponse<{ accessToken: string; refreshToken: string; refreshExpiresAt: string }>>(`${environment.apiUrl}/auth/refresh`, {}, { withCredentials: true })
      .pipe(
        catchError((error) => {
          return throwError(() => error);
        }),
      );
  }
}
