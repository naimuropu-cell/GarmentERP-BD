export interface BuyerContact {
  id: string;
  name: string;
  email: string;
  phone: string;
  designation: string;
}

export interface Buyer {
  id: string;
  name: string;
  code: string;
  country: string;
  currency: 'USD' | 'EUR' | 'GBP' | 'BDT';
  paymentTerms: string;
  shippingTerms: 'FOB' | 'CIF' | 'CFR' | 'DDP';
  portOfDischarge: string;
  contacts: BuyerContact[];
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
}

export interface MeasurementSpec {
  pointOfMeasure: string;
  code: string;
  tolerancePlusCm: number;
  toleranceMinusCm: number;
  specsBySize: Record<string, number>;
}

export interface TechPackVersion {
  version: string;
  revisionDate: string;
  createdBy: string;
  isApproved: boolean;
  fabricSpecs: {
    composition: string;
    construction: string;
    weightGsm: number;
    yarnCount: string;
    finishingWash: string;
  };
  stitchSpecs: string;
  washingInstructions: string;
  artworkNotes: string;
  measurements: MeasurementSpec[];
}

export interface GarmentStyle {
  id: string;
  buyerId: string;
  buyerName: string;
  styleNumber: string;
  styleName: string;
  season: string;
  productCategory: string;
  garmentType: string;
  brand: string;
  availableColors: string[];
  availableSizes: string[];
  activeTechPackVersion: string;
  techPackVersions: TechPackVersion[];
  createdAt: string;
}

export interface CostingItem {
  category: 'FABRIC' | 'TRIMS' | 'ACCESSORIES' | 'CM' | 'WASHING' | 'OVERHEAD' | 'PROFIT';
  description: string;
  unit: string;
  consumptionPerPc: number;
  unitPriceUsd: number;
  totalCostUsd: number;
}

export interface CostingSheet {
  id: string;
  styleId: string;
  styleNumber: string;
  version: number;
  currency: 'USD' | 'EUR' | 'BDT';
  items: CostingItem[];
  materialCostUsd: number;
  productionCostUsd: number;
  overheadCostUsd: number;
  totalCostUsd: number;
  offeredPriceUsd: number;
  profitMarginUsd: number;
  profitMarginPercent: number;
  status: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';
  approvedBy?: string;
  updatedAt: string;
}

export interface BOMItem {
  id: string;
  itemType: 'FABRIC' | 'TRIM' | 'ACCESSORY' | 'PACKAGING';
  itemName: string;
  specification: string;
  unit: string;
  consumptionPerPiece: number;
  wastagePercent: number;
  totalRequiredQty: number;
  availableStockQty: number;
  allocatedStockQty: number;
  shortageQty: number;
  procurementStatus: 'IN_STOCK' | 'PARTIAL' | 'SHORTAGE';
}

export type POStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'APPROVED'
  | 'IN_PRODUCTION'
  | 'PACKED'
  | 'SHIPPED'
  | 'COMPLETED'
  | 'CANCELLED';

export interface POColorSizeQuantity {
  color: string;
  size: string;
  quantity: number;
}

export interface BuyerPurchaseOrder {
  id: string;
  poNumber: string;
  buyerId: string;
  buyerName: string;
  styleId: string;
  styleNumber: string;
  styleName: string;
  factoryId: string;
  factoryName: string;
  orderQuantity: number;
  unitPriceUsd: number;
  totalOrderValueUsd: number;
  orderDate: string;
  exFactoryDeliveryDate: string;
  status: POStatus;
  colorSizeBreakdown: POColorSizeQuantity[];
  bom: BOMItem[];
  costingId?: string;
  createdAt: string;
  updatedAt: string;
}
