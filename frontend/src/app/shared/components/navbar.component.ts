import { Component, inject, computed, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent {
  readonly authService = inject(AuthService);
  readonly mobileMenuOpen = signal(false);

  readonly isAdmin = computed(() => this.authService.userType() === 'ADMIN');
  readonly isStudio = computed(() => this.authService.userType() === 'STUDIO' || this.isAdmin());
  readonly isClient = computed(() => this.authService.userType() === 'CLIENT' || this.isAdmin());
  readonly userName = computed(() => {
    const u = this.authService.user();
    if (!u) return '';
    return u.first_name ? `${u.first_name} ${u.last_name}`.trim() : u.username;
  });

  logout(): void {
    this.authService.logout();
  }

  toggleMenu(): void {
    this.mobileMenuOpen.update((v) => !v);
  }
}
