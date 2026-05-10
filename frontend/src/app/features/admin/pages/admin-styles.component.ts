import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '@env/environment';
import { TattooStyle } from '../../../core/models/artist';

interface PaginatedResponse<T> { count: number; results: T[]; }

@Component({
  selector: 'app-admin-styles',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './admin-styles.component.html',
  styleUrl: './admin-styles.component.scss',
})
export class AdminStylesComponent implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly fb   = inject(FormBuilder);
  private readonly api  = `${environment.apiUrl}/artists/styles/`;

  styles  = signal<TattooStyle[]>([]);
  loading = signal(true);
  error   = signal('');

  // ── Crear ──────────────────────────────────────────────
  showCreateForm = signal(false);
  creating       = signal(false);
  createError    = signal('');
  createForm = this.fb.group({ name: ['', [Validators.required, Validators.maxLength(100)]] });

  // ── Editar ─────────────────────────────────────────────
  editingId    = signal<number | null>(null);
  editSaving   = signal(false);
  editError    = signal('');
  editForm = this.fb.group({ name: ['', [Validators.required, Validators.maxLength(100)]] });

  // ── Eliminar ───────────────────────────────────────────
  deletingId   = signal<number | null>(null);
  deleteError  = signal('');

  ngOnInit(): void {
    this.load();
  }

  private load(): void {
    this.loading.set(true);
    this.error.set('');
    this.http.get<PaginatedResponse<TattooStyle>>(this.api).subscribe({
      next: (res) => {
        this.styles.set(res.results);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.error.set('Error al cargar los estilos.');
      },
    });
  }

  // ── Crear ──────────────────────────────────────────────
  openCreate(): void {
    this.createForm.reset();
    this.createError.set('');
    this.showCreateForm.set(true);
    this.editingId.set(null);
  }

  cancelCreate(): void {
    this.showCreateForm.set(false);
    this.createError.set('');
  }

  submitCreate(): void {
    if (this.createForm.invalid) return;
    this.creating.set(true);
    this.createError.set('');

    this.http.post<TattooStyle>(this.api, this.createForm.value).subscribe({
      next: (style) => {
        this.styles.update(list => [...list, style]);
        this.creating.set(false);
        this.showCreateForm.set(false);
        this.createForm.reset();
      },
      error: (err) => {
        this.creating.set(false);
        this.createError.set(err.error?.name?.[0] ?? err.error?.detail ?? 'Error al crear el estilo.');
      },
    });
  }

  // ── Editar ─────────────────────────────────────────────
  startEdit(style: TattooStyle): void {
    this.editingId.set(style.id);
    this.editError.set('');
    this.editForm.setValue({ name: style.name });
    this.showCreateForm.set(false);
  }

  cancelEdit(): void {
    this.editingId.set(null);
    this.editError.set('');
  }

  submitEdit(id: number): void {
    if (this.editForm.invalid) return;
    this.editSaving.set(true);
    this.editError.set('');

    this.http.patch<TattooStyle>(`${this.api}${id}/`, this.editForm.value).subscribe({
      next: (updated) => {
        this.styles.update(list => list.map(s => s.id === id ? updated : s));
        this.editSaving.set(false);
        this.editingId.set(null);
      },
      error: (err) => {
        this.editSaving.set(false);
        this.editError.set(err.error?.name?.[0] ?? err.error?.detail ?? 'Error al guardar.');
      },
    });
  }

  // ── Eliminar ───────────────────────────────────────────
  confirmDelete(id: number): void {
    this.deletingId.set(id);
    this.deleteError.set('');
  }

  cancelDelete(): void {
    this.deletingId.set(null);
    this.deleteError.set('');
  }

  submitDelete(id: number): void {
    this.http.delete(`${this.api}${id}/`).subscribe({
      next: () => {
        this.styles.update(list => list.filter(s => s.id !== id));
        this.deletingId.set(null);
      },
      error: (err) => {
        this.deleteError.set(err.error?.detail ?? 'Error al eliminar el estilo.');
        this.deletingId.set(null);
      },
    });
  }
}
