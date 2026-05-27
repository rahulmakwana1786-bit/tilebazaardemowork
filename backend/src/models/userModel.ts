export type UserRole = 'customer' | 'admin';

export interface User {
  // Identity
  id: string;
  email: string;
  password?: string; // Hashed - hidden from frontend
  role: UserRole;

  // Profile Details
  full_name: string;
  phone_number?: string;
  
  // Shipping/Business Details (Mostly for Customers)
  address_line1?: string;
  address_line2?: string;
  city?: string;
  postcode?: string;
  country?: string; // e.g., 'United Kingdom'

  // Metadata
  created_at: string;
  last_login?: string;
}