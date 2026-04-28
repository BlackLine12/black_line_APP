import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ArtistService } from '../services/artist.service';
import { ArtistProfile, ArtistStats, TattooStyle } from '../../../core/models/artist';
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
  private readonly router = inject(Router);

  profileForm!: FormGroup;
  profile: ArtistProfile | null = null;
  styles: TattooStyle[] = [];
  stats: ArtistStats = { pending_appointments: 0, upcoming_appointments: 0, total_portfolio_images: 0 };
  selectedStyleIds: Set<number> = new Set();

  loading = true;
  saving = false;
  saveMessage = '';
  saveSuccess = false;

  activeSection = 'info';

  get selectedStyleCount(): number {
    return this.selectedStyleIds.size;
  }

  get profileCompletion(): number {
    if (!this.profileForm) return 0;
    const fields = ['bio', 'city', 'base_hourly_rate', 'minimum_setup_fee'];
    const completedFields = fields.filter((field) => {
      const value = this.profileForm.get(field)?.value;
      return value !== null && value !== undefined && `${value}`.trim() !== '' && `${value}` !== '0';
    }).length;
    const styleScore = this.selectedStyleIds.size > 0 ? 1 : 0;
    return Math.round(((completedFields + styleScore) / (fields.length + 1)) * 100);
  }

  get portfolioCount(): number {
    return this.stats.total_portfolio_images;
  }

  get artistDisplayName(): string {
    return this.profile?.username || 'Tu perfil';
  }

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

    this.artistService.getStats().subscribe({
      next: (s) => (this.stats = s),
      error: () => {},
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

  scrollToSection(section: string): void {
    this.activeSection = section;
    const el = document.getElementById(`section-${section}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  goToPublicProfile(): void {
    if (this.profile?.id) {
      this.router.navigate(['/artistas', this.profile.id]);
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
