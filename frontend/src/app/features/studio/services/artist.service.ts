import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { ArtistProfile, TattooStyle, PortfolioImage } from '../../../core/models/artist';

@Injectable({ providedIn: 'root' })
export class ArtistService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/artists`;

  // ── Tattoo Styles ──────────────────────────────────────────
  getStyles(): Observable<TattooStyle[]> {
    return this.http.get<TattooStyle[]>(`${this.baseUrl}/styles/`);
  }

  // ── Artist Profile (current user) ─────────────────────────
  getMyProfile(): Observable<ArtistProfile> {
    return this.http.get<ArtistProfile>(`${this.baseUrl}/profiles/me/`);
  }

  updateMyProfile(data: Partial<ArtistProfile>): Observable<ArtistProfile> {
    return this.http.patch<ArtistProfile>(`${this.baseUrl}/profiles/me/`, data);
  }

  getProfile(id: number): Observable<ArtistProfile> {
    return this.http.get<ArtistProfile>(`${this.baseUrl}/profiles/${id}/`);
  }

  // ── Portfolio Images ───────────────────────────────────────
  getPortfolioImages(): Observable<PortfolioImage[]> {
    return this.http.get<PortfolioImage[]>(`${this.baseUrl}/portfolio/`);
  }

  uploadPortfolioImage(file: File, description: string = ''): Observable<PortfolioImage> {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('description', description);
    return this.http.post<PortfolioImage>(`${this.baseUrl}/portfolio/`, formData);
  }

  reorderPortfolioImages(orderedIds: number[]): Observable<PortfolioImage[]> {
    return this.http.post<PortfolioImage[]>(`${this.baseUrl}/portfolio/reorder/`, {
      ordered_ids: orderedIds,
    });
  }

  deletePortfolioImage(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/portfolio/${id}/`);
  }
}
