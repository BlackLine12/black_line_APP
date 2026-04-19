import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.scss',
})
export class LandingComponent {
  readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  goToDashboard(): void {
    this.authService.redirectByRole();
  }

  goToRegisterClient(): void {
    this.router.navigate(['/auth/register'], { queryParams: { role: 'CLIENT' } });
  }

  goToRegisterStudio(): void {
    this.router.navigate(['/auth/register'], { queryParams: { role: 'STUDIO' } });
  }
}
