import { Request, Response } from 'express';
import { z } from 'zod';
import { AuthenticatedRequest } from '../../middleware/auth';
import { store } from '../../services/store';
import { BOMItem, POColorSizeQuantity, POStatus } from '../../types/merchandising';

// Validators
export const createBuyerSchema = z.object({
  name: z.string().min(2, 'Buyer name is required'),
  code: z.string().min(2, 'Buyer code is required'),
  country: z.string().min(2, 'Country is required'),
  currency: z.enum(['USD', 'EUR', 'GBP', 'BDT']).default('USD'),
  paymentTerms: z.string().default('LC at sight'),
  shippingTerms: z.enum(['FOB', 'CIF', 'CFR', 'DDP']).default('FOB'),
  portOfDischarge: z.string().default('Port of Hamburg'),
  contacts: z.array(z.object({
    name: z.string(),
    email: z.string().email(),
    phone: z.string(),
    designation: z.string()
  })).default([])
});

export const createStyleSchema = z.object({
  buyerId: z.string(),
  styleNumber: z.string().min(2, 'Style number is required'),
  styleName: z.string().min(2, 'Style description is required'),
  season: z.string().default('Summer 2026'),
  productCategory: z.string().default('Knitwear'),
  garmentType: z.string().default('Polo Shirt'),
  brand: z.string().default('Basic Brand'),
  availableColors: z.array(z.string()).min(1),
  availableSizes: z.array(z.string()).min(1)
});

export const createPOSchema = z.object({
  poNumber: z.string().min(2, 'PO number is required'),
  buyerId: z.string(),
  styleId: z.string(),
  factoryId: z.string().optional(),
  unitPriceUsd: z.number().positive(),
  exFactoryDeliveryDate: z.string(),
  colorSizeBreakdown: z.array(z.object({
    color: z.string(),
    size: z.string(),
    quantity: z.number().positive()
  })).min(1)
});

export const createCostingSchema = z.object({
  styleId: z.string(),
  currency: z.enum(['USD', 'EUR', 'BDT']).default('USD'),
  items: z.array(z.object({
    category: z.enum(['FABRIC', 'TRIMS', 'ACCESSORIES', 'CM', 'WASHING', 'OVERHEAD', 'PROFIT']),
    description: z.string(),
    unit: z.string(),
    consumptionPerPc: z.number(),
    unitPriceUsd: z.number(),
    totalCostUsd: z.number()
  })).min(1),
  offeredPriceUsd: z.number().positive()
});

export class MerchandisingController {
  // 1. Buyers
  public static async getBuyers(req: Request, res: Response) {
    const buyers = store.getAllBuyers();
    return res.status(200).json({ success: true, data: buyers });
  }

  public static async getBuyerById(req: Request, res: Response) {
    const { id } = req.params;
    const buyer = store.getBuyerById(id);
    if (!buyer) {
      return res.status(404).json({ success: false, error: { code: 'BUYER_NOT_FOUND', message: `Buyer [${id}] not found` } });
    }
    return res.status(200).json({ success: true, data: buyer });
  }

  public static async createBuyer(req: AuthenticatedRequest, res: Response) {
    const validation = createBuyerSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', details: validation.error.format() } });
    }

    const newBuyer = store.createBuyer({
      ...validation.data,
      contacts: validation.data.contacts.map((c, i) => ({ ...c, id: `cnt-${Date.now()}-${i}` })),
      status: 'ACTIVE'
    });

    store.addAuditLog({
      id: `audit-${Date.now()}`,
      userId: req.user?.id || null,
      userEmail: req.user?.email,
      userName: req.user?.fullName,
      action: 'CREATE',
      entityName: 'Buyer',
      entityId: newBuyer.id,
      newValues: { buyerName: newBuyer.name, country: newBuyer.country },
      timestamp: new Date().toISOString()
    });

    return res.status(201).json({ success: true, data: newBuyer });
  }

  // 2. Styles & Tech Packs
  public static async getStyles(req: Request, res: Response) {
    const styles = store.getAllStyles();
    return res.status(200).json({ success: true, data: styles });
  }

  public static async getStyleById(req: Request, res: Response) {
    const { id } = req.params;
    const style = store.getStyleById(id);
    if (!style) {
      return res.status(404).json({ success: false, error: { code: 'STYLE_NOT_FOUND', message: `Style [${id}] not found` } });
    }
    return res.status(200).json({ success: true, data: style });
  }

  public static async createStyle(req: AuthenticatedRequest, res: Response) {
    const validation = createStyleSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', details: validation.error.format() } });
    }

    const buyer = store.getBuyerById(validation.data.buyerId);
    if (!buyer) {
      return res.status(404).json({ success: false, error: { code: 'BUYER_NOT_FOUND', message: 'Assigned buyer not found' } });
    }

    const defaultTechPack = {
      version: 'v1.0',
      revisionDate: new Date().toISOString(),
      createdBy: req.user?.fullName || 'Merchandiser',
      isApproved: false,
      fabricSpecs: {
        composition: '100% Combed Cotton',
        construction: 'Single Jersey',
        weightGsm: 180,
        yarnCount: '26/1 Ne',
        finishingWash: 'Bio-wash Softener'
      },
      stitchSpecs: '12-14 SPI, Twin needle bottom hem',
      washingInstructions: 'Machine wash warm 40C, do not bleach',
      artworkNotes: 'Main neck label + side seam wash care label',
      measurements: [
        { pointOfMeasure: '1/2 Chest width (armhole)', code: 'CHEST', tolerancePlusCm: 1.0, toleranceMinusCm: 1.0, specsBySize: { S: 50, M: 53, L: 56, XL: 59 } },
        { pointOfMeasure: 'Total body length from HPS', code: 'LENGTH', tolerancePlusCm: 1.5, toleranceMinusCm: 1.5, specsBySize: { S: 70, M: 72, L: 74, XL: 76 } }
      ]
    };

    const newStyle = store.createStyle({
      ...validation.data,
      buyerName: buyer.name,
      activeTechPackVersion: 'v1.0',
      techPackVersions: [defaultTechPack]
    });

    store.addAuditLog({
      id: `audit-${Date.now()}`,
      userId: req.user?.id || null,
      userEmail: req.user?.email,
      userName: req.user?.fullName,
      action: 'CREATE',
      entityName: 'GarmentStyle',
      entityId: newStyle.id,
      newValues: { styleNumber: newStyle.styleNumber, buyerName: buyer.name },
      timestamp: new Date().toISOString()
    });

    return res.status(201).json({ success: true, data: newStyle });
  }

  // 3. Costing & Margin Control
  public static async getCostingSheets(req: Request, res: Response) {
    const sheets = store.getAllCostingSheets();
    return res.status(200).json({ success: true, data: sheets });
  }

  public static async createCostingSheet(req: AuthenticatedRequest, res: Response) {
    const validation = createCostingSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', details: validation.error.format() } });
    }

    const { styleId, currency, items, offeredPriceUsd } = validation.data;
    const style = store.getStyleById(styleId);
    if (!style) {
      return res.status(404).json({ success: false, error: { code: 'STYLE_NOT_FOUND', message: 'Style not found' } });
    }

    let materialCost = 0;
    let prodCost = 0;
    let overhead = 0;

    items.forEach(it => {
      if (['FABRIC', 'TRIMS', 'ACCESSORIES'].includes(it.category)) {
        materialCost += it.totalCostUsd;
      } else if (['CM', 'WASHING'].includes(it.category)) {
        prodCost += it.totalCostUsd;
      } else {
        overhead += it.totalCostUsd;
      }
    });

    const totalCost = materialCost + prodCost + overhead;
    const profitMargin = offeredPriceUsd - totalCost;
    const profitMarginPercent = Number(((profitMargin / offeredPriceUsd) * 100).toFixed(2));

    const newSheet = store.createCostingSheet({
      styleId,
      styleNumber: style.styleNumber,
      version: 1,
      currency,
      items,
      materialCostUsd: Number(materialCost.toFixed(3)),
      productionCostUsd: Number(prodCost.toFixed(3)),
      overheadCostUsd: Number(overhead.toFixed(3)),
      totalCostUsd: Number(totalCost.toFixed(3)),
      offeredPriceUsd,
      profitMarginUsd: Number(profitMargin.toFixed(3)),
      profitMarginPercent,
      status: 'DRAFT'
    });

    store.addAuditLog({
      id: `audit-${Date.now()}`,
      userId: req.user?.id || null,
      userEmail: req.user?.email,
      userName: req.user?.fullName,
      action: 'CREATE',
      entityName: 'CostingSheet',
      entityId: newSheet.id,
      newValues: { styleNumber: style.styleNumber, offeredPrice: offeredPriceUsd, margin: profitMarginPercent },
      timestamp: new Date().toISOString()
    });

    return res.status(201).json({ success: true, data: newSheet });
  }

  public static async approveCostingSheet(req: AuthenticatedRequest, res: Response) {
    const { id } = req.params;
    const approved = store.approveCostingSheet(id, req.user?.fullName || 'Management');
    if (!approved) {
      return res.status(404).json({ success: false, error: { code: 'COSTING_NOT_FOUND', message: 'Costing sheet not found' } });
    }

    store.addAuditLog({
      id: `audit-${Date.now()}`,
      userId: req.user?.id || null,
      userEmail: req.user?.email,
      userName: req.user?.fullName,
      action: 'APPROVAL',
      entityName: 'CostingSheet',
      entityId: id,
      newValues: { status: 'APPROVED', approvedBy: approved.approvedBy },
      timestamp: new Date().toISOString()
    });

    return res.status(200).json({ success: true, message: 'Costing approved successfully', data: approved });
  }

  // 4. Buyer Purchase Orders & BOM / MRP
  public static async getPurchaseOrders(req: Request, res: Response) {
    const orders = store.getAllPurchaseOrders();
    return res.status(200).json({ success: true, data: orders });
  }

  public static async getPurchaseOrderById(req: Request, res: Response) {
    const { id } = req.params;
    const po = store.getPurchaseOrderById(id);
    if (!po) {
      return res.status(404).json({ success: false, error: { code: 'PO_NOT_FOUND', message: `PO [${id}] not found` } });
    }
    return res.status(200).json({ success: true, data: po });
  }

  public static async createPurchaseOrder(req: AuthenticatedRequest, res: Response) {
    const validation = createPOSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', details: validation.error.format() } });
    }

    const { poNumber, buyerId, styleId, factoryId, unitPriceUsd, exFactoryDeliveryDate, colorSizeBreakdown } = validation.data;
    const buyer = store.getBuyerById(buyerId);
    const style = store.getStyleById(styleId);

    if (!buyer || !style) {
      return res.status(404).json({ success: false, error: { code: 'RELATION_NOT_FOUND', message: 'Buyer or Style not found' } });
    }

    const totalQty = colorSizeBreakdown.reduce((acc, it) => acc + it.quantity, 0);
    const totalValue = totalQty * unitPriceUsd;

    const defaultFactory = store.getFactories()[0];
    const resolvedFactoryId = factoryId || defaultFactory.id;
    const resolvedFactory = store.getFactoryById(resolvedFactoryId) || defaultFactory;

    // Automatic BOM & MRP Calculation based on Style parameters
    const fabricPerPc = 0.85; // KG
    const fabricWastage = 1.05; // 5%
    const totalFabricReq = Math.round(totalQty * fabricPerPc * fabricWastage);
    const availableFabric = 4000;
    const fabricShortage = Math.max(0, totalFabricReq - availableFabric);

    const labelsReq = Math.round(totalQty * 1.03); // 3% extra
    const availableLabels = 10000;
    const labelShortage = Math.max(0, labelsReq - availableLabels);

    const buttonsReq = Math.round(totalQty * 3 * 1.05);
    const availableButtons = 15000;
    const buttonShortage = Math.max(0, buttonsReq - availableButtons);

    const bom: BOMItem[] = [
      {
        id: `bom-${Date.now()}-1`,
        itemType: 'FABRIC',
        itemName: `${style.garmentType} Shell Fabric (100% Cotton)`,
        specification: 'Honey-comb knit 185 GSM',
        unit: 'KG',
        consumptionPerPiece: fabricPerPc,
        wastagePercent: 5.0,
        totalRequiredQty: totalFabricReq,
        availableStockQty: availableFabric,
        allocatedStockQty: Math.min(availableFabric, totalFabricReq),
        shortageQty: fabricShortage,
        procurementStatus: fabricShortage > 0 ? 'SHORTAGE' : 'IN_STOCK'
      },
      {
        id: `bom-${Date.now()}-2`,
        itemType: 'TRIM',
        itemName: `Main Woven Brand Label (${buyer.code})`,
        specification: 'High definition damask weave',
        unit: 'PCS',
        consumptionPerPiece: 1.0,
        wastagePercent: 3.0,
        totalRequiredQty: labelsReq,
        availableStockQty: availableLabels,
        allocatedStockQty: Math.min(availableLabels, labelsReq),
        shortageQty: labelShortage,
        procurementStatus: labelShortage > 0 ? 'SHORTAGE' : 'IN_STOCK'
      },
      {
        id: `bom-${Date.now()}-3`,
        itemType: 'ACCESSORY',
        itemName: '18L 2-Hole Pearl Button',
        specification: 'Laser engraved',
        unit: 'PCS',
        consumptionPerPiece: 3.0,
        wastagePercent: 5.0,
        totalRequiredQty: buttonsReq,
        availableStockQty: availableButtons,
        allocatedStockQty: Math.min(availableButtons, buttonsReq),
        shortageQty: buttonShortage,
        procurementStatus: buttonShortage > 0 ? 'SHORTAGE' : 'IN_STOCK'
      }
    ];

    const newPO = store.createPurchaseOrder({
      poNumber,
      buyerId,
      buyerName: buyer.name,
      styleId,
      styleNumber: style.styleNumber,
      styleName: style.styleName,
      factoryId: resolvedFactory.id,
      factoryName: resolvedFactory.name,
      orderQuantity: totalQty,
      unitPriceUsd,
      totalOrderValueUsd: totalValue,
      orderDate: new Date().toISOString().split('T')[0],
      exFactoryDeliveryDate,
      status: 'APPROVED',
      colorSizeBreakdown,
      bom
    });

    store.addAuditLog({
      id: `audit-${Date.now()}`,
      userId: req.user?.id || null,
      userEmail: req.user?.email,
      userName: req.user?.fullName,
      action: 'CREATE',
      entityName: 'PurchaseOrder',
      entityId: newPO.id,
      newValues: { poNumber: newPO.poNumber, orderQuantity: totalQty, value: totalValue },
      timestamp: new Date().toISOString()
    });

    return res.status(201).json({ success: true, data: newPO });
  }

  public static async updatePOStatus(req: AuthenticatedRequest, res: Response) {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses: POStatus[] = ['DRAFT', 'SUBMITTED', 'APPROVED', 'IN_PRODUCTION', 'PACKED', 'SHIPPED', 'COMPLETED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, error: { code: 'INVALID_STATUS', message: `Status [${status}] is invalid.` } });
    }

    const updated = store.updatePOStatus(id, status);
    if (!updated) {
      return res.status(404).json({ success: false, error: { code: 'PO_NOT_FOUND', message: 'PO not found' } });
    }

    store.addAuditLog({
      id: `audit-${Date.now()}`,
      userId: req.user?.id || null,
      userEmail: req.user?.email,
      userName: req.user?.fullName,
      action: 'UPDATE',
      entityName: 'PurchaseOrder',
      entityId: id,
      newValues: { newStatus: status },
      timestamp: new Date().toISOString()
    });

    return res.status(200).json({ success: true, data: updated });
  }
}
