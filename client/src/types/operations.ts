// ==========================================
// Phase 7: Factory Operations TypeScript Types (Client)
// ==========================================

// 1. HR & Biometric Attendance / Payroll
export type ShiftType = 'MORNING_GENERAL' | 'EVENING' | 'NIGHT';
export type AttendanceStatus = 'PRESENT' | 'LATE' | 'ABSENT' | 'ON_LEAVE';

export interface Employee {
  id: string;
  employeeCode: string;
  fullName: string;
  phone: string;
  departmentId: string;
  departmentName: string;
  designation: string;
  factoryId: string;
  shift: ShiftType;
  joinDate: string;
  baseSalaryBdt: number;
  status: 'ACTIVE' | 'ON_LEAVE' | 'TERMINATED';
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  date: string;
  checkIn: string;
  checkOut: string;
  status: AttendanceStatus;
  overtimeHours: number;
  biometricTerminalId: string;
}

export interface PayrollRecord {
  id: string;
  monthYear: string;
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  designation: string;
  baseSalaryBdt: number;
  overtimeHours: number;
  overtimeHourlyRateBdt: number;
  overtimePayBdt: number;
  attendanceBonusBdt: number;
  deductionsBdt: number;
  netPayableBdt: number;
  paymentStatus: 'PAID' | 'PENDING_APPROVAL';
  disbursedAt?: string;
}

// 2. Machine Maintenance & Assets
export type MachineType = 
  | 'LOCKSTITCH' 
  | 'OVERLOCK' 
  | 'FLATLOCK' 
  | 'BUTTON_HOLE' 
  | 'BAR_TACK' 
  | 'NEEDLE_DETECTOR' 
  | 'STEAM_PRESS';

export type MachineStatus = 
  | 'OPERATIONAL' 
  | 'UNDER_MAINTENANCE' 
  | 'BREAKDOWN_STOPPED' 
  | 'DECOMMISSIONED';

export interface MachineAsset {
  id: string;
  machineCode: string;
  brand: string;
  model: string;
  type: MachineType;
  factoryId: string;
  lineId: string;
  status: MachineStatus;
  lastMaintenanceDate: string;
  nextMaintenanceDueDate: string;
  totalDowntimeHours: number;
}

export type MaintenanceIssueType = 
  | 'NEEDLE_BAR_JAM' 
  | 'THREAD_TENSION_FAILURE' 
  | 'MOTOR_OVERHEAT' 
  | 'OIL_LEAKAGE' 
  | 'TIMING_BELT_SLIP' 
  | 'CALIBRATION_ERROR';

export interface MaintenanceTicket {
  id: string;
  ticketNumber: string;
  machineId: string;
  machineCode: string;
  lineId: string;
  issueType: MaintenanceIssueType;
  severity: 'CRITICAL_STOPPAGE' | 'MAJOR' | 'MINOR';
  reportedBy: string;
  assignedMechanic: string;
  downtimeMinutes: number;
  sparePartsReplaced: string;
  sparePartsCostBdt: number;
  status: 'OPEN' | 'IN_PROGRESS' | 'REPAIRED_TESTED' | 'CLOSED';
  reportedAt: string;
  resolvedAt?: string;
}

// 3. Operational Finance & Order Profitability
export interface CostCenter {
  id: string;
  code: string;
  name: string;
  factoryId: string;
  department: string;
  budgetBdt: number;
  actualSpentBdt: number;
}

export type TransactionType = 'EXPENSE' | 'BUYER_RECEIVABLE' | 'SUPPLIER_PAYABLE';

export interface FinancialTransaction {
  id: string;
  txnNumber: string;
  type: TransactionType;
  category: string;
  amount: number;
  currency: 'BDT' | 'USD';
  referencePoNumber?: string;
  description: string;
  status: 'PENDING' | 'APPROVED' | 'SETTLED';
  date: string;
}

export interface OrderProfitabilityAnalysis {
  poNumber: string;
  buyerName: string;
  styleNumber: string;
  orderQuantity: number;
  unitPriceUsd: number;
  totalRevenueUsd: number;
  totalFabricCostUsd: number;
  totalTrimsCostUsd: number;
  totalCmCostUsd: number;
  totalOverheadCostUsd: number;
  totalCostUsd: number;
  netProfitUsd: number;
  netMarginPercentage: number;
  profitabilityRating: 'OPTIMAL_HIGH' | 'ACCEPTABLE' | 'LOW_MARGIN' | 'LOSS_ALERT';
}

// 4. Social & Safety Compliance
export type AuditStandard = 
  | 'BSCI' 
  | 'SEDEX_SMETA' 
  | 'WRAP' 
  | 'FIRE_BUILDING_SAFETY' 
  | 'RSC_ACCORD';

export type AuditRating = 
  | 'GREEN_COMPLIANT' 
  | 'YELLOW_MINOR_CAPA' 
  | 'RED_CRITICAL_SUSPENSION';

export interface ComplianceFinding {
  id: string;
  auditId: string;
  clauseRef: string;
  description: string;
  severity: 'CRITICAL' | 'MAJOR' | 'MINOR';
  correctiveAction: string;
  deadline: string;
  status: 'OPEN' | 'RECTIFIED_VERIFIED';
}

export interface ComplianceAudit {
  id: string;
  auditNumber: string;
  standard: AuditStandard;
  factoryId: string;
  auditorName: string;
  auditDate: string;
  overallRating: AuditRating;
  scorePercentage: number;
  findings: ComplianceFinding[];
  status: 'SCHEDULED' | 'UNDER_EVALUATION' | 'CAPA_REQUIRED' | 'CERTIFIED_CLOSED';
}
