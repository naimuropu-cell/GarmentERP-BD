import bcrypt from 'bcryptjs';
import { PREDEFINED_ROLES } from '../config/constants';
import { AuditLogEntry, SystemRoleCode, UserPayload } from '../types';

export interface UserRecord {
  id: string;
  email: string;
  passwordHash: string;
  fullName: string;
  phone: string;
  roleCode: SystemRoleCode;
  factoryIds: string[];
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
}

export interface ProductionLineRecord {
  id: string;
  departmentId: string;
  lineNumber: string;
  operatorCapacity: number;
  helperCapacity: number;
  targetEfficiency: number;
  isActive: boolean;
}

export interface DepartmentRecord {
  id: string;
  floorId: string;
  name: string;
  type: string;
  lines: ProductionLineRecord[];
}

export interface FloorRecord {
  id: string;
  buildingId: string;
  floorNumber: number;
  name: string;
  departments: DepartmentRecord[];
}

export interface BuildingRecord {
  id: string;
  factoryId: string;
  name: string;
  floors: FloorRecord[];
}

export interface WarehouseRecord {
  id: string;
  factoryId: string;
  name: string;
  type: 'FABRIC' | 'TRIMS' | 'ACCESSORIES' | 'FINISHED_GOODS';
  binLocations: Array<{
    id: string;
    rack: string;
    binCode: string;
    capacityKg?: number;
  }>;
}

export interface FactoryRecord {
  id: string;
  companyId: string;
  name: string;
  code: string;
  division: string;
  district: string;
  upazila: string;
  address: string;
  isActive: boolean;
  buildings: BuildingRecord[];
  warehouses: WarehouseRecord[];
}

export interface CompanyRecord {
  id: string;
  name: string;
  code: string;
  taxNumber: string;
  country: string;
  headquarters: string;
  factories: FactoryRecord[];
}

class SystemStore {
  private company!: CompanyRecord;
  private users: UserRecord[] = [];
  private auditLogs: AuditLogEntry[] = [];
  private refreshTokens: Map<string, string> = new Map(); // userId -> token

  constructor() {
    this.initializeData();
  }

  private initializeData() {
    const salt = bcrypt.genSaltSync(10);

    // 1. Setup Company & Factories in Bangladesh
    const factoryDhakaId = 'fac-dhaka-01';
    const factoryGazipurId = 'fac-gazipur-02';

    const cuttingDeptId = 'dept-cut-01';
    const sewingDeptId = 'dept-sew-01';
    const finishingDeptId = 'dept-fin-01';
    const qaDeptId = 'dept-qa-01';

    const factoryDhaka: FactoryRecord = {
      id: factoryDhakaId,
      companyId: 'comp-apex-01',
      name: 'Apex Garments — Dhaka Unit (Savar)',
      code: 'AG-SAVAR-01',
      division: 'Dhaka',
      district: 'Dhaka',
      upazila: 'Savar',
      address: 'Plot 42-45, Baipail Industrial Area, Savar, Dhaka',
      isActive: true,
      buildings: [
        {
          id: 'bld-savar-a',
          factoryId: factoryDhakaId,
          name: 'Main Production Block A',
          floors: [
            {
              id: 'flr-savar-1',
              buildingId: 'bld-savar-a',
              floorNumber: 1,
              name: 'Ground Floor — Cutting & Fabric Store',
              departments: [
                {
                  id: cuttingDeptId,
                  floorId: 'flr-savar-1',
                  name: 'CAD & Automatic Spreading Cutting Department',
                  type: 'CUTTING',
                  lines: [
                    { id: 'line-cut-1', departmentId: cuttingDeptId, lineNumber: 'Cut Table 01 (Gerber Spreader)', operatorCapacity: 6, helperCapacity: 4, targetEfficiency: 92.0, isActive: true },
                    { id: 'line-cut-2', departmentId: cuttingDeptId, lineNumber: 'Cut Table 02 (Manual Lay)', operatorCapacity: 8, helperCapacity: 6, targetEfficiency: 85.0, isActive: true }
                  ]
                }
              ]
            },
            {
              id: 'flr-savar-2',
              buildingId: 'bld-savar-a',
              floorNumber: 2,
              name: 'Level 2 — Sewing Floor (Lines 01 to 04)',
              departments: [
                {
                  id: sewingDeptId,
                  floorId: 'flr-savar-2',
                  name: 'Woven & Knit Sewing Section',
                  type: 'SEWING',
                  lines: [
                    { id: 'line-sew-01', departmentId: sewingDeptId, lineNumber: 'Sewing Line 01 (Polo Shirt)', operatorCapacity: 38, helperCapacity: 10, targetEfficiency: 88.5, isActive: true },
                    { id: 'line-sew-02', departmentId: sewingDeptId, lineNumber: 'Sewing Line 02 (T-Shirt & Henley)', operatorCapacity: 32, helperCapacity: 8, targetEfficiency: 91.0, isActive: true },
                    { id: 'line-sew-03', departmentId: sewingDeptId, lineNumber: 'Sewing Line 03 (Fleece Hoodie)', operatorCapacity: 42, helperCapacity: 12, targetEfficiency: 84.0, isActive: true },
                    { id: 'line-sew-04', departmentId: sewingDeptId, lineNumber: 'Sewing Line 04 (Jogger Pants)', operatorCapacity: 40, helperCapacity: 10, targetEfficiency: 86.5, isActive: true }
                  ]
                }
              ]
            },
            {
              id: 'flr-savar-3',
              buildingId: 'bld-savar-a',
              floorNumber: 3,
              name: 'Level 3 — Finishing & QA Center',
              departments: [
                {
                  id: finishingDeptId,
                  floorId: 'flr-savar-3',
                  name: 'Finishing & Thread Trimming Section',
                  type: 'FINISHING',
                  lines: [
                    { id: 'line-fin-01', departmentId: finishingDeptId, lineNumber: 'Steam Press & Folding Line 01', operatorCapacity: 20, helperCapacity: 8, targetEfficiency: 95.0, isActive: true }
                  ]
                },
                {
                  id: qaDeptId,
                  floorId: 'flr-savar-3',
                  name: 'Central QA/QC & AQL Audit Room',
                  type: 'QA_QC',
                  lines: [
                    { id: 'line-qa-01', departmentId: qaDeptId, lineNumber: 'Final AQL Inspection Table 01', operatorCapacity: 6, helperCapacity: 2, targetEfficiency: 99.0, isActive: true }
                  ]
                }
              ]
            }
          ]
        }
      ],
      warehouses: [
        {
          id: 'wh-savar-fabric',
          factoryId: factoryDhakaId,
          name: 'Central Bonded Fabric Warehouse',
          type: 'FABRIC',
          binLocations: [
            { id: 'bin-f-01', rack: 'Rack A (100% Cotton)', binCode: 'R-A1-01', capacityKg: 5000 },
            { id: 'bin-f-02', rack: 'Rack B (CVC & TC Fleece)', binCode: 'R-B1-02', capacityKg: 4500 },
            { id: 'bin-f-03', rack: 'Rack Q (Quarantine Lot)', binCode: 'R-Q1-99', capacityKg: 2000 }
          ]
        },
        {
          id: 'wh-savar-trims',
          factoryId: factoryDhakaId,
          name: 'Accessories & Trims Store',
          type: 'TRIMS',
          binLocations: [
            { id: 'bin-t-01', rack: 'Buttons & Zippers', binCode: 'TR-BTN-01', capacityKg: 800 },
            { id: 'bin-t-02', rack: 'Woven Labels & Tags', binCode: 'TR-LBL-02', capacityKg: 500 }
          ]
        },
        {
          id: 'wh-savar-fg',
          factoryId: factoryDhakaId,
          name: 'Finished Goods Export Warehouse',
          type: 'FINISHED_GOODS',
          binLocations: [
            { id: 'bin-fg-01', rack: 'Carton Zone - EU Shipments', binCode: 'FG-EU-01', capacityKg: 10000 },
            { id: 'bin-fg-02', rack: 'Carton Zone - US Shipments', binCode: 'FG-US-02', capacityKg: 10000 }
          ]
        }
      ]
    };

    const factoryGazipur: FactoryRecord = {
      id: factoryGazipurId,
      companyId: 'comp-apex-01',
      name: 'Apex Garments — Gazipur Complex (Kashimpur)',
      code: 'AG-GAZI-02',
      division: 'Dhaka',
      district: 'Gazipur',
      upazila: 'Gazipur Sadar',
      address: 'Kashimpur Road, Gazipur, Bangladesh',
      isActive: true,
      buildings: [
        {
          id: 'bld-gazi-1',
          factoryId: factoryGazipurId,
          name: 'Building Unit 01',
          floors: [
            {
              id: 'flr-gazi-1',
              buildingId: 'bld-gazi-1',
              floorNumber: 1,
              name: 'Sewing Hall B',
              departments: [
                {
                  id: 'dept-gazi-sew',
                  floorId: 'flr-gazi-1',
                  name: 'Heavy Knit & Sweatshirt Section',
                  type: 'SEWING',
                  lines: [
                    { id: 'line-gazi-01', departmentId: 'dept-gazi-sew', lineNumber: 'Sewing Line 09 (Zipper Jackets)', operatorCapacity: 45, helperCapacity: 12, targetEfficiency: 87.0, isActive: true }
                  ]
                }
              ]
            }
          ]
        }
      ],
      warehouses: [
        {
          id: 'wh-gazi-fabric',
          factoryId: factoryGazipurId,
          name: 'Gazipur Raw Material Store',
          type: 'FABRIC',
          binLocations: [
            { id: 'bin-gz-01', rack: 'Yarn Dyed Fabric Rack', binCode: 'GZ-YD-01', capacityKg: 4000 }
          ]
        }
      ]
    };

    this.company = {
      id: 'comp-apex-01',
      name: 'Apex Garments Holdings Ltd.',
      code: 'AGHL-BD',
      taxNumber: 'BIN-192847192-001',
      country: 'Bangladesh',
      headquarters: 'Gulshan-2, Dhaka-1212, Bangladesh',
      factories: [factoryDhaka, factoryGazipur]
    };

    // 2. Pre-seed Default Enterprise Users with Secure Hashed Passwords
    const defaultUsers = [
      {
        id: 'usr-admin-01',
        email: 'admin@garmenterp.com',
        passwordHash: bcrypt.hashSync('Admin123!', salt),
        fullName: 'Engr. Naimur Rahman (System Architect)',
        phone: '+8801700000001',
        roleCode: 'SUPER_ADMIN' as SystemRoleCode,
        factoryIds: [factoryDhakaId, factoryGazipurId],
        isActive: true,
        createdAt: new Date().toISOString()
      },
      {
        id: 'usr-facadmin-01',
        email: 'facadmin@garmenterp.com',
        passwordHash: bcrypt.hashSync('Factory123!', salt),
        fullName: 'Mahmudul Hasan (Savar Factory GM)',
        phone: '+8801700000002',
        roleCode: 'FACTORY_ADMIN' as SystemRoleCode,
        factoryIds: [factoryDhakaId],
        isActive: true,
        createdAt: new Date().toISOString()
      },
      {
        id: 'usr-merch-01',
        email: 'merchandiser@garmenterp.com',
        passwordHash: bcrypt.hashSync('Merch123!', salt),
        fullName: 'Tariqul Islam (Senior Merchandiser)',
        phone: '+8801700000003',
        roleCode: 'MERCHANDISER' as SystemRoleCode,
        factoryIds: [factoryDhakaId, factoryGazipurId],
        isActive: true,
        createdAt: new Date().toISOString()
      },
      {
        id: 'usr-qa-01',
        email: 'qamanager@garmenterp.com',
        passwordHash: bcrypt.hashSync('Qa123!', salt),
        fullName: 'Nazrul Islam (Head of Quality Assurance)',
        phone: '+8801700000004',
        roleCode: 'QA_MANAGER' as SystemRoleCode,
        factoryIds: [factoryDhakaId, factoryGazipurId],
        isActive: true,
        createdAt: new Date().toISOString()
      },
      {
        id: 'usr-sup-01',
        email: 'supervisor@garmenterp.com',
        passwordHash: bcrypt.hashSync('Supervisor123!', salt),
        fullName: 'Abdur Rahim (Floor 2 Sewing In-Charge)',
        phone: '+8801700000005',
        roleCode: 'PROD_SUPERVISOR' as SystemRoleCode,
        factoryIds: [factoryDhakaId],
        isActive: true,
        createdAt: new Date().toISOString()
      },
      {
        id: 'usr-store-01',
        email: 'store@garmenterp.com',
        passwordHash: bcrypt.hashSync('Store123!', salt),
        fullName: 'Kazi Farhan (Chief Warehouse Officer)',
        phone: '+8801700000006',
        roleCode: 'STORE_OFFICER' as SystemRoleCode,
        factoryIds: [factoryDhakaId],
        isActive: true,
        createdAt: new Date().toISOString()
      }
    ];

    this.users = defaultUsers;

    // Log system genesis
    this.addAuditLog({
      id: 'audit-001',
      userId: 'usr-admin-01',
      userEmail: 'admin@garmenterp.com',
      userName: 'Engr. Naimur Rahman',
      action: 'CREATE',
      entityName: 'SystemGenesis',
      entityId: 'SYSTEM-ROOT',
      newValues: { message: 'GarmentERP BD initialized with multi-tiered Bangladesh factory hierarchy.' },
      timestamp: new Date().toISOString()
    });
  }

  // User Operations
  public findUserByEmail(email: string): UserRecord | undefined {
    return this.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  public findUserById(id: string): UserRecord | undefined {
    return this.users.find(u => u.id === id);
  }

  public getAllUsers(): Omit<UserRecord, 'passwordHash'>[] {
    return this.users.map(({ passwordHash, ...rest }) => rest);
  }

  public createUser(user: Omit<UserRecord, 'id' | 'createdAt'>): UserRecord {
    const newUser: UserRecord = {
      ...user,
      id: `usr-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    this.users.push(newUser);
    return newUser;
  }

  public updateUserRole(userId: string, roleCode: SystemRoleCode, factoryIds?: string[]): UserRecord | null {
    const user = this.findUserById(userId);
    if (!user) return null;
    user.roleCode = roleCode;
    if (factoryIds) user.factoryIds = factoryIds;
    return user;
  }

  public setRefreshToken(userId: string, token: string) {
    this.refreshTokens.set(userId, token);
  }

  public getRefreshToken(userId: string): string | undefined {
    return this.refreshTokens.get(userId);
  }

  public revokeRefreshToken(userId: string) {
    this.refreshTokens.delete(userId);
  }

  // Role Operations
  public getRoleByCode(code: SystemRoleCode) {
    return PREDEFINED_ROLES.find(r => r.code === code);
  }

  public getAllRoles() {
    return PREDEFINED_ROLES;
  }

  // Organization Operations
  public getCompany(): CompanyRecord {
    return this.company;
  }

  public getFactories(): FactoryRecord[] {
    return this.company.factories;
  }

  public getFactoryById(factoryId: string): FactoryRecord | undefined {
    return this.company.factories.find(f => f.id === factoryId);
  }

  public addFactory(factory: Omit<FactoryRecord, 'id' | 'buildings' | 'warehouses'>): FactoryRecord {
    const newFactory: FactoryRecord = {
      ...factory,
      id: `fac-${Date.now()}`,
      buildings: [],
      warehouses: []
    };
    this.company.factories.push(newFactory);
    return newFactory;
  }

  public addProductionLine(departmentId: string, line: Omit<ProductionLineRecord, 'id'>): ProductionLineRecord | null {
    for (const factory of this.company.factories) {
      for (const bld of factory.buildings) {
        for (const flr of bld.floors) {
          const dept = flr.departments.find(d => d.id === departmentId);
          if (dept) {
            const newLine: ProductionLineRecord = {
              ...line,
              id: `line-${Date.now()}`
            };
            dept.lines.push(newLine);
            return newLine;
          }
        }
      }
    }
    return null;
  }

  // Audit Logs
  public addAuditLog(entry: AuditLogEntry) {
    this.auditLogs.unshift(entry);
    if (this.auditLogs.length > 500) {
      this.auditLogs.pop();
    }
  }

  public getAuditLogs(limit: number = 100): AuditLogEntry[] {
    return this.auditLogs.slice(0, limit);
  }
}

export const store = new SystemStore();
