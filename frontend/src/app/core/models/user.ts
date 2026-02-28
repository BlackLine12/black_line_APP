export interface User {
  id: number;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  user_type: 'CLIENT' | 'STUDIO';
  phone?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
