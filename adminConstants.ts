
export interface SubscribedClient {
    id: string;
    businessName: string;
    ownerName: string;
    email: string;
    phone: string;
    city: string;
    state: string;
    status: 'active' | 'inactive';
    joinDate: string; // YYYY-MM-DD
    plan: string;
    monthlyRevenue: number;
    isExempt: boolean; // Is exempt from payment
}

export interface AdminNotification {
  id: number;
  created_at: string;
  type: 'new_signup' | 'new_appointment' | 'cancelled_appointment';
  message: string;
  is_read: boolean;
  target_business_id?: string;
}
