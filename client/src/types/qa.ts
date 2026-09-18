export type FourPointPenaltyGrade = 'FIRST_QUALITY_PASS' | 'WARNING_ACCEPTABLE' | 'REJECTED';

export interface Fabric4PointInspection {
  id: string;
  rollNumber: string;
  fabricLot: string;
  fabricType: string;
  inspectedLengthYards: number;
  fabricWidthInches: number;
  defectsSize1Count: number; // up to 3 inches: 1 point
  defectsSize2Count: number; // 3 to 6 inches: 2 points
  defectsSize3Count: number; // 6 to 9 inches: 3 points
  defectsSize4Count: number; // over 9 inches or holes: 4 points
  totalDefectPoints: number;
  pointsPer100SqYards: number; // (Total Points * 3600) / (Inspected Yards * Width Inches)
  penaltyGrade: FourPointPenaltyGrade;
  inspectorName: string;
  inspectedAt: string;
  comments?: string;
}

export type DefectSeverity = 'CRITICAL' | 'MAJOR' | 'MINOR';

export type GarmentZone = 'COLLAR' | 'ARMHOLE' | 'PLACKET' | 'HEM' | 'SIDE_SEAM' | 'CUFF';

export interface SewingDefectRecord {
  id: string;
  inspectionType: 'INLINE' | 'ENDLINE';
  lineId: string;
  lineNumber: string;
  styleNumber: string;
  poNumber: string;
  defectCode: string;
  defectName: string;
  severity: DefectSeverity;
  zone: GarmentZone;
  operatorStation?: string;
  inspectorName: string;
  inspectedGarments: number;
  defectQty: number;
  dhuPercent: number; // (defectQty / inspectedGarments) * 100
  timestamp: string;
  status: 'OPEN' | 'REWORK_ISSUED' | 'RESOLVED';
}

export type ReworkStatus = 'PENDING_REWORK' | 'IN_REPAIR' | 'RE_INSPECTED_PASS' | 'SCRAPPED_B_GRADE';

export interface ReworkOrder {
  id: string;
  reworkNumber: string;
  defectId: string;
  defectName: string;
  severity: DefectSeverity;
  poNumber: string;
  styleNumber: string;
  lineId: string;
  lineNumber: string;
  quarantineQty: number;
  repairedQty: number;
  scrappedQty: number;
  assignedRepairOperator: string;
  status: ReworkStatus;
  notes?: string;
  createdAt: string;
  completedAt?: string;
}

export type CapaCategory = 'MACHINE' | 'METHOD_TRAINING' | 'MATERIAL' | 'MANPOWER';

export type CapaStatus = 'DRAFT' | 'UNDER_REVIEW' | 'APPROVED_ACTIVE' | 'VERIFIED_CLOSED';

export interface CapaRecord {
  id: string;
  capaNumber: string;
  title: string;
  issueDescription: string;
  lineId: string;
  lineNumber: string;
  defectType: string;
  why1: string;
  why2: string;
  why3: string;
  why4: string;
  why5RootCause: string;
  category: CapaCategory;
  correctiveAction: string;
  preventiveAction: string;
  assignedTo: string;
  targetClosureDate: string;
  status: CapaStatus;
  qaManagerApproval?: {
    approvedBy: string;
    approvedAt: string;
    signature: string;
  };
  createdAt: string;
}

export type AqlInspectionResult = 'ACCEPTED_PASS' | 'REJECTED_FAIL';

export interface AqlSamplingInspection {
  id: string;
  certificateNumber: string;
  poNumber: string;
  buyerPo: string;
  buyerName: string;
  styleNumber: string;
  totalLotSize: number;
  generalInspectionLevel: 'LEVEL_I' | 'LEVEL_II' | 'LEVEL_III';
  sampleSizeCodeLetter: string;
  sampleSize: number;
  criticalAql: number;
  criticalAc: number;
  criticalRe: number;
  criticalDefectsFound: number;
  majorAql: number;
  majorAc: number;
  majorRe: number;
  majorDefectsFound: number;
  minorAql: number;
  minorAc: number;
  minorRe: number;
  minorDefectsFound: number;
  overallResult: AqlInspectionResult;
  qaManagerSignoff: string;
  inspectionDate: string;
}
