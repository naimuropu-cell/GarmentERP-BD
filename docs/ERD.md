# Entity Relationship Diagram (ERD) & Data Architecture
## GarmentERP BD — Database Specifications

This document outlines the logical relational data model for **GarmentERP BD**. The database layer is designed for PostgreSQL / SQLite using **Prisma ORM**, ensuring relational integrity, foreign key cascading safety, and audit traceability.

---

## 1. High-Level Entity Relationship Diagram

```mermaid
erDiagram
    COMPANY ||--|{ FACTORY : owns
    FACTORY ||--|{ BUILDING : contains
    BUILDING ||--|{ FLOOR : contains
    FLOOR ||--|{ DEPARTMENT : houses
    DEPARTMENT ||--|{ PRODUCTION_LINE : operates
    FACTORY ||--|{ WAREHOUSE : manages
    WAREHOUSE ||--|{ BIN_LOCATION : divides

    USER }|--|| ROLE : assigned
    USER ||--o{ AUDIT_LOG : generates
    USER ||--o{ USER_FACTORY_ACCESS : permits

    BUYER ||--|{ STYLE : orders
    STYLE ||--|{ TECH_PACK : specifies
    STYLE ||--|{ COSTING_SHEET : costs
    STYLE ||--|{ BOM_ENTRY : requires

    BUYER ||--|{ PURCHASE_ORDER : issues
    PURCHASE_ORDER ||--|{ PO_ITEM : details
    PURCHASE_ORDER ||--|{ PRODUCTION_PLAN : initiates

    SUPPLIER ||--|{ PURCHASE_REQUISITION : bids
    PURCHASE_REQUISITION ||--|{ SUPPLIER_PO : converts
    SUPPLIER_PO ||--|{ GOODS_RECEIVED_NOTE : receives
    GOODS_RECEIVED_NOTE ||--|{ STOCK_TRANSACTION : stocks

    STOCK_TRANSACTION }|--|| WAREHOUSE : affects
    STOCK_TRANSACTION }|--|| BIN_LOCATION : targets

    PRODUCTION_PLAN ||--|{ CUT_ORDER : issues
    CUT_ORDER ||--|{ CUT_BUNDLE : produces
    CUT_BUNDLE ||--|{ SEWING_HOURLY_OUTPUT : feeds
    SEWING_HOURLY_OUTPUT ||--|{ FINISHING_BATCH : supplies
    FINISHING_BATCH ||--|{ CARTON_PACK : packs

    QC_INSPECTION ||--|{ DEFECT_RECORD : identifies
    DEFECT_RECORD ||--o{ REWORK_ORDER : triggers
    DEFECT_RECORD ||--o{ CAPA_REPORT : mandates
    CARTON_PACK ||--|{ AQL_INSPECTION : validates
    AQL_INSPECTION ||--|| SHIPMENT_DISPATCH : authorizes
```

---

## 2. Core Entity Definitions

### 2.1 Identity, Access & Organization
- **User**: `id`, `email`, `passwordHash`, `fullName`, `phone`, `roleId`, `isActive`, `lastLoginAt`, `createdAt`, `updatedAt`.
- **Role**: `id`, `name`, `code`, `description`, `permissions` (JSON array of permission codes).
- **AuditLog**: `id`, `userId`, `action`, `entityName`, `entityId`, `oldValues` (JSON), `newValues` (JSON), `ipAddress`, `createdAt`.
- **Company**: `id`, `name`, `code`, `taxId`, `country`, `headquarters`.
- **Factory**: `id`, `companyId`, `name`, `code`, `division`, `district`, `upazila`, `address`.
- **Building & Floor**: `id`, `factoryId`, `name`, `floorNumber`.
- **Department**: `id`, `factoryId`, `name`, `type` (`CUTTING`, `SEWING`, `FINISHING`, `QA_QC`, `STORE`, `HR`, `MAINTENANCE`).
- **ProductionLine**: `id`, `departmentId`, `lineNumber`, `targetEfficiency`, `operatorCapacity`, `activeStatus`.
- **Warehouse & BinLocation**: `id`, `factoryId`, `type` (`FABRIC`, `TRIMS`, `ACCESSORIES`, `FINISHED_GOODS`), `rack`, `binCode`.

### 2.2 Merchandising, Costing & POs
- **Buyer**: `id`, `name`, `code`, `country`, `currency` (BDT, USD, EUR, GBP), `paymentTerms`, `shippingTerms`.
- **Style**: `id`, `buyerId`, `styleNumber`, `garmentType`, `season`, `division`, `baseUOM`.
- **TechPack**: `id`, `styleId`, `versionNumber`, `measurementSpecs` (JSON), `fabricSpecs` (JSON), `isApproved`.
- **CostingSheet**: `id`, `styleId`, `version`, `fabricCost`, `trimCost`, `cmCost`, `overheadCost`, `profitMargin`, `totalFobPrice`.
- **PurchaseOrder**: `id`, `buyerId`, `styleId`, `poNumber`, `orderQuantity`, `contractDeliveryDate`, `status` (`DRAFT`, `APPROVED`, `IN_PRODUCTION`, `PACKED`, `SHIPPED`).
- **POItem**: `id`, `purchaseOrderId`, `color`, `size`, `quantity`, `unitPrice`.

### 2.3 Quality Control, Defects & Compliance
- **QCInspection**: `id`, `inspectionNumber`, `type` (`FABRIC_4POINT`, `CUTTING_PANEL`, `SEWING_INLINE`, `FINISHING_ENDLINE`, `AQL_FINAL`), `purchaseOrderId`, `inspectorId`, `lotSize`, `sampleSize`, `totalDefects`, `result` (`PASS`, `FAIL`, `HOLD`).
- **DefectRecord**: `id`, `inspectionId`, `defectType`, `severity` (`CRITICAL`, `MAJOR`, `MINOR`), `zoneLocation`, `quantity`, `photoUrl`.
- **ReworkOrder**: `id`, `defectRecordId`, `reworkStation`, `assignedTo`, `status` (`ASSIGNED`, `IN_PROGRESS`, `COMPLETED`, `VERIFIED_PASS`).
- **CAPAReport**: `id`, `defectRecordId`, `rootCauseSummary`, `correctiveAction`, `preventiveAction`, `targetCompletionDate`, `verifiedByQA`.
- **AQLSamplingPlan**: `id`, `standard` (`ISO_2859_1`), `inspectionLevel` (`LEVEL_II`), `lotSizeMin`, `lotSizeMax`, `sampleSize`, `acceptLimit`, `rejectLimit`.

### 2.4 Warehouse, Inventory & Production
- **StockTransaction**: `id`, `itemSku`, `warehouseId`, `binId`, `transactionType` (`RECEIVE`, `ISSUE`, `TRANSFER`, `ADJUST`), `quantity`, `referenceDocId`.
- **CutOrder**: `id`, `purchaseOrderId`, `markerLength`, `plyCount`, `totalPlannedPcs`, `actualCutPcs`, `wastagePercentage`.
- **CutBundle**: `id`, `cutOrderId`, `bundleNumber`, `color`, `size`, `startNumber`, `endNumber`, `quantity`.
- **CartonPack**: `id`, `purchaseOrderId`, `cartonNumber`, `grossWeightKg`, `cbm`, `packedQuantities` (JSON matrix).
