import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { LandingComponent }   from './features/landing/landing.component';
import { LayoutComponent }    from './shared/layout/layout.component';
import { NotFoundComponent }  from './features/errors/not-found.component';
import { ForbiddenComponent } from './features/errors/forbidden.component';

export const routes: Routes = [
  // ── Landing: accesible a guest y usuarios autenticados ──
  {
    path: '',
    component: LandingComponent,
  },
  {
    path: 'auth',
    loadChildren: () =>
      import('./features/auth/pages/auth.routes').then(m => m.AUTH_ROUTES),
  },

  // ── Páginas públicas de empresa ───────────────────────
  {
    path: 'sobre-nosotros',
    loadComponent: () =>
      import('./features/empresa/pages/sobre-nosotros/sobre-nosotros.component').then(
        m => m.SobreNosotrosComponent
      ),
  },
  {
    path: 'contacto',
    loadComponent: () =>
      import('./features/empresa/pages/contacto/contacto.component').then(
        m => m.ContactoComponent
      ),
  },
  {
    path: 'terminos',
    loadComponent: () =>
      import('./features/empresa/pages/terminos/terminos.component').then(
        m => m.TerminosComponent
      ),
  },
  {
    path: 'privacidad',
    loadComponent: () =>
      import('./features/empresa/pages/privacidad/privacidad.component').then(
        m => m.PrivacidadComponent
      ),
  },
  {
    path: 'cookies',
    loadComponent: () =>
      import('./features/empresa/pages/cookies/cookies.component').then(
        m => m.CookiesComponent
      ),
  },
  {
    path: 'beta',
    loadComponent: () =>
      import('./features/empresa/pages/beta/beta.component').then(
        m => m.BetaComponent
      ),
  },

  // ── Páginas de error ───────────────────────────────────
  { path: '403', component: ForbiddenComponent },
  { path: '404', component: NotFoundComponent  },

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
      {
        path: 'admin',
        canActivate: [roleGuard('ADMIN')],
        loadChildren: () =>
          import('./features/admin/pages/admin.routes').then(m => m.ADMIN_ROUTES),
      },
    ],
  },

  // ── Fallback ───────────────────────────────────────────
  { path: '**', component: NotFoundComponent },
];