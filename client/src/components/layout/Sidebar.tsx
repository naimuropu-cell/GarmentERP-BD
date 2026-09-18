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
  Lock
} from 'lucide-react';
import { User } from '../../types';

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  permission?: string | null;
  disabled?: boolean;
  phase?: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tabId: string) => void;
  user: User;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onSelectTab, user }) => {
  const navSections: NavSection[] = [
    {
      title: 'Phase 1 — Core Foundation',
      items: [
        { id: 'overview', label: 'Overview & Status', icon: LayoutDashboard, permission: null },
        { id: 'organization', label: 'Organization & Factory Tree', icon: Building, permission: 'org:view' },
        { id: 'rbac', label: 'RBAC & 14 Roles Matrix', icon: ShieldAlert, permission: 'roles:manage' },
        { id: 'audit', label: 'Tamper-Evident Audit Logs', icon: History, permission: 'audit:view' }
      ]
    },
    {
      title: 'Phase 2 — Commercial & Orders',
      items: [
        { id: 'buyers', label: 'Buyer Profiles & Terms', icon: ShoppingBag, permission: null },
        { id: 'styles', label: 'Style Master & Tech Packs', icon: FileText, permission: null },
        { id: 'orders', label: 'Buyer POs & MRP Shortage', icon: ShoppingBag, permission: null },
        { id: 'costing', label: 'Pre-Costing & Profit Margins', icon: Layers, permission: null }
      ]
    },
    {
      title: 'Phase 3 — SCM & Inventory',
      items: [
        { id: 'suppliers', label: 'Supplier Scorecards', icon: Truck, permission: null },
        { id: 'procurement', label: 'PR, Supplier PO & GRN', icon: ShoppingBag, permission: null },
        { id: 'warehouse', label: 'Multi-Warehouse & Stock Engine', icon: Package, permission: null }
      ]
    },
    {
      title: 'Phase 4 — Garments Production',
      items: [
        { id: 'cutting', label: 'Cutting & 24h Relaxation', icon: Scissors, permission: null },
        { id: 'sewing', label: 'Sewing Lines 01-04 Output', icon: Layers, permission: null },
        { id: 'finishing', label: 'Finishing & Carton Packing', icon: Package, permission: null }
      ]
    },
    {
      title: 'Phase 5 — Quality Control (QA/QC)',
      items: [
        { id: 'quality', label: 'Inspections, Defects, Rework & AQL', icon: CheckCircle2, disabled: true, phase: 'Phase 5' }
      ]
    },
    {
      title: 'Phase 6, 7 & 8 — Commercial & Ops',
      items: [
        { id: 'shipment', label: 'Shipment & Gate Pass', icon: Ship, disabled: true, phase: 'Phase 6' },
        { id: 'hr', label: 'HR, Shifts & Biometric Payroll', icon: Users, disabled: true, phase: 'Phase 7' },
        { id: 'finance', label: 'Operational Cost & Margins', icon: DollarSign, disabled: true, phase: 'Phase 7' },
        { id: 'maintenance', label: 'Machine Preventive Tickets', icon: Wrench, disabled: true, phase: 'Phase 7' }
      ]
    }
  ];

  return (
    <aside className="w-64 border-r border-slate-800 bg-slate-900/60 flex flex-col justify-between shrink-0 select-none overflow-y-auto">
      <div className="p-4 space-y-6">
        {navSections.map((section, idx) => (
          <div key={idx} className="space-y-1.5">
            <h3 className="px-3 text-[10px] font-bold tracking-wider uppercase text-slate-400">
              {section.title}
            </h3>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isCurrent = currentTab === item.id;
                const isDisabled = item.disabled;
                const hasPermission = !item.permission || user.role.code === 'SUPER_ADMIN' || user.role.permissions.includes(item.permission);

                if (isDisabled) {
                  return (
                    <div
                      key={item.id}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs text-slate-400 opacity-60 cursor-not-allowed group"
                      title={`Scheduled for ${item.phase}`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <Icon className="w-4 h-4 shrink-0 text-slate-400" />
                        <span className="truncate">{item.label}</span>
                      </div>
                      <span className="text-[9px] font-medium px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700">
                        {item.phase}
                      </span>
                    </div>
                  );
                }

                if (!hasPermission) {
                  return (
                    <div
                      key={item.id}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs text-slate-400 opacity-50 cursor-not-allowed"
                      title="Access restricted by your active Role permissions"
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <Icon className="w-4 h-4 shrink-0 text-slate-400" />
                        <span className="truncate">{item.label}</span>
                      </div>
                      <Lock className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                  );
                }

                return (
                  <button
                    key={item.id}
                    onClick={() => onSelectTab(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                      isCurrent
                        ? 'bg-brand-500/15 text-brand-400 font-bold border border-brand-500/30 shadow-sm'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Icon className={`w-4 h-4 shrink-0 ${isCurrent ? 'text-brand-400' : 'text-slate-400'}`} />
                      <span className="truncate">{item.label}</span>
                    </div>
                    {isCurrent && (
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-400 shadow-[0_0_8px_#22c55e]" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer info */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/40">
        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <span>GarmentERP BD</span>
          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300">v1.0.0</span>
        </div>
        <p className="text-[10px] text-slate-400 mt-1">Phase 1: Foundation & RBAC</p>
      </div>
    </aside>
  );
};
