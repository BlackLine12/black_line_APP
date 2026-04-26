import {
  Component,
  Input,
  Output,
  EventEmitter,
  HostBinding,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

export type BtnVariant = 'gold' | 'outline' | 'ghost' | 'danger' | 'link';
export type BtnSize    = 'sm' | 'md' | 'lg';

/**
 * BtnComponent — Botón reutilizable del Design System BlackLine.
 *
 * Uso básico:
 *   <app-btn>Texto</app-btn>
 *   <app-btn variant="outline" size="lg">Ver más</app-btn>
 *   <app-btn variant="ghost" [loading]="true">Cargando</app-btn>
 *   <app-btn [routerLink]="['/client/cotizador']">Ir al cotizador</app-btn>
 *   <app-btn [disabled]="true">Bloqueado</app-btn>
 */
@Component({
  selector: 'app-btn',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './btn.component.html',
  styleUrl:    './btn.component.scss',
})
export class BtnComponent {
  /** Variante visual del botón */
  @Input() variant: BtnVariant = 'gold';

  /** Tamaño del botón */
  @Input() size: BtnSize = 'md';

  /** Tipo HTML del botón (cuando actúa como <button>) */
  @Input() type: 'button' | 'submit' | 'reset' = 'button';

  /** Deshabilita el botón */
  @Input() disabled = false;

  /** Muestra spinner de carga y deshabilita la interacción */
  @Input() loading = false;

  /** Convierte el componente en un enlace de router (routerLink) */
  @Input() routerLink: string | any[] | null = null;

  /** Convierte el componente en un <a href> externo */
  @Input() href: string | null = null;

  /** Abre el href en nueva pestaña */
  @Input() target: '_blank' | '_self' = '_self';

  /** Icono SVG (HTML string) que aparece a la izquierda del texto */
  @Input() iconLeft: string | null = null;

  /** Icono SVG (HTML string) que aparece a la derecha del texto */
  @Input() iconRight: string | null = null;

  /** Emite clic cuando el botón no está deshabilitado ni cargando */
  @Output() btnClick = new EventEmitter<MouseEvent>();

  @HostBinding('style.display') display = 'contents';

  get isDisabled(): boolean {
    return this.disabled || this.loading;
  }

  get isLink(): boolean {
    return !!this.routerLink || !!this.href;
  }

  onClick(event: MouseEvent): void {
    if (!this.isDisabled) {
      this.btnClick.emit(event);
    }
  }

  /** Clases CSS calculadas para el elemento raíz */
  get classes(): string[] {
    return [
      'bl-btn',
      `bl-btn--${this.variant}`,
      `bl-btn--${this.size}`,
      this.isDisabled ? 'bl-btn--disabled' : '',
      this.loading    ? 'bl-btn--loading'  : '',
    ].filter(Boolean);
  }
}
