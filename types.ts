
export interface Service {
  id: number;
  name: string;
  duration: number; // in minutes
  price: number;
  category_id?: number;
  business_id: string;
}

export interface ServiceCategory {
  id: number;
  name: string;
  business_id: string;
}

export interface Professional {
  id: number;
  name:string;
  avatar_url: string; // can be a URL or a base64 string
  service_ids: number[];
  work_hours: {
    [key: string]: { start: string; end: string }[] | null;
  };
  business_id: string;
  whatsapp_phone?: string;
}

export interface Appointment {
  id: number;
  service_id: number;
  professional_id: number;
  client_id: number; // Changed from client_name and client_phone
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  status: 'confirmed' | 'declined' | 'cancelled' | 'completed' | 'no_show';
  cancellation_reason?: string; // New field
  business_id: string;
  created_at: string;
}

export interface Client {
  id: number;
  created_at: string;
  name: string;
  phone: string;
  observations?: string;
  status: 'active' | 'inactive';
  business_id: string; 
}

export interface BusinessInfo {
  id: string;
  business_name: string;
  full_name?: string;
  street: string;
  number: string;
  neighborhood?: string; // Added neighborhood
  complement: string;
  zip_code: string;
  city: string;
  state: string;
  phone: string;
  logo_url: string;
  work_hours: {
    [key: string]: { start: string; end: string }[] | null;
  };
  slug: string;
  contact_email?: string;
  
  // Security & Subscription Fields
  is_exempt?: boolean;
  status?: 'active' | 'inactive';
  subscription_status?: 'active' | 'trialing' | 'past_due' | 'canceled' | 'unpaid';
  stripe_customer_id?: string;
  created_at?: string;

  // Reminder Configuration
  reminder_minutes?: number; // Minutes before appointment to remind
  reminder_message?: string; // Custom message template
}

export interface Block {
    id: number;
    professional_id: number;
    date: string;
    start_time: string;
    end_time: string;
    reason?: string;
    business_id: string;
}

export interface Feedback {
  id: number;
  created_at: string;
  appointment_id: number;
  business_id: string;
  client_id: number;
  professional_id: number;
  rating: number; // 1 to 5
  comment?: string;
}