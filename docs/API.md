# REST API Specification & Endpoints Catalog
## GarmentERP BD — Architecture & Interface Standard

**Base URL**: `http://localhost:5000/api/v1`  
**Authentication**: Bearer Token (`Authorization: Bearer <jwt_access_token>`)  
**Standard Error Format**:
```json
{
  "success": false,
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "Detailed actionable message",
    "details": []
  }
}
```

---

## 1. Authentication & RBAC (`/api/v1/auth`)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/auth/login` | Authenticate user with email & password; returns JWT & refresh cookie | No |
| `POST` | `/auth/register` | Register new user account (defaults to pending verification) | No |
| `POST` | `/auth/refresh-token` | Rotate expired access token using valid refresh token | Yes (Cookie) |
| `POST` | `/auth/logout` | Revoke active refresh session | Yes |
| `GET` | `/auth/me` | Fetch authenticated user profile, factory access & permission set | Yes |
| `GET` | `/auth/roles` | List all predefined system roles & permission matrix | Yes (Admin) |
| `POST` | `/auth/roles` | Create or update granular role definition | Yes (Super Admin) |
| `GET` | `/auth/users` | List users with pagination, role filter, and factory scope | Yes (Admin) |
| `PUT` | `/auth/users/:id/role` | Reassign user role or update factory permissions | Yes (Admin) |

---

## 2. Organization Management (`/api/v1/organization`)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/organization/hierarchy` | Complete organizational tree from Company down to Production Lines | Yes |
| `POST` | `/organization/factories` | Create new manufacturing factory profile | Yes (Super Admin) |
| `POST` | `/organization/buildings` | Add building under factory | Yes (Factory Admin) |
| `POST` | `/organization/floors` | Add floor under building | Yes (Factory Admin) |
| `POST` | `/organization/departments`| Add department (Cutting, Sewing, Finishing, QA) | Yes (Factory Admin) |
| `POST` | `/organization/lines` | Add production line with operator capacity & target SMV | Yes (Factory Admin) |
| `GET` | `/organization/warehouses` | List warehouses (Fabric, Trims, Finished Goods) | Yes |
| `POST` | `/organization/warehouses`| Add warehouse and bin layout | Yes (Store Officer) |

---

## 3. Merchandising, Costing & Orders (`/api/v1/orders`)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/buyers` | List active buyers with payment & shipment terms | Yes (Merchandiser) |
| `POST` | `/buyers` | Register new international or domestic buyer | Yes (Merchandiser) |
| `GET` | `/styles` | List styles with Tech Pack versions & attachments | Yes (Merchandiser) |
| `POST` | `/styles` | Create new garment style master | Yes (Merchandiser) |
| `POST` | `/styles/:id/tech-pack` | Publish new Tech Pack version with measurement charts | Yes (Merchandiser) |
| `POST` | `/styles/:id/costing` | Compute & store pre-costing sheet with CM & margin | Yes (Merchandiser) |
| `GET` | `/orders/po` | Filter and paginate Buyer Purchase Orders | Yes |
| `POST` | `/orders/po` | Create Buyer PO with color/size matrix & ex-factory date | Yes (Merchandiser) |
| `GET` | `/orders/po/:id/trace` | Complete 360° lifecycle lineage of a PO | Yes (Management) |

---

## 4. Quality Control & Defect Management (`/api/v1/quality`)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/quality/inspections` | List inspection audits filtered by type & result | Yes (QC/QA) |
| `POST` | `/quality/inspections` | Record incoming, inline, endline, or final AQL inspection | Yes (QC Inspector) |
| `POST` | `/quality/defects` | Log specific defect occurrences with zone, severity, photo | Yes (QC Inspector) |
| `POST` | `/quality/rework` | Issue rework order for defective garment batch | Yes (QA Manager) |
| `POST` | `/quality/capa` | Create Root Cause (5-Why) & Corrective/Preventive Action | Yes (QA Manager) |
| `GET` | `/quality/aql-calculator`| Compute sample size, accept & reject limits for lot size | Yes (QC Inspector) |

---

## 5. Audit Trail & System Intelligence (`/api/v1/audit`)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/audit/logs` | Query tamper-evident audit logs with date & entity filters | Yes (Super Admin) |
| `GET` | `/analytics/management-kpi`| Executive KPI dashboard summary (OTD, DHU, Efficiency) | Yes (Management) |
| `GET` | `/analytics/line-efficiency`| Real-time sewing line hourly efficiency metrics | Yes (Prod Planner) |
