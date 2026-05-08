import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './empty-state.component.html',
  styleUrl: './empty-state.component.scss',
})
export class EmptyStateComponent {
  icon     = input<string>('✦');
  title    = input.required<string>();
  subtitle = input<string>('');
  ctaLabel = input<string>('');
  ctaRoute = input<string>('');
}
