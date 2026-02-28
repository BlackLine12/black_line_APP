import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent {
  readonly authService = inject(AuthService);
  mobileMenuOpen = false;

  get isStudio(): boolean {
    return this.authService.userType() === 'STUDIO';
  }

  get isClient(): boolean {
    return this.authService.userType() === 'CLIENT';
  }

  get userName(): string {
    const u = this.authService.user();
    if (!u) return '';
    return u.first_name ? `${u.first_name} ${u.last_name}`.trim() : u.username;
  }

  logout(): void {
    this.authService.logout();
  }

  toggleMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }
}
