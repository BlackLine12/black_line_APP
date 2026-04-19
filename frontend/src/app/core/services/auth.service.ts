import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '@env/environment';
import { User } from '../models/user';
import { AuthResponse, RegisterPayload } from '../models/auth-response';
import { TokenStorageService } from './token-storage.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly tokenStorage = inject(TokenStorageService);
  private readonly baseUrl = `${environment.apiUrl}/auth`;

  /** Reactive user state */
  private _user = signal<User | null>(this.loadUserFromStorage());
  readonly user = this._user.asReadonly();
  readonly isAuthenticated = computed(() => this.hasActiveSession());
  readonly userType = computed(() => {
    if (!this.hasActiveSession()) {
      return null;
    }
    return this._user()?.user_type ?? this.getUserTypeFromAccessToken();
  });

  // ── Login (acepta email o username) ────────────────────────
  login(credential: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/login/`, { email: credential, password }).pipe(
      tap((res) => {
        this.tokenStorage.saveTokens(res.access, res.refresh);
        this.saveUser(res.user);
        this._user.set(res.user);
      })
    );
  }

  // ── Register ───────────────────────────────────────────────
  register(payload: RegisterPayload): Observable<{ message: string; user: User }> {
    return this.http.post<{ message: string; user: User }>(`${this.baseUrl}/register/`, payload);
  }

  // ── Logout ─────────────────────────────────────────────────
  logout(): void {
    const refresh = this.tokenStorage.getRefreshToken();
    if (refresh) {
      this.http.post(`${this.baseUrl}/logout/`, { refresh }).subscribe();
    }
    this.clearLocalSession();
    this.router.navigate(['/auth/login']);
  }

  // ── Helpers ────────────────────────────────────────────────
  syncSessionState(): void {
    if (!this.hasValidAccessToken()) {
      this.clearLocalSession();
    }
  }

  redirectByRole(): void {
    const type = this._user()?.user_type ?? this.getUserTypeFromAccessToken();
    if (type === 'STUDIO') {
      this.router.navigate(['/studio/dashboard']);
    } else if (type === 'CLIENT') {
      this.router.navigate(['/client/cotizador']);
    } else if (type === 'ADMIN') {
      // ADMIN no tiene SPA — gestiona vía Django Admin (/admin/)
      this.router.navigate(['/']);
    } else {
      this.router.navigate(['/auth/login']);
    }
  }

  private hasActiveSession(): boolean {
    if (!this._user()) {
      return false;
    }

    const hasToken = this.hasValidAccessToken();
    if (!hasToken) {
      this.clearLocalSession();
      return false;
    }

    return true;
  }

  private hasValidAccessToken(): boolean {
    const access = this.tokenStorage.getAccessToken();
    if (!access) {
      return false;
    }

    const payload = this.decodeAccessTokenPayload();
    if (!payload) {
      return false;
    }

    const exp = payload['exp'];
    if (typeof exp !== 'number') {
      return false;
    }

    return exp * 1000 > Date.now();
  }

  private decodeAccessTokenPayload(): Record<string, unknown> | null {
    const access = this.tokenStorage.getAccessToken();
    if (!access) {
      return null;
    }

    try {
      const payload = access.split('.')[1];
      if (!payload) {
        return null;
      }

      return JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    } catch {
      return null;
    }
  }

  private getUserTypeFromAccessToken(): User['user_type'] | null {
    const decoded = this.decodeAccessTokenPayload();
    if (!decoded) {
      return null;
    }

    const userType = decoded['user_type'];
    if (userType === 'CLIENT' || userType === 'STUDIO' || userType === 'ADMIN') {
      return userType;
    }
    return null;
  }

  private clearLocalSession(): void {
    this.tokenStorage.clear();
    localStorage.removeItem('bl_user');
    this._user.set(null);
  }

  private saveUser(user: User): void {
    localStorage.setItem('bl_user', JSON.stringify(user));
  }

  private loadUserFromStorage(): User | null {
    try {
      if (!this.tokenStorage.getAccessToken()) {
        localStorage.removeItem('bl_user');
        return null;
      }

      const raw = localStorage.getItem('bl_user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      localStorage.removeItem('bl_user');
      return null;
    }
  }
}
