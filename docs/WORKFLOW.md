# Garment Manufacturing Lifecycle & Workflows
## GarmentERP BD — End-to-End Operational Workflows

This document illustrates the operational lifecycles embedded inside **GarmentERP BD**, showing how departments coordinate without data silos.

---

## 1. Global Order-to-Shipment Journey

```mermaid
flowchart TD
    Buyer([Buyer / Customer]) -->|PO Intake| Merchandising[Merchandising Team]
    Merchandising -->|Style & Tech Pack| Costing[Costing & BOM]
    Costing -->|Material Shortage| Procurement[Procurement Team]
    Procurement -->|Purchase Orders| Suppliers([Raw Material Suppliers])
    Suppliers -->|Fabric & Trims Delivery| GateStore[Gate Entry & Store]
    
    GateStore -->|Incoming Inspection| FabricQC{Fabric 4-Point QC}
    FabricQC -->|Fail| ReturnSupplier[Quarantine / Return to Supplier]
    FabricQC -->|Pass| Relaxation[Mandatory Fabric Relaxation 24h]
    
    Relaxation --> Cutting[Spreading & Cutting]
    Cutting --> CuttingQC{Cut Panel Inspection}
    CuttingQC -->|Defective Panel| Recut[Panel Replacement]
    CuttingQC -->|Pass| Bundling[Numbering & QR Bundling]
    
    Bundling --> Sewing[Sewing Lines 01-10]
    Sewing --> InlineQC{Inline & End-Line QC}
    InlineQC -->|Defect Flagged| ReworkStation[Rework Station]
    ReworkStation -->|Repaired| InlineQC
    InlineQC -->|Pass| Finishing[Finishing: Trimming, Pressing, Folding]
    
    Finishing --> Packing[Carton Ratio Packing]
    Packing --> FinalAQL{Final AQL 1.5/2.5 Audit}
    FinalAQL -->|AQL Rejected| 100PercentScreening[100% QA Screening & CAPA]
    100PercentScreening --> FinalAQL
    FinalAQL -->|AQL Accepted| Commercial[Commercial Invoicing & LC]
    Commercial --> SecurityGate[Security Gate Pass & Seal]
    SecurityGate --> Dispatch([Port / Container Dispatch])
```

---

## 2. QA/QC Defect, Rework & CAPA Escalation Flow

```mermaid
flowchart TD
    Inspector([QC Inspector]) -->|Detects Defect| LogDefect[Record Defect with Severity]
    LogDefect --> CheckSeverity{Severity Level?}
    
    CheckSeverity -->|Minor| LocalFix[Immediate Operator Alert & Local Repair]
    CheckSeverity -->|Major| IssueRework[Generate Rework Order Batch]
    CheckSeverity -->|Critical| StopLine[Line Stoppage & Quality Alert]
    
    IssueRework --> AssignedWorker[Rework Station Repair]
    AssignedWorker --> ReInspect{Re-Inspection}
    ReInspect -->|Pass| ReEnterStream[Return to Good Bundle Flow]
    ReInspect -->|Fail| ScrapOrReject[Scrap / Downgrade to B-Grade]
    
    StopLine --> TriggerCAPA[Mandatory CAPA 5-Why Analysis]
    TriggerCAPA --> RootCause[Identify Root Cause: Machine vs Training]
    RootCause --> PreventAction[Implement Preventive Barrier]
    PreventAction --> QAManagerVerify{QA Manager Sign-off}
    QAManagerVerify -->|Approved| CloseIncident[Close CAPA & Audit Log]
```

---

## 3. Warehouse Negative Inventory Prevention Architecture

```mermaid
flowchart LR
    Request[Material Issue Request] --> CheckStock{Available Stock >= Requested?}
    CheckStock -->|No| RejectIssue[Transaction Blocked: Negative Stock Prohibited]
    CheckStock -->|Yes| LockStock[Soft Reserve Quantity]
    LockStock --> ScanBin[Scan Warehouse Rack/Bin QR]
    ScanBin --> DeductStock[State Change: AVAILABLE -> ISSUED]
    DeductStock --> CreateAudit[Write Immutable Audit Log Record]
```
