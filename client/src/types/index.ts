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

export interface User {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  role: {
    code: SystemRoleCode;
    name: string;
    description: string;
    permissions: string[];
  };
  factories: Array<{
    id: string;
    name: string;
    code: string;
    division: string;
  }>;
  lastLoginAt?: string;
}

export interface ProductionLine {
  id: string;
  lineNumber: string;
  operatorCapacity: number;
  helperCapacity: number;
  targetEfficiency: number;
  isActive: boolean;
}

export interface Department {
  id: string;
  name: string;
  type: string;
  lines: ProductionLine[];
}

export interface Floor {
  id: string;
  floorNumber: number;
  name: string;
  departments: Department[];
}

export interface Building {
  id: string;
  name: string;
  floors: Floor[];
}

export interface Warehouse {
  id: string;
  name: string;
  type: 'FABRIC' | 'TRIMS' | 'ACCESSORIES' | 'FINISHED_GOODS';
  binLocations: Array<{
    id: string;
    rack: string;
    binCode: string;
    capacityKg?: number;
  }>;
}

export interface Factory {
  id: string;
  companyId: string;
  name: string;
  code: string;
  division: string;
  district: string;
  upazila: string;
  address: string;
  isActive: boolean;
  buildings: Building[];
  warehouses: Warehouse[];
}

export interface AuditLogItem {
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
  timestamp: string;
}
