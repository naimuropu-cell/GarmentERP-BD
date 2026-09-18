import React from 'react';
import { 
  ShieldCheck, 
  Layers, 
  CheckCircle2, 
  TrendingUp, 
  Clock, 
  ArrowRight, 
  GitBranch, 
  Sparkles, 
  Award,
  Activity,
  Scissors
} from 'lucide-react';
import { User } from '../../types';

interface OverviewDashboardProps {
  user: User;
  onNavigate: (tabId: string) => void;
}

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({ user, onNavigate }) => {
  const kpis = [
    { label: 'Active Production Lines', val: '8 Lines', sub: 'Savar + Gazipur units', change: '+2 lines live', icon: Layers, color: 'text-emerald-700', bg: 'bg-emerald-50' },
    { label: 'Factory Efficiency Target', val: '91.4%', sub: 'Target vs actual output', change: '+3.2% this week', icon: TrendingUp, color: 'text-emerald-700', bg: 'bg-emerald-50' },
    { label: 'Quality & Defect Rate (AQL)', val: '1.4%', sub: 'Well within 2.5% AQL threshold', change: '0.4% lower defects', icon: ShieldCheck, color: 'text-emerald-700', bg: 'bg-emerald-50' },
    { label: 'RBAC Personas Enforced', val: '14 Roles', sub: '45+ granular permissions', change: '100% compliant', icon: Award, color: 'text-amber-600', bg: 'bg-amber-50' }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Banner - Deep Green with subtle gold accent */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 border border-emerald-700/40 p-6 shadow-md text-white">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-slate-950 border border-amber-300 flex items-center gap-1.5 shadow-sm">
                <Sparkles className="w-3 h-3 text-slate-950" />
                Phase 5 Active • Core QA/QC Suite & ISO AQL 2.5 Sampling
              </span>
              <span className="text-xs text-emerald-200 font-mono">Bangladesh Garments ERP</span>
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              Welcome back, {user.fullName}
            </h1>
            <p className="text-xs text-emerald-100 max-w-2xl leading-relaxed">
              You are currently authenticated as <span className="font-bold text-white underline decoration-amber-400">{user.role.name}</span> in the <span className="text-white font-semibold">Apex Garments Holdings</span> manufacturing environment.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate('fabric-qc')}
              className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-emerald-900 text-xs font-bold shadow-md flex items-center gap-2 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Scissors className="w-4 h-4 text-emerald-700" />
              <span>Fabric 4-Point QC</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onNavigate('sewing-qc')}
              className="px-4 py-2.5 rounded-xl bg-emerald-700/80 hover:bg-emerald-600 text-white text-xs font-bold border border-emerald-600 flex items-center gap-2 transition-all cursor-pointer"
            >
              <Activity className="w-4 h-4 text-emerald-300" />
              <span>Inline Sewing QC & DHU</span>
            </button>
            <button
              onClick={() => onNavigate('aql-audit')}
              className="px-4 py-2.5 rounded-xl bg-emerald-700/80 hover:bg-emerald-600 text-white text-xs font-bold border border-emerald-600 flex items-center gap-2 transition-all cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-amber-300" />
              <span>ISO AQL 2.5 Audit</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">{kpi.label}</span>
                <div className={`p-2 rounded-xl ${kpi.bg}`}>
                  <Icon className={`w-4 h-4 ${kpi.color}`} />
                </div>
              </div>

              <div>
                <p className="text-2xl font-extrabold text-slate-900 tracking-tight">{kpi.val}</p>
                <div className="flex items-center justify-between mt-1 text-[11px]">
                  <span className="text-slate-500">{kpi.sub}</span>
                  <span className="font-semibold text-emerald-700">{kpi.change}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Roadmap & Module Checklist */}
      <div className="grid lg:grid-cols-12 gap-6">
        {/* Module Status Checklist */}
        <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">GarmentERP BD — Modular Roadmap Status</h3>
              <p className="text-xs text-slate-500">Step-by-step factory implementation lifecycle</p>
            </div>
            <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
              Phase 5 / 8 Active
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
                mod: 'Module 09: Core QA/QC Suite, Defect Severity & AQL 2.5',
                desc: 'Fabric 4-point system, inline/end-line QC, Critical/Major/Minor defect matrix, rework routing, CAPA 5-Whys, and ISO AQL sampling.',
                status: 'ACTIVE NOW',
                tag: 'Phase 5',
                active: true
              }
            ].map((item, i) => (
              <div
                key={i}
                className={`p-4 rounded-xl border flex items-start justify-between gap-4 transition-all ${
                  item.active
                    ? 'bg-slate-50 border-slate-200 hover:border-emerald-300'
                    : 'bg-white border-slate-200 opacity-75'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    {item.active ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                    <h4 className={`text-xs font-bold ${item.active ? 'text-slate-900' : 'text-slate-600'}`}>
                      {item.mod}
                    </h4>
                    <span className="px-2 py-0.5 rounded text-[9px] font-mono bg-white text-slate-600 border border-slate-200">
                      {item.tag}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 pl-6 leading-relaxed">{item.desc}</p>
                </div>

                <span
                  className={`shrink-0 px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-wide font-mono ${
                    item.status === 'ACTIVE NOW'
                      ? 'bg-amber-100 text-amber-800 border border-amber-300'
                      : item.active
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-slate-100 text-slate-600 border border-slate-200'
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
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-xs">
              <GitBranch className="w-4 h-4 text-emerald-700" />
              <span>SQA & Portfolio Assets</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Automated testing and architectural documentation included for technical interviews:
            </p>

            <div className="space-y-2">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <p className="font-semibold text-slate-900">Postman Automated Collections</p>
                <p className="text-[10px] text-emerald-700 font-mono mt-0.5">postman/GarmentERP_QA_QC_Phase5.postman_collection.json</p>
                <p className="text-[10px] text-slate-500 font-mono mt-0.5">postman/GarmentERP_Production_Phase4.postman_collection.json</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <p className="font-semibold text-slate-900">System Specifications</p>
                <p className="text-[10px] text-slate-500 font-mono mt-0.5">docs/SRS.md • docs/ERD.md • docs/API.md</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <p className="font-semibold text-slate-900">End-to-End Operational Lifecycle</p>
                <p className="text-[10px] text-slate-500 font-mono mt-0.5">docs/WORKFLOW.md</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
