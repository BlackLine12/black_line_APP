import {
  Component, OnInit, inject, signal, computed,
  ElementRef, ViewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '@env/environment';
import { AuthService } from '../../../core/services/auth.service';
import { ArtistService } from '../services/artist.service';
import { MediaUrlService } from '../../../core/services/media-url.service';
import { ArtistProfile, ArtistStats, TattooStyle } from '../../../core/models/artist';
import { STATES_MX, CITIES_MX, getCitiesByState, MexicanCity } from '../../../core/data/cities-mx';


type TabId = 'info' | 'rates' | 'styles' | 'account';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  @ViewChild('photoInput') photoInput!: ElementRef<HTMLInputElement>;

  private readonly fb            = inject(FormBuilder);
  private readonly artistService = inject(ArtistService);
  private readonly authService   = inject(AuthService);
  private readonly http          = inject(HttpClient);
  readonly mediaUrl              = inject(MediaUrlService);

  profileForm!: FormGroup;
  accountForm!: FormGroup;
  passwordForm!: FormGroup;
  profile: ArtistProfile | null = null;
  styles: TattooStyle[]         = [];
  stats: ArtistStats = { pending_appointments: 0, upcoming_appointments: 0, total_portfolio_images: 0 };
  readonly selectedStyleIds = signal<number[]>([]);

  loading    = true;
  saving     = false;
  savingAccount = false;
  savingPassword = false;

  uploadingPhoto = false;
  readonly photoPreview = signal<string | null>(null);

  activeTab: TabId = 'info';

  // ── Selector Estado → Ciudad ──────────────────────────────────────────────
  readonly states = [...STATES_MX, 'Otro (Fuera de México)'];
  selectedState = signal('');

  citiesForState = computed<MexicanCity[]>(() =>
    this.selectedState() ? getCitiesByState(this.selectedState()) : []
  );

  // ── Toast ─────────────────────────────────────────────────────────────────
  toastVisible = signal(false);
  toastMsg     = signal('');
  toastOk      = signal(true);

  // ── Computed ──────────────────────────────────────────────────────────────
  get profileCompletion(): number {
    if (!this.profileForm) return 0;
    let score = 0;
    const total = 5;
    if ((this.profileForm.get('bio')?.value ?? '').trim().length > 0)              score++;
    if ((this.profileForm.get('city')?.value ?? '').trim().length > 0)             score++;
    const rate = Number(this.profileForm.get('base_hourly_rate')?.value ?? 0);
    if (rate > 0)                                                                   score++;
    if (this.selectedStyleIds().length > 0)                                         score++;
    if (this.photoPreview())                                                        score++;
    return Math.round((score / total) * 100);
  }

  get artistDisplayName(): string {
    return this.profile?.username || 'Tu perfil';
  }

  get photoSrc(): string | null {
    return this.mediaUrl.resolve(this.photoPreview());
  }

  tabs: { id: TabId; label: string; icon: string }[] = [
    { id: 'info',   label: 'Información',    icon: 'M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z' },
    { id: 'rates',  label: 'Tarifas',        icon: 'M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z' },
    { id: 'styles', label: 'Especialidades', icon: 'M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42' },
    { id: 'account', label: 'Cuenta',        icon: 'M10.5 6a7.5 7.5 0 1 0 7.5 7.5h-7.5V6Z' },
  ];

  private readonly route         = inject(ActivatedRoute);

  ngOnInit(): void {
    this.initForm();
    this.loadData();
    
    // Leer pestaña desde query params
    this.route.queryParams.subscribe(params => {
      if (params['tab']) {
        this.setTab(params['tab'] as TabId);
      }
    });
  }

  private initForm(): void {
    this.profileForm = this.fb.group({
      bio:               ['', [Validators.maxLength(2000)]],
      state:             [''],
      city:              ['', [Validators.maxLength(150)]],
      base_hourly_rate:  [0, [Validators.required, Validators.min(0)]],
      minimum_setup_fee: [0, [Validators.required, Validators.min(0)]],
    });

    this.accountForm = this.fb.group({
      first_name: ['', Validators.required],
      last_name:  ['', Validators.required],
      username:   ['', [Validators.required, Validators.minLength(3)]],
      phone:      [''],
    });

    this.passwordForm = this.fb.group({
      current_password: ['', Validators.required],
      new_password:     ['', [Validators.required, Validators.minLength(8)]],
      confirm_password: ['', Validators.required],
    }, { validators: this.passwordsMatch });
  }

  private passwordsMatch(control: AbstractControl): ValidationErrors | null {
    const next = control.get('new_password')?.value;
    const conf = control.get('confirm_password')?.value;
    return next && conf && next !== conf ? { mismatch: true } : null;
  }

  private loadData(): void {
    this.artistService.getStyles().subscribe({
      next:  (s) => (this.styles = Array.isArray(s) ? s : (s as any).results ?? []),
      error: ()  => (this.styles = []),
    });

    this.artistService.getStats().subscribe({
      next:  (s) => (this.stats = s),
      error: ()  => {},
    });

    this.artistService.getMyProfile().subscribe({
      next: (profile) => {
        this.profile = profile;
        // IMPORTANTE: Sincronizar foto del artista con AuthService para navbar
        if (profile.profile_photo) {
          this.photoPreview.set(profile.profile_photo);
          this.authService.updateUser({ profile_photo: profile.profile_photo });
        } else {
          const currentUser = this.authService.user();
          if (currentUser?.profile_photo) {
            this.photoPreview.set(currentUser.profile_photo);
          }
        }

        // Pre-llenar estado a partir de la ciudad guardada
        const savedCity = profile.city ?? '';
        const matchedState = this.findStateForCity(savedCity);

        this.selectedState.set(matchedState);
        this.profileForm.patchValue({
          bio:               profile.bio,
          state:             matchedState,
          city:              savedCity,
          base_hourly_rate:  profile.base_hourly_rate,
          minimum_setup_fee: profile.minimum_setup_fee,
        });

        const user = this.authService.user();
        if (user) {
          this.accountForm.patchValue({
            first_name: user.first_name,
            last_name:  user.last_name,
            username:   user.username,
            phone:      user.phone ?? '',
          });
        }

        // Cargar estilos como array
        this.selectedStyleIds.set(profile.styles.map(s => s.id));
        this.loading = false;
      },
      error: () => (this.loading = false),
    });
  }

  private findStateForCity(cityName: string): string {
    if (!cityName) return '';
    const found = CITIES_MX.find((c: MexicanCity) => c.name === cityName);
    return found?.state ?? 'Otro (Fuera de México)';
  }



  // ── Foto de perfil ────────────────────────────────────────────────────────
  triggerPhotoUpload(): void {
    this.photoInput.nativeElement.click();
  }

  onPhotoSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    // Preview inmediato
    const reader = new FileReader();
    reader.onload = e => this.photoPreview.set(e.target?.result as string);
    reader.readAsDataURL(file);

    this.uploadingPhoto = true;
    this.artistService.uploadProfilePhoto(file).subscribe({
      next: (user: any) => {
        if (this.profile) {
          this.profile.profile_photo = user.profile_photo;
        }
        this.photoPreview.set(user.profile_photo);
        this.uploadingPhoto = false;
        // Sync with AuthService so navbar updates
        this.authService.updateUser({ profile_photo: user.profile_photo });
        this.showToast('Foto actualizada correctamente.', true);
      },
      error: () => {
        this.uploadingPhoto = false;
        this.photoPreview.set(this.profile?.profile_photo || null);
        this.showToast('No se pudo subir la foto. Intenta de nuevo.', false);
      },
    });
  }

  // ── Selector Estado → Ciudad ──────────────────────────────────────────────
  onStateChange(state: string): void {
    this.selectedState.set(state);
    this.profileForm.patchValue({ state, city: '' });
  }

  onCityChange(city: string): void {
    this.profileForm.patchValue({ city });
  }

  // ── Estilos ───────────────────────────────────────────────────────────────
  toggleStyle(id: number): void {
    const current = this.selectedStyleIds();
    const index = current.indexOf(id);
    let updated: number[];
    
    if (index > -1) {
      // Si existe, remover
      updated = current.filter((styleId, i) => i !== index);
    } else {
      // Si no existe, agregar
      updated = [...current, id];
    }
    
    this.selectedStyleIds.set(updated);
  }

  // ── Tabs ──────────────────────────────────────────────────────────────────
  setTab(tab: TabId): void {
    this.activeTab = tab;
  }

  // ── Guardar ───────────────────────────────────────────────────────────────
  onSubmit(): void {
    if (this.profileForm.invalid || this.saving) return;
    this.saving = true;

    const { state: _state, ...rest } = this.profileForm.value;
    const payload = {
      ...rest,
      style_ids: this.selectedStyleIds(),
    };

    this.artistService.updateMyProfile(payload).subscribe({
      next: (updated) => {
        this.profile = updated;
        this.saving  = false;
        // Sincronizar foto con AuthService para que navbar se actualice
        if (updated.profile_photo) {
          this.authService.updateUser({ profile_photo: updated.profile_photo });
          this.photoPreview.set(updated.profile_photo);
        }
        this.showToast('Perfil actualizado correctamente.', true);
      },
      error: () => {
        this.saving = false;
        this.showToast('Error al guardar. Intenta de nuevo.', false);
      },
    });
  }

  private showToast(msg: string, ok: boolean): void {
    this.toastMsg.set(msg);
    this.toastOk.set(ok);
    this.toastVisible.set(true);
    setTimeout(() => this.toastVisible.set(false), 3500);
  }

  onAccountSubmit(): void {
    if (this.accountForm.invalid || this.savingAccount) return;
    this.savingAccount = true;
    const baseUrl = `${environment.apiUrl}/auth/profile/`;
    this.http.patch<any>(baseUrl, this.accountForm.value).subscribe({
      next: (updatedUser) => {
        this.savingAccount = false;
        this.authService.updateUser(updatedUser);
        this.showToast('Información de cuenta actualizada.', true);
      },
      error: (err) => {
        this.savingAccount = false;
        const msg = err.error?.username?.[0] ?? 'Error al actualizar cuenta.';
        this.showToast(msg, false);
      }
    });
  }

  onPasswordSubmit(): void {
    if (this.passwordForm.invalid || this.savingPassword) return;
    this.savingPassword = true;
    const baseUrl = `${environment.apiUrl}/auth/password/`;
    this.http.post<any>(baseUrl, this.passwordForm.value).subscribe({
      next: () => {
        this.savingPassword = false;
        this.passwordForm.reset();
        this.showToast('Contraseña cambiada con éxito.', true);
      },
      error: (err) => {
        this.savingPassword = false;
        const msg = err.error?.detail ?? 'Error al cambiar contraseña.';
        this.showToast(msg, false);
      }
    });
  }
}
