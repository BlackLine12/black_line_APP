import { Component, inject, signal, computed, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { QuoteService } from '../../../core/services/quote.service';
import { ArtistService, CityCount } from '../../../core/services/artist.service';
import { ArtistMatchCard, MatchSearchParams, AppointmentCreatePayload, Appointment, CalendarBlock } from '../../../core/models/quote';
import { MexicanCity, filterCities } from '../../../core/data/cities-mx';
import { HealthConsentFormComponent } from '../../../shared/components/health-consent-form/health-consent-form.component';

@Component({
  selector: 'app-match',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, RouterModule, HealthConsentFormComponent],
  templateUrl: './match.component.html',
  styleUrl: './match.component.scss',
})
export class MatchComponent implements OnInit {
  @ViewChild(HealthConsentFormComponent) consentFormRef!: HealthConsentFormComponent;

  private readonly quoteService = inject(QuoteService);
  private readonly artistService = inject(ArtistService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  // ── Estado de búsqueda ─────────────────────────────────────────────────
  artists = signal<ArtistMatchCard[]>([]);
  loading = signal(false);
  searchError = signal('');
  searched = signal(false);
  city = signal('');

  // ── Conteo de artistas por ciudad ──────────────────────────────────────
  cityCounts = signal<CityCount[]>([]);

  // ── Autocomplete de ciudad ─────────────────────────────────────────────
  // cityQuery: texto que escribe el usuario en el input
  // city: valor confirmado al seleccionar del catálogo (enviado al backend)
  cityQuery    = signal('');
  cityValid    = signal(false);
  showDropdown = signal(false);
  filteredCities = computed(() => filterCities(this.cityQuery()));

  // ── Artista seleccionado ───────────────────────────────────────────────
  selectedArtist = signal<ArtistMatchCard | null>(null);

  // ── Formulario de cita ─────────────────────────────────────────────────
  step = signal<'appointment' | 'consent' | 'done'>('appointment');
  submitting = signal(false);
  submitError = signal('');
  createdAppointmentId = signal<number | null>(null);
  existingAppointments = signal<Appointment[]>([]);
  artistCalendarBlocks = signal<CalendarBlock[]>([]);
  dateConflictError = signal('');

  appointmentForm: FormGroup = this.fb.group({
    scheduled_at: ['', Validators.required],
  });

  // ── Quote del wizard ───────────────────────────────────────────────────
  quote = computed(() => this.quoteService.lastQuote());

  // ── Indica si existe una quote activa ─────────────────────────────────
  hasQuote = computed(() => !!this.quoteService.lastQuote());

  // ── Min datetime para el input (hoy + 1 hora) ─────────────────────────
  get minDatetime(): string {
    const d = new Date();
    d.setHours(d.getHours() + 1);
    return d.toISOString().slice(0, 16);
  }

  ngOnInit(): void {
    this.artistService.getCityCounts().subscribe({
      next: (data) => this.cityCounts.set(data),
      error: () => { /* no crítico — el dropdown funciona sin conteos */ },
    });

    this.quoteService.getAppointments().subscribe({
      next: (appts) => this.existingAppointments.set(appts),
      error: () => { /* silencioso — la validación del backend sigue activa */ },
    });

    // lastQuote ya se restaura desde sessionStorage en QuoteService.restoreQuote()
    // Si después del restore sigue null, intentar desde API
    if (!this.quote()) {
      this.quoteService.getMyQuotes().subscribe({
        next: (res) => {
          if (res.results.length > 0) {
            this.quoteService.setLastQuote(res.results[0]);
          }
        },
        error: () => { /* silencioso — ya se muestra el estado "sin cotización" */ },
      });
    }
  }

  onDateChange(value: string): void {
    if (!value) { this.dateConflictError.set(''); return; }
    const selected = new Date(value);

    // Verificar conflicto con citas propias del cliente
    const apptConflict = this.existingAppointments().find(
      (a) => a.status !== 'REJECTED' && new Date(a.scheduled_at).getTime() === selected.getTime()
    );
    if (apptConflict) {
      this.dateConflictError.set(
        `Ya tienes una cita con ${apptConflict.artist_name} a esa fecha y hora. Elige un horario diferente.`
      );
      return;
    }

    // Verificar si cae dentro de un bloqueo del artista
    const blockConflict = this.artistCalendarBlocks().find(
      (b) => selected >= new Date(b.start_datetime) && selected < new Date(b.end_datetime)
    );
    if (blockConflict) {
      const until = new Date(blockConflict.end_datetime).toLocaleString('es-MX', {
        day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
      });
      this.dateConflictError.set(
        `El artista no estará disponible en esa fecha. Su próxima disponibilidad es a partir del ${until}`
      );
      return;
    }

    this.dateConflictError.set('');
  }

  /** Devuelve el conteo de artistas para la ciudad dada, o null si no hay datos */
  getCityCount(cityName: string): number | null {
    const entry = this.cityCounts().find(
      (c) => c.city.toLowerCase() === cityName.toLowerCase()
    );
    return entry?.count ?? null;
  }

  // ── Autocomplete: seleccionar ciudad del dropdown ──────────────────────
  selectCity(c: MexicanCity): void {
    this.cityQuery.set(c.name);
    this.city.set(c.name);
    this.cityValid.set(true);
    this.showDropdown.set(false);
  }

  // ── Autocomplete: el usuario escribe → invalida selección previa ───────
  onCityInput(value: string): void {
    this.cityQuery.set(value);
    this.cityValid.set(false);
    this.showDropdown.set(value.trim().length > 0);
    this.city.set('');
  }

  // ── Autocomplete: cerrar dropdown con delay para permitir click ────────
  onCityBlur(): void {
    setTimeout(() => this.showDropdown.set(false), 150);
  }

  // ── Búsqueda ───────────────────────────────────────────────────────────
  search(): void {
    const q = this.quote();
    if (!q || !this.city().trim()) return;

    this.loading.set(true);
    this.searchError.set('');
    this.artists.set([]);
    this.selectedArtist.set(null);

    const params: MatchSearchParams = {
      city: this.city().trim(),
      style_id: q.tattoo_style,
      size_cm: q.size_cm,
      body_part: q.body_part,
      is_color: q.is_color,
    };

    this.quoteService.searchMatch(params).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.artists.set(res.results);
        this.searched.set(true);
      },
      error: () => {
        this.loading.set(false);
        this.searchError.set('Error al buscar artistas. Intenta de nuevo.');
        this.searched.set(true);
      },
    });
  }

  // ── Seleccionar artista ────────────────────────────────────────────────
  selectArtist(artist: ArtistMatchCard): void {
    this.selectedArtist.set(artist);
    this.step.set('appointment');
    this.appointmentForm.reset();
    this.consentFormRef?.reset();
    this.submitError.set('');
    this.dateConflictError.set('');
    this.artistCalendarBlocks.set([]);
    this.quoteService.getArtistCalendarBlocks(artist.artist_id).subscribe({
      next: (blocks) => this.artistCalendarBlocks.set(blocks),
      error: () => { /* silencioso — el backend valida al crear */ },
    });
  }

  closePanel(): void {
    this.selectedArtist.set(null);
  }

  // ── Paso 1: crear cita ─────────────────────────────────────────────────
  submitAppointment(): void {
    if (this.appointmentForm.invalid || !this.selectedArtist()) return;
    if (this.dateConflictError()) return;

    this.submitting.set(true);
    this.submitError.set('');

    const payload: AppointmentCreatePayload = {
      artist: this.selectedArtist()!.artist_id,
      quote: this.quote()?.id,
      scheduled_at: new Date(this.appointmentForm.value.scheduled_at).toISOString(),
    };

    this.quoteService.createAppointment(payload).subscribe({
      next: (appt) => {
        this.submitting.set(false);
        this.createdAppointmentId.set(appt.id);
        this.step.set('consent');
      },
      error: (err) => {
        this.submitting.set(false);
        this.submitError.set(err.error?.detail ?? 'Error al crear la cita.');
      },
    });
  }

  // ── Paso 2: enviar consentimiento de salud ─────────────────────────────
  submitConsent(): void {
    if (!this.consentFormRef?.isValid || !this.createdAppointmentId()) {
      this.consentFormRef?.markAllTouched();
      return;
    }

    this.submitting.set(true);
    this.submitError.set('');

    const payload = this.consentFormRef.getValue();

    this.quoteService.submitHealthConsent(this.createdAppointmentId()!, payload).subscribe({
      next: () => {
        this.submitting.set(false);
        this.step.set('done');
      },
      error: (err) => {
        this.submitting.set(false);
        this.submitError.set(err.error?.detail ?? 'Error al enviar el cuestionario de salud.');
      },
    });
  }

  // ── Finalizar → Mis Citas ──────────────────────────────────────────────
  goToMisCitas(): void {
    this.quoteService.setLastQuote(null);
    this.router.navigate(['/client/mis-citas']);
  }

  // ── Helper ─────────────────────────────────────────────────────────────
  formatPrice(price: string): string {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(Number(price));
  }
}
