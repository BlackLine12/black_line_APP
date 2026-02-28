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
