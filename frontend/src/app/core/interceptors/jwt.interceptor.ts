import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, catchError, filter, switchMap, take, throwError } from 'rxjs';
import { environment } from '@env/environment';
import { TokenStorageService } from '../services/token-storage.service';
import { HttpClient } from '@angular/common/http';

interface RefreshResponse {
  access: string;
  refresh: string;
}

// Sentinel value that unblocks queued requests when refresh fails
const REFRESH_FAILED = '__REFRESH_FAILED__';

let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<string | null>(null);

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenService = inject(TokenStorageService);
  const http = inject(HttpClient);
  const router = inject(Router);

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
        !req.url.includes('/auth/token/refresh')
      ) {
        const refresh = tokenService.getRefreshToken();
        if (!refresh) {
          tokenService.clear();
          router.navigate(['/auth/login']);
          return throwError(() => error);
        }

        if (!isRefreshing) {
          isRefreshing = true;
          refreshTokenSubject.next(null);

          return http
            .post<RefreshResponse>(`${environment.apiUrl}/auth/token/refresh/`, { refresh })
            .pipe(
              switchMap((res) => {
                isRefreshing = false;
                tokenService.saveTokens(res.access, res.refresh);
                refreshTokenSubject.next(res.access);
                return next(req.clone({ setHeaders: { Authorization: `Bearer ${res.access}` } }));
              }),
              catchError((refreshError) => {
                isRefreshing = false;
                // Emit sentinel to unblock all queued requests before redirecting
                refreshTokenSubject.next(REFRESH_FAILED);
                tokenService.clear();
                router.navigate(['/auth/login']);
                return throwError(() => refreshError);
              }),
            );
        }

        // Another request already refreshing — wait and retry with new token
        return refreshTokenSubject.pipe(
          filter((t) => t !== null),
          take(1),
          switchMap((t) => {
            if (t === REFRESH_FAILED) {
              return throwError(() => new Error('Sesión expirada'));
            }
            return next(req.clone({ setHeaders: { Authorization: `Bearer ${t}` } }));
          }),
        );
      }
      return throwError(() => error);
    }),
  );
};
