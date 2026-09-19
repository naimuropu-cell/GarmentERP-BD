import { Request, Response } from 'express';
import { z } from 'zod';
import { store } from '../../services/store';

// ==========================================
// Phase 8: System Intelligence & Analytics Controller
// ==========================================

const SimulateAlertSchema = z.object({
  severity: z.enum(['CRITICAL', 'WARNING', 'INFO']),
  category: z.enum(['QUALITY', 'MACHINERY', 'SCM', 'LABOR', 'SHIPMENT']),
  sourceModule: z.string().min(1),
  title: z.string().min(3),
  message: z.string().min(5),
  referenceId: z.string().optional()
});

const AcknowledgeAlertSchema = z.object({
  alertId: z.string().min(1),
  acknowledgedBy: z.string().optional()
});

export const getOrderTraceability = async (req: Request, res: Response) => {
  try {
    const { poNumber } = req.params;
    if (!poNumber) {
      return res.status(400).json({ success: false, error: 'poNumber path parameter is required' });
    }

    const traceability = store.getOrderTraceability360(poNumber);
    return res.status(200).json({
      success: true,
      message: `Order 360° traceability retrieved for ${poNumber}`,
      data: traceability
    });
  } catch (err: any) {
    return res.status(404).json({ success: false, error: err.message });
  }
};

export const getExecutiveSummary = async (_req: Request, res: Response) => {
  try {
    const summary = store.getExecutiveBiSummary();
    return res.status(200).json({
      success: true,
      message: 'Executive Plant BI & OEE summary computed successfully',
      data: summary
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

export const getAlerts = async (req: Request, res: Response) => {
  try {
    const severity = req.query.severity as string | undefined;
    const alerts = store.getSystemAlerts(severity);
    return res.status(200).json({
      success: true,
      message: 'System alerts retrieved',
      data: alerts
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

export const acknowledgeAlert = async (req: Request, res: Response) => {
  try {
    const parsed = AcknowledgeAlertSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: parsed.error.issues });
    }

    const user = (req as any).user;
    const ackBy = parsed.data.acknowledgedBy || user?.name || user?.email || 'Operations Authority';
    const alert = store.acknowledgeAlert(parsed.data.alertId, ackBy);

    if (!alert) {
      return res.status(404).json({ success: false, error: 'Alert not found' });
    }

    return res.status(200).json({
      success: true,
      message: 'Alert acknowledged successfully',
      data: alert
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

export const simulateAlert = async (req: Request, res: Response) => {
  try {
    const parsed = SimulateAlertSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: parsed.error.issues });
    }

    const newAlert = store.createAlert(parsed.data);
    return res.status(201).json({
      success: true,
      message: 'Real-time alert dispatched and recorded in event stream',
      data: newAlert
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

export const getDefectsPareto = async (_req: Request, res: Response) => {
  try {
    const pareto = store.getDefectsPareto();
    return res.status(200).json({
      success: true,
      message: 'Top defect Pareto distribution retrieved',
      data: pareto
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

export const getFactoryComparison = async (_req: Request, res: Response) => {
  try {
    const comparison = store.getFactoryComparison();
    return res.status(200).json({
      success: true,
      message: 'Multi-factory benchmark comparison retrieved',
      data: comparison
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
};
