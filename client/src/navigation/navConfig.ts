import React from 'react';
import { 
  LayoutDashboard, 
  Building, 
  ShieldAlert, 
  History, 
  ShoppingBag, 
  FileText, 
  Layers, 
  Truck, 
  Scissors, 
  CheckCircle2, 
  Package, 
  Ship, 
  Users, 
  DollarSign, 
  Wrench,
  Activity,
  RefreshCw,
  Award,
  ShieldCheck,
  TrendingUp,
  Cpu,
  FileSpreadsheet,
  Boxes,
  Barcode
} from 'lucide-react';

export interface SubMenuItem {
  id: string; // Tab identifier
  subTab?: string; // Optional sub-tab (e.g. for ShipmentView, AnalyticsView, OperationsView)
  label: string;
  shortLabel: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  badgeColor?: 'emerald' | 'blue' | 'amber' | 'purple' | 'slate' | 'rose';
  permission?: string | null;
}

export interface ModuleMenu {
  id: string;
  title: string;
  shortTitle: string;
  phaseBadge: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  defaultTabId: string;
  items: SubMenuItem[];
}

export const MODULE_MENUS: ModuleMenu[] = [
  {
    id: 'dashboard',
    title: 'Executive Dashboard',
    shortTitle: 'Overview',
    phaseBadge: 'Executive',
    icon: LayoutDashboard,
    description: 'Real-time plant KPIs, manufacturing health, line run-rates & quick actions',
    defaultTabId: 'overview',
    items: [
      {
        id: 'overview',
        label: 'Plant Overview & Live Status',
        shortLabel: 'Overview',
        description: 'Plant operations summary, active orders, DHU rate & factory health',
        icon: LayoutDashboard,
        badge: 'Real-Time',
        badgeColor: 'emerald'
      }
    ]
  },
  {
    id: 'merchandising',
    title: 'Commercial & Merchandising',
    shortTitle: 'Commercial',
    phaseBadge: 'Phase 2',
    icon: ShoppingBag,
    description: 'Buyer accounts, tech packs, pre-costing, FOB quotations & purchase orders',
    defaultTabId: 'orders',
    items: [
      {
        id: 'buyers',
        label: 'Buyer Profiles & Terms',
        shortLabel: 'Buyers & Terms',
        description: 'Buyer directory, Letter of Credit (LC) terms, brands & contact dossiers',
        icon: ShoppingBag,
        badge: 'CRM & Terms',
        badgeColor: 'blue'
      },
      {
        id: 'styles',
        label: 'Style Master & Tech Packs',
        shortLabel: 'Tech Packs',
        description: 'Bill of Materials (BOM), measurement specs & garment construction details',
        icon: FileText,
        badge: 'BOM v1.2',
        badgeColor: 'purple'
      },
      {
        id: 'orders',
        label: 'Buyer POs & MRP Shortage',
        shortLabel: 'Purchase Orders',
        description: 'Buyer order tracking, delivery deadlines & automated material shortage engine',
        icon: ShoppingBag,
        badge: 'MRP Engine',
        badgeColor: 'emerald'
      },
      {
        id: 'costing',
        label: 'Pre-Costing & Profit Margins',
        shortLabel: 'Pre-Costing',
        description: 'Fabric, trims, CM, overheads, FOB pricing quotation & target net margins',
        icon: Layers,
        badge: 'FOB & CM',
        badgeColor: 'amber'
      }
    ]
  },
  {
    id: 'supplychain',
    title: 'Supply Chain & Warehouse',
    shortTitle: 'Supply Chain',
    phaseBadge: 'Phase 3',
    icon: Truck,
    description: 'Supplier scorecards, purchase requisitions, supplier POs & multi-bin inventory',
    defaultTabId: 'warehouse',
    items: [
      {
        id: 'suppliers',
        label: 'Supplier Directory & Scorecards',
        shortLabel: 'Suppliers',
        description: 'Yarn, fabric & trims suppliers with on-time delivery & quality scoring',
        icon: Truck,
        badge: 'OTD Scoring',
        badgeColor: 'blue'
      },
      {
        id: 'procurement',
        label: 'PR, Supplier PO & GRN Receiving',
        shortLabel: 'Procurement',
        description: 'Purchase requisitions, supplier PO issuance & warehouse Goods Received Notes',
        icon: FileSpreadsheet,
        badge: 'GRN Engine',
        badgeColor: 'emerald'
      },
      {
        id: 'warehouse',
        label: 'Multi-Warehouse & Stock Engine',
        shortLabel: 'Warehouse Stock',
        description: 'Savar & Gazipur fabric rolls, trims bins, stock allocation & issue tracking',
        icon: Package,
        badge: 'Bin Tracking',
        badgeColor: 'amber'
      }
    ]
  },
  {
    id: 'production',
    title: 'Garments Production Floor',
    shortTitle: 'Production',
    phaseBadge: 'Phase 4',
    icon: Scissors,
    description: 'Fabric relaxation, spreading, cutting panels, QR bundling, sewing lines & packing',
    defaultTabId: 'sewing',
    items: [
      {
        id: 'cutting',
        label: 'Cutting & 24h Fabric Relaxation',
        shortLabel: 'Cutting Section',
        description: 'Fabric relaxation timers, spreading tables, cut panel audits & QR bundle tags',
        icon: Scissors,
        badge: 'QR Bundles',
        badgeColor: 'blue'
      },
      {
        id: 'sewing',
        label: 'Sewing Lines 01–04 Hourly Output',
        shortLabel: 'Sewing Floor',
        description: 'Real-time hourly production run-rates, target vs actual pieces & line efficiency',
        icon: Layers,
        badge: 'Lines 01–04',
        badgeColor: 'emerald'
      },
      {
        id: 'finishing',
        label: 'Finishing & Carton Packing',
        shortLabel: 'Finishing & Pack',
        description: 'Thread trimming, steam pressing, metal needle detection & ratio carton packing',
        icon: Boxes,
        badge: 'Ratio Pack',
        badgeColor: 'purple'
      }
    ]
  },
  {
    id: 'qa',
    title: 'Quality Assurance (QA/QC)',
    shortTitle: 'QA / QC',
    phaseBadge: 'Phase 5',
    icon: CheckCircle2,
    description: 'ASTM 4-point fabric rolls, inline sewing QC, rework repair & ISO AQL 2.5 audits',
    defaultTabId: 'sewing-qc',
    items: [
      {
        id: 'fabric-qc',
        label: 'Fabric 4-Point Roll Inspection',
        shortLabel: 'Fabric 4-Point',
        description: 'ASTM D5430 standard roll penalty scoring, point calculations & pass/reject',
        icon: CheckCircle2,
        badge: 'ASTM D5430',
        badgeColor: 'blue'
      },
      {
        id: 'sewing-qc',
        label: 'Inline & End-Line QC & DHU',
        shortLabel: 'Inline Sewing QC',
        description: 'Traffic-light sewing defect logging, top 8 defect categories & live line DHU %',
        icon: Activity,
        badge: 'Live DHU %',
        badgeColor: 'emerald'
      },
      {
        id: 'rework-capa',
        label: 'Rework Orders & CAPA 5-Whys',
        shortLabel: 'Rework & CAPA',
        description: 'Defect rework loop closure, repair station log & Ishikawa 5-Whys root cause analysis',
        icon: RefreshCw,
        badge: '5-Whys CAPA',
        badgeColor: 'amber'
      },
      {
        id: 'aql-audit',
        label: 'ISO AQL 2.5 Pre-Shipment Audit',
        shortLabel: 'ISO AQL 2.5',
        description: 'ISO 2859-1 Level II normal sampling tables, acceptance thresholds & export pass certificate',
        icon: Award,
        badge: 'ISO 2859-1',
        badgeColor: 'purple'
      }
    ]
  },
  {
    id: 'shipment',
    title: 'Shipment & Logistics Hub',
    shortTitle: 'Logistics',
    phaseBadge: 'Phase 6',
    icon: Ship,
    description: 'AQL quality gate security, export invoices, automated CBM packing lists & security gate passes',
    defaultTabId: 'shipment',
    items: [
      {
        id: 'shipment',
        subTab: 'shipments',
        label: 'Export Shipments & Quality Gate',
        shortLabel: 'Shipments',
        description: 'AQL certification gate validation, export consignments & port booking status',
        icon: Ship,
        badge: 'Quality Gate',
        badgeColor: 'emerald',
        permission: 'shipment:approve'
      },
      {
        id: 'shipment',
        subTab: 'invoices',
        label: 'Export Commercial Invoices',
        shortLabel: 'Commercial Invoices',
        description: 'Customs-compliant export invoices with buyer LC reference & FOB values',
        icon: FileText,
        badge: 'FOB Invoicing',
        badgeColor: 'blue',
        permission: 'shipment:approve'
      },
      {
        id: 'shipment',
        subTab: 'packing',
        label: 'Export Packing Lists & CBM',
        shortLabel: 'Packing Lists',
        description: 'Automated carton volume (CBM), gross/net weight calculations & 40FT HQ container seals',
        icon: Package,
        badge: 'Auto CBM',
        badgeColor: 'purple',
        permission: 'shipment:approve'
      },
      {
        id: 'shipment',
        subTab: 'gatepass',
        label: 'Security Gate Pass Clearance',
        shortLabel: 'Gate Passes',
        description: 'Driver credentials, container seal verification & tamper-evident gate exit slips',
        icon: ShieldCheck,
        badge: 'Customs Pass',
        badgeColor: 'amber',
        permission: 'shipment:approve'
      }
    ]
  },
  {
    id: 'operations',
    title: 'Factory Operations & Compliance',
    shortTitle: 'Operations',
    phaseBadge: 'Phase 7',
    icon: Building,
    description: 'HR biometric attendance, BD Labor Act 2006 payroll, machine maintenance & compliance audits',
    defaultTabId: 'hr',
    items: [
      {
        id: 'hr',
        subTab: 'hr',
        label: 'HR, Shifts & Biometric Payroll',
        shortLabel: 'HR & Payroll',
        description: 'Operator roster, biometric clock punches & BD Labor Act 2006 2x basic overtime engine',
        icon: Users,
        badge: 'Labor Act 2006',
        badgeColor: 'emerald'
      },
      {
        id: 'maintenance',
        subTab: 'maintenance',
        label: 'Machinery Fleet & Work Orders',
        shortLabel: 'Maintenance',
        description: 'Sewing machine assets (Juki, Brother), preventive schedules & emergency breakdown tickets',
        icon: Wrench,
        badge: 'Fleet & MTTR',
        badgeColor: 'blue'
      },
      {
        id: 'finance',
        subTab: 'finance',
        label: 'Cost Centers & Order Margins',
        shortLabel: 'Finance & Margins',
        description: 'Plant expense ledger, cost center allocations & realized buyer order net profitability',
        icon: DollarSign,
        badge: 'Margin Engine',
        badgeColor: 'amber'
      },
      {
        id: 'compliance',
        subTab: 'compliance',
        label: 'Social & Safety Compliance Audits',
        shortLabel: 'Compliance',
        description: 'BSCI, Sedex, and Accord fire/building safety compliance audit certifications',
        icon: ShieldCheck,
        badge: 'BSCI / Sedex',
        badgeColor: 'purple'
      }
    ]
  },
  {
    id: 'analytics',
    title: 'Executive Plant BI & Telemetry',
    shortTitle: 'Executive BI',
    phaseBadge: 'Phase 8',
    icon: Activity,
    description: 'Order 360° digital passport, factory OEE calculation, real-time alerts & benchmarking',
    defaultTabId: 'analytics',
    items: [
      {
        id: 'analytics',
        subTab: 'traceability',
        label: 'Order Traceability 360° Passport',
        shortLabel: 'Order 360°',
        description: 'Unified 10-milestone digital manufacturing passport from buyer PO to port dispatch',
        icon: Barcode,
        badge: '10 Milestones',
        badgeColor: 'blue'
      },
      {
        id: 'analytics',
        subTab: 'bi',
        label: 'Executive Plant BI & OEE Engine',
        shortLabel: 'Executive BI & OEE',
        description: 'Overall Equipment Effectiveness (85.1% OEE), Lines 01–04 output & defect Pareto 80/20',
        icon: TrendingUp,
        badge: '85.1% OEE',
        badgeColor: 'emerald'
      },
      {
        id: 'analytics',
        subTab: 'alerts',
        label: 'Live Event Stream & Plant Alerts',
        shortLabel: 'Live Alerts',
        description: 'Real-time telemetry event stream with CRITICAL/WARNING threshold monitoring',
        icon: Activity,
        badge: 'Real-Time',
        badgeColor: 'rose'
      },
      {
        id: 'analytics',
        subTab: 'benchmark',
        label: 'Multi-Factory Unit Benchmarking',
        shortLabel: 'Benchmarking',
        description: 'Side-by-side efficiency and capacity comparison: Savar Unit 1 vs Gazipur Complex',
        icon: Cpu,
        badge: 'Savar vs Gazipur',
        badgeColor: 'purple'
      }
    ]
  },
  {
    id: 'admin',
    title: 'System Administration & RBAC',
    shortTitle: 'Administration',
    phaseBadge: 'Phase 1',
    icon: ShieldAlert,
    description: 'Enterprise organization hierarchy, 14-role RBAC permissions matrix & audit logs',
    defaultTabId: 'organization',
    items: [
      {
        id: 'organization',
        label: 'Organization & Factory Tree',
        shortLabel: 'Org Tree',
        description: 'Multi-factory corporate hierarchy, units, production lines & physical zones',
        icon: Building,
        badge: 'Multi-Plant',
        badgeColor: 'blue',
        permission: 'org:view'
      },
      {
        id: 'rbac',
        label: 'RBAC & 14 Roles Matrix',
        shortLabel: 'RBAC Matrix',
        description: 'Garment manufacturing role-based permissions matrix & live persona simulation',
        icon: ShieldAlert,
        badge: '14 Roles',
        badgeColor: 'purple',
        permission: 'roles:manage'
      },
      {
        id: 'audit',
        label: 'Tamper-Evident Audit Logs',
        shortLabel: 'Audit Logs',
        description: 'SHA-256 cryptographically chained activity ledger of all factory events',
        icon: History,
        badge: 'Chained Logs',
        badgeColor: 'slate',
        permission: 'audit:view'
      }
    ]
  }
];

export const getBadgeColorClass = (color?: string) => {
  switch (color) {
    case 'emerald':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'blue':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'amber':
      return 'bg-amber-50 text-amber-800 border-amber-200';
    case 'purple':
      return 'bg-purple-50 text-purple-700 border-purple-200';
    case 'rose':
      return 'bg-rose-50 text-rose-700 border-rose-200';
    default:
      return 'bg-slate-50 text-slate-600 border-slate-200';
  }
};

export const findModuleByTab = (tabId: string, subTab?: string): ModuleMenu | undefined => {
  if (subTab) {
    const matchWithSubTab = MODULE_MENUS.find(m => 
      m.items.some(item => item.id === tabId && item.subTab === subTab)
    );
    if (matchWithSubTab) return matchWithSubTab;
  }
  return MODULE_MENUS.find(m => 
    m.items.some(item => item.id === tabId)
  );
};

export const findSubmenuItem = (tabId: string, subTab?: string): SubMenuItem | undefined => {
  if (subTab) {
    for (const m of MODULE_MENUS) {
      const found = m.items.find(item => item.id === tabId && item.subTab === subTab);
      if (found) return found;
    }
  }
  for (const m of MODULE_MENUS) {
    const found = m.items.find(item => item.id === tabId);
    if (found) return found;
  }
  return undefined;
};
