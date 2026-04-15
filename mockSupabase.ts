
import { MOCK_BUSINESS_ID, mockBusinessInfo, mockCategories, mockServices, mockProfessionals, mockClients, mockAppointments, mockBlocks, mockFeedbacks } from './mockData';

// Simple mock of Supabase client
class MockSupabase {
  private data: any = {
    businesses: [mockBusinessInfo],
    service_categories: mockCategories,
    services: mockServices,
    professionals: mockProfessionals,
    clients: mockClients,
    appointments: mockAppointments,
    schedule_blocks: mockBlocks,
    feedbacks: mockFeedbacks,
  };

  auth = {
    getSession: async () => ({ data: { session: this.getMockSession() }, error: null }),
    getUser: async () => ({ data: { user: this.getMockSession()?.user }, error: null }),
    onAuthStateChange: (callback: any) => {
      // In a real mock we'd handle listeners, but for now just return a dummy unsubscribe
      return { data: { subscription: { unsubscribe: () => {} } } };
    },
    signInWithPassword: async ({ email }: { email: string }) => {
      if (email === 'teste@mock.com') {
        localStorage.setItem('is_mock_logged_in', 'true');
        window.location.reload();
        return { data: { user: this.getMockSession()?.user, session: this.getMockSession() }, error: null };
      }
      return { data: { user: null, session: null }, error: { message: 'Invalid credentials' } };
    },
    signOut: async () => {
      localStorage.removeItem('is_mock_logged_in');
      window.location.reload();
      return { error: null };
    },
    updateUser: async () => ({ data: { user: this.getMockSession()?.user }, error: null }),
    resetPasswordForEmail: async () => ({ error: null }),
  };

  private getMockSession() {
    if (localStorage.getItem('is_mock_logged_in') !== 'true') return null;
    return {
      user: {
        id: MOCK_BUSINESS_ID,
        email: 'teste@mock.com',
        user_metadata: {
          full_name: 'Usuário de Teste',
        }
      },
      access_token: 'mock-token',
    };
  }

  from(table: string) {
    return new MockQueryBuilder(this.data[table] || [], table, this.data);
  }

  channel() {
    return {
      on: () => ({ subscribe: () => {} }),
      subscribe: () => {},
    };
  }

  removeChannel() {}
}

class MockQueryBuilder {
  private filteredData: any[];
  private table: string;
  private allData: any;
  private shouldReturnCount: boolean = false;

  constructor(data: any[], table: string, allData: any) {
    this.filteredData = [...data];
    this.table = table;
    this.allData = allData;
  }

  select(columns: string = '*', { count }: { count?: string } = {}) {
    if (count) this.shouldReturnCount = true;
    return this;
  }

  eq(column: string, value: any) {
    this.filteredData = this.filteredData.filter(item => item[column] === value);
    return this;
  }

  neq(column: string, value: any) {
    this.filteredData = this.filteredData.filter(item => item[column] !== value);
    return this;
  }

  gte(column: string, value: any) {
    this.filteredData = this.filteredData.filter(item => item[column] >= value);
    return this;
  }

  lte(column: string, value: any) {
    this.filteredData = this.filteredData.filter(item => item[column] <= value);
    return this;
  }

  gt(column: string, value: any) {
    this.filteredData = this.filteredData.filter(item => item[column] > value);
    return this;
  }

  lt(column: string, value: any) {
    this.filteredData = this.filteredData.filter(item => item[column] < value);
    return this;
  }

  order(column: string, { ascending = true } = {}) {
    this.filteredData.sort((a, b) => {
      if (a[column] < b[column]) return ascending ? -1 : 1;
      if (a[column] > b[column]) return ascending ? 1 : -1;
      return 0;
    });
    return this;
  }

  limit(n: number) {
    this.filteredData = this.filteredData.slice(0, n);
    return this;
  }

  range(from: number, to: number) {
    this.filteredData = this.filteredData.slice(from, to + 1);
    return this;
  }

  ilike(column: string, pattern: string) {
    const regex = new RegExp(pattern.replace(/%/g, '.*'), 'i');
    this.filteredData = this.filteredData.filter(item => regex.test(item[column]));
    return this;
  }

  like(column: string, pattern: string) {
    const regex = new RegExp(pattern.replace(/%/g, '.*'));
    this.filteredData = this.filteredData.filter(item => regex.test(item[column]));
    return this;
  }

  in(column: string, values: any[]) {
    this.filteredData = this.filteredData.filter(item => values.includes(item[column]));
    return this;
  }

  is(column: string, value: any) {
    this.filteredData = this.filteredData.filter(item => item[column] === value);
    return this;
  }

  contains(column: string, value: any) {
    this.filteredData = this.filteredData.filter(item => {
      const val = item[column];
      if (Array.isArray(val)) return val.includes(value);
      if (typeof val === 'string') return val.includes(value);
      return false;
    });
    return this;
  }

  or(filters: string) {
    // Very simplified OR - just returns this for now to avoid crashing
    return this;
  }

  maybeSingle() {
    return Promise.resolve({ data: this.filteredData[0] || null, error: null });
  }

  single() {
    return Promise.resolve({ data: this.filteredData[0] || null, error: this.filteredData[0] ? null : { message: 'Not found' } });
  }

  async then(resolve: any) {
    resolve({ 
      data: this.filteredData, 
      error: null, 
      count: this.shouldReturnCount ? this.filteredData.length : null 
    });
  }

  // Mutations (simplified)
  async insert(item: any) {
    const newItem = { ...item, id: Math.floor(Math.random() * 1000000) };
    this.allData[this.table].push(newItem);
    return { data: newItem, error: null };
  }

  async update(updates: any) {
    this.filteredData.forEach(item => {
      Object.assign(item, updates);
    });
    return { data: this.filteredData, error: null };
  }

  async delete() {
    const idsToDelete = this.filteredData.map(item => item.id);
    this.allData[this.table] = this.allData[this.table].filter((item: any) => !idsToDelete.includes(item.id));
    return { error: null };
  }

  async upsert(item: any) {
      // Very simplified upsert
      const index = this.allData[this.table].findIndex((i: any) => i.id === item.id);
      if (index > -1) {
          this.allData[this.table][index] = { ...this.allData[this.table][index], ...item };
      } else {
          this.allData[this.table].push({ ...item, id: item.id || Math.floor(Math.random() * 1000000) });
      }
      return { data: item, error: null };
  }
}

export const mockSupabase = new MockSupabase() as any;
