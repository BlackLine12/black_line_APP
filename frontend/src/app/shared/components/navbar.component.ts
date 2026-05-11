import { Component, inject, computed, signal, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { MediaUrlService } from '../../core/services/media-url.service';


@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent implements OnInit {
  readonly authService = inject(AuthService);
  private readonly mediaUrl = inject(MediaUrlService);
  readonly mobileMenuOpen = signal(false);

  readonly isAdmin  = computed(() => this.authService.userType() === 'ADMIN');
  readonly isStudio = computed(() => this.authService.userType() === 'STUDIO');
  readonly isClient = computed(() => this.authService.userType() === 'CLIENT');
  readonly isGuest  = computed(() => !this.authService.isAuthenticated());

  readonly userName = computed(() => {
    const u = this.authService.user();
    if (!u) return '';
    return u.first_name ? `${u.first_name} ${u.last_name}`.trim() : u.username;
  });

  readonly userPhoto = computed(() => {
    const u = this.authService.user();
    return u?.profile_photo ? this.mediaUrl.resolve(u.profile_photo) : null;
  });

  ngOnInit(): void {}

  logout(): void {
    this.authService.logout();
  }

  toggleMenu(): void {
    this.mobileMenuOpen.update((v) => !v);
  }

  goToDashboard(): void {
    this.authService.redirectByRole();
  }
}
