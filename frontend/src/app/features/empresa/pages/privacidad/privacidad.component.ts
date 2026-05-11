import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from '../../../../shared/components/navbar.component';
import { FooterComponent } from '../../../../shared/components/footer.component';

interface Seccion {
  id: string;
  numero: string;
  titulo: string;
}

@Component({
  selector: 'app-privacidad',
  standalone: true,
  imports: [RouterLink, NavbarComponent, FooterComponent],
  templateUrl: './privacidad.component.html',
  styleUrl: './privacidad.component.scss',
})
export class PrivacidadComponent {
  readonly ultimaActualizacion = 'Mayo 2025';

  readonly secciones = signal<Seccion[]>([
    { id: 'responsable',   numero: '§1',  titulo: 'Responsable del tratamiento' },
    { id: 'datos',         numero: '§2',  titulo: 'Datos que recopilamos' },
    { id: 'finalidad',     numero: '§3',  titulo: 'Finalidad del tratamiento' },
    { id: 'sensibles',     numero: '§4',  titulo: 'Datos sensibles' },
    { id: 'transferencia', numero: '§5',  titulo: 'Transferencia de datos' },
    { id: 'arco',          numero: '§6',  titulo: 'Derechos ARCO' },
    { id: 'cookies',       numero: '§7',  titulo: 'Cookies y rastreo' },
    { id: 'retencion',     numero: '§8',  titulo: 'Retención de datos' },
    { id: 'seguridad',     numero: '§9',  titulo: 'Seguridad' },
    { id: 'cambios',       numero: '§10', titulo: 'Cambios a esta política' },
  ]);

  scrollTo(id: string): void {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}
