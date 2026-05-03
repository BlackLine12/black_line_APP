import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { QuoteService } from '../../../core/services/quote.service';
import { Appointment } from '../../../core/models/quote';

@Component({
  selector: 'app-client-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl:    './dashboard.component.scss',
})
export class ClientDashboardComponent implements OnInit {
  private readonly authService  = inject(AuthService);
  private readonly quoteService = inject(QuoteService);
  private readonly router       = inject(Router);

  // ── Estado ────────────────────────────────────────────────────────────────
  appointments = signal<Appointment[]>([]);
  loading      = signal(true);
  error        = signal('');

  // ── Datos derivados del usuario ───────────────────────────────────────────
  readonly user = this.authService.user;

  readonly firstName = computed(() => {
    const u = this.user();
    if (!u) return 'Cliente';
    return u.first_name ? u.first_name : u.username;
  });

  readonly greeting = computed(() => {
    const h = new Date().getHours();
    if (h < 12) return 'Buenos días';
    if (h < 19) return 'Buenas tardes';
    return 'Buenas noches';
  });

  // ── Stats calculados ──────────────────────────────────────────────────────
  readonly totalAppointments = computed(() => this.appointments().length);

  readonly pendingCount = computed(() =>
    this.appointments().filter(a => a.status === 'PENDING').length
  );

  readonly approvedCount = computed(() =>
    this.appointments().filter(a => a.status === 'APPROVED').length
  );

  readonly counterOfferCount = computed(() =>
    this.appointments().filter(a => a.status === 'COUNTER_OFFER').length
  );

  /** Las 3 citas más recientes para la vista rápida */
  readonly recentAppointments = computed(() =>
    [...this.appointments()]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 3)
  );

  /** Próxima cita futura aprobada */
  readonly nextAppointment = computed(() => {
    const now = Date.now();
    return this.appointments()
      .filter(a => a.status === 'APPROVED' && new Date(a.scheduled_at).getTime() > now)
      .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime())[0] ?? null;
  });

  // ─────────────────────────────────────────────────────────────────────────
  ngOnInit(): void {
    this.quoteService.getAppointments().subscribe({
      next:  (data) => { this.appointments.set(data); this.loading.set(false); },
      error: ()     => { this.error.set('No se pudieron cargar los datos.'); this.loading.set(false); },
    });
  }

  // ── Helpers ───────────────────────────────────────────────────────────────
  statusLabel(status: Appointment['status']): string {
    const map: Record<Appointment['status'], string> = {
      PENDING:      'Pendiente',
      APPROVED:     'Aprobada',
      REJECTED:     'Rechazada',
      COUNTER_OFFER:'Contraoferta',
    };
    return map[status] ?? status;
  }

  statusMod(status: Appointment['status']): string {
    const map: Record<Appointment['status'], string> = {
      PENDING:      'pending',
      APPROVED:     'approved',
      REJECTED:     'rejected',
      COUNTER_OFFER:'counter',
    };
    return map[status] ?? '';
  }

  formatDate(dt: string): string {
    return new Date(dt).toLocaleString('es-MX', { dateStyle: 'medium', timeStyle: 'short' });
  }

  formatRelative(dt: string): string {
    const diff = new Date(dt).getTime() - Date.now();
    const days = Math.ceil(diff / 86_400_000);
    if (days < 0)  return 'Ya pasó';
    if (days === 0) return 'Hoy';
    if (days === 1) return 'Mañana';
    return `En ${days} días`;
  }

  goToCotizador(): void      { this.router.navigate(['/client/cotizador']); }
  goToMisCitas(): void       { this.router.navigate(['/client/mis-citas']); }
  goToCotizaciones(): void   { this.router.navigate(['/client/cotizaciones']); }
}
