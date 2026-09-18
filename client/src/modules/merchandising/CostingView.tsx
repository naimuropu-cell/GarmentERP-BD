import React, { useState, useEffect } from 'react';
import { 
  Layers, 
  ShieldCheck, 
  FileCheck
} from 'lucide-react';
import { CostingSheet } from '../../types/merchandising';
import { User } from '../../types';

interface CostingViewProps {
  user?: User;
}

export const CostingView: React.FC<CostingViewProps> = () => {
  const [costings, setCostings] = useState<CostingSheet[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string>('');

  const fetchCostings = async () => {
    try {
      const token = localStorage.getItem('garment_access_token');
      const res = await fetch('/api/v1/costing', {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      const json = await res.json();
      if (json.success && json.data) {
        setCostings(json.data);
        if (json.data.length > 0) {
          setSelectedId(json.data[0].id);
        }
      }
    } catch (e) {
      console.error('Failed to load costings', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCostings();
  }, []);

  const handleApprove = async (id: string) => {
    try {
      const token = localStorage.getItem('garment_access_token');
      const res = await fetch(`/api/v1/costing/${id}/approve`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });
      const json = await res.json();
      if (json.success) {
        fetchCostings();
      } else {
        alert(json.error?.message || 'Approval failed');
      }
    } catch (e: any) {
      alert(e.message || 'Approval error');
    }
  };

  const currentCosting = costings.find(c => c.id === selectedId) || costings[0];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
              MODULE 07
            </span>
            <span className="text-xs text-slate-400 font-mono">Pre-Costing & Profit Margin Governance</span>
          </div>
          <h1 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
            Garment Pre-Costing & Commercial Quotation
          </h1>
          <p className="text-xs text-slate-400">
            Automated BOM cost roll-up: Fabric, Trims, Cost of Making (CM), Finishing, Overhead, and Executive Margin Sign-off.
          </p>
        </div>

        {/* Style Costing Selector */}
        {costings.length > 0 && (
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 p-1 rounded-xl">
            <span className="text-[11px] text-slate-400 font-semibold px-2">Cost Sheet:</span>
            {costings.map(c => (
              <button
                key={c.id}
                onClick={() => setSelectedId(c.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                  currentCosting?.id === c.id
                    ? 'bg-brand-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {c.styleNumber}
              </button>
            ))}
          </div>
        )}
      </div>

      {loading ? (
        <div className="p-8 flex items-center justify-center min-h-[300px]">
          <div className="flex items-center gap-2 text-brand-400 text-xs font-mono">
            <div className="w-4 h-4 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
            <span>Loading Costing Engine...</span>
          </div>
        </div>
      ) : !currentCosting ? (
        <div className="p-8 text-slate-400">No costing sheets available.</div>
      ) : (
        <div className="space-y-6">
          {/* Executive Margin Cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Raw Material Cost</span>
              <p className="text-2xl font-extrabold text-white font-mono">${currentCosting.materialCostUsd.toFixed(2)}</p>
              <p className="text-[11px] text-slate-400">Fabric + Trims + Polybags</p>
            </div>

            <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Production Cost (CM)</span>
              <p className="text-2xl font-extrabold text-amber-400 font-mono">${currentCosting.productionCostUsd.toFixed(2)}</p>
              <p className="text-[11px] text-slate-400">Cutting + Sewing + Wash</p>
            </div>

            <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Net Cost</span>
              <p className="text-2xl font-extrabold text-slate-200 font-mono">${currentCosting.totalCostUsd.toFixed(2)}</p>
              <p className="text-[11px] text-slate-400">Includes $0.50 commercial overhead</p>
            </div>

            <div className="glass-panel p-5 rounded-2xl border border-emerald-500/30 bg-emerald-950/20 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">Target Profit Margin</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  {currentCosting.profitMarginPercent}%
                </span>
              </div>
              <p className="text-2xl font-extrabold text-emerald-400 font-mono">${currentCosting.profitMarginUsd.toFixed(2)} / pc</p>
              <p className="text-[11px] text-emerald-300">Offered FOB: <strong>${currentCosting.offeredPriceUsd.toFixed(2)}</strong></p>
            </div>
          </div>

          {/* Breakdown Table & Approval Control */}
          <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
            <div className="p-5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-brand-400" />
                  Itemized Bill of Materials (BOM) Cost Breakdown
                </h3>
                <p className="text-xs text-slate-400">Standard Consumption per Piece and Unit Rates in USD</p>
              </div>

              {/* Status and Sign-Off Button */}
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-xl text-xs font-bold font-mono border ${
                  currentCosting.status === 'APPROVED'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                }`}>
                  STATUS: {currentCosting.status}
                </span>

                {currentCosting.status !== 'APPROVED' && (
                  <button
                    onClick={() => handleApprove(currentCosting.id)}
                    className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 flex items-center gap-1.5 transition-all hover:scale-105"
                  >
                    <FileCheck className="w-4 h-4" />
                    <span>Approve Costing</span>
                  </button>
                )}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-900/90 text-slate-400 font-mono border-b border-slate-800">
                    <th className="p-3.5 font-bold">Category</th>
                    <th className="p-3.5 font-bold min-w-[240px]">Component Description</th>
                    <th className="p-3.5 font-bold text-center">Unit</th>
                    <th className="p-3.5 font-bold text-center">Consumption / pc</th>
                    <th className="p-3.5 font-bold text-right">Unit Price (USD)</th>
                    <th className="p-3.5 font-bold text-right">Total Cost (USD)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {currentCosting.items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-850/50 transition-colors">
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 font-semibold border border-slate-700">
                          {item.category}
                        </span>
                      </td>
                      <td className="p-3.5 font-sans text-slate-200 font-medium">{item.description}</td>
                      <td className="p-3.5 text-center text-slate-400">{item.unit}</td>
                      <td className="p-3.5 text-center font-bold text-white">{item.consumptionPerPc}</td>
                      <td className="p-3.5 text-right text-slate-400">${item.unitPriceUsd.toFixed(3)}</td>
                      <td className="p-3.5 text-right font-bold text-brand-400">${item.totalCostUsd.toFixed(3)}</td>
                    </tr>
                  ))}
                  <tr className="bg-slate-900/60 font-bold border-t-2 border-slate-800">
                    <td colSpan={5} className="p-3.5 text-right font-sans text-slate-300 uppercase tracking-wider">
                      Total Production FOB Cost:
                    </td>
                    <td className="p-3.5 text-right text-white text-sm font-extrabold">
                      ${currentCosting.totalCostUsd.toFixed(3)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {currentCosting.approvedBy && (
              <div className="p-3.5 bg-slate-900/90 border-t border-slate-800 flex items-center gap-2 text-xs text-emerald-400">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Signed-off by Management: <strong>{currentCosting.approvedBy}</strong></span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
