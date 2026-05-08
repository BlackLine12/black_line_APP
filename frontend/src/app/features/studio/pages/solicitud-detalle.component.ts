import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AgendaService } from '../services/agenda.service';
import { Appointment, AppointmentStatusPayload } from '../../../core/models/quote';

@Component({
  selector: 'app-solicitud-detalle',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DatePipe],
  templateUrl: './solicitud-detalle.component.html',
  styleUrl: './solicitud-detalle.component.scss',
})
export class SolicitudDetalleComponent implements OnInit {
  private readonly route         = inject(ActivatedRoute);
  private readonly router        = inject(Router);
  private readonly agendaService = inject(AgendaService);
  private readonly fb            = inject(FormBuilder);

  appointment    = signal<Appointment | null>(null);
  loading        = signal(true);
  error          = signal('');
  actionLoading  = signal(false);
  actionSuccess  = signal('');
  actionError    = signal('');
  showOfferForm  = signal(false);

  counterOfferForm!: FormGroup;

  ngOnInit(): void {
    this.counterOfferForm = this.fb.group({
      counter_offer_datetime: ['', Validators.required],
      counter_offer_note:     ['', Validators.maxLength(500)],
    });

    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.agendaService.getAppointmentById(id).subscribe({
      next:  (a) => { this.appointment.set(a); this.loading.set(false); },
      error: ()  => { this.error.set('No se pudo cargar la solicitud.'); this.loading.set(false); },
    });
  }

  // ── Acciones ──────────────────────────────────────────────────────────
  approve(): void {
    this.sendStatus({ status: 'APPROVED' }, 'Cita aprobada correctamente.');
  }

  reject(): void {
    this.sendStatus({ status: 'REJECTED' }, 'Cita rechazada.');
  }

  openCounterOffer(): void {
    this.showOfferForm.set(true);
    this.counterOfferForm.reset();
  }

  cancelCounterOffer(): void {
    this.showOfferForm.set(false);
  }

  submitCounterOffer(): void {
    if (this.counterOfferForm.invalid) return;
    const { counter_offer_datetime, counter_offer_note } = this.counterOfferForm.value;
    this.sendStatus(
      { status: 'COUNTER_OFFER', counter_offer_datetime, counter_offer_note: counter_offer_note ?? '' },
      'Contraoferta enviada al cliente.'
    );
    this.showOfferForm.set(false);
  }

  private sendStatus(payload: AppointmentStatusPayload, successMsg: string): void {
    const appt = this.appointment();
    if (!appt) return;
    this.actionLoading.set(true);
    this.actionError.set('');
    this.actionSuccess.set('');
    this.agendaService.updateStatus(appt.id, payload).subscribe({
      next: (updated) => {
        this.appointment.set(updated);
        this.actionLoading.set(false);
        this.actionSuccess.set(successMsg);
      },
      error: (err) => {
        this.actionError.set(err.error?.detail ?? 'Error al actualizar la solicitud.');
        this.actionLoading.set(false);
      },
    });
  }

  // ── Helpers ───────────────────────────────────────────────────────────
  statusLabel(status: string): string {
    const map: Record<string, string> = {
      PENDING:       'Pendiente',
      APPROVED:      'Aprobada',
      REJECTED:      'Rechazada',
      COUNTER_OFFER: 'Contraoferta enviada',
    };
    return map[status] ?? status;
  }

  back(): void {
    this.router.navigate(['/studio/solicitudes']);
  }
}
