import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Search, 
  CheckCircle2, 
  TrendingUp, 
  ShieldCheck, 
  Clock, 
  Sparkles, 
  Check, 
  Bell, 
  Plus, 
  Cpu, 
  Building
} from 'lucide-react';
import { 
  OrderTraceability360, 
  ExecutiveBiSummary, 
  SystemAlert, 
  FactoryUnitComparison, 
  DefectParetoItem, 
  OrderMilestone 
} from '../../types/analytics';

interface AnalyticsViewProps {
  initialSubTab?: 'traceability' | 'bi' | 'alerts' | 'benchmark';
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ initialSubTab = 'traceability' }) => {
  const [activeTab, setActiveTab] = useState<'traceability' | 'bi' | 'alerts' | 'benchmark'>(initialSubTab);

  useEffect(() => {
    if (initialSubTab) {
      setActiveTab(initialSubTab);
    }
  }, [initialSubTab]);

  const [loading, setLoading] = useState(true);
  const [selectedPo, setSelectedPo] = useState('PO-2026-001');

  // State
  const [traceability, setTraceability] = useState<OrderTraceability360 | null>(null);
  const [selectedMilestone, setSelectedMilestone] = useState<OrderMilestone | null>(null);
  const [biSummary, setBiSummary] = useState<ExecutiveBiSummary | null>(null);
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [alertFilter, setAlertFilter] = useState<'ALL' | 'CRITICAL' | 'WARNING' | 'INFO'>('ALL');
  const [pareto, setPareto] = useState<DefectParetoItem[]>([]);
  const [factories, setFactories] = useState<FactoryUnitComparison[]>([]);

  // Simulation Modal
  const [showSimModal, setShowSimModal] = useState(false);
  const [simData, setSimData] = useState({
    severity: 'WARNING' as const,
    category: 'QUALITY' as const,
    sourceModule: 'SEWING_LINE_02',
    title: 'Inline Stitch Tension Drift',
    message: 'Needle thread tension imbalance detected on Station 14.',
    referenceId: 'PO-2026-001'
  });

  const token = localStorage.getItem('garment_access_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };

  const fetchAnalyticsData = async () => {
    setLoading(true);
    try {
      const [traceRes, biRes, alertRes, paretoRes, factoryRes] = await Promise.all([
        fetch(`/api/v1/analytics/order-traceability/${selectedPo}`, { headers }),
        fetch('/api/v1/analytics/executive-summary', { headers }),
        fetch('/api/v1/analytics/alerts', { headers }),
        fetch('/api/v1/analytics/defects-pareto', { headers }),
        fetch('/api/v1/analytics/factory-comparison', { headers })
      ]);

      const [traceJson, biJson, alertJson, paretoJson, factoryJson] = await Promise.all([
        traceRes.json(),
        biRes.json(),
        alertRes.json(),
        paretoRes.json(),
        factoryRes.json()
      ]);

      if (traceJson.success && traceJson.data) {
        setTraceability(traceJson.data);
        if (traceJson.data.milestones?.length > 0) {
          setSelectedMilestone(traceJson.data.milestones[0]);
        }
      }
      if (biJson.success) setBiSummary(biJson.data);
      if (alertJson.success) setAlerts(alertJson.data);
      if (paretoJson.success) setPareto(paretoJson.data);
      if (factoryJson.success) setFactories(factoryJson.data);
    } catch (err) {
      console.error('Failed to load analytics data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, [selectedPo]);

  const handleAcknowledgeAlert = async (alertId: string) => {
    try {
      const res = await fetch('/api/v1/analytics/alerts/acknowledge', {
        method: 'POST',
        headers,
        body: JSON.stringify({ alertId, acknowledgedBy: 'Operations Authority' })
      });
      const json = await res.json();
      if (json.success) {
        setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, acknowledged: true } : a));
      }
    } catch (err) {
      console.error('Failed to acknowledge alert:', err);
    }
  };

  const handleSimulateAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/v1/analytics/alerts/simulate', {
        method: 'POST',
        headers,
        body: JSON.stringify(simData)
      });
      const json = await res.json();
      if (json.success) {
        setShowSimModal(false);
        setAlerts(prev => [json.data, ...prev]);
      }
    } catch (err) {
      console.error('Failed to simulate alert:', err);
    }
  };

  const filteredAlerts = alertFilter === 'ALL' 
    ? alerts 
    : alerts.filter(a => a.severity === alertFilter);

  return (
    <div className="space-y-6">
      {/* Executive Header Banner */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3" />
              Phase 8 System Intelligence
            </span>
            <span className="text-xs text-slate-400 font-medium">Apex Garments Telemetry Engine</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight mt-1">
            Executive Plant BI & Order Traceability 360°
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            End-to-end digital passport lifecycle tracking, Overall Equipment Effectiveness (OEE), live alert telemetry, and cross-factory benchmarks.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'alerts' && (
            <button
              onClick={() => setShowSimModal(true)}
              className="px-3.5 py-2 text-xs font-medium text-white bg-emerald-700 rounded-lg hover:bg-emerald-800 flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              Simulate Sensor Alert
            </button>
          )}

          {activeTab === 'traceability' && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">Select PO:</span>
              <select
                value={selectedPo}
                onChange={(e) => setSelectedPo(e.target.value)}
                aria-label="Select Purchase Order for Traceability"
                className="text-xs font-semibold border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 shadow-xs"
              >
                <option value="PO-2026-001">PO-2026-001 (H&M 10,000 pcs Polo)</option>
                <option value="PO-2026-002">PO-2026-002 (Zara Fleece Hoodie)</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Sub-Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('traceability')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'traceability'
              ? 'bg-emerald-700 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Search className="w-4 h-4" />
          Order Traceability 360°
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
            activeTab === 'traceability' ? 'bg-emerald-800 text-white' : 'bg-slate-200 text-slate-700'
          }`}>
            10 Stages
          </span>
        </button>

        <button
          onClick={() => setActiveTab('bi')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'bi'
              ? 'bg-emerald-700 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          Executive BI & OEE
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
            activeTab === 'bi' ? 'bg-emerald-800 text-white' : 'bg-slate-200 text-slate-700'
          }`}>
            85.1% OEE
          </span>
        </button>

        <button
          onClick={() => setActiveTab('alerts')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'alerts'
              ? 'bg-emerald-700 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Bell className="w-4 h-4" />
          Live Event Alerts
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
            activeTab === 'alerts' ? 'bg-emerald-800 text-white' : 'bg-amber-100 text-amber-800'
          }`}>
            {alerts.filter(a => !a.acknowledged).length} Active
          </span>
        </button>

        <button
          onClick={() => setActiveTab('benchmark')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'benchmark'
              ? 'bg-emerald-700 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Building className="w-4 h-4" />
          Factory Benchmarking
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
            activeTab === 'benchmark' ? 'bg-emerald-800 text-white' : 'bg-slate-200 text-slate-700'
          }`}>
            Savar vs Gazipur
          </span>
        </button>
      </div>

      {loading ? (
        <div className="bg-white p-12 rounded-xl border border-slate-200 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mb-3" />
          <p className="text-sm text-slate-500 font-medium">Aggregating factory plant telemetry & order ledger...</p>
        </div>
      ) : (
        <>
          {/* ========================================================================= */}
          {/* 1. ORDER TRACEABILITY 360° SUB-TAB */}
          {/* ========================================================================= */}
          {activeTab === 'traceability' && traceability && (
            <div className="space-y-6">
              {/* Order Passport Header Card */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Order Passport 360°
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                        {traceability.overallHealth.replace(/_/g, ' ')}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                        Current: {traceability.currentStage.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 mt-1">
                      {traceability.poNumber} — {traceability.buyerName}
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Style: <span className="font-semibold text-slate-700">{traceability.styleNumber}</span> · Ex-Factory Delivery: <span className="font-semibold text-slate-700">{traceability.deliveryDate}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-4 text-right">
                    <div>
                      <div className="text-xs text-slate-400 font-medium">Order Quantity</div>
                      <div className="text-xl font-bold text-slate-800">{traceability.orderQuantity.toLocaleString()} pcs</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-400 font-medium">Commercial Value</div>
                      <div className="text-xl font-extrabold text-emerald-700">${traceability.totalRevenueUsd.toLocaleString()}</div>
                    </div>
                  </div>
                </div>

                {/* 10 Milestones Interactive Flow Line */}
                <div className="mt-6">
                  <div className="text-xs font-bold text-slate-600 mb-3 uppercase tracking-wider">
                    Manufacturing Lifecycle Progression (10 Verification Milestones)
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-2">
                    {traceability.milestones.map((m) => {
                      const isSelected = selectedMilestone?.stageNumber === m.stageNumber;
                      return (
                        <button
                          key={m.stageNumber}
                          onClick={() => setSelectedMilestone(m)}
                          className={`p-2.5 rounded-lg border text-left transition-all relative cursor-pointer ${
                            isSelected
                              ? 'border-emerald-600 bg-emerald-50/70 ring-1 ring-emerald-500 shadow-xs'
                              : 'border-slate-200 bg-slate-50 hover:bg-white'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-slate-400">0{m.stageNumber}</span>
                            <span className="w-3.5 h-3.5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[9px] font-bold">
                              ✓
                            </span>
                          </div>
                          <div className="text-[11px] font-bold text-slate-800 mt-1 line-clamp-1">
                            {m.stageName.split(' ')[0]} {m.stageName.split(' ')[1] || ''}
                          </div>
                          <div className="text-[9px] text-slate-400 mt-0.5 truncate">
                            {m.department}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Selected Milestone Detail Card */}
              {selectedMilestone && (
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                  <div className="p-4 border-b border-slate-200 bg-slate-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          Milestone {selectedMilestone.stageNumber} of 10
                        </span>
                        <span className="text-xs text-slate-500 font-mono font-semibold">
                          {selectedMilestone.stageCode}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-slate-800 mt-1">
                        {selectedMilestone.stageName}
                      </h3>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-xs font-semibold text-slate-700">{selectedMilestone.actor}</div>
                        <div className="text-[11px] text-slate-400">{selectedMilestone.department}</div>
                      </div>
                      <div className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" />
                        Quality Gate Pass
                      </div>
                    </div>
                  </div>

                  <div className="p-6 space-y-4">
                    <div>
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Process & Quality Audit Summary</h4>
                      <p className="text-sm text-slate-700 mt-1 leading-relaxed bg-slate-50 p-3.5 rounded-lg border border-slate-100">
                        {selectedMilestone.summary}
                      </p>
                    </div>

                    {selectedMilestone.metrics && (
                      <div>
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Stage Telemetry Metrics</h4>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          {Object.entries(selectedMilestone.metrics).map(([k, v]) => (
                            <div key={k} className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                              <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                                {k.replace(/([A-Z])/g, ' $1')}
                              </div>
                              <div className="text-base font-bold text-slate-800 mt-0.5">
                                {typeof v === 'number' ? v.toLocaleString() : String(v)}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* 2. EXECUTIVE BI & OEE SUB-TAB */}
          {/* ========================================================================= */}
          {activeTab === 'bi' && biSummary && (
            <div className="space-y-6">
              {/* Top Level BI Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500">Overall OEE Health</span>
                    <Activity className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="text-3xl font-extrabold text-emerald-700 mt-2">
                    {biSummary.efficiency.overallOeePercentage}%
                  </div>
                  <div className="text-[11px] text-emerald-600 font-medium mt-0.5">
                    Avail {biSummary.efficiency.availabilityPercentage}% × Perf {biSummary.efficiency.performancePercentage}% × Qual {biSummary.efficiency.qualityPercentage}%
                  </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500">Pipeline Export Value</span>
                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="text-3xl font-extrabold text-slate-800 mt-2">
                    ${biSummary.pipeline.totalRevenueUsd.toLocaleString()}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {biSummary.pipeline.totalUnits.toLocaleString()} units ({biSummary.pipeline.totalOrders} Buyer Orders)
                  </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500">Factory Average DHU</span>
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="text-3xl font-extrabold text-emerald-700 mt-2">
                    {biSummary.quality.factoryDhuPercentage}%
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Well within 2.5% AQL threshold (100% Pass)
                  </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500">Workforce & Machines</span>
                    <Cpu className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="text-3xl font-extrabold text-slate-800 mt-2">
                    {biSummary.workforce.attendanceRatePercentage}% Att.
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Fleet Uptime: {biSummary.machinery.operationalUptimePercentage}% ({biSummary.machinery.operationalCount} Active)
                  </div>
                </div>
              </div>

              {/* Sewing Lines Live Telemetry */}
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">Sewing Lines 01–04 Real-Time Efficiency & DHU Matrix</h3>
                    <p className="text-xs text-slate-500">Live piece outputs, hourly run-rates, and target tracking</p>
                  </div>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                    4 Active Lines
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                  {biSummary.efficiency.linesEfficiency.map((l) => (
                    <div key={l.lineNumber} className="p-4 rounded-xl border border-slate-100 bg-slate-50/60 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800">{l.lineNumber}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          l.efficiencyPercent > 90 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {l.efficiencyPercent}% Eff
                        </span>
                      </div>

                      <div className="h-2.5 w-full bg-slate-200 rounded-full overflow-hidden">
                        <div 
                          style={{ width: `${Math.min(100, l.efficiencyPercent)}%` }} 
                          className="h-full bg-emerald-600 rounded-full" 
                        />
                      </div>

                      <div className="flex justify-between text-xs text-slate-500">
                        <span>Actual: <b className="text-slate-800">{l.outputPcs}</b> pcs</span>
                        <span>Target: <b>{l.targetPcs}</b> pcs</span>
                      </div>

                      <div className="pt-1 border-t border-slate-200/60 flex justify-between items-center text-[11px]">
                        <span className="text-slate-400">Line DHU Rate:</span>
                        <span className="font-bold text-emerald-700">{l.dhuPercent}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Defect Pareto Analytics */}
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">Top 5 Sewing Defect Pareto Distribution (80/20 Rule)</h3>
                    <p className="text-xs text-slate-500">Root-cause occurrences and targeted line repair priority</p>
                  </div>
                  <span className="text-xs font-medium text-slate-500">52 Total Defect Occurrences Analyzed</span>
                </div>

                <div className="mt-4 space-y-3">
                  {pareto.map((item, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 rounded-lg border border-slate-100 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-400">#{idx + 1}</span>
                          <span className="text-xs font-bold text-slate-800">{item.defectName}</span>
                          <span className="text-[10px] text-slate-500 bg-white border border-slate-200 px-1.5 py-0.2 rounded">
                            {item.category}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-bold text-slate-800">{item.count} pcs</span>
                          <span className="text-[11px] text-emerald-700 font-semibold ml-2">({item.percentageOfTotal}%)</span>
                        </div>
                      </div>

                      <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                        <div 
                          style={{ width: `${item.percentageOfTotal}%` }} 
                          className="h-full bg-emerald-600 rounded-full" 
                        />
                      </div>

                      <div className="text-[10px] text-slate-400">
                        Affected Lines: <span className="text-slate-600 font-medium">{item.affectedLines.join(', ')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 3. LIVE EVENT ALERTS SUB-TAB */}
          {/* ========================================================================= */}
          {activeTab === 'alerts' && (
            <div className="space-y-6">
              {/* Alert Severity Filter Pills */}
              <div className="flex items-center gap-2">
                {(['ALL', 'CRITICAL', 'WARNING', 'INFO'] as const).map((sev) => (
                  <button
                    key={sev}
                    onClick={() => setAlertFilter(sev)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      alertFilter === sev
                        ? 'bg-slate-800 text-white shadow-xs'
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {sev}
                    <span className="ml-1.5 text-[10px] opacity-80">
                      ({sev === 'ALL' ? alerts.length : alerts.filter(a => a.severity === sev).length})
                    </span>
                  </button>
                ))}
              </div>

              {/* Alert Feed Ledger */}
              <div className="space-y-3">
                {filteredAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-4 rounded-xl border transition-all ${
                      alert.acknowledged
                        ? 'bg-white border-slate-200 opacity-70'
                        : alert.severity === 'CRITICAL'
                        ? 'bg-red-50/60 border-red-200 shadow-xs'
                        : alert.severity === 'WARNING'
                        ? 'bg-amber-50/60 border-amber-200 shadow-xs'
                        : 'bg-emerald-50/60 border-emerald-200 shadow-xs'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          alert.severity === 'CRITICAL'
                            ? 'bg-red-100 text-red-800'
                            : alert.severity === 'WARNING'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {alert.severity}
                        </span>
                        <span className="text-xs font-bold text-slate-800">{alert.title}</span>
                        <span className="text-[10px] text-slate-400 font-mono">[{alert.sourceModule}]</span>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-[11px] text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {alert.timestamp.replace('T', ' ').slice(0, 16)}
                        </span>
                        {!alert.acknowledged ? (
                          <button
                            onClick={() => handleAcknowledgeAlert(alert.id)}
                            className="px-2.5 py-1 rounded bg-slate-800 text-white text-[11px] font-semibold hover:bg-slate-900 transition-colors cursor-pointer"
                          >
                            Acknowledge
                          </button>
                        ) : (
                          <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            Acknowledged
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                      {alert.message}
                    </p>

                    {alert.referenceId && (
                      <div className="mt-2 text-[11px] text-slate-400">
                        Reference: <span className="font-mono font-semibold text-slate-600">{alert.referenceId}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 4. FACTORY BENCHMARKING SUB-TAB */}
          {/* ========================================================================= */}
          {activeTab === 'benchmark' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {factories.map((fac) => (
                  <div key={fac.code} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            {fac.code}
                          </span>
                          <span className="text-xs text-slate-400">{fac.location}</span>
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 mt-1">{fac.unitName}</h3>
                      </div>
                      <Building className="w-6 h-6 text-slate-400" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-slate-50 rounded-lg">
                        <div className="text-xs text-slate-400 font-medium">Daily Capacity</div>
                        <div className="text-xl font-bold text-slate-800">{fac.dailyCapacityPcs.toLocaleString()} pcs</div>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-lg">
                        <div className="text-xs text-slate-400 font-medium">Actual Output</div>
                        <div className="text-xl font-bold text-slate-800">{fac.actualOutputPcs.toLocaleString()} pcs</div>
                      </div>
                      <div className="p-3 bg-emerald-50 rounded-lg">
                        <div className="text-xs text-emerald-700 font-medium">Line Efficiency</div>
                        <div className="text-xl font-black text-emerald-800">{fac.efficiencyPercent}%</div>
                      </div>
                      <div className="p-3 bg-emerald-50 rounded-lg">
                        <div className="text-xs text-emerald-700 font-medium">Average DHU %</div>
                        <div className="text-xl font-black text-emerald-800">{fac.dhuPercent}%</div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-xs text-slate-500 pt-2 border-t border-slate-100">
                      <span>Active Sewing Lines: <b className="text-slate-800">{fac.activeLines} Lines</b></span>
                      <span>Certified Operators: <b className="text-slate-800">{fac.operatorCount} Staff</b></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* ========================================================================= */}
      {/* SIMULATE ALERT MODAL */}
      {/* ========================================================================= */}
      {showSimModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="text-sm font-bold text-slate-800">Simulate Real-Time Telemetry Alert</h3>
              <button onClick={() => setShowSimModal(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>
            <form onSubmit={handleSimulateAlert} className="p-4 space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-medium text-slate-600">Severity</label>
                  <select
                    value={simData.severity}
                    onChange={(e) => setSimData({ ...simData, severity: e.target.value as any })}
                    className="w-full text-xs border border-slate-200 rounded px-2.5 py-1.5 mt-1"
                  >
                    <option value="CRITICAL">CRITICAL</option>
                    <option value="WARNING">WARNING</option>
                    <option value="INFO">INFO</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600">Category</label>
                  <select
                    value={simData.category}
                    onChange={(e) => setSimData({ ...simData, category: e.target.value as any })}
                    className="w-full text-xs border border-slate-200 rounded px-2.5 py-1.5 mt-1"
                  >
                    <option value="QUALITY">QUALITY</option>
                    <option value="MACHINERY">MACHINERY</option>
                    <option value="SCM">SCM</option>
                    <option value="LABOR">LABOR</option>
                    <option value="SHIPMENT">SHIPMENT</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600">Source Module</label>
                <input
                  type="text"
                  value={simData.sourceModule}
                  onChange={(e) => setSimData({ ...simData, sourceModule: e.target.value })}
                  className="w-full text-xs border border-slate-200 rounded px-2.5 py-1.5 mt-1"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600">Alert Title</label>
                <input
                  type="text"
                  value={simData.title}
                  onChange={(e) => setSimData({ ...simData, title: e.target.value })}
                  className="w-full text-xs border border-slate-200 rounded px-2.5 py-1.5 mt-1"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600">Message</label>
                <textarea
                  value={simData.message}
                  onChange={(e) => setSimData({ ...simData, message: e.target.value })}
                  rows={2}
                  className="w-full text-xs border border-slate-200 rounded px-2.5 py-1.5 mt-1"
                  required
                />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowSimModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 bg-slate-100 rounded hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 text-xs text-white bg-emerald-700 rounded hover:bg-emerald-800 font-semibold"
                >
                  Dispatch Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
