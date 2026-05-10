# Artist Dashboard & Agenda — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix 3 known bugs in the artist dashboard + portfolio section, add real stats from the API, make the progress nav functional, and fully implement the empty Agenda component with appointment management and calendar block controls.

**Architecture:** A new `GET /api/artists/profiles/me/stats/` endpoint aggregates appointment counts from the quotes app without coupling the artists app at the model level. A new `AgendaService` on the frontend keeps appointment/calendar-block HTTP calls isolated from `ArtistService`. The Agenda component is self-contained: appointments list with inline status actions, and a calendar-block CRUD section below it.

**Tech Stack:** Django REST Framework, Angular 19 standalone components, RxJS, Tailwind CSS + SCSS BEM, BlackLine dark luxury design tokens (`#c9a84c` gold, `#0c0a08` background).

---

## File Map

| File | Action | Responsibility |
|------|--------|---------------|
| `backend/config/settings.py` | Modify | Fix `MEDIA_URL` leading slash |
| `backend/apps/artists/views.py` | Modify | Add `my_stats` action |
| `frontend/src/app/core/models/artist.ts` | Modify | Add `ArtistStats` interface |
| `frontend/src/app/core/models/quote.ts` | Modify | Add `CalendarBlock` interface |
| `frontend/src/app/features/studio/services/artist.service.ts` | Modify | Add `getStats()` |
| `frontend/src/app/features/studio/services/agenda.service.ts` | **Create** | Appointments + CalendarBlocks HTTP |
| `frontend/src/app/features/studio/pages/portfolio-upload.component.ts` | Modify | Fix delete→reorder bug, auto-clear status |
| `frontend/src/app/features/studio/pages/dashboard.component.ts` | Modify | Load real stats, scroll-nav helper |
| `frontend/src/app/features/studio/pages/dashboard.component.html` | Modify | Section IDs, real stat values, scroll click handlers |
| `frontend/src/app/features/studio/pages/agenda.component.ts` | Modify | Full implementation |
| `frontend/src/app/features/studio/pages/agenda.component.html` | Modify | Full template |
| `frontend/src/app/features/studio/pages/agenda.component.scss` | Modify | Full styles |

---

## Task 1 — Backend: Fix MEDIA_URL (critical image bug)

**Files:**
- Modify: `backend/config/settings.py:86-88`

Without the leading `/`, Django's `FileField.url` returns `media/portfolio/…` (relative). DRF then calls `request.build_absolute_uri()` against the current API path, producing a broken URL like `http://localhost:8000/api/artists/portfolio/media/…`. The fix is a single character.

- [ ] **Step 1: Apply fix**

In `backend/config/settings.py` replace lines 85-88:

```python
STATIC_URL = "static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
MEDIA_URL = "media/"
MEDIA_ROOT = BASE_DIR / "media"
```

with:

```python
STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"
```

- [ ] **Step 2: Verify**

Start the backend and upload a portfolio image. The `image` field in the JSON response must start with `http://localhost:8000/media/portfolio/…`, not `media/…`.

- [ ] **Step 3: Commit**

```bash
git add backend/config/settings.py
git commit -m "fix: add leading slash to MEDIA_URL and STATIC_URL"
```

---

## Task 2 — Backend: Artist Stats endpoint

**Files:**
- Modify: `backend/apps/artists/views.py`

Adds `GET /api/artists/profiles/me/stats/` returning appointment counts and portfolio image count. Imports from `apps.quotes` at query time to avoid circular imports at module level.

- [ ] **Step 1: Add the `my_stats` action**

In `backend/apps/artists/views.py`, add this action inside `ArtistProfileViewSet`, after the existing `me` action (after line 59):

```python
    @action(detail=False, methods=["get"], url_path="me/stats")
    def my_stats(self, request):
        """GET /api/artists/profiles/me/stats/"""
        from django.utils import timezone
        from apps.quotes.models import Appointment

        if request.user.user_type not in ("STUDIO", "ADMIN"):
            return Response(
                {"detail": "Solo artistas pueden acceder a estadísticas."},
                status=status.HTTP_403_FORBIDDEN,
            )

        try:
            profile = request.user.artist_profile
        except Exception:
            return Response(
                {"pending_appointments": 0, "upcoming_appointments": 0, "total_portfolio_images": 0}
            )

        now = timezone.now()
        pending = Appointment.objects.filter(artist=profile, status=Appointment.Status.PENDING).count()
        upcoming = Appointment.objects.filter(
            artist=profile, status=Appointment.Status.APPROVED, scheduled_at__gte=now
        ).count()
        portfolio_count = profile.portfolio_images.count()

        return Response(
            {
                "pending_appointments": pending,
                "upcoming_appointments": upcoming,
                "total_portfolio_images": portfolio_count,
            }
        )
```

- [ ] **Step 2: Manual verification**

```bash
cd backend
python manage.py runserver
# In another terminal:
# 1. Obtain a STUDIO user token via POST /api/auth/login/
# 2. GET http://localhost:8000/api/artists/profiles/me/stats/
#    with Authorization: Bearer <token>
# Expected: {"pending_appointments": 0, "upcoming_appointments": 0, "total_portfolio_images": 0}
```

- [ ] **Step 3: Commit**

```bash
git add backend/apps/artists/views.py
git commit -m "feat: add artist stats endpoint GET /api/artists/profiles/me/stats/"
```

---

## Task 3 — Frontend: Fix portfolio-upload bugs

**Files:**
- Modify: `frontend/src/app/features/studio/pages/portfolio-upload.component.ts`

Two bugs:
1. `deleteImage()` calls `persistOrder()` after deletion — the reorder success message overwrites the delete confirmation.
2. `setStatus()` never auto-clears — messages persist until the next action.

- [ ] **Step 1: Replace `setStatus` and `deleteImage`**

In `portfolio-upload.component.ts`, replace the private `setStatus` method (lines 40-43) and the `deleteImage` method (lines 148-158) with:

```typescript
  private setStatus(message: string, type: 'success' | 'error'): void {
    this.statusMessage = message;
    this.statusType = type;
    setTimeout(() => {
      this.statusMessage = '';
      this.statusType = '';
    }, 3500);
  }

  deleteImage(id: number): void {
    this.artistService.deletePortfolioImage(id).subscribe({
      next: () => {
        this.images = this.images.filter((i) => i.id !== id);
        if (this.viewerIndex !== null) {
          this.viewerIndex = null;
        }
        this.setStatus('Imagen eliminada del portafolio.', 'success');
      },
      error: () => {
        this.setStatus('No se pudo eliminar la imagen.', 'error');
      },
    });
  }
```

- [ ] **Step 2: Verify in browser**

With the dev server running, delete a portfolio image. Confirm:
- "Imagen eliminada del portafolio." appears and disappears after ~3.5 seconds.
- No "Orden actualizado." message appears after deletion.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/app/features/studio/pages/portfolio-upload.component.ts
git commit -m "fix: remove unnecessary reorder call after deletion, auto-clear status messages"
```

---

## Task 4 — Frontend: Add missing model interfaces

**Files:**
- Modify: `frontend/src/app/core/models/artist.ts`
- Modify: `frontend/src/app/core/models/quote.ts`

`ArtistStats` is missing entirely. `CalendarBlock` is defined in the backend but not in the frontend models.

- [ ] **Step 1: Add `ArtistStats` to artist model**

Append to `frontend/src/app/core/models/artist.ts`:

```typescript
export interface ArtistStats {
  pending_appointments: number;
  upcoming_appointments: number;
  total_portfolio_images: number;
}
```

- [ ] **Step 2: Add `CalendarBlock` to quote model**

Append to `frontend/src/app/core/models/quote.ts`:

```typescript
// ── CalendarBlock ──────────────────────────────────────────────────────────

export interface CalendarBlock {
  id: number;
  artist: number;
  artist_name: string;
  start_datetime: string;
  end_datetime: string;
  reason: string;
  created_at: string;
}

export interface CalendarBlockPayload {
  start_datetime: string;
  end_datetime: string;
  reason?: string;
}
```

- [ ] **Step 3: Commit**

```bash
git add frontend/src/app/core/models/artist.ts frontend/src/app/core/models/quote.ts
git commit -m "feat: add ArtistStats and CalendarBlock TypeScript interfaces"
```

---

## Task 5 — Frontend: Add `getStats()` to ArtistService

**Files:**
- Modify: `frontend/src/app/features/studio/services/artist.service.ts`

- [ ] **Step 1: Add import and method**

At the top of `artist.service.ts`, add `ArtistStats` to the import:

```typescript
import { ArtistProfile, TattooStyle, PortfolioImage, ArtistStats } from '../../../core/models/artist';
```

Then add the method after `updateMyProfile` (after line 23):

```typescript
  getStats(): Observable<ArtistStats> {
    return this.http.get<ArtistStats>(`${this.baseUrl}/profiles/me/stats/`);
  }
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/app/features/studio/services/artist.service.ts
git commit -m "feat: add getStats() to ArtistService"
```

---

## Task 6 — Frontend: Create AgendaService

**Files:**
- Create: `frontend/src/app/features/studio/services/agenda.service.ts`

Isolates all appointment and calendar-block HTTP calls from ArtistService.

- [ ] **Step 1: Create the service**

```typescript
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { Appointment, AppointmentStatusPayload, CalendarBlock, CalendarBlockPayload } from '../../../core/models/quote';

@Injectable({ providedIn: 'root' })
export class AgendaService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/quotes`;

  // ── Appointments ──────────────────────────────────────────────────────────
  getAppointments(): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(`${this.baseUrl}/appointments/`);
  }

  updateStatus(id: number, payload: AppointmentStatusPayload): Observable<Appointment> {
    return this.http.patch<Appointment>(`${this.baseUrl}/appointments/${id}/status/`, payload);
  }

  // ── Calendar Blocks ───────────────────────────────────────────────────────
  getCalendarBlocks(): Observable<CalendarBlock[]> {
    return this.http.get<CalendarBlock[]>(`${this.baseUrl}/calendar-blocks/`);
  }

  createCalendarBlock(payload: CalendarBlockPayload): Observable<CalendarBlock> {
    return this.http.post<CalendarBlock>(`${this.baseUrl}/calendar-blocks/`, payload);
  }

  deleteCalendarBlock(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/calendar-blocks/${id}/`);
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/app/features/studio/services/agenda.service.ts
git commit -m "feat: create AgendaService for appointments and calendar blocks"
```

---

## Task 7 — Frontend: Dashboard — real stats + functional progress nav

**Files:**
- Modify: `frontend/src/app/features/studio/pages/dashboard.component.ts`
- Modify: `frontend/src/app/features/studio/pages/dashboard.component.html`

Replaces hardcoded `8` / `14` with real API counts. Adds `scrollToSection()` for the sidebar nav. Wires up "Ver perfil público" button.

- [ ] **Step 1: Update `dashboard.component.ts`**

Replace the full file content:

```typescript
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ArtistService } from '../services/artist.service';
import { ArtistProfile, ArtistStats, TattooStyle } from '../../../core/models/artist';
import { PortfolioUploadComponent } from './portfolio-upload.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, PortfolioUploadComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly artistService = inject(ArtistService);
  private readonly router = inject(Router);

  profileForm!: FormGroup;
  profile: ArtistProfile | null = null;
  styles: TattooStyle[] = [];
  stats: ArtistStats = { pending_appointments: 0, upcoming_appointments: 0, total_portfolio_images: 0 };
  selectedStyleIds: Set<number> = new Set();

  loading = true;
  saving = false;
  saveMessage = '';
  saveSuccess = false;

  readonly sections = ['info', 'rates', 'styles', 'portfolio'] as const;
  activeSection: string = 'info';

  get selectedStyleCount(): number {
    return this.selectedStyleIds.size;
  }

  get profileCompletion(): number {
    if (!this.profileForm) return 0;
    const fields = ['bio', 'city', 'base_hourly_rate', 'minimum_setup_fee'];
    const completedFields = fields.filter((field) => {
      const value = this.profileForm.get(field)?.value;
      return value !== null && value !== undefined && `${value}`.trim() !== '' && `${value}` !== '0';
    }).length;
    const styleScore = this.selectedStyleIds.size > 0 ? 1 : 0;
    return Math.round(((completedFields + styleScore) / (fields.length + 1)) * 100);
  }

  get portfolioCount(): number {
    return this.stats.total_portfolio_images;
  }

  get artistDisplayName(): string {
    return this.profile?.username || 'Tu perfil';
  }

  ngOnInit(): void {
    this.initForm();
    this.loadData();
  }

  private initForm(): void {
    this.profileForm = this.fb.group({
      bio: ['', [Validators.maxLength(2000)]],
      city: ['', [Validators.maxLength(150)]],
      base_hourly_rate: [0, [Validators.required, Validators.min(0)]],
      minimum_setup_fee: [0, [Validators.required, Validators.min(0)]],
    });
  }

  private loadData(): void {
    this.artistService.getStyles().subscribe({
      next: (styles) => (this.styles = styles),
      error: () => (this.styles = []),
    });

    this.artistService.getStats().subscribe({
      next: (s) => (this.stats = s),
      error: () => {},
    });

    this.artistService.getMyProfile().subscribe({
      next: (profile) => {
        this.profile = profile;
        this.profileForm.patchValue({
          bio: profile.bio,
          city: profile.city,
          base_hourly_rate: profile.base_hourly_rate,
          minimum_setup_fee: profile.minimum_setup_fee,
        });
        this.selectedStyleIds = new Set(profile.styles.map((s) => s.id));
        this.loading = false;
      },
      error: () => (this.loading = false),
    });
  }

  toggleStyle(id: number): void {
    if (this.selectedStyleIds.has(id)) {
      this.selectedStyleIds.delete(id);
    } else {
      this.selectedStyleIds.add(id);
    }
  }

  scrollToSection(section: string): void {
    this.activeSection = section;
    const el = document.getElementById(`section-${section}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  goToPublicProfile(): void {
    if (this.profile?.id) {
      this.router.navigate(['/artistas', this.profile.id]);
    }
  }

  onSubmit(): void {
    if (this.profileForm.invalid || this.saving) return;
    this.saving = true;
    this.saveMessage = '';

    const payload = {
      ...this.profileForm.value,
      style_ids: Array.from(this.selectedStyleIds),
    };

    this.artistService.updateMyProfile(payload).subscribe({
      next: (updated) => {
        this.profile = updated;
        this.saving = false;
        this.saveMessage = 'Perfil actualizado correctamente.';
        this.saveSuccess = true;
        setTimeout(() => (this.saveMessage = ''), 3000);
      },
      error: () => {
        this.saving = false;
        this.saveMessage = 'Error al guardar. Intenta de nuevo.';
        this.saveSuccess = false;
        setTimeout(() => (this.saveMessage = ''), 3000);
      },
    });
  }
}
```

- [ ] **Step 2: Update `dashboard.component.html`**

Replace the full file content:

```html
<!-- ═══════════════════ ARTIST DASHBOARD ═══════════════════ -->
<section class="dashboard-page px-4 py-8 sm:px-6 lg:px-8">
  <div class="dashboard-page__inner mx-auto max-w-6xl space-y-8">

    <!-- Header -->
    <div class="dashboard-hero animate-fade-in-down">
      <div>
        <div class="dashboard-hero__eyebrow">
          <span class="dashboard-hero__eyebrow-dot"></span>
          PERFIL DEL ESTUDIO
        </div>
        <h1 class="dashboard-hero__title">Mi Perfil de Artista</h1>
        <p class="dashboard-hero__subtitle">Configura tu información pública, tarifas, estilos y la presencia visual con la que te ven tus clientes.</p>
      </div>

      <div class="dashboard-hero__stats">
        <div class="dashboard-stat dashboard-stat--accent">
          <span class="dashboard-stat__label">Progreso</span>
          <span class="dashboard-stat__value">{{ profileCompletion }}%</span>
          <span class="dashboard-stat__hint">Perfil optimizado</span>
        </div>
        <div class="dashboard-stat">
          <span class="dashboard-stat__label">Pendientes</span>
          <span class="dashboard-stat__value">{{ stats.pending_appointments }}</span>
          <span class="dashboard-stat__hint">Solicitudes</span>
        </div>
        <div class="dashboard-stat">
          <span class="dashboard-stat__label">Próximas</span>
          <span class="dashboard-stat__value">{{ stats.upcoming_appointments }}</span>
          <span class="dashboard-stat__hint">Citas confirmadas</span>
        </div>
      </div>
    </div>

    <!-- Loading state -->
    @if (loading) {
      <div class="dashboard-loading">
        <svg class="h-8 w-8 animate-spin text-[#c9a84c]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
        </svg>
        <span class="ml-3 text-[#8a7e72]">Cargando perfil…</span>
      </div>
    }

    <!-- Profile form -->
    @if (!loading) {
      <div class="dashboard-layout">
        <!-- SIDEBAR -->
        <aside class="dashboard-sidebar animate-fade-in-up delay-100">
          <div class="profile-section">
            <div class="profile-avatar">
              <span class="profile-avatar__initials">
                {{ (profile?.username || 'AA').substring(0, 2).toUpperCase() }}
              </span>
            </div>
            <h2 class="profile-name">{{ profile?.username || 'Tu Perfil' }}</h2>
          </div>

          <!-- Progress nav -->
          <nav class="progress-nav">
            @for (sec of [
              { id: 'info',      num: '1', label: 'Información' },
              { id: 'rates',     num: '2', label: 'Tarifas' },
              { id: 'styles',    num: '3', label: 'Especialidades' },
              { id: 'portfolio', num: '4', label: 'Portafolio' }
            ]; track sec.id) {
              <button
                type="button"
                (click)="scrollToSection(sec.id)"
                [class]="activeSection === sec.id
                  ? 'progress-item progress-item--active'
                  : 'progress-item'"
              >
                <span class="progress-num">{{ sec.num }}</span>
                <span class="progress-label">{{ sec.label }}</span>
              </button>
            }
          </nav>

          <!-- Stats cards -->
          <div class="stats-cards">
            <div class="stat-box">
              <span class="stat-label">Completitud</span>
              <span class="stat-value">{{ profileCompletion }}%</span>
            </div>
            <div class="stat-box">
              <span class="stat-label">Pendientes</span>
              <span class="stat-value">{{ stats.pending_appointments }}</span>
            </div>
            <div class="stat-box">
              <span class="stat-label">Próximas citas</span>
              <span class="stat-value">{{ stats.upcoming_appointments }}</span>
            </div>
            <div class="stat-box">
              <span class="stat-label">Portafolio</span>
              <span class="stat-value">{{ portfolioCount }}</span>
            </div>
          </div>

          <button class="btn-public-profile" type="button" (click)="goToPublicProfile()">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
              <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
            </svg>
            Ver perfil público
          </button>
        </aside>

        <!-- MAIN FORM -->
        <form [formGroup]="profileForm" (ngSubmit)="onSubmit()" class="dashboard-form space-y-8">

          <!-- 01 · Información -->
          <div id="section-info" class="dashboard-card animate-fade-in-up delay-100">
            <div class="dashboard-card__header">
              <div>
                <p class="dashboard-card__eyebrow">01 · Información</p>
                <h2 class="dashboard-card__title">Tu presencia profesional</h2>
              </div>
            </div>
            <div class="dashboard-grid dashboard-grid--main">
              <div>
                <label for="city" class="dashboard-label">Ciudad</label>
                <input id="city" formControlName="city" type="text"
                  placeholder="Ej. CDMX, Guadalajara…" class="dashboard-input" />
              </div>
              <div class="dashboard-span-2">
                <label for="bio" class="dashboard-label">Biografía</label>
                <textarea id="bio" formControlName="bio" rows="5"
                  placeholder="Cuéntale al mundo sobre tu estilo, enfoque y experiencia…"
                  class="dashboard-textarea"></textarea>
              </div>
            </div>
          </div>

          <!-- 02 · Tarifas -->
          <div id="section-rates" class="dashboard-card animate-fade-in-up delay-300">
            <div class="dashboard-card__header">
              <div>
                <p class="dashboard-card__eyebrow">02 · Tarifas</p>
                <h2 class="dashboard-card__title">Precio base y apertura</h2>
              </div>
            </div>
            <div class="dashboard-grid dashboard-grid--rates">
              <div>
                <label for="hourly" class="dashboard-label">Tarifa por Hora (MXN)</label>
                <div class="dashboard-currency">
                  <span>$</span>
                  <input id="hourly" formControlName="base_hourly_rate" type="number"
                    min="0" step="50" class="dashboard-input dashboard-input--currency" />
                </div>
              </div>
              <div>
                <label for="setup" class="dashboard-label">Tarifa Mínima / Apertura (MXN)</label>
                <div class="dashboard-currency">
                  <span>$</span>
                  <input id="setup" formControlName="minimum_setup_fee" type="number"
                    min="0" step="50" class="dashboard-input dashboard-input--currency" />
                </div>
              </div>
            </div>
          </div>

          <!-- 03 · Especialidades -->
          <div id="section-styles" class="dashboard-card animate-fade-in-up delay-500">
            <div class="dashboard-card__header dashboard-card__header--stacked">
              <div>
                <p class="dashboard-card__eyebrow">03 · Especialidades</p>
                <h2 class="dashboard-card__title">Estilos de tatuaje</h2>
              </div>
              <p class="dashboard-card__description">Selecciona los estilos en los que te especializas para que tus clientes te encuentren mejor.</p>
            </div>
            <div class="dashboard-tag-list">
              @for (style of styles; track style.id) {
                <button type="button" (click)="toggleStyle(style.id)"
                  [class]="selectedStyleIds.has(style.id)
                    ? 'dashboard-tag dashboard-tag--active'
                    : 'dashboard-tag'">
                  {{ style.name }}
                </button>
              }
              @if (styles.length === 0) {
                <p class="dashboard-empty">No hay estilos registrados aún.</p>
              }
            </div>
          </div>

          <!-- Save button -->
          <div class="dashboard-actions">
            <button type="submit" [disabled]="profileForm.invalid || saving" class="dashboard-submit">
              @if (saving) {
                <svg class="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                </svg>
              }
              {{ saving ? 'Guardando…' : 'Guardar Cambios' }}
            </button>
            @if (saveMessage) {
              <span class="dashboard-message"
                [class.dashboard-message--success]="saveSuccess"
                [class.dashboard-message--error]="!saveSuccess">
                {{ saveMessage }}
              </span>
            }
          </div>
        </form>
      </div>

      <!-- 04 · Portafolio -->
      <div id="section-portfolio">
        <app-portfolio-upload />
      </div>
    }
  </div>
</section>
```

- [ ] **Step 3: Verify in browser**

Open the dashboard. Confirm:
- Sidebar numbers "Pendientes" and "Próximas citas" come from the API (start at 0 if no appointments exist).
- Clicking sidebar nav items smoothly scrolls to the corresponding form section.
- The active nav item highlights when clicked.
- "Ver perfil público" button no longer throws an error (it navigates or silently fails if the route is absent).

- [ ] **Step 4: Commit**

```bash
git add frontend/src/app/features/studio/pages/dashboard.component.ts \
        frontend/src/app/features/studio/pages/dashboard.component.html
git commit -m "feat: load real artist stats in dashboard, add functional progress nav"
```

---

## Task 8 — Frontend: Implement Agenda Component

**Files:**
- Modify: `frontend/src/app/features/studio/pages/agenda.component.ts`
- Modify: `frontend/src/app/features/studio/pages/agenda.component.html`
- Modify: `frontend/src/app/features/studio/pages/agenda.component.scss`

Full implementation: appointment list with inline status actions (approve/reject/counter-offer), and calendar block management (create/delete).

- [ ] **Step 1: Write `agenda.component.ts`**

Replace the full file content:

```typescript
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AgendaService } from '../services/agenda.service';
import { Appointment, CalendarBlock } from '../../../core/models/quote';

type AppointmentFilter = 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'COUNTER_OFFER';

@Component({
  selector: 'app-agenda',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DatePipe],
  templateUrl: './agenda.component.html',
  styleUrl: './agenda.component.scss',
})
export class AgendaComponent implements OnInit {
  private readonly agendaService = inject(AgendaService);
  private readonly fb = inject(FormBuilder);

  appointments: Appointment[] = [];
  calendarBlocks: CalendarBlock[] = [];

  filter: AppointmentFilter = 'ALL';
  loadingAppointments = true;
  loadingBlocks = true;

  // Counter-offer form state
  counterOfferForId: number | null = null;
  counterOfferForm!: FormGroup;

  // Calendar block form
  blockForm!: FormGroup;
  creatingBlock = false;
  showBlockForm = false;

  // Status messages
  appointmentMessage = '';
  appointmentSuccess = false;
  blockMessage = '';
  blockSuccess = false;

  readonly filters: { value: AppointmentFilter; label: string }[] = [
    { value: 'ALL', label: 'Todas' },
    { value: 'PENDING', label: 'Pendientes' },
    { value: 'APPROVED', label: 'Aprobadas' },
    { value: 'COUNTER_OFFER', label: 'Contraofertas' },
    { value: 'REJECTED', label: 'Rechazadas' },
  ];

  get filteredAppointments(): Appointment[] {
    if (this.filter === 'ALL') return this.appointments;
    return this.appointments.filter((a) => a.status === this.filter);
  }

  get pendingCount(): number {
    return this.appointments.filter((a) => a.status === 'PENDING').length;
  }

  get approvedCount(): number {
    return this.appointments.filter((a) => a.status === 'APPROVED').length;
  }

  ngOnInit(): void {
    this.counterOfferForm = this.fb.group({
      counter_offer_datetime: ['', Validators.required],
      counter_offer_note: ['', Validators.maxLength(500)],
    });

    this.blockForm = this.fb.group({
      start_datetime: ['', Validators.required],
      end_datetime: ['', Validators.required],
      reason: ['', Validators.maxLength(255)],
    });

    this.loadAppointments();
    this.loadCalendarBlocks();
  }

  private loadAppointments(): void {
    this.loadingAppointments = true;
    this.agendaService.getAppointments().subscribe({
      next: (appts) => {
        this.appointments = appts;
        this.loadingAppointments = false;
      },
      error: () => {
        this.loadingAppointments = false;
        this.setApptStatus('No se pudieron cargar las citas.', false);
      },
    });
  }

  private loadCalendarBlocks(): void {
    this.loadingBlocks = true;
    this.agendaService.getCalendarBlocks().subscribe({
      next: (blocks) => {
        this.calendarBlocks = blocks;
        this.loadingBlocks = false;
      },
      error: () => {
        this.loadingBlocks = false;
      },
    });
  }

  // ── Appointment actions ─────────────────────────────────────────────────

  approveAppointment(id: number): void {
    this.agendaService.updateStatus(id, { status: 'APPROVED' }).subscribe({
      next: (updated) => this.replaceAppointment(updated),
      error: () => this.setApptStatus('No se pudo aprobar la cita.', false),
    });
  }

  rejectAppointment(id: number): void {
    this.agendaService.updateStatus(id, { status: 'REJECTED' }).subscribe({
      next: (updated) => this.replaceAppointment(updated),
      error: () => this.setApptStatus('No se pudo rechazar la cita.', false),
    });
  }

  openCounterOffer(id: number): void {
    this.counterOfferForId = id;
    this.counterOfferForm.reset();
  }

  cancelCounterOffer(): void {
    this.counterOfferForId = null;
    this.counterOfferForm.reset();
  }

  submitCounterOffer(id: number): void {
    if (this.counterOfferForm.invalid) return;
    const { counter_offer_datetime, counter_offer_note } = this.counterOfferForm.value;
    this.agendaService.updateStatus(id, {
      status: 'COUNTER_OFFER',
      counter_offer_datetime,
      counter_offer_note: counter_offer_note || '',
    }).subscribe({
      next: (updated) => {
        this.replaceAppointment(updated);
        this.counterOfferForId = null;
        this.setApptStatus('Contraoferta enviada.', true);
      },
      error: () => this.setApptStatus('No se pudo enviar la contraoferta.', false),
    });
  }

  private replaceAppointment(updated: Appointment): void {
    this.appointments = this.appointments.map((a) => (a.id === updated.id ? updated : a));
  }

  // ── Calendar block actions ──────────────────────────────────────────────

  toggleBlockForm(): void {
    this.showBlockForm = !this.showBlockForm;
    if (!this.showBlockForm) this.blockForm.reset();
  }

  submitBlock(): void {
    if (this.blockForm.invalid || this.creatingBlock) return;
    this.creatingBlock = true;
    this.agendaService.createCalendarBlock(this.blockForm.value).subscribe({
      next: (block) => {
        this.calendarBlocks = [...this.calendarBlocks, block];
        this.blockForm.reset();
        this.showBlockForm = false;
        this.creatingBlock = false;
        this.setBlockStatus('Bloqueo creado.', true);
      },
      error: () => {
        this.creatingBlock = false;
        this.setBlockStatus('No se pudo crear el bloqueo.', false);
      },
    });
  }

  deleteBlock(id: number): void {
    this.agendaService.deleteCalendarBlock(id).subscribe({
      next: () => {
        this.calendarBlocks = this.calendarBlocks.filter((b) => b.id !== id);
        this.setBlockStatus('Bloqueo eliminado.', true);
      },
      error: () => this.setBlockStatus('No se pudo eliminar el bloqueo.', false),
    });
  }

  // ── Status helpers ──────────────────────────────────────────────────────

  private setApptStatus(msg: string, success: boolean): void {
    this.appointmentMessage = msg;
    this.appointmentSuccess = success;
    setTimeout(() => (this.appointmentMessage = ''), 3500);
  }

  private setBlockStatus(msg: string, success: boolean): void {
    this.blockMessage = msg;
    this.blockSuccess = success;
    setTimeout(() => (this.blockMessage = ''), 3500);
  }

  statusLabel(status: string): string {
    const map: Record<string, string> = {
      PENDING: 'Pendiente',
      APPROVED: 'Aprobada',
      REJECTED: 'Rechazada',
      COUNTER_OFFER: 'Contraoferta',
    };
    return map[status] ?? status;
  }
}
```

- [ ] **Step 2: Write `agenda.component.html`**

Replace the full file content:

```html
<!-- ═══════════════════ ARTIST AGENDA ═══════════════════ -->
<section class="agenda-page px-4 py-8 sm:px-6 lg:px-8">
  <div class="agenda-inner mx-auto max-w-5xl space-y-10">

    <!-- ── Header ─────────────────────────────────────────────── -->
    <div class="agenda-hero animate-fade-in-down">
      <div class="agenda-hero__eyebrow">
        <span class="agenda-hero__dot"></span>
        ESTUDIO · AGENDA
      </div>
      <h1 class="agenda-hero__title">Mi Agenda</h1>
      <p class="agenda-hero__subtitle">Gestiona tus citas y bloquea fechas de no disponibilidad.</p>

      <div class="agenda-stats-row">
        <div class="agenda-badge agenda-badge--gold">
          <span class="agenda-badge__num">{{ pendingCount }}</span>
          <span class="agenda-badge__label">Pendientes</span>
        </div>
        <div class="agenda-badge">
          <span class="agenda-badge__num">{{ approvedCount }}</span>
          <span class="agenda-badge__label">Confirmadas</span>
        </div>
        <div class="agenda-badge">
          <span class="agenda-badge__num">{{ appointments.length }}</span>
          <span class="agenda-badge__label">Total citas</span>
        </div>
      </div>
    </div>

    <!-- ── Appointments section ───────────────────────────────── -->
    <div class="agenda-section">
      <div class="agenda-section__header">
        <h2 class="agenda-section__title">Citas</h2>
        <!-- Filter tabs -->
        <div class="agenda-filters">
          @for (f of filters; track f.value) {
            <button
              type="button"
              (click)="filter = f.value"
              [class]="filter === f.value ? 'agenda-filter agenda-filter--active' : 'agenda-filter'"
            >
              {{ f.label }}
              @if (f.value === 'PENDING' && pendingCount > 0) {
                <span class="agenda-filter__badge">{{ pendingCount }}</span>
              }
            </button>
          }
        </div>
      </div>

      @if (appointmentMessage) {
        <div [class]="appointmentSuccess ? 'agenda-alert agenda-alert--success' : 'agenda-alert agenda-alert--error'">
          {{ appointmentMessage }}
        </div>
      }

      @if (loadingAppointments) {
        <div class="agenda-loading">
          <svg class="h-6 w-6 animate-spin text-[#c9a84c]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
          </svg>
          <span>Cargando citas…</span>
        </div>
      } @else if (filteredAppointments.length === 0) {
        <div class="agenda-empty">
          <p>No hay citas {{ filter !== 'ALL' ? 'en este estado' : '' }}.</p>
        </div>
      } @else {
        <div class="agenda-list">
          @for (appt of filteredAppointments; track appt.id) {
            <article class="agenda-card">
              <!-- Card header: client + date + status -->
              <div class="agenda-card__header">
                <div class="agenda-card__client">
                  <div class="agenda-card__avatar">
                    {{ appt.client_name.substring(0, 2).toUpperCase() }}
                  </div>
                  <div>
                    <p class="agenda-card__name">{{ appt.client_name }}</p>
                    <p class="agenda-card__email">{{ appt.client_email }}</p>
                  </div>
                </div>
                <div class="agenda-card__meta">
                  <time class="agenda-card__date">
                    {{ appt.scheduled_at | date:'dd MMM yyyy, HH:mm' }}
                  </time>
                  <span [class]="'agenda-status agenda-status--' + appt.status.toLowerCase()">
                    {{ statusLabel(appt.status) }}
                  </span>
                </div>
              </div>

              <!-- Counter-offer details (read info for artist) -->
              @if (appt.status === 'COUNTER_OFFER' && appt.counter_offer_datetime) {
                <div class="agenda-card__counteroffer">
                  <p class="agenda-card__counteroffer-label">Contraoferta propuesta</p>
                  <p class="agenda-card__counteroffer-date">
                    {{ appt.counter_offer_datetime | date:'dd MMM yyyy, HH:mm' }}
                  </p>
                  @if (appt.counter_offer_note) {
                    <p class="agenda-card__counteroffer-note">{{ appt.counter_offer_note }}</p>
                  }
                </div>
              }

              <!-- Actions for PENDING -->
              @if (appt.status === 'PENDING') {
                @if (counterOfferForId !== appt.id) {
                  <div class="agenda-card__actions">
                    <button type="button" class="agenda-btn agenda-btn--approve" (click)="approveAppointment(appt.id)">
                      Aprobar
                    </button>
                    <button type="button" class="agenda-btn agenda-btn--offer" (click)="openCounterOffer(appt.id)">
                      Contraofertar
                    </button>
                    <button type="button" class="agenda-btn agenda-btn--reject" (click)="rejectAppointment(appt.id)">
                      Rechazar
                    </button>
                  </div>
                } @else {
                  <!-- Counter-offer form (inline) -->
                  <form class="agenda-offer-form" (ngSubmit)="submitCounterOffer(appt.id)" [formGroup]="counterOfferForm">
                    <p class="agenda-offer-form__title">Proponer fecha alternativa</p>
                    <div class="agenda-offer-form__fields">
                      <div>
                        <label class="agenda-offer-form__label">Nueva fecha y hora</label>
                        <input
                          type="datetime-local"
                          formControlName="counter_offer_datetime"
                          class="agenda-input"
                        />
                      </div>
                      <div>
                        <label class="agenda-offer-form__label">Nota (opcional)</label>
                        <textarea
                          formControlName="counter_offer_note"
                          rows="2"
                          placeholder="Ej. Prefiero a las 11am, el estudio estará más tranquilo."
                          class="agenda-input agenda-textarea"
                        ></textarea>
                      </div>
                    </div>
                    <div class="agenda-offer-form__actions">
                      <button type="submit" [disabled]="counterOfferForm.invalid" class="agenda-btn agenda-btn--approve">
                        Enviar contraoferta
                      </button>
                      <button type="button" class="agenda-btn agenda-btn--ghost" (click)="cancelCounterOffer()">
                        Cancelar
                      </button>
                    </div>
                  </form>
                }
              }
            </article>
          }
        </div>
      }
    </div>

    <!-- ── Calendar Blocks section ────────────────────────────── -->
    <div class="agenda-section">
      <div class="agenda-section__header">
        <h2 class="agenda-section__title">Bloqueos de Calendario</h2>
        <button type="button" class="agenda-btn-create" (click)="toggleBlockForm()">
          {{ showBlockForm ? 'Cancelar' : '+ Nuevo bloqueo' }}
        </button>
      </div>

      @if (blockMessage) {
        <div [class]="blockSuccess ? 'agenda-alert agenda-alert--success' : 'agenda-alert agenda-alert--error'">
          {{ blockMessage }}
        </div>
      }

      <!-- Create block form -->
      @if (showBlockForm) {
        <form class="agenda-block-form" [formGroup]="blockForm" (ngSubmit)="submitBlock()">
          <div class="agenda-block-form__fields">
            <div>
              <label class="agenda-offer-form__label">Inicio del bloqueo</label>
              <input type="datetime-local" formControlName="start_datetime" class="agenda-input" />
            </div>
            <div>
              <label class="agenda-offer-form__label">Fin del bloqueo</label>
              <input type="datetime-local" formControlName="end_datetime" class="agenda-input" />
            </div>
            <div class="agenda-block-form__full">
              <label class="agenda-offer-form__label">Motivo (opcional)</label>
              <input type="text" formControlName="reason"
                placeholder="Ej. Vacaciones, evento privado…" class="agenda-input" />
            </div>
          </div>
          <div class="agenda-offer-form__actions">
            <button type="submit" [disabled]="blockForm.invalid || creatingBlock" class="agenda-btn agenda-btn--approve">
              {{ creatingBlock ? 'Guardando…' : 'Crear bloqueo' }}
            </button>
          </div>
        </form>
      }

      <!-- Blocks list -->
      @if (loadingBlocks) {
        <div class="agenda-loading">
          <svg class="h-5 w-5 animate-spin text-[#c9a84c]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
          </svg>
          <span>Cargando bloqueos…</span>
        </div>
      } @else if (calendarBlocks.length === 0) {
        <div class="agenda-empty">
          <p>No tienes bloqueos activos. Crea uno para marcar períodos de no disponibilidad.</p>
        </div>
      } @else {
        <div class="agenda-block-list">
          @for (block of calendarBlocks; track block.id) {
            <div class="agenda-block-item">
              <div class="agenda-block-item__dates">
                <span class="agenda-block-item__range">
                  {{ block.start_datetime | date:'dd MMM yyyy HH:mm' }}
                  &nbsp;→&nbsp;
                  {{ block.end_datetime | date:'dd MMM yyyy HH:mm' }}
                </span>
                @if (block.reason) {
                  <span class="agenda-block-item__reason">{{ block.reason }}</span>
                }
              </div>
              <button type="button" class="agenda-block-item__delete" (click)="deleteBlock(block.id)" aria-label="Eliminar bloqueo">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"/>
                </svg>
              </button>
            </div>
          }
        </div>
      }
    </div>

  </div>
</section>
```

- [ ] **Step 3: Write `agenda.component.scss`**

Replace the full file content:

```scss
:host {
  display: block;
  background:
    radial-gradient(circle at top center, rgba(201, 168, 76, 0.07), transparent 30%),
    linear-gradient(180deg, #0c0a08 0%, #11110f 100%);
}

.agenda-page {
  color: #ede0c4;
}

.agenda-inner {
  position: relative;
}

// ── Hero ─────────────────────────────────────────────────────────────────────

.agenda-hero {
  padding: 0.25rem 0 0.5rem;
}

.agenda-hero__eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  margin-bottom: 0.8rem;
  color: #c9a84c;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.24em;
  text-transform: uppercase;
}

.agenda-hero__dot {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: #c9a84c;
  box-shadow: 0 0 0 6px rgba(201, 168, 76, 0.12);
  flex-shrink: 0;
}

.agenda-hero__title {
  margin: 0;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: clamp(2.4rem, 4vw, 3.6rem);
  line-height: 0.98;
  color: #fff8ea;
}

.agenda-hero__subtitle {
  margin: 0.8rem 0 0;
  color: #8a7e72;
  font-size: 1rem;
  line-height: 1.65;
}

.agenda-stats-row {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
  flex-wrap: wrap;
}

.agenda-badge {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 100px;
  padding: 0.9rem 1.2rem;
  border: 1px solid rgba(201, 168, 76, 0.14);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.02);
}

.agenda-badge--gold {
  border-color: rgba(201, 168, 76, 0.3);
  background: rgba(201, 168, 76, 0.08);
}

.agenda-badge__num {
  font-family: Georgia, serif;
  font-size: 1.8rem;
  line-height: 1;
  color: #ede0c4;
}

.agenda-badge__label {
  margin-top: 0.35rem;
  color: #8a7e72;
  font-size: 0.72rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

// ── Section ───────────────────────────────────────────────────────────────────

.agenda-section {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.agenda-section__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}

.agenda-section__title {
  margin: 0;
  font-family: Georgia, serif;
  font-size: 1.5rem;
  color: #fff8ea;
}

// ── Filters ───────────────────────────────────────────────────────────────────

.agenda-filters {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.agenda-filter {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.45rem 0.9rem;
  border: 1px solid rgba(201, 168, 76, 0.14);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.02);
  color: #8a7e72;
  font-size: 0.82rem;
  font-weight: 600;
  transition: all 0.2s ease;

  &:hover {
    border-color: rgba(201, 168, 76, 0.3);
    color: #ede0c4;
  }
}

.agenda-filter--active {
  border-color: rgba(201, 168, 76, 0.5);
  background: rgba(201, 168, 76, 0.1);
  color: #ede0c4;
}

.agenda-filter__badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #c9a84c;
  color: #0c0a08;
  font-size: 0.7rem;
  font-weight: 700;
}

// ── Alert ─────────────────────────────────────────────────────────────────────

.agenda-alert {
  padding: 0.8rem 1rem;
  border-radius: 12px;
  font-size: 0.9rem;
  font-weight: 600;
}

.agenda-alert--success {
  background: rgba(134, 239, 172, 0.1);
  border: 1px solid rgba(134, 239, 172, 0.25);
  color: #bbf7d0;
}

.agenda-alert--error {
  background: rgba(252, 165, 165, 0.1);
  border: 1px solid rgba(252, 165, 165, 0.25);
  color: #fecdd3;
}

// ── Loading / Empty ───────────────────────────────────────────────────────────

.agenda-loading {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: #8a7e72;
  padding: 2rem 1rem;
}

.agenda-empty {
  padding: 2rem 1.5rem;
  border: 1px dashed rgba(201, 168, 76, 0.14);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.01);
  color: #8a7e72;
  text-align: center;

  p {
    margin: 0;
  }
}

// ── Appointment Card ──────────────────────────────────────────────────────────

.agenda-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.agenda-card {
  padding: 1.25rem 1.5rem;
  border: 1px solid rgba(201, 168, 76, 0.14);
  border-radius: 20px;
  background:
    radial-gradient(circle at top left, rgba(201, 168, 76, 0.04), transparent 30%),
    linear-gradient(180deg, rgba(22, 18, 15, 0.98), rgba(14, 11, 9, 0.98));
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.22);
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.agenda-card__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}

.agenda-card__client {
  display: flex;
  align-items: center;
  gap: 0.85rem;
}

.agenda-card__avatar {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  border: 1px solid rgba(201, 168, 76, 0.22);
  background: rgba(201, 168, 76, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: Georgia, serif;
  font-size: 0.9rem;
  font-weight: 700;
  color: #c9a84c;
  flex-shrink: 0;
}

.agenda-card__name {
  margin: 0;
  color: #fff8ea;
  font-weight: 600;
  font-size: 0.95rem;
}

.agenda-card__email {
  margin: 0.15rem 0 0;
  color: #8a7e72;
  font-size: 0.8rem;
}

.agenda-card__meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.4rem;
}

.agenda-card__date {
  color: #b9ad9d;
  font-size: 0.85rem;
}

// Status badges
.agenda-status {
  display: inline-block;
  padding: 0.25rem 0.7rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.agenda-status--pending      { background: rgba(251, 191, 36, 0.12); color: #fbbf24; border: 1px solid rgba(251, 191, 36, 0.25); }
.agenda-status--approved     { background: rgba(134, 239, 172, 0.1); color: #86efac; border: 1px solid rgba(134, 239, 172, 0.22); }
.agenda-status--rejected     { background: rgba(252, 165, 165, 0.1); color: #fca5a5; border: 1px solid rgba(252, 165, 165, 0.22); }
.agenda-status--counter_offer { background: rgba(167, 139, 250, 0.1); color: #c4b5fd; border: 1px solid rgba(167, 139, 250, 0.22); }

.agenda-card__counteroffer {
  padding: 0.85rem 1rem;
  border: 1px solid rgba(167, 139, 250, 0.2);
  border-radius: 12px;
  background: rgba(167, 139, 250, 0.05);
}

.agenda-card__counteroffer-label {
  margin: 0 0 0.35rem;
  color: #c4b5fd;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.agenda-card__counteroffer-date {
  margin: 0;
  color: #ede0c4;
  font-size: 0.92rem;
  font-weight: 600;
}

.agenda-card__counteroffer-note {
  margin: 0.4rem 0 0;
  color: #8a7e72;
  font-size: 0.85rem;
  line-height: 1.5;
}

// ── Action Buttons ────────────────────────────────────────────────────────────

.agenda-card__actions {
  display: flex;
  gap: 0.6rem;
  flex-wrap: wrap;
}

.agenda-btn {
  padding: 0.55rem 1rem;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 700;
  transition: all 0.2s ease;
  cursor: pointer;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.agenda-btn--approve {
  border: 1px solid rgba(134, 239, 172, 0.3);
  background: rgba(134, 239, 172, 0.1);
  color: #86efac;

  &:hover:not(:disabled) {
    background: rgba(134, 239, 172, 0.18);
  }
}

.agenda-btn--reject {
  border: 1px solid rgba(252, 165, 165, 0.3);
  background: rgba(252, 165, 165, 0.08);
  color: #fca5a5;

  &:hover:not(:disabled) {
    background: rgba(252, 165, 165, 0.15);
  }
}

.agenda-btn--offer {
  border: 1px solid rgba(167, 139, 250, 0.3);
  background: rgba(167, 139, 250, 0.08);
  color: #c4b5fd;

  &:hover:not(:disabled) {
    background: rgba(167, 139, 250, 0.15);
  }
}

.agenda-btn--ghost {
  border: 1px solid rgba(201, 168, 76, 0.2);
  background: transparent;
  color: #8a7e72;

  &:hover {
    color: #ede0c4;
    border-color: rgba(201, 168, 76, 0.35);
  }
}

// ── Counter-offer form ────────────────────────────────────────────────────────

.agenda-offer-form {
  padding: 1rem;
  border: 1px solid rgba(201, 168, 76, 0.14);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.02);
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.agenda-offer-form__title {
  margin: 0;
  color: #c9a84c;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.2em;
  text-transform: uppercase;
}

.agenda-offer-form__fields {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 0.85rem;
}

.agenda-offer-form__label {
  display: block;
  margin-bottom: 0.45rem;
  color: #b9ad9d;
  font-size: 0.82rem;
  font-weight: 600;
}

.agenda-offer-form__actions {
  display: flex;
  gap: 0.65rem;
  flex-wrap: wrap;
}

// ── Shared input ──────────────────────────────────────────────────────────────

.agenda-input {
  width: 100%;
  padding: 0.8rem 0.95rem;
  border: 1px solid rgba(201, 168, 76, 0.16);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.03);
  color: #ede0c4;
  font-size: 0.9rem;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;

  &::placeholder { color: #7a7068; }

  &:focus {
    outline: none;
    border-color: rgba(201, 168, 76, 0.5);
    box-shadow: 0 0 0 3px rgba(201, 168, 76, 0.12);
    background: rgba(255, 255, 255, 0.05);
  }

  // datetime-local color-scheme for dark backgrounds
  color-scheme: dark;
}

.agenda-textarea {
  resize: vertical;
  min-height: 72px;
}

// ── Calendar Block form ───────────────────────────────────────────────────────

.agenda-block-form {
  padding: 1.25rem;
  border: 1px solid rgba(201, 168, 76, 0.14);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.02);
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.agenda-block-form__fields {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 0.85rem;
}

.agenda-block-form__full {
  grid-column: 1 / -1;
}

// ── Create button ─────────────────────────────────────────────────────────────

.agenda-btn-create {
  padding: 0.6rem 1.2rem;
  border: 1px solid rgba(201, 168, 76, 0.3);
  border-radius: 14px;
  background: linear-gradient(135deg, #c9a84c, #8c5a1a);
  color: #0c0a08;
  font-size: 0.85rem;
  font-weight: 800;
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 8px 18px rgba(201, 168, 76, 0.16);
  }
}

// ── Calendar Block list ───────────────────────────────────────────────────────

.agenda-block-list {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}

.agenda-block-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.9rem 1.2rem;
  border: 1px solid rgba(201, 168, 76, 0.12);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.02);
}

.agenda-block-item__dates {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.agenda-block-item__range {
  color: #ede0c4;
  font-size: 0.88rem;
  font-weight: 600;
}

.agenda-block-item__reason {
  color: #8a7e72;
  font-size: 0.8rem;
}

.agenda-block-item__delete {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.45rem;
  border: 1px solid rgba(252, 165, 165, 0.2);
  border-radius: 10px;
  background: rgba(252, 165, 165, 0.07);
  color: #fca5a5;
  flex-shrink: 0;
  transition: background 0.2s ease;

  &:hover {
    background: rgba(252, 165, 165, 0.15);
  }
}
```

- [ ] **Step 4: Verify in browser**

Navigate to `/studio/agenda`. Confirm:
- Stats row shows 0/0/0 (or real values if appointments exist).
- Filter tabs switch the visible appointment list.
- Clicking "Aprobar" on a PENDING appointment updates the status badge to "Aprobada".
- Clicking "Contraofertar" shows the inline form; submitting it updates the card and shows counter-offer details.
- Calendar Blocks section: "+ Nuevo bloqueo" shows/hides the form; creating a block adds it to the list; delete button removes it.
- All status messages appear and auto-dismiss after 3.5 seconds.

- [ ] **Step 5: Commit**

```bash
git add \
  frontend/src/app/features/studio/pages/agenda.component.ts \
  frontend/src/app/features/studio/pages/agenda.component.html \
  frontend/src/app/features/studio/pages/agenda.component.scss
git commit -m "feat: implement full artist agenda with appointments management and calendar blocks"
```

---

## Final Verification

- [ ] Run `cd frontend && npm run lint` — 0 errors
- [ ] Run `cd backend && ruff check .` — 0 errors
- [ ] Navigate all studio routes: `/studio/dashboard`, `/studio/portafolio`, `/studio/agenda`
- [ ] Upload a portfolio image → confirm URL in network tab starts with `http://localhost:8000/media/`
- [ ] Delete a portfolio image → confirm only "Imagen eliminada del portafolio." appears
- [ ] Confirm stats in dashboard sidebar are numbers from the API (no hardcoded 8 or 14)
- [ ] Confirm agenda page loads without errors with real or empty data

```bash
git add .
git commit -m "chore: final artist dashboard & agenda improvements"
```
