import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../../middleware/auth';
import { store } from '../../services/store';

export class SupplyChainController {
  // ==========================================
  // 1. Supplier Directory
  // ==========================================
  public static getSuppliers(req: Request, res: Response) {
    try {
      const suppliers = store.getAllSuppliers();
      return res.status(200).json({
        success: true,
        data: suppliers,
        count: suppliers.length
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        error: { code: 'SERVER_ERROR', message: error.message }
      });
    }
  }

  public static getSupplierById(req: Request, res: Response) {
    try {
      const supplier = store.getSupplierById(req.params.id);
      if (!supplier) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: `Supplier ${req.params.id} not found.` }
        });
      }
      return res.status(200).json({
        success: true,
        data: supplier
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        error: { code: 'SERVER_ERROR', message: error.message }
      });
    }
  }

  public static createSupplier(req: Request, res: Response) {
    try {
      const { name, code, category, country, city, leadTimeDays, qualityRating, onTimeDeliveryRate, paymentTerms, contactPerson, email, phone, materialsSupplied } = req.body;

      if (!name || !code || !category || !leadTimeDays) {
        return res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_FAILED', message: 'Supplier name, code, category, and lead time are required.' }
        });
      }

      const supplier = store.createSupplier({
        name,
        code: code.toUpperCase(),
        category,
        country: country || 'Bangladesh',
        city: city || 'Dhaka',
        leadTimeDays: Number(leadTimeDays),
        qualityRating: Number(qualityRating) || 4.5,
        onTimeDeliveryRate: Number(onTimeDeliveryRate) || 95.0,
        paymentTerms: paymentTerms || 'LC 60 Days',
        contactPerson: contactPerson || 'Accounts Representative',
        email: email || 'contact@supplier.com',
        phone: phone || '+8801700000000',
        materialsSupplied: Array.isArray(materialsSupplied) ? materialsSupplied : [],
        status: 'ACTIVE'
      });

      const authReq = req as AuthenticatedRequest;
      store.addAuditLog({
        id: `audit-${Date.now()}`,
        userId: authReq.user?.id || 'system',
        userEmail: authReq.user?.email || 'admin@garmenterp.com',
        userName: authReq.user?.fullName || 'Commercial Officer',
        action: 'CREATE',
        entityName: 'Supplier',
        entityId: supplier.id,
        newValues: { name: supplier.name, code: supplier.code },
        timestamp: new Date().toISOString()
      });

      return res.status(201).json({
        success: true,
        data: supplier,
        message: 'Supplier successfully registered with vendor scorecards.'
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        error: { code: 'SERVER_ERROR', message: error.message }
      });
    }
  }

  // ==========================================
  // 2. Purchase Requisitions (PR)
  // ==========================================
  public static getRequisitions(req: Request, res: Response) {
    try {
      const requisitions = store.getAllPurchaseRequisitions();
      return res.status(200).json({
        success: true,
        data: requisitions,
        count: requisitions.length
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        error: { code: 'SERVER_ERROR', message: error.message }
      });
    }
  }

  public static createRequisition(req: Request, res: Response) {
    try {
      const { prNumber, poNumber, buyerName, items, urgency, department } = req.body;

      if (!prNumber || !items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_FAILED', message: 'PR Number and at least one item line are required.' }
        });
      }

      const totalEstimatedValueUsd = items.reduce((sum: number, it: any) => sum + (Number(it.estimatedTotalUsd) || (Number(it.requiredQty) * Number(it.estimatedUnitPriceUsd))), 0);

      const authReq = req as AuthenticatedRequest;
      const pr = store.createPurchaseRequisition({
        prNumber,
        poNumber,
        buyerName,
        requestedBy: authReq.user?.fullName || 'Merchandising Team',
        department: department || 'Merchandising & Planning',
        items,
        totalEstimatedValueUsd,
        urgency: urgency || 'NORMAL',
        status: 'PENDING_APPROVAL'
      });

      return res.status(201).json({
        success: true,
        data: pr,
        message: 'Purchase Requisition drafted and forwarded for management authorization.'
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        error: { code: 'SERVER_ERROR', message: error.message }
      });
    }
  }

  public static approveRequisition(req: Request, res: Response) {
    try {
      const authReq = req as AuthenticatedRequest;
      const { id } = req.params;
      const approvedBy = authReq.user?.fullName || 'General Manager (Factory Operations)';

      const updated = store.approvePurchaseRequisition(id, approvedBy);
      if (!updated) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: `Purchase Requisition ${id} not found.` }
        });
      }

      store.addAuditLog({
        id: `audit-${Date.now()}`,
        userId: authReq.user?.id || 'system',
        userEmail: authReq.user?.email || 'admin@garmenterp.com',
        userName: approvedBy,
        action: 'APPROVAL',
        entityName: 'PurchaseRequisition',
        entityId: id,
        newValues: { status: 'APPROVED', approvedBy },
        timestamp: new Date().toISOString()
      });

      return res.status(200).json({
        success: true,
        data: updated,
        message: `Purchase Requisition ${updated.prNumber} successfully approved for PO conversion.`
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        error: { code: 'SERVER_ERROR', message: error.message }
      });
    }
  }

  // ==========================================
  // 3. Supplier Purchase Orders (SPO)
  // ==========================================
  public static getSupplierPOs(req: Request, res: Response) {
    try {
      const spos = store.getAllSupplierPOs();
      return res.status(200).json({
        success: true,
        data: spos,
        count: spos.length
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        error: { code: 'SERVER_ERROR', message: error.message }
      });
    }
  }

  public static createSupplierPO(req: Request, res: Response) {
    try {
      const { spoNumber, prNumber, supplierId, supplierName, orderDate, expectedDeliveryDate, currency, items, paymentTerms } = req.body;

      if (!spoNumber || !prNumber || !supplierId || !items || !Array.isArray(items)) {
        return res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_FAILED', message: 'SPO Number, PR Reference, Supplier and line items are required.' }
        });
      }

      const totalAmount = items.reduce((sum: number, it: any) => sum + (Number(it.totalPrice) || (Number(it.orderedQty) * Number(it.unitPrice))), 0);

      const spo = store.createSupplierPO({
        spoNumber,
        prNumber,
        supplierId,
        supplierName: supplierName || 'Certified Vendor',
        orderDate: orderDate || new Date().toISOString().split('T')[0],
        expectedDeliveryDate: expectedDeliveryDate || new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
        currency: currency || 'USD',
        items: items.map(it => ({
          sku: it.sku,
          itemName: it.itemName,
          unit: it.unit,
          orderedQty: Number(it.orderedQty),
          deliveredQty: 0,
          unitPrice: Number(it.unitPrice),
          totalPrice: Number(it.totalPrice) || (Number(it.orderedQty) * Number(it.unitPrice))
        })),
        totalAmount,
        paymentTerms: paymentTerms || 'LC 60 Days',
        status: 'ISSUED'
      });

      return res.status(201).json({
        success: true,
        data: spo,
        message: `Supplier Purchase Order ${spo.spoNumber} officially dispatched to vendor.`
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        error: { code: 'SERVER_ERROR', message: error.message }
      });
    }
  }

  // ==========================================
  // 4. Goods Received Notes (GRN)
  // ==========================================
  public static getGRNs(req: Request, res: Response) {
    try {
      const grns = store.getAllGRNs();
      return res.status(200).json({
        success: true,
        data: grns,
        count: grns.length
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        error: { code: 'SERVER_ERROR', message: error.message }
      });
    }
  }

  public static createGRN(req: Request, res: Response) {
    try {
      const { grnNumber, spoNumber, supplierName, warehouseId, warehouseName, vehicleNumber, challanNumber, driverName, qcInspectionStatus, items } = req.body;

      if (!grnNumber || !spoNumber || !warehouseId || !items || !Array.isArray(items)) {
        return res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_FAILED', message: 'GRN Number, SPO reference, Warehouse ID, and item lines are mandatory.' }
        });
      }

      const grn = store.createGRN({
        grnNumber,
        spoNumber,
        supplierName: supplierName || 'Mill Vendor',
        warehouseId,
        warehouseName: warehouseName || 'Central Bonded Warehouse',
        receivedDate: new Date().toISOString(),
        vehicleNumber: vehicleNumber || 'DHAKA-METRO-1122',
        challanNumber: challanNumber || 'CH-0001',
        driverName: driverName || 'Driver Inbound',
        qcInspectionStatus: qcInspectionStatus || 'PASSED',
        items,
        receivedBy: (req as AuthenticatedRequest).user?.fullName || 'Store Officer'
      });

      return res.status(201).json({
        success: true,
        data: grn,
        message: `Inbound GRN ${grn.grnNumber} recorded with automated binning & stock update.`
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        error: { code: 'SERVER_ERROR', message: error.message }
      });
    }
  }

  // ==========================================
  // 5. Stock Inventory & Issuance (Strict Negative Check)
  // ==========================================
  public static getStockInventory(req: Request, res: Response) {
    try {
      const inventory = store.getStockInventory();
      return res.status(200).json({
        success: true,
        data: inventory,
        count: inventory.length
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        error: { code: 'SERVER_ERROR', message: error.message }
      });
    }
  }

  public static getStockTransactions(req: Request, res: Response) {
    try {
      const transactions = store.getStockTransactions();
      return res.status(200).json({
        success: true,
        data: transactions,
        count: transactions.length
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        error: { code: 'SERVER_ERROR', message: error.message }
      });
    }
  }

  public static issueStock(req: Request, res: Response) {
    try {
      const { sku, warehouseId, quantity, targetLine, referenceDoc, reason } = req.body;

      if (!sku || !quantity || Number(quantity) <= 0 || !targetLine) {
        return res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_FAILED', message: 'SKU, valid positive quantity, and target production line are mandatory.' }
        });
      }

      const result = store.issueStockToLine({
        sku,
        warehouseId,
        quantity: Number(quantity),
        targetLine,
        referenceDoc: referenceDoc || 'LINE-REQUISITION-SLIP',
        performedBy: (req as AuthenticatedRequest).user?.fullName || 'Store Issuing Officer',
        reason: reason || 'Issued to production floor for cutting/sewing'
      });

      return res.status(200).json({
        success: true,
        data: result,
        message: `Successfully issued ${quantity} units of SKU ${sku} to line ${targetLine}. Zero negative balance observed.`
      });
    } catch (error: any) {
      // Return 400 Bad Request for negative stock prevention or not found
      return res.status(400).json({
        success: false,
        error: {
          code: 'STOCK_ISSUANCE_REJECTED',
          message: error.message
        }
      });
    }
  }
}
