import {
  Component,
  ElementRef,
  ViewChild,
  forwardRef,
  ChangeDetectionStrategy,
  signal,
  OnDestroy,
  AfterViewInit,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-signature-pad',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
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
  @ViewChild('canvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

  isEmpty = signal(true);
  isDisabled = signal(false);

  private ctx!: CanvasRenderingContext2D;
  private drawing = false;
  private lastX = 0;
  private lastY = 0;

  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  ngAfterViewInit(): void {
    const canvas = this.canvasRef.nativeElement;
    this.ctx = canvas.getContext('2d')!;
    this.ctx.strokeStyle = '#d4a843';
    this.ctx.lineWidth = 2;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
    this.bindEvents(canvas);
  }

  ngOnDestroy(): void {
    const canvas = this.canvasRef.nativeElement;
    this.unbindEvents(canvas);
  }

  // ── ControlValueAccessor ───────────────────────────────────────────────────

  writeValue(value: string): void {
    if (!value) {
      this.clear(false);
    }
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled.set(isDisabled);
  }

  // ── Canvas drawing ─────────────────────────────────────────────────────────

  clear(notify = true): void {
    const canvas = this.canvasRef.nativeElement;
    this.ctx.clearRect(0, 0, canvas.width, canvas.height);
    this.isEmpty.set(true);
    if (notify) {
      this.onChange('');
      this.onTouched();
    }
  }

  private getPos(e: MouseEvent | Touch, canvas: HTMLCanvasElement): [number, number] {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clientX = 'clientX' in e ? e.clientX : (e as Touch).clientX;
    const clientY = 'clientY' in e ? e.clientY : (e as Touch).clientY;
    return [(clientX - rect.left) * scaleX, (clientY - rect.top) * scaleY];
  }

  private startDraw = (e: MouseEvent | TouchEvent): void => {
    if (this.isDisabled()) return;
    e.preventDefault();
    this.drawing = true;
    const canvas = this.canvasRef.nativeElement;
    const point = e instanceof TouchEvent ? e.touches[0] : e;
    [this.lastX, this.lastY] = this.getPos(point, canvas);
    this.ctx.beginPath();
    this.ctx.arc(this.lastX, this.lastY, 1, 0, Math.PI * 2);
    this.ctx.fill();
    this.onTouched();
  };

  private draw = (e: MouseEvent | TouchEvent): void => {
    if (!this.drawing || this.isDisabled()) return;
    e.preventDefault();
    const canvas = this.canvasRef.nativeElement;
    const point = e instanceof TouchEvent ? e.touches[0] : e;
    const [x, y] = this.getPos(point, canvas);
    this.ctx.beginPath();
    this.ctx.moveTo(this.lastX, this.lastY);
    this.ctx.lineTo(x, y);
    this.ctx.stroke();
    this.lastX = x;
    this.lastY = y;
    this.isEmpty.set(false);
  };

  private endDraw = (): void => {
    if (!this.drawing) return;
    this.drawing = false;
    if (!this.isEmpty()) {
      this.onChange(this.canvasRef.nativeElement.toDataURL('image/png'));
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
  }

  private unbindEvents(canvas: HTMLCanvasElement): void {
    canvas.removeEventListener('mousedown', this.startDraw);
    canvas.removeEventListener('mousemove', this.draw);
    canvas.removeEventListener('mouseup', this.endDraw);
    canvas.removeEventListener('mouseleave', this.endDraw);
    canvas.removeEventListener('touchstart', this.startDraw);
    canvas.removeEventListener('touchmove', this.draw);
    canvas.removeEventListener('touchend', this.endDraw);
  }
}
