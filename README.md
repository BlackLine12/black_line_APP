# BlackLine

[![Angular](https://img.shields.io/badge/Angular-19-DD0031?logo=angular&logoColor=white)](https://angular.dev/)
[![Django](https://img.shields.io/badge/Django-6.0-092E20?logo=django&logoColor=white)](https://www.djangoproject.com/)
[![Django REST Framework](https://img.shields.io/badge/DRF-3.15-A30000?logo=django&logoColor=white)](https://www.django-rest-framework.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)
[![JWT](https://img.shields.io/badge/Auth-JWT-000000?logo=jsonwebtokens&logoColor=white)](https://jwt.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

BlackLine es un marketplace de tatuajes y piercings donde clientes solicitan cotizaciones y artistas/estudios responden con propuestas, tarifas y disponibilidad.

El proyecto está construido como un monorepo fullstack:

- Frontend SPA con Angular 19
- Backend API con Django + Django REST Framework
- Base de datos PostgreSQL
- Orquestación local con Docker Compose

## Tabla de contenidos

- [Descripción funcional](#descripción-funcional)
- [Arquitectura general](#arquitectura-general)
- [Rutas del frontend](#rutas-del-frontend)
- [Tecnologías](#tecnologías)
- [Requisitos previos](#requisitos-previos)
- [Inicio rápido con Docker](#inicio-rápido-con-docker)
- [Comandos útiles de Docker](#comandos-útiles-de-docker)
- [Ejecución sin Docker](#ejecución-sin-docker)
- [Variables de entorno](#variables-de-entorno)
- [Endpoints principales](#endpoints-principales)
- [Estructura del repositorio](#estructura-del-repositorio)
- [Pruebas](#pruebas)
- [Troubleshooting](#troubleshooting)
- [Changelog](#changelog)

## Descripción funcional

Flujo principal del producto:

1. El usuario cliente se registra/inicia sesión.
2. Crea una solicitud de cotización (zona, tamaño, color, estilo, presupuesto, etc.).
3. El sistema hace matchmaking y sugiere artistas compatibles.
4. El artista administra perfil, tarifas, estilos y portafolio.
5. El flujo de citas evoluciona por estados (pendiente, aprobada, rechazada o contraoferta).

Roles soportados:

- CLIENT
- STUDIO
- ADMIN

## Rutas del frontend

Todas las rutas autenticadas pasan primero por `authGuard`. Las rutas de rol usan `roleGuard`, que redirige a `/403` si el rol no coincide. El rol ADMIN tiene bypass total y puede acceder a cualquier ruta.

| Ruta | Componente | Rol requerido |
|---|---|---|
| `/` | `LandingComponent` | público (redirige si autenticado) |
| `/auth/login` | `LoginComponent` | público |
| `/auth/register` | `RegisterComponent` | público |
| `/403` | `ForbiddenComponent` | — |
| `/404` y `**` | `NotFoundComponent` | — |
| `/client/dashboard` | `ClientDashboardComponent` | CLIENT |
| `/client/cotizador` | `CotizadorComponent` | CLIENT |
| `/client/cotizaciones` | `MisCotizacionesComponent` | CLIENT |
| `/client/match` | `MatchComponent` | CLIENT |
| `/client/mis-citas` | `MisCitasComponent` | CLIENT |
| `/client/citas/:id` | `CitaDetalleComponent` | CLIENT |
| `/client/artistas/:id` | `ArtistaPerfilComponent` | CLIENT |
| `/client/perfil` | `PerfilComponent` | CLIENT (ADMIN también) |
| `/studio/dashboard` | `DashboardComponent` | STUDIO |
| `/studio/solicitudes` | `SolicitudesComponent` | STUDIO |
| `/studio/solicitudes/:id` | `SolicitudDetalleComponent` | STUDIO |
| `/studio/agenda` | `AgendaComponent` | STUDIO |
| `/studio/portafolio` | `PortafolioComponent` | STUDIO |
| `/admin/dashboard` | `AdminDashboardComponent` | ADMIN |
| `/admin/estilos` | `AdminStylesComponent` | ADMIN |

---

## Arquitectura general

```text
Angular SPA (frontend) --JWT--> Django REST API (backend) --> PostgreSQL
        |                           |
        |                           +--> media/portfolio (imágenes)
        +--> localStorage (tokens y sesión)
```

Servicios Docker definidos:

- `db`: PostgreSQL 16
- `backend`: Django (migraciones automáticas + runserver)
- `frontend`: Angular dev server

## Tecnologías

### Backend

- Django 6
- Django REST Framework
- SimpleJWT (autenticación JWT)
- django-cors-headers
- Pillow
- django-filter
- PostgreSQL

### Frontend

- Angular 19
- TypeScript
- RxJS
- Tailwind CSS

### DevOps y tooling

- Docker
- Docker Compose

## Requisitos previos

Instala en tu máquina:

- Docker Engine
- Docker Compose (plugin `docker compose` o binario `docker-compose`)
- Git

Opcional para ejecución local sin contenedores:

- Python 3.12+
- Node.js 20+
- npm

## Inicio rápido con Docker

### 1) Clonar repositorio

```bash
git clone <URL_DEL_REPOSITORIO>
cd black_line
```

### 2) Configurar variables de entorno

```bash
cp .env.example .env
```

Ajusta valores en `.env` si necesitas cambiar credenciales/hosts.

### 3) Levantar todo el stack

```bash
docker compose up --build
```

Si tu entorno usa el comando antiguo:

```bash
docker-compose up --build
```

### 4) Verificar servicios

- Frontend: http://localhost:4200
- Backend API: http://localhost:8000
- PostgreSQL: localhost:5432

Notas importantes:

- El backend ejecuta migraciones automáticamente al iniciar.
- El frontend arranca automáticamente con `npm start` dentro del contenedor.
- No necesitas entrar al contenedor para ejecutar `npm start` en el flujo normal.

## Comandos útiles de Docker

Levantar en segundo plano:

```bash
docker compose up -d
```

Ver logs en tiempo real de todos los servicios:

```bash
docker compose logs -f
```

Ver logs de un servicio específico:

```bash
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f db
```

Reiniciar un servicio:

```bash
docker compose restart backend
```

Detener servicios:

```bash
docker compose down
```

Detener y eliminar volúmenes (borra datos de DB local):

```bash
docker compose down -v
```

## Ejecución sin Docker

## Backend (desde `backend/`)

```bash
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

## Frontend (desde `frontend/`)

```bash
npm install
npm start
```

## Variables de entorno

Variables esperadas (tomadas de `.env.example`):

| Variable | Descripción | Valor por defecto en ejemplo |
|---|---|---|
| `SECRET_KEY` | Clave secreta de Django | `your-secret-key-here` |
| `DEBUG` | Modo debug | `True` |
| `ALLOWED_HOSTS` | Hosts permitidos | `localhost,127.0.0.1,backend,0.0.0.0` |
| `DB_NAME` | Nombre de BD | `black_line_db` |
| `DB_USER` | Usuario de BD | `postgres` |
| `DB_PASSWORD` | Password de BD | `postgres123` |
| `DB_HOST` | Host de BD | `db` |
| `DB_PORT` | Puerto de BD | `5432` |
| `CORS_ALLOWED_ORIGINS` | Orígenes permitidos para CORS | `http://localhost:4200` |
| `JWT_ACCESS_TOKEN_LIFETIME_MINUTES` | Minutos de vida del access token | `60` |
| `JWT_REFRESH_TOKEN_LIFETIME_DAYS` | Días de vida del refresh token | `7` |

## Endpoints principales

Autenticación:

- `POST /api/auth/login/`
- `POST /api/auth/register/`
- `POST /api/auth/token/refresh/`
- `POST /api/auth/logout/`
- `GET /api/auth/profile/`

Artistas:

- `GET /api/artists/profiles/`
- `GET /api/artists/profiles/me/`
- `POST /api/artists/portfolio/`

Cotizaciones:

- `POST /api/quotes/`
- `GET /api/quotes/match/`

## Estructura del repositorio

```text
black_line/
├── backend/                # Django + DRF
│   ├── apps/
│   │   ├── users/
│   │   ├── artists/
│   │   └── quotes/
│   └── config/
├── frontend/               # Angular 19
│   └── src/app/
│       ├── core/
│       ├── features/
│       └── shared/
├── docker-compose.yml
└── .env.example
```

## Pruebas

Backend:

```bash
cd backend
python manage.py test
```

Frontend:

```bash
cd frontend
npm test
```

## Troubleshooting

### El frontend no responde en localhost:4200

- Verifica contenedor activo: `docker compose ps`
- Revisa logs: `docker compose logs -f frontend`

### Error de conexión a base de datos

- Verifica estado de DB: `docker compose logs -f db`
- Confirma variables `DB_*` en `.env`

### Cambios de código no se reflejan

- En Docker, los volúmenes ya montan código local (`./frontend:/app`, `./backend:/app`).
- Si persiste, reinicia servicio:
  - `docker compose restart frontend`
  - `docker compose restart backend`

---

## Changelog

### Branch `BL-corrections-arturo` — Mayo 2026

#### Componentes compartidos refactorizados

**`HealthConsentFormComponent`** (`shared/components/health-consent-form/`)
- Extraído de `MatchComponent` y `MisCitasComponent` donde estaba duplicado.
- Implementa `ControlValueAccessor` + `Validator` para integrarse como control de formulario estándar.
- API pública: `isValid`, `getValue()`, `reset()`, `markAllTouched()`.
- Los componentes padre lo consumen vía `@ViewChild`.

**`EmptyStateComponent`** (`shared/components/empty-state/`)
- Componente genérico para estados vacíos con inputs: `icon`, `title`, `subtitle`, `ctaLabel`, `ctaRoute`.

#### Nuevas páginas — Cliente

**`CitaDetalleComponent`** (`/client/citas/:id`)
- Vista de detalle de una cita. Muestra datos completos, estado y cotización asociada.
- Permite al cliente aceptar o rechazar una contraoferta del artista.
- Panel lateral con `HealthConsentFormComponent` para firmar el consentimiento de salud si la cita fue aprobada.

**`ArtistaPerfilComponent`** (`/client/artistas/:id`)
- Perfil público del artista con galería de portafolio.
- Lightbox para ver imágenes en tamaño completo.
- Botón "Ver perfil" añadido en las tarjetas de resultados de búsqueda (`MatchComponent`).

**`PerfilComponent`** (`/client/perfil`)
- Edición de datos personales: nombre, apellido, username, teléfono (email de solo lectura).
- Cambio de contraseña con validación de coincidencia y toggle mostrar/ocultar.
- Accesible también desde el dashboard (acción rápida) y la navbar.

#### Nuevas páginas — Studio

**`SolicitudDetalleComponent`** (`/studio/solicitudes/:id`)
- Detalle de una solicitud de cita entrante.
- Acciones: aprobar, rechazar, o proponer una contraoferta con nueva fecha y nota.

#### Nuevas páginas — Admin

**`AdminDashboardComponent`** (`/admin/dashboard`)
- Panel global con 4 métricas: artistas registrados, citas totales, citas pendientes, estilos de tatuaje.
- Tabla con las 5 citas más recientes de toda la plataforma.
- Links directos al gestor de estilos y al Django Admin nativo.

**`AdminStylesComponent`** (`/admin/estilos`)
- CRUD completo de estilos de tatuaje (`TattooStyle`).
- Crear, editar inline por fila, y eliminar con confirmación.

#### Páginas de error

**`NotFoundComponent`** (`/404`, wildcard `**`)
- Reemplaza el redirect silencioso a `/` que existía antes.
- Detecta si el usuario está autenticado y muestra el CTA correspondiente.

**`ForbiddenComponent`** (`/403`)
- Mostrada cuando `roleGuard` detecta un rol incorrecto (antes redirigía silenciosamente al dashboard del propio usuario).

#### Cambios en servicios y guards

- **`ArtistService` (core):** añadido `getProfileById(id)` → `GET /api/artists/profiles/{id}/`.
- **`QuoteService`:** añadidos `getAppointmentById(id)`, `createAppointment(payload)`, `submitHealthConsent(id, payload)`.
- **`AgendaService` (studio):** añadido `getAppointmentById(id)`.
- **`AuthService`:** `redirectByRole()` ahora envía al ADMIN a `/admin/dashboard` en lugar de al Django Admin directamente.
- **`roleGuard`:** en caso de rol incorrecto redirige a `/403` en lugar del propio dashboard del usuario.

#### Cambios en la navbar

- Signals `isClient` e `isStudio` ya **no incluyen** al rol ADMIN para evitar mostrar links de otros roles.
- Cada rol ve únicamente sus propios links:
  - CLIENT: Panel · Cotizador · Cotizaciones · Match · Mis Citas · Mi Perfil
  - STUDIO: Dashboard · Solicitudes · Portafolio · Agenda
  - ADMIN: Panel · Estilos · Mi Perfil

#### Cuenta admin de prueba

Creada con el comando `python manage.py shell`. Credenciales para el entorno de desarrollo:

```
Email:      admin@blackline.mx
Contraseña: BlackLine2024!
```

Para crear una nueva cuenta admin en cualquier entorno:

```bash
docker compose exec backend python manage.py shell -c "
from apps.users.models import User
User.objects.create_superuser(
    email='admin@ejemplo.com',
    username='admin',
    password='TuContraseña123!',
    first_name='Admin',
    last_name='BlackLine',
    user_type='ADMIN',
)
"
```

#### Nota técnica importante

`GET /api/quotes/appointments/` devuelve un **array directo** (no paginado), a diferencia de la mayoría de endpoints que devuelven `{count, next, previous, results}`. Tenerlo en cuenta al consumir este endpoint en nuevos componentes.
