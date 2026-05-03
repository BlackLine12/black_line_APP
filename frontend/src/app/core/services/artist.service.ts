import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';

export interface CityCount {
  city: string;
  count: number;
}

@Injectable({ providedIn: 'root' })
export class ArtistService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/artists`;

  getCityCounts(): Observable<CityCount[]> {
    return this.http.get<CityCount[]>(`${this.base}/cities/`);
  }
}
