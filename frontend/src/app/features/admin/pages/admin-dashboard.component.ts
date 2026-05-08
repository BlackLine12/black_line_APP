import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '@env/environment';
import { forkJoin } from 'rxjs';
import { ArtistProfile } from '../../../core/models/artist';
import { Appointment } from '../../../core/models/quote';
import { User } from '../../../core/models/user';
import { TattooStyle } from '../../../core/models/artist';

interface PaginatedResponse<T> { count: number; results: T[]; }

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss',
})
export class AdminDashboardComponent implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly api = environment.apiUrl;

  loading = signal(true);
  error   = signal('');

  totalArtists     = signal(0);
  totalAppointments = signal(0);
  totalStyles      = signal(0);
  pendingCount     = signal(0);
  approvedCount    = signal(0);
  recentAppointments = signal<Appointment[]>([]);

  ngOnInit(): void {
    forkJoin({
      artists:      this.http.get<PaginatedResponse<ArtistProfile>>(`${this.api}/artists/profiles/`),
      appointments: this.http.get<PaginatedResponse<Appointment>>(`${this.api}/quotes/appointments/`),
      styles:       this.http.get<PaginatedResponse<TattooStyle>>(`${this.api}/artists/styles/`),
    }).subscribe({
      next: ({ artists, appointments, styles }) => {
        this.totalArtists.set(artists.count);
        this.totalAppointments.set(appointments.count);
        this.totalStyles.set(styles.count);

        const appts = appointments.results;
        this.pendingCount.set(appts.filter(a => a.status === 'PENDING').length);
        this.approvedCount.set(appts.filter(a => a.status === 'APPROVED').length);
        this.recentAppointments.set(appts.slice(0, 5));
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.error.set('Error al cargar los datos del panel.');
      },
    });
  }

  statusLabel(s: string): string {
    const map: Record<string, string> = {
      PENDING: 'Pendiente', APPROVED: 'Aprobada',
      REJECTED: 'Rechazada', COUNTER_OFFER: 'Contraoferta',
    };
    return map[s] ?? s;
  }

  statusMod(s: string): string {
    const map: Record<string, string> = {
      PENDING: 'pending', APPROVED: 'approved',
      REJECTED: 'rejected', COUNTER_OFFER: 'counter',
    };
    return map[s] ?? 'pending';
  }

  formatDate(iso: string): string {
    return new Intl.DateTimeFormat('es-MX', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    }).format(new Date(iso));
  }
}
