import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { ArtistService } from '../services/artist.service';
import { PortfolioImage } from '../../../core/models/artist';

@Component({
  selector: 'app-portfolio-upload',
  standalone: true,
  imports: [FormsModule, DatePipe],
  templateUrl: './portfolio-upload.component.html',
  styleUrl: './portfolio-upload.component.scss',
})
export class PortfolioUploadComponent implements OnInit {
  private readonly artistService = inject(ArtistService);

  images: PortfolioImage[] = [];
  description = '';
  uploading = false;
  reordering = false;
  dragging = false;
  statusMessage = '';
  statusType: 'success' | 'error' | '' = '';
  viewerIndex: number | null = null;

  ngOnInit(): void {
    this.loadImages();
  }

  private loadImages(): void {
    this.artistService.getPortfolioImages().subscribe({
      next: (imgs) => (this.images = imgs),
      error: () => {
        this.images = [];
        this.setStatus('No se pudo cargar el portafolio.', 'error');
      },
    });
  }

  private setStatus(message: string, type: 'success' | 'error'): void {
    this.statusMessage = message;
    this.statusType = type;
  }

  private persistOrder(): void {
    if (this.reordering) return;

    this.reordering = true;
    this.artistService.reorderPortfolioImages(this.images.map((image) => image.id)).subscribe({
      next: (imgs) => {
        this.images = imgs;
        this.setStatus('Orden actualizado.', 'success');
        this.reordering = false;
      },
      error: () => {
        this.reordering = false;
        this.setStatus('No se pudo guardar el orden.', 'error');
        this.loadImages();
      },
    });
  }

  // ── Drag & Drop handlers ────────────────────────────────
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.dragging = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.dragging = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.dragging = false;
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.uploadFile(files[0]);
    }
  }

  // ── File input handler ──────────────────────────────────
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.uploadFile(input.files[0]);
      input.value = '';
    }
  }

  private uploadFile(file: File): void {
    if (this.uploading) return;
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      this.setStatus('Solo se permiten archivos JPG, PNG o WebP.', 'error');
      return;
    }

    this.uploading = true;
    this.artistService.uploadPortfolioImage(file, this.description).subscribe({
      next: (img) => {
        this.images = [img, ...this.images];
        this.description = '';
        this.uploading = false;
        this.setStatus('Imagen subida al portafolio.', 'success');
      },
      error: () => {
        this.uploading = false;
        this.setStatus('No se pudo subir la imagen.', 'error');
      },
    });
  }

  moveImage(index: number, direction: -1 | 1): void {
    if (this.uploading || this.reordering) return;

    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= this.images.length) return;

    const updatedImages = [...this.images];
    [updatedImages[index], updatedImages[targetIndex]] = [updatedImages[targetIndex], updatedImages[index]];
    this.images = updatedImages;
    this.persistOrder();
  }

  openViewer(index: number): void {
    this.viewerIndex = index;
  }

  closeViewer(): void {
    this.viewerIndex = null;
  }

  showNextImage(): void {
    if (this.viewerIndex === null || this.images.length === 0) return;
    this.viewerIndex = (this.viewerIndex + 1) % this.images.length;
  }

  showPreviousImage(): void {
    if (this.viewerIndex === null || this.images.length === 0) return;
    this.viewerIndex = (this.viewerIndex - 1 + this.images.length) % this.images.length;
  }

  deleteImage(id: number): void {
    this.artistService.deletePortfolioImage(id).subscribe({
      next: () => {
        this.images = this.images.filter((i) => i.id !== id);
        this.setStatus('Imagen eliminada.', 'success');
        this.persistOrder();
      },
      error: () => {
        this.setStatus('No se pudo eliminar la imagen.', 'error');
      },
    });
  }
}
