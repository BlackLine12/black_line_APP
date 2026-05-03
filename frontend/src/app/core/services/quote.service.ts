import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import {
  QuoteRequestPayload,
  QuoteRequestResponse,
  MatchSearchParams,
  MatchResponse,
  AppointmentCreatePayload,
  AppointmentStatusPayload,
  Appointment,
  HealthConsentPayload,
} from '../models/quote';

@Injectable({ providedIn: 'root' })
export class QuoteService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/quotes`;

  private readonly QUOTE_KEY = 'bl_last_quote';

  /** Estado compartido entre Cotizador → Match; se restaura desde sessionStorage al iniciar */
  lastQuote = signal<QuoteRequestResponse | null>(this.restoreQuote());

  private restoreQuote(): QuoteRequestResponse | null {
    try {
      const raw = sessionStorage.getItem(this.QUOTE_KEY);
      return raw ? (JSON.parse(raw) as QuoteRequestResponse) : null;
    } catch {
      return null;
    }
  }

  /** Actualiza lastQuote y sincroniza con sessionStorage */
  setLastQuote(quote: QuoteRequestResponse | null): void {
    this.lastQuote.set(quote);
    if (quote) {
      sessionStorage.setItem(this.QUOTE_KEY, JSON.stringify(quote));
    } else {
      sessionStorage.removeItem(this.QUOTE_KEY);
    }
  }

  /** RF-1: Crear solicitud de cotización */
  createQuote(payload: QuoteRequestPayload): Observable<QuoteRequestResponse> {
    return this.http.post<QuoteRequestResponse>(`${this.base}/`, payload);
  }

  /** Listar cotizaciones del usuario autenticado */
  getMyQuotes(): Observable<{ count: number; results: QuoteRequestResponse[] }> {
    return this.http.get<{ count: number; results: QuoteRequestResponse[] }>(`${this.base}/`);
  }

  /** RF-2: Motor de matchmaking */
  searchMatch(params: MatchSearchParams): Observable<MatchResponse> {
    let httpParams = new HttpParams()
      .set('city', params.city)
      .set('style_id', params.style_id)
      .set('size_cm', params.size_cm)
      .set('body_part', params.body_part)
      .set('is_color', params.is_color);
    if (params.max_price) {
      httpParams = httpParams.set('max_price', params.max_price);
    }
    return this.http.get<MatchResponse>(`${this.base}/match/`, { params: httpParams });
  }

  /** RF-4: Crear cita */
  createAppointment(payload: AppointmentCreatePayload): Observable<Appointment> {
    return this.http.post<Appointment>(`${this.base}/appointments/`, payload);
  }

  /** RF-4: Listar citas del usuario autenticado */
  getAppointments(): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(`${this.base}/appointments/`);
  }

  /** RF-4: Cambiar estado de una cita */
  updateAppointmentStatus(id: number, payload: AppointmentStatusPayload): Observable<Appointment> {
    return this.http.patch<Appointment>(`${this.base}/appointments/${id}/status/`, payload);
  }

  /** RF-6: Enviar cuestionario de salud */
  submitHealthConsent(appointmentId: number, payload: HealthConsentPayload): Observable<unknown> {
    return this.http.post(`${this.base}/appointments/${appointmentId}/health-consent/`, payload);
  }
}
