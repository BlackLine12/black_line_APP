# Frontend Architecture Reference

Stack: Angular 19, TypeScript (strict), RxJS 7.8, Tailwind CSS 3.4, Karma/Jasmine.  
Entry: `frontend/src/main.ts` → `AppComponent` → `app.routes.ts`

---

## Routing Tree

```
/ (LandingComponent)                      [noAuthGuard]
/auth                                     [lazy → AUTH_ROUTES]
  /auth/login                             → LoginComponent
  /auth/register                          → RegisterComponent

/403                                      → ForbiddenComponent   (acceso denegado por rol)
/404                                      → NotFoundComponent    (página no encontrada)
/**                                       → NotFoundComponent    (wildcard fallback)

/ (LayoutComponent)                       [authGuard]
  /client                                 [roleGuard('CLIENT') → lazy → CLIENT_ROUTES]
    /client/dashboard                     → ClientDashboardComponent
    /client/cotizador                     → CotizadorComponent          (RF-1: quote wizard)
    /client/cotizaciones                  → MisCotizacionesComponent    (historial de cotizaciones)
    /client/match                         → MatchComponent              (RF-2: búsqueda de artistas)
    /client/mis-citas                     → MisCitasComponent           (RF-4: lista de citas)
    /client/citas/:id                     → CitaDetalleComponent        (detalle + accept/reject contraoferta)
    /client/artistas/:id                  → ArtistaPerfilComponent      (perfil público del artista)
    /client/perfil                        → PerfilComponent             (datos personales + cambio contraseña)

  /studio                                 [roleGuard('STUDIO') → lazy → STUDIO_ROUTES]
    /studio/dashboard                     → DashboardComponent
    /studio/solicitudes                   → SolicitudesComponent        (bandeja de citas)
    /studio/solicitudes/:id               → SolicitudDetalleComponent   (detalle + aprobar/rechazar/contraofertar)
    /studio/agenda                        → AgendaComponent             (RF-4, RF-7: calendario)
    /studio/portafolio                    → PortafolioComponent

  /admin                                  [roleGuard('ADMIN') → lazy → ADMIN_ROUTES]
    /admin/dashboard                      → AdminDashboardComponent     (stats globales de la plataforma)
    /admin/estilos                        → AdminStylesComponent        (CRUD estilos de tatuaje)
```

---

## Guards

**`authGuard`** — Llama `syncSessionState()`, redirige a `/auth/login?returnUrl=...` si no hay sesión.

**`noAuthGuard`** — Llama `syncSessionState()`, si hay sesión llama `redirectByRole()` y bloquea el acceso.

**`roleGuard(role)`** — Varargs. ADMIN siempre pasa (bypass total). Si el rol no coincide, redirige a `/403` (antes redirigía al propio dashboard del usuario).

---

## Core Services (`frontend/src/app/core/services/`)

### `AuthService`
- **State:** Angular signals — `_user`, `isAuthenticated`, `userType`
- **Storage:** sessionStorage keys `bl_access_token`, `bl_refresh_token`, `bl_user`
- **Key methods:**
  - `login(credential, password)` — POST `/api/auth/login/`, guarda tokens, decodifica JWT
  - `register(payload)` — POST `/api/auth/register/`
  - `logout()` — POST `/api/auth/logout/`, limpia storage
  - `syncSessionState()` — valida expiración del token; llamado por guards en cada navegación
  - `redirectByRole()` — navega a `/client/dashboard`, `/studio/dashboard` o **`/admin/dashboard`** (ADMIN ya no sale a Django Admin directamente)
- Claims JWT usados: `user_type`, `exp`, `full_name`

### `TokenStorageService`
- Thin wrapper sobre sessionStorage para `bl_access_token` / `bl_refresh_token`

### `QuoteService` (core)
- State: signal `lastQuote` sincronizado a sessionStorage
- Llamadas: `/api/quotes/*` y `/api/quotes/appointments/*`
- Métodos añadidos: `getAppointmentById(id)`, `createAppointment(payload)`, `submitHealthConsent(id, payload)`

### `ArtistService` (core)
- Llamadas: `GET /api/artists/cities/`, `GET /api/artists/profiles/{id}/`
- Método añadido: `getProfileById(id)` — usado por `ArtistaPerfilComponent`

---

## JWT Interceptor (`core/interceptors/jwt.interceptor.ts`)

Adjunta `Authorization: Bearer` a todas las peticiones a `environment.apiUrl`.

**Lógica de refresh 401:**
1. Omite endpoints de login/logout/refresh.
2. Bloqueo con flag `isRefreshing`; peticiones concurrentes encoladas vía `BehaviorSubject`.
3. POST `/api/auth/token/refresh/` → guarda nuevos tokens → reintenta peticiones encoladas.
4. En fallo: limpia tokens → navega a `/auth/login`.

---

## Feature Services (`frontend/src/app/features/*/services/`)

### Studio — `ArtistService`
Llama todos los endpoints de `/api/artists/`: styles, profiles/me, portfolio CRUD + reorder, stats.

### Studio — `AgendaService`
Llama `/api/quotes/appointments/*` y `/api/quotes/calendar-blocks/*`.
Método añadido: `getAppointmentById(id)` — usado por `SolicitudDetalleComponent`.

---

## Shared Components (`frontend/src/app/shared/`)

| Componente | Path | Propósito |
|---|---|---|
| `LayoutComponent` | `shared/layout/` | Shell con navbar + footer para rutas autenticadas |
| `NavbarComponent` | `shared/components/` | Navegación superior; muestra links según rol exacto (CLIENT, STUDIO o ADMIN — sin mezclas) |
| `FooterComponent` | `shared/components/` | Pie de página |
| `BtnComponent` | `shared/components/` | Botón reutilizable |
| `SignaturePadComponent` | `shared/components/signature-pad/` | Canvas de firma digital → base64 PNG (RF-6) |
| `HealthConsentFormComponent` | `shared/components/health-consent-form/` | Formulario de consentimiento de salud extraído como componente reutilizable. Implementa `ControlValueAccessor` + `Validator`. Expone `isValid`, `getValue()`, `reset()`, `markAllTouched()`. |
| `EmptyStateComponent` | `shared/components/empty-state/` | Componente genérico de estado vacío con inputs: `icon`, `title`, `subtitle`, `ctaLabel`, `ctaRoute` |

---

## Módulo Client — Componentes añadidos

### `CitaDetalleComponent` (`/client/citas/:id`)
- Carga la cita por ID desde `QuoteService.getAppointmentById()`.
- Muestra detalles completos: fecha, artista, estado, cotización asociada.
- Si hay contraoferta del artista: permite aceptarla (`COUNTER_OFFER → APPROVED`) o rechazarla (`COUNTER_OFFER → REJECTED`).
- Panel lateral: formulario de salud (`HealthConsentFormComponent`) si la cita está aprobada y no tiene consentimiento.

### `ArtistaPerfilComponent` (`/client/artistas/:id`)
- Carga el perfil del artista desde `ArtistService.getProfileById()`.
- Layout de dos columnas: aside fijo (foto, nombre, ciudad, tarifas, estilos, CTA "Solicitar cita") + galería de portafolio con hover overlay.
- Lightbox con fadeIn para vista ampliada de imágenes.

### `PerfilComponent` (`/client/perfil`)
- Edita datos personales del usuario autenticado vía `PATCH /api/auth/profile/` (nombre, apellido, username, teléfono; email de solo lectura).
- Cambia contraseña vía `POST /api/auth/change-password/` con validación de coincidencia y toggle mostrar/ocultar.
- Accesible también para ADMIN (el `roleGuard` hace bypass total para ese rol).

---

## Módulo Studio — Componentes añadidos

### `SolicitudDetalleComponent` (`/studio/solicitudes/:id`)
- Carga la cita por ID desde `AgendaService.getAppointmentById()`.
- Panel de acciones: aprobar (`PENDING → APPROVED`), rechazar (`PENDING → REJECTED`), o proponer contraoferta (`PENDING → COUNTER_OFFER` con nueva fecha y nota opcional).
- Si la cita ya tiene contraoferta activa la muestra en modo lectura.

---

## Módulo Admin — Componentes añadidos

### `AdminDashboardComponent` (`/admin/dashboard`)
- Carga en paralelo (`forkJoin`) artistas, citas y estilos.
- **Nota:** `GET /api/quotes/appointments/` devuelve un array directo (no paginado); `GET /api/artists/profiles/` y `GET /api/artists/styles/` devuelven `{count, results}`.
- Muestra 4 stat cards: artistas registrados, citas totales, citas pendientes, estilos.
- Tabla de las 5 citas más recientes.
- Accesos directos a sub-secciones y al Django Admin nativo.

### `AdminStylesComponent` (`/admin/estilos`)
- CRUD completo de estilos de tatuaje sobre `POST/PATCH/DELETE /api/artists/styles/{id}/`.
- Crear: formulario desplegable en la parte superior.
- Editar: edición inline por fila.
- Eliminar: confirmación inline antes de ejecutar el DELETE.

---

## Páginas de error (`frontend/src/app/features/errors/`)

| Componente | Ruta | Cuándo se muestra |
|---|---|---|
| `NotFoundComponent` | `/404` y wildcard `**` | URL no existe en el router |
| `ForbiddenComponent` | `/403` | `roleGuard` detecta rol incorrecto |

Ambas detectan si el usuario está autenticado y muestran el link correcto ("Ir a mi panel" vs "Ir al inicio"). `ForbiddenComponent` reutiliza el SCSS de `NotFoundComponent`.

---

## Navbar — Comportamiento por rol

| Rol | Links visibles |
|---|---|
| `CLIENT` | Panel · Cotizador · Cotizaciones · Match · Mis Citas · Mi Perfil |
| `STUDIO` | Dashboard · Solicitudes · Portafolio · Agenda |
| `ADMIN` | Panel (admin) · Estilos · Mi Perfil |

Los signals `isClient` e `isStudio` en `NavbarComponent` **no incluyen** al ADMIN — cada rol ve únicamente sus propios links sin mezclas.

---

## Convenciones

- Todos los módulos de features son **lazy-loaded**. Seguir el patrón existente al añadir rutas.
- Usar **Angular signals** para estado reactivo local en servicios; RxJS Observables para llamadas HTTP.
- Los estilos de componentes cliente usan **SCSS con BEM** y tokens del tema BlackLine (`$bg: #0C0A08`, `$gold: #C9A84C`, `$cream: #EDE0C4`). Los componentes de studio usan **Tailwind CSS**.
- `environment.apiUrl` es `http://localhost:8000/api` en desarrollo.
- **TypeScript strict mode** activado — sin `any` implícito, sin non-null assertions sin justificación.
- Test files: `*.spec.ts` junto a los componentes, ejecutar con `npm test` (Karma/Jasmine).
