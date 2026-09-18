export type SystemRoleCode =
  | 'SUPER_ADMIN'
  | 'FACTORY_ADMIN'
  | 'MANAGEMENT'
  | 'MERCHANDISER'
  | 'PURCHASE_OFFICER'
  | 'STORE_OFFICER'
  | 'PROD_PLANNER'
  | 'PROD_SUPERVISOR'
  | 'QA_MANAGER'
  | 'QC_INSPECTOR'
  | 'COMMERCIAL_OFFICER'
  | 'HR_OFFICER'
  | 'FINANCE_OFFICER'
  | 'MAINTENANCE_OFFICER';

export interface UserPayload {
  id: string;
  email: string;
  fullName: string;
  roleCode: SystemRoleCode;
  permissions: string[];
  factoryIds: string[];
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    fullName: string;
    role: {
      code: SystemRoleCode;
      name: string;
      permissions: string[];
    };
    factories: Array<{
      id: string;
      name: string;
      code: string;
    }>;
  };
  accessToken: string;
}

export interface AuditLogEntry {
  id: string;
  userId: string | null;
  userEmail?: string;
  userName?: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT' | 'APPROVAL' | 'REJECT';
  entityName: string;
  entityId: string;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
}
