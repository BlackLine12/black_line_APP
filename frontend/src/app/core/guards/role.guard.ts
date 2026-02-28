import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export function roleGuard(...allowedRoles: string[]): CanActivateFn {
  return (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);
    const userType = authService.userType();

    if (userType && allowedRoles.includes(userType)) {
      return true;
    }

    router.navigate(['/auth/login']);
    return false;
  };
}
