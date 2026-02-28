import { User } from './user';

export interface AuthResponse {
  access: string;
  refresh: string;
  user: User;
}

export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
  password_confirm: string;
  first_name: string;
  last_name: string;
  user_type: 'CLIENT' | 'STUDIO';
  phone?: string;
}
