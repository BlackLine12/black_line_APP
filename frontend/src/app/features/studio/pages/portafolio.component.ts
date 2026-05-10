import { Component, OnInit, inject, HostListener } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ArtistService } from '../services/artist.service';
import { MediaUrlService } from '../../../core/services/media-url.service';
import { PortfolioImage } from '../../../core/models/artist';

@Component({
  selector: 'app-portafolio',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe],
  templateUrl: './portafolio.component.html',
  styleUrl: './portafolio.component.scss',
})
export class PortafolioComponent implements OnInit {
  private readonly artistService = inject(ArtistService);
  readonly mediaUrl              = inject(MediaUrlService);

  images: PortfolioImage[] = [];
  loadingList  = true;
  reordering   = false;
  
  // ── Upload State ──
  isUploadModalOpen = false;
  uploading = false;
  fileToUpload: File | null = null;
  uploadPreview: string | null = null;
  uploadDescription = '';

  // ── Edit State ──
  isEditModalOpen = false;
  savingEdit = false;
  imageToEdit: PortfolioImage | null = null;
  editDescription = '';


  statusMessage = '';
  statusType: 'success' | 'error' | '' = '';

  viewerIndex: number | null = null;

  ngOnInit(): void {
    this.loadImages();
  }

  // ── Navegación con teclado en el lightbox ─────────────────────────────────
  @HostListener('window:keydown', ['$event'])
  onKeyDown(evt: KeyboardEvent): void {
    if (this.viewerIndex === null) return;
    if (evt.key === 'ArrowRight' || evt.key === 'ArrowDown') this.nextImage();
    if (evt.key === 'ArrowLeft'  || evt.key === 'ArrowUp')   this.prevImage();
    if (evt.key === 'Escape') this.closeViewer();
  }

  private loadImages(): void {
    this.loadingList = true;
    this.artistService.getPortfolioImages().subscribe({
      next: (imgs) => { this.images = imgs; this.loadingList = false; },
      error: () => {
        this.images = [];
        this.loadingList = false;
        this.setStatus('No se pudo cargar el portafolio.', 'error');
      },
    });
  }

  private setStatus(message: string, type: 'success' | 'error'): void {
    this.statusMessage = message;
    this.statusType    = type;
    setTimeout(() => { this.statusMessage = ''; this.statusType = ''; }, 3500);
  }

  // ── Modals & Upload Flow ──────────────────────────────────────────────────
  openUploadModal(): void {
    this.isUploadModalOpen = true;
    this.uploadDescription = '';
    this.fileToUpload = null;
    this.uploadPreview = null;
  }

  closeUploadModal(): void {
    this.isUploadModalOpen = false;
    this.fileToUpload = null;
    this.uploadPreview = null;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const valid = ['image/jpeg', 'image/png', 'image/webp'];
      if (!valid.includes(file.type)) {
        this.setStatus('Solo se permiten archivos JPG, PNG o WebP.', 'error');
        return;
      }
      this.fileToUpload = file;
      this.uploadPreview = URL.createObjectURL(file);
      input.value = ''; // reset
    }
  }

  confirmUpload(): void {
    if (!this.fileToUpload || this.uploading) return;
    this.uploading = true;
    this.artistService.uploadPortfolioImage(this.fileToUpload, this.uploadDescription).subscribe({
      next: (img) => {
        this.images = [img, ...this.images];
        this.uploading = false;
        this.closeUploadModal();
        this.setStatus('Imagen subida correctamente.', 'success');
      },
      error: () => {
        this.uploading = false;
        this.setStatus('No se pudo subir la imagen.', 'error');
      },
    });
  }

  // ── Edit Flow ─────────────────────────────────────────────────────────────
  openEditModal(img: PortfolioImage): void {
    this.imageToEdit = img;
    this.editDescription = img.description || '';
    this.isEditModalOpen = true;
  }

  closeEditModal(): void {
    this.isEditModalOpen = false;
    this.imageToEdit = null;
  }

  confirmEdit(): void {
    if (!this.imageToEdit || this.savingEdit) return;
    this.savingEdit = true;
    this.artistService.updatePortfolioImage(this.imageToEdit.id, { description: this.editDescription }).subscribe({
      next: (updated) => {
        this.savingEdit = false;
        const idx = this.images.findIndex(i => i.id === updated.id);
        if (idx !== -1) {
          this.images[idx] = updated;
        }
        this.closeEditModal();
        this.setStatus('Descripción actualizada.', 'success');
      },
      error: () => {
        this.savingEdit = false;
        this.setStatus('No se pudo actualizar.', 'error');
      }
    });
  }


  // ── Reordenar ─────────────────────────────────────────────────────────────
  moveImage(index: number, direction: -1 | 1): void {
    if (this.uploading || this.reordering) return;
    const target = index + direction;
    if (target < 0 || target >= this.images.length) return;

    const updated = [...this.images];
    [updated[index], updated[target]] = [updated[target], updated[index]];
    this.images = updated;

    this.reordering = true;
    this.artistService.reorderPortfolioImages(this.images.map(i => i.id)).subscribe({
      next: (imgs) => { this.images = imgs; this.reordering = false; },
      error: () => { this.reordering = false; this.loadImages(); },
    });
  }

  // ── Eliminar ──────────────────────────────────────────────────────────────
  deleteImage(id: number): void {
    this.artistService.deletePortfolioImage(id).subscribe({
      next: () => {
        this.images = this.images.filter(i => i.id !== id);
        if (this.viewerIndex !== null) this.viewerIndex = null;
        this.setStatus('Imagen eliminada.', 'success');
      },
      error: () => this.setStatus('No se pudo eliminar.', 'error'),
    });
  }

  // ── Lightbox ──────────────────────────────────────────────────────────────
  openViewer(index: number): void  { this.viewerIndex = index; }
  closeViewer(): void              { this.viewerIndex = null; }

  nextImage(): void {
    if (this.viewerIndex === null) return;
    this.viewerIndex = (this.viewerIndex + 1) % this.images.length;
  }

  prevImage(): void {
    if (this.viewerIndex === null) return;
    this.viewerIndex = (this.viewerIndex - 1 + this.images.length) % this.images.length;
  }

  // ── Helpers ───────────────────────────────────────────────────────────────
  imageSrc(img: PortfolioImage): string {
    return this.mediaUrl.resolve(img.image) ?? '';
  }
}
