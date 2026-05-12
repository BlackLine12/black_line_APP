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
  selector: 'app-terminos',
  standalone: true,
  imports: [RouterLink, NavbarComponent, FooterComponent],
  templateUrl: './terminos.component.html',
  styleUrl: './terminos.component.scss',
})
export class TerminosComponent {
  readonly ultimaActualizacion = 'Mayo 2025';

  readonly secciones = signal<Seccion[]>([
    { id: 'aceptacion',      numero: '§1',  titulo: 'Aceptación de los términos' },
    { id: 'servicio',        numero: '§2',  titulo: 'Descripción del servicio' },
    { id: 'registro',        numero: '§3',  titulo: 'Registro y cuenta de usuario' },
    { id: 'roles',           numero: '§4',  titulo: 'Roles de usuario' },
    { id: 'citas',           numero: '§5',  titulo: 'Citas y cotizaciones' },
    { id: 'contenido',       numero: '§6',  titulo: 'Contenido del usuario' },
    { id: 'conducta',        numero: '§7',  titulo: 'Conducta prohibida' },
    { id: 'responsabilidad', numero: '§8',  titulo: 'Limitación de responsabilidad' },
    { id: 'modificaciones',  numero: '§9',  titulo: 'Modificaciones' },
    { id: 'legislacion',     numero: '§10', titulo: 'Legislación aplicable' },
  ]);

  scrollTo(id: string): void {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}
