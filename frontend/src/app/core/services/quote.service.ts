import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { QuoteRequestPayload, QuoteRequestResponse } from '../models/quote';

@Injectable({ providedIn: 'root' })
export class QuoteService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}`;

  /** Envía la solicitud de cotización al backend */
  createQuote(payload: QuoteRequestPayload): Observable<QuoteRequestResponse> {
    return this.http.post<QuoteRequestResponse>(`${this.baseUrl}/quotes/`, payload);
  }
}
