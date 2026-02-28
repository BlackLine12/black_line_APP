import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/auth/login', pathMatch: 'full' },
  {
    path: 'auth',
    loadChildren: () =>
      import('./features/auth/pages/auth.routes').then(m => m.AUTH_ROUTES)
  },
  {
    path: 'client',
    canActivate: [authGuard, roleGuard('CLIENT')],
    loadChildren: () =>
      import('./features/client/pages/client.routes').then(m => m.CLIENT_ROUTES)
  },
  {
    path: 'studio',
    canActivate: [authGuard, roleGuard('STUDIO')],
    loadChildren: () =>
      import('./features/studio/pages/studio.routes').then(m => m.STUDIO_ROUTES)
  },
  { path: '**', redirectTo: '/auth/login' }
];