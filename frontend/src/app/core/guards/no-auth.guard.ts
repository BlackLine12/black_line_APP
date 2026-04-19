import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

/**
 * Guard para rutas públicas (landing, login, register).
 * Si el usuario ya tiene sesión activa, lo redirige a su panel
 * según su rol en lugar de mostrar la página pública.
 */
export const noAuthGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router      = inject(Router);

  authService.syncSessionState();

  if (authService.isAuthenticated()) {
    authService.redirectByRole();
    return false;
  }

  return true;
};
