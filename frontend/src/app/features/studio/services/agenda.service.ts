import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { Appointment, AppointmentStatusPayload, CalendarBlock, CalendarBlockPayload } from '../../../core/models/quote';

@Injectable({ providedIn: 'root' })
export class AgendaService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/quotes`;

  // ── Appointments ──────────────────────────────────────────────────────────
  getAppointments(): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(`${this.baseUrl}/appointments/`);
  }

  updateStatus(id: number, payload: AppointmentStatusPayload): Observable<Appointment> {
    return this.http.patch<Appointment>(`${this.baseUrl}/appointments/${id}/status/`, payload);
  }

  // ── Calendar Blocks ───────────────────────────────────────────────────────
  getCalendarBlocks(): Observable<CalendarBlock[]> {
    return this.http.get<CalendarBlock[]>(`${this.baseUrl}/calendar-blocks/`);
  }

  createCalendarBlock(payload: CalendarBlockPayload): Observable<CalendarBlock> {
    return this.http.post<CalendarBlock>(`${this.baseUrl}/calendar-blocks/`, payload);
  }

  deleteCalendarBlock(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/calendar-blocks/${id}/`);
  }
}
