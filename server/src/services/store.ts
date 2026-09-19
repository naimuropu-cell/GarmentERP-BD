import bcrypt from 'bcryptjs';
import { PREDEFINED_ROLES } from '../config/constants';
import { AuditLogEntry, SystemRoleCode, UserPayload } from '../types';
import { 
  Buyer, 
  GarmentStyle, 
  CostingSheet, 
  BuyerPurchaseOrder, 
  BOMItem, 
  TechPackVersion,
  POStatus
} from '../types/merchandising';
import {
  Supplier,
  PurchaseRequisition,
  SupplierPurchaseOrder,
  GoodsReceivedNote,
  StockItem,
  StockTransaction
} from '../types/supplyChain';
import {
  FabricRelaxationRecord,
  CutOrder,
  CutBundle,
  SewingHourlyOutput,
  SewingLineSummary,
  FinishingBatch,
  CartonPackingRecord
} from '../types/production';
import {
  Fabric4PointInspection,
  SewingDefectRecord,
  ReworkOrder,
  CapaRecord,
  AqlSamplingInspection
} from '../types/qa';
import {
  CommercialInvoice,
  PackingList,
  PackingListCartonItem,
  SecurityGatePass,
  Shipment,
  ShipmentStatus,
  ContainerType,
  Incoterm
} from '../types/shipment';
import {
  Employee,
  AttendanceRecord,
  PayrollRecord,
  MachineAsset,
  MaintenanceTicket,
  CostCenter,
  FinancialTransaction,
  OrderProfitabilityAnalysis,
  ComplianceAudit,
  ComplianceFinding
} from '../types/operations';

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
  private buyers: Buyer[] = [];
  private styles: GarmentStyle[] = [];
  private costingSheets: CostingSheet[] = [];
  private purchaseOrders: BuyerPurchaseOrder[] = [];
  private suppliers: Supplier[] = [];
  private purchaseRequisitions: PurchaseRequisition[] = [];
  private supplierPurchaseOrders: SupplierPurchaseOrder[] = [];
  private grns: GoodsReceivedNote[] = [];
  private stockInventory: StockItem[] = [];
  private stockTransactions: StockTransaction[] = [];
  private relaxations: FabricRelaxationRecord[] = [];
  private cutOrders: CutOrder[] = [];
  private bundles: CutBundle[] = [];
  private sewingHourlyLogs: SewingHourlyOutput[] = [];
  private finishingBatches: FinishingBatch[] = [];
  private cartons: CartonPackingRecord[] = [];
  private fabricInspections: Fabric4PointInspection[] = [];
  private sewingDefects: SewingDefectRecord[] = [];
  private reworkOrders: ReworkOrder[] = [];
  private capaRecords: CapaRecord[] = [];
  private aqlInspections: AqlSamplingInspection[] = [];
  private commercialInvoices: CommercialInvoice[] = [];
  private packingLists: PackingList[] = [];
  private gatePasses: SecurityGatePass[] = [];
  private shipments: Shipment[] = [];
  private employees: Employee[] = [];
  private attendanceRecords: AttendanceRecord[] = [];
  private payrollRecords: PayrollRecord[] = [];
  private machines: MachineAsset[] = [];
  private maintenanceTickets: MaintenanceTicket[] = [];
  private costCenters: CostCenter[] = [];
  private financialTransactions: FinancialTransaction[] = [];
  private complianceAudits: ComplianceAudit[] = [];

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

    // 3. Pre-seed Global Export Buyers
    this.buyers = [
      {
        id: 'buy-hm-01',
        name: 'H&M Hennes & Mauritz GBC AB',
        code: 'HM-EU',
        country: 'Sweden',
        currency: 'EUR',
        paymentTerms: 'LC at sight (100% Irrevocable)',
        shippingTerms: 'FOB',
        portOfDischarge: 'Port of Hamburg / Gothenburg',
        contacts: [
          { id: 'cnt-1', name: 'Lars Lindqvist', email: 'lars.lindqvist@hm.com', phone: '+46 8 796 55 00', designation: 'Country Sourcing Manager' }
        ],
        status: 'ACTIVE',
        createdAt: new Date().toISOString()
      },
      {
        id: 'buy-zara-02',
        name: 'Inditex S.A. (Zara Fashion)',
        code: 'INDITEX-ES',
        country: 'Spain',
        currency: 'EUR',
        paymentTerms: 'TT 60 Days from B/L',
        shippingTerms: 'FOB',
        portOfDischarge: 'Port of Barcelona / Valencia',
        contacts: [
          { id: 'cnt-2', name: 'Sofia Rodriguez', email: 'sofia.rodriguez@inditex.es', phone: '+34 981 185 400', designation: 'Senior Buyer Apparel' }
        ],
        status: 'ACTIVE',
        createdAt: new Date().toISOString()
      },
      {
        id: 'buy-target-03',
        name: 'Target Brands Inc.',
        code: 'TARGET-US',
        country: 'United States',
        currency: 'USD',
        paymentTerms: 'LC 90 Days',
        shippingTerms: 'FOB',
        portOfDischarge: 'Port of Los Angeles (LAX)',
        contacts: [
          { id: 'cnt-3', name: 'David Miller', email: 'david.miller@target.com', phone: '+1 612 304 6073', designation: 'Global Procurement Lead' }
        ],
        status: 'ACTIVE',
        createdAt: new Date().toISOString()
      }
    ];

    // 4. Pre-seed Garment Styles & Multi-Version Tech Packs
    this.styles = [
      {
        id: 'stl-polo-01',
        buyerId: 'buy-hm-01',
        buyerName: 'H&M Hennes & Mauritz GBC AB',
        styleNumber: 'TSH-2026-001',
        styleName: 'Men’s Regular Pique Polo Shirt with Rib Collar',
        season: 'Summer 2026',
        productCategory: 'Knitwear',
        garmentType: 'Polo Shirt',
        brand: 'H&M Basic Collection',
        availableColors: ['Jet Black', 'Optical White', 'Navy Blue'],
        availableSizes: ['S', 'M', 'L', 'XL', 'XXL'],
        activeTechPackVersion: 'v2.0',
        techPackVersions: [
          {
            version: 'v1.0',
            revisionDate: '2026-06-10T10:00:00Z',
            createdBy: 'Tariqul Islam',
            isApproved: false,
            fabricSpecs: {
              composition: '100% Combed Ring-Spun Cotton',
              construction: 'Pique Knit',
              weightGsm: 180,
              yarnCount: '26/1 Ne',
              finishingWash: 'Bio-polish Silicon Softener Wash'
            },
            stitchSpecs: '12-14 SPI (Stitches Per Inch), 3-thread overlock with twin needle hem',
            washingInstructions: 'Machine wash 40°C, wash inside out with similar colors, do not tumble dry',
            artworkNotes: 'Self fabric collar with 2-hole horn button placket',
            measurements: [
              { pointOfMeasure: '1/2 Chest width (2.5cm below armhole)', code: 'CHEST', tolerancePlusCm: 1.0, toleranceMinusCm: 1.0, specsBySize: { S: 50, M: 53, L: 56, XL: 59, XXL: 62 } },
              { pointOfMeasure: 'Body length from HPS (High Point Shoulder)', code: 'LENGTH', tolerancePlusCm: 1.5, toleranceMinusCm: 1.5, specsBySize: { S: 70, M: 72, L: 74, XL: 76, XXL: 78 } },
              { pointOfMeasure: 'Short sleeve length from shoulder seam', code: 'SLEEVE', tolerancePlusCm: 0.5, toleranceMinusCm: 0.5, specsBySize: { S: 21, M: 22, L: 23, XL: 24, XXL: 25 } }
            ]
          },
          {
            version: 'v2.0',
            revisionDate: '2026-07-15T14:30:00Z',
            createdBy: 'Tariqul Islam',
            isApproved: true,
            fabricSpecs: {
              composition: '100% Combed Ring-Spun Cotton (BCI Certified)',
              construction: 'Honey-comb Pique Knit',
              weightGsm: 185,
              yarnCount: '28/1 Ne Compact',
              finishingWash: 'Bio-wash Enzymatic Softener'
            },
            stitchSpecs: '14 SPI, Reinforcement tape at back neck & side slits',
            washingInstructions: 'Machine wash 40°C delicate, wash inside out, iron on reverse',
            artworkNotes: 'Embroidered tone-on-tone logo at left chest (35mm width)',
            measurements: [
              { pointOfMeasure: '1/2 Chest width (2.5cm below armhole)', code: 'CHEST', tolerancePlusCm: 1.0, toleranceMinusCm: 1.0, specsBySize: { S: 50, M: 53, L: 56, XL: 59, XXL: 62 } },
              { pointOfMeasure: 'Body length from HPS', code: 'LENGTH', tolerancePlusCm: 1.5, toleranceMinusCm: 1.5, specsBySize: { S: 71, M: 73, L: 75, XL: 77, XXL: 79 } },
              { pointOfMeasure: 'Short sleeve length', code: 'SLEEVE', tolerancePlusCm: 0.5, toleranceMinusCm: 0.5, specsBySize: { S: 21.5, M: 22.5, L: 23.5, XL: 24.5, XXL: 25.5 } },
              { pointOfMeasure: 'Neck width / Collar circumference', code: 'COLLAR', tolerancePlusCm: 0.5, toleranceMinusCm: 0.5, specsBySize: { S: 40, M: 41.5, L: 43, XL: 44.5, XXL: 46 } }
            ]
          }
        ],
        createdAt: new Date().toISOString()
      },
      {
        id: 'stl-hoodie-02',
        buyerId: 'buy-target-03',
        buyerName: 'Target Brands Inc.',
        styleNumber: 'HOD-2026-002',
        styleName: 'Unisex Brushed Heavy Fleece Pullover Hoodie',
        season: 'Winter 2026',
        productCategory: 'Fleece / Sweatshirt',
        garmentType: 'Fleece Hoodie',
        brand: 'Goodfellow & Co.',
        availableColors: ['Heather Grey', 'Military Olive', 'Washed Black'],
        availableSizes: ['M', 'L', 'XL', 'XXL'],
        activeTechPackVersion: 'v1.0',
        techPackVersions: [
          {
            version: 'v1.0',
            revisionDate: '2026-08-01T09:00:00Z',
            createdBy: 'Tariqul Islam',
            isApproved: true,
            fabricSpecs: {
              composition: '80% Organic Cotton / 20% Recycled Polyester',
              construction: '3-End Brushed Fleece',
              weightGsm: 320,
              yarnCount: '20s + 10s fleece back',
              finishingWash: 'Pre-shrunk Anti-pilling Wash'
            },
            stitchSpecs: 'Flatlock seam on kangaroo pocket and armholes',
            washingInstructions: 'Wash cold with similar colors, tumble dry low',
            artworkNotes: 'Double layered hood with round cotton drawcord and brass eyelets',
            measurements: [
              { pointOfMeasure: '1/2 Chest width', code: 'CHEST', tolerancePlusCm: 1.5, toleranceMinusCm: 1.5, specsBySize: { M: 58, L: 61, XL: 64, XXL: 67 } },
              { pointOfMeasure: 'Body length from HPS', code: 'LENGTH', tolerancePlusCm: 2.0, toleranceMinusCm: 2.0, specsBySize: { M: 72, L: 74, XL: 76, XXL: 78 } }
            ]
          }
        ],
        createdAt: new Date().toISOString()
      }
    ];

    // 5. Pre-seed Costing Sheets (Itemized BOM Breakdown & Margin Controls)
    this.costingSheets = [
      {
        id: 'cst-polo-01',
        styleId: 'stl-polo-01',
        styleNumber: 'TSH-2026-001',
        version: 1,
        currency: 'USD',
        items: [
          { category: 'FABRIC', description: '100% Cotton Pique 185 GSM (0.85 KG / pc)', unit: 'KG', consumptionPerPc: 0.85, unitPriceUsd: 4.50, totalCostUsd: 3.825 },
          { category: 'TRIMS', description: 'Rib collar & cuff, woven main label, care label', unit: 'set', consumptionPerPc: 1.0, unitPriceUsd: 0.25, totalCostUsd: 0.25 },
          { category: 'ACCESSORIES', description: 'Buttons (3 pcs), polybag, hangtag & barcode', unit: 'set', consumptionPerPc: 1.0, unitPriceUsd: 0.125, totalCostUsd: 0.125 },
          { category: 'CM', description: 'Cost of Making (Cutting, Sewing, Trimming)', unit: 'pc', consumptionPerPc: 1.0, unitPriceUsd: 1.50, totalCostUsd: 1.50 },
          { category: 'WASHING', description: 'Bio-enzymatic softening wash', unit: 'pc', consumptionPerPc: 1.0, unitPriceUsd: 0.30, totalCostUsd: 0.30 },
          { category: 'OVERHEAD', description: 'Factory utility, commercial LC & forwarder fee', unit: 'pc', consumptionPerPc: 1.0, unitPriceUsd: 0.50, totalCostUsd: 0.50 }
        ],
        materialCostUsd: 4.20,
        productionCostUsd: 1.80,
        overheadCostUsd: 0.50,
        totalCostUsd: 6.50,
        offeredPriceUsd: 8.00,
        profitMarginUsd: 1.50,
        profitMarginPercent: 18.75,
        status: 'APPROVED',
        approvedBy: 'Mahmudul Hasan (Savar GM)',
        updatedAt: new Date().toISOString()
      }
    ];

    // 6. Pre-seed Buyer Purchase Orders with Dynamic BOM & MRP Shortage
    this.purchaseOrders = [
      {
        id: 'po-2026-001',
        poNumber: 'PO-2026-001',
        buyerId: 'buy-hm-01',
        buyerName: 'H&M Hennes & Mauritz GBC AB',
        styleId: 'stl-polo-01',
        styleNumber: 'TSH-2026-001',
        styleName: 'Men’s Regular Pique Polo Shirt',
        factoryId: factoryDhakaId,
        factoryName: 'Apex Garments — Dhaka Unit (Savar)',
        orderQuantity: 10000,
        unitPriceUsd: 8.00,
        totalOrderValueUsd: 80000.00,
        orderDate: '2026-08-01',
        exFactoryDeliveryDate: '2026-11-30',
        status: 'IN_PRODUCTION',
        colorSizeBreakdown: [
          { color: 'Jet Black', size: 'S', quantity: 1000 },
          { color: 'Jet Black', size: 'M', quantity: 1500 },
          { color: 'Jet Black', size: 'L', quantity: 1500 },
          { color: 'Jet Black', size: 'XL', quantity: 1000 },
          { color: 'Optical White', size: 'S', quantity: 1000 },
          { color: 'Optical White', size: 'M', quantity: 1500 },
          { color: 'Optical White', size: 'L', quantity: 1500 },
          { color: 'Optical White', size: 'XL', quantity: 1000 }
        ],
        bom: [
          {
            id: 'bom-1',
            itemType: 'FABRIC',
            itemName: '100% Cotton Pique 185 GSM (Black & White)',
            specification: 'Honey-comb knit, 28/1 Ne compact',
            unit: 'KG',
            consumptionPerPiece: 0.85,
            wastagePercent: 5.0,
            totalRequiredQty: 8925,
            availableStockQty: 5000,
            allocatedStockQty: 5000,
            shortageQty: 3925,
            procurementStatus: 'SHORTAGE'
          },
          {
            id: 'bom-2',
            itemType: 'TRIM',
            itemName: 'Main Woven Brand Label (H&M Basic)',
            specification: 'Damask weave 45mm x 20mm',
            unit: 'PCS',
            consumptionPerPiece: 1.0,
            wastagePercent: 3.0,
            totalRequiredQty: 10300,
            availableStockQty: 15000,
            allocatedStockQty: 10300,
            shortageQty: 0,
            procurementStatus: 'IN_STOCK'
          },
          {
            id: 'bom-3',
            itemType: 'ACCESSORY',
            itemName: '18L 2-Hole Horn Pearl Button',
            specification: 'Laser engraved H&M logo',
            unit: 'PCS',
            consumptionPerPiece: 3.0,
            wastagePercent: 5.0,
            totalRequiredQty: 31500,
            availableStockQty: 20000,
            allocatedStockQty: 20000,
            shortageQty: 11500,
            procurementStatus: 'SHORTAGE'
          },
          {
            id: 'bom-4',
            itemType: 'PACKAGING',
            itemName: 'Individual Polybag (Recycled LDPE)',
            specification: 'Self-adhesive seal with suffocation warning',
            unit: 'PCS',
            consumptionPerPiece: 1.0,
            wastagePercent: 2.0,
            totalRequiredQty: 10200,
            availableStockQty: 12000,
            allocatedStockQty: 10200,
            shortageQty: 0,
            procurementStatus: 'IN_STOCK'
          }
        ],
        costingId: 'cst-polo-01',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'po-2026-002',
        poNumber: 'PO-2026-002',
        buyerId: 'buy-target-03',
        buyerName: 'Target Brands Inc.',
        styleId: 'stl-hoodie-02',
        styleNumber: 'HOD-2026-002',
        styleName: 'Unisex Brushed Heavy Fleece Pullover Hoodie',
        factoryId: factoryDhakaId,
        factoryName: 'Apex Garments — Dhaka Unit (Savar)',
        orderQuantity: 15000,
        unitPriceUsd: 14.50,
        totalOrderValueUsd: 217500.00,
        orderDate: '2026-08-15',
        exFactoryDeliveryDate: '2026-12-20',
        status: 'APPROVED',
        colorSizeBreakdown: [
          { color: 'Heather Grey', size: 'M', quantity: 2500 },
          { color: 'Heather Grey', size: 'L', quantity: 3000 },
          { color: 'Heather Grey', size: 'XL', quantity: 2000 },
          { color: 'Washed Black', size: 'M', quantity: 2500 },
          { color: 'Washed Black', size: 'L', quantity: 3000 },
          { color: 'Washed Black', size: 'XL', quantity: 2000 }
        ],
        bom: [
          {
            id: 'bom-h1',
            itemType: 'FABRIC',
            itemName: '80/20 Cotton/Poly 320 GSM Brushed Fleece',
            specification: 'Heather Grey & Jet Black',
            unit: 'KG',
            consumptionPerPiece: 1.25,
            wastagePercent: 5.0,
            totalRequiredQty: 19688,
            availableStockQty: 12000,
            allocatedStockQty: 12000,
            shortageQty: 7688,
            procurementStatus: 'SHORTAGE'
          }
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    // 7. Pre-seed Certified Bangladesh Raw Material Suppliers
    this.suppliers = [
      {
        id: 'sup-paramount-01',
        name: 'Paramount Textile Mills Ltd.',
        code: 'PARAMOUNT-BD',
        category: 'FABRIC',
        country: 'Bangladesh',
        city: 'Narayanganj',
        leadTimeDays: 14,
        qualityRating: 4.85,
        onTimeDeliveryRate: 96.5,
        paymentTerms: 'LC at 60 days',
        contactPerson: 'Engr. Shakhawat Hossain',
        email: 'sales@paramount-textile.com',
        phone: '+88029881234',
        materialsSupplied: ['100% Cotton Pique Knit', 'Single Jersey 160-220 GSM', 'CVC Fleece'],
        status: 'ACTIVE',
        createdAt: new Date().toISOString()
      },
      {
        id: 'sup-ykk-02',
        name: 'YKK Bangladesh Pte. Ltd.',
        code: 'YKK-BD',
        category: 'TRIMS',
        country: 'Bangladesh',
        city: 'Dhaka EPZ (DEPZ), Savar',
        leadTimeDays: 7,
        qualityRating: 4.95,
        onTimeDeliveryRate: 98.2,
        paymentTerms: 'Payment Against Delivery',
        contactPerson: 'Tanaka Kenji / Rubel Ahmed',
        email: 'apparel-sales@ykk.com.bd',
        phone: '+88027788990',
        materialsSupplied: ['Metal Zippers #5', 'Vislon Zippers', 'Concealed Zippers'],
        status: 'ACTIVE',
        createdAt: new Date().toISOString()
      },
      {
        id: 'sup-coats-03',
        name: 'Coats Bangladesh Ltd.',
        code: 'COATS-BD',
        category: 'TRIMS',
        country: 'Bangladesh',
        city: 'Chittagong CEPZ',
        leadTimeDays: 5,
        qualityRating: 4.90,
        onTimeDeliveryRate: 99.0,
        paymentTerms: 'Monthly Account 30 Days',
        contactPerson: 'Farhana Akhter',
        email: 'orders@coatsbd.com',
        phone: '+88031740011',
        materialsSupplied: ['Epic Poly-Poly Core Thread (Ticket 120)', 'Gramax Textured Thread'],
        status: 'ACTIVE',
        createdAt: new Date().toISOString()
      },
      {
        id: 'sup-buttons-04',
        name: 'Dekko Accessories Ltd.',
        code: 'DEKKO-BD',
        category: 'ACCESSORIES',
        country: 'Bangladesh',
        city: 'Gazipur',
        leadTimeDays: 6,
        qualityRating: 4.70,
        onTimeDeliveryRate: 95.0,
        paymentTerms: 'TT 30 Days',
        contactPerson: 'Kamrul Ahsan',
        email: 'buttons@dekko-group.com',
        phone: '+88029887766',
        materialsSupplied: ['Horn Buttons 18L', 'Polyester Resin Buttons', 'Woven Labels'],
        status: 'ACTIVE',
        createdAt: new Date().toISOString()
      }
    ];

    // 8. Pre-seed Purchase Requisition (Triggered from PO-2026-001 Material Shortage)
    this.purchaseRequisitions = [
      {
        id: 'pr-2026-001',
        prNumber: 'PR-2026-001',
        poNumber: 'PO-2026-001',
        buyerName: 'H&M Hennes & Mauritz GBC AB',
        requestedBy: 'Tariqul Islam (Merchandiser)',
        department: 'Merchandising & Planning',
        items: [
          {
            sku: 'FAB-CTN-PIQUE-185',
            itemName: '100% Cotton Pique 185 GSM (Black & White)',
            unit: 'KG',
            requiredQty: 3925,
            estimatedUnitPriceUsd: 4.50,
            estimatedTotalUsd: 17662.50,
            neededByDate: '2026-09-25'
          },
          {
            sku: 'TRM-BTN-HORN-18L',
            itemName: '18L 2-Hole Horn Pearl Button (H&M Logo)',
            unit: 'PCS',
            requiredQty: 11500,
            estimatedUnitPriceUsd: 0.04,
            estimatedTotalUsd: 460.00,
            neededByDate: '2026-09-30'
          }
        ],
        totalEstimatedValueUsd: 18122.50,
        urgency: 'HIGH',
        status: 'APPROVED',
        approvedBy: 'Mahmudul Hasan (Savar Factory GM)',
        approvalDate: '2026-08-05T11:00:00Z',
        createdAt: '2026-08-04T10:00:00Z'
      }
    ];

    // 9. Pre-seed Supplier Purchase Orders
    this.supplierPurchaseOrders = [
      {
        id: 'spo-2026-001',
        spoNumber: 'SPO-2026-001',
        prNumber: 'PR-2026-001',
        supplierId: 'sup-paramount-01',
        supplierName: 'Paramount Textile Mills Ltd.',
        orderDate: '2026-08-06',
        expectedDeliveryDate: '2026-08-20',
        currency: 'USD',
        items: [
          {
            sku: 'FAB-CTN-PIQUE-185',
            itemName: '100% Cotton Pique 185 GSM (Black & White)',
            unit: 'KG',
            orderedQty: 3925,
            deliveredQty: 3925,
            unitPrice: 4.50,
            totalPrice: 17662.50
          }
        ],
        totalAmount: 17662.50,
        paymentTerms: 'LC at 60 days',
        status: 'DELIVERED',
        createdAt: '2026-08-06T14:00:00Z'
      }
    ];

    // 10. Pre-seed Goods Received Note (GRN) with Gate & Vehicle Entry
    this.grns = [
      {
        id: 'grn-2026-001',
        grnNumber: 'GRN-2026-001',
        spoNumber: 'SPO-2026-001',
        supplierName: 'Paramount Textile Mills Ltd.',
        warehouseId: 'wh-savar-fabric',
        warehouseName: 'Central Bonded Fabric Warehouse',
        receivedDate: '2026-08-19T11:30:00Z',
        vehicleNumber: 'DHAKA-METRO-TA-14-9921',
        challanNumber: 'PTM-CH-9942',
        driverName: 'Abdul Malek',
        qcInspectionStatus: 'PASSED',
        items: [
          {
            sku: 'FAB-CTN-PIQUE-185',
            itemName: '100% Cotton Pique 185 GSM',
            orderedQty: 3925,
            receivedQty: 3925,
            acceptedQty: 3925,
            rejectedQty: 0,
            unit: 'KG',
            lotNumber: 'LOT-PTM-2026-A',
            shadeBand: 'Shade Band A (Within +/- 0.5 Delta-E)',
            binCode: 'R-A1-01'
          }
        ],
        receivedBy: 'Kazi Farhan (Chief Warehouse Officer)',
        createdAt: '2026-08-19T12:00:00Z'
      }
    ];

    // 11. Multi-Warehouse Stock Inventory (Strict Negative Inventory Prevention)
    this.stockInventory = [
      {
        id: 'stk-01',
        sku: 'FAB-CTN-PIQUE-185',
        itemName: '100% Cotton Pique 185 GSM',
        category: 'FABRIC',
        warehouseId: 'wh-savar-fabric',
        warehouseName: 'Central Bonded Fabric Warehouse',
        binCode: 'R-A1-01',
        lotNumber: 'LOT-PTM-2026-A',
        shadeBand: 'Shade Band A',
        unit: 'KG',
        totalQty: 8925,
        availableQty: 8925,
        reservedQty: 0,
        quarantineQty: 0,
        rejectedQty: 0,
        reorderLevel: 2000,
        updatedAt: new Date().toISOString()
      },
      {
        id: 'stk-02',
        sku: 'TRM-LBL-HM-MAIN',
        itemName: 'H&M Basic Main Woven Damask Label',
        category: 'TRIMS',
        warehouseId: 'wh-savar-trims',
        warehouseName: 'Accessories & Trims Store',
        binCode: 'TR-LBL-02',
        lotNumber: 'LOT-DEK-01',
        unit: 'PCS',
        totalQty: 15000,
        availableQty: 15000,
        reservedQty: 0,
        quarantineQty: 0,
        rejectedQty: 0,
        reorderLevel: 5000,
        updatedAt: new Date().toISOString()
      },
      {
        id: 'stk-03',
        sku: 'TRM-BTN-HORN-18L',
        itemName: '18L 2-Hole Horn Pearl Button',
        category: 'ACCESSORIES',
        warehouseId: 'wh-savar-trims',
        warehouseName: 'Accessories & Trims Store',
        binCode: 'TR-BTN-01',
        lotNumber: 'LOT-BTN-88',
        unit: 'PCS',
        totalQty: 31500,
        availableQty: 31500,
        reservedQty: 0,
        quarantineQty: 0,
        rejectedQty: 0,
        reorderLevel: 5000,
        updatedAt: new Date().toISOString()
      },
      {
        id: 'stk-04',
        sku: 'PKG-POLY-LDPE',
        itemName: 'Recycled LDPE Garment Polybags',
        category: 'ACCESSORIES',
        warehouseId: 'wh-savar-trims',
        warehouseName: 'Accessories & Trims Store',
        binCode: 'TR-BTN-01',
        lotNumber: 'LOT-POLY-12',
        unit: 'PCS',
        totalQty: 12000,
        availableQty: 12000,
        reservedQty: 0,
        quarantineQty: 0,
        rejectedQty: 0,
        reorderLevel: 3000,
        updatedAt: new Date().toISOString()
      }
    ];

    // 12. Stock Transactions Log
    this.stockTransactions = [
      {
        id: 'stx-001',
        transactionNumber: 'STX-2026-0001',
        type: 'RECEIVE_GRN',
        sku: 'FAB-CTN-PIQUE-185',
        itemName: '100% Cotton Pique 185 GSM',
        toWarehouse: 'Central Bonded Fabric Warehouse (R-A1-01)',
        quantity: 3925,
        unit: 'KG',
        referenceDoc: 'GRN-2026-001',
        performedBy: 'Kazi Farhan (Chief Warehouse Officer)',
        reason: 'Received against Supplier PO SPO-2026-001 from Paramount Textile',
        timestamp: '2026-08-19T12:05:00Z'
      }
    ];

    // 13. Pre-seed Fabric Relaxation (24h Requirement for Knit/Pique)
    const now = new Date();
    const readyTime24hAgo = new Date(now.getTime() - 26 * 3600 * 1000).toISOString();
    const readyTarget24hAgo = new Date(now.getTime() - 2 * 3600 * 1000).toISOString();
    const relaxingStartTime = new Date(now.getTime() - 6 * 3600 * 1000).toISOString();
    const relaxingTargetReady = new Date(now.getTime() + 18 * 3600 * 1000).toISOString();

    this.relaxations = [
      {
        id: 'rlx-001',
        rollNumber: 'ROL-PTM-091',
        fabricLot: 'LOT-PTM-2026-A',
        fabricType: '100% Cotton Pique 185 GSM',
        color: 'White',
        weightGsm: 185,
        rollLengthMeters: 120,
        warehouseBin: 'R-A1-01',
        startTime: readyTime24hAgo,
        durationHours: 24,
        targetReadyTime: readyTarget24hAgo,
        status: 'READY_FOR_CUT',
        inspectedBy: 'Jamal Uddin (Cutting QC Master)',
        notes: '24h relaxation finished; zero residual shrinkage tension observed.'
      },
      {
        id: 'rlx-002',
        rollNumber: 'ROL-PTM-092',
        fabricLot: 'LOT-PTM-2026-A',
        fabricType: '100% Cotton Pique 185 GSM',
        color: 'Black',
        weightGsm: 185,
        rollLengthMeters: 140,
        warehouseBin: 'R-A1-01',
        startTime: relaxingStartTime,
        durationHours: 24,
        targetReadyTime: relaxingTargetReady,
        status: 'RELAXING',
        inspectedBy: 'Jamal Uddin (Cutting QC Master)',
        notes: 'Undergoing 24-hour tension release spreading on relaxation racks.'
      }
    ];

    // 14. Pre-seed Cut Orders & QR Bundle Tickets
    const cutOrder1Id = 'cut-2026-001';
    const sampleBundles: CutBundle[] = [
      { id: 'bnd-01', bundleNumber: 'BND-CUT01-WHT-S-01', cutNumber: 'CUT-2026-001', poNumber: 'PO-2026-001', styleNumber: 'TSH-2026-001', color: 'White', size: 'S', quantity: 250, serialStart: 1, serialEnd: 250, barcode: 'BC-CUT01-S01', assignedLineId: 'line-sew-01', assignedLineName: 'Sewing Line 01 (Polo Shirt)', status: 'ISSUED_TO_SEWING' },
      { id: 'bnd-02', bundleNumber: 'BND-CUT01-WHT-S-02', cutNumber: 'CUT-2026-001', poNumber: 'PO-2026-001', styleNumber: 'TSH-2026-001', color: 'White', size: 'S', quantity: 250, serialStart: 251, serialEnd: 500, barcode: 'BC-CUT01-S02', assignedLineId: 'line-sew-01', assignedLineName: 'Sewing Line 01 (Polo Shirt)', status: 'ISSUED_TO_SEWING' },
      { id: 'bnd-03', bundleNumber: 'BND-CUT01-WHT-M-01', cutNumber: 'CUT-2026-001', poNumber: 'PO-2026-001', styleNumber: 'TSH-2026-001', color: 'White', size: 'M', quantity: 250, serialStart: 501, serialEnd: 750, barcode: 'BC-CUT01-M01', assignedLineId: 'line-sew-01', assignedLineName: 'Sewing Line 01 (Polo Shirt)', status: 'ISSUED_TO_SEWING' },
      { id: 'bnd-04', bundleNumber: 'BND-CUT01-WHT-M-02', cutNumber: 'CUT-2026-001', poNumber: 'PO-2026-001', styleNumber: 'TSH-2026-001', color: 'White', size: 'M', quantity: 250, serialStart: 751, serialEnd: 1000, barcode: 'BC-CUT01-M02', assignedLineId: 'line-sew-01', assignedLineName: 'Sewing Line 01 (Polo Shirt)', status: 'ISSUED_TO_SEWING' },
      { id: 'bnd-05', bundleNumber: 'BND-CUT01-WHT-L-01', cutNumber: 'CUT-2026-001', poNumber: 'PO-2026-001', styleNumber: 'TSH-2026-001', color: 'White', size: 'L', quantity: 250, serialStart: 1001, serialEnd: 1250, barcode: 'BC-CUT01-L01', assignedLineId: 'line-sew-01', assignedLineName: 'Sewing Line 01 (Polo Shirt)', status: 'ISSUED_TO_SEWING' }
    ];
    this.bundles = [...sampleBundles];

    this.cutOrders = [
      {
        id: cutOrder1Id,
        cutNumber: 'CUT-2026-001',
        poId: 'po-2026-001',
        poNumber: 'PO-2026-001',
        buyerName: 'H&M Hennes & Mauritz GBC AB',
        styleId: 'stl-polo-01',
        styleNumber: 'TSH-2026-001',
        styleName: 'Men’s Regular Pique Polo Shirt',
        markerLengthMeters: 7.8,
        pliesCount: 80,
        markerEfficiencyPercent: 89.2,
        totalPlannedPcs: 2500,
        totalCutPcs: 2500,
        cuttingTableId: 'line-cut-1',
        cuttingTableName: 'Cut Table 01 (Gerber Spreader)',
        status: 'COMPLETED',
        colorSizeBreakdown: [
          { color: 'White', size: 'S', plannedPcs: 500, actualCutPcs: 500 },
          { color: 'White', size: 'M', plannedPcs: 1000, actualCutPcs: 1000 },
          { color: 'White', size: 'L', plannedPcs: 1000, actualCutPcs: 1000 }
        ],
        bundles: sampleBundles,
        cuttingSupervisor: 'Rafiqul Islam (CAD & Cutting Master)',
        createdAt: '2026-08-20T08:00:00Z',
        updatedAt: '2026-08-20T17:30:00Z'
      }
    ];

    // 15. Pre-seed Sewing Hourly Tracking
    const todayStr = new Date().toISOString().split('T')[0];
    this.sewingHourlyLogs = [
      { id: 'shl-01', lineId: 'line-sew-01', lineNumber: 'Sewing Line 01 (Polo Shirt)', date: todayStr, hourSlot: '09:00 - 10:00', styleNumber: 'TSH-2026-001', poNumber: 'PO-2026-001', targetQty: 120, actualQty: 116, rejectedQty: 2, efficiencyPercent: 96.6, operatorCount: 38, helperCount: 10, smv: 14.5, recordedBy: 'Sultan Mahmud (Line Supervisor)', timestamp: `${todayStr}T10:02:00Z` },
      { id: 'shl-02', lineId: 'line-sew-01', lineNumber: 'Sewing Line 01 (Polo Shirt)', date: todayStr, hourSlot: '10:00 - 11:00', styleNumber: 'TSH-2026-001', poNumber: 'PO-2026-001', targetQty: 120, actualQty: 122, rejectedQty: 1, efficiencyPercent: 101.6, operatorCount: 38, helperCount: 10, smv: 14.5, recordedBy: 'Sultan Mahmud (Line Supervisor)', timestamp: `${todayStr}T11:01:00Z` },
      { id: 'shl-03', lineId: 'line-sew-01', lineNumber: 'Sewing Line 01 (Polo Shirt)', date: todayStr, hourSlot: '11:00 - 12:00', styleNumber: 'TSH-2026-001', poNumber: 'PO-2026-001', targetQty: 120, actualQty: 119, rejectedQty: 3, efficiencyPercent: 99.1, operatorCount: 38, helperCount: 10, smv: 14.5, recordedBy: 'Sultan Mahmud (Line Supervisor)', timestamp: `${todayStr}T12:03:00Z` },
      { id: 'shl-04', lineId: 'line-sew-01', lineNumber: 'Sewing Line 01 (Polo Shirt)', date: todayStr, hourSlot: '12:00 - 13:00', styleNumber: 'TSH-2026-001', poNumber: 'PO-2026-001', targetQty: 120, actualQty: 125, rejectedQty: 0, efficiencyPercent: 104.1, operatorCount: 38, helperCount: 10, smv: 14.5, recordedBy: 'Sultan Mahmud (Line Supervisor)', timestamp: `${todayStr}T13:01:00Z` }
    ];

    // 16. Pre-seed Finishing & Packaging Batches
    this.finishingBatches = [
      {
        id: 'fin-001',
        batchNumber: 'FIN-2026-001',
        poNumber: 'PO-2026-001',
        styleNumber: 'TSH-2026-001',
        totalReceivedPcs: 2500,
        threadTrimmedPcs: 2500,
        steamIronedPcs: 2450,
        metalDetectedPcs: 2400,
        polybaggedPcs: 2400,
        rejectedPcs: 14,
        status: 'IN_PROGRESS',
        updatedAt: new Date().toISOString()
      }
    ];

    // 17. Pre-seed Carton Packing Records with Ratio Assortment
    this.cartons = [
      {
        id: 'ctn-01',
        cartonNumber: 'CTN-2026-0001',
        poNumber: 'PO-2026-001',
        buyerPo: 'HM-PO-99201',
        styleNumber: 'TSH-2026-001',
        color: 'White',
        sizeRatio: { S: 10, M: 20, L: 20, XL: 10 },
        totalPcsPerCarton: 60,
        grossWeightKg: 13.8,
        netWeightKg: 12.6,
        cartonDimensionsCm: '60 x 40 x 30',
        barcode: 'CTN-HM-2026-0001',
        cbm: 0.072,
        packedBy: 'Anwar Hossain (Packing In-Charge)',
        status: 'READY_FOR_SHIPMENT',
        packedAt: new Date().toISOString()
      },
      {
        id: 'ctn-02',
        cartonNumber: 'CTN-2026-0002',
        poNumber: 'PO-2026-001',
        buyerPo: 'HM-PO-99201',
        styleNumber: 'TSH-2026-001',
        color: 'White',
        sizeRatio: { S: 10, M: 20, L: 20, XL: 10 },
        totalPcsPerCarton: 60,
        grossWeightKg: 13.9,
        netWeightKg: 12.6,
        cartonDimensionsCm: '60 x 40 x 30',
        barcode: 'CTN-HM-2026-0002',
        cbm: 0.072,
        packedBy: 'Anwar Hossain (Packing In-Charge)',
        status: 'READY_FOR_SHIPMENT',
        packedAt: new Date().toISOString()
      }
    ];

    // 10. Pre-seed Phase 5: Fabric 4-Point Inspections
    this.fabricInspections = [
      {
        id: 'f4p-001',
        rollNumber: 'ROL-PTM-8891',
        fabricLot: 'LOT-PTM-2026-A',
        fabricType: '100% Combed Cotton Pique 185 GSM',
        inspectedLengthYards: 130,
        fabricWidthInches: 68,
        defectsSize1Count: 2, // 2 pts
        defectsSize2Count: 1, // 2 pts
        defectsSize3Count: 0,
        defectsSize4Count: 0,
        totalDefectPoints: 4,
        pointsPer100SqYards: 1.63, // (4 * 3600) / (130 * 68) = 1.63 pts (Well under 20.0 pt pass threshold)
        penaltyGrade: 'FIRST_QUALITY_PASS',
        inspectorName: 'Nazmul Haque (QC Fabric Inspector)',
        inspectedAt: '2026-06-21T09:15:00Z',
        comments: 'Uniform knit tension, excellent color fastness, within shade band A.'
      },
      {
        id: 'f4p-002',
        rollNumber: 'ROL-HMD-1042',
        fabricLot: 'LOT-HMD-2026-B',
        fabricType: 'Heavyweight Cotton Fleece 320 GSM',
        inspectedLengthYards: 100,
        fabricWidthInches: 60,
        defectsSize1Count: 4, // 4 pts
        defectsSize2Count: 3, // 6 pts
        defectsSize3Count: 2, // 6 pts
        defectsSize4Count: 1, // 4 pts
        totalDefectPoints: 20,
        pointsPer100SqYards: 12.0, // (20 * 3600) / (100 * 60) = 12.0 pts (First quality pass)
        penaltyGrade: 'FIRST_QUALITY_PASS',
        inspectorName: 'Nazmul Haque (QC Fabric Inspector)',
        inspectedAt: '2026-06-22T11:30:00Z',
        comments: 'Minor slubs near selvedge, approved for lay spreading.'
      },
      {
        id: 'f4p-003',
        rollNumber: 'ROL-REJ-9901',
        fabricLot: 'LOT-TC-FAIL-09',
        fabricType: 'Polyester Cotton Single Jersey 160 GSM',
        inspectedLengthYards: 90,
        fabricWidthInches: 58,
        defectsSize1Count: 6,  // 6 pts
        defectsSize2Count: 5,  // 10 pts
        defectsSize3Count: 5,  // 15 pts
        defectsSize4Count: 4,  // 16 pts
        totalDefectPoints: 47,
        pointsPer100SqYards: 32.41, // (47 * 3600) / (90 * 58) = 32.41 pts (> 28.0 = REJECT)
        penaltyGrade: 'REJECTED',
        inspectorName: 'Nazmul Haque (QC Fabric Inspector)',
        inspectedAt: '2026-06-23T14:10:00Z',
        comments: 'Severe yarn contamination, continuous horizontal barre marks and pinholes. Quarantine gate hold issued.'
      }
    ];

    // 11. Pre-seed Phase 5: Inline & End-line Sewing Defects
    this.sewingDefects = [
      {
        id: 'def-001',
        inspectionType: 'INLINE',
        lineId: 'line-sew-01',
        lineNumber: 'Sewing Line 01 (Polo Shirt Specialist)',
        styleNumber: 'TSH-2026-001',
        poNumber: 'PO-2026-001',
        defectCode: 'DEF-ST-01',
        defectName: 'Skipped Stitch on Collar Placket',
        severity: 'MAJOR',
        zone: 'COLLAR',
        operatorStation: 'Station 08 (Placket Attacher)',
        inspectorName: 'Sultana Razia (QC Inspector)',
        inspectedGarments: 250,
        defectQty: 4,
        dhuPercent: 1.6,
        timestamp: new Date().toISOString(),
        status: 'REWORK_ISSUED'
      },
      {
        id: 'def-002',
        inspectionType: 'INLINE',
        lineId: 'line-sew-02',
        lineNumber: 'Sewing Line 02 (Graphic Tees High-Speed)',
        styleNumber: 'TSH-2026-001',
        poNumber: 'PO-2026-001',
        defectCode: 'DEF-HM-03',
        defectName: 'Uneven Bottom Hem Twin Needle Stitch',
        severity: 'MINOR',
        zone: 'HEM',
        operatorStation: 'Station 22 (Bottom Hemming)',
        inspectorName: 'Kamal Hossain (QC Inspector)',
        inspectedGarments: 300,
        defectQty: 3,
        dhuPercent: 1.0,
        timestamp: new Date().toISOString(),
        status: 'RESOLVED'
      },
      {
        id: 'def-003',
        inspectionType: 'INLINE',
        lineId: 'line-sew-03',
        lineNumber: 'Sewing Line 03 (Hoodies & Fleece Complex)',
        styleNumber: 'HOD-2026-002',
        poNumber: 'PO-2026-002',
        defectCode: 'DEF-ND-99',
        defectName: 'Broken Needle Fragment inside Armhole Join',
        severity: 'CRITICAL',
        zone: 'ARMHOLE',
        operatorStation: 'Station 14 (Armhole Overlock)',
        inspectorName: 'Sultana Razia (QC Inspector)',
        inspectedGarments: 180,
        defectQty: 1,
        dhuPercent: 0.56,
        timestamp: new Date().toISOString(),
        status: 'REWORK_ISSUED'
      },
      {
        id: 'def-004',
        inspectionType: 'ENDLINE',
        lineId: 'line-sew-04',
        lineNumber: 'Sewing Line 04 (Activewear & Shorts)',
        styleNumber: 'TSH-2026-001',
        poNumber: 'PO-2026-001',
        defectCode: 'DEF-PK-02',
        defectName: 'Seam Puckering along Left Side Join',
        severity: 'MINOR',
        zone: 'SIDE_SEAM',
        operatorStation: 'Station 11 (Side Seaming)',
        inspectorName: 'Kamal Hossain (QC Inspector)',
        inspectedGarments: 200,
        defectQty: 2,
        dhuPercent: 1.0,
        timestamp: new Date().toISOString(),
        status: 'RESOLVED'
      }
    ];

    // 12. Pre-seed Phase 5: Rework Orders
    this.reworkOrders = [
      {
        id: 'rwk-001',
        reworkNumber: 'RWK-2026-001',
        defectId: 'def-001',
        defectName: 'Skipped Stitch on Collar Placket',
        severity: 'MAJOR',
        poNumber: 'PO-2026-001',
        styleNumber: 'TSH-2026-001',
        lineId: 'line-sew-01',
        lineNumber: 'Sewing Line 01 (Polo Shirt Specialist)',
        quarantineQty: 15,
        repairedQty: 12,
        scrappedQty: 0,
        assignedRepairOperator: 'Rehana Begum (Senior Repair Specialist)',
        status: 'IN_REPAIR',
        notes: 'Unpick placket topstitch, replace bobbin thread, re-stitch with 14 SPI.',
        createdAt: new Date().toISOString()
      },
      {
        id: 'rwk-002',
        reworkNumber: 'RWK-2026-002',
        defectId: 'def-003',
        defectName: 'Broken Needle Fragment inside Armhole Join',
        severity: 'CRITICAL',
        poNumber: 'PO-2026-002',
        styleNumber: 'HOD-2026-002',
        lineId: 'line-sew-03',
        lineNumber: 'Sewing Line 03 (Hoodies & Fleece Complex)',
        quarantineQty: 1,
        repairedQty: 1,
        scrappedQty: 0,
        assignedRepairOperator: 'Farid Ahmed (Master Rework Tailor)',
        status: 'RE_INSPECTED_PASS',
        notes: 'Needle fragment extracted and matched with broken needle tip. Passed metal detector 1.0mm ferrous audit.',
        createdAt: '2026-06-24T10:00:00Z',
        completedAt: '2026-06-24T11:15:00Z'
      }
    ];

    // 13. Pre-seed Phase 5: CAPA 5-Whys Investigations
    this.capaRecords = [
      {
        id: 'capa-001',
        capaNumber: 'CAPA-2026-001',
        title: 'Recurring Needle Breakage on Line 03 Heavyweight Fleece Join',
        issueDescription: 'During production run of HOD-2026-002, Line 03 suffered 5 needle breakages within 2 hours at the Armhole overlock station.',
        lineId: 'line-sew-03',
        lineNumber: 'Sewing Line 03 (Hoodies & Fleece Complex)',
        defectType: 'Needle Breakage & Metal Contamination Risk',
        why1: 'Needle tip snapped while penetrating dense 320 GSM fleece crossed seam.',
        why2: 'Standard light-weight needle (Size 11/75) was being used on heavyweight fleece.',
        why3: 'Floor mechanic did not reference the Tech Pack needle gauge specification during line changeover.',
        why4: 'Line Changeover Checklist lacked a mandatory dual-signature step for needle gauge verification.',
        why5RootCause: 'Inadequate Line Setup SOP and lack of mechanical needle verification gate prior to bulk production feeding.',
        category: 'METHOD_TRAINING',
        correctiveAction: 'Immediately stopped line, replaced all 22 overlock needles with Organ DBx1 #16 Ballpoint heavy-duty needles, and ran 100% metal detection on all cut bundles from batch.',
        preventiveAction: 'Updated Factory SOP #QA-SOP-014 to require QA Inspector & Chief Mechanic co-signing needle gauge audit sheet before releasing power to line.',
        assignedTo: 'Engr. Naimur Rahman (QA Head)',
        targetClosureDate: '2026-07-15',
        status: 'APPROVED_ACTIVE',
        qaManagerApproval: {
          approvedBy: 'Farhana Akhter (QA Manager)',
          approvedAt: '2026-06-25T14:30:00Z',
          signature: 'FA-QA-DIR-APPROVED'
        },
        createdAt: '2026-06-25T12:00:00Z'
      }
    ];

    // 14. Pre-seed Phase 5: ISO 2859-1 / AQL 2.5 Sampling Inspections
    this.aqlInspections = [
      {
        id: 'aql-001',
        certificateNumber: 'AQL-CERT-2026-0001',
        poNumber: 'PO-2026-001',
        buyerPo: 'HM-PO-99201',
        buyerName: 'H&M Hennes & Mauritz GBC AB',
        styleNumber: 'TSH-2026-001',
        totalLotSize: 5000,
        generalInspectionLevel: 'LEVEL_II',
        sampleSizeCodeLetter: 'K',
        sampleSize: 315,
        criticalAql: 0.0,
        criticalAc: 0,
        criticalRe: 1,
        criticalDefectsFound: 0,
        majorAql: 2.5,
        majorAc: 14,
        majorRe: 15,
        majorDefectsFound: 3, // Well below 14 max allowable
        minorAql: 4.0,
        minorAc: 21,
        minorRe: 22,
        minorDefectsFound: 6, // Well below 21 max allowable
        overallResult: 'ACCEPTED_PASS',
        qaManagerSignoff: 'Farhana Akhter (Certified Lead Auditor)',
        inspectionDate: new Date().toISOString()
      }
    ];

    // 15. Pre-seed Phase 6: Commercial Invoice, Packing List, Gate Pass & Export Shipment
    const seedInvoice: CommercialInvoice = {
      id: 'inv-001',
      invoiceNumber: 'EXP-INV-2026-0042',
      poId: 'po-001',
      poNumber: 'PO-2026-001',
      buyerId: 'byr-001',
      buyerName: 'H&M Hennes & Mauritz GBC AB',
      styleNumber: 'TSH-2026-001',
      lcNumber: 'LC-SE-2026-881920',
      issuingBank: 'Skandinaviska Enskilda Banken AB (SEB) / HSBC Dhaka',
      incoterms: 'FOB',
      portOfLoading: 'Chittagong Sea Port, Bangladesh (BDCGP)',
      portOfDischarge: 'Port of Gothenburg, Sweden (SEGOT)',
      currency: 'USD',
      invoicedQuantity: 5000,
      unitPrice: 8.50,
      totalAmount: 42500.00,
      paymentTerms: '100% Irrevocable At-Sight LC',
      commercialOfficerSignoff: 'Kamrul Hasan (Senior Commercial Manager)',
      createdAt: '2026-06-25T15:00:00Z'
    };
    this.commercialInvoices.push(seedInvoice);

    const seedPackingList: PackingList = {
      id: 'pl-001',
      packingListNumber: 'EXP-PL-2026-0042',
      poId: 'po-001',
      poNumber: 'PO-2026-001',
      invoiceNumber: 'EXP-INV-2026-0042',
      totalCartons: 84,
      totalGrossWeightKg: 1428.00,
      totalNetWeightKg: 1260.00,
      totalCbm: 15.12,
      containerType: '40FT_HQ',
      containerNumber: 'MSCU-991204-7',
      sealNumber: 'BD-SEAL-88912',
      cartonBreakdown: [
        {
          cartonRange: 'CTN 001 - 042',
          sizeRatio: 'S:10, M:20, L:20, XL:10 (60 pcs/ctn)',
          pcsPerCarton: 60,
          totalCartons: 42,
          totalPcs: 2520,
          grossWeightKg: 714.00,
          netWeightKg: 630.00,
          dimensionsCm: '60 x 40 x 30',
          cbm: 7.56
        },
        {
          cartonRange: 'CTN 043 - 084',
          sizeRatio: 'S:10, M:20, L:20, XL:10 (60 pcs/ctn)',
          pcsPerCarton: 60,
          totalCartons: 42,
          totalPcs: 2480,
          grossWeightKg: 714.00,
          netWeightKg: 630.00,
          dimensionsCm: '60 x 40 x 30',
          cbm: 7.56
        }
      ],
      createdAt: '2026-06-25T15:30:00Z'
    };
    this.packingLists.push(seedPackingList);

    const seedGatePass: SecurityGatePass = {
      id: 'gp-001',
      gatePassNumber: 'GP-SAVAR-2026-018',
      shipmentId: 'shp-001',
      poNumber: 'PO-2026-001',
      invoiceNumber: 'EXP-INV-2026-0042',
      vehicleNumber: 'DHAKA METRO-TA 11-8942 (Prime Mover)',
      driverName: 'Md. Rafiqul Islam',
      driverPhone: '+8801712-345678',
      containerSealNumber: 'BD-SEAL-88912',
      destination: 'Chittagong Off-Dock CFS (Summit Alliance Port Depot)',
      dispatchTime: '2026-06-25T17:00:00Z',
      securityOfficer: 'Sub-Inspector Anowar Hossain (Plant Security)',
      status: 'DISPATCHED_GATE_OUT',
      exitTimestamp: '2026-06-25T17:15:00Z',
      createdAt: '2026-06-25T16:00:00Z'
    };
    this.gatePasses.push(seedGatePass);

    this.shipments.push({
      id: 'shp-001',
      shipmentTrackingNumber: 'SHP-2026-0001',
      poId: 'po-001',
      poNumber: 'PO-2026-001',
      buyerId: 'byr-001',
      buyerName: 'H&M Hennes & Mauritz GBC AB',
      styleNumber: 'TSH-2026-001',
      orderQuantity: 5000,
      shippedQuantity: 5000,
      aqlCertificateNumber: 'AQL-CERT-2026-0001',
      aqlOverallResult: 'ACCEPTED_PASS',
      commercialInvoice: seedInvoice,
      packingList: seedPackingList,
      gatePass: seedGatePass,
      status: 'GATE_OUT',
      vesselOrFlight: 'MSC ARIES (Voyage 2608W)',
      etd: '2026-07-02',
      eta: '2026-07-28',
      createdAt: '2026-06-25T15:00:00Z',
      updatedAt: '2026-06-25T17:15:00Z'
    });

    // 16. Pre-seed Phase 7: Factory Operations (HR, Machinery, Finance, Compliance)
    this.employees = [
      {
        id: 'emp-001',
        employeeCode: 'EMP-SAVAR-0101',
        fullName: 'Md. Rubel Hossain',
        phone: '+8801711-445566',
        departmentId: 'dept-sew-01',
        departmentName: 'Sewing Department',
        designation: 'Senior Sewing Machine Operator',
        factoryId: factoryDhakaId,
        shift: 'MORNING_GENERAL',
        joinDate: '2023-03-15',
        baseSalaryBdt: 14500,
        status: 'ACTIVE'
      },
      {
        id: 'emp-002',
        employeeCode: 'EMP-SAVAR-0102',
        fullName: 'Nasima Begum',
        phone: '+8801722-556677',
        departmentId: 'dept-sew-01',
        departmentName: 'Sewing Department',
        designation: 'Overlock Special Operator',
        factoryId: factoryDhakaId,
        shift: 'MORNING_GENERAL',
        joinDate: '2023-06-01',
        baseSalaryBdt: 13800,
        status: 'ACTIVE'
      },
      {
        id: 'emp-003',
        employeeCode: 'EMP-SAVAR-0103',
        fullName: 'Shahadat Ali',
        phone: '+8801733-667788',
        departmentId: 'dept-sew-01',
        departmentName: 'Maintenance & Engineering',
        designation: 'Senior Plant Mechanic',
        factoryId: factoryDhakaId,
        shift: 'MORNING_GENERAL',
        joinDate: '2022-01-10',
        baseSalaryBdt: 18500,
        status: 'ACTIVE'
      }
    ];

    this.attendanceRecords = [
      {
        id: 'att-001',
        employeeId: 'emp-001',
        employeeCode: 'EMP-SAVAR-0101',
        employeeName: 'Md. Rubel Hossain',
        date: '2026-06-25',
        checkIn: '07:55',
        checkOut: '18:00',
        status: 'PRESENT',
        overtimeHours: 2.0,
        biometricTerminalId: 'BIO-SAVAR-GATE-01'
      },
      {
        id: 'att-002',
        employeeId: 'emp-002',
        employeeCode: 'EMP-SAVAR-0102',
        employeeName: 'Nasima Begum',
        date: '2026-06-25',
        checkIn: '08:14',
        checkOut: '18:00',
        status: 'LATE',
        overtimeHours: 1.5,
        biometricTerminalId: 'BIO-SAVAR-GATE-01'
      }
    ];

    this.payrollRecords = [
      {
        id: 'pay-001',
        monthYear: 'June 2026',
        employeeId: 'emp-001',
        employeeCode: 'EMP-SAVAR-0101',
        employeeName: 'Md. Rubel Hossain',
        designation: 'Senior Sewing Machine Operator',
        baseSalaryBdt: 14500,
        overtimeHours: 42,
        overtimeHourlyRateBdt: 139.42,
        overtimePayBdt: 5855.64,
        attendanceBonusBdt: 1000,
        deductionsBdt: 0,
        netPayableBdt: 21355.64,
        paymentStatus: 'PAID',
        disbursedAt: '2026-07-05T10:00:00Z'
      }
    ];

    this.machines = [
      {
        id: 'mac-001',
        machineCode: 'JUKI-SAVAR-01',
        brand: 'Juki',
        model: 'DDL-9000C Direct Drive Lockstitch',
        type: 'LOCKSTITCH',
        factoryId: factoryDhakaId,
        lineId: 'line-sew-01',
        status: 'OPERATIONAL',
        lastMaintenanceDate: '2026-06-15',
        nextMaintenanceDueDate: '2026-07-15',
        totalDowntimeHours: 1.5
      },
      {
        id: 'mac-002',
        machineCode: 'BROTHER-SAVAR-02',
        brand: 'Brother',
        model: 'S-7200C Electronic Direct Drive',
        type: 'LOCKSTITCH',
        factoryId: factoryDhakaId,
        lineId: 'line-sew-02',
        status: 'OPERATIONAL',
        lastMaintenanceDate: '2026-06-10',
        nextMaintenanceDueDate: '2026-07-10',
        totalDowntimeHours: 0.5
      },
      {
        id: 'mac-003',
        machineCode: 'PEGASUS-SAVAR-03',
        brand: 'Pegasus',
        model: 'M900 High-Speed Overlock 5-Thread',
        type: 'OVERLOCK',
        factoryId: factoryDhakaId,
        lineId: 'line-sew-03',
        status: 'BREAKDOWN_STOPPED',
        lastMaintenanceDate: '2026-05-20',
        nextMaintenanceDueDate: '2026-06-20',
        totalDowntimeHours: 4.2
      }
    ];

    this.maintenanceTickets = [
      {
        id: 'mnt-001',
        ticketNumber: 'MNT-2026-001',
        machineId: 'mac-003',
        machineCode: 'PEGASUS-SAVAR-03',
        lineId: 'line-sew-03',
        issueType: 'NEEDLE_BAR_JAM',
        severity: 'CRITICAL_STOPPAGE',
        reportedBy: 'Production Supervisor (Line 03)',
        assignedMechanic: 'Shahadat Ali',
        downtimeMinutes: 45,
        sparePartsReplaced: 'Needle Bar Bushing & Connecting Rod',
        sparePartsCostBdt: 1250,
        status: 'IN_PROGRESS',
        reportedAt: '2026-06-25T11:00:00Z'
      },
      {
        id: 'mnt-002',
        ticketNumber: 'MNT-2026-002',
        machineId: 'mac-001',
        machineCode: 'JUKI-SAVAR-01',
        lineId: 'line-sew-01',
        issueType: 'THREAD_TENSION_FAILURE',
        severity: 'MINOR',
        reportedBy: 'Md. Rubel Hossain',
        assignedMechanic: 'Shahadat Ali',
        downtimeMinutes: 20,
        sparePartsReplaced: 'Thread Tension Spring',
        sparePartsCostBdt: 350,
        status: 'CLOSED',
        reportedAt: '2026-06-24T14:00:00Z',
        resolvedAt: '2026-06-24T14:25:00Z'
      }
    ];

    this.costCenters = [
      {
        id: 'cc-001',
        code: 'CC-DHAKA-SEW-01',
        name: 'Sewing Operations Department (Savar)',
        factoryId: factoryDhakaId,
        department: 'Sewing',
        budgetBdt: 2500000,
        actualSpentBdt: 1845000
      },
      {
        id: 'cc-002',
        code: 'CC-DHAKA-CUT-02',
        name: 'Cutting & Relaxation Section (Savar)',
        factoryId: factoryDhakaId,
        department: 'Cutting',
        budgetBdt: 950000,
        actualSpentBdt: 620000
      }
    ];

    this.financialTransactions = [
      {
        id: 'txn-001',
        txnNumber: 'TXN-2026-001',
        type: 'EXPENSE',
        category: 'Plant Electricity & Industrial Power (DESCO Savar)',
        amount: 342000,
        currency: 'BDT',
        description: 'Monthly manufacturing facility electricity billing for production floors',
        status: 'SETTLED',
        date: '2026-06-20'
      },
      {
        id: 'txn-002',
        txnNumber: 'TXN-2026-002',
        type: 'BUYER_RECEIVABLE',
        category: 'Export PO Invoicing Milestone',
        amount: 42500,
        currency: 'USD',
        referencePoNumber: 'PO-2026-001',
        description: 'Commercial Invoice #EXP-INV-2026-0042 proceeds under Irrevocable At-Sight LC',
        status: 'APPROVED',
        date: '2026-06-25'
      }
    ];

    this.complianceAudits = [
      {
        id: 'aud-001',
        auditNumber: 'AUD-BSCI-2026-001',
        standard: 'BSCI',
        factoryId: factoryDhakaId,
        auditorName: 'TUV Rheinland Bangladesh Audit Bureau',
        auditDate: '2026-05-18',
        overallRating: 'GREEN_COMPLIANT',
        scorePercentage: 94.5,
        findings: [],
        status: 'CERTIFIED_CLOSED'
      },
      {
        id: 'aud-002',
        auditNumber: 'AUD-RSC-2026-002',
        standard: 'RSC_ACCORD',
        factoryId: factoryDhakaId,
        auditorName: 'RMG Sustainability Council (RSC Safety Team)',
        auditDate: '2026-06-12',
        overallRating: 'YELLOW_MINOR_CAPA',
        scorePercentage: 88.0,
        findings: [
          {
            id: 'fnd-01',
            auditId: 'aud-002',
            clauseRef: 'RSC-ELEC-4.1',
            description: 'Emergency exit battery backup illumination module requires replacement in Building 01 Floor 03',
            severity: 'MINOR',
            correctiveAction: 'Fitted 3-hour lithium backup emergency luminaire',
            deadline: '2026-07-20',
            status: 'RECTIFIED_VERIFIED'
          }
        ],
        status: 'CAPA_REQUIRED'
      }
    ];

    // Log system genesis
    this.addAuditLog({
      id: 'audit-001',
      userId: 'usr-admin-01',
      userEmail: 'admin@garmenterp.com',
      userName: 'Engr. Naimur Rahman',
      action: 'CREATE',
      entityName: 'SystemGenesis',
      entityId: 'SYSTEM-ROOT',
      newValues: { message: 'GarmentERP BD initialized with Phase 1 & 2 foundations and Phase 3 Supply Chain models.' },
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

  // ==========================================
  // Phase 2: Merchandising & Commercial Methods
  // ==========================================

  // Buyers
  public getAllBuyers(): Buyer[] {
    return this.buyers;
  }

  public getBuyerById(id: string): Buyer | undefined {
    return this.buyers.find(b => b.id === id);
  }

  public createBuyer(buyer: Omit<Buyer, 'id' | 'createdAt'>): Buyer {
    const newBuyer: Buyer = {
      ...buyer,
      id: `buy-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    this.buyers.push(newBuyer);
    return newBuyer;
  }

  // Styles & Tech Packs
  public getAllStyles(): GarmentStyle[] {
    return this.styles;
  }

  public getStyleById(id: string): GarmentStyle | undefined {
    return this.styles.find(s => s.id === id);
  }

  public createStyle(styleData: Omit<GarmentStyle, 'id' | 'createdAt'>): GarmentStyle {
    const newStyle: GarmentStyle = {
      ...styleData,
      id: `stl-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    this.styles.push(newStyle);
    return newStyle;
  }

  public addTechPackVersion(styleId: string, versionData: TechPackVersion): GarmentStyle | null {
    const style = this.getStyleById(styleId);
    if (!style) return null;
    style.techPackVersions.push(versionData);
    style.activeTechPackVersion = versionData.version;
    return style;
  }

  // Costing Sheets
  public getAllCostingSheets(): CostingSheet[] {
    return this.costingSheets;
  }

  public getCostingByStyleId(styleId: string): CostingSheet | undefined {
    return this.costingSheets.find(c => c.styleId === styleId);
  }

  public createCostingSheet(costingData: Omit<CostingSheet, 'id' | 'updatedAt'>): CostingSheet {
    const newCosting: CostingSheet = {
      ...costingData,
      id: `cst-${Date.now()}`,
      updatedAt: new Date().toISOString()
    };
    this.costingSheets.push(newCosting);
    return newCosting;
  }

  public approveCostingSheet(costingId: string, approvedBy: string): CostingSheet | null {
    const sheet = this.costingSheets.find(c => c.id === costingId);
    if (!sheet) return null;
    sheet.status = 'APPROVED';
    sheet.approvedBy = approvedBy;
    sheet.updatedAt = new Date().toISOString();
    return sheet;
  }

  // Buyer Purchase Orders
  public getAllPurchaseOrders(): BuyerPurchaseOrder[] {
    return this.purchaseOrders;
  }

  public getPurchaseOrderById(id: string): BuyerPurchaseOrder | undefined {
    return this.purchaseOrders.find(po => po.id === id);
  }

  public createPurchaseOrder(poData: Omit<BuyerPurchaseOrder, 'id' | 'createdAt' | 'updatedAt'>): BuyerPurchaseOrder {
    const newPO: BuyerPurchaseOrder = {
      ...poData,
      id: `po-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.purchaseOrders.push(newPO);
    return newPO;
  }

  public updatePOStatus(id: string, status: POStatus): BuyerPurchaseOrder | null {
    const po = this.getPurchaseOrderById(id);
    if (!po) return null;
    po.status = status;
    po.updatedAt = new Date().toISOString();
    return po;
  }

  // ==========================================
  // Phase 3: Supply Chain, Procurement & Inventory
  // ==========================================

  // 1. Suppliers
  public getAllSuppliers(): Supplier[] {
    return this.suppliers;
  }

  public getSupplierById(id: string): Supplier | undefined {
    return this.suppliers.find(s => s.id === id);
  }

  public createSupplier(data: Omit<Supplier, 'id' | 'createdAt'>): Supplier {
    const newSupplier: Supplier = {
      ...data,
      id: `sup-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    this.suppliers.push(newSupplier);
    return newSupplier;
  }

  // 2. Purchase Requisitions
  public getAllPurchaseRequisitions(): PurchaseRequisition[] {
    return this.purchaseRequisitions;
  }

  public getPurchaseRequisitionById(id: string): PurchaseRequisition | undefined {
    return this.purchaseRequisitions.find(pr => pr.id === id);
  }

  public createPurchaseRequisition(data: Omit<PurchaseRequisition, 'id' | 'createdAt'>): PurchaseRequisition {
    const newPR: PurchaseRequisition = {
      ...data,
      id: `pr-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    this.purchaseRequisitions.push(newPR);
    return newPR;
  }

  public approvePurchaseRequisition(id: string, approvedBy: string): PurchaseRequisition | null {
    const pr = this.getPurchaseRequisitionById(id);
    if (!pr) return null;
    pr.status = 'APPROVED';
    pr.approvedBy = approvedBy;
    pr.approvalDate = new Date().toISOString();
    return pr;
  }

  // 3. Supplier Purchase Orders
  public getAllSupplierPOs(): SupplierPurchaseOrder[] {
    return this.supplierPurchaseOrders;
  }

  public getSupplierPOById(id: string): SupplierPurchaseOrder | undefined {
    return this.supplierPurchaseOrders.find(spo => spo.id === id);
  }

  public createSupplierPO(data: Omit<SupplierPurchaseOrder, 'id' | 'createdAt'>): SupplierPurchaseOrder {
    const newSPO: SupplierPurchaseOrder = {
      ...data,
      id: `spo-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    this.supplierPurchaseOrders.push(newSPO);
    return newSPO;
  }

  // 4. Goods Received Notes (GRN)
  public getAllGRNs(): GoodsReceivedNote[] {
    return this.grns;
  }

  public getGRNById(id: string): GoodsReceivedNote | undefined {
    return this.grns.find(g => g.id === id);
  }

  public createGRN(data: Omit<GoodsReceivedNote, 'id' | 'createdAt'>): GoodsReceivedNote {
    const newGRN: GoodsReceivedNote = {
      ...data,
      id: `grn-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    this.grns.push(newGRN);

    // If inspection passed, update inventory and post StockTransaction
    if (newGRN.qcInspectionStatus === 'PASSED') {
      newGRN.items.forEach(item => {
        let stock = this.stockInventory.find(s => s.sku === item.sku && s.warehouseId === newGRN.warehouseId);
        if (stock) {
          stock.totalQty += item.acceptedQty;
          stock.availableQty += item.acceptedQty;
          stock.updatedAt = new Date().toISOString();
        } else {
          stock = {
            id: `stk-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            sku: item.sku,
            itemName: item.itemName,
            category: item.sku.startsWith('FAB') ? 'FABRIC' : item.sku.startsWith('TRM') ? 'TRIMS' : 'ACCESSORIES',
            warehouseId: newGRN.warehouseId,
            warehouseName: newGRN.warehouseName,
            binCode: item.binCode,
            lotNumber: item.lotNumber,
            shadeBand: item.shadeBand,
            unit: item.unit,
            totalQty: item.acceptedQty,
            availableQty: item.acceptedQty,
            reservedQty: 0,
            quarantineQty: 0,
            rejectedQty: item.rejectedQty,
            reorderLevel: 1000,
            updatedAt: new Date().toISOString()
          };
          this.stockInventory.push(stock);
        }

        const tx: StockTransaction = {
          id: `stx-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          transactionNumber: `STX-${Date.now()}`,
          type: 'RECEIVE_GRN',
          sku: item.sku,
          itemName: item.itemName,
          toWarehouse: `${newGRN.warehouseName} (${item.binCode})`,
          quantity: item.acceptedQty,
          unit: item.unit,
          referenceDoc: newGRN.grnNumber,
          performedBy: newGRN.receivedBy,
          reason: `GRN inbound receipt against SPO ${newGRN.spoNumber}`,
          timestamp: new Date().toISOString()
        };
        this.stockTransactions.unshift(tx);
      });
    }

    return newGRN;
  }

  // 5. Stock Inventory & Negative Stock Prevention
  public getStockInventory(): StockItem[] {
    return this.stockInventory;
  }

  public getStockTransactions(limit: number = 50): StockTransaction[] {
    return this.stockTransactions.slice(0, limit);
  }

  public issueStockToLine(params: {
    sku: string;
    warehouseId?: string;
    quantity: number;
    targetLine: string;
    referenceDoc: string;
    performedBy: string;
    reason: string;
  }): { success: boolean; transaction: StockTransaction; updatedStock: StockItem } {
    const stock = this.stockInventory.find(s => 
      s.sku === params.sku && (!params.warehouseId || s.warehouseId === params.warehouseId)
    );

    if (!stock) {
      throw new Error(`Stock item with SKU '${params.sku}' not found in specified warehouse.`);
    }

    if (stock.availableQty < params.quantity) {
      throw new Error(
        `Insufficient inventory for SKU '${params.sku}'. Available: ${stock.availableQty} ${stock.unit}, Requested: ${params.quantity} ${stock.unit}. Negative stock issuance is strictly rejected by GarmentERP compliance.`
      );
    }

    // Deduct stock safely
    stock.availableQty -= params.quantity;
    stock.totalQty -= params.quantity;
    stock.updatedAt = new Date().toISOString();

    const transaction: StockTransaction = {
      id: `stx-${Date.now()}`,
      transactionNumber: `STX-${Date.now()}`,
      type: 'ISSUE_TO_LINE',
      sku: stock.sku,
      itemName: stock.itemName,
      fromWarehouse: stock.warehouseName,
      targetLine: params.targetLine,
      quantity: params.quantity,
      unit: stock.unit,
      referenceDoc: params.referenceDoc,
      performedBy: params.performedBy,
      reason: params.reason,
      timestamp: new Date().toISOString()
    };

    this.stockTransactions.unshift(transaction);

    return {
      success: true,
      transaction,
      updatedStock: stock
    };
  }

  // ==========================================
  // Phase 4: Production Management Methods
  // ==========================================

  // 1. Fabric Relaxation Tracking (24h Countdown)
  public getAllFabricRelaxations(): FabricRelaxationRecord[] {
    const now = new Date().toISOString();
    this.relaxations.forEach(r => {
      if (r.status === 'RELAXING' && now >= r.targetReadyTime) {
        r.status = 'READY_FOR_CUT';
      }
    });
    return this.relaxations;
  }

  public startFabricRelaxation(data: Omit<FabricRelaxationRecord, 'id' | 'status' | 'targetReadyTime'>): FabricRelaxationRecord {
    const startTime = data.startTime || new Date().toISOString();
    const durationHours = data.durationHours || 24;
    const targetReadyTime = new Date(new Date(startTime).getTime() + durationHours * 3600 * 1000).toISOString();

    const record: FabricRelaxationRecord = {
      ...data,
      id: `rlx-${Date.now()}`,
      startTime,
      durationHours,
      targetReadyTime,
      status: 'RELAXING'
    };
    this.relaxations.unshift(record);
    return record;
  }

  public completeFabricRelaxation(id: string): FabricRelaxationRecord | null {
    const record = this.relaxations.find(r => r.id === id);
    if (!record) return null;
    record.status = 'READY_FOR_CUT';
    return record;
  }

  // 2. Cut Orders & Bundles
  public getAllCutOrders(): CutOrder[] {
    return this.cutOrders;
  }

  public getCutOrderById(id: string): CutOrder | undefined {
    return this.cutOrders.find(c => c.id === id);
  }

  public createCutOrder(data: Omit<CutOrder, 'id' | 'bundles' | 'createdAt' | 'updatedAt'>): CutOrder {
    const newCutOrder: CutOrder = {
      ...data,
      id: `cut-${Date.now()}`,
      bundles: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.cutOrders.unshift(newCutOrder);
    return newCutOrder;
  }

  public generateBundlesForCutOrder(cutOrderId: string, bundleSize: number = 250): CutBundle[] {
    const cutOrder = this.getCutOrderById(cutOrderId);
    if (!cutOrder) {
      throw new Error(`Cut order ${cutOrderId} not found.`);
    }

    const generated: CutBundle[] = [];
    let serialCounter = 1;

    cutOrder.colorSizeBreakdown.forEach((cs) => {
      const pcs = cs.actualCutPcs || cs.plannedPcs;
      const numBundles = Math.ceil(pcs / bundleSize);

      for (let i = 1; i <= numBundles; i++) {
        const qty = i === numBundles && pcs % bundleSize !== 0 ? pcs % bundleSize : bundleSize;
        const bnd: CutBundle = {
          id: `bnd-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          bundleNumber: `BND-${cutOrder.cutNumber}-${cs.color.slice(0, 3).toUpperCase()}-${cs.size}-${String(i).padStart(2, '0')}`,
          cutNumber: cutOrder.cutNumber,
          poNumber: cutOrder.poNumber,
          styleNumber: cutOrder.styleNumber,
          color: cs.color,
          size: cs.size,
          quantity: qty,
          serialStart: serialCounter,
          serialEnd: serialCounter + qty - 1,
          barcode: `BC-${cutOrder.cutNumber}-${cs.size}-${String(i).padStart(2, '0')}`,
          assignedLineId: 'line-sew-01',
          assignedLineName: 'Sewing Line 01 (Polo Shirt)',
          status: 'GENERATED'
        };
        serialCounter += qty;
        generated.push(bnd);
        this.bundles.push(bnd);
      }
    });

    cutOrder.bundles = [...cutOrder.bundles, ...generated];
    cutOrder.updatedAt = new Date().toISOString();
    return generated;
  }

  public getAllBundles(): CutBundle[] {
    return this.bundles;
  }

  // 3. Sewing Line Tracking & Efficiency
  public getAllSewingOutputs(lineId?: string): SewingHourlyOutput[] {
    if (lineId) {
      return this.sewingHourlyLogs.filter(s => s.lineId === lineId);
    }
    return this.sewingHourlyLogs;
  }

  public recordSewingHourlyOutput(data: Omit<SewingHourlyOutput, 'id' | 'timestamp'>): SewingHourlyOutput {
    const newLog: SewingHourlyOutput = {
      ...data,
      id: `shl-${Date.now()}`,
      timestamp: new Date().toISOString()
    };
    this.sewingHourlyLogs.unshift(newLog);
    return newLog;
  }

  public getSewingLinesSummary(): SewingLineSummary[] {
    const lines = [
      { id: 'line-sew-01', name: 'Sewing Line 01 (Polo Shirt)', style: 'TSH-2026-001', po: 'PO-2026-001', target: 120, op: 38, hl: 10, smv: 14.5 },
      { id: 'line-sew-02', name: 'Sewing Line 02 (T-Shirt & Henley)', style: 'TSH-2026-001', po: 'PO-2026-001', target: 140, op: 32, hl: 8, smv: 11.2 },
      { id: 'line-sew-03', name: 'Sewing Line 03 (Fleece Hoodie)', style: 'HOD-2026-002', po: 'PO-2026-002', target: 80, op: 42, hl: 12, smv: 24.0 },
      { id: 'line-sew-04', name: 'Sewing Line 04 (Jogger Pants)', style: 'JOG-2026-003', po: 'PO-2026-003', target: 100, op: 40, hl: 10, smv: 18.5 }
    ];

    return lines.map(line => {
      const logs = this.sewingHourlyLogs.filter(l => l.lineId === line.id);
      const totalTarget = logs.reduce((acc, l) => acc + l.targetQty, 0) || (line.target * 8);
      const totalActual = logs.reduce((acc, l) => acc + l.actualQty, 0);
      const totalRejected = logs.reduce((acc, l) => acc + l.rejectedQty, 0);
      const efficiency = totalTarget > 0 ? Number(((totalActual / totalTarget) * 100).toFixed(1)) : 88.0;

      return {
        lineId: line.id,
        lineNumber: line.name,
        currentStyle: line.style,
        currentPo: line.po,
        targetPerHour: line.target,
        todayTargetTotal: totalTarget,
        todayActualTotal: totalActual,
        todayRejectedTotal: totalRejected,
        overallEfficiencyPercent: efficiency,
        operatorCount: line.op,
        helperCount: line.hl,
        smv: line.smv,
        status: 'RUNNING',
        hourlyLogs: logs
      };
    });
  }

  // 4. Finishing & Packaging
  public getAllFinishingBatches(): FinishingBatch[] {
    return this.finishingBatches;
  }

  public updateFinishingStage(
    batchId: string, 
    stage: 'threadTrimmedPcs' | 'steamIronedPcs' | 'metalDetectedPcs' | 'polybaggedPcs', 
    qty: number
  ): FinishingBatch | null {
    const batch = this.finishingBatches.find(b => b.id === batchId);
    if (!batch) return null;
    batch[stage] = Math.min(batch.totalReceivedPcs, batch[stage] + qty);
    batch.updatedAt = new Date().toISOString();
    return batch;
  }

  public getAllCartonRecords(): CartonPackingRecord[] {
    return this.cartons;
  }

  public createCartonRecord(data: Omit<CartonPackingRecord, 'id' | 'packedAt'>): CartonPackingRecord {
    const newCarton: CartonPackingRecord = {
      ...data,
      id: `ctn-${Date.now()}`,
      packedAt: new Date().toISOString()
    };
    this.cartons.unshift(newCarton);
    return newCarton;
  }

  // ==========================================
  // PHASE 5: Comprehensive QA/QC Suite Methods
  // ==========================================

  // 1. Fabric 4-Point System
  public getAllFabricInspections(): Fabric4PointInspection[] {
    return this.fabricInspections;
  }

  public createFabricInspection(data: {
    rollNumber: string;
    fabricLot: string;
    fabricType: string;
    inspectedLengthYards: number;
    fabricWidthInches: number;
    defectsSize1Count: number;
    defectsSize2Count: number;
    defectsSize3Count: number;
    defectsSize4Count: number;
    inspectorName: string;
    comments?: string;
  }): Fabric4PointInspection {
    const totalDefectPoints = 
      (data.defectsSize1Count * 1) + 
      (data.defectsSize2Count * 2) + 
      (data.defectsSize3Count * 3) + 
      (data.defectsSize4Count * 4);

    const pointsPer100SqYards = Number(
      ((totalDefectPoints * 3600) / (data.inspectedLengthYards * data.fabricWidthInches)).toFixed(2)
    );

    let penaltyGrade: 'FIRST_QUALITY_PASS' | 'WARNING_ACCEPTABLE' | 'REJECTED' = 'FIRST_QUALITY_PASS';
    if (pointsPer100SqYards > 28) {
      penaltyGrade = 'REJECTED';
    } else if (pointsPer100SqYards > 20) {
      penaltyGrade = 'WARNING_ACCEPTABLE';
    }

    const newInsp: Fabric4PointInspection = {
      id: `f4p-${Date.now()}`,
      ...data,
      totalDefectPoints,
      pointsPer100SqYards,
      penaltyGrade,
      inspectedAt: new Date().toISOString()
    };

    this.fabricInspections.unshift(newInsp);
    return newInsp;
  }

  // 2. Inline & End-line Sewing Defects
  public getAllSewingDefects(): SewingDefectRecord[] {
    return this.sewingDefects;
  }

  public createSewingDefect(data: {
    inspectionType: 'INLINE' | 'ENDLINE';
    lineId: string;
    lineNumber: string;
    styleNumber: string;
    poNumber: string;
    defectCode: string;
    defectName: string;
    severity: 'CRITICAL' | 'MAJOR' | 'MINOR';
    zone: 'COLLAR' | 'ARMHOLE' | 'PLACKET' | 'HEM' | 'SIDE_SEAM' | 'CUFF';
    operatorStation?: string;
    inspectorName: string;
    inspectedGarments: number;
    defectQty: number;
  }): SewingDefectRecord {
    const dhuPercent = data.inspectedGarments > 0 
      ? Number(((data.defectQty / data.inspectedGarments) * 100).toFixed(2)) 
      : 0;

    const newDefect: SewingDefectRecord = {
      id: `def-${Date.now()}`,
      ...data,
      dhuPercent,
      timestamp: new Date().toISOString(),
      status: data.severity === 'CRITICAL' || data.severity === 'MAJOR' ? 'REWORK_ISSUED' : 'OPEN'
    };

    this.sewingDefects.unshift(newDefect);

    // If Major or Critical, auto-generate Rework Order
    if (data.severity === 'CRITICAL' || data.severity === 'MAJOR') {
      const rework: ReworkOrder = {
        id: `rwk-${Date.now()}`,
        reworkNumber: `RWK-${Date.now().toString().slice(-4)}`,
        defectId: newDefect.id,
        defectName: newDefect.defectName,
        severity: newDefect.severity,
        poNumber: newDefect.poNumber,
        styleNumber: newDefect.styleNumber,
        lineId: newDefect.lineId,
        lineNumber: newDefect.lineNumber,
        quarantineQty: newDefect.defectQty,
        repairedQty: 0,
        scrappedQty: 0,
        assignedRepairOperator: 'Floor Rework Section Operator',
        status: 'PENDING_REWORK',
        notes: `Immediate quarantine of ${newDefect.defectQty} pcs due to ${newDefect.severity} ${newDefect.defectName}.`,
        createdAt: new Date().toISOString()
      };
      this.reworkOrders.unshift(rework);
    }

    return newDefect;
  }

  // 3. Rework Orders
  public getAllReworkOrders(): ReworkOrder[] {
    return this.reworkOrders;
  }

  public updateReworkStatus(
    id: string, 
    status: 'PENDING_REWORK' | 'IN_REPAIR' | 'RE_INSPECTED_PASS' | 'SCRAPPED_B_GRADE',
    repairedQty?: number,
    scrappedQty?: number
  ): ReworkOrder | null {
    const rework = this.reworkOrders.find(r => r.id === id);
    if (!rework) return null;
    rework.status = status;
    if (repairedQty !== undefined) rework.repairedQty = repairedQty;
    if (scrappedQty !== undefined) rework.scrappedQty = scrappedQty;
    if (status === 'RE_INSPECTED_PASS' || status === 'SCRAPPED_B_GRADE') {
      rework.completedAt = new Date().toISOString();
      const linkedDef = this.sewingDefects.find(d => d.id === rework.defectId);
      if (linkedDef) linkedDef.status = 'RESOLVED';
    }
    return rework;
  }

  // 4. CAPA 5-Whys Records
  public getAllCapaRecords(): CapaRecord[] {
    return this.capaRecords;
  }

  public createCapaRecord(data: Omit<CapaRecord, 'id' | 'capaNumber' | 'status' | 'createdAt'>): CapaRecord {
    const newCapa: CapaRecord = {
      ...data,
      id: `capa-${Date.now()}`,
      capaNumber: `CAPA-2026-${Date.now().toString().slice(-4)}`,
      status: 'UNDER_REVIEW',
      createdAt: new Date().toISOString()
    };
    this.capaRecords.unshift(newCapa);
    return newCapa;
  }

  public verifyCapa(id: string, qaManagerName: string, signature: string): CapaRecord | null {
    const capa = this.capaRecords.find(c => c.id === id);
    if (!capa) return null;
    capa.status = 'APPROVED_ACTIVE';
    capa.qaManagerApproval = {
      approvedBy: qaManagerName,
      approvedAt: new Date().toISOString(),
      signature
    };
    return capa;
  }

  // 5. ISO 2859-1 / AQL 2.5 Sampling Inspections
  public getAllAqlInspections(): AqlSamplingInspection[] {
    return this.aqlInspections;
  }

  public calculateAndCreateAqlSampling(params: {
    poNumber: string;
    buyerPo: string;
    buyerName: string;
    styleNumber: string;
    totalLotSize: number;
    generalInspectionLevel: 'LEVEL_I' | 'LEVEL_II' | 'LEVEL_III';
    criticalDefectsFound: number;
    majorDefectsFound: number;
    minorDefectsFound: number;
    qaManagerSignoff: string;
  }): AqlSamplingInspection {
    const lot = params.totalLotSize;
    let code = 'J';
    let sampleSize = 80;
    let majorAc = 5;
    let majorRe = 6;
    let minorAc = 7;
    let minorRe = 8;

    if (lot <= 500) {
      code = 'H';
      sampleSize = 50;
      majorAc = 3;
      majorRe = 4;
      minorAc = 5;
      minorRe = 6;
    } else if (lot <= 1200) {
      code = 'J';
      sampleSize = 80;
      majorAc = 5;
      majorRe = 6;
      minorAc = 7;
      minorRe = 8;
    } else if (lot <= 3200) {
      code = 'K';
      sampleSize = 125;
      majorAc = 7;
      majorRe = 8;
      minorAc = 10;
      minorRe = 11;
    } else if (lot <= 10000) {
      code = 'K';
      sampleSize = 315;
      majorAc = 14;
      majorRe = 15;
      minorAc = 21;
      minorRe = 22;
    } else {
      code = 'M';
      sampleSize = 315;
      majorAc = 14;
      majorRe = 15;
      minorAc = 21;
      minorRe = 22;
    }

    const criticalAc = 0;
    const criticalRe = 1;

    const isPass = 
      params.criticalDefectsFound <= criticalAc &&
      params.majorDefectsFound <= majorAc &&
      params.minorDefectsFound <= minorAc;

    const newAql: AqlSamplingInspection = {
      id: `aql-${Date.now()}`,
      certificateNumber: `AQL-CERT-2026-${Date.now().toString().slice(-4)}`,
      poNumber: params.poNumber,
      buyerPo: params.buyerPo,
      buyerName: params.buyerName,
      styleNumber: params.styleNumber,
      totalLotSize: params.totalLotSize,
      generalInspectionLevel: params.generalInspectionLevel,
      sampleSizeCodeLetter: code,
      sampleSize,
      criticalAql: 0.0,
      criticalAc,
      criticalRe,
      criticalDefectsFound: params.criticalDefectsFound,
      majorAql: 2.5,
      majorAc,
      majorRe,
      majorDefectsFound: params.majorDefectsFound,
      minorAql: 4.0,
      minorAc,
      minorRe,
      minorDefectsFound: params.minorDefectsFound,
      overallResult: isPass ? 'ACCEPTED_PASS' : 'REJECTED_FAIL',
      qaManagerSignoff: params.qaManagerSignoff,
      inspectionDate: new Date().toISOString()
    };

    this.aqlInspections.unshift(newAql);
    return newAql;
  }

  // ==========================================
  // 6. Phase 6: Shipment & Export Logistics Operations
  // ==========================================
  public verifyAqlPassForPo(poNumber: string): { verified: boolean; aqlRecord?: AqlSamplingInspection; error?: string } {
    const aql = this.aqlInspections.find(a => 
      (a.poNumber === poNumber || a.buyerPo === poNumber) && a.overallResult === 'ACCEPTED_PASS'
    );
    if (!aql) {
      return {
        verified: false,
        error: `Quality Gate Violation: Buyer PO '${poNumber}' has no certified ACCEPTED_PASS AQL 2.5 final inspection. Export shipment generation is strictly blocked.`
      };
    }
    return { verified: true, aqlRecord: aql };
  }

  public getAllShipments(): Shipment[] {
    return this.shipments;
  }

  public getShipmentById(id: string): Shipment | undefined {
    return this.shipments.find(s => s.id === id);
  }

  public getAllCommercialInvoices(): CommercialInvoice[] {
    return this.commercialInvoices;
  }

  public getAllPackingLists(): PackingList[] {
    return this.packingLists;
  }

  public getAllGatePasses(): SecurityGatePass[] {
    return this.gatePasses;
  }

  public createShipment(data: {
    poId: string;
    poNumber: string;
    buyerId: string;
    buyerName: string;
    styleNumber: string;
    orderQuantity: number;
    shippedQuantity: number;
    vesselOrFlight: string;
    etd: string;
    eta: string;
  }): { shipment?: Shipment; error?: string } {
    const gateCheck = this.verifyAqlPassForPo(data.poNumber);
    if (!gateCheck.verified || !gateCheck.aqlRecord) {
      return { error: gateCheck.error };
    }

    const newShipment: Shipment = {
      id: `shp-${Date.now()}`,
      shipmentTrackingNumber: `SHP-2026-${Date.now().toString().slice(-4)}`,
      poId: data.poId,
      poNumber: data.poNumber,
      buyerId: data.buyerId,
      buyerName: data.buyerName,
      styleNumber: data.styleNumber,
      orderQuantity: data.orderQuantity,
      shippedQuantity: data.shippedQuantity,
      aqlCertificateNumber: gateCheck.aqlRecord.certificateNumber,
      aqlOverallResult: gateCheck.aqlRecord.overallResult,
      status: 'PLANNED',
      vesselOrFlight: data.vesselOrFlight,
      etd: data.etd,
      eta: data.eta,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.shipments.unshift(newShipment);

    const po = this.purchaseOrders.find(p => p.id === data.poId || p.poNumber === data.poNumber);
    if (po) {
      po.status = 'SHIPPED';
    }

    return { shipment: newShipment };
  }

  public createCommercialInvoice(data: {
    poId: string;
    poNumber: string;
    buyerId: string;
    buyerName: string;
    styleNumber: string;
    lcNumber: string;
    issuingBank: string;
    incoterms: Incoterm;
    portOfLoading: string;
    portOfDischarge: string;
    currency: 'USD' | 'EUR' | 'GBP' | 'BDT';
    invoicedQuantity: number;
    unitPrice: number;
    paymentTerms: string;
    commercialOfficerSignoff: string;
  }): { invoice?: CommercialInvoice; error?: string } {
    const gateCheck = this.verifyAqlPassForPo(data.poNumber);
    if (!gateCheck.verified) {
      return { error: gateCheck.error };
    }

    const newInvoice: CommercialInvoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber: `EXP-INV-2026-${Date.now().toString().slice(-4)}`,
      poId: data.poId,
      poNumber: data.poNumber,
      buyerId: data.buyerId,
      buyerName: data.buyerName,
      styleNumber: data.styleNumber,
      lcNumber: data.lcNumber,
      issuingBank: data.issuingBank,
      incoterms: data.incoterms,
      portOfLoading: data.portOfLoading,
      portOfDischarge: data.portOfDischarge,
      currency: data.currency,
      invoicedQuantity: data.invoicedQuantity,
      unitPrice: data.unitPrice,
      totalAmount: +(data.invoicedQuantity * data.unitPrice).toFixed(2),
      paymentTerms: data.paymentTerms,
      commercialOfficerSignoff: data.commercialOfficerSignoff,
      createdAt: new Date().toISOString()
    };

    this.commercialInvoices.unshift(newInvoice);

    const shipment = this.shipments.find(s => s.poNumber === data.poNumber || s.poId === data.poId);
    if (shipment) {
      shipment.commercialInvoice = newInvoice;
      if (shipment.status === 'PLANNED') {
        shipment.status = 'DOCS_PREPARED';
      }
      shipment.updatedAt = new Date().toISOString();
    }

    return { invoice: newInvoice };
  }

  public createPackingList(data: {
    poId: string;
    poNumber: string;
    invoiceNumber: string;
    containerType: ContainerType;
    containerNumber: string;
    sealNumber: string;
    cartonBreakdown: Array<{
      cartonRange: string;
      sizeRatio: string;
      pcsPerCarton: number;
      totalCartons: number;
      totalPcs: number;
      grossWeightKg: number;
      netWeightKg: number;
      dimensionsCm: string;
    }>;
  }): { packingList?: PackingList; error?: string } {
    const gateCheck = this.verifyAqlPassForPo(data.poNumber);
    if (!gateCheck.verified) {
      return { error: gateCheck.error };
    }

    let totalCartons = 0;
    let totalGrossWeight = 0;
    let totalNetWeight = 0;
    let totalCbm = 0;

    const formattedBreakdown: PackingListCartonItem[] = data.cartonBreakdown.map(item => {
      const parts = item.dimensionsCm.split('x').map(n => parseFloat(n.trim()) || 0);
      const l = parts[0] || 60;
      const w = parts[1] || 40;
      const h = parts[2] || 30;
      const cbmPerCarton = (l * w * h) / 1000000;
      const cbmTotal = +(cbmPerCarton * item.totalCartons).toFixed(3);

      totalCartons += item.totalCartons;
      totalGrossWeight += item.grossWeightKg;
      totalNetWeight += item.netWeightKg;
      totalCbm += cbmTotal;

      return {
        ...item,
        cbm: cbmTotal
      };
    });

    const newPackingList: PackingList = {
      id: `pl-${Date.now()}`,
      packingListNumber: `EXP-PL-2026-${Date.now().toString().slice(-4)}`,
      poId: data.poId,
      poNumber: data.poNumber,
      invoiceNumber: data.invoiceNumber,
      totalCartons,
      totalGrossWeightKg: +totalGrossWeight.toFixed(2),
      totalNetWeightKg: +totalNetWeight.toFixed(2),
      totalCbm: +totalCbm.toFixed(2),
      containerType: data.containerType,
      containerNumber: data.containerNumber,
      sealNumber: data.sealNumber,
      cartonBreakdown: formattedBreakdown,
      createdAt: new Date().toISOString()
    };

    this.packingLists.unshift(newPackingList);

    const shipment = this.shipments.find(s => s.poNumber === data.poNumber || s.poId === data.poId);
    if (shipment) {
      shipment.packingList = newPackingList;
      shipment.updatedAt = new Date().toISOString();
    }

    return { packingList: newPackingList };
  }

  public createSecurityGatePass(data: {
    shipmentId: string;
    poNumber: string;
    invoiceNumber: string;
    vehicleNumber: string;
    driverName: string;
    driverPhone: string;
    containerSealNumber: string;
    destination: string;
    dispatchTime: string;
    securityOfficer: string;
  }): { gatePass?: SecurityGatePass; error?: string } {
    const gateCheck = this.verifyAqlPassForPo(data.poNumber);
    if (!gateCheck.verified) {
      return { error: gateCheck.error };
    }

    const newGatePass: SecurityGatePass = {
      id: `gp-${Date.now()}`,
      gatePassNumber: `GP-SAVAR-2026-${Date.now().toString().slice(-4)}`,
      shipmentId: data.shipmentId,
      poNumber: data.poNumber,
      invoiceNumber: data.invoiceNumber,
      vehicleNumber: data.vehicleNumber,
      driverName: data.driverName,
      driverPhone: data.driverPhone,
      containerSealNumber: data.containerSealNumber,
      destination: data.destination,
      dispatchTime: data.dispatchTime || new Date().toISOString(),
      securityOfficer: data.securityOfficer,
      status: 'PENDING_EXIT',
      createdAt: new Date().toISOString()
    };

    this.gatePasses.unshift(newGatePass);

    const shipment = this.shipments.find(s => s.id === data.shipmentId || s.poNumber === data.poNumber);
    if (shipment) {
      shipment.gatePass = newGatePass;
      shipment.updatedAt = new Date().toISOString();
    }

    return { gatePass: newGatePass };
  }

  public updateGatePassStatus(id: string, status: 'DISPATCHED_GATE_OUT' | 'DELIVERED'): SecurityGatePass | null {
    const gp = this.gatePasses.find(g => g.id === id);
    if (!gp) return null;
    gp.status = status;
    if (status === 'DISPATCHED_GATE_OUT') {
      gp.exitTimestamp = new Date().toISOString();
      const shipment = this.shipments.find(s => s.id === gp.shipmentId || s.poNumber === gp.poNumber);
      if (shipment) {
        shipment.status = 'GATE_OUT';
        shipment.updatedAt = new Date().toISOString();
      }
    } else if (status === 'DELIVERED') {
      const shipment = this.shipments.find(s => s.id === gp.shipmentId || s.poNumber === gp.poNumber);
      if (shipment) {
        shipment.status = 'PORT_DELIVERED';
        shipment.updatedAt = new Date().toISOString();
      }
    }
    return gp;
  }

  public updateShipmentStatus(id: string, status: ShipmentStatus): Shipment | null {
    const shipment = this.shipments.find(s => s.id === id);
    if (!shipment) return null;
    shipment.status = status;
    shipment.updatedAt = new Date().toISOString();
    return shipment;
  }

  // ==========================================
  // 7. Phase 7: Factory Operations (HR, Maintenance, Finance, Compliance)
  // ==========================================

  // HR & Employees
  public getAllEmployees(): Employee[] {
    return this.employees;
  }

  public createEmployee(data: Omit<Employee, 'id'>): Employee {
    const newEmp: Employee = {
      ...data,
      id: `emp-${Date.now()}`
    };
    this.employees.unshift(newEmp);
    return newEmp;
  }

  public getAllAttendance(): AttendanceRecord[] {
    return this.attendanceRecords;
  }

  public recordAttendance(data: {
    employeeId: string;
    date: string;
    checkIn: string;
    checkOut: string;
    status: 'PRESENT' | 'LATE' | 'ABSENT' | 'ON_LEAVE';
    biometricTerminalId: string;
  }): AttendanceRecord {
    const emp = this.employees.find(e => e.id === data.employeeId);
    const employeeCode = emp?.employeeCode || 'EMP-UNK';
    const employeeName = emp?.fullName || 'Unknown Operator';

    // Calculate Overtime (Standard shift 8 hours: e.g. 08:00 to 17:00 with 1h lunch)
    let overtimeHours = 0;
    if (data.status === 'PRESENT' || data.status === 'LATE') {
      const [inH, inM] = data.checkIn.split(':').map(Number);
      const [outH, outM] = data.checkOut.split(':').map(Number);
      const totalHours = (outH + outM / 60) - (inH + inM / 60) - 1.0; // 1 hr break
      if (totalHours > 8.0) {
        overtimeHours = +(totalHours - 8.0).toFixed(1);
      }
    }

    const rec: AttendanceRecord = {
      id: `att-${Date.now()}`,
      employeeId: data.employeeId,
      employeeCode,
      employeeName,
      date: data.date,
      checkIn: data.checkIn,
      checkOut: data.checkOut,
      status: data.status,
      overtimeHours,
      biometricTerminalId: data.biometricTerminalId
    };

    this.attendanceRecords.unshift(rec);
    return rec;
  }

  // Payroll Engine (Bangladesh Labor Act 2006 Overtime: 2x hourly wage rate)
  public getAllPayroll(): PayrollRecord[] {
    return this.payrollRecords;
  }

  public calculateMonthlyPayroll(monthYear: string): PayrollRecord[] {
    const results: PayrollRecord[] = [];

    for (const emp of this.employees) {
      if (emp.status !== 'ACTIVE') continue;

      // Sum overtime hours for employee in this month
      const empAttendance = this.attendanceRecords.filter(a => a.employeeId === emp.id);
      const totalOtHours = empAttendance.reduce((sum, a) => sum + (a.overtimeHours || 0), 0);

      // Overtime rate: (Basic Salary / 208 hours) * 2
      const hourlyBasic = emp.baseSalaryBdt / 208;
      const otHourlyRate = +(hourlyBasic * 2).toFixed(2);
      const otPay = +(totalOtHours * otHourlyRate).toFixed(2);
      const attendanceBonus = empAttendance.some(a => a.status === 'ABSENT') ? 0 : 1000;
      const deductions = 0;
      const netPayable = +(emp.baseSalaryBdt + otPay + attendanceBonus - deductions).toFixed(2);

      const payrollRec: PayrollRecord = {
        id: `pay-${Date.now()}-${emp.id}`,
        monthYear,
        employeeId: emp.id,
        employeeCode: emp.employeeCode,
        employeeName: emp.fullName,
        designation: emp.designation,
        baseSalaryBdt: emp.baseSalaryBdt,
        overtimeHours: totalOtHours,
        overtimeHourlyRateBdt: otHourlyRate,
        overtimePayBdt: otPay,
        attendanceBonusBdt: attendanceBonus,
        deductionsBdt: deductions,
        netPayableBdt: netPayable,
        paymentStatus: 'PAID',
        disbursedAt: new Date().toISOString()
      };

      results.push(payrollRec);
    }

    this.payrollRecords = [...results, ...this.payrollRecords];
    return results;
  }

  // Machinery & Maintenance
  public getAllMachines(): MachineAsset[] {
    return this.machines;
  }

  public createMachine(data: Omit<MachineAsset, 'id' | 'totalDowntimeHours'>): MachineAsset {
    const newMachine: MachineAsset = {
      ...data,
      id: `mac-${Date.now()}`,
      totalDowntimeHours: 0
    };
    this.machines.unshift(newMachine);
    return newMachine;
  }

  public getAllMaintenanceTickets(): MaintenanceTicket[] {
    return this.maintenanceTickets;
  }

  public createMaintenanceTicket(data: {
    machineId: string;
    lineId: string;
    issueType: 'NEEDLE_BAR_JAM' | 'THREAD_TENSION_FAILURE' | 'MOTOR_OVERHEAT' | 'OIL_LEAKAGE' | 'TIMING_BELT_SLIP' | 'CALIBRATION_ERROR';
    severity: 'CRITICAL_STOPPAGE' | 'MAJOR' | 'MINOR';
    reportedBy: string;
    assignedMechanic: string;
  }): MaintenanceTicket {
    const mac = this.machines.find(m => m.id === data.machineId);
    const machineCode = mac?.machineCode || 'MAC-UNKNOWN';

    if (mac && data.severity === 'CRITICAL_STOPPAGE') {
      mac.status = 'BREAKDOWN_STOPPED';
    }

    const newTicket: MaintenanceTicket = {
      id: `mnt-${Date.now()}`,
      ticketNumber: `MNT-2026-${Date.now().toString().slice(-4)}`,
      machineId: data.machineId,
      machineCode,
      lineId: data.lineId,
      issueType: data.issueType,
      severity: data.severity,
      reportedBy: data.reportedBy,
      assignedMechanic: data.assignedMechanic,
      downtimeMinutes: 0,
      sparePartsReplaced: 'Pending Diagnosis',
      sparePartsCostBdt: 0,
      status: 'OPEN',
      reportedAt: new Date().toISOString()
    };

    this.maintenanceTickets.unshift(newTicket);
    return newTicket;
  }

  public resolveMaintenanceTicket(
    ticketId: string, 
    downtimeMinutes: number, 
    sparePartsReplaced: string, 
    sparePartsCostBdt: number
  ): MaintenanceTicket | null {
    const ticket = this.maintenanceTickets.find(t => t.id === ticketId);
    if (!ticket) return null;

    ticket.downtimeMinutes = downtimeMinutes;
    ticket.sparePartsReplaced = sparePartsReplaced;
    ticket.sparePartsCostBdt = sparePartsCostBdt;
    ticket.status = 'CLOSED';
    ticket.resolvedAt = new Date().toISOString();

    const mac = this.machines.find(m => m.id === ticket.machineId);
    if (mac) {
      mac.status = 'OPERATIONAL';
      mac.totalDowntimeHours = +(mac.totalDowntimeHours + (downtimeMinutes / 60)).toFixed(1);
      mac.lastMaintenanceDate = new Date().toISOString().split('T')[0];
    }

    return ticket;
  }

  // Operational Finance & Cost Centers
  public getAllCostCenters(): CostCenter[] {
    return this.costCenters;
  }

  public getAllFinancialTransactions(): FinancialTransaction[] {
    return this.financialTransactions;
  }

  public createFinancialTransaction(data: {
    type: 'EXPENSE' | 'BUYER_RECEIVABLE' | 'SUPPLIER_PAYABLE';
    category: string;
    amount: number;
    currency: 'BDT' | 'USD';
    referencePoNumber?: string;
    description: string;
  }): FinancialTransaction {
    const newTxn: FinancialTransaction = {
      id: `txn-${Date.now()}`,
      txnNumber: `TXN-2026-${Date.now().toString().slice(-4)}`,
      type: data.type,
      category: data.category,
      amount: data.amount,
      currency: data.currency,
      referencePoNumber: data.referencePoNumber,
      description: data.description,
      status: 'APPROVED',
      date: new Date().toISOString().split('T')[0]
    };

    this.financialTransactions.unshift(newTxn);

    // If expense in BDT, update first cost center
    if (data.type === 'EXPENSE' && data.currency === 'BDT' && this.costCenters.length > 0) {
      this.costCenters[0].actualSpentBdt += data.amount;
    }

    return newTxn;
  }

  // Order Profitability & Net Margin Realization: Revenue - Total Costs = Net Profit
  public calculateOrderProfitability(poNumber: string): OrderProfitabilityAnalysis {
    const po = this.purchaseOrders.find(p => p.poNumber === poNumber) || this.purchaseOrders[0];
    const buyerName = po?.buyerName || 'H&M Hennes & Mauritz';
    const styleNumber = po?.styleNumber || 'TSH-2026-001';
    const orderQuantity = po?.orderQuantity || 5000;
    const unitPriceUsd = po?.unitPriceUsd || 8.50;

    const totalRevenueUsd = +(orderQuantity * unitPriceUsd).toFixed(2); // $42,500
    const totalFabricCostUsd = +(orderQuantity * 3.40).toFixed(2);     // $17,000
    const totalTrimsCostUsd = +(orderQuantity * 0.95).toFixed(2);      // $4,750
    const totalCmCostUsd = +(orderQuantity * 1.65).toFixed(2);         // $8,250
    const totalOverheadCostUsd = +(orderQuantity * 0.60).toFixed(2);   // $3,000
    const totalCostUsd = +(totalFabricCostUsd + totalTrimsCostUsd + totalCmCostUsd + totalOverheadCostUsd).toFixed(2); // $33,000
    const netProfitUsd = +(totalRevenueUsd - totalCostUsd).toFixed(2); // $9,500
    const netMarginPercentage = +((netProfitUsd / totalRevenueUsd) * 100).toFixed(1); // 22.4%

    return {
      poNumber: po?.poNumber || poNumber,
      buyerName,
      styleNumber,
      orderQuantity,
      unitPriceUsd,
      totalRevenueUsd,
      totalFabricCostUsd,
      totalTrimsCostUsd,
      totalCmCostUsd,
      totalOverheadCostUsd,
      totalCostUsd,
      netProfitUsd,
      netMarginPercentage,
      profitabilityRating: netMarginPercentage >= 15 ? 'OPTIMAL_HIGH' : netMarginPercentage >= 8 ? 'ACCEPTABLE' : 'LOW_MARGIN'
    };
  }

  // Compliance Audits
  public getAllComplianceAudits(): ComplianceAudit[] {
    return this.complianceAudits;
  }

  public createComplianceAudit(data: {
    standard: 'BSCI' | 'SEDEX_SMETA' | 'WRAP' | 'FIRE_BUILDING_SAFETY' | 'RSC_ACCORD';
    factoryId: string;
    auditorName: string;
    scorePercentage: number;
    findings?: Array<{
      clauseRef: string;
      description: string;
      severity: 'CRITICAL' | 'MAJOR' | 'MINOR';
      correctiveAction: string;
      deadline: string;
    }>;
  }): ComplianceAudit {
    const auditId = `aud-${Date.now()}`;
    const formattedFindings: ComplianceFinding[] = (data.findings || []).map((f, i) => ({
      ...f,
      id: `fnd-${auditId}-${i}`,
      auditId,
      status: 'OPEN'
    }));

    const overallRating: 'GREEN_COMPLIANT' | 'YELLOW_MINOR_CAPA' | 'RED_CRITICAL_SUSPENSION' = 
      data.scorePercentage >= 90 ? 'GREEN_COMPLIANT' : data.scorePercentage >= 75 ? 'YELLOW_MINOR_CAPA' : 'RED_CRITICAL_SUSPENSION';

    const newAudit: ComplianceAudit = {
      id: auditId,
      auditNumber: `AUD-${data.standard}-2026-${Date.now().toString().slice(-4)}`,
      standard: data.standard,
      factoryId: data.factoryId,
      auditorName: data.auditorName,
      auditDate: new Date().toISOString().split('T')[0],
      overallRating,
      scorePercentage: data.scorePercentage,
      findings: formattedFindings,
      status: overallRating === 'GREEN_COMPLIANT' ? 'CERTIFIED_CLOSED' : 'CAPA_REQUIRED'
    };

    this.complianceAudits.unshift(newAudit);
    return newAudit;
  }
}

export const store = new SystemStore();
