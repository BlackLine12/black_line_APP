export interface TattooStyle {
  id: number;
  name: string;
}

export interface PortfolioImage {
  id: number;
  artist: number;
  image: string;
  description: string;
  position: number;
  created_at: string;
}

export interface ArtistProfile {
  id: number;
  user: number;
  username: string;
  bio: string;
  city: string;
  base_hourly_rate: string;
  minimum_setup_fee: string;
  styles: TattooStyle[];
  style_ids?: number[];
  portfolio_images: PortfolioImage[];
  created_at: string;
  updated_at: string;
}
