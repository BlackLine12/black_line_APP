import { Component, inject, signal, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { QuoteService } from '../../../core/services/quote.service';
import { Appointment, AppointmentStatusPayload } from '../../../core/models/quote';
import { HealthConsentFormComponent } from '../../../shared/components/health-consent-form/health-consent-form.component';

@Component({
  selector: 'app-cita-detalle',
  standalone: true,
  imports: [CommonModule, HealthConsentFormComponent],
  templateUrl: './cita-detalle.component.html',
  styleUrl: './cita-detalle.component.scss',
})
export class CitaDetalleComponent implements OnInit {
  @ViewChild(HealthConsentFormComponent) consentFormRef!: HealthConsentFormComponent;

  private readonly route        = inject(ActivatedRoute);
  private readonly router       = inject(Router);
  private readonly quoteService = inject(QuoteService);

  appointment   = signal<Appointment | null>(null);
  loading       = signal(true);
  error         = signal('');
  actionLoading = signal(false);
  actionError   = signal('');
  actionSuccess  = signal('');

  // ── Cuestionario de salud ─────────────────────────────────────────────
  showConsent     = signal(false);
  consentSending  = signal(false);
  consentError    = signal('');
  consentSuccess  = signal(false);

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.quoteService.getAppointmentById(id).subscribe({
      next:  (a) => { this.appointment.set(a); this.loading.set(false); },
      error: ()  => { this.error.set('No se pudo cargar la cita.'); this.loading.set(false); },
    });
  }

  // ── Contraoferta: aceptar ─────────────────────────────────────────────
  accept(): void {
    const appt = this.appointment();
    if (!appt) return;
    this.sendStatus({ status: 'APPROVED' }, 'Contraoferta aceptada.');
  }

  // ── Contraoferta: rechazar ────────────────────────────────────────────
  reject(): void {
    this.sendStatus({ status: 'REJECTED' }, 'Cita rechazada.');
  }

  private sendStatus(payload: AppointmentStatusPayload, successMsg: string): void {
    const appt = this.appointment();
    if (!appt) return;
    this.actionLoading.set(true);
    this.actionError.set('');
    this.actionSuccess.set('');
    this.quoteService.updateAppointmentStatus(appt.id, payload).subscribe({
      next: (updated) => {
        this.appointment.set(updated);
        this.actionLoading.set(false);
        this.actionSuccess.set(successMsg);
      },
      error: (err) => {
        this.actionError.set(err.error?.detail ?? 'Error al actualizar la cita.');
        this.actionLoading.set(false);
      },
    });
  }

  // ── Cuestionario de salud ─────────────────────────────────────────────
  openConsent(): void {
    this.showConsent.set(true);
    this.consentError.set('');
    this.consentSuccess.set(false);
    this.consentFormRef?.reset();
  }

  closeConsent(): void {
    this.showConsent.set(false);
    this.consentSuccess.set(false);
  }

  submitConsent(): void {
    if (!this.consentFormRef?.isValid || this.consentSending()) {
      this.consentFormRef?.markAllTouched();
      return;
    }
    const appt = this.appointment();
    if (!appt) return;

    this.consentSending.set(true);
    this.consentError.set('');
    this.quoteService.submitHealthConsent(appt.id, this.consentFormRef.getValue()).subscribe({
      next: () => {
        this.appointment.update((a) => a ? { ...a, has_health_consent: true } : a);
        this.consentSuccess.set(true);
        this.consentSending.set(false);
        setTimeout(() => this.closeConsent(), 1500);
      },
      error: (err) => {
        this.consentError.set(err.error?.detail ?? 'Error al enviar el cuestionario.');
        this.consentSending.set(false);
      },
    });
  }

  // ── Helpers ───────────────────────────────────────────────────────────
  statusClass(status: string): string {
    const map: Record<string, string> = {
      PENDING:       'status--pending',
      APPROVED:      'status--approved',
      REJECTED:      'status--rejected',
      COUNTER_OFFER: 'status--counter',
    };
    return map[status] ?? '';
  }

  formatDate(dt: string | null): string {
    if (!dt) return '—';
    return new Date(dt).toLocaleString('es-MX', { dateStyle: 'long', timeStyle: 'short' });
  }

  back(): void {
    this.router.navigate(['/client/mis-citas']);
  }
}
