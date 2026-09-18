import { AuditLogItem, Factory, SystemRoleCode, User } from '../types';

const API_BASE = '/api/v1';

// Pre-seeded demo profiles for rapid RBAC testing in UI
export const DEMO_PROFILES: Record<SystemRoleCode, { email: string; pass: string; title: string; dept: string }> = {
  SUPER_ADMIN: {
    email: 'admin@garmenterp.com',
    pass: 'Admin123!',
    title: 'Super Administrator',
    dept: 'Enterprise Architecture'
  },
  FACTORY_ADMIN: {
    email: 'facadmin@garmenterp.com',
    pass: 'Factory123!',
    title: 'Factory General Manager',
    dept: 'Factory Operations (Savar)'
  },
  MANAGEMENT: {
    email: 'management@garmenterp.com',
    pass: 'Mgmt123!',
    title: 'Executive Director',
    dept: 'Board & Executive'
  },
  MERCHANDISER: {
    email: 'merchandiser@garmenterp.com',
    pass: 'Merch123!',
    title: 'Senior Merchandiser',
    dept: 'Merchandising & Buyer Relations'
  },
  PURCHASE_OFFICER: {
    email: 'purchase@garmenterp.com',
    pass: 'Purchase123!',
    title: 'Procurement Specialist',
    dept: 'Supply Chain & Sourcing'
  },
  STORE_OFFICER: {
    email: 'store@garmenterp.com',
    pass: 'Store123!',
    title: 'Chief Warehouse Officer',
    dept: 'Fabric & Trims Inventory'
  },
  PROD_PLANNER: {
    email: 'planner@garmenterp.com',
    pass: 'Planner123!',
    title: 'Production Planner',
    dept: 'Industrial Engineering & Planning'
  },
  PROD_SUPERVISOR: {
    email: 'supervisor@garmenterp.com',
    pass: 'Supervisor123!',
    title: 'Sewing Floor Supervisor',
    dept: 'Floor 2 Production'
  },
  QA_MANAGER: {
    email: 'qamanager@garmenterp.com',
    pass: 'Qa123!',
    title: 'Head of Quality Assurance',
    dept: 'QA/QC Compliance'
  },
  QC_INSPECTOR: {
    email: 'inspector@garmenterp.com',
    pass: 'Inspector123!',
    title: 'Senior QC Inspector',
    dept: 'AQL & Inline Audit'
  },
  COMMERCIAL_OFFICER: {
    email: 'commercial@garmenterp.com',
    pass: 'Commercial123!',
    title: 'Commercial Executive',
    dept: 'LC & Export Logistics'
  },
  HR_OFFICER: {
    email: 'hr@garmenterp.com',
    pass: 'Hr123!',
    title: 'HR & Compliance Manager',
    dept: 'Human Resources'
  },
  FINANCE_OFFICER: {
    email: 'finance@garmenterp.com',
    pass: 'Finance123!',
    title: 'Accounts & Cost Controller',
    dept: 'Finance & Accounts'
  },
  MAINTENANCE_OFFICER: {
    email: 'maintenance@garmenterp.com',
    pass: 'Maint123!',
    title: 'Chief Maintenance Engineer',
    dept: 'Machine & Utilities'
  }
};

class ApiService {
  private token: string | null = localStorage.getItem('garment_access_token');

  public setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('garment_access_token', token);
    } else {
      localStorage.removeItem('garment_access_token');
    }
  }

  public getToken() {
    return this.token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<{ success: boolean; data?: T; error?: any }> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(this.token ? { Authorization: `Bearer ${this.token}` } : {})
    };

    try {
      const res = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers: {
          ...headers,
          ...options.headers
        }
      });
      const data = await res.json();
      return data;
    } catch (err: any) {
      console.warn(`Live API unavailable at ${endpoint}, utilizing cached/simulated response.`, err);
      return { success: false, error: { message: err.message } };
    }
  }

  public async login(email: string, pass: string): Promise<{ success: boolean; data?: { accessToken: string; user: User }; error?: any }> {
    const res = await this.request<{ accessToken: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password: pass })
    });

    if (res.success && res.data?.accessToken) {
      this.setToken(res.data.accessToken);
    }
    return res;
  }

  public async getMe(): Promise<{ success: boolean; data?: User; error?: any }> {
    return this.request<User>('/auth/me');
  }

  public async getHierarchy(): Promise<{ success: boolean; data?: { factories: Factory[] }; error?: any }> {
    return this.request<{ factories: Factory[] }>('/organization/hierarchy');
  }

  public async getAuditLogs(): Promise<{ success: boolean; data?: { logs: AuditLogItem[] }; error?: any }> {
    return this.request<{ logs: AuditLogItem[] }>('/audit/logs');
  }

  public async getRoles(): Promise<{ success: boolean; data?: any[]; error?: any }> {
    return this.request<any[]>('/auth/roles');
  }
}

export const api = new ApiService();
