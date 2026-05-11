# Development Workflow Reference

---

## Quick Start

```bash
# 1. Copy environment file
cp .env.example .env   # fill in SECRET_KEY at minimum

# 2. Start everything
docker compose up --build

# Services:
#   Frontend  → http://localhost:4200
#   Backend   → http://localhost:8000
#   DB        → localhost:5432
```

---

## Docker Commands

```bash
docker compose up --build          # rebuild images and start
docker compose up                  # start without rebuild (faster)
docker compose down                # stop, keep volumes
docker compose down -v             # stop, delete postgres_data volume (wipes DB)
docker compose logs -f backend     # stream backend logs
docker compose logs -f frontend    # stream frontend logs
docker compose exec backend bash   # shell into backend container
docker compose exec db psql -U postgres black_line_db   # postgres shell
```

---

## Frontend Without Docker

```bash
cd frontend
npm install
npm start        # http://localhost:4200, hot reload via polling (interval: 2000ms)
npm run build    # production output → frontend/dist/
npm test         # Karma/Jasmine, opens browser
```

Angular uses `src/environments/environment.ts` for `apiUrl`. Default: `http://localhost:8000/api`.

---

## Backend Without Docker

```bash
cd backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Set DB to local postgres or use SQLite for quick tests
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver 0.0.0.0:8000
```

---

## Environment Variables

Key `.env` variables (see `.env.example` for full list):

```env
SECRET_KEY=<generate a random key>
DEBUG=True
DB_NAME=black_line_db
DB_USER=postgres
DB_PASSWORD=postgres123
DB_HOST=db           # use 'localhost' when running backend outside Docker
DB_PORT=5432

CORS_ALLOWED_ORIGINS=http://localhost:4200
JWT_ACCESS_TOKEN_LIFETIME_MINUTES=60
JWT_REFRESH_TOKEN_LIFETIME_DAYS=7
FRONTEND_URL=http://localhost:4200

# Email (dev uses console backend — no config needed)
EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend
```

---

## Adding a New Feature

### New Backend Endpoint
1. Add model to `apps/<app>/models.py`
2. Run `python manage.py makemigrations`
3. Add serializer to `apps/<app>/serializers.py`
4. Add view to `apps/<app>/views.py`
5. Register URL in `apps/<app>/urls.py`
6. Update `api-endpoints.md`

### New Frontend Route (Client/Studio)
1. Create component in `features/<role>/pages/`
2. Add route to `features/<role>/pages/<role>.routes.ts`
3. Add service method if a new API call is needed
4. Update `frontend-architecture.md`

---

## Debugging

- **Backend 401s:** Check JWT token in sessionStorage (`bl_access_token`), verify it's not expired.
- **CORS errors:** Confirm `CORS_ALLOWED_ORIGINS` in `.env` includes the frontend origin.
- **DB connection failed:** Ensure `DB_HOST=db` inside Docker or `DB_HOST=localhost` outside Docker.
- **Email not sending:** In dev, check Docker backend logs — emails print to console.
- **Portfolio images 404:** `MEDIA_ROOT` must be mounted as a Docker volume.

---

## Git Branch Convention

Current active branch: `arturo-dev`  
Main branch for PRs: `main`
