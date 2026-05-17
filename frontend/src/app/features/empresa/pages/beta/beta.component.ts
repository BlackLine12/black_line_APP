import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from '../../../../shared/components/navbar.component';
import { FooterComponent } from '../../../../shared/components/footer.component';

@Component({
  selector: 'app-beta',
  standalone: true,
  imports: [RouterLink, NavbarComponent, FooterComponent],
  templateUrl: './beta.component.html',
  styleUrl: './beta.component.scss',
})
export class BetaComponent {
  readonly openFaq = signal<number | null>(null);

  toggleFaq(index: number): void {
    this.openFaq.update(current => current === index ? null : index);
  }

  readonly faqs = signal([
    {
      q: '¿Cuándo comenzarán los cobros?',
      a: 'No hay fecha definida. Serás notificado con al menos 30 días de anticipación antes de cualquier cambio en el modelo de acceso.',
    },
    {
      q: '¿Qué pasa con mi cuenta cuando salga de beta?',
      a: 'Tus datos, portafolio, tarifas y configuración se conservan íntegramente. La transición no requiere ninguna acción de tu parte.',
    },
    {
      q: '¿Los clientes también pagan?',
      a: 'No. Los clientes finales siempre tienen acceso gratuito: cotizador, búsqueda de artistas, portafolios y solicitud de citas.',
    },
    {
      q: '¿Puedo cancelar en cualquier momento?',
      a: 'Sí. Sin contratos de permanencia ni penalizaciones. La suscripción es mes a mes.',
    },
    {
      q: '¿En qué ciudades opera BlackLine?',
      a: 'Actualmente solo en Ciudad Juárez, Chihuahua. Estamos enfocados en construir la mejor experiencia local antes de expandirnos.',
    },
  ]);

  readonly features = signal([
    {
      icon: '📅',
      title: 'Agenda inteligente',
      desc: 'Disponibilidad en tiempo real, sin conflictos de horario ni dobles reservas.',
    },
    {
      icon: '🖼️',
      title: 'Portafolio visual',
      desc: 'Galería categorizada por estilo artístico. Sube fotos con drag-and-drop.',
    },
    {
      icon: '💬',
      title: 'Cotizador automático',
      desc: 'Rangos de precio comunicados al cliente directamente, sin negociación manual.',
    },
    {
      icon: '🔍',
      title: 'Matchmaking',
      desc: 'Aparece en búsquedas filtradas por estilo, ciudad y disponibilidad.',
    },
    {
      icon: '📥',
      title: 'Bandeja de solicitudes',
      desc: 'Máquina de estados clara: Pendiente → Aceptada / Rechazada / Contraoferta.',
    },
    {
      icon: '💰',
      title: 'Gestión de tarifas',
      desc: 'Configura tu tarifa base y mínima desde tu perfil. Siempre bajo tu control.',
    },
    {
      icon: '🔔',
      title: 'Notificaciones automáticas',
      desc: 'Correo electrónico en cada cambio de estado de cita, sin esfuerzo.',
    },
    {
      icon: '📋',
      title: 'Consentimiento digital',
      desc: 'Formulario médico integrado al flujo de cita. Sin papel, sin esperas.',
    },
    {
      icon: '📊',
      title: 'Historial con filtros',
      desc: 'Todas tus solicitudes, organizadas y buscables en un solo lugar.',
    },
  ]);

  readonly stats = signal([
    { value: '83.9%', label: 'de clientes usaría BlackLine' },
    { value: '76.3%', label: 'de tatuadores con alto interés' },
    { value: '82.8%', label: 'dispuestos a suscribirse' },
    { value: '19+', label: 'estudios verificados en Juárez' },
  ]);
}
