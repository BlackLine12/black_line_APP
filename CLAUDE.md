# CLAUDE.md — Guía del Proyecto

Este archivo es leído automáticamente por **Claude Code** al inicio de cada sesión.
Define la arquitectura, los agentes disponibles y las reglas de flujo de trabajo del proyecto.

---

## 🗂️ Estructura del Proyecto

```
.
├── .claude/
│   ├── CLAUDE.md           # ← este archivo (raíz del proyecto)
│   └── agents/
│       ├── dev.md          # Agente PHP/Laravel (SSPM-v2 legado)
│       ├── frontend.md     # Agente Angular 17+
│       └── backend.md      # Agente Python/Django REST
├── frontend/               # Angular App
│   ├── src/
│   ├── angular.json
│   └── package.json
├── backend/                # Django API
│   ├── apps/
│   ├── config/
│   ├── manage.py
│   └── requirements/
│       ├── base.txt
│       ├── development.txt
│       └── production.txt
└── docker-compose.yml
```

---

## 🤖 Agentes Disponibles

Claude Code selecciona el agente correcto automáticamente según el contexto de la tarea.
También puedes invocar uno explícitamente usando `@nombre-agente`.

| Agente       | Archivo                      | Cuándo usarlo                                              |
| ------------ | ---------------------------- | ---------------------------------------------------------- |
| `frontend`   | `.claude/agents/frontend.md` | Componentes Angular, servicios, state, routing, UI         |
| `backend`    | `.claude/agents/backend.md`  | Modelos Django, serializers, ViewSets, servicios, tareas   |
| `dev`        | `.claude/agents/dev.md`      | Código PHP/Laravel del sistema SSPM-v2 legado              |

### Ejemplos de uso explícito

```
@frontend Crea el componente de tabla de compras con paginación
@backend  Agrega el endpoint POST /api/v1/purchases/{id}/submit/
@dev      Corrige el cálculo de totales en el modelo Purchase de Laravel
```

---

## 🔄 Flujo de Trabajo Angular ↔ Django

El proyecto sigue una arquitectura **SPA + REST API**:

```
Angular (frontend/)          Django REST (backend/)
┌────────────────────┐       ┌─────────────────────────┐
│ Components         │       │ ViewSets (DRF)           │
│ Services           │ HTTP  │ Serializers              │
│ Signals/Store      │──────▶│ Services (business logic)│
│ Guards/Interceptors│       │ Models (ORM)             │
└────────────────────┘       └─────────────────────────┘
         ▲                              │
         │    OpenAPI schema.yml        │
         └──────────────────────────────┘
         (tipos generados con openapi-typescript)
```

### Reglas del contrato API

1. **Siempre** mantener `backend/schema.yml` actualizado al modificar endpoints.
2. Regenerar tipos Angular con: `npx openapi-typescript backend/schema.yml -o frontend/src/app/core/api/types.ts`
3. Toda respuesta de la API sigue el contrato:
   - Éxito: `{ data: T, message?: string }`
   - Error: `{ data: null, errors: Record<string, string[]> }`
   - Lista paginada: `{ count, next, previous, results: T[] }`

---

## 🛠️ Comandos Frecuentes

### Frontend (Angular)
```bash
cd frontend
npm install              # Instalar dependencias
npm start                # Dev server → http://localhost:4200
npm test                 # Ejecutar tests con Jest
npm run lint             # ESLint
npm run build            # Build de producción
npx openapi-typescript ../backend/schema.yml -o src/app/core/api/types.ts
```

### Backend (Django)
```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements/development.txt

python manage.py runserver           # Dev server → http://localhost:8000
python manage.py migrate             # Aplicar migraciones
python manage.py makemigrations      # Crear migraciones
python manage.py createsuperuser     # Crear admin
python manage.py spectacular --file schema.yml  # Actualizar OpenAPI schema

pytest                               # Todos los tests
pytest apps/purchases/               # Tests de una app
pytest -k "test_submit"              # Tests por nombre
ruff check . && ruff format .        # Linting + formato
```

### Docker (entorno completo)
```bash
docker-compose up -d                 # Levantar todos los servicios
docker-compose logs -f backend       # Logs del backend
docker-compose exec backend python manage.py migrate
```

---

## 📋 Reglas Generales del Proyecto

### Antes de cualquier PR
- [ ] `npm run lint` sin errores (frontend)
- [ ] `ruff check .` sin errores (backend)
- [ ] Tests pasan: `npm test` y `pytest`
- [ ] Schema OpenAPI actualizado si cambiaron endpoints
- [ ] Tipos Angular regenerados si cambió el schema

### Seguridad (OWASP)
- Nunca hardcodear secrets — usar variables de entorno (`.env` no se versiona)
- JWT guardado en memory/sessionStorage — nunca localStorage
- CORS configurado con allowlist explícita en producción
- `DEBUG=False` y `APP_DEBUG=false` en producción

### Git Branching
```
main          → producción
develop       → integración
feature/xxx   → funcionalidades nuevas
fix/xxx       → correcciones
```

### Variables de Entorno

Copiar `.env.example` a `.env` y configurar antes de levantar el proyecto:

```bash
# backend/.env
DJANGO_SECRET_KEY=...
DJANGO_DEBUG=True
DATABASE_URL=postgresql://user:pass@localhost:5432/dbname
REDIS_URL=redis://localhost:6379/0
CORS_ALLOWED_ORIGINS=http://localhost:4200

# frontend/.env
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

---

## 🚀 Onboarding Rápido (nuevo desarrollador)

```bash
# 1. Clonar y entrar al proyecto
git clone <repo> && cd <proyecto>

# 2. Levantar infraestructura
docker-compose up -d postgres redis

# 3. Backend
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements/development.txt
cp .env.example .env   # Configurar variables
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver

# 4. Frontend (otra terminal)
cd frontend
npm install
cp .env.example .env   # Configurar VITE_API_BASE_URL
npm start

# 5. Docs API
# http://localhost:8000/api/docs/ → Swagger UI
# http://localhost:4200           → Angular App
```

---

## 🗄️ Arquitectura de Base de Datos

### Relaciones principales

```
users_user (AbstractUser extendido)
  user_type: CLIENT | STUDIO | ADMIN
  │
  ├─1:1─► artists_artist_profile
  │         city (text libre → normalizar con cities-mx.ts)
  │         base_hourly_rate, minimum_setup_fee
  │         ├─M:M─► artists_tattoo_style
  │         ├─1:N─► artists_portfolio_image
  │         └─1:N─► quotes_calendar_block
  │
  └─1:N─► quotes_quote_request
            tattoo_style_id → artists_tattoo_style (PROTECT)
            body_part (choice), size_cm, is_color
            └─1:N─► quotes_appointment
                      artist → artists_artist_profile
                      status: PENDING|APPROVED|REJECTED|COUNTER_OFFER
                      └─1:1─► quotes_health_consent (LFPDPPP)
```

### Fórmula de precio CANÓNICA (backend es la fuente de verdad)

```
estimated_price = MAX(
    size_cm × base_hourly_rate × zone_multiplier × color_multiplier,
    minimum_setup_fee
)
```

**Multiplicadores de zona** (sincronizados frontend ↔ backend):

| Zona       | Factor | Zona       | Factor |
|------------|--------|------------|--------|
| BRAZO      | 1.00   | ESPALDA    | 1.30   |
| ANTEBRAZO  | 1.00   | PECHO      | 1.25   |
| PIERNA     | 1.10   | COSTILLAS  | 1.50   |
| HOMBRO     | 1.05   | CUELLO     | 1.40   |
| MANO       | 1.35   | PIE        | 1.35   |

- **Color:** `× 1.20` si `is_color = true`, `× 1.00` si blanco y negro
- El frontend muestra un rango `[price, price × 1.35]` usando `BASE_RATE_MXN = 150` como tarifa de mercado promedio

### Gestión de estado del lado del cliente

```
QuoteService.lastQuote (Angular Signal)
  ├── Se inicializa leyendo de sessionStorage al arrancar
  ├── setLastQuote(quote) → escribe Signal + sessionStorage atómicamente
  └── getMyQuotes() → GET /api/quotes/ (fallback si sessionStorage vacío)

MatchComponent.ngOnInit():
  1. Si lastQuote() → usa in-memory (restaurado desde sessionStorage)
  2. Si null → getMyQuotes() y carga la más reciente de la API
```

**Regla de seguridad:** Datos de sesión en `sessionStorage` (nunca `localStorage`). Consistent con política JWT.

### Flujo completo: Cotizador → Match → Cita

```
Cotizador (4 pasos) → POST /api/quotes/        → QuoteRequest en BD
                                                → setLastQuote() → sessionStorage
Match (búsqueda)    → GET /api/quotes/match/   → artistas filtrados por ciudad + estilo
                       (city__iexact: catálogo cities-mx.ts garantiza normalización)
Panel lateral       → POST /api/quotes/appointments/     → Appointment (PENDING)
Cuestionario salud  → POST /api/quotes/appointments/{id}/health-consent/ → HealthConsent
Artista responde    → PATCH /api/quotes/appointments/{id}/status/        → APPROVED|REJECTED|COUNTER_OFFER
```

### Normalización — reglas siempre vigentes

1. **Ciudades:** Usar SIEMPRE el catálogo `frontend/src/app/core/data/cities-mx.ts`. Nunca texto libre. El backend filtra con `city__iexact` → el catálogo garantiza coincidencias exactas.
2. **Multiplicadores de precio:** Los valores en `backend/apps/quotes/views.py` (`BODY_PART_MULTIPLIERS`) son la fuente de verdad. Si se cambian, actualizar también `cotizador.component.ts`.
3. **Estilos de tatuaje:** `TattooStyle` es la fuente de verdad. Nunca hardcodear estilos en frontend. Siempre cargar desde `GET /api/artists/styles/`.
4. **Estados de cita:** Máquina de estados estricta: `PENDING → APPROVED | REJECTED | COUNTER_OFFER`. Solo el artista puede cambiar el estado.

### Problemas de normalización pendientes (backlog)

- [ ] `ArtistProfile.city`: migrar a FK hacia tabla de ciudades normalizada
- [ ] `QuoteRequest.client`: decidir `CASCADE` vs `PROTECT` (actualmente `SET_NULL`)
- [ ] `CalendarBlock`: validar solapamiento entre bloques y con citas confirmadas
- [ ] Índices: `(client_id, created_at)` en `QuoteRequest`, `(artist_id, status, scheduled_at)` en `Appointment`
- [ ] Endpoint `GET /api/quotes/cities/` → ciudades con artistas activos para optimizar UX del Match

Ver detalle en `docs/plans/normalization-and-architecture.md`.

---

## 🛠️ Skills disponibles

Skills invocables con `/nombre` o por descripción natural en español o inglés.

| Skill | Comando | Qué hace |
|-------|---------|----------|
| App Audit | `/app-audit` | Analiza toda la app, detecta flujos rotos, gaps frontend↔backend y emite un reporte priorizado en `docs/plans/` |
| Feature Ideas | `/feature-idea [area]` | Genera 8–12 ideas concretas e implementables para un área (client/artist/admin/business). Escribe en `docs/plans/` |
| Module Plan | `/module-plan [nombre]` | Diseña un módulo nuevo completo: modelos Django, endpoints, componentes Angular, reglas de negocio y orden de construcción |
| Frontend Design | `/dev-front` | Implementa componentes Angular 19 con el design system BlackLine (dark luxury, gold accents) |
| Ticket | `/ticket [BL-XX]` | Trabaja en un ticket Jira de BlackLine |
| App Review | `/app-audit` | Ver App Audit |

Los outputs de `/app-audit`, `/feature-idea` y `/module-plan` siempre se guardan en `docs/plans/`.

---

## 📚 Referencias

- [Angular Style Guide](https://angular.dev/style-guide)
- [DRF Best Practices](https://www.django-rest-framework.org/)
- [drf-spectacular (OpenAPI)](https://drf-spectacular.readthedocs.io/)
- [NgRx SignalStore](https://ngrx.io/guide/signals)
- [Ruff (Python linter)](https://docs.astral.sh/ruff/)
