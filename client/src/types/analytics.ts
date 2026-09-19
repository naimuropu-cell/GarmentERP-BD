// ==========================================
// Phase 8: System Intelligence & Analytics Client Types
// ==========================================

export type MilestoneStatus = 'COMPLETED' | 'IN_PROGRESS' | 'PENDING' | 'FLAGGED';

export interface OrderMilestone {
  stageNumber: number;
  stageCode: string;
  stageName: string;
  department: string;
  status: MilestoneStatus;
  completedAt?: string;
  actor?: string;
  summary: string;
  metrics?: Record<string, any>;
  passedQualityGate: boolean;
}

export interface OrderTraceability360 {
  poNumber: string;
  buyerName: string;
  styleNumber: string;
  orderQuantity: number;
  unitPriceUsd: number;
  totalRevenueUsd: number;
  deliveryDate: string;
  currentStage: string;
  overallHealth: 'HEALTHY_ON_TRACK' | 'ACTION_REQUIRED' | 'DELAYED_RISK';
  milestones: OrderMilestone[];
  bottleneckAlert?: string;
}

export interface LineEfficiencyMetric {
  lineNumber: string;
  efficiencyPercent: number;
  outputPcs: number;
  targetPcs: number;
  dhuPercent: number;
}

export interface ExecutiveBiSummary {
  pipeline: {
    totalOrders: number;
    totalUnits: number;
    totalRevenueUsd: number;
    shippedOrders: number;
    activeProductionOrders: number;
  };
  efficiency: {
    overallOeePercentage: number;
    availabilityPercentage: number;
    performancePercentage: number;
    qualityPercentage: number;
    activeLinesCount: number;
    linesEfficiency: LineEfficiencyMetric[];
  };
  quality: {
    factoryDhuPercentage: number;
    aqlPassRatePercentage: number;
    reworkResolvedCount: number;
    capaActiveCount: number;
  };
  workforce: {
    enrolledEmployees: number;
    presentToday: number;
    attendanceRatePercentage: number;
    overtimeHoursToday: number;
  };
  machinery: {
    totalFleetMachines: number;
    operationalCount: number;
    breakdownCount: number;
    operationalUptimePercentage: number;
  };
  compliance: {
    rating: string;
    lastAuditScore: number;
    criticalFindings: number;
  };
}

export type AlertSeverity = 'CRITICAL' | 'WARNING' | 'INFO';
export type AlertCategory = 'QUALITY' | 'MACHINERY' | 'SCM' | 'LABOR' | 'SHIPMENT';

export interface SystemAlert {
  id: string;
  timestamp: string;
  severity: AlertSeverity;
  category: AlertCategory;
  sourceModule: string;
  title: string;
  message: string;
  referenceId?: string;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
}

export interface FactoryUnitComparison {
  unitName: string;
  code: string;
  location: string;
  activeLines: number;
  dailyCapacityPcs: number;
  actualOutputPcs: number;
  efficiencyPercent: number;
  dhuPercent: number;
  operatorCount: number;
}

export interface DefectParetoItem {
  defectName: string;
  category: string;
  count: number;
  percentageOfTotal: number;
  affectedLines: string[];
}
