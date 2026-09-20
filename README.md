# GarmentERP BD — Bangladesh Garment Manufacturing ERP & Quality Management System

[![Build Status](https://img.shields.io/badge/Build-Passing-emerald)](https://github.com/naimuropu-cell/GarmentERP-BD)
[![Phases](https://img.shields.io/badge/Phases%201--8-100%25%20Enterprise%20Complete-emerald)](https://github.com/naimuropu-cell/GarmentERP-BD)
[![SQA Tests](https://img.shields.io/badge/SQA%20Tests-96%2F96%20Passed-brightgreen)](https://github.com/naimuropu-cell/GarmentERP-BD)
[![License](https://img.shields.io/badge/License-Proprietary%20%2F%20MIT-violet)](https://github.com/naimuropu-cell/GarmentERP-BD)

**GarmentERP BD** is an enterprise-grade ERP and Quality Management System engineered around the authentic business, production, and quality assurance workflows of Bangladesh Ready-Made Garments (RMG) manufacturing factories.

It unites the end-to-end journey from **Buyer Inquiry & Purchase Order (PO)** to **Costing, BOM, Procurement, Multi-Bin Warehouse Inventory, Production (Cutting, Relaxation, Sewing, Finishing), Ratio Carton Packing, Comprehensive QA/QC (Fabric 4-Point, Inline Defects, Rework Station, CAPA 5-Whys, ISO AQL 2.5 Normal Sampling)**, **Customs Invoicing & Container Gate Pass Dispatch**, and **Executive Plant BI & OEE Telemetry**.

---

## 🌟 Key Enterprise Highlights

- **Executive Two-Tier Navigation Bar & Menubar**:
  - **Tier 1 (Utility Bar)**: Plant switcher (`Savar Unit 1` & `Gazipur Complex`), real-time Dhaka BST Clock (`UTC+6`), live API pulse (`● Online`), instant 14-role RBAC persona switcher, notifications bell, and user profile.
  - **Tier 2 (Module Menubar)**: Horizontal menubar with 9 core factory modules (`Overview`, `Commercial ▾`, `Supply Chain ▾`, `Production ▾`, `QA / QC ▾`, `Logistics ▾`, `Operations ▾`, `Executive BI ▾`, `Administration ▾`).
  - **Click-to-Expand Submenus**: Clicking any module opens a high-definition popover showing all submenus with micro-descriptions and standard badges (`ASTM D5430`, `ISO 2859-1`, `Labor Act 2006`, `MRP Engine`).
  - **Quick Command Palette (`Ctrl+K`)**: Instant search modal allowing operators and executives to jump directly to any of the 26 specialized screens.
  - **Collapsible Accordion Sidebar**: Multi-module accordion tree with instant submenu filtering and 1-click collapse to icon-rail mode.
- **Factory Floor Compliance & Printables**:
  - **Customs Security Gate Pass**: Official export container dispatch voucher with driver license, container seal barcode, and security signoff blocks.
  - **Commercial Export Invoice**: Customs-compliant export invoice showing Buyer LC reference, HS codes, Port of Loading/Discharge, and Net FOB values.
  - **Worker Payslip**: Official salary slip enforcing the **Bangladesh Labor Act 2006** overtime rate formula: $\text{OT Rate} = \frac{\text{Basic Salary}}{208} \times 2$.
- **Universal RFC-4180 Excel/CSV Data Export**: One-click export with UTF-8 BOM (`\uFEFF`) across Orders, Inventory, Attendance, Payroll, Defect Logs, Invoices, and Gate Passes.
- **Enterprise Toast Notification HUD & Action Guards**: Non-blocking toast notifications (`success`, `error`, `warning`, `info`) with modal confirmation safeguards for irreversible factory actions.

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

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons, Two-Tier Menubar Navigation, Command Palette, Global Toast HUD, RFC-4180 CSV Exporters, Printable Customs Slips.
- **Backend**: Node.js, Express.js, TypeScript, JWT with Refresh Tokens, bcrypt, Zod validation, Chained SHA-256 Audit Logger.
- **Database**: Prisma ORM, Multi-tenant Bangladesh Factory Schema (PostgreSQL/SQLite compatible).
- **SQA & Testing**: 8 Postman Collections, 96 Automated Integration Tests (100% Pass rate across all 8 phases).

---

## 📁 Repository Structure

```text
GarmentERP-BD/
├── docs/
│   ├── GarmentERP_BD_Complete_System_Specification.pdf # 10-page Master Blueprint PDF
│   ├── GarmentERP_BD_Complete_Specification.html       # Master System HTML Specification
│   ├── SRS.md            # Software Requirements Specification (31 Workflows)
│   ├── ERD.md            # Complete Database Schema & Entity Relationships
│   ├── API.md            # REST API Specification & Endpoint Catalog
│   └── WORKFLOW.md       # Operational Lifecycles & QA Escalation Flows
├── postman/
│   ├── GarmentERP_Auth_RBAC.postman_collection.json            # Phase 1 Auth & RBAC
│   ├── GarmentERP_Commercial_Phase2.postman_collection.json    # Phase 2 Merchandising & BOM
│   ├── GarmentERP_SupplyChain_Phase3.postman_collection.json   # Phase 3 SCM & Inventory
│   ├── GarmentERP_Production_Phase4.postman_collection.json    # Phase 4 Cutting & Sewing
│   ├── GarmentERP_QA_QC_Phase5.postman_collection.json         # Phase 5 QA/QC & AQL 2.5
│   ├── GarmentERP_Shipment_Phase6.postman_collection.json      # Phase 6 Shipment & Gate Pass
│   ├── GarmentERP_Operations_Phase7.postman_collection.json    # Phase 7 Operations & Payroll
│   └── GarmentERP_Intelligence_Phase8.postman_collection.json  # Phase 8 Traceability 360° & BI
├── scripts/
│   └── test-all.js       # Master automated CI test runner (All 8 Phases)
├── server/
│   ├── prisma/           # Prisma ORM schema
│   ├── src/
│   │   ├── config/       # Roles, permissions & system constants
│   │   ├── middleware/   # JWT verification, RBAC guard, audit logger
│   │   ├── modules/
│   │   │   ├── auth/         # Phase 1: Authentication & RBAC
│   │   │   ├── organization/ # Phase 1: Factories, Lines & Warehouses
│   │   │   ├── audit/        # Phase 1: SHA-256 Audit Trail
│   │   │   ├── merchandising/# Phase 2: Buyers, Styles, Costing & POs
│   │   │   ├── supplychain/  # Phase 3: Suppliers, Procurement & Stock
│   │   │   ├── production/   # Phase 4: Cutting, Sewing & Finishing
│   │   │   ├── qa/           # Phase 5: 4-Point, Inline QC, Rework, CAPA & AQL
│   │   │   ├── shipment/     # Phase 6: Invoicing, Packing List & Gate Pass
│   │   │   ├── operations/   # Phase 7: HR, Labor Act Payroll, Maintenance & Compliance
│   │   │   └── analytics/    # Phase 8: Traceability 360°, OEE & Telemetry
│   │   ├── services/     # In-memory store & persistent seeds
│   │   └── tests/        # Automated backend integration tests (96/96 PASS)
│   └── tsconfig.json
├── client/
│   ├── src/
│   │   ├── components/   # Common components, ConfirmModal, ToastHUD
│   │   │   └── layout/   # Two-Tier Navbar, Accordion Sidebar
│   │   ├── context/      # ToastContext notification engine
│   │   ├── navigation/   # Centralized navConfig (9 Modules, 26 Submenus)
│   │   ├── modules/      # 8 Full Phase Enterprise Frontend Modules
│   │   ├── utils/        # RFC-4180 Excel CSV Exporter
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
# Run all 96 automated integration tests covering all 8 phases:
node scripts/test-all.js
```

### 4. Run Frontend Client
```bash
cd client
npm install
npm run dev
# Open http://localhost:3000 in your browser
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
- [x] **Phase 6: Shipment & Logistics — Commercial Invoicing, Packing List, Security Gate Pass, Dispatch Tracking**
- [x] **Phase 7: Factory Operations — HR/Roster, Biometric Payroll (BD Labor Act 2006), Operational Finance, Machine Maintenance, Compliance Audits**
- [x] **Phase 8: System Intelligence — Order Traceability 360°, Executive Dashboards, Real-Time Socket Alerts, SQA Test Automation**
- [x] **Production Polish: Two-Tier Menubar Navigation, Click-to-Expand Submenus, Quick Search (`Ctrl+K`), Printable Factory Slips & RFC-4180 CSV Exporters**
