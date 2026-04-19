import { Routes } from '@angular/router';
import { authGuard }   from './core/guards/auth.guard';
import { noAuthGuard } from './core/guards/no-auth.guard';
import { roleGuard }   from './core/guards/role.guard';
import { LandingComponent } from './features/landing/landing.component';
import { LayoutComponent }  from './shared/layout/layout.component';

export const routes: Routes = [
  // ── Pública: redirige al panel si ya hay sesión ────────
  {
    path: '',
    component: LandingComponent,
    canActivate: [noAuthGuard],
  },
  {
    path: 'auth',
    loadChildren: () =>
      import('./features/auth/pages/auth.routes').then(m => m.AUTH_ROUTES),
  },

  // ── Autenticadas (navbar + footer) ────────────────────
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'client',
        canActivate: [roleGuard('CLIENT')],
        loadChildren: () =>
          import('./features/client/pages/client.routes').then(m => m.CLIENT_ROUTES),
      },
      {
        path: 'studio',
        canActivate: [roleGuard('STUDIO')],
        loadChildren: () =>
          import('./features/studio/pages/studio.routes').then(m => m.STUDIO_ROUTES),
      },
    ],
  },

  // ── Fallback ───────────────────────────────────────────
  { path: '**', redirectTo: '' },
];