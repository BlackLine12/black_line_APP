import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AgendaService } from '../services/agenda.service';
import { CalendarBlock } from '../../../core/models/quote';

@Component({
  selector: 'app-agenda',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DatePipe],
  templateUrl: './agenda.component.html',
  styleUrl: './agenda.component.scss',
})
export class AgendaComponent implements OnInit {
  private readonly agendaService = inject(AgendaService);
  private readonly fb = inject(FormBuilder);

  calendarBlocks: CalendarBlock[] = [];
  loading = true;
  showBlockForm = false;
  saving = false;

  blockForm!: FormGroup;
  message = '';
  messageSuccess = false;

  ngOnInit(): void {
    this.blockForm = this.fb.group({
      start_datetime: ['', Validators.required],
      end_datetime:   ['', Validators.required],
      reason:         ['', Validators.maxLength(255)],
    });
    this.loadBlocks();
  }

  private loadBlocks(): void {
    this.loading = true;
    this.agendaService.getCalendarBlocks().subscribe({
      next: blocks => {
        this.calendarBlocks = blocks;
        this.loading = false;
      },
      error: () => { this.loading = false; },
    });
  }

  toggleForm(): void {
    this.showBlockForm = !this.showBlockForm;
    if (!this.showBlockForm) this.blockForm.reset();
  }

  submit(): void {
    if (this.blockForm.invalid || this.saving) return;
    this.saving = true;
    this.agendaService.createCalendarBlock(this.blockForm.value).subscribe({
      next: block => {
        this.calendarBlocks = [...this.calendarBlocks, block];
        this.blockForm.reset();
        this.showBlockForm = false;
        this.saving = false;
        this.setMessage('Bloqueo creado.', true);
      },
      error: () => {
        this.saving = false;
        this.setMessage('No se pudo crear el bloqueo.', false);
      },
    });
  }

  deleteBlock(id: number): void {
    this.agendaService.deleteCalendarBlock(id).subscribe({
      next: () => {
        this.calendarBlocks = this.calendarBlocks.filter(b => b.id !== id);
        this.setMessage('Bloqueo eliminado.', true);
      },
      error: () => this.setMessage('No se pudo eliminar el bloqueo.', false),
    });
  }

  private setMessage(text: string, success: boolean): void {
    this.message = text;
    this.messageSuccess = success;
    setTimeout(() => (this.message = ''), 3500);
  }
}
