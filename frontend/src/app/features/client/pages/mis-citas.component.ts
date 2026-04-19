import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { QuoteService } from '../../../core/services/quote.service';
import { Appointment, AppointmentStatusPayload } from '../../../core/models/quote';

@Component({
  selector: 'app-mis-citas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mis-citas.component.html',
  styleUrl: './mis-citas.component.scss',
})
export class MisCitasComponent implements OnInit {
  private readonly quoteService = inject(QuoteService);
  private readonly router = inject(Router);

  appointments = signal<Appointment[]>([]);
  loading = signal(true);
  error = signal('');
  actionError = signal('');
  actionLoading = signal<number | null>(null);

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.quoteService.getAppointments().subscribe({
      next: (data) => {
        this.appointments.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar tus citas.');
        this.loading.set(false);
      },
    });
  }

  acceptCounterOffer(appt: Appointment): void {
    this.actionLoading.set(appt.id);
    this.actionError.set('');
    const payload: AppointmentStatusPayload = { status: 'APPROVED' };
    this.quoteService.updateAppointmentStatus(appt.id, payload).subscribe({
      next: (updated) => {
        this.appointments.update((list) =>
          list.map((a) => (a.id === updated.id ? updated : a))
        );
        this.actionLoading.set(null);
      },
      error: (err) => {
        this.actionError.set(err.error?.detail ?? 'Error al aceptar la contraoferta.');
        this.actionLoading.set(null);
      },
    });
  }

  goToCotizador(): void {
    this.router.navigate(['/client/cotizador']);
  }

  statusClass(status: string): string {
    const map: Record<string, string> = {
      PENDING: 'status--pending',
      APPROVED: 'status--approved',
      REJECTED: 'status--rejected',
      COUNTER_OFFER: 'status--counter',
    };
    return map[status] ?? '';
  }

  formatDate(dt: string): string {
    return new Date(dt).toLocaleString('es-MX', {
      dateStyle: 'long',
      timeStyle: 'short',
    });
  }
}
