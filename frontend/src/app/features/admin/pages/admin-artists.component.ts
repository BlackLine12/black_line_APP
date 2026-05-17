import { ChangeDetectionStrategy, Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '@env/environment';

interface CityCount { city: string; count: number; }

interface AdminArtist {
  id: number;
  user_id: number;
  first_name: string;
  last_name: string;
  email: string;
  username: string;
  phone: string;
  is_active: boolean;
  city: string;
  bio: string;
  base_hourly_rate: string;
  minimum_setup_fee: string;
  profile_photo: string | null;
  styles: string[];
  created_at: string;
}

@Component({
  selector: 'app-admin-artists',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-artists.component.html',
  styleUrl: './admin-artists.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminArtistsComponent implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/artists/admin/artists/`;

  cities        = signal<CityCount[]>([]);
  artists       = signal<AdminArtist[]>([]);
  selectedCity  = signal<string | null>(null);
  loadingCities = signal(true);
  loadingArtists = signal(false);
  errorCities   = signal('');
  errorArtists  = signal('');

  ngOnInit(): void {
    this.loadCities();
  }

  private loadCities(): void {
    this.loadingCities.set(true);
    this.errorCities.set('');
    this.http.get<CityCount[]>(this.base).subscribe({
      next: (data) => {
        this.cities.set(data);
        this.loadingCities.set(false);
      },
      error: () => {
        this.loadingCities.set(false);
        this.errorCities.set('No se pudieron cargar las ciudades.');
      },
    });
  }

  selectCity(city: string): void {
    if (this.selectedCity() === city) return;
    this.selectedCity.set(city);
    this.artists.set([]);
    this.errorArtists.set('');
    this.loadingArtists.set(true);

    this.http.get<AdminArtist[]>(`${this.base}?city=${encodeURIComponent(city)}`).subscribe({
      next: (data) => {
        this.artists.set(data);
        this.loadingArtists.set(false);
      },
      error: () => {
        this.loadingArtists.set(false);
        this.errorArtists.set('No se pudieron cargar los artistas.');
      },
    });
  }

  fullName(a: AdminArtist): string {
    return `${a.first_name} ${a.last_name}`.trim();
  }

  formatRate(rate: string): string {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency', currency: 'MXN', maximumFractionDigits: 0,
    }).format(Number(rate));
  }
}
