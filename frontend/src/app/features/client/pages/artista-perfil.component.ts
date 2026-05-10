import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ArtistService } from '../../../core/services/artist.service';
import { MediaUrlService } from '../../../core/services/media-url.service';
import { ArtistProfile, PortfolioImage } from '../../../core/models/artist';

@Component({
  selector: 'app-artista-perfil',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './artista-perfil.component.html',
  styleUrl: './artista-perfil.component.scss',
})
export class ArtistaPerfilComponent implements OnInit {
  private readonly route         = inject(ActivatedRoute);
  private readonly router        = inject(Router);
  private readonly artistService = inject(ArtistService);
  private readonly mediaUrl      = inject(MediaUrlService);

  profile      = signal<ArtistProfile | null>(null);
  loading      = signal(true);
  error        = signal('');
  lightboxImg  = signal<PortfolioImage | null>(null);

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.artistService.getProfileById(id).subscribe({
      next:  (p) => { this.profile.set(p); this.loading.set(false); },
      error: ()  => { this.error.set('No se pudo cargar el perfil del artista.'); this.loading.set(false); },
    });
  }

  openLightbox(img: PortfolioImage): void  { this.lightboxImg.set(img); }
  closeLightbox(): void                    { this.lightboxImg.set(null); }

  formatRate(rate: string): string {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(Number(rate));
  }

  back(): void { this.router.navigate(['/client/match']); }

  resolveImg(url: string | null | undefined): string {
    return this.mediaUrl.resolve(url) ?? '';
  }
}
