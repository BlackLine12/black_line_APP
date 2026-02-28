import { Routes } from '@angular/router';
import { CotizadorComponent } from './cotizador.component';
import { MatchComponent } from './match.component';
import { MisCitasComponent } from './mis-citas.component';

export const CLIENT_ROUTES: Routes = [
  { path: '', redirectTo: 'cotizador', pathMatch: 'full' },
  { path: 'cotizador', component: CotizadorComponent },
  { path: 'match', component: MatchComponent },
  { path: 'mis-citas', component: MisCitasComponent },
];