import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { environment } from '@env/environment';
import { TokenStorageService } from '../services/token-storage.service';
import { HttpClient } from '@angular/common/http';

let isRefreshing = false;

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenService = inject(TokenStorageService);
  const http = inject(HttpClient);

  // Only attach token to our own API
  if (!req.url.startsWith(environment.apiUrl)) {
    return next(req);
  }

  const token = tokenService.getAccessToken();
  const authReq = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (
        error.status === 401 &&
        !req.url.includes('/auth/login') &&
        !req.url.includes('/auth/logout') &&
        !isRefreshing
      ) {
        const refresh = tokenService.getRefreshToken();
        if (refresh) {
          isRefreshing = true;
          return http
            .post<{ access: string }>(`${environment.apiUrl}/auth/token/refresh/`, { refresh })
            .pipe(
              switchMap((res) => {
                isRefreshing = false;
                tokenService.saveTokens(res.access, refresh);
                const retryReq = req.clone({
                  setHeaders: { Authorization: `Bearer ${res.access}` },
                });
                return next(retryReq);
              }),
              catchError((refreshError) => {
                isRefreshing = false;
                tokenService.clear();
                return throwError(() => refreshError);
              }),
            );
        }
      }
      return throwError(() => error);
    }),
  );
};
