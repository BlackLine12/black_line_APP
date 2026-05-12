import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from '../../../../shared/components/navbar.component';
import { FooterComponent } from '../../../../shared/components/footer.component';

interface CookieRow {
  nombre: string;
  tipo: string;
  proposito: string;
  duracion: string;
}

interface TipoCookie {
  icono: string;
  nombre: string;
  descripcion: string;
}

interface Navegador {
  nombre: string;
  instruccion: string;
}

@Component({
  selector: 'app-cookies',
  standalone: true,
  imports: [RouterLink, NavbarComponent, FooterComponent],
  templateUrl: './cookies.component.html',
  styleUrl: './cookies.component.scss',
})
export class CookiesComponent {
  readonly ultimaActualizacion = 'Mayo 2026';

  readonly cookiesUsadas = signal<CookieRow[]>([
    {
      nombre: 'access_token',
      tipo: 'SessionStorage',
      proposito: 'Autenticación JWT — mantiene la sesión activa del usuario',
      duracion: 'Duración de la sesión',
    },
    {
      nombre: 'refresh_token',
      tipo: 'SessionStorage',
      proposito: 'Renovación del token de acceso sin requerir inicio de sesión',
      duracion: 'Duración de la sesión',
    },
    {
      nombre: 'last_quote',
      tipo: 'SessionStorage',
      proposito: 'Guarda la cotización en progreso para restaurarla si el usuario navega',
      duracion: 'Duración de la sesión',
    },
  ]);

  readonly tipos = signal<TipoCookie[]>([
    {
      icono: '◈',
      nombre: 'Esenciales',
      descripcion: 'Necesarias para el funcionamiento básico de la plataforma. Sin ellas no es posible iniciar sesión ni completar una cotización. No pueden desactivarse.',
    },
    {
      icono: '◇',
      nombre: 'Funcionales',
      descripcion: 'Recuerdan preferencias del usuario (como el estado de una cotización en curso) para mejorar la experiencia dentro de la misma sesión.',
    },
    {
      icono: '○',
      nombre: 'Analíticas',
      descripcion: 'Actualmente no utilizamos cookies analíticas. En el futuro podríamos incorporar métricas de uso anónimas para mejorar el servicio, previa actualización de esta política.',
    },
  ]);

  readonly navegadores = signal<Navegador[]>([
    {
      nombre: 'Chrome',
      instruccion: 'Ajustes → Privacidad y seguridad → Cookies y otros datos de sitios',
    },
    {
      nombre: 'Firefox',
      instruccion: 'Opciones → Privacidad y seguridad → Cookies y datos del sitio',
    },
    {
      nombre: 'Safari',
      instruccion: 'Preferencias → Privacidad → Gestionar datos del sitio web',
    },
    {
      nombre: 'Edge',
      instruccion: 'Configuración → Cookies y permisos del sitio → Administrar y eliminar cookies',
    },
  ]);
}
