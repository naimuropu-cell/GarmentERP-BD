export interface FabricRelaxationRecord {
  id: string;
  rollNumber: string;
  fabricLot: string;
  fabricType: string;
  color: string;
  weightGsm: number;
  rollLengthMeters: number;
  warehouseBin: string;
  startTime: string;
  durationHours: number;
  targetReadyTime: string;
  status: 'RELAXING' | 'READY_FOR_CUT' | 'EXPIRED';
  inspectedBy: string;
  notes?: string;
}

export interface CutBundle {
  id: string;
  bundleNumber: string;
  cutNumber: string;
  poNumber: string;
  styleNumber: string;
  color: string;
  size: string;
  quantity: number;
  serialStart: number;
  serialEnd: number;
  barcode: string;
  assignedLineId?: string;
  assignedLineName?: string;
  status: 'GENERATED' | 'ISSUED_TO_SEWING' | 'IN_SEWING' | 'COMPLETED';
}

export interface CutOrderColorSize {
  color: string;
  size: string;
  plannedPcs: number;
  actualCutPcs: number;
}

export interface CutOrder {
  id: string;
  cutNumber: string;
  poId: string;
  poNumber: string;
  buyerName: string;
  styleId: string;
  styleNumber: string;
  styleName: string;
  markerLengthMeters: number;
  pliesCount: number;
  markerEfficiencyPercent: number;
  totalPlannedPcs: number;
  totalCutPcs: number;
  cuttingTableId: string;
  cuttingTableName: string;
  status: 'PLANNED' | 'SPREADING' | 'CUTTING' | 'COMPLETED';
  colorSizeBreakdown: CutOrderColorSize[];
  bundles: CutBundle[];
  cuttingSupervisor: string;
  createdAt: string;
  updatedAt: string;
}

export interface SewingHourlyOutput {
  id: string;
  lineId: string;
  lineNumber: string;
  date: string;
  hourSlot: string;
  styleNumber: string;
  poNumber: string;
  targetQty: number;
  actualQty: number;
  rejectedQty: number;
  efficiencyPercent: number;
  operatorCount: number;
  helperCount: number;
  smv: number;
  recordedBy: string;
  timestamp: string;
}

export interface SewingLineSummary {
  lineId: string;
  lineNumber: string;
  currentStyle: string;
  currentPo: string;
  targetPerHour: number;
  todayTargetTotal: number;
  todayActualTotal: number;
  todayRejectedTotal: number;
  overallEfficiencyPercent: number;
  operatorCount: number;
  helperCount: number;
  smv: number;
  status: 'RUNNING' | 'CHANGE_OVER' | 'MAINTENANCE_HOLD' | 'COMPLETED';
  hourlyLogs: SewingHourlyOutput[];
}

export interface FinishingBatch {
  id: string;
  batchNumber: string;
  poNumber: string;
  styleNumber: string;
  totalReceivedPcs: number;
  threadTrimmedPcs: number;
  steamIronedPcs: number;
  metalDetectedPcs: number;
  polybaggedPcs: number;
  rejectedPcs: number;
  status: 'IN_PROGRESS' | 'COMPLETED';
  updatedAt: string;
}

export interface CartonPackingRecord {
  id: string;
  cartonNumber: string;
  poNumber: string;
  buyerPo: string;
  styleNumber: string;
  color: string;
  sizeRatio: Record<string, number>;
  totalPcsPerCarton: number;
  grossWeightKg: number;
  netWeightKg: number;
  cartonDimensionsCm: string;
  barcode: string;
  cbm: number;
  packedBy: string;
  status: 'PACKED' | 'AUDITED' | 'READY_FOR_SHIPMENT';
  packedAt: string;
}
