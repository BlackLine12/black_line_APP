import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { QuoteService } from '../../../core/services/quote.service';
import { ArtistMatchCard, MatchSearchParams, AppointmentCreatePayload, HealthConsentPayload } from '../../../core/models/quote';
import { MexicanCity, filterCities } from '../../../core/data/cities-mx';

@Component({
  selector: 'app-match',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './match.component.html',
  styleUrl: './match.component.scss',
})
export class MatchComponent implements OnInit {
  private readonly quoteService = inject(QuoteService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  // ── Estado de búsqueda ─────────────────────────────────────────────────
  artists = signal<ArtistMatchCard[]>([]);
  loading = signal(false);
  searchError = signal('');
  searched = signal(false);
  city = signal('');

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

  appointmentForm: FormGroup = this.fb.group({
    scheduled_at: ['', Validators.required],
  });

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
    this.consentForm.reset({ has_allergies: false, has_chronic_disease: false, takes_medication: false, is_pregnant: false, has_skin_condition: false, terms_accepted: false });
    this.submitError.set('');
  }

  closePanel(): void {
    this.selectedArtist.set(null);
  }

  // ── Paso 1: crear cita ─────────────────────────────────────────────────
  submitAppointment(): void {
    if (this.appointmentForm.invalid || !this.selectedArtist()) return;

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
    if (this.consentForm.invalid || !this.createdAppointmentId()) return;

    this.submitting.set(true);
    this.submitError.set('');

    const payload: HealthConsentPayload = this.consentForm.value;

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
