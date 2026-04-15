
import { Service, ServiceCategory, Professional, Appointment, Client, BusinessInfo, Block, Feedback } from './types';

export const MOCK_BUSINESS_ID = 'mock-business-123';

export const mockBusinessInfo: BusinessInfo = {
  id: MOCK_BUSINESS_ID,
  business_name: 'Barbearia Mock de Teste',
  full_name: 'Administrador de Teste',
  street: 'Rua dos Testes',
  number: '123',
  neighborhood: 'Centro',
  complement: 'Sala 1',
  zip_code: '00000-000',
  city: 'Cidade Mock',
  state: 'TS',
  phone: '(11) 99999-9999',
  logo_url: 'https://images.unsplash.com/photo-1599351432903-8515c1b69437?auto=format&fit=crop&w=200&h=200&q=80',
  work_hours: {
    sunday: null,
    monday: [{ start: '09:00', end: '18:00' }],
    tuesday: [{ start: '09:00', end: '18:00' }],
    wednesday: [{ start: '09:00', end: '18:00' }],
    thursday: [{ start: '09:00', end: '18:00' }],
    friday: [{ start: '09:00', end: '18:00' }],
    saturday: [{ start: '08:00', end: '16:00' }],
  },
  slug: 'barbearia-mock',
  is_exempt: true,
  status: 'active',
  subscription_status: 'active',
  created_at: new Date().toISOString(),
};

export const mockCategories: ServiceCategory[] = [
  { id: 1, name: 'Cabelo', business_id: MOCK_BUSINESS_ID },
  { id: 2, name: 'Barba', business_id: MOCK_BUSINESS_ID },
  { id: 3, name: 'Combo', business_id: MOCK_BUSINESS_ID },
];

export const mockServices: Service[] = [
  { id: 1, name: 'Corte Social', duration: 30, price: 35, category_id: 1, business_id: MOCK_BUSINESS_ID },
  { id: 2, name: 'Degradê', duration: 45, price: 45, category_id: 1, business_id: MOCK_BUSINESS_ID },
  { id: 3, name: 'Barba Simples', duration: 20, price: 25, category_id: 2, business_id: MOCK_BUSINESS_ID },
  { id: 4, name: 'Barboterapia', duration: 40, price: 40, category_id: 2, business_id: MOCK_BUSINESS_ID },
  { id: 5, name: 'Corte + Barba', duration: 60, price: 65, category_id: 3, business_id: MOCK_BUSINESS_ID },
];

export const mockProfessionals: Professional[] = [
  { 
    id: 1, 
    name: 'Carlos Barbeiro', 
    avatar_url: 'https://i.pravatar.cc/150?u=carlos', 
    service_ids: [1, 2, 3, 4, 5], 
    business_id: MOCK_BUSINESS_ID,
    work_hours: mockBusinessInfo.work_hours 
  },
  { 
    id: 2, 
    name: 'Ricardo Navalha', 
    avatar_url: 'https://i.pravatar.cc/150?u=ricardo', 
    service_ids: [1, 2, 3], 
    business_id: MOCK_BUSINESS_ID,
    work_hours: mockBusinessInfo.work_hours 
  },
];

export const mockClients: Client[] = [
  { id: 1, name: 'João Silva', phone: '(11) 98888-8888', status: 'active', business_id: MOCK_BUSINESS_ID, created_at: new Date().toISOString() },
  { id: 2, name: 'Maria Oliveira', phone: '(11) 97777-7777', status: 'active', business_id: MOCK_BUSINESS_ID, created_at: new Date().toISOString() },
];

export const mockAppointments: Appointment[] = [
  { 
    id: 1, 
    service_id: 1, 
    professional_id: 1, 
    client_id: 1, 
    date: new Date().toISOString().split('T')[0], 
    time: '10:00', 
    status: 'confirmed', 
    business_id: MOCK_BUSINESS_ID, 
    created_at: new Date().toISOString() 
  },
];

export const mockBlocks: Block[] = [];
export const mockFeedbacks: Feedback[] = [];
