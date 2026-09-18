import React from 'react';
import { 
  Building2, 
  ShieldCheck, 
  Layers, 
  CheckCircle2, 
  TrendingUp, 
  Clock, 
  ArrowRight,
  GitBranch,
  Sparkles,
  Award
} from 'lucide-react';
import { User } from '../../types';

interface OverviewDashboardProps {
  user: User;
  onNavigate: (tabId: string) => void;
}

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({ user, onNavigate }) => {
  const kpis = [
    { label: 'Active Production Lines', val: '8 Lines', sub: 'Savar + Gazipur units', change: '+2 lines live', icon: Layers, color: 'text-brand-400', bg: 'bg-brand-500/10' },
    { label: 'Factory Efficiency Target', val: '91.4%', sub: 'Target vs actual output', change: '+3.2% this week', icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { label: 'Quality & Defect Rate', val: '1.8%', sub: 'Within 2.5% AQL threshold', change: '0.4% lower defects', icon: ShieldCheck, color: 'text-sky-400', bg: 'bg-sky-500/10' },
    { label: 'RBAC Personas Enforced', val: '14 Roles', sub: '45+ granular permissions', change: '100% compliant', icon: Award, color: 'text-amber-400', bg: 'bg-amber-500/10' }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-brand-950 via-slate-900 to-slate-900 border border-brand-500/30 p-6 shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-brand-500/20 text-brand-400 border border-brand-500/30 flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-brand-400" />
                Phase 4 Active • Production (Cutting, Sewing Lines 01-04 & Packing)
              </span>
              <span className="text-xs text-slate-400 font-mono">Bangladesh Garments ERP</span>
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              Welcome back, {user.fullName}
            </h1>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              You are currently authenticated as <span className="font-bold text-white underline decoration-brand-500">{user.role.name}</span> in the <span className="text-white font-semibold">Apex Garments Holdings</span> manufacturing environment.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate('cutting')}
              className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-lg shadow-brand-600/30 flex items-center gap-2 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Building2 className="w-4 h-4" />
              <span>Cutting & Bundles</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onNavigate('sewing')}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 flex items-center gap-2 transition-all cursor-pointer"
            >
              <Layers className="w-4 h-4 text-emerald-400" />
              <span>Sewing Lines 01-04</span>
            </button>
            <button
              onClick={() => onNavigate('finishing')}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 flex items-center gap-2 transition-all cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-sky-400" />
              <span>Finishing & Packing</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div key={idx} className="glass-panel p-5 rounded-2xl border border-slate-800 flex flex-col justify-between space-y-4 hover:border-slate-700 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">{kpi.label}</span>
                <div className={`p-2 rounded-xl ${kpi.bg}`}>
                  <Icon className={`w-4 h-4 ${kpi.color}`} />
                </div>
              </div>

              <div>
                <p className="text-2xl font-extrabold text-white tracking-tight">{kpi.val}</p>
                <div className="flex items-center justify-between mt-1 text-[11px]">
                  <span className="text-slate-400">{kpi.sub}</span>
                  <span className="font-semibold text-brand-400">{kpi.change}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Roadmap & Module Checklist */}
      <div className="grid lg:grid-cols-12 gap-6">
        {/* Module Status Checklist */}
        <div className="lg:col-span-8 glass-panel p-6 rounded-2xl border border-slate-800 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">GarmentERP BD — Modular Roadmap Status</h3>
              <p className="text-xs text-slate-400">Step-by-step factory implementation lifecycle</p>
            </div>
            <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-brand-500/10 text-brand-400 border border-brand-500/20">
              Phase 4 / 8 Completed
            </span>
          </div>

          <div className="space-y-3">
            {[
              {
                mod: 'Module 01 & 02: Core Foundation, RBAC & Factory Topology',
                desc: 'User auth (JWT + refresh), 14 personas, Savar & Gazipur units, buildings, floors, lines, and tamper-evident audit logs.',
                status: 'COMPLETE',
                tag: 'Phase 1',
                active: true
              },
              {
                mod: 'Module 03, 04, 05: Buyer, Style Tech Pack, PO & Costing',
                desc: 'Buyer profiles, Tech Pack versioning (v1, v2), measurement tolerances, pre-cost sheets (Fabric, CM, margin), and PO intake.',
                status: 'COMPLETE',
                tag: 'Phase 2',
                active: true
              },
              {
                mod: 'Module 06 & 07: SCM, Procurement, GRN & Negative Stock Engine',
                desc: 'Certified suppliers, PR approval workflow, Supplier PO (SPO), Gate Entry GRN, and 100% strict negative stock prevention.',
                status: 'COMPLETE',
                tag: 'Phase 3',
                active: true
              },
              {
                mod: 'Module 08: Production: Cutting, Sewing, Finishing & Packing',
                desc: 'Fabric relaxation 24h timer, cut orders, QR bundling, hourly line tracking, folding, and carton ratio packing list.',
                status: 'COMPLETE',
                tag: 'Phase 4',
                active: true
              },
              {
                mod: 'Module 09: Core QA/QC Suite, Defect Severity & AQL',
                desc: 'Fabric 4-point, inline QC, Critical/Major/Minor defects, rework orders, CAPA 5-Whys, and configurable ISO AQL tables.',
                status: 'QUEUED FOR PHASE 5',
                tag: 'Phase 5',
                active: false
              }
            ].map((item, i) => (
              <div
                key={i}
                className={`p-4 rounded-xl border flex items-start justify-between gap-4 transition-all ${
                  item.active
                    ? 'bg-brand-950/30 border-brand-500/40 ring-1 ring-brand-500/20'
                    : 'bg-slate-900/50 border-slate-800 opacity-75'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    {item.active ? (
                      <CheckCircle2 className="w-4 h-4 text-brand-400 shrink-0" />
                    ) : (
                      <Clock className="w-4 h-4 text-slate-500 shrink-0" />
                    )}
                    <h4 className={`text-xs font-bold ${item.active ? 'text-white' : 'text-slate-300'}`}>
                      {item.mod}
                    </h4>
                    <span className="px-2 py-0.5 rounded text-[9px] font-mono bg-slate-800 text-slate-400 border border-slate-700">
                      {item.tag}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 pl-6 leading-relaxed">{item.desc}</p>
                </div>

                <span
                  className={`shrink-0 px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-wide font-mono ${
                    item.active
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}
                >
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick SQA Portfolio Highlights */}
        <div className="lg:col-span-4 space-y-4">
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center gap-2 text-white font-bold text-xs">
              <GitBranch className="w-4 h-4 text-brand-400" />
              <span>SQA & Portfolio Assets</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Automated testing and architectural documentation included for technical interviews:
            </p>

            <div className="space-y-2">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                <p className="font-semibold text-slate-200">Postman Automated Collections</p>
                <p className="text-[10px] text-slate-400 font-mono mt-0.5">postman/GarmentERP_Production_Phase4.postman_collection.json</p>
                <p className="text-[10px] text-slate-400 font-mono mt-0.5">postman/GarmentERP_SupplyChain_Phase3.postman_collection.json</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                <p className="font-semibold text-slate-200">System Specifications</p>
                <p className="text-[10px] text-slate-400 font-mono mt-0.5">docs/SRS.md • docs/ERD.md • docs/API.md</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                <p className="font-semibold text-slate-200">End-to-End Operational Lifecycle</p>
                <p className="text-[10px] text-slate-400 font-mono mt-0.5">docs/WORKFLOW.md</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
