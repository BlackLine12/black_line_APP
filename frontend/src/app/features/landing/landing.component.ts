import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="min-h-screen bg-gray-950 text-gray-100">

      <!-- Nav -->
      <nav class="animate-fade-in-down border-b border-gray-800 bg-gray-950/80 backdrop-blur-md">
        <div class="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <a routerLink="/" class="text-2xl font-extrabold tracking-tight text-white transition-transform hover:scale-105">
            Black<span class="text-indigo-500">Line</span>
          </a>
          <div class="flex items-center gap-3">
            @if (authService.isAuthenticated()) {
              <button (click)="goToDashboard()"
                class="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-all duration-200 hover:bg-indigo-500 hover:shadow-lg hover:shadow-indigo-500/25 active:scale-95">
                Ir al Panel
              </button>
            } @else {
              <a routerLink="/auth/login"
                class="rounded-lg border border-gray-700 px-4 py-2 text-sm font-medium text-gray-300 transition-all duration-200 hover:border-indigo-500 hover:text-white">
                Iniciar Sesión
              </a>
              <a routerLink="/auth/register"
                class="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-all duration-200 hover:bg-indigo-500 hover:shadow-lg hover:shadow-indigo-500/25 active:scale-95">
                Registrarse
              </a>
            }
          </div>
        </div>
      </nav>

      <!-- Hero -->
      <section class="relative overflow-hidden">
        <!-- Animated background blobs -->
        <div class="absolute -left-32 -top-32 h-96 w-96 animate-float rounded-full bg-indigo-600/5 blur-3xl"></div>
        <div class="absolute -right-32 top-10 h-80 w-80 animate-float rounded-full bg-purple-600/5 blur-3xl delay-500" style="animation-delay:1.5s"></div>

        <div class="absolute inset-0 bg-gradient-to-b from-indigo-600/10 via-transparent to-transparent"></div>
        <div class="relative mx-auto max-w-4xl px-4 py-24 text-center sm:py-32 lg:py-40">
          <h1 class="animate-fade-in-up text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Cotiza y agenda tu
            <span class="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent"> tatuaje perfecto</span>
          </h1>
          <p class="animate-fade-in-up mx-auto mt-6 max-w-2xl text-lg text-gray-400 delay-200">
            BlackLine conecta clientes con los mejores artistas de tu ciudad. Explora portafolios,
            cotiza al instante y reserva tu cita — todo en un solo lugar.
          </p>
          <div class="animate-fade-in-up mt-10 flex flex-col items-center gap-4 delay-400 sm:flex-row sm:justify-center">
            <a routerLink="/auth/register"
              class="w-full rounded-xl bg-indigo-600 px-8 py-3 text-base font-semibold text-white shadow-lg transition-all duration-200 hover:bg-indigo-500 hover:shadow-xl hover:shadow-indigo-500/25 active:scale-95 sm:w-auto">
              Comenzar Gratis
            </a>
            <a routerLink="/auth/login"
              class="w-full rounded-xl border border-gray-700 px-8 py-3 text-base font-medium text-gray-300 transition-all duration-200 hover:border-indigo-500 hover:text-white sm:w-auto">
              Ya tengo cuenta
            </a>
          </div>
        </div>
      </section>

      <!-- Features -->
      <section class="border-t border-gray-800 bg-gray-900/50 px-4 py-20 sm:px-6">
        <div class="mx-auto max-w-6xl">
          <h2 class="animate-fade-in mb-12 text-center text-2xl font-bold text-white sm:text-3xl">¿Cómo funciona?</h2>
          <div class="grid grid-cols-1 gap-8 sm:grid-cols-3">

            <!-- Feature 1 -->
            <div class="animate-fade-in-up group rounded-2xl border border-gray-800 bg-gray-900 p-6 text-center transition-all duration-300 hover:-translate-y-1 hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-500/10 delay-100">
              <div class="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600/20 text-indigo-400 transition-transform duration-300 group-hover:scale-110">
                <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"/>
                </svg>
              </div>
              <h3 class="mb-2 text-lg font-semibold text-white">Explora Artistas</h3>
              <p class="text-sm text-gray-400">Navega portafolios, filtra por estilo y encuentra al artista ideal para tu diseño.</p>
            </div>

            <!-- Feature 2 -->
            <div class="animate-fade-in-up group rounded-2xl border border-gray-800 bg-gray-900 p-6 text-center transition-all duration-300 hover:-translate-y-1 hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-500/10 delay-300">
              <div class="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600/20 text-indigo-400 transition-transform duration-300 group-hover:scale-110">
                <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <h3 class="mb-2 text-lg font-semibold text-white">Cotiza al Instante</h3>
              <p class="text-sm text-gray-400">Obtén una estimación de precio basada en tamaño, estilo y complejidad del tatuaje.</p>
            </div>

            <!-- Feature 3 -->
            <div class="animate-fade-in-up group rounded-2xl border border-gray-800 bg-gray-900 p-6 text-center transition-all duration-300 hover:-translate-y-1 hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-500/10 delay-500">
              <div class="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600/20 text-indigo-400 transition-transform duration-300 group-hover:scale-110">
                <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"/>
                </svg>
              </div>
              <h3 class="mb-2 text-lg font-semibold text-white">Agenda tu Cita</h3>
              <p class="text-sm text-gray-400">Reserva directamente con el artista, confirma fecha y hora, y prepárate para tu sesión.</p>
            </div>
          </div>
        </div>
      </section>

      <!-- CTA Section -->
      <section class="px-4 py-20 sm:px-6">
        <div class="mx-auto max-w-3xl animate-scale-in rounded-3xl border border-gray-800 bg-gradient-to-br from-indigo-900/30 to-purple-900/20 p-10 text-center shadow-2xl">
          <h2 class="text-2xl font-bold text-white sm:text-3xl">¿Eres tatuador?</h2>
          <p class="mx-auto mt-3 max-w-lg text-gray-400">Únete a BlackLine, muestra tu portafolio y recibe cotizaciones directamente de clientes cerca de ti.</p>
          <a routerLink="/auth/register"
            class="mt-6 inline-block rounded-xl bg-indigo-600 px-8 py-3 text-base font-semibold text-white shadow-lg transition-all duration-200 hover:bg-indigo-500 hover:shadow-xl hover:shadow-indigo-500/25 active:scale-95">
            Registrar mi Estudio
          </a>
        </div>
      </section>

      <!-- Footer -->
      <footer class="border-t border-gray-800 px-4 py-8">
        <p class="text-center text-sm text-gray-500">&copy; 2026 BlackLine. Todos los derechos reservados.</p>
      </footer>
    </div>
  `,
})
export class LandingComponent {
  readonly authService = inject(AuthService);

  goToDashboard(): void {
    this.authService.redirectByRole();
  }
}
