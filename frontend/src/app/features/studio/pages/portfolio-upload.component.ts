import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ArtistService } from '../services/artist.service';
import { PortfolioImage } from '../../../core/models/artist';

@Component({
  selector: 'app-portfolio-upload',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './portfolio-upload.component.html',
  styleUrl: './portfolio-upload.component.scss',
})
export class PortfolioUploadComponent implements OnInit {
  private readonly artistService = inject(ArtistService);

  images: PortfolioImage[] = [];
  description = '';
  uploading = false;
  dragging = false;

  ngOnInit(): void {
    this.loadImages();
  }

  private loadImages(): void {
    this.artistService.getPortfolioImages().subscribe({
      next: (imgs) => (this.images = imgs),
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
    if (!validTypes.includes(file.type)) return;

    this.uploading = true;
    this.artistService.uploadPortfolioImage(file, this.description).subscribe({
      next: (img) => {
        this.images = [img, ...this.images];
        this.description = '';
        this.uploading = false;
      },
      error: () => (this.uploading = false),
    });
  }

  deleteImage(id: number): void {
    this.artistService.deletePortfolioImage(id).subscribe({
      next: () => (this.images = this.images.filter((i) => i.id !== id)),
    });
  }
}
