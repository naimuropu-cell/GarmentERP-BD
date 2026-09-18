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

export default router;
