import { Routes } from '@angular/router';
import { ClientDashboardComponent } from './dashboard.component';
import { CotizadorComponent }       from './cotizador.component';
import { MatchComponent }           from './match.component';
import { MisCitasComponent }        from './mis-citas.component';

export const CLIENT_ROUTES: Routes = [
  { path: '',          redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: ClientDashboardComponent },
  { path: 'cotizador', component: CotizadorComponent },
  { path: 'match',     component: MatchComponent },
  { path: 'mis-citas', component: MisCitasComponent },
];