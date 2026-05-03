import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { QuoteService } from '../../../core/services/quote.service';
import { QuoteRequestResponse } from '../../../core/models/quote';

const BODY_PART_FACTOR: Record<string, number> = {
  BRAZO: 1.00, ANTEBRAZO: 1.00, PIERNA: 1.10, HOMBRO: 1.05,
  ESPALDA: 1.30, PECHO: 1.25, COSTILLAS: 1.50, CUELLO: 1.40,
  MANO: 1.35, PIE: 1.35,
};
const BASE_RATE_MXN = 150;

@Component({
  selector: 'app-mis-cotizaciones',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './mis-cotizaciones.component.html',
  styleUrl: './mis-cotizaciones.component.scss',
})
export class MisCotizacionesComponent implements OnInit {
  private readonly quoteService = inject(QuoteService);
  private readonly router = inject(Router);

  quotes = signal<QuoteRequestResponse[]>([]);
  loading = signal(true);
  error = signal('');

  ngOnInit(): void {
    this.quoteService.getMyQuotes().subscribe({
      next: (res) => {
        this.quotes.set(res.results);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar tus cotizaciones.');
        this.loading.set(false);
      },
    });
  }

  buscarArtistas(quote: QuoteRequestResponse): void {
    this.quoteService.setLastQuote(quote);
    this.router.navigate(['/client/match']);
  }

  estimatedRange(q: QuoteRequestResponse): { min: number; max: number } {
    const factor = BODY_PART_FACTOR[q.body_part] ?? 1;
    const colorMult = q.is_color ? 1.20 : 1.00;
    const price = Math.round((BASE_RATE_MXN * q.size_cm * factor * colorMult) / 10) * 10;
    return { min: price, max: Math.round((price * 1.35) / 10) * 10 };
  }

  formatMXN(n: number): string {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(n);
  }

  formatDate(dt: string): string {
    return new Date(dt).toLocaleDateString('es-MX', { dateStyle: 'medium' });
  }
}
