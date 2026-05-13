import { Routes } from '@angular/router';
import { AdminDashboardComponent } from './admin-dashboard.component';
import { AdminStylesComponent }    from './admin-styles.component';
import { AdminUsersComponent }     from './admin-users.component';

export const ADMIN_ROUTES: Routes = [
  { path: '',        redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: AdminDashboardComponent },
  { path: 'estilos',   component: AdminStylesComponent },
  { path: 'usuarios',  component: AdminUsersComponent },
];
