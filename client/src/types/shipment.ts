export type ShipmentStatus = 
  | 'PLANNED' 
  | 'DOCS_PREPARED' 
  | 'GATE_OUT' 
  | 'IN_TRANSIT' 
  | 'PORT_DELIVERED' 
  | 'CUSTOMS_CLEARED' 
  | 'COMPLETED' 
  | 'CANCELLED';

export type Incoterm = 'FOB' | 'CIF' | 'CFR' | 'DDP' | 'EXW';

export type ContainerType = '20FT_FCL' | '40FT_FCL' | '40FT_HQ' | 'LCL';

export interface CommercialInvoice {
  id: string;
  invoiceNumber: string;
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
  totalAmount: number;
  paymentTerms: string;
  commercialOfficerSignoff: string;
  createdAt: string;
}

export interface PackingListCartonItem {
  cartonRange: string;
  sizeRatio: string;
  pcsPerCarton: number;
  totalCartons: number;
  totalPcs: number;
  grossWeightKg: number;
  netWeightKg: number;
  dimensionsCm: string;
  cbm: number;
}

export interface PackingList {
  id: string;
  packingListNumber: string;
  poId: string;
  poNumber: string;
  invoiceNumber: string;
  totalCartons: number;
  totalGrossWeightKg: number;
  totalNetWeightKg: number;
  totalCbm: number;
  containerType: ContainerType;
  containerNumber: string;
  sealNumber: string;
  cartonBreakdown: PackingListCartonItem[];
  createdAt: string;
}

export type GatePassStatus = 'PENDING_EXIT' | 'DISPATCHED_GATE_OUT' | 'DELIVERED';

export interface SecurityGatePass {
  id: string;
  gatePassNumber: string;
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
  status: GatePassStatus;
  exitTimestamp?: string;
  createdAt: string;
}

export interface Shipment {
  id: string;
  shipmentTrackingNumber: string;
  poId: string;
  poNumber: string;
  buyerId: string;
  buyerName: string;
  styleNumber: string;
  orderQuantity: number;
  shippedQuantity: number;
  aqlCertificateNumber: string;
  aqlOverallResult: 'ACCEPTED_PASS' | 'REJECTED_FAIL';
  commercialInvoice?: CommercialInvoice;
  packingList?: PackingList;
  gatePass?: SecurityGatePass;
  status: ShipmentStatus;
  vesselOrFlight: string;
  etd: string;
  eta: string;
  createdAt: string;
  updatedAt: string;
}
