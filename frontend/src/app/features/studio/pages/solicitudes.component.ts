import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AgendaService } from '../services/agenda.service';
import { Appointment } from '../../../core/models/quote';

type StatusFilter = 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'COUNTER_OFFER';

@Component({
  selector: 'app-solicitudes',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DatePipe, CurrencyPipe],
  templateUrl: './solicitudes.component.html',
  styleUrl: './solicitudes.component.scss',
})
export class SolicitudesComponent implements OnInit {
  private readonly agendaService = inject(AgendaService);
  private readonly fb = inject(FormBuilder);

  appointments: Appointment[] = [];
  loading = true;
  activeFilter: StatusFilter = 'ALL';
  counterOfferForId: number | null = null;
  counterOfferForm!: FormGroup;
  actionMessages: Map<number, { text: string; success: boolean }> = new Map();

  readonly filters: { value: StatusFilter; label: string }[] = [
    { value: 'ALL',           label: 'Todas'         },
    { value: 'PENDING',       label: 'Pendientes'    },
    { value: 'COUNTER_OFFER', label: 'Contraofertas' },
    { value: 'APPROVED',      label: 'Aprobadas'     },
    { value: 'REJECTED',      label: 'Rechazadas'    },
  ];

  get filteredAppointments(): Appointment[] {
    const sorted = [...this.appointments].sort((a, b) => {
      const order: Record<string, number> = { PENDING: 0, COUNTER_OFFER: 1, APPROVED: 2, REJECTED: 3 };
      return (order[a.status] ?? 4) - (order[b.status] ?? 4);
    });
    if (this.activeFilter === 'ALL') return sorted;
    return sorted.filter(a => a.status === this.activeFilter);
  }

  get pendingCount(): number {
    return this.appointments.filter(a => a.status === 'PENDING').length;
  }

  get approvedCount(): number {
    return this.appointments.filter(a => a.status === 'APPROVED').length;
  }

  get counterOfferCount(): number {
    return this.appointments.filter(a => a.status === 'COUNTER_OFFER').length;
  }

  ngOnInit(): void {
    this.counterOfferForm = this.fb.group({
      counter_offer_datetime: ['', Validators.required],
      counter_offer_note: ['', Validators.maxLength(500)],
    });
    this.loadAppointments();
  }

  private loadAppointments(): void {
    this.loading = true;
    this.agendaService.getAppointments().subscribe({
      next: appts => {
        this.appointments = appts;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  approve(id: number): void {
    this.agendaService.updateStatus(id, { status: 'APPROVED' }).subscribe({
      next: updated => this.replaceAndNotify(updated, 'Cita aprobada.', true),
      error: ()      => this.setMessage(id, 'No se pudo aprobar la cita.', false),
    });
  }

  reject(id: number): void {
    this.agendaService.updateStatus(id, { status: 'REJECTED' }).subscribe({
      next: updated => this.replaceAndNotify(updated, 'Cita rechazada.', true),
      error: ()      => this.setMessage(id, 'No se pudo rechazar la cita.', false),
    });
  }

  openCounterOffer(id: number): void {
    this.counterOfferForId = id;
    this.counterOfferForm.reset();
  }

  cancelCounterOffer(): void {
    this.counterOfferForId = null;
  }

  submitCounterOffer(id: number): void {
    if (this.counterOfferForm.invalid) return;
    const { counter_offer_datetime, counter_offer_note } = this.counterOfferForm.value;
    this.agendaService.updateStatus(id, {
      status: 'COUNTER_OFFER',
      counter_offer_datetime,
      counter_offer_note: counter_offer_note ?? '',
    }).subscribe({
      next: updated => {
        this.counterOfferForId = null;
        this.replaceAndNotify(updated, 'Contraoferta enviada.', true);
      },
      error: () => this.setMessage(id, 'No se pudo enviar la contraoferta.', false),
    });
  }

  statusLabel(status: string): string {
    const map: Record<string, string> = {
      PENDING:       'Pendiente',
      APPROVED:      'Aprobada',
      REJECTED:      'Rechazada',
      COUNTER_OFFER: 'Contraoferta enviada',
    };
    return map[status] ?? status;
  }

  private replaceAndNotify(updated: Appointment, text: string, success: boolean): void {
    this.appointments = this.appointments.map(a => a.id === updated.id ? updated : a);
    this.setMessage(updated.id, text, success);
  }

  private setMessage(id: number, text: string, success: boolean): void {
    this.actionMessages.set(id, { text, success });
    setTimeout(() => this.actionMessages.delete(id), 3500);
  }
}
