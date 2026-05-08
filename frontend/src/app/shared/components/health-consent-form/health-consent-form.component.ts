import {
  Component, forwardRef, signal, computed,
  ChangeDetectionStrategy, ChangeDetectorRef, inject,
} from '@angular/core';
import {
  ControlValueAccessor, NG_VALUE_ACCESSOR, NG_VALIDATORS,
  Validator, AbstractControl, ValidationErrors,
  ReactiveFormsModule, FormBuilder, FormGroup, Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SignaturePadComponent } from '../signature-pad/signature-pad.component';
import { HealthConsentPayload } from '../../../core/models/quote';

@Component({
  selector: 'app-health-consent-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SignaturePadComponent],
  templateUrl: './health-consent-form.component.html',
  styleUrl: './health-consent-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => HealthConsentFormComponent),
      multi: true,
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => HealthConsentFormComponent),
      multi: true,
    },
  ],
})
export class HealthConsentFormComponent implements ControlValueAccessor, Validator {
  private readonly fb = inject(FormBuilder);
  private readonly cdr = inject(ChangeDetectorRef);

  form: FormGroup = this.fb.group({
    has_allergies:          [false],
    allergies_detail:       [''],
    has_chronic_disease:    [false],
    chronic_disease_detail: [''],
    takes_medication:       [false],
    medication_detail:      [''],
    is_pregnant:            [false],
    has_skin_condition:     [false],
    skin_condition_detail:  [''],
    has_hemophilia:         [false],
    hemophilia_detail:      [''],
    signature_data:         ['', Validators.required],
    terms_accepted:         [false, Validators.requiredTrue],
  });

  get allHealthClear(): boolean {
    const v = this.form.value;
    return !v.has_allergies && !v.has_chronic_disease && !v.takes_medication
        && !v.is_pregnant && !v.has_skin_condition && !v.has_hemophilia;
  }

  get isValid(): boolean { return this.form.valid; }

  // ── ControlValueAccessor ──────────────────────────────────────────────────

  private onChange: (v: HealthConsentPayload) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(val: HealthConsentPayload | null): void {
    if (val) {
      this.form.setValue(val, { emitEvent: false });
    } else {
      this.reset();
    }
    this.cdr.markForCheck();
  }

  registerOnChange(fn: (v: HealthConsentPayload) => void): void {
    this.onChange = fn;
    this.form.valueChanges.subscribe((v) => fn(v));
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(disabled: boolean): void {
    disabled ? this.form.disable() : this.form.enable();
  }

  // ── Validator ─────────────────────────────────────────────────────────────

  validate(_control: AbstractControl): ValidationErrors | null {
    return this.form.valid ? null : { healthConsentInvalid: true };
  }

  // ── Public API ────────────────────────────────────────────────────────────

  getValue(): HealthConsentPayload { return this.form.value; }

  reset(): void {
    this.form.reset({
      has_allergies: false,          allergies_detail: '',
      has_chronic_disease: false,    chronic_disease_detail: '',
      takes_medication: false,       medication_detail: '',
      is_pregnant: false,
      has_skin_condition: false,     skin_condition_detail: '',
      has_hemophilia: false,         hemophilia_detail: '',
      signature_data: '',
      terms_accepted: false,
    });
  }

  markAllTouched(): void { this.form.markAllAsTouched(); }
}
