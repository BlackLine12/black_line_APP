import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { User } from '../models/user';

export function roleGuard(...allowedRoles: User['user_type'][]): CanActivateFn {
  return (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);
    const userType = authService.userType();

    // ADMIN puede acceder a todos los módulos
    if (userType === 'ADMIN') {
      return true;
    }

    if (userType && allowedRoles.includes(userType)) {
      return true;
    }

    // User is authenticated but wrong role — redirect to their dashboard
    if (userType === 'STUDIO') {
      router.navigate(['/studio/dashboard']);
    } else {
      router.navigate(['/client/cotizador']);
    }
    return false;
  };
}
