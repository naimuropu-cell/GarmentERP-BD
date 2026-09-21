import React from 'react';
import { 
  ShieldCheck, 
  Layers, 
  TrendingUp, 
  ArrowRight, 
  Sparkles, 
  Award, 
  Scissors, 
  Ship, 
  Activity, 
  AlertTriangle, 
  Package, 
  Users, 
  CheckCircle2, 
  ChevronRight, 
  Truck, 
  Cpu 
} from 'lucide-react';
import { User } from '../../types';
import { useLanguage } from '../../context/LanguageContext';

interface OverviewDashboardProps {
  user: User;
  onNavigate: (tabId: string, subTab?: string) => void;
}

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({ user, onNavigate }) => {
  const { language, t, toBengaliNumber } = useLanguage();
  const kpis = [
    { 
      label: t('kpi_active_lines', 'Active Production Lines'), 
      val: t('val_active_lines', '8 Lines'), 
      sub: t('kpi_active_lines_sub', 'Savar + Gazipur Units'), 
      change: t('change_active_lines', '+2 lines active'), 
      icon: Layers, 
      color: 'text-emerald-700', 
      bg: 'bg-emerald-50' 
    },
    { 
      label: t('kpi_oee_target', 'Plant Overall OEE Target'), 
      val: t('val_oee', '85.1%'), 
      sub: t('kpi_oee_sub', 'Availability × Performance × Quality'), 
      change: t('change_oee', '+3.2% vs target'), 
      icon: TrendingUp, 
      color: 'text-emerald-700', 
      bg: 'bg-emerald-50' 
    },
    { 
      label: t('kpi_dhu_rate', 'Plant Average Defect Rate (DHU)'), 
      val: t('val_dhu', '1.18%'), 
      sub: t('kpi_dhu_sub', 'Benchmark < 2.0% (AQL Passed)'), 
      change: t('change_dhu', '-0.3% this shift'), 
      icon: ShieldCheck, 
      color: 'text-emerald-700', 
      bg: 'bg-emerald-50' 
    },
    { 
      label: t('kpi_compliance', 'Enterprise Compliance Rating'), 
      val: t('val_compliance', 'Grade A'), 
      sub: t('kpi_compliance_sub', 'BSCI, Sedex & Accord Certified'), 
      change: t('change_compliance', '100% Compliant'), 
      icon: Award, 
      color: 'text-amber-600', 
      bg: 'bg-amber-50' 
    }
  ];

  const liveSewingLines = [
    {
      line: language === 'bn' ? 'লাইন ০১' : 'Line 01',
      style: language === 'bn' ? 'এইচঅ্যান্ডএম বেসিক পোলো (স্টাইল #HM-PL-2026)' : 'H&M Basic Polo (Style #HM-PL-2026)',
      targetPerHour: 400,
      actualPerHour: 382,
      efficiency: 95.5,
      dhu: 1.1,
      operatorCount: 28,
      status: 'NORMAL'
    },
    {
      line: language === 'bn' ? 'লাইন ০২' : 'Line 02',
      style: language === 'bn' ? 'জারা মেনস চিনো প্যান্ট (স্টাইল #ZR-CP-901)' : 'Zara Mens Chino Pants (Style #ZR-CP-901)',
      targetPerHour: 320,
      actualPerHour: 292,
      efficiency: 91.2,
      dhu: 1.7,
      operatorCount: 30,
      status: 'WARNING'
    },
    {
      line: language === 'bn' ? 'লাইন ০৩' : 'Line 03',
      style: language === 'bn' ? 'এমঅ্যান্ডএস ডেনিম জ্যাকেট (স্টাইল #MS-DJ-108)' : 'M&S Denim Jacket (Style #MS-DJ-108)',
      targetPerHour: 260,
      actualPerHour: 248,
      efficiency: 95.3,
      dhu: 0.9,
      operatorCount: 32,
      status: 'NORMAL'
    },
    {
      line: language === 'bn' ? 'লাইন ০৪' : 'Line 04',
      style: language === 'bn' ? 'টার্গেট ফ্লিস হুডি (স্টাইল #TG-HD-44)' : 'Target Fleece Hoodie (Style #TG-HD-44)',
      targetPerHour: 350,
      actualPerHour: 312,
      efficiency: 89.1,
      dhu: 1.3,
      operatorCount: 26,
      status: 'NORMAL'
    }
  ];

  const activeOrders = [
    {
      po: 'PO-2026-001',
      buyer: 'H&M Hennes & Mauritz',
      style: language === 'bn' ? 'মেনস ক্লাসিক পাইক পোলো শার্ট' : 'Mens Classic Pique Polo Shirt',
      qty: language === 'bn' ? '৫,০০০ পিস' : '5,000 pcs',
      value: language === 'bn' ? '$৪২,৫০০' : '$42,500',
      delivery: language === 'bn' ? '১৫-১০-২০২৬' : '2026-10-15',
      stage: t('stage_po_001', 'AQL Passed / Ready for Gate Pass'),
      progress: 95,
      statusColor: 'emerald'
    },
    {
      po: 'PO-2026-002',
      buyer: 'Zara / Inditex Group',
      style: language === 'bn' ? 'স্ট্রেচ টুইল কার্গো ট্রাউজার্স' : 'Stretch Twill Cargo Trousers',
      qty: language === 'bn' ? '৩,৫০০ পিস' : '3,500 pcs',
      value: language === 'bn' ? '$৩৮,৫০০' : '$38,500',
      delivery: language === 'bn' ? '২২-১০-২০২৬' : '2026-10-22',
      stage: t('stage_po_002', 'Sewing Assembly (Lines 02 & 03)'),
      progress: 68,
      statusColor: 'blue'
    },
    {
      po: 'PO-2026-003',
      buyer: 'Marks & Spencer (M&S)',
      style: language === 'bn' ? 'ভিন্টেজ ওয়াশড ডেনিম জ্যাকেট' : 'Vintage Washed Denim Jacket',
      qty: language === 'bn' ? '২,০০০ পিস' : '2,000 pcs',
      value: language === 'bn' ? '$৪৮,০০০' : '$48,000',
      delivery: language === 'bn' ? '০৫-১১-২০২৬' : '2026-11-05',
      stage: t('stage_po_003', 'Cutting & 24h Relaxation Spreading'),
      progress: 35,
      statusColor: 'amber'
    }
  ];

  const plantAlerts = [
    {
      severity: t('severity_critical', 'CRITICAL'),
      rawSeverity: 'CRITICAL',
      source: language === 'bn' ? 'লাইন ০২ — স্টেশন ১৪' : 'Line 02 — Station 14',
      time: t('time_12m_ago', '12m ago'),
      title: t('alert_needle_title', 'Needle Plate Fracture on Juki Machine'),
      desc: t('alert_needle_desc', 'High-speed lockstitch needle tip break. Magnetic needle log initiated.')
    },
    {
      severity: t('severity_warning', 'WARNING'),
      rawSeverity: 'WARNING',
      source: language === 'bn' ? 'ফেব্রিক ওয়্যারহাউস' : 'Fabric Warehouse',
      time: t('time_45m_ago', '45m ago'),
      title: t('alert_roll_title', 'Roll #F-884 ASTM Points Drift'),
      desc: t('alert_roll_desc', 'Penalty score at 21.4 pts / 100 sq yds approaching 24 pt rejection limit.')
    },
    {
      severity: t('severity_info', 'INFO'),
      rawSeverity: 'INFO',
      source: language === 'bn' ? 'সিকিউরিটি গেট ০১' : 'Security Gate 01',
      time: t('time_1h_ago', '1h ago'),
      title: t('alert_container_title', '40FT HQ Container Dispatched'),
      desc: t('alert_container_desc', 'Truck #DHAKA-METRO-TA-4491 cleared gate with Seal #BD-EXP-77218.')
    }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Banner - Deep Executive Emerald */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-950 border border-emerald-800/40 p-6 shadow-md text-white">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-slate-950 border border-amber-300 flex items-center gap-1.5 shadow-sm">
                <Sparkles className="w-3 h-3 text-slate-950" />
                {t('live_floor_operations', 'Live Manufacturing Floor Operations')}
              </span>
              <span className="text-xs text-emerald-300 font-mono">
                {language === 'bn' ? 'এপেক্স গার্মেন্টস • ঢাকা ইউনিট ১' : 'Apex Garments • Dhaka Unit 1'}
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              {t('welcome_back', 'Welcome back')}, {language === 'bn' && user.fullName === 'Engr. Naimur Rahman' ? 'ইঞ্জিনিয়ার নাঈমুর রহমান (সিস্টেম আর্কিটেক্ট)' : `${user.fullName} (${t(`role_${user.role.code}`, user.role.name)})`}
            </h1>
            <p className="text-xs text-emerald-100/90 max-w-2xl leading-relaxed">
              {t('banner_subtitle', 'All 8 manufacturing suites are operational with real-time floor telemetry.')}
            </p>
          </div>

          {/* Quick Nav Action Shortcuts */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => onNavigate('analytics')}
              className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-emerald-950 text-xs font-bold shadow-sm flex items-center gap-2 transition-all hover:scale-102 cursor-pointer"
            >
              <Activity className="w-3.5 h-3.5 text-emerald-700" />
              <span>{t('sub_traceability', 'Order 360° Passport')}</span>
              <ArrowRight className="w-3 h-3" />
            </button>
            <button
              onClick={() => onNavigate('shipment')}
              className="px-3.5 py-2 rounded-xl bg-emerald-800/80 hover:bg-emerald-700 text-white text-xs font-bold border border-emerald-600 flex items-center gap-2 transition-all cursor-pointer"
            >
              <Ship className="w-3.5 h-3.5 text-emerald-300" />
              <span>{t('sub_gatepass', 'Export Gate Out')}</span>
            </button>
            <button
              onClick={() => onNavigate('fabric-qc')}
              className="px-3.5 py-2 rounded-xl bg-emerald-800/80 hover:bg-emerald-700 text-white text-xs font-bold border border-emerald-600 flex items-center gap-2 transition-all cursor-pointer"
            >
              <Scissors className="w-3.5 h-3.5 text-emerald-300" />
              <span>{t('sub_fabric_qc', 'Fabric 4-Point QC')}</span>
            </button>
            <button
              onClick={() => onNavigate('aql-audit')}
              className="px-3.5 py-2 rounded-xl bg-emerald-800/80 hover:bg-emerald-700 text-white text-xs font-bold border border-emerald-600 flex items-center gap-2 transition-all cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
              <span>{t('sub_aql_audit', 'ISO AQL 2.5')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between space-y-3 hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">{kpi.label}</span>
                <div className={`p-2 rounded-xl ${kpi.bg}`}>
                  <Icon className={`w-4 h-4 ${kpi.color}`} />
                </div>
              </div>

              <div>
                <p className="text-2xl font-black text-slate-900 tracking-tight">{kpi.val}</p>
                <div className="flex items-center justify-between mt-1 text-[11px]">
                  <span className="text-slate-500">{kpi.sub}</span>
                  <span className="font-bold text-emerald-700">{kpi.change}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Floor Operations Workspace Grid */}
      <div className="grid lg:grid-cols-12 gap-6">
        {/* Left Column (8 cols): Real-Time Sewing Lines & Active Orders */}
        <div className="lg:col-span-8 space-y-6">
          {/* Real-Time Sewing Floor Status */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{t('sewing_floor_title', 'Sewing Lines 01–04 Live Floor Output')}</h3>
                  <p className="text-[11px] text-slate-500">{t('sewing_floor_desc', 'Real-time operator output, efficiency & defect rates (DHU %)')}</p>
                </div>
              </div>
              <button
                onClick={() => onNavigate('sewing')}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 cursor-pointer"
              >
                <span>{t('view_sewing_floor', 'Live Sewing Floor')}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid sm:grid-cols-2 gap-3.5">
              {liveSewingLines.map((line, i) => (
                <div 
                  key={i} 
                  className={`p-3.5 rounded-xl border transition-all ${
                    line.status === 'WARNING'
                      ? 'border-amber-200 bg-amber-50/20'
                      : 'border-slate-200 bg-slate-50/40 hover:border-emerald-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-xs text-slate-900">{line.line}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono border ${
                      line.efficiency >= 92 
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                        : 'bg-amber-50 text-amber-800 border-amber-200'
                    }`}>
                      {language === 'bn' ? `${toBengaliNumber(line.efficiency)}% ${t('eff_suffix', 'Eff.')}` : `${line.efficiency}% Eff.`}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-600 font-medium truncate mb-2.5" title={line.style}>
                    {line.style}
                  </p>

                  <div className="space-y-1.5 text-[11px]">
                    <div className="flex justify-between text-slate-500">
                      <span>{t('hourly_output', 'Hourly Output:')}</span>
                      <span className="font-bold text-slate-900">
                        {language === 'bn' ? `${toBengaliNumber(line.actualPerHour)} / ${toBengaliNumber(line.targetPerHour)} ${t('pcs_unit', 'pcs')}` : `${line.actualPerHour} / ${line.targetPerHour} pcs`}
                      </span>
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${line.efficiency >= 92 ? 'bg-emerald-600' : 'bg-amber-500'}`}
                        style={{ width: `${Math.min(line.efficiency, 100)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-slate-500 pt-0.5">
                      <span>{t('line_dhu', 'Line DHU:')} <strong className="text-slate-800">{language === 'bn' ? `${toBengaliNumber(line.dhu)}%` : `${line.dhu}%`}</strong></span>
                      <span>{t('operators', 'Operators:')} <strong className="text-slate-800">{language === 'bn' ? `${toBengaliNumber(line.operatorCount)} জন` : `${line.operatorCount}`}</strong></span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Active Export Purchase Orders Pipeline */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-blue-50 text-blue-700">
                  <Package className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{t('orders_pipeline_title', 'Active Export Purchase Orders Pipeline')}</h3>
                  <p className="text-[11px] text-slate-500">{t('orders_pipeline_desc', 'Buyer contracts, confirmed revenue & production progression')}</p>
                </div>
              </div>
              <button
                onClick={() => onNavigate('orders')}
                className="text-xs font-semibold text-blue-700 hover:text-blue-900 flex items-center gap-1 cursor-pointer"
              >
                <span>{t('view_all_orders', 'All Orders')}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2.5">
              {activeOrders.map((order, i) => (
                <div 
                  key={i}
                  className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/40 hover:bg-white hover:border-slate-300 transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-slate-900">{order.po}</span>
                      <span className="text-slate-300">•</span>
                      <span className="font-semibold text-xs text-slate-700">{order.buyer}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="font-bold text-emerald-800">{order.value}</span>
                      <span className="text-slate-400 font-mono text-[11px]">{t('ex_factory', 'Ex-Factory:')} {order.delivery}</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-600 mb-2">{order.style} ({order.qty})</p>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-slate-500">
                      <span>{t('status', 'Status:')} <strong className="text-slate-800">{order.stage}</strong></span>
                      <span className="font-bold text-slate-700">
                        {language === 'bn' ? `${toBengaliNumber(order.progress)}%` : `${order.progress}%`}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-emerald-600 rounded-full"
                        style={{ width: `${order.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): Live Plant Alerts & Quick Actions */}
        <div className="lg:col-span-4 space-y-6">
          {/* Live Floor Alerts Feed */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  {t('live_factory_alerts', 'Live Factory Alerts')}
                </h3>
              </div>
              <button 
                onClick={() => onNavigate('analytics', 'alerts')}
                className="text-[11px] text-emerald-700 hover:text-emerald-900 font-semibold cursor-pointer"
              >
                {t('view_feed', 'View Feed')}
              </button>
            </div>

            <div className="space-y-2.5">
              {plantAlerts.map((alert, i) => (
                <div 
                  key={i} 
                  className={`p-3 rounded-xl border text-xs space-y-1 ${
                    alert.rawSeverity === 'CRITICAL'
                      ? 'bg-rose-50/50 border-rose-200'
                      : alert.rawSeverity === 'WARNING'
                        ? 'bg-amber-50/50 border-amber-200'
                        : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`px-1.5 py-0.2 rounded text-[9px] font-black tracking-wider ${
                      alert.rawSeverity === 'CRITICAL'
                        ? 'bg-rose-100 text-rose-800'
                        : alert.rawSeverity === 'WARNING'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-sky-100 text-sky-800'
                    }`}>
                      {alert.severity}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">{alert.time}</span>
                  </div>
                  <p className="font-bold text-slate-900 text-xs">{alert.title}</p>
                  <p className="text-[11px] text-slate-500 leading-snug">{alert.desc}</p>
                </div>
              ))}
            </div>
          </div>


          {/* Quick Operational Action Shortcuts */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            <div className="pb-2 border-b border-slate-100">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                <Cpu className="w-3.5 h-3.5 text-emerald-700" />
                {t('quick_action_hub', 'Quick Action Hub')}
              </h3>
              <p className="text-[10px] text-slate-400">{t('quick_action_subtitle', 'Direct factory operational tasks')}</p>
            </div>

            <div className="space-y-1.5">
              <button
                onClick={() => onNavigate('warehouse')}
                className="w-full text-left p-2.5 rounded-xl border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/30 transition-all flex items-center justify-between text-xs font-semibold text-slate-800 group cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Package className="w-4 h-4 text-slate-500 group-hover:text-emerald-700" />
                  <span>{t('action_issue_materials', 'Issue Raw Materials & Trims')}</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-700" />
              </button>

              <button
                onClick={() => onNavigate('fabric-qc')}
                className="w-full text-left p-2.5 rounded-xl border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/30 transition-all flex items-center justify-between text-xs font-semibold text-slate-800 group cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-slate-500 group-hover:text-emerald-700" />
                  <span>{t('action_fabric_qc', 'Perform Fabric 4-Point QC')}</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-700" />
              </button>

              <button
                onClick={() => onNavigate('sewing')}
                className="w-full text-left p-2.5 rounded-xl border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/30 transition-all flex items-center justify-between text-xs font-semibold text-slate-800 group cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Layers className="w-4 h-4 text-slate-500 group-hover:text-emerald-700" />
                  <span>{t('action_log_sewing', 'Log Hourly Sewing Output')}</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-700" />
              </button>

              <button
                onClick={() => onNavigate('shipment')}
                className="w-full text-left p-2.5 rounded-xl border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/30 transition-all flex items-center justify-between text-xs font-semibold text-slate-800 group cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Truck className="w-4 h-4 text-slate-500 group-hover:text-emerald-700" />
                  <span>{t('action_dispatch_gatepass', 'Dispatch Security Gate Pass')}</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-700" />
              </button>

              <button
                onClick={() => onNavigate('hr')}
                className="w-full text-left p-2.5 rounded-xl border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/30 transition-all flex items-center justify-between text-xs font-semibold text-slate-800 group cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Users className="w-4 h-4 text-slate-500 group-hover:text-emerald-700" />
                  <span>{t('action_biometric_payroll', 'Biometric Attendance & Payroll')}</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-700" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
