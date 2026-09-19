import { Request, Response } from 'express';
import { z } from 'zod';
import { store } from '../../services/store';

// ==========================================
// Zod Validation Schemas for Phase 6
// ==========================================
const CreateShipmentSchema = z.object({
  poId: z.string().min(1, 'PO ID is required'),
  poNumber: z.string().min(1, 'PO Number is required'),
  buyerId: z.string().min(1, 'Buyer ID is required'),
  buyerName: z.string().min(1, 'Buyer Name is required'),
  styleNumber: z.string().min(1, 'Style Number is required'),
  orderQuantity: z.number().positive('Order Quantity must be positive'),
  shippedQuantity: z.number().positive('Shipped Quantity must be positive'),
  vesselOrFlight: z.string().min(1, 'Vessel/Flight information is required'),
  etd: z.string().min(1, 'Estimated Departure (ETD) is required'),
  eta: z.string().min(1, 'Estimated Arrival (ETA) is required')
});

const CreateCommercialInvoiceSchema = z.object({
  poId: z.string().min(1, 'PO ID is required'),
  poNumber: z.string().min(1, 'PO Number is required'),
  buyerId: z.string().min(1, 'Buyer ID is required'),
  buyerName: z.string().min(1, 'Buyer Name is required'),
  styleNumber: z.string().min(1, 'Style Number is required'),
  lcNumber: z.string().min(1, 'Letter of Credit (LC) Number is required'),
  issuingBank: z.string().min(1, 'Issuing Bank is required'),
  incoterms: z.enum(['FOB', 'CIF', 'CFR', 'DDP', 'EXW']),
  portOfLoading: z.string().min(1, 'Port of Loading is required'),
  portOfDischarge: z.string().min(1, 'Port of Discharge is required'),
  currency: z.enum(['USD', 'EUR', 'GBP', 'BDT']),
  invoicedQuantity: z.number().positive('Invoiced Quantity must be positive'),
  unitPrice: z.number().positive('Unit Price must be positive'),
  paymentTerms: z.string().min(1, 'Payment Terms is required'),
  commercialOfficerSignoff: z.string().min(1, 'Commercial Officer Signoff is required')
});

const CreatePackingListSchema = z.object({
  poId: z.string().min(1, 'PO ID is required'),
  poNumber: z.string().min(1, 'PO Number is required'),
  invoiceNumber: z.string().min(1, 'Invoice Number is required'),
  containerType: z.enum(['20FT_FCL', '40FT_FCL', '40FT_HQ', 'LCL']),
  containerNumber: z.string().min(1, 'Container Number is required'),
  sealNumber: z.string().min(1, 'Container Seal Number is required'),
  cartonBreakdown: z.array(z.object({
    cartonRange: z.string(),
    sizeRatio: z.string(),
    pcsPerCarton: z.number().positive(),
    totalCartons: z.number().positive(),
    totalPcs: z.number().positive(),
    grossWeightKg: z.number().positive(),
    netWeightKg: z.number().positive(),
    dimensionsCm: z.string()
  })).min(1, 'At least one carton breakdown item is required')
});

const CreateGatePassSchema = z.object({
  shipmentId: z.string().min(1, 'Shipment ID is required'),
  poNumber: z.string().min(1, 'PO Number is required'),
  invoiceNumber: z.string().min(1, 'Invoice Number is required'),
  vehicleNumber: z.string().min(1, 'Vehicle / Truck Number is required'),
  driverName: z.string().min(1, 'Driver Name is required'),
  driverPhone: z.string().min(1, 'Driver Phone is required'),
  containerSealNumber: z.string().min(1, 'Container Seal Number is required'),
  destination: z.string().min(1, 'Destination is required'),
  dispatchTime: z.string().optional(),
  securityOfficer: z.string().min(1, 'Security Officer is required')
});

// ==========================================
// 1. Shipment Master Controllers
// ==========================================
export const getShipments = (req: Request, res: Response) => {
  const shipments = store.getAllShipments();
  return res.json({ success: true, data: shipments });
};

export const getShipmentById = (req: Request, res: Response) => {
  const shipment = store.getShipmentById(req.params.id);
  if (!shipment) {
    return res.status(404).json({ success: false, error: { message: 'Shipment record not found' } });
  }
  return res.json({ success: true, data: shipment });
};

export const verifyAqlQualityGate = (req: Request, res: Response) => {
  const poNumber = req.query.poNumber as string;
  if (!poNumber) {
    return res.status(400).json({ success: false, error: { message: 'poNumber query parameter is required' } });
  }
  const check = store.verifyAqlPassForPo(poNumber);
  return res.json({ success: true, data: check });
};

export const createShipment = (req: Request, res: Response) => {
  const parsed = CreateShipmentSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message }
    });
  }

  const result = store.createShipment(parsed.data);
  if (result.error) {
    return res.status(400).json({
      success: false,
      error: { code: 'QUALITY_GATE_VIOLATION', message: result.error }
    });
  }

  return res.status(201).json({
    success: true,
    data: result.shipment
  });
};

export const updateShipmentStatus = (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  const updated = store.updateShipmentStatus(id, status);
  if (!updated) {
    return res.status(404).json({ success: false, error: { message: 'Shipment record not found' } });
  }
  return res.json({ success: true, data: updated });
};

// ==========================================
// 2. Commercial Invoice Controllers
// ==========================================
export const getCommercialInvoices = (req: Request, res: Response) => {
  const invoices = store.getAllCommercialInvoices();
  return res.json({ success: true, data: invoices });
};

export const createCommercialInvoice = (req: Request, res: Response) => {
  const parsed = CreateCommercialInvoiceSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message }
    });
  }

  const result = store.createCommercialInvoice(parsed.data);
  if (result.error) {
    return res.status(400).json({
      success: false,
      error: { code: 'QUALITY_GATE_VIOLATION', message: result.error }
    });
  }

  return res.status(201).json({
    success: true,
    data: result.invoice
  });
};

// ==========================================
// 3. Export Packing List Controllers
// ==========================================
export const getPackingLists = (req: Request, res: Response) => {
  const lists = store.getAllPackingLists();
  return res.json({ success: true, data: lists });
};

export const createPackingList = (req: Request, res: Response) => {
  const parsed = CreatePackingListSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message }
    });
  }

  const result = store.createPackingList(parsed.data);
  if (result.error) {
    return res.status(400).json({
      success: false,
      error: { code: 'QUALITY_GATE_VIOLATION', message: result.error }
    });
  }

  return res.status(201).json({
    success: true,
    data: result.packingList
  });
};

// ==========================================
// 4. Security Gate Pass Controllers
// ==========================================
export const getGatePasses = (req: Request, res: Response) => {
  const passes = store.getAllGatePasses();
  return res.json({ success: true, data: passes });
};

export const createGatePass = (req: Request, res: Response) => {
  const parsed = CreateGatePassSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message }
    });
  }

  const result = store.createSecurityGatePass({
    ...parsed.data,
    dispatchTime: parsed.data.dispatchTime || new Date().toISOString()
  });
  if (result.error) {
    return res.status(400).json({
      success: false,
      error: { code: 'QUALITY_GATE_VIOLATION', message: result.error }
    });
  }

  return res.status(201).json({
    success: true,
    data: result.gatePass
  });
};

export const updateGatePassStatus = (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  if (!['DISPATCHED_GATE_OUT', 'DELIVERED'].includes(status)) {
    return res.status(400).json({
      success: false,
      error: { message: "Status must be either 'DISPATCHED_GATE_OUT' or 'DELIVERED'" }
    });
  }

  const updated = store.updateGatePassStatus(id, status);
  if (!updated) {
    return res.status(404).json({ success: false, error: { message: 'Gate pass record not found' } });
  }

  return res.json({ success: true, data: updated });
};
