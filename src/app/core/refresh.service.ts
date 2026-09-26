import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, catchError, throwError } from "rxjs";
import { environment } from "../../environments/environment";
import { ApiResponse, RefreshResponse } from "./api.models";

@Injectable({ providedIn: "root" })
export class RefreshService {
  constructor(private readonly http: HttpClient) {}
  refresh(): Observable<ApiResponse<RefreshResponse["data"]>> {
    return this.http
      .post<ApiResponse<RefreshResponse["data"]>>(`${environment.apiUrl}/auth/refresh`, {}, { withCredentials: true })
      .pipe(
        catchError((error) => {
          return throwError(() => error);
        }),
      );
  }
}
