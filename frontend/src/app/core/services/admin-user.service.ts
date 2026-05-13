import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';

export interface AdminResetPasswordResponse {
  message: string;
  user_id: number;
}

@Injectable({ providedIn: 'root' })
export class AdminUserService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/auth/admin/users`;

  resetPassword(userId: number, newPassword: string, newPasswordConfirm: string): Observable<AdminResetPasswordResponse> {
    return this.http.post<AdminResetPasswordResponse>(
      `${this.baseUrl}/${userId}/reset-password/`,
      {
        new_password: newPassword,
        new_password_confirm: newPasswordConfirm,
      }
    );
  }
}
