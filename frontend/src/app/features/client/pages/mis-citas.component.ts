import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { QuoteService } from '../../../core/services/quote.service';
import { Appointment, AppointmentStatusPayload, HealthConsentPayload } from '../../../core/models/quote';

@Component({
  selector: 'app-mis-citas',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './mis-citas.component.html',
  styleUrl: './mis-citas.component.scss',
})
export class MisCitasComponent implements OnInit {
  private readonly quoteService = inject(QuoteService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  appointments = signal<Appointment[]>([]);
  loading = signal(true);
  error = signal('');
  actionError = signal('');
  actionLoading = signal<number | null>(null);

  // ── Health consent modal ───────────────────────────────────────────────────
  consentAppointmentId = signal<number | null>(null);
  consentSubmitting = signal(false);
  consentError = signal('');
  consentSuccess = signal(false);

  consentForm: FormGroup = this.fb.group({
    has_allergies: [false],
    allergies_detail: [''],
    has_chronic_disease: [false],
    chronic_disease_detail: [''],
    takes_medication: [false],
    medication_detail: [''],
    is_pregnant: [false],
    has_skin_condition: [false],
    skin_condition_detail: [''],
    terms_accepted: [false, Validators.requiredTrue],
  });

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

  rejectCounterOffer(appt: Appointment): void {
    this.actionLoading.set(appt.id);
    this.actionError.set('');
    const payload: AppointmentStatusPayload = { status: 'REJECTED' };
    this.quoteService.updateAppointmentStatus(appt.id, payload).subscribe({
      next: (updated) => {
        this.appointments.update((list) =>
          list.map((a) => (a.id === updated.id ? updated : a))
        );
        this.actionLoading.set(null);
      },
      error: (err) => {
        this.actionError.set(err.error?.detail ?? 'Error al rechazar la contraoferta.');
        this.actionLoading.set(null);
      },
    });
  }

  // ── Health consent modal ───────────────────────────────────────────────────

  openConsentModal(appt: Appointment): void {
    this.consentAppointmentId.set(appt.id);
    this.consentError.set('');
    this.consentSuccess.set(false);
    this.consentForm.reset({
      has_allergies: false,
      allergies_detail: '',
      has_chronic_disease: false,
      chronic_disease_detail: '',
      takes_medication: false,
      medication_detail: '',
      is_pregnant: false,
      has_skin_condition: false,
      skin_condition_detail: '',
      terms_accepted: false,
    });
  }

  closeConsentModal(): void {
    this.consentAppointmentId.set(null);
    this.consentSuccess.set(false);
  }

  submitConsent(): void {
    if (this.consentForm.invalid || this.consentSubmitting()) return;
    const apptId = this.consentAppointmentId();
    if (!apptId) return;

    this.consentSubmitting.set(true);
    this.consentError.set('');
    const payload: HealthConsentPayload = this.consentForm.value;

    this.quoteService.submitHealthConsent(apptId, payload).subscribe({
      next: () => {
        this.appointments.update((list) =>
          list.map((a) => (a.id === apptId ? { ...a, has_health_consent: true } : a))
        );
        this.consentSuccess.set(true);
        this.consentSubmitting.set(false);
        setTimeout(() => this.closeConsentModal(), 1500);
      },
      error: (err) => {
        this.consentError.set(err.error?.detail ?? 'Error al enviar el cuestionario.');
        this.consentSubmitting.set(false);
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
