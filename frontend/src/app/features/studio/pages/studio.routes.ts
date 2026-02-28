import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard.component';
import { AgendaComponent } from './agenda.component';
import { PortafolioComponent } from './portafolio.component';

export const STUDIO_ROUTES: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'agenda', component: AgendaComponent },
  { path: 'portafolio', component: PortafolioComponent },
];