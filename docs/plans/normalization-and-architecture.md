# Normalización y Decisiones de Arquitectura — BlackLine

**Estado:** EN PROGRESO  
**Fecha:** 2026-05-01  
**Área:** Full-stack (Django REST + Angular 19 + PostgreSQL)

---

## Diagnóstico: Problemas encontrados (2026-05-01)

### 🔴 CRÍTICO — `lastQuote` no persistía entre navegaciones

**Síntoma:** Al navegar a `/match` después de completar el cotizador (incluso en la misma sesión), el componente no tenía cotización activa y redirigía.

**Causa raíz:** `QuoteService.lastQuote` era un Angular Signal en memoria. Al navegar, el signal se reiniciaba a `null`.

**Solución aplicada:**
1. `QuoteService` inicializa el signal leyendo de `sessionStorage` en la construcción
2. `setLastQuote(quote)` guarda en signal + sessionStorage atómicamente
3. `ngOnInit` del `MatchComponent` hace fallback a `GET /api/quotes/` si sessionStorage está vacío

**Decisión de seguridad:** Usar `sessionStorage` (no `localStorage`) — consistente con la política de JWT del proyecto. Los datos de sesión no persisten entre pestañas ni al cerrar el navegador.

---

### 🟠 MEDIO — Multiplicadores y fórmula de precio inconsistentes entre frontend y backend

**Síntoma:** El precio estimado en el Cotizador no coincidía con el precio que calculaban los artistas en Match.

**Causas:**
1. Color multiplier: frontend 1.3 vs backend 1.20
2. Zona MANO/PIE: frontend 0.8 vs backend 1.35
3. Zona ESPALDA: frontend 1.4 vs backend 1.30
4. Fórmula: frontend usaba área de círculo + sqrt, backend usa multiplicación lineal

**Fórmula canónica (backend es la fuente de verdad):**
```
estimated_price = MAX(size_cm × base_rate × zone_multiplier × color_multiplier, minimum_setup_fee)
```

**Multiplicadores canónicos (sincronizados):**
| Zona       | Multiplier |
|------------|-----------|
| BRAZO      | 1.00      |
| ANTEBRAZO  | 1.00      |
| PIERNA     | 1.10      |
| HOMBRO     | 1.05      |
| ESPALDA    | 1.30      |
| PECHO      | 1.25      |
| COSTILLAS  | 1.50      |
| CUELLO     | 1.40      |
| MANO       | 1.35      |
| PIE        | 1.35      |
| Color      | 1.20      |

**Solución aplicada:** Frontend actualizado para usar exactamente los mismos valores. El Cotizador ahora muestra un rango: `[price, price × 1.35]` usando `BASE_RATE_MXN = 150` como tarifa de mercado promedio.

---

### 🟡 BAJO — `QuoteRequest.client` era nullable innecesariamente

**Problema:** `client = FK(User, SET_NULL, null=True)`. Si el usuario se borra, la cotización queda huérfana con `client=NULL` — pérdida de trazabilidad.

**Decisión:** Mantener como está por ahora. Cambiar a `CASCADE` o `PROTECT` requiere migración y decisión de negocio (¿qué pasa con las cotizaciones al borrar un usuario?). Documentado para el backlog.

---

### 🟡 BAJO — CalendarBlock sin validación de solapamientos

**Problema:** El modelo `CalendarBlock` valida `start < end` pero no detecta bloques que se solapan con otros bloques o con citas ya confirmadas del mismo artista.

**Solución pendiente:** Agregar validación en `CalendarBlock.clean()`:
```python
def clean(self):
    super().clean()
    overlapping = CalendarBlock.objects.filter(
        artist=self.artist,
        start_datetime__lt=self.end_datetime,
        end_datetime__gt=self.start_datetime,
    ).exclude(pk=self.pk)
    if overlapping.exists():
        raise ValidationError("Ya existe un bloqueo que se solapa con este rango.")
```

---

## Schema de Base de Datos (estado actual)

```
users_user
├── id, email (unique), username
├── user_type: CLIENT | STUDIO | ADMIN
├── first_name, last_name, phone
└── is_active, created_at, updated_at

artists_tattoo_style
├── id
└── name (unique)

artists_artist_profile (1:1 con users_user)
├── id
├── user_id → users_user (CASCADE)
├── bio, city
├── base_hourly_rate, minimum_setup_fee
└── created_at, updated_at

artists_artist_profile_styles (M2M)
├── artistprofile_id → artists_artist_profile
└── tattostyle_id → artists_tattoo_style

artists_portfolio_image (N:1 con artist_profile)
├── id
├── artist_id → artists_artist_profile (CASCADE)
├── image, description, position
└── created_at

quotes_quote_request
├── id
├── client_id → users_user (SET_NULL, nullable) ← pendiente review
├── tattoo_style_id → artists_tattoo_style (PROTECT)
├── body_part (choice: BRAZO|PIERNA|ESPALDA|PECHO|COSTILLAS|CUELLO|MANO|PIE|HOMBRO|ANTEBRAZO)
├── size_cm (PositiveInt)
├── is_color (Boolean)
└── created_at

quotes_appointment
├── id
├── client_id → users_user (CASCADE)
├── artist_id → artists_artist_profile (CASCADE)
├── quote_id → quotes_quote_request (SET_NULL, nullable)
├── scheduled_at (DateTime)
├── status: PENDING | APPROVED | REJECTED | COUNTER_OFFER
├── counter_offer_datetime (nullable), counter_offer_note
└── created_at, updated_at

quotes_health_consent (1:1 con appointment)
├── id
├── appointment_id → quotes_appointment (CASCADE, unique)
├── has_allergies (bool), allergies_detail (text)
├── has_chronic_disease (bool), chronic_disease_detail (text)
├── takes_medication (bool), medication_detail (text)
├── is_pregnant (bool)
├── has_skin_condition (bool), skin_condition_detail (text)
├── terms_accepted (bool, requerido - LFPDPPP)
└── created_at

quotes_calendar_block
├── id
├── artist_id → artists_artist_profile (CASCADE)
├── start_datetime, end_datetime
├── reason
└── created_at
```

---

## Flujo de datos completo (estado normalizado)

```
1. Cliente completa Cotizador (4 pasos)
   → POST /api/quotes/
   → Crea QuoteRequest en BD
   → Frontend guarda en sessionStorage via QuoteService.setLastQuote()
   
2. Cliente navega a Match
   → ngOnInit: intenta restaurar lastQuote desde signal (sessionStorage)
   → Si null: GET /api/quotes/ → toma el más reciente
   → Muestra estado "Encuentra tu artista" con datos del quote
   
3. Cliente busca artistas
   → GET /api/quotes/match/?city=X&style_id=N&size_cm=N&body_part=X&is_color=bool
   → Backend calcula precio estimado por artista en SQL
   → Filtra por city__iexact (catálogo cities-mx.ts garantiza normalización)
   
4. Cliente selecciona artista → abre panel lateral
   → POST /api/quotes/appointments/ con {artist, quote, scheduled_at}
   → Crea Appointment (status: PENDING)
   
5. Cliente completa cuestionario de salud
   → POST /api/quotes/appointments/{id}/health-consent/
   → Crea HealthConsent (1:1 con Appointment)
   
6. Artista aprueba / rechaza / contra-oferta
   → PATCH /api/quotes/appointments/{id}/status/
   → Máquina de estados: PENDING → APPROVED | REJECTED | COUNTER_OFFER
```

---

## Endpoints disponibles (todos requieren JWT)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | /api/auth/register/ | Registro |
| POST | /api/auth/login/ | Login (JWT) |
| POST | /api/auth/logout/ | Logout |
| GET | /api/auth/profile/ | Perfil propio |
| GET | /api/artists/styles/ | Catálogo de estilos |
| GET | /api/artists/profiles/ | Lista de artistas |
| GET/PATCH | /api/artists/profiles/me/ | Perfil del artista autenticado |
| GET | /api/artists/profiles/me/stats/ | Stats del dashboard del artista |
| POST | /api/artists/portfolio/ | Subir imagen al portafolio |
| **GET** | **/api/quotes/** | **Listar mis cotizaciones (nuevo)** |
| POST | /api/quotes/ | Crear cotización |
| GET | /api/quotes/match/ | Buscar artistas (matchmaking) |
| GET/POST | /api/quotes/appointments/ | Listar / crear citas |
| GET | /api/quotes/appointments/{id}/ | Detalle de cita |
| PATCH | /api/quotes/appointments/{id}/status/ | Cambiar estado |
| GET/POST | /api/quotes/appointments/{id}/health-consent/ | Cuestionario de salud |
| GET/POST | /api/quotes/calendar-blocks/ | Bloqueos del artista |
| DELETE | /api/quotes/calendar-blocks/{id}/ | Eliminar bloqueo |

---

## Backlog de normalización pendiente

- [ ] `QuoteRequest.client`: Decidir entre CASCADE (borrar quotes con usuario) o PROTECT (no borrar usuario con quotes activas)
- [ ] `ArtistProfile.city`: Migrar a FK → tabla `cities` con catálogo normalizado (igual que `cities-mx.ts`)
- [ ] `CalendarBlock`: Validación de solapamiento entre bloques y con Appointments confirmados  
- [ ] `HealthConsent`: Considerar simplificar quitando campos booleanos redundantes (usar texto nullable directamente)
- [ ] Agregar índices en: `QuoteRequest.client + created_at`, `Appointment.artist + status + scheduled_at`
- [ ] Endpoint `GET /api/quotes/cities/` → ciudades con artistas activos (optimizar UI del Match)
