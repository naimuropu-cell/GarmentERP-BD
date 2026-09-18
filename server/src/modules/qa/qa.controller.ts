import { Request, Response } from 'express';
import { z } from 'zod';
import { store } from '../../services/store';

// Validation Schemas
const Fabric4PointSchema = z.object({
  rollNumber: z.string().min(1, 'Roll number is required'),
  fabricLot: z.string().min(1, 'Fabric lot is required'),
  fabricType: z.string().min(1, 'Fabric type is required'),
  inspectedLengthYards: z.number().positive('Inspected length must be > 0'),
  fabricWidthInches: z.number().positive('Fabric width must be > 0'),
  defectsSize1Count: z.number().min(0),
  defectsSize2Count: z.number().min(0),
  defectsSize3Count: z.number().min(0),
  defectsSize4Count: z.number().min(0),
  comments: z.string().optional()
});

const SewingDefectSchema = z.object({
  inspectionType: z.enum(['INLINE', 'ENDLINE']),
  lineId: z.string().min(1),
  lineNumber: z.string().min(1),
  styleNumber: z.string().min(1),
  poNumber: z.string().min(1),
  defectCode: z.string().min(1),
  defectName: z.string().min(1),
  severity: z.enum(['CRITICAL', 'MAJOR', 'MINOR']),
  zone: z.enum(['COLLAR', 'ARMHOLE', 'PLACKET', 'HEM', 'SIDE_SEAM', 'CUFF']),
  operatorStation: z.string().optional(),
  inspectedGarments: z.number().positive(),
  defectQty: z.number().min(1)
});

const ReworkStatusSchema = z.object({
  status: z.enum(['PENDING_REWORK', 'IN_REPAIR', 'RE_INSPECTED_PASS', 'SCRAPPED_B_GRADE']),
  repairedQty: z.number().min(0).optional(),
  scrappedQty: z.number().min(0).optional()
});

const CapaSchema = z.object({
  title: z.string().min(3),
  issueDescription: z.string().min(5),
  lineId: z.string().min(1),
  lineNumber: z.string().min(1),
  defectType: z.string().min(1),
  why1: z.string().min(1),
  why2: z.string().min(1),
  why3: z.string().min(1),
  why4: z.string().min(1),
  why5RootCause: z.string().min(1),
  category: z.enum(['MACHINE', 'METHOD_TRAINING', 'MATERIAL', 'MANPOWER']),
  correctiveAction: z.string().min(1),
  preventiveAction: z.string().min(1),
  assignedTo: z.string().min(1),
  targetClosureDate: z.string().min(1)
});

const AqlCalculationSchema = z.object({
  poNumber: z.string().min(1),
  buyerPo: z.string().min(1),
  buyerName: z.string().min(1),
  styleNumber: z.string().min(1),
  totalLotSize: z.number().positive(),
  generalInspectionLevel: z.enum(['LEVEL_I', 'LEVEL_II', 'LEVEL_III']).default('LEVEL_II'),
  criticalDefectsFound: z.number().min(0),
  majorDefectsFound: z.number().min(0),
  minorDefectsFound: z.number().min(0)
});

// 1. Fabric 4-Point System
export const getFabricInspections = (req: Request, res: Response) => {
  try {
    const list = store.getAllFabricInspections();
    res.status(200).json({ success: true, count: list.length, data: list });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
};

export const createFabricInspection = (req: Request, res: Response) => {
  try {
    const parsed = Fabric4PointSchema.parse(req.body);
    const inspectorName = (req as any).user?.fullName || 'Nazmul Haque (QC Fabric Inspector)';
    const record = store.createFabricInspection({
      ...parsed,
      inspectorName
    });

    res.status(201).json({
      success: true,
      message: `Fabric 4-point inspection recorded. Score: ${record.pointsPer100SqYards} pts/100 sq yds [${record.penaltyGrade}].`,
      data: record
    });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { message: err.errors.map(e => e.message).join(', ') } });
    }
    res.status(500).json({ success: false, error: { message: err.message } });
  }
};

// 2. Inline & End-line Sewing Defects
export const getSewingDefects = (req: Request, res: Response) => {
  try {
    const list = store.getAllSewingDefects();
    res.status(200).json({ success: true, count: list.length, data: list });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
};

export const createSewingDefect = (req: Request, res: Response) => {
  try {
    const parsed = SewingDefectSchema.parse(req.body);
    const inspectorName = (req as any).user?.fullName || 'QC Line Inspector';
    const record = store.createSewingDefect({
      ...parsed,
      inspectorName
    });

    res.status(201).json({
      success: true,
      message: `Defect logged with DHU ${record.dhuPercent}%. Status: ${record.status}`,
      data: record
    });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { message: err.errors.map(e => e.message).join(', ') } });
    }
    res.status(500).json({ success: false, error: { message: err.message } });
  }
};

// 3. Rework Orders
export const getReworkOrders = (req: Request, res: Response) => {
  try {
    const list = store.getAllReworkOrders();
    res.status(200).json({ success: true, count: list.length, data: list });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
};

export const updateReworkStatus = (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const parsed = ReworkStatusSchema.parse(req.body);
    const updated = store.updateReworkStatus(id, parsed.status, parsed.repairedQty, parsed.scrappedQty);

    if (!updated) {
      return res.status(404).json({ success: false, error: { message: 'Rework order not found' } });
    }

    res.status(200).json({
      success: true,
      message: `Rework order ${updated.reworkNumber} transitioned to ${updated.status}`,
      data: updated
    });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { message: err.errors.map(e => e.message).join(', ') } });
    }
    res.status(500).json({ success: false, error: { message: err.message } });
  }
};

// 4. CAPA 5-Whys Root Cause
export const getCapaRecords = (req: Request, res: Response) => {
  try {
    const list = store.getAllCapaRecords();
    res.status(200).json({ success: true, count: list.length, data: list });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
};

export const createCapaRecord = (req: Request, res: Response) => {
  try {
    const parsed = CapaSchema.parse(req.body);
    const record = store.createCapaRecord(parsed);
    res.status(201).json({
      success: true,
      message: `CAPA Root-Cause Investigation created (${record.capaNumber})`,
      data: record
    });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { message: err.errors.map(e => e.message).join(', ') } });
    }
    res.status(500).json({ success: false, error: { message: err.message } });
  }
};

export const verifyCapa = (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const qaManagerName = (req as any).user?.fullName || 'Farhana Akhter (QA Manager)';
    const signature = (req.body.signature as string) || 'FA-QA-DIR-SIGN';
    const record = store.verifyCapa(id, qaManagerName, signature);

    if (!record) {
      return res.status(404).json({ success: false, error: { message: 'CAPA record not found' } });
    }

    res.status(200).json({
      success: true,
      message: `CAPA ${record.capaNumber} approved and verified by QA Manager`,
      data: record
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
};

// 5. ISO 2859-1 / AQL 2.5 Sampling Inspections
export const getAqlInspections = (req: Request, res: Response) => {
  try {
    const list = store.getAllAqlInspections();
    res.status(200).json({ success: true, count: list.length, data: list });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
};

export const calculateAndCreateAqlSampling = (req: Request, res: Response) => {
  try {
    const parsed = AqlCalculationSchema.parse(req.body);
    const qaManagerSignoff = (req as any).user?.fullName || 'Farhana Akhter (Certified Lead Auditor)';

    const inspection = store.calculateAndCreateAqlSampling({
      ...parsed,
      qaManagerSignoff
    });

    res.status(201).json({
      success: true,
      message: `AQL 2.5 Audit Finalized: [${inspection.overallResult}]. Sample Size: ${inspection.sampleSize} pcs.`,
      data: inspection
    });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { message: err.errors.map(e => e.message).join(', ') } });
    }
    res.status(500).json({ success: false, error: { message: err.message } });
  }
};
