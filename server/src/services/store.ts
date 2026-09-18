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

    // Log system genesis
    this.addAuditLog({
      id: 'audit-001',
      userId: 'usr-admin-01',
      userEmail: 'admin@garmenterp.com',
      userName: 'Engr. Naimur Rahman',
      action: 'CREATE',
      entityName: 'SystemGenesis',
      entityId: 'SYSTEM-ROOT',
      newValues: { message: 'GarmentERP BD initialized with multi-tiered Bangladesh factory hierarchy and Phase 2 Merchandising models.' },
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
}

export const store = new SystemStore();
