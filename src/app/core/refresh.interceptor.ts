import { HttpInterceptorFn } from "@angular/common/http";
import { inject } from "@angular/core";
import { Router } from "@angular/router";
import { catchError, switchMap, throwError } from "rxjs";
import { AuthService } from "./auth.service";
import { RefreshService } from "./refresh.service";

export const refreshInterceptor: HttpInterceptorFn = (request, next) => {
  const authService = inject(AuthService);
  const refreshService = inject(RefreshService);
  const router = inject(Router);

  return next(request).pipe(
    catchError((error) => {
      if (error.status === 401 && authService.isAuthenticated()) {
        return refreshService.refresh().pipe(
          switchMap(() => {
            const token = authService.token();
            if (!token) {
              authService.logout();
              return [];
            }
            const cloned = request.clone({
              setHeaders: { Authorization: `Bearer ${token}` },
            });
            return next(cloned);
          }),
          catchError((refreshError) => {
            authService.logout();
            return throwError(() => refreshError);
          }),
        );
      }
      return throwError(() => error);
    }),
  );
};
