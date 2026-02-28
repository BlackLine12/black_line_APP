import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ArtistService } from '../services/artist.service';
import { ArtistProfile, TattooStyle } from '../../../core/models/artist';
import { PortfolioUploadComponent } from './portfolio-upload.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, PortfolioUploadComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly artistService = inject(ArtistService);

  profileForm!: FormGroup;
  profile: ArtistProfile | null = null;
  styles: TattooStyle[] = [];
  selectedStyleIds: Set<number> = new Set();

  loading = true;
  saving = false;
  saveMessage = '';
  saveSuccess = false;

  ngOnInit(): void {
    this.initForm();
    this.loadData();
  }

  private initForm(): void {
    this.profileForm = this.fb.group({
      bio: ['', [Validators.maxLength(2000)]],
      city: ['', [Validators.maxLength(150)]],
      base_hourly_rate: [0, [Validators.required, Validators.min(0)]],
      minimum_setup_fee: [0, [Validators.required, Validators.min(0)]],
    });
  }

  private loadData(): void {
    this.artistService.getStyles().subscribe({
      next: (styles) => (this.styles = styles),
      error: () => (this.styles = []),
    });

    this.artistService.getMyProfile().subscribe({
      next: (profile) => {
        this.profile = profile;
        this.profileForm.patchValue({
          bio: profile.bio,
          city: profile.city,
          base_hourly_rate: profile.base_hourly_rate,
          minimum_setup_fee: profile.minimum_setup_fee,
        });
        this.selectedStyleIds = new Set(profile.styles.map((s) => s.id));
        this.loading = false;
      },
      error: () => (this.loading = false),
    });
  }

  toggleStyle(id: number): void {
    if (this.selectedStyleIds.has(id)) {
      this.selectedStyleIds.delete(id);
    } else {
      this.selectedStyleIds.add(id);
    }
  }

  onSubmit(): void {
    if (this.profileForm.invalid || this.saving) return;
    this.saving = true;
    this.saveMessage = '';

    const payload = {
      ...this.profileForm.value,
      style_ids: Array.from(this.selectedStyleIds),
    };

    this.artistService.updateMyProfile(payload).subscribe({
      next: (updated) => {
        this.profile = updated;
        this.saving = false;
        this.saveMessage = 'Perfil actualizado correctamente.';
        this.saveSuccess = true;
        setTimeout(() => (this.saveMessage = ''), 3000);
      },
      error: () => {
        this.saving = false;
        this.saveMessage = 'Error al guardar. Intenta de nuevo.';
        this.saveSuccess = false;
        setTimeout(() => (this.saveMessage = ''), 3000);
      },
    });
  }
}
