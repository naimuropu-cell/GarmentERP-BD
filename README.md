# GarmentERP BD — Bangladesh Garment Manufacturing ERP & Quality Management System

[![Build Status](https://img.shields.io/badge/Build-Passing-emerald)](https://github.com/naimuropu-cell/GarmentERP-BD)
[![Phase](https://img.shields.io/badge/Phase%201%20%26%202-Commercial%20%26%20Orders%20Complete-emerald)](https://github.com/naimuropu-cell/GarmentERP-BD)
[![License](https://img.shields.io/badge/License-Proprietary%20%2F%20MIT-violet)](https://github.com/naimuropu-cell/GarmentERP-BD)

**GarmentERP BD** is an enterprise-grade ERP and Quality Management System engineered around the authentic business, production, and quality assurance workflows of Bangladesh Ready-Made Garments (RMG) manufacturing factories.

It unites the end-to-end journey from **Buyer Inquiry & Purchase Order (PO)** to **Costing, BOM, Procurement, Warehouse Inventory, Production (Cutting, Sewing, Finishing), Carton Ratio Packing, Comprehensive QA/QC (Inspections, Defects, Rework, CAPA, AQL 1.5/2.5)**, and **Commercial Invoicing & Shipment**.

---

## 🏗️ Architecture & Technology Stack

```text
React 18 + TypeScript + Vite + Tailwind CSS (Client SPA)
                     ↓
        REST API & JWT Security
                     ↓
   Node.js + Express + TypeScript + Zod (Backend API)
                     ↓
         Prisma ORM & PostgreSQL
                     ↓
         Audit Trail & SQA Suites
```

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons, Modern Glassmorphism.
- **Backend**: Node.js, Express.js, TypeScript, JWT with Refresh Tokens, bcrypt, Zod validation.
- **Database**: Prisma ORM, Multi-tenant Bangladesh Factory Schema (PostgreSQL/SQLite compatible).
- **SQA & Portfolio Assets**: Postman Automated Test Collection, SRS, ERD, API specs, and operational workflows.

---

## 📁 Repository Structure

```text
GarmentERP-BD/
├── docs/
│   ├── GarmentERP_BD_Complete_System_Specification.pdf # Master Enterprise Blueprint (All Modules & Workflows)
│   ├── SRS.md            # Software Requirements Specification (31 Workflows)
│   ├── ERD.md            # Complete Database Schema & Entity Relationships
│   ├── API.md            # REST API Specification & Endpoint Catalog
│   └── WORKFLOW.md       # Operational Lifecycles & QA Escalation Flows
├── postman/
│   └── GarmentERP_Auth_RBAC.postman_collection.json # Automated SQA Test Suite
├── server/
│   ├── prisma/           # Prisma ORM schema
│   ├── src/
│   │   ├── config/       # Roles, permissions & system constants
│   │   ├── middleware/   # JWT verification, RBAC guard, audit logger
│   │   ├── modules/
│   │   │   ├── auth/     # Login, Register, Refresh Tokens, Role assignments
│   │   │   ├── organization/ # Factories, Buildings, Floors, Lines, Warehouses
│   │   │   └── audit/    # Tamper-evident compliance ledger
│   │   ├── services/     # In-memory store & persistent seeds
│   │   └── tests/        # Automated backend integration tests (100% Pass)
│   └── tsconfig.json
├── client/
│   ├── src/
│   │   ├── components/   # Navbar, Sidebar, Badges
│   │   ├── modules/
│   │   │   ├── auth/     # Login view with 1-click persona switchers
│   │   │   ├── organization/ # Factory tree, sewing lines, bonded warehouses
│   │   │   ├── rbac/     # 14 roles permission matrix
│   │   │   ├── audit/    # Audit trail table with filters
│   │   │   └── dashboard/# Executive summary and module roadmap
│   │   ├── services/     # API client & demo profiles
│   │   └── types/        # Shared TypeScript interfaces
│   └── vite.config.ts
└── README.md
```

---

## 👥 14 Role-Based Access Personas

GarmentERP BD enforces segregation of duties across 14 specialized factory roles:

| Role Name | Persona Code | Scope |
|---|---|---|
| **Super Administrator** | `SUPER_ADMIN` | Platform sovereignty & audit administration |
| **Factory Administrator** | `FACTORY_ADMIN` | Savar / Gazipur plant layout & staff allocations |
| **Executive Management** | `MANAGEMENT` | Order profitability, margins & shipment sign-offs |
| **Merchandiser** | `MERCHANDISER` | Buyer profiles, styles, tech packs & costing |
| **Purchase Officer** | `PURCHASE_OFFICER` | Material requisitions, RFQs & supplier ratings |
| **Store Officer** | `STORE_OFFICER` | Bonded fabric, trims, negative stock enforcement |
| **Production Planner** | `PROD_PLANNER` | Line capacity balancing, target SMVs |
| **Production Supervisor** | `PROD_SUPERVISOR` | Hourly sewing line tracking & bundle routing |
| **QA Manager** | `QA_MANAGER` | Quality standards, CAPA resolution & AQL sign-off |
| **QC Inspector** | `QC_INSPECTOR` | 4-point fabric QC, cutting panels & inline audits |
| **Commercial Officer** | `COMMERCIAL_OFFICER` | Banking LCs, customs invoices & gate passes |
| **HR Officer** | `HR_OFFICER` | Operator rosters, shifts & biometric attendance |
| **Finance Officer** | `FINANCE_OFFICER` | Operational cost centers & order profitability |
| **Maintenance Officer** | `MAINTENANCE_OFFICER`| Machine maintenance schedules & breakdown tickets |

---

## 🚀 Quick Start & Local Execution

### 1. Prerequisites
- Node.js (v18+)
- npm (v9+)
- Git

### 2. Run Backend Server
```bash
cd server
npm install
npm run build
npm start
# Server listens on http://localhost:5000 (API Base: /api/v1)
```

### 3. Run Automated Tests
```bash
cd server
npm test
# Runs the 10 automated integration tests covering positive/negative auth, RBAC guards, and topology
```

### 4. Run Frontend Client
```bash
cd client
npm install
npm run dev
# Open http://localhost:3000
```

### 🔑 Pre-Configured Test Credentials:
- **Super Admin**: `admin@garmenterp.com` / `Admin123!`
- **Merchandiser**: `merchandiser@garmenterp.com` / `Merch123!`
- **QA Manager**: `qamanager@garmenterp.com` / `Qa123!`
- **Sewing Supervisor**: `supervisor@garmenterp.com` / `Supervisor123!`
- **Store Officer**: `store@garmenterp.com` / `Store123!`

---

## 🗺️ Implementation Roadmap

- [x] **Phase 1: Foundation, SRS/ERD Documentation, Auth & RBAC (Mod 01), Organization Topology (Mod 02)**
- [x] **Phase 2: Commercial — Buyer & Merchandising, Style & Tech Pack Versioning, Buyer POs, Pre-Costing & BOM**
- [x] **Phase 3: Supply Chain — Procurement Requisitions, Supplier Scorecard, Multi-Warehouse & Inventory Control**
- [x] **Phase 4: Production — Line Allocation, Cutting Workflow, QR Bundling, Sewing Hourly Tracking, Finishing, Packing**
- [x] **Phase 5: Core QA/QC Suite — Fabric 4-Point, Cutting Panels, Sewing Inline, Defect Severity, Rework Orders, CAPA 5-Whys, Configurable AQL Tables**
- [ ] **Phase 6: Shipment & Logistics — Commercial Invoicing, Packing List, Security Gate Pass, Dispatch Tracking**
- [ ] **Phase 7: Factory Operations — HR/Roster, Biometric Payroll, Operational Finance, Machine Maintenance, Compliance Audits**
- [ ] **Phase 8: System Intelligence — Order Traceability 360°, Executive Dashboards, Real-Time Socket Alerts, SQA Test Automation**
