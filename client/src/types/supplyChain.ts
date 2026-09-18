export interface Supplier {
  id: string;
  name: string;
  code: string;
  category: 'FABRIC' | 'TRIMS' | 'ACCESSORIES' | 'CHEMICALS' | 'PACKAGING';
  country: string;
  city: string;
  leadTimeDays: number;
  qualityRating: number;
  onTimeDeliveryRate: number;
  paymentTerms: string;
  contactPerson: string;
  email: string;
  phone: string;
  materialsSupplied: string[];
  status: 'ACTIVE' | 'ON_HOLD' | 'BLOCKED';
  createdAt: string;
}

export interface RequisitionItem {
  sku: string;
  itemName: string;
  unit: string;
  requiredQty: number;
  estimatedUnitPriceUsd: number;
  estimatedTotalUsd: number;
  neededByDate: string;
}

export interface PurchaseRequisition {
  id: string;
  prNumber: string;
  poNumber?: string;
  buyerName?: string;
  requestedBy: string;
  department: string;
  items: RequisitionItem[];
  totalEstimatedValueUsd: number;
  urgency: 'NORMAL' | 'HIGH' | 'CRITICAL';
  status: 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'ORDERED';
  approvedBy?: string;
  approvalDate?: string;
  createdAt: string;
}

export interface SupplierPurchaseOrder {
  id: string;
  spoNumber: string;
  prNumber: string;
  supplierId: string;
  supplierName: string;
  orderDate: string;
  expectedDeliveryDate: string;
  currency: 'USD' | 'EUR' | 'BDT';
  items: Array<{
    sku: string;
    itemName: string;
    unit: string;
    orderedQty: number;
    deliveredQty: number;
    unitPrice: number;
    totalPrice: number;
  }>;
  totalAmount: number;
  paymentTerms: string;
  status: 'ISSUED' | 'PARTIALLY_DELIVERED' | 'DELIVERED' | 'CANCELLED';
  createdAt: string;
}

export interface GRNItem {
  sku: string;
  itemName: string;
  orderedQty: number;
  receivedQty: number;
  acceptedQty: number;
  rejectedQty: number;
  unit: string;
  lotNumber: string;
  shadeBand?: string;
  binCode: string;
}

export interface GoodsReceivedNote {
  id: string;
  grnNumber: string;
  spoNumber: string;
  supplierName: string;
  warehouseId: string;
  warehouseName: string;
  receivedDate: string;
  vehicleNumber: string;
  challanNumber: string;
  driverName: string;
  qcInspectionStatus: 'PENDING_QC' | 'PASSED' | 'REJECTED';
  items: GRNItem[];
  receivedBy: string;
  createdAt: string;
}

export interface StockItem {
  id: string;
  sku: string;
  itemName: string;
  category: 'FABRIC' | 'TRIMS' | 'ACCESSORIES' | 'FINISHED_GOODS';
  warehouseId: string;
  warehouseName: string;
  binCode: string;
  lotNumber: string;
  shadeBand?: string;
  unit: string;
  totalQty: number;
  availableQty: number;
  reservedQty: number;
  quarantineQty: number;
  rejectedQty: number;
  reorderLevel: number;
  updatedAt: string;
}

export interface StockTransaction {
  id: string;
  transactionNumber: string;
  type: 'RECEIVE_GRN' | 'ISSUE_TO_LINE' | 'TRANSFER' | 'ADJUSTMENT' | 'RETURN_SUPPLIER';
  sku: string;
  itemName: string;
  fromWarehouse?: string;
  toWarehouse?: string;
  targetLine?: string;
  quantity: number;
  unit: string;
  referenceDoc: string;
  performedBy: string;
  reason: string;
  timestamp: string;
}
