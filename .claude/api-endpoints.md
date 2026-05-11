# API Endpoints Reference

Base: `http://localhost:8000`  
All endpoints require `Authorization: Bearer <access_token>` unless marked `[public]`.

---

## Auth — `/api/auth/`

| Method | Path | Permission | Description |
|--------|------|-----------|-------------|
| POST | `/api/auth/login/` | `[public]` | Login with email or username; returns `{access, refresh, user}` |
| POST | `/api/auth/token/refresh/` | `[public]` | Refresh access token |
| POST | `/api/auth/logout/` | Authenticated | Blacklists refresh token |
| POST | `/api/auth/register/` | `[public]` | Create CLIENT or STUDIO user |
| GET | `/api/auth/profile/` | Authenticated | Current user profile |
| PATCH | `/api/auth/profile/` | Authenticated | Update `username, first_name, last_name, phone` |
| POST | `/api/auth/change-password/` | Authenticated | Change password |

---

## Artists — `/api/artists/`

### Tattoo Styles
| Method | Path | Permission | Description |
|--------|------|-----------|-------------|
| GET | `/api/artists/styles/` | Authenticated | List all styles |
| GET | `/api/artists/styles/{id}/` | Authenticated | Get style |
| POST/PUT/PATCH/DELETE | `/api/artists/styles/{id}/` | Admin | CRUD styles |

### Artist Profiles
| Method | Path | Permission | Description |
|--------|------|-----------|-------------|
| GET | `/api/artists/profiles/` | Authenticated | List all profiles |
| GET | `/api/artists/profiles/{id}/` | Authenticated | Get profile by ID |
| GET/PATCH | `/api/artists/profiles/me/` | Authenticated | Own profile (get_or_create) |
| GET | `/api/artists/profiles/me/stats/` | Authenticated | `{pending_appointments, upcoming_appointments, total_portfolio_images}` |
| POST/PUT/PATCH/DELETE | `/api/artists/profiles/{id}/` | Owner | CRUD profile |

### Portfolio Images
| Method | Path | Permission | Description |
|--------|------|-----------|-------------|
| GET | `/api/artists/portfolio/` | Owner | List own images |
| GET | `/api/artists/portfolio/{id}/` | Owner | Get image |
| POST | `/api/artists/portfolio/` | Owner | Upload image (`multipart/form-data`: `image`, `description`) |
| POST | `/api/artists/portfolio/reorder/` | Owner | Reorder (`{ordered_ids: number[]}`) |
| DELETE | `/api/artists/portfolio/{id}/` | Owner | Delete image |

### Other
| Method | Path | Permission | Description |
|--------|------|-----------|-------------|
| GET | `/api/artists/cities/` | Authenticated | `[{city, count}]` — cities with artist count |

---

## Quotes — `/api/quotes/`

| Method | Path | Permission | Description |
|--------|------|-----------|-------------|
| GET | `/api/quotes/` | Authenticated | List client's quote requests |
| POST | `/api/quotes/` | Authenticated | Create quote request |
| GET | `/api/quotes/match/` | Authenticated | Match artists (params: `city, style_id, size_cm, body_part, is_color, max_price`) |
| GET | `/api/quotes/appointments/` | Authenticated | List appointments (filtered by role) |
| POST | `/api/quotes/appointments/` | Authenticated | Create appointment (`artist, quote?, scheduled_at`) |
| GET | `/api/quotes/appointments/{pk}/` | Authenticated | Get appointment detail |
| PATCH | `/api/quotes/appointments/{pk}/status/` | Authenticated | Update status (state machine) |
| GET/POST | `/api/quotes/appointments/{pk}/health-consent/` | Authenticated | Get or submit health questionnaire |
| GET | `/api/quotes/calendar-blocks/` | Authenticated | List artist's calendar blocks |
| POST | `/api/quotes/calendar-blocks/` | Authenticated | Create calendar block |
| DELETE | `/api/quotes/calendar-blocks/{pk}/` | Authenticated | Delete calendar block |

---

## Appointment Status State Machine

```
PENDING → APPROVED | REJECTED | COUNTER_OFFER
COUNTER_OFFER → APPROVED | REJECTED
```

`COUNTER_OFFER` requires `counter_offer_datetime` (datetime) and optionally `counter_offer_note`.
