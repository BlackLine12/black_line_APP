import { Component, inject, signal, computed, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '@env/environment';
import { User } from '../../../core/models/user';
import { MediaUrlService } from '../../../core/services/media-url.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './perfil.component.html',
  styleUrl: './perfil.component.scss',
})
export class PerfilComponent implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly fb = inject(FormBuilder);
  private readonly baseUrl = `${environment.apiUrl}/auth`;
  private readonly mediaUrl = inject(MediaUrlService);
  private readonly authService = inject(AuthService);

  @ViewChild('photoInput') photoInput!: ElementRef<HTMLInputElement>;

  user = signal<User | null>(null);
  loading = signal(true);
  profileError = signal('');

  profileSaving = signal(false);
  profileSuccess = signal(false);
  profileSaveError = signal('');

  uploadingPhoto = signal(false);
  photoPreview = signal<string | null>(null);

  photoSrc = computed(() => this.mediaUrl.resolve(this.photoPreview()));

  passwordSaving = signal(false);
  passwordSuccess = signal(false);
  passwordSaveError = signal('');
  showPasswords = signal(false);

  profileForm: FormGroup = this.fb.group({
    first_name: ['', Validators.required],
    last_name:  ['', Validators.required],
    username:   ['', [Validators.required, Validators.minLength(3)]],
    phone:      [''],
  });

  passwordForm: FormGroup = this.fb.group(
    {
      current_password: ['', Validators.required],
      new_password:     ['', [Validators.required, Validators.minLength(8)]],
      confirm_password: ['', Validators.required],
    },
    { validators: this.passwordsMatch }
  );

  ngOnInit(): void {
    this.http.get<User>(`${this.baseUrl}/profile/`).subscribe({
      next: (u) => {
        this.user.set(u);
        this.photoPreview.set(u.profile_photo ?? null);
        this.loading.set(false);
        this.profileForm.patchValue({
          first_name: u.first_name,
          last_name:  u.last_name,
          username:   u.username,
          phone:      u.phone ?? '',
        });
      },
      error: () => {
        this.loading.set(false);
        this.profileError.set('Error al cargar el perfil. Recarga la página.');
      },
    });
  }

  saveProfile(): void {
    if (this.profileForm.invalid) return;

    this.profileSaving.set(true);
    this.profileSuccess.set(false);
    this.profileSaveError.set('');

    this.http.patch<User>(`${this.baseUrl}/profile/`, this.profileForm.value).subscribe({
      next: (u) => {
        this.profileSaving.set(false);
        this.profileSuccess.set(true);
        this.user.set(u);
        this.photoPreview.set(u.profile_photo ?? null);
        this.authService.updateUser(u);
        setTimeout(() => this.profileSuccess.set(false), 3000);
      },
      error: (err) => {
        this.profileSaving.set(false);
        const detail = err.error?.username?.[0] ?? err.error?.detail ?? 'Error al guardar los cambios.';
        this.profileSaveError.set(detail);
      },
    });
  }

  triggerPhotoUpload(): void {
    this.photoInput.nativeElement.click();
  }

  onPhotoSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = e => this.photoPreview.set(e.target?.result as string);
    reader.readAsDataURL(file);

    this.uploadingPhoto.set(true);
    
    const formData = new FormData();
    formData.append('profile_photo', file);

    this.http.patch<User>(`${this.baseUrl}/profile-photo/`, formData).subscribe({
      next: (u) => {
        this.user.set(u);
        this.photoPreview.set(u.profile_photo ?? null);
        this.authService.updateUser(u);
        this.uploadingPhoto.set(false);
      },
      error: () => {
        this.uploadingPhoto.set(false);
        this.photoPreview.set(this.user()?.profile_photo ?? null);
      }
    });
  }

  changePassword(): void {
    if (this.passwordForm.invalid) return;

    this.passwordSaving.set(true);
    this.passwordSuccess.set(false);
    this.passwordSaveError.set('');

    const { current_password, new_password, confirm_password } = this.passwordForm.value;

    this.http.post(`${this.baseUrl}/change-password/`, { 
      old_password: current_password, 
      new_password, 
      new_password_confirm: confirm_password 
    }).subscribe({
      next: () => {
        this.passwordSaving.set(false);
        this.passwordSuccess.set(true);
        this.passwordForm.reset();
        setTimeout(() => this.passwordSuccess.set(false), 3000);
      },
      error: (err) => {
        this.passwordSaving.set(false);
        const detail = err.error?.old_password?.[0] ?? err.error?.detail ?? 'Error al cambiar la contraseña.';
        this.passwordSaveError.set(detail);
      },
    });
  }

  togglePasswords(): void {
    this.showPasswords.update((v) => !v);
  }

  private passwordsMatch(group: AbstractControl): ValidationErrors | null {
    const np = group.get('new_password')?.value;
    const cp = group.get('confirm_password')?.value;
    return np && cp && np !== cp ? { mismatch: true } : null;
  }

  roleLabel(type: string | undefined): string {
    switch (type) {
      case 'CLIENT': return 'Cliente';
      case 'STUDIO': return 'Artista / Estudio';
      case 'ADMIN':  return 'Administrador';
      default:       return '';
    }
  }

  initials(u: User | null): string {
    if (!u) return '?';
    return ((u.first_name?.[0] ?? '') + (u.last_name?.[0] ?? '')).toUpperCase() || u.username[0].toUpperCase();
  }
}
