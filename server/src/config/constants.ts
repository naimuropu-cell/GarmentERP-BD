import { SystemRoleCode } from '../types';

export const SYSTEM_PERMISSIONS = {
  // Auth & RBAC
  MANAGE_USERS: 'users:manage',
  VIEW_USERS: 'users:view',
  MANAGE_ROLES: 'roles:manage',
  VIEW_AUDIT_LOGS: 'audit:view',

  // Organization
  MANAGE_ORGANIZATION: 'org:manage',
  VIEW_ORGANIZATION: 'org:view',

  // Merchandising & PO
  MANAGE_BUYERS: 'buyers:manage',
  MANAGE_STYLES: 'styles:manage',
  MANAGE_TECHPACKS: 'techpacks:manage',
  MANAGE_COSTING: 'costing:manage',
  APPROVE_COSTING: 'costing:approve',
  MANAGE_ORDERS: 'orders:manage',
  APPROVE_ORDERS: 'orders:approve',

  // Supply Chain & Warehouse
  MANAGE_SUPPLIERS: 'suppliers:manage',
  MANAGE_REQUISITIONS: 'requisitions:manage',
  APPROVE_REQUISITIONS: 'requisitions:approve',
  MANAGE_INVENTORY: 'inventory:manage',
  ISSUE_STOCK: 'inventory:issue',
  ADJUST_STOCK: 'inventory:adjust',

  // Production
  MANAGE_PLANNING: 'production:plan',
  MANAGE_CUTTING: 'production:cutting',
  MANAGE_SEWING: 'production:sewing',
  MANAGE_FINISHING: 'production:finishing',
  MANAGE_PACKING: 'production:packing',

  // QA / QC
  CONDUCT_INSPECTION: 'qc:inspect',
  APPROVE_AQL: 'qc:aql_approve',
  MANAGE_DEFECTS: 'qc:defects_manage',
  MANAGE_REWORK: 'qc:rework_manage',
  MANAGE_CAPA: 'qc:capa_manage',

  // Shipment, HR, Finance, Maintenance
  APPROVE_SHIPMENT: 'shipment:approve',
  MANAGE_HR: 'hr:manage',
  MANAGE_FINANCE: 'finance:manage',
  MANAGE_MAINTENANCE: 'maintenance:manage',
  VIEW_EXECUTIVE_DASHBOARD: 'analytics:management'
} as const;

export interface RoleConfig {
  name: string;
  code: SystemRoleCode;
  description: string;
  permissions: string[];
}

export const PREDEFINED_ROLES: RoleConfig[] = [
  {
    name: 'Super Administrator',
    code: 'SUPER_ADMIN',
    description: 'System owner with full platform sovereignty and audit privileges',
    permissions: Object.values(SYSTEM_PERMISSIONS)
  },
  {
    name: 'Factory Administrator',
    code: 'FACTORY_ADMIN',
    description: 'Factory branch manager controlling floor layout, lines, and staff allocations',
    permissions: [
      SYSTEM_PERMISSIONS.VIEW_USERS,
      SYSTEM_PERMISSIONS.MANAGE_ORGANIZATION,
      SYSTEM_PERMISSIONS.VIEW_ORGANIZATION,
      SYSTEM_PERMISSIONS.VIEW_AUDIT_LOGS,
      SYSTEM_PERMISSIONS.VIEW_EXECUTIVE_DASHBOARD
    ]
  },
  {
    name: 'Executive Management',
    code: 'MANAGEMENT',
    description: 'C-Level and Director view for KPIs, order profitability, efficiency, and compliance',
    permissions: [
      SYSTEM_PERMISSIONS.VIEW_ORGANIZATION,
      SYSTEM_PERMISSIONS.VIEW_AUDIT_LOGS,
      SYSTEM_PERMISSIONS.VIEW_EXECUTIVE_DASHBOARD,
      SYSTEM_PERMISSIONS.APPROVE_COSTING,
      SYSTEM_PERMISSIONS.APPROVE_ORDERS,
      SYSTEM_PERMISSIONS.APPROVE_SHIPMENT
    ]
  },
  {
    name: 'Merchandiser',
    code: 'MERCHANDISER',
    description: 'Handles buyer relationships, style tech packs, costing sheets, and purchase orders',
    permissions: [
      SYSTEM_PERMISSIONS.VIEW_ORGANIZATION,
      SYSTEM_PERMISSIONS.MANAGE_BUYERS,
      SYSTEM_PERMISSIONS.MANAGE_STYLES,
      SYSTEM_PERMISSIONS.MANAGE_TECHPACKS,
      SYSTEM_PERMISSIONS.MANAGE_COSTING,
      SYSTEM_PERMISSIONS.MANAGE_ORDERS
    ]
  },
  {
    name: 'Purchase Officer',
    code: 'PURCHASE_OFFICER',
    description: 'Procures raw materials, fabric lots, accessories, and tracks supplier performance',
    permissions: [
      SYSTEM_PERMISSIONS.VIEW_ORGANIZATION,
      SYSTEM_PERMISSIONS.MANAGE_SUPPLIERS,
      SYSTEM_PERMISSIONS.MANAGE_REQUISITIONS
    ]
  },
  {
    name: 'Store / Warehouse Officer',
    code: 'STORE_OFFICER',
    description: 'Controls raw fabric inventory, trim racks, bin locations, and negative stock enforcement',
    permissions: [
      SYSTEM_PERMISSIONS.VIEW_ORGANIZATION,
      SYSTEM_PERMISSIONS.MANAGE_INVENTORY,
      SYSTEM_PERMISSIONS.ISSUE_STOCK,
      SYSTEM_PERMISSIONS.ADJUST_STOCK
    ]
  },
  {
    name: 'Production Planner',
    code: 'PROD_PLANNER',
    description: 'Allocates lines, plans hourly capacity, and monitors factory output vs target',
    permissions: [
      SYSTEM_PERMISSIONS.VIEW_ORGANIZATION,
      SYSTEM_PERMISSIONS.MANAGE_PLANNING,
      SYSTEM_PERMISSIONS.VIEW_EXECUTIVE_DASHBOARD
    ]
  },
  {
    name: 'Production Supervisor',
    code: 'PROD_SUPERVISOR',
    description: 'Supervises line cutting, sewing bundles, hourly outputs, and line balancing',
    permissions: [
      SYSTEM_PERMISSIONS.VIEW_ORGANIZATION,
      SYSTEM_PERMISSIONS.MANAGE_CUTTING,
      SYSTEM_PERMISSIONS.MANAGE_SEWING,
      SYSTEM_PERMISSIONS.MANAGE_FINISHING,
      SYSTEM_PERMISSIONS.MANAGE_PACKING
    ]
  },
  {
    name: 'QA Manager',
    code: 'QA_MANAGER',
    description: 'Directs factory quality policy, signs off AQL final audits, and enforces CAPAs',
    permissions: [
      SYSTEM_PERMISSIONS.VIEW_ORGANIZATION,
      SYSTEM_PERMISSIONS.CONDUCT_INSPECTION,
      SYSTEM_PERMISSIONS.APPROVE_AQL,
      SYSTEM_PERMISSIONS.MANAGE_DEFECTS,
      SYSTEM_PERMISSIONS.MANAGE_REWORK,
      SYSTEM_PERMISSIONS.MANAGE_CAPA
    ]
  },
  {
    name: 'QC Inspector',
    code: 'QC_INSPECTOR',
    description: 'Conducts 4-point fabric inspection, cutting panel QC, sewing inline, and endline audits',
    permissions: [
      SYSTEM_PERMISSIONS.VIEW_ORGANIZATION,
      SYSTEM_PERMISSIONS.CONDUCT_INSPECTION,
      SYSTEM_PERMISSIONS.MANAGE_DEFECTS,
      SYSTEM_PERMISSIONS.MANAGE_REWORK
    ]
  },
  {
    name: 'Commercial Officer',
    code: 'COMMERCIAL_OFFICER',
    description: 'Oversees banking LCs, commercial invoices, custom clearance, and export shipping permits',
    permissions: [
      SYSTEM_PERMISSIONS.VIEW_ORGANIZATION,
      SYSTEM_PERMISSIONS.APPROVE_SHIPMENT
    ]
  },
  {
    name: 'HR Officer',
    code: 'HR_OFFICER',
    description: 'Manages worker shifts, line operators, attendance logs, and payroll structures',
    permissions: [
      SYSTEM_PERMISSIONS.VIEW_ORGANIZATION,
      SYSTEM_PERMISSIONS.MANAGE_HR
    ]
  },
  {
    name: 'Finance Officer',
    code: 'FINANCE_OFFICER',
    description: 'Tracks production costs, order profitability, payables, and receivables',
    permissions: [
      SYSTEM_PERMISSIONS.VIEW_ORGANIZATION,
      SYSTEM_PERMISSIONS.MANAGE_FINANCE,
      SYSTEM_PERMISSIONS.APPROVE_COSTING
    ]
  },
  {
    name: 'Maintenance Officer',
    code: 'MAINTENANCE_OFFICER',
    description: 'Maintains sewing machines, cutting tables, boiler units, and logs downtime tickets',
    permissions: [
      SYSTEM_PERMISSIONS.VIEW_ORGANIZATION,
      SYSTEM_PERMISSIONS.MANAGE_MAINTENANCE
    ]
  }
];

export const JWT_SECRET = process.env.JWT_SECRET || 'garment-erp-bangladesh-super-secure-key-2026';
export const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'garment-erp-bangladesh-refresh-key-2026';
export const ACCESS_TOKEN_EXPIRY = '15m';
export const REFRESH_TOKEN_EXPIRY = '7d';
