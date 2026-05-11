# Data Models Reference

---

## Backend — Django Models

### `apps.users` — User

Extends `AbstractUser`. Primary login field: **email**.

| Field | Type | Notes |
|-------|------|-------|
| `email` | EmailField | unique, login field |
| `username` | CharField | unique |
| `first_name / last_name` | CharField | |
| `user_type` | CharField | `CLIENT` \| `STUDIO` \| `ADMIN` (default: CLIENT) |
| `phone` | CharField | optional, max 20 chars |
| `created_at / updated_at` | DateTimeField | auto |

Properties: `is_client()`, `is_studio()`, `is_admin()`, `full_name`  
Setting: `AUTH_USER_MODEL = "users.User"`

---

### `apps.artists` — ArtistProfile

OneToOne with User. Created via `GET/PATCH /api/artists/profiles/me/` (get_or_create).

| Field | Type | Notes |
|-------|------|-------|
| `user` | OneToOneField(User) | related_name=`artist_profile` |
| `bio` | TextField | blank ok |
| `city` | CharField | max 150 |
| `base_hourly_rate` | DecimalField | 10 digits, 2 decimal |
| `minimum_setup_fee` | DecimalField | 10 digits, 2 decimal |
| `styles` | ManyToManyField(TattooStyle) | related_name=`artists` |

### `apps.artists` — PortfolioImage

| Field | Type | Notes |
|-------|------|-------|
| `artist` | ForeignKey(ArtistProfile) | related_name=`portfolio_images` |
| `image` | ImageField | `upload_to="portfolio/%Y/%m/"` |
| `description` | CharField | max 255, blank ok |
| `position` | PositiveIntegerField | display order, default 0 |

Ordering: `-position, -created_at`

### `apps.artists` — TattooStyle

| Field | Type | Notes |
|-------|------|-------|
| `name` | CharField | max 100, unique |

---

### `apps.quotes` — QuoteRequest

| Field | Type | Notes |
|-------|------|-------|
| `client` | ForeignKey(User) | nullable |
| `tattoo_style` | ForeignKey(TattooStyle) | |
| `body_part` | CharField | choices: BRAZO, PIERNA, ESPALDA, PECHO, COSTILLAS, CUELLO, MANO, PIE, HOMBRO, ANTEBRAZO |
| `size_cm` | PositiveIntegerField | must be > 0 |
| `is_color` | BooleanField | default False |

### `apps.quotes` — Appointment

| Field | Type | Notes |
|-------|------|-------|
| `client` | ForeignKey(User) | related_name=`appointments` |
| `artist` | ForeignKey(ArtistProfile) | related_name=`appointments` |
| `quote` | ForeignKey(QuoteRequest) | optional |
| `scheduled_at` | DateTimeField | must be in future |
| `status` | CharField | `PENDING` \| `APPROVED` \| `REJECTED` \| `COUNTER_OFFER` |
| `counter_offer_datetime` | DateTimeField | nullable |
| `counter_offer_note` | TextField | blank ok |

### `apps.quotes` — HealthConsent

OneToOne with Appointment (RF-6).

| Field | Type | Notes |
|-------|------|-------|
| `has_allergies` | BooleanField | |
| `allergies_detail` | TextField | blank ok |
| `has_chronic_disease` | BooleanField | |
| `chronic_disease_detail` | TextField | |
| `takes_medication` | BooleanField | |
| `medication_detail` | TextField | |
| `is_pregnant` | BooleanField | |
| `has_skin_condition` | BooleanField | |
| `skin_condition_detail` | TextField | |
| `has_hemophilia` | BooleanField | |
| `hemophilia_detail` | TextField | |
| `signature_data` | TextField | base64 PNG, must start with `data:image/` |
| `terms_accepted` | BooleanField | must be True (LFPDPPP compliance) |

### `apps.quotes` — CalendarBlock (RF-7)

| Field | Type | Notes |
|-------|------|-------|
| `artist` | ForeignKey(ArtistProfile) | |
| `start_datetime` | DateTimeField | |
| `end_datetime` | DateTimeField | must be > start |
| `reason` | TextField | blank ok |

---

## Frontend — TypeScript Interfaces

All interfaces live in `frontend/src/app/core/models/`.

### `user.ts`
```typescript
interface User {
  id: number;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  user_type: 'CLIENT' | 'STUDIO' | 'ADMIN';
  phone?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
```

### `auth-response.ts`
```typescript
interface AuthResponse { access: string; refresh: string; user: User; }

interface RegisterPayload {
  username: string; email: string; password: string; password_confirm: string;
  first_name: string; last_name: string; user_type: 'CLIENT' | 'STUDIO'; phone?: string;
}
```

### `artist.ts`
```typescript
interface TattooStyle { id: number; name: string; }

interface PortfolioImage { id: number; artist: number; image: string; description: string; position: number; created_at: string; }

interface ArtistProfile {
  id: number; user: number; username: string; bio: string; city: string;
  base_hourly_rate: string; minimum_setup_fee: string;
  styles: TattooStyle[]; style_ids?: number[];
  portfolio_images: PortfolioImage[]; created_at: string; updated_at: string;
}

interface ArtistStats { pending_appointments: number; upcoming_appointments: number; total_portfolio_images: number; }
interface CityCount { city: string; count: number; }
```

### `quote.ts`
```typescript
interface QuoteRequestPayload { tattoo_style: number; body_part: string; size_cm: number; is_color: boolean; }

interface ArtistMatchCard {
  artist_id: number; artist_name: string; city: string; bio: string;
  minimum_setup_fee: string; estimated_price: string;
  styles: { id: number; name: string }[];
  portfolio_thumbnail: string | null; style_match: boolean;
}

interface Appointment {
  id: number; client_name: string; client_email: string;
  artist_id: number; artist_name: string; artist_city: string;
  quote: number | null; scheduled_at: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'COUNTER_OFFER'; status_display: string;
  counter_offer_datetime: string | null; counter_offer_note: string;
  has_health_consent: boolean; created_at: string; updated_at: string;
}

interface HealthConsentPayload {
  has_allergies: boolean; allergies_detail: string;
  has_chronic_disease: boolean; chronic_disease_detail: string;
  takes_medication: boolean; medication_detail: string;
  is_pregnant: boolean;
  has_skin_condition: boolean; skin_condition_detail: string;
  has_hemophilia: boolean; hemophilia_detail: string;
  signature_data: string; terms_accepted: boolean;
}

interface CalendarBlock { id: number; artist: number; artist_name: string; start_datetime: string; end_datetime: string; reason: string; created_at: string; }
```
