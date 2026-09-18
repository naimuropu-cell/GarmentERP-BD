import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../../middleware/auth';
import { store } from '../../services/store';

export class ProductionController {
  // ==========================================
  // 1. Fabric Relaxation Tracking (24h Countdown)
  // ==========================================
  public static getFabricRelaxations(req: Request, res: Response) {
    try {
      const records = store.getAllFabricRelaxations();
      return res.status(200).json({
        success: true,
        data: records,
        count: records.length
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        error: { code: 'SERVER_ERROR', message: err.message }
      });
    }
  }

  public static startFabricRelaxation(req: Request, res: Response) {
    try {
      const { rollNumber, fabricLot, fabricType, color, weightGsm, rollLengthMeters, warehouseBin, durationHours, notes } = req.body;

      if (!rollNumber || !fabricLot || !fabricType) {
        return res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_FAILED', message: 'Roll number, fabric lot, and fabric type are required.' }
        });
      }

      const authReq = req as AuthenticatedRequest;
      const record = store.startFabricRelaxation({
        rollNumber,
        fabricLot,
        fabricType,
        color: color || 'White',
        weightGsm: Number(weightGsm) || 180,
        rollLengthMeters: Number(rollLengthMeters) || 100,
        warehouseBin: warehouseBin || 'RACK-01',
        startTime: new Date().toISOString(),
        durationHours: Number(durationHours) || 24,
        inspectedBy: authReq.user?.fullName || 'Cutting Master',
        notes: notes || '24h tension relaxation before spreading lay'
      });

      return res.status(201).json({
        success: true,
        data: record,
        message: `Fabric roll ${record.rollNumber} entered 24h relaxation cycle.`
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        error: { code: 'SERVER_ERROR', message: err.message }
      });
    }
  }

  public static completeFabricRelaxation(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const record = store.completeFabricRelaxation(id);
      if (!record) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: `Relaxation record ${id} not found.` }
        });
      }

      return res.status(200).json({
        success: true,
        data: record,
        message: `Fabric roll ${record.rollNumber} relaxation verified and certified READY FOR CUT.`
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        error: { code: 'SERVER_ERROR', message: err.message }
      });
    }
  }

  // ==========================================
  // 2. Cut Orders & Bundles
  // ==========================================
  public static getCutOrders(req: Request, res: Response) {
    try {
      const orders = store.getAllCutOrders();
      return res.status(200).json({
        success: true,
        data: orders,
        count: orders.length
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        error: { code: 'SERVER_ERROR', message: err.message }
      });
    }
  }

  public static getCutOrderById(req: Request, res: Response) {
    try {
      const order = store.getCutOrderById(req.params.id);
      if (!order) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: `Cut order ${req.params.id} not found.` }
        });
      }
      return res.status(200).json({
        success: true,
        data: order
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        error: { code: 'SERVER_ERROR', message: err.message }
      });
    }
  }

  public static createCutOrder(req: Request, res: Response) {
    try {
      const { cutNumber, poId, poNumber, buyerName, styleId, styleNumber, styleName, markerLengthMeters, pliesCount, markerEfficiencyPercent, colorSizeBreakdown, cuttingTableId, cuttingTableName } = req.body;

      if (!cutNumber || !poNumber || !styleNumber || !colorSizeBreakdown || !Array.isArray(colorSizeBreakdown)) {
        return res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_FAILED', message: 'Cut number, PO number, style number, and color-size matrix are required.' }
        });
      }

      const totalPlanned = colorSizeBreakdown.reduce((sum: number, cs: any) => sum + Number(cs.plannedPcs || 0), 0);
      const totalCut = colorSizeBreakdown.reduce((sum: number, cs: any) => sum + Number(cs.actualCutPcs || cs.plannedPcs || 0), 0);

      const authReq = req as AuthenticatedRequest;
      const newOrder = store.createCutOrder({
        cutNumber,
        poId: poId || 'po-2026-001',
        poNumber,
        buyerName: buyerName || 'Export Buyer',
        styleId: styleId || 'stl-polo-01',
        styleNumber,
        styleName: styleName || 'Polo Shirt',
        markerLengthMeters: Number(markerLengthMeters) || 8.0,
        pliesCount: Number(pliesCount) || 80,
        markerEfficiencyPercent: Number(markerEfficiencyPercent) || 88.5,
        totalPlannedPcs: totalPlanned,
        totalCutPcs: totalCut,
        cuttingTableId: cuttingTableId || 'line-cut-1',
        cuttingTableName: cuttingTableName || 'Cut Table 01 (Gerber Spreader)',
        status: 'PLANNED',
        colorSizeBreakdown: colorSizeBreakdown.map((cs: any) => ({
          color: cs.color,
          size: cs.size,
          plannedPcs: Number(cs.plannedPcs),
          actualCutPcs: Number(cs.actualCutPcs || cs.plannedPcs)
        })),
        cuttingSupervisor: authReq.user?.fullName || 'CAD & Cutting Master'
      });

      return res.status(201).json({
        success: true,
        data: newOrder,
        message: `Cut order ${newOrder.cutNumber} created for ${newOrder.totalPlannedPcs} pcs.`
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        error: { code: 'SERVER_ERROR', message: err.message }
      });
    }
  }

  public static generateBundles(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const bundleSize = Number(req.body.bundleSize) || 250;

      const bundles = store.generateBundlesForCutOrder(id, bundleSize);

      return res.status(201).json({
        success: true,
        data: bundles,
        count: bundles.length,
        message: `Successfully generated ${bundles.length} QR/Barcode bundle tickets for Cut Order.`
      });
    } catch (err: any) {
      return res.status(400).json({
        success: false,
        error: { code: 'BUNDLE_GENERATION_FAILED', message: err.message }
      });
    }
  }

  public static getBundles(req: Request, res: Response) {
    try {
      const bundles = store.getAllBundles();
      return res.status(200).json({
        success: true,
        data: bundles,
        count: bundles.length
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        error: { code: 'SERVER_ERROR', message: err.message }
      });
    }
  }

  // ==========================================
  // 3. Sewing Floor Monitoring & Hourly Tracking
  // ==========================================
  public static getSewingHourly(req: Request, res: Response) {
    try {
      const lineId = req.query.lineId as string | undefined;
      const outputs = store.getAllSewingOutputs(lineId);
      return res.status(200).json({
        success: true,
        data: outputs,
        count: outputs.length
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        error: { code: 'SERVER_ERROR', message: err.message }
      });
    }
  }

  public static recordSewingHourly(req: Request, res: Response) {
    try {
      const { lineId, lineNumber, hourSlot, styleNumber, poNumber, targetQty, actualQty, rejectedQty, operatorCount, helperCount, smv } = req.body;

      if (!lineId || !hourSlot || actualQty === undefined) {
        return res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_FAILED', message: 'Line ID, hour slot, and actual output quantity are required.' }
        });
      }

      const tQty = Number(targetQty) || 120;
      const aQty = Number(actualQty);
      const eff = tQty > 0 ? Number(((aQty / tQty) * 100).toFixed(1)) : 100.0;

      const authReq = req as AuthenticatedRequest;
      const log = store.recordSewingHourlyOutput({
        lineId,
        lineNumber: lineNumber || 'Sewing Line 01',
        date: new Date().toISOString().split('T')[0],
        hourSlot,
        styleNumber: styleNumber || 'TSH-2026-001',
        poNumber: poNumber || 'PO-2026-001',
        targetQty: tQty,
        actualQty: aQty,
        rejectedQty: Number(rejectedQty) || 0,
        efficiencyPercent: eff,
        operatorCount: Number(operatorCount) || 38,
        helperCount: Number(helperCount) || 10,
        smv: Number(smv) || 14.5,
        recordedBy: authReq.user?.fullName || 'Line Supervisor'
      });

      return res.status(201).json({
        success: true,
        data: log,
        message: `Hourly output for ${log.lineNumber} (${log.hourSlot}) recorded: ${log.actualQty} pcs (${log.efficiencyPercent}% efficiency).`
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        error: { code: 'SERVER_ERROR', message: err.message }
      });
    }
  }

  public static getSewingLinesSummary(req: Request, res: Response) {
    try {
      const summaries = store.getSewingLinesSummary();
      return res.status(200).json({
        success: true,
        data: summaries,
        count: summaries.length
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        error: { code: 'SERVER_ERROR', message: err.message }
      });
    }
  }

  // ==========================================
  // 4. Finishing & Packaging
  // ==========================================
  public static getFinishingBatches(req: Request, res: Response) {
    try {
      const batches = store.getAllFinishingBatches();
      return res.status(200).json({
        success: true,
        data: batches,
        count: batches.length
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        error: { code: 'SERVER_ERROR', message: err.message }
      });
    }
  }

  public static updateFinishingStage(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { stage, quantity } = req.body;

      if (!stage || !quantity || Number(quantity) <= 0) {
        return res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_FAILED', message: 'Finishing stage and valid quantity are required.' }
        });
      }

      const updated = store.updateFinishingStage(id, stage, Number(quantity));
      if (!updated) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: `Finishing batch ${id} not found.` }
        });
      }

      return res.status(200).json({
        success: true,
        data: updated,
        message: `Finishing batch ${updated.batchNumber} updated at stage ${stage}.`
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        error: { code: 'SERVER_ERROR', message: err.message }
      });
    }
  }

  public static getCartonRecords(req: Request, res: Response) {
    try {
      const cartons = store.getAllCartonRecords();
      return res.status(200).json({
        success: true,
        data: cartons,
        count: cartons.length
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        error: { code: 'SERVER_ERROR', message: err.message }
      });
    }
  }

  public static createCartonRecord(req: Request, res: Response) {
    try {
      const { cartonNumber, poNumber, buyerPo, styleNumber, color, sizeRatio, grossWeightKg, netWeightKg, cartonDimensionsCm, barcode } = req.body;

      if (!cartonNumber || !poNumber || !sizeRatio) {
        return res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_FAILED', message: 'Carton number, PO reference, and size ratio are required.' }
        });
      }

      const totalPcs = Object.values(sizeRatio as Record<string, number>).reduce((sum: number, qty: number) => sum + Number(qty), 0);

      const authReq = req as AuthenticatedRequest;
      const carton = store.createCartonRecord({
        cartonNumber,
        poNumber,
        buyerPo: buyerPo || 'BUYER-PO-991',
        styleNumber: styleNumber || 'TSH-2026-001',
        color: color || 'White',
        sizeRatio,
        totalPcsPerCarton: totalPcs,
        grossWeightKg: Number(grossWeightKg) || 14.0,
        netWeightKg: Number(netWeightKg) || 12.8,
        cartonDimensionsCm: cartonDimensionsCm || '60 x 40 x 30',
        barcode: barcode || `BC-CTN-${Date.now()}`,
        cbm: 0.072,
        packedBy: authReq.user?.fullName || 'Packing Supervisor',
        status: 'READY_FOR_SHIPMENT'
      });

      return res.status(201).json({
        success: true,
        data: carton,
        message: `Carton ${carton.cartonNumber} packed with ratio assortment (${carton.totalPcsPerCarton} pcs).`
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        error: { code: 'SERVER_ERROR', message: err.message }
      });
    }
  }
}
