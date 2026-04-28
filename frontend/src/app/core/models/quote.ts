export interface QuoteRequestPayload {
  tattoo_style: number;
  body_part: string;
  size_cm: number;
  is_color: boolean;
}

export interface QuoteRequestResponse {
  id: number;
  client: number;
  tattoo_style: number;
  style_name: string;
  body_part: string;
  body_part_display: string;
  size_cm: number;
  is_color: boolean;
  created_at: string;
}

export interface BodyPartOption {
  value: string;
  label: string;
}

// ── Match ──────────────────────────────────────────────────────────────────

export interface MatchSearchParams {
  city: string;
  style_id: number;
  size_cm: number;
  body_part: string;
  is_color: boolean;
  max_price?: number;
}

export interface ArtistMatchCard {
  artist_id: number;
  artist_name: string;
  city: string;
  bio: string;
  minimum_setup_fee: string;
  estimated_price: string;
  styles: { id: number; name: string }[];
  portfolio_thumbnail: string | null;
}

export interface MatchResponse {
  count: number;
  filters_applied: Record<string, unknown>;
  results: ArtistMatchCard[];
}

// ── Citas ──────────────────────────────────────────────────────────────────

export interface AppointmentCreatePayload {
  artist: number;
  quote?: number;
  scheduled_at: string;
}

export interface Appointment {
  id: number;
  client_name: string;
  client_email: string;
  artist_id: number;
  artist_name: string;
  artist_city: string;
  quote: number | null;
  scheduled_at: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'COUNTER_OFFER';
  status_display: string;
  counter_offer_datetime: string | null;
  counter_offer_note: string;
  has_health_consent: boolean;
  created_at: string;
  updated_at: string;
}

export interface AppointmentStatusPayload {
  status: string;
  counter_offer_datetime?: string;
  counter_offer_note?: string;
}

// ── HealthConsent ──────────────────────────────────────────────────────────

export interface HealthConsentPayload {
  has_allergies: boolean;
  allergies_detail: string;
  has_chronic_disease: boolean;
  chronic_disease_detail: string;
  takes_medication: boolean;
  medication_detail: string;
  is_pregnant: boolean;
  has_skin_condition: boolean;
  skin_condition_detail: string;
  terms_accepted: boolean;
}

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
