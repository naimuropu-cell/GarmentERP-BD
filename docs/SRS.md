# Software Requirements Specification (SRS)
## GarmentERP BD — Garment Manufacturing ERP & Quality Management System

**Version:** 1.0.0  
**Author / Organization:** GarmentERP BD Engineering Team  
**Date:** September 2026  
**Status:** Approved for Implementation  

---

## 1. Introduction

### 1.1 Purpose
The purpose of this document is to define the functional, operational, and non-functional requirements for **GarmentERP BD**, an enterprise-grade Enterprise Resource Planning (ERP) and Quality Management System specifically engineered for the ready-made garment (RMG) industry in Bangladesh.

### 1.2 Scope
GarmentERP BD unifies the entire garment manufacturing lifecycle into a single, cohesive database and reactive workflow:
```
Buyer Inquiry / Order
       ↓
Merchandising & Tech Pack Versioning
       ↓
Costing (Fabric, Trims, CM, Overhead) & BOM / MRP
       ↓
Procurement (PR, PO, Quotations, Supplier Rating)
       ↓
Multi-Warehouse Inventory Control (Fabric, Trims, Accessories, Finished Goods)
       ↓
Production Planning & Line Scheduling
       ↓
Cutting Workflow (Relaxation, Marker, Spreading, Cutting, Bundling)
       ↓
Sewing Tracking (Line Input, Hourly Production, Inline QC)
       ↓
Finishing Operations (Trimming, Ironing, Folding)
       ↓
Carton Ratio Packing & Packing List Generation
       ↓
Comprehensive QA/QC Suite (Incoming, In-line, End-line, AQL 1.5/2.5/4.0 Sampling, CAPA, Rework)
       ↓
Commercial Invoicing, Gate Pass & Shipment Execution
```

### 1.3 Key Objectives
1. **Traceability 360°**: Complete backward and forward lineage from a buyer PO down to individual fabric rolls, cut bundles, sewing operators, defect rework orders, cartons, and container dispatches.
2. **Strict Quality Gates**: Zero shipment without AQL clearance; zero cutting without fabric inspection relaxation clearance.
3. **Data Integrity**: Enforce negative stock prevention, audit trail immutability, and version-controlled costing and Tech Packs.
4. **Localization**: Built for Bangladesh RMG standards (BDT & multi-currency USD/EUR/GBP, Asia/Dhaka timezone, BGMEA/BKMEA audit compliance standards).

---

## 2. User Roles & RBAC Matrix

The system enforces 14 distinct roles with granular permissions:

| Role Code | Role Name | Primary Responsibilities |
|---|---|---|
| `SUPER_ADMIN` | Super Administrator | Full system control, role configuration, tenant provisioning, system audit logs. |
| `FACTORY_ADMIN` | Factory Admin | Factory topology, department setup, user assignments, shift rosters. |
| `MANAGEMENT` | Executive Management | Executive KPIs, order margins, shipment schedules, factory efficiency reports. |
| `MERCHANDISER` | Merchandiser | Buyer management, style creation, tech pack versioning, buyer POs, costing. |
| `PURCHASE_OFFICER` | Procurement Officer | Purchase requisitions, RFQs, supplier POs, supplier scorecards. |
| `STORE_OFFICER` | Store / Warehouse Officer | GRN, material inspections, warehouse bins, stock transfers, reservations, issues. |
| `PROD_PLANNER` | Production Planner | Line allocations, daily target scheduling, capacity balancing, SMV calculation. |
| `PROD_SUPERVISOR` | Production Supervisor | Hourly line monitoring, cut bundle issuance, line balancing, sewing output. |
| `QA_MANAGER` | Quality Assurance Manager | Quality standards, AQL inspection plans, CAPA resolution sign-off, audit verification. |
| `QC_INSPECTOR` | Quality Control Inspector | Incoming fabric 4-point inspections, cutting panel checks, sewing inline QC, AQL audits. |
| `COMMERCIAL_OFFICER` | Commercial Officer | Letters of credit (LC), export documentation, commercial invoices, shipping bills. |
| `HR_OFFICER` | Human Resources Officer | Employee roster, biometric attendance, shifts, leave approvals, payroll generation. |
| `FINANCE_OFFICER` | Finance Officer | Accounts payable/receivable, order profitability, cost centers, expense vouchers. |
| `MAINTENANCE_OFFICER` | Maintenance Engineer | Machine asset registry, preventive maintenance schedules, breakdown work orders. |

---

## 3. Detailed Functional Modules

### Module 01: Authentication, RBAC & Audit Trails
- **FR-01.1**: Secure login with email and bcrypt/Argon2 password hash verification.
- **FR-01.2**: JWT access tokens (15-min lifespan) paired with cryptographically secure HTTP-only refresh tokens (7-day lifespan).
- **FR-01.3**: Role-based access control (RBAC) middleware verifying fine-grained permissions (`create:buyer`, `approve:costing`, `inspect:aql`, etc.).
- **FR-01.4**: Mandatory, non-repudiable audit logging for every mutation (record ID, entity, action, previous value, updated value, user, IP, timestamp).
- **FR-01.5**: Session termination, forced password rotation, and multi-factor authentication (MFA) hooks.

### Module 02: Organization & Factory Hierarchy
- **FR-02.1**: Multi-tiered organizational modeling:
  `Company` &rarr; `Factory` &rarr; `Building` &rarr; `Floor` &rarr; `Department` &rarr; `Production Line` &rarr; `Warehouse` &rarr; `Storage Bin`.
- **FR-02.2**: Line capacity management: standard allowed minutes (SAM/SMV), operator count, helper count, and target pieces per hour.
- **FR-02.3**: Warehouse segregation: dedicated quarantine bins, raw material zones, trim stores, and finished goods bonded warehouses.

### Module 03: Buyer Management & Merchandising
- **FR-03.1**: Comprehensive buyer registry with credit terms, LC specifications, incoterms (FOB, CIF, CFR), and country codes.
- **FR-03.2**: Style master registering season, brand, division, garment category, size charts, and color palettes.
- **FR-03.3**: Buyer purchase order (PO) intake supporting color-wise, size-wise matrix quantities and contracted ex-factory delivery dates.

### Module 04: Style & Tech Pack Management
- **FR-04.1**: Multi-version tech packs (`v1.0`, `v1.1`, `v2.0`) with visual measurement charts, tolerances (+/- cm/inch), and stitch callouts.
- **FR-04.2**: Bill of Materials (BOM) linkage detailing fabric consumption (KG/yds per dozen) and trims/accessories breakdown.
- **FR-04.3**: Artwork, wash recipes, and embroidery placement attachment library.

### Module 05: Pre-Costing & Material Requirements Planning (MRP)
- **FR-05.1**: Automated pre-cost sheet computing Fabric Cost + Trims Cost + CM (Cost of Making) + Washing + Commercial Overhead + Target Profit Margin.
- **FR-05.2**: MRP engine determining Gross Fabric Requirement = `(PO Quantity * Consumption) * (1 + Wastage %)`.
- **FR-05.3**: Real-time shortage calculation: `Required - (Available In-Stock - Reserved) = Net Procurement Requisition`.

### Module 06: Procurement & Supply Chain Management
- **FR-06.1**: Requisition-to-PO workflow with tiered approvals (Dept Head &rarr; Commercial &rarr; Finance).
- **FR-06.2**: Supplier evaluation tracking on-time delivery rate (OTD) and quality rejection percentages.
- **FR-06.3**: Goods Received Note (GRN) generation and mandatory gate entry linkage.

### Module 07: Inventory Control & Warehouse Operations
- **FR-07.1**: Strict negative inventory prohibition across all fabric rolls and trim accessories.
- **FR-07.2**: State-based stock inventory: `QUARANTINE` (pending QC) &rarr; `AVAILABLE` &rarr; `RESERVED` &rarr; `ISSUED` &rarr; `CONSUMED`.
- **FR-07.3**: Batch and lot traceability for fabric rolls with shade band grouping (Lot A, Lot B, Lot C).

### Module 08: Production: Cutting, Sewing, Finishing & Packing
- **FR-08.1 Fabric Relaxation**: Roll relaxation timer enforcing mandatory 24-hour relaxation prior to spreading.
- **FR-08.2 Cutting & Bundling**: Cut order generation, marker planning, lay length tracking, ply counting, and unique bundle ticketing with QR/barcodes.
- **FR-08.3 Sewing Production**: Hourly bundle check-in, operator efficiency calculation `(Produced Qty * SAM) / (Worked Minutes * Operators) * 100%`.
- **FR-08.4 Finishing**: Thread suction, ironing, button hole verification, poly packing, and hangtag verification.
- **FR-08.5 Packing Ratio**: Solid color/solid size vs assorted pre-pack ratio enforcement preventing carton overfill.

### Module 09: Comprehensive QA/QC, Defect Management & AQL
- **FR-09.1 Fabric 4-Point System**: Automated point calculation per 100 sq. yards; automatic lot accept/reject based on 20/28 point thresholds.
- **FR-09.2 Sewing Inline & End-line Inspection**: Real-time defect capture categorized by Defect Type (Skipped Stitch, Puckering, Open Seam), Severity (Critical, Major, Minor), and Garment Zone.
- **FR-09.3 Rework Orders**: Immediate quarantine of defective garments, routing to dedicated rework stations, followed by mandatory re-inspection.
- **FR-09.4 CAPA Workflow**: Root cause analysis (5-Whys), corrective action assignment, preventive barrier implementation, and QA Manager verification.
- **FR-09.5 Configurable AQL Tables**: ISO 2859-1 / ANSI/ASQ Z1.4 sampling plans based on Normal General Inspection Level II, dynamic sample sizing, and Accept/Reject numbers.

### Module 10: Commercial Invoicing, Gate Pass & Shipment
- **FR-10.1**: Final inspection gate locking shipping documentation generation until QA certifies PASS status.
- **FR-10.2**: Commercial invoice generation with HS Codes, net weight, gross weight, and CBM calculations.
- **FR-10.3**: Security gate pass issuance tracking truck license plate, driver details, seal numbers, and dispatch timestamp.

---

## 4. Non-Functional Requirements (NFR)

1. **Security**: OWASP Top 10 compliance, salted bcrypt/argon2 hashing, parameterized queries (SQL injection prevention), CSRF protection, and rate limiting.
2. **Performance**: Sub-150ms 95th percentile REST API response time for transactional endpoints; sub-1s initial page load.
3. **Availability & Reliability**: 99.9% uptime capability with automatic failover and structured transactional rollback.
4. **Auditability**: Complete non-destructive audit history with timestamps in `Asia/Dhaka` (UTC+6).
