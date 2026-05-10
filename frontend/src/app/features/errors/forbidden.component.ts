import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-forbidden',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './forbidden.component.html',
  styleUrl: './not-found.component.scss',
})
export class ForbiddenComponent {
  private readonly authService = inject(AuthService);

  get dashboardRoute(): string {
    const type = this.authService.userType();
    if (type === 'STUDIO') return '/studio/dashboard';
    if (type === 'CLIENT') return '/client/dashboard';
    return '/';
  }
}
