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
  readonly isAuthenticated = computed(() => !!this._user());
  readonly userType = computed(() => this._user()?.user_type ?? null);

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
    this.tokenStorage.clear();
    localStorage.removeItem('bl_user');
    this._user.set(null);
    this.router.navigate(['/auth/login']);
  }

  // ── Helpers ────────────────────────────────────────────────
  redirectByRole(): void {
    const type = this._user()?.user_type;
    if (type === 'STUDIO') {
      this.router.navigate(['/studio/dashboard']);
    } else if (type === 'CLIENT') {
      this.router.navigate(['/client/cotizador']);
    } else {
      // ADMIN no tiene SPA — gestiona vía Django Admin (/admin/)
      this.router.navigate(['/']);
    }
  }

  private saveUser(user: User): void {
    localStorage.setItem('bl_user', JSON.stringify(user));
  }

  private loadUserFromStorage(): User | null {
    try {
      const raw = localStorage.getItem('bl_user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      localStorage.removeItem('bl_user');
      return null;
    }
  }
}
