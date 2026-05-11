# Backend Architecture Reference

Stack: Django 6.0.2, Django REST Framework 3.15.2, PostgreSQL 16, Python 3.12.  
Settings: `backend/config/settings.py` — env vars via `python-decouple`.

---

## Django Apps

| App | Path | Responsibility |
|-----|------|---------------|
| `users` | `apps/users/` | Custom User model, JWT auth, registration, password change |
| `artists` | `apps/artists/` | Studio profiles, portfolios, tattoo styles, ratings |
| `quotes` | `apps/quotes/` | Quote requests, matchmaking, appointments, health consent, calendar blocks, emails |

`AUTH_USER_MODEL = "users.User"` — login field is **email** (not username).

---

## REST Framework Config

```python
DEFAULT_AUTHENTICATION_CLASSES: JWTAuthentication        # all endpoints authenticated by default
DEFAULT_PERMISSION_CLASSES:     IsAuthenticated
DEFAULT_FILTER_BACKENDS:        DjangoFilterBackend
DEFAULT_PAGINATION_CLASS:       PageNumberPagination
PAGE_SIZE:                      10
# Some gallery viewsets override pagination_class = None
```

---

## JWT (Simple JWT)

| Setting | Value |
|---------|-------|
| Access lifetime | `JWT_ACCESS_TOKEN_LIFETIME_MINUTES` env var (default 60 min) |
| Refresh lifetime | `JWT_REFRESH_TOKEN_LIFETIME_DAYS` env var (default 7 days) |
| Rotate refresh | True |
| Blacklist after rotation | True |
| Algorithm | HS256 |
| Auth header | `Bearer` |

**Custom token claims** (added by `CustomTokenObtainPairSerializer`):  
`email`, `user_type` (`CLIENT`/`STUDIO`/`ADMIN`), `full_name`

---

## Serializer Patterns

Read/write serializers are split for Appointments:
- `AppointmentReadSerializer` — display fields, SerializerMethodField for names
- `AppointmentCreateSerializer` — minimal write fields, future-date validation
- `AppointmentStatusSerializer` — status update, COUNTER_OFFER requires `counter_offer_datetime`

`ArtistProfileSerializer`:
- `styles` (read) — nested `TattooStyleSerializer`
- `style_ids` (write-only) — maps to ManyToMany field

---

## Matchmaking (`/api/quotes/match/`)

Price (`estimated_price`) and `style_match` flag are calculated **in SQL** via `annotate / F / Case-When` to meet a 2.5s SLA — not in Python.

Query params: `city`, `style_id`, `size_cm`, `body_part`, `is_color`, `max_price` (optional).

---

## Custom Permissions

- `IsArtistOwnerOrReadOnly` — write access only to own ArtistProfile / PortfolioImage
- `IsAdminUser` — Django built-in, used for TattooStyle CRUD

---

## Email

Dev: `console.EmailBackend` (output to terminal).  
Prod: SMTP via `EMAIL_HOST`, `EMAIL_HOST_USER`, `EMAIL_HOST_PASSWORD` env vars.  
Sender: `DEFAULT_FROM_EMAIL` (default: `BlackLine <noreply@blackline.mx>`).  
Used in `apps/quotes/` for appointment notifications (RF-9).

---

## Localization

```
LANGUAGE_CODE: es-mx
TIME_ZONE:     America/Chihuahua
USE_TZ:        True
```

---

## File Storage

```
MEDIA_URL:  /media/
MEDIA_ROOT: backend/media/        # Portfolio images stored here
STATIC_URL: /static/
```

---

## CORS

`CORS_ALLOWED_ORIGINS` env var (default `http://localhost:4200`).  
`CORS_ALLOW_CREDENTIALS = True`

---

## Key Commands

```bash
# Migrations
python manage.py makemigrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Run tests
python manage.py test
python manage.py test apps.users.tests.TestUserAuth   # single test class

# Django shell
python manage.py shell
```

Migrations run automatically on Docker container startup via the compose command:  
`sh -c "python manage.py migrate && python manage.py runserver 0.0.0.0:8000"`
