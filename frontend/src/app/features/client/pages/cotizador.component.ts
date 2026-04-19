import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { QuoteService } from '../../../core/services/quote.service';
import { ArtistService } from '../../studio/services/artist.service';
import { TattooStyle } from '../../../core/models/artist';
import { BodyPartOption, QuoteRequestPayload } from '../../../core/models/quote';

@Component({
  selector: 'app-cotizador',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './cotizador.component.html',
  styleUrl: './cotizador.component.scss',
})
export class CotizadorComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly quoteService = inject(QuoteService);
  private readonly artistService = inject(ArtistService);
  private readonly router = inject(Router);

  currentStep = signal(1);
  totalSteps = 4;
  loading = signal(false);
  submitted = signal(false);
  errorMsg = signal('');

  styles = signal<TattooStyle[]>([]);

  bodyParts: BodyPartOption[] = [
    { value: 'BRAZO', label: 'Brazo' },
    { value: 'ANTEBRAZO', label: 'Antebrazo' },
    { value: 'PIERNA', label: 'Pierna' },
    { value: 'ESPALDA', label: 'Espalda' },
    { value: 'PECHO', label: 'Pecho' },
    { value: 'COSTILLAS', label: 'Costillas' },
    { value: 'CUELLO', label: 'Cuello' },
    { value: 'MANO', label: 'Mano' },
    { value: 'PIE', label: 'Pie' },
    { value: 'HOMBRO', label: 'Hombro' },
  ];

  quoteForm: FormGroup = this.fb.group({
    tattoo_style: [null, Validators.required],
    body_part: ['', Validators.required],
    is_color: [false],
    size_cm: [10, [Validators.required, Validators.min(1), Validators.max(200)]],
  });

  ngOnInit(): void {
    this.artistService.getStyles().subscribe({
      next: (data) => {
        const results = Array.isArray(data) ? data : (data as any).results ?? [];
        this.styles.set(results);
      },
      error: () => this.errorMsg.set('No se pudieron cargar los estilos.'),
    });
  }

  // ── Navigation ──────────────────────────────────────────
  next(): void {
    if (this.isCurrentStepValid()) {
      this.currentStep.update((s) => Math.min(s + 1, this.totalSteps));
    }
  }

  prev(): void {
    this.currentStep.update((s) => Math.max(s - 1, 1));
  }

  goToStep(step: number): void {
    // Only allow going back or to current completed steps
    if (step < this.currentStep()) {
      this.currentStep.set(step);
    }
  }

  // ── Step validation ─────────────────────────────────────
  isCurrentStepValid(): boolean {
    switch (this.currentStep()) {
      case 1:
        return this.quoteForm.get('tattoo_style')!.valid;
      case 2:
        return this.quoteForm.get('body_part')!.valid;
      case 3:
        return this.quoteForm.get('size_cm')!.valid;
      case 4:
        return this.quoteForm.valid;
      default:
        return false;
    }
  }

  // ── Selections ──────────────────────────────────────────
  selectStyle(id: number): void {
    this.quoteForm.patchValue({ tattoo_style: id });
  }

  selectBodyPart(value: string): void {
    this.quoteForm.patchValue({ body_part: value });
  }

  toggleColor(isColor: boolean): void {
    this.quoteForm.patchValue({ is_color: isColor });
  }

  // ── Helpers ─────────────────────────────────────────────
  get selectedStyle(): TattooStyle | undefined {
    return this.styles().find((s) => s.id === this.quoteForm.value.tattoo_style);
  }

  get selectedBodyPart(): BodyPartOption | undefined {
    return this.bodyParts.find((b) => b.value === this.quoteForm.value.body_part);
  }

  get sizeLabel(): string {
    const cm = this.quoteForm.value.size_cm;
    if (cm <= 5) return 'Muy pequeño';
    if (cm <= 15) return 'Pequeño';
    if (cm <= 30) return 'Mediano';
    if (cm <= 60) return 'Grande';
    return 'Muy grande';
  }

  // ── Submit ──────────────────────────────────────────────
  submit(): void {
    if (!this.quoteForm.valid) return;

    this.loading.set(true);
    this.errorMsg.set('');

    const payload: QuoteRequestPayload = this.quoteForm.value;

    this.quoteService.createQuote(payload).subscribe({
      next: (quote) => {
        this.loading.set(false);
        this.quoteService.lastQuote.set(quote);
        this.router.navigate(['/client/match']);
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMsg.set(
          err.error?.detail ?? 'Ocurrió un error al enviar la cotización.'
        );
      },
    });
  }
}
