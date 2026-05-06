import {
  Component,
  ElementRef,
  ViewChild,
  forwardRef,
  AfterViewInit,
  OnDestroy,
  NgZone,
  inject,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-signature-pad',
  standalone: true,
  templateUrl: './signature-pad.component.html',
  styleUrl: './signature-pad.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SignaturePadComponent),
      multi: true,
    },
  ],
})
export class SignaturePadComponent implements ControlValueAccessor, AfterViewInit, OnDestroy {
  @ViewChild('canvas', { static: false }) canvasRef!: ElementRef<HTMLCanvasElement>;

  private readonly zone = inject(NgZone);

  isEmpty = true;
  isDisabled = false;

  private ctx!: CanvasRenderingContext2D;
  private drawing = false;
  private lastX = 0;
  private lastY = 0;
  private scrollParent: HTMLElement | null = null;
  private savedOverflow = '';

  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  ngAfterViewInit(): void {
    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    this.ctx = ctx;
    this.ctx.strokeStyle = '#d4a843';
    this.ctx.lineWidth = 2;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';

    this.scrollParent = this.findScrollParent(canvas);

    this.zone.runOutsideAngular(() => this.bindEvents(canvas));
  }

  ngOnDestroy(): void {
    if (this.canvasRef?.nativeElement) {
      this.unbindEvents(this.canvasRef.nativeElement);
    }
    this.restoreScroll();
  }

  // ── ControlValueAccessor ────────────────────────────────────────────────────

  writeValue(value: string): void {
    if (!value) this.clear(false);
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }

  // ── Canvas ──────────────────────────────────────────────────────────────────

  clear(notify = true): void {
    if (!this.ctx) return;
    const canvas = this.canvasRef.nativeElement;
    this.ctx.clearRect(0, 0, canvas.width, canvas.height);
    this.zone.run(() => {
      this.isEmpty = true;
      if (notify) {
        this.onChange('');
        this.onTouched();
      }
    });
  }

  private getPos(e: MouseEvent | Touch, canvas: HTMLCanvasElement): [number, number] {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return [
      (e.clientX - rect.left) * scaleX,
      (e.clientY - rect.top) * scaleY,
    ];
  }

  // Bloquea el scroll del contenedor padre mientras se dibuja
  private lockScroll(): void {
    if (this.scrollParent) {
      this.savedOverflow = this.scrollParent.style.overflowY;
      this.scrollParent.style.overflowY = 'hidden';
    }
  }

  private restoreScroll(): void {
    if (this.scrollParent) {
      this.scrollParent.style.overflowY = this.savedOverflow;
    }
  }

  // Sube por el DOM hasta encontrar el primer ancestro con scroll
  private findScrollParent(el: HTMLElement): HTMLElement | null {
    let node: HTMLElement | null = el.parentElement;
    while (node) {
      const overflow = window.getComputedStyle(node).overflowY;
      if (overflow === 'auto' || overflow === 'scroll') return node;
      node = node.parentElement;
    }
    return null;
  }

  private isTouchEvent(e: MouseEvent | TouchEvent): e is TouchEvent {
    return e.type.startsWith('touch');
  }

  private startDraw = (e: MouseEvent | TouchEvent): void => {
    if (this.isDisabled) return;
    e.preventDefault();
    e.stopPropagation();
    this.drawing = true;
    this.lockScroll();
    const canvas = this.canvasRef.nativeElement;
    const point = this.isTouchEvent(e) ? e.touches[0] : e as MouseEvent;
    [this.lastX, this.lastY] = this.getPos(point, canvas);
    this.ctx.beginPath();
    this.ctx.arc(this.lastX, this.lastY, 1, 0, Math.PI * 2);
    this.ctx.fill();
    this.zone.run(() => this.onTouched());
  };

  private draw = (e: MouseEvent | TouchEvent): void => {
    if (!this.drawing || this.isDisabled) return;
    e.preventDefault();
    e.stopPropagation();
    const canvas = this.canvasRef.nativeElement;
    const point = this.isTouchEvent(e) ? e.touches[0] : e as MouseEvent;
    const [x, y] = this.getPos(point, canvas);
    this.ctx.beginPath();
    this.ctx.moveTo(this.lastX, this.lastY);
    this.ctx.lineTo(x, y);
    this.ctx.stroke();
    this.lastX = x;
    this.lastY = y;
    if (this.isEmpty) {
      this.zone.run(() => { this.isEmpty = false; });
    }
  };

  private endDraw = (): void => {
    if (!this.drawing) return;
    this.drawing = false;
    this.restoreScroll();
    if (!this.isEmpty) {
      const dataUrl = this.canvasRef.nativeElement.toDataURL('image/png');
      this.zone.run(() => this.onChange(dataUrl));
    }
  };

  private bindEvents(canvas: HTMLCanvasElement): void {
    canvas.addEventListener('mousedown', this.startDraw);
    canvas.addEventListener('mousemove', this.draw);
    canvas.addEventListener('mouseup', this.endDraw);
    canvas.addEventListener('mouseleave', this.endDraw);
    canvas.addEventListener('touchstart', this.startDraw, { passive: false });
    canvas.addEventListener('touchmove', this.draw, { passive: false });
    canvas.addEventListener('touchend', this.endDraw);
    // Capturar mouseup global por si el usuario suelta fuera del canvas
    window.addEventListener('mouseup', this.endDraw);
  }

  private unbindEvents(canvas: HTMLCanvasElement): void {
    canvas.removeEventListener('mousedown', this.startDraw);
    canvas.removeEventListener('mousemove', this.draw);
    canvas.removeEventListener('mouseup', this.endDraw);
    canvas.removeEventListener('mouseleave', this.endDraw);
    canvas.removeEventListener('touchstart', this.startDraw);
    canvas.removeEventListener('touchmove', this.draw);
    canvas.removeEventListener('touchend', this.endDraw);
    window.removeEventListener('mouseup', this.endDraw);
  }
}
