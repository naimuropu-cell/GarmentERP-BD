import { Router } from 'express';
import { SYSTEM_PERMISSIONS } from '../config/constants';
import { authenticateToken, requirePermission, requireRole } from '../middleware/auth';
import { AuditController } from '../modules/audit/audit.controller';
import { AuthController } from '../modules/auth/auth.controller';
import { OrganizationController } from '../modules/organization/org.controller';

const router = Router();

// ==========================================
// 1. Auth & User Access Routes (/auth)
// ==========================================
router.post('/auth/login', AuthController.login);
router.post('/auth/register', AuthController.register);
router.post('/auth/refresh-token', AuthController.refreshToken);
router.get('/auth/roles', AuthController.getRoles);

// Protected Auth Routes
router.get('/auth/me', authenticateToken, AuthController.getMe);
router.get(
  '/auth/users',
  authenticateToken,
  requirePermission(SYSTEM_PERMISSIONS.VIEW_USERS),
  AuthController.getUsers
);
router.put(
  '/auth/users/:id/role',
  authenticateToken,
  requirePermission(SYSTEM_PERMISSIONS.MANAGE_USERS),
  AuthController.updateUserRole
);

// ==========================================
// 2. Organization Hierarchy Routes (/organization)
// ==========================================
router.get('/organization/hierarchy', OrganizationController.getHierarchy);
router.get('/organization/factories', OrganizationController.getFactories);
router.get('/organization/factories/:id', OrganizationController.getFactoryById);
router.get('/organization/warehouses', OrganizationController.getWarehouses);

// Protected Organization Mutation Routes
router.post(
  '/organization/factories',
  authenticateToken,
  requirePermission(SYSTEM_PERMISSIONS.MANAGE_ORGANIZATION),
  OrganizationController.createFactory
);
router.post(
  '/organization/lines',
  authenticateToken,
  requirePermission(SYSTEM_PERMISSIONS.MANAGE_ORGANIZATION),
  OrganizationController.createProductionLine
);

// ==========================================
// 3. System Audit Log Routes (/audit)
// ==========================================
router.get(
  '/audit/logs',
  authenticateToken,
  requirePermission(SYSTEM_PERMISSIONS.VIEW_AUDIT_LOGS),
  AuditController.getLogs
);

// ==========================================
// 4. Phase 2: Merchandising & Commercial Routes
// ==========================================
import { MerchandisingController } from '../modules/merchandising/merchandising.controller';

// Buyers
router.get('/buyers', MerchandisingController.getBuyers);
router.get('/buyers/:id', MerchandisingController.getBuyerById);
router.post(
  '/buyers',
  authenticateToken,
  requirePermission(SYSTEM_PERMISSIONS.MANAGE_BUYERS),
  MerchandisingController.createBuyer
);

// Styles & Tech Packs
router.get('/styles', MerchandisingController.getStyles);
router.get('/styles/:id', MerchandisingController.getStyleById);
router.post(
  '/styles',
  authenticateToken,
  requirePermission(SYSTEM_PERMISSIONS.MANAGE_STYLES),
  MerchandisingController.createStyle
);

// Costing Sheets & Margin Control
router.get('/costing', MerchandisingController.getCostingSheets);
router.post(
  '/costing',
  authenticateToken,
  requirePermission(SYSTEM_PERMISSIONS.MANAGE_COSTING),
  MerchandisingController.createCostingSheet
);
router.put(
  '/costing/:id/approve',
  authenticateToken,
  requirePermission(SYSTEM_PERMISSIONS.APPROVE_COSTING),
  MerchandisingController.approveCostingSheet
);

// Buyer Purchase Orders & BOM / MRP
router.get('/orders/po', MerchandisingController.getPurchaseOrders);
router.get('/orders/po/:id', MerchandisingController.getPurchaseOrderById);
router.post(
  '/orders/po',
  authenticateToken,
  requirePermission(SYSTEM_PERMISSIONS.MANAGE_ORDERS),
  MerchandisingController.createPurchaseOrder
);
router.put(
  '/orders/po/:id/status',
  authenticateToken,
  requirePermission(SYSTEM_PERMISSIONS.MANAGE_ORDERS),
  MerchandisingController.updatePOStatus
);

// ==========================================
// 5. Phase 3: Supply Chain, Procurement & Inventory Routes
// ==========================================
import { SupplyChainController } from '../modules/supplychain/supplychain.controller';

// Suppliers
router.get('/suppliers', SupplyChainController.getSuppliers);
router.get('/suppliers/:id', SupplyChainController.getSupplierById);
router.post(
  '/suppliers',
  authenticateToken,
  requirePermission(SYSTEM_PERMISSIONS.MANAGE_SUPPLIERS),
  SupplyChainController.createSupplier
);

// Purchase Requisitions
router.get('/requisitions', SupplyChainController.getRequisitions);
router.post(
  '/requisitions',
  authenticateToken,
  requirePermission(SYSTEM_PERMISSIONS.MANAGE_REQUISITIONS),
  SupplyChainController.createRequisition
);
router.put(
  '/requisitions/:id/approve',
  authenticateToken,
  requirePermission(SYSTEM_PERMISSIONS.APPROVE_REQUISITIONS),
  SupplyChainController.approveRequisition
);

// Supplier Purchase Orders
router.get('/procurement/orders', SupplyChainController.getSupplierPOs);
router.post(
  '/procurement/orders',
  authenticateToken,
  requirePermission(SYSTEM_PERMISSIONS.MANAGE_REQUISITIONS),
  SupplyChainController.createSupplierPO
);

// Goods Received Notes (GRN)
router.get('/grn', SupplyChainController.getGRNs);
router.post(
  '/grn',
  authenticateToken,
  requirePermission(SYSTEM_PERMISSIONS.MANAGE_INVENTORY),
  SupplyChainController.createGRN
);

// Inventory Stock & Issuance (Strict Negative Check)
router.get('/inventory/stock', SupplyChainController.getStockInventory);
router.get('/inventory/transactions', SupplyChainController.getStockTransactions);
router.post(
  '/inventory/transactions/issue',
  authenticateToken,
  requirePermission(SYSTEM_PERMISSIONS.ISSUE_STOCK),
  SupplyChainController.issueStock
);

// ==========================================
// 6. Phase 4: Production Management Routes
// ==========================================
import { ProductionController } from '../modules/production/production.controller';

// Fabric Relaxation (24h Countdown)
router.get('/production/relaxation', ProductionController.getFabricRelaxations);
router.post(
  '/production/relaxation',
  authenticateToken,
  requirePermission(SYSTEM_PERMISSIONS.MANAGE_CUTTING),
  ProductionController.startFabricRelaxation
);
router.put(
  '/production/relaxation/:id/complete',
  authenticateToken,
  requirePermission(SYSTEM_PERMISSIONS.MANAGE_CUTTING),
  ProductionController.completeFabricRelaxation
);

// Cut Orders & Bundles
router.get('/production/cut-orders', ProductionController.getCutOrders);
router.get('/production/cut-orders/:id', ProductionController.getCutOrderById);
router.post(
  '/production/cut-orders',
  authenticateToken,
  requirePermission(SYSTEM_PERMISSIONS.MANAGE_CUTTING),
  ProductionController.createCutOrder
);
router.post(
  '/production/cut-orders/:id/bundles',
  authenticateToken,
  requirePermission(SYSTEM_PERMISSIONS.MANAGE_CUTTING),
  ProductionController.generateBundles
);
router.get('/production/bundles', ProductionController.getBundles);

// Sewing Floor Output & Lines Summary
router.get('/production/sewing/hourly', ProductionController.getSewingHourly);
router.post(
  '/production/sewing/hourly',
  authenticateToken,
  requirePermission(SYSTEM_PERMISSIONS.MANAGE_SEWING),
  ProductionController.recordSewingHourly
);
router.get('/production/sewing/lines-summary', ProductionController.getSewingLinesSummary);

// Finishing & Packing
router.get('/production/finishing', ProductionController.getFinishingBatches);
router.put(
  '/production/finishing/:id/stage',
  authenticateToken,
  requirePermission(SYSTEM_PERMISSIONS.MANAGE_FINISHING),
  ProductionController.updateFinishingStage
);
router.get('/production/packing', ProductionController.getCartonRecords);
router.post(
  '/production/packing',
  authenticateToken,
  requirePermission(SYSTEM_PERMISSIONS.MANAGE_PACKING),
  ProductionController.createCartonRecord
);

// ==========================================
// 7. Phase 5: Core QA/QC Suite, Defect Severity & AQL 2.5
// ==========================================
import * as QaController from '../modules/qa/qa.controller';

// Fabric 4-Point System
router.get('/qa/fabric-4point', QaController.getFabricInspections);
router.post(
  '/qa/fabric-4point',
  authenticateToken,
  requirePermission(SYSTEM_PERMISSIONS.CONDUCT_INSPECTION),
  QaController.createFabricInspection
);

// Inline & End-line Sewing Defects
router.get('/qa/inspections', QaController.getSewingDefects);
router.post(
  '/qa/inspections',
  authenticateToken,
  requirePermission(SYSTEM_PERMISSIONS.CONDUCT_INSPECTION),
  QaController.createSewingDefect
);

// Rework Orders
router.get('/qa/rework-orders', QaController.getReworkOrders);
router.put(
  '/qa/rework-orders/:id/status',
  authenticateToken,
  requirePermission(SYSTEM_PERMISSIONS.MANAGE_REWORK),
  QaController.updateReworkStatus
);

// CAPA 5-Whys Root Cause
router.get('/qa/capa', QaController.getCapaRecords);
router.post(
  '/qa/capa',
  authenticateToken,
  requirePermission(SYSTEM_PERMISSIONS.MANAGE_CAPA),
  QaController.createCapaRecord
);
router.put(
  '/qa/capa/:id/verify',
  authenticateToken,
  requirePermission(SYSTEM_PERMISSIONS.MANAGE_CAPA),
  QaController.verifyCapa
);

// ISO 2859-1 / AQL 2.5 Sampling Inspections
router.get('/qa/aql', QaController.getAqlInspections);
router.post(
  '/qa/aql/calculate',
  authenticateToken,
  requirePermission(SYSTEM_PERMISSIONS.APPROVE_AQL),
  QaController.calculateAndCreateAqlSampling
);

export default router;


