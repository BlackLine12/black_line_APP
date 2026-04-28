import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AgendaService } from '../services/agenda.service';
import { Appointment, CalendarBlock } from '../../../core/models/quote';

type AppointmentFilter = 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'COUNTER_OFFER';

@Component({
  selector: 'app-agenda',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DatePipe],
  templateUrl: './agenda.component.html',
  styleUrl: './agenda.component.scss',
})
export class AgendaComponent implements OnInit {
  private readonly agendaService = inject(AgendaService);
  private readonly fb = inject(FormBuilder);

  appointments: Appointment[] = [];
  calendarBlocks: CalendarBlock[] = [];

  filter: AppointmentFilter = 'ALL';
  loadingAppointments = true;
  loadingBlocks = true;

  counterOfferForId: number | null = null;
  counterOfferForm!: FormGroup;

  blockForm!: FormGroup;
  creatingBlock = false;
  showBlockForm = false;

  appointmentMessage = '';
  appointmentSuccess = false;
  blockMessage = '';
  blockSuccess = false;

  readonly filters: { value: AppointmentFilter; label: string }[] = [
    { value: 'ALL', label: 'Todas' },
    { value: 'PENDING', label: 'Pendientes' },
    { value: 'APPROVED', label: 'Aprobadas' },
    { value: 'COUNTER_OFFER', label: 'Contraofertas' },
    { value: 'REJECTED', label: 'Rechazadas' },
  ];

  get filteredAppointments(): Appointment[] {
    if (this.filter === 'ALL') return this.appointments;
    return this.appointments.filter((a) => a.status === this.filter);
  }

  get pendingCount(): number {
    return this.appointments.filter((a) => a.status === 'PENDING').length;
  }

  get approvedCount(): number {
    return this.appointments.filter((a) => a.status === 'APPROVED').length;
  }

  ngOnInit(): void {
    this.counterOfferForm = this.fb.group({
      counter_offer_datetime: ['', Validators.required],
      counter_offer_note: ['', Validators.maxLength(500)],
    });

    this.blockForm = this.fb.group({
      start_datetime: ['', Validators.required],
      end_datetime: ['', Validators.required],
      reason: ['', Validators.maxLength(255)],
    });

    this.loadAppointments();
    this.loadCalendarBlocks();
  }

  private loadAppointments(): void {
    this.loadingAppointments = true;
    this.agendaService.getAppointments().subscribe({
      next: (appts) => {
        this.appointments = appts;
        this.loadingAppointments = false;
      },
      error: () => {
        this.loadingAppointments = false;
        this.setApptStatus('No se pudieron cargar las citas.', false);
      },
    });
  }

  private loadCalendarBlocks(): void {
    this.loadingBlocks = true;
    this.agendaService.getCalendarBlocks().subscribe({
      next: (blocks) => {
        this.calendarBlocks = blocks;
        this.loadingBlocks = false;
      },
      error: () => {
        this.loadingBlocks = false;
      },
    });
  }

  approveAppointment(id: number): void {
    this.agendaService.updateStatus(id, { status: 'APPROVED' }).subscribe({
      next: (updated) => this.replaceAppointment(updated),
      error: () => this.setApptStatus('No se pudo aprobar la cita.', false),
    });
  }

  rejectAppointment(id: number): void {
    this.agendaService.updateStatus(id, { status: 'REJECTED' }).subscribe({
      next: (updated) => this.replaceAppointment(updated),
      error: () => this.setApptStatus('No se pudo rechazar la cita.', false),
    });
  }

  openCounterOffer(id: number): void {
    this.counterOfferForId = id;
    this.counterOfferForm.reset();
  }

  cancelCounterOffer(): void {
    this.counterOfferForId = null;
    this.counterOfferForm.reset();
  }

  submitCounterOffer(id: number): void {
    if (this.counterOfferForm.invalid) return;
    const { counter_offer_datetime, counter_offer_note } = this.counterOfferForm.value;
    this.agendaService.updateStatus(id, {
      status: 'COUNTER_OFFER',
      counter_offer_datetime,
      counter_offer_note: counter_offer_note || '',
    }).subscribe({
      next: (updated) => {
        this.replaceAppointment(updated);
        this.counterOfferForId = null;
        this.setApptStatus('Contraoferta enviada.', true);
      },
      error: () => this.setApptStatus('No se pudo enviar la contraoferta.', false),
    });
  }

  private replaceAppointment(updated: Appointment): void {
    this.appointments = this.appointments.map((a) => (a.id === updated.id ? updated : a));
  }

  toggleBlockForm(): void {
    this.showBlockForm = !this.showBlockForm;
    if (!this.showBlockForm) this.blockForm.reset();
  }

  submitBlock(): void {
    if (this.blockForm.invalid || this.creatingBlock) return;
    this.creatingBlock = true;
    this.agendaService.createCalendarBlock(this.blockForm.value).subscribe({
      next: (block) => {
        this.calendarBlocks = [...this.calendarBlocks, block];
        this.blockForm.reset();
        this.showBlockForm = false;
        this.creatingBlock = false;
        this.setBlockStatus('Bloqueo creado.', true);
      },
      error: () => {
        this.creatingBlock = false;
        this.setBlockStatus('No se pudo crear el bloqueo.', false);
      },
    });
  }

  deleteBlock(id: number): void {
    this.agendaService.deleteCalendarBlock(id).subscribe({
      next: () => {
        this.calendarBlocks = this.calendarBlocks.filter((b) => b.id !== id);
        this.setBlockStatus('Bloqueo eliminado.', true);
      },
      error: () => this.setBlockStatus('No se pudo eliminar el bloqueo.', false),
    });
  }

  private setApptStatus(msg: string, success: boolean): void {
    this.appointmentMessage = msg;
    this.appointmentSuccess = success;
    setTimeout(() => (this.appointmentMessage = ''), 3500);
  }

  private setBlockStatus(msg: string, success: boolean): void {
    this.blockMessage = msg;
    this.blockSuccess = success;
    setTimeout(() => (this.blockMessage = ''), 3500);
  }

  statusLabel(status: string): string {
    const map: Record<string, string> = {
      PENDING: 'Pendiente',
      APPROVED: 'Aprobada',
      REJECTED: 'Rechazada',
      COUNTER_OFFER: 'Contraoferta',
    };
    return map[status] ?? status;
  }
}
