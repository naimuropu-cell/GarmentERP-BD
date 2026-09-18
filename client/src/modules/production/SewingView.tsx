import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  Plus, 
  Activity, 
  X
} from 'lucide-react';
import { SewingLineSummary, SewingHourlyOutput } from '../../types/production';

export const SewingView: React.FC = () => {
  const [lineSummaries, setLineSummaries] = useState<SewingLineSummary[]>([]);
  const [hourlyLogs, setHourlyLogs] = useState<SewingHourlyOutput[]>([]);
  const [selectedLineId, setSelectedLineId] = useState<string>('line-sew-01');
  const [loading, setLoading] = useState(true);

  // Modal State
  const [showLogModal, setShowLogModal] = useState(false);
  const [modalLineId, setModalLineId] = useState('line-sew-01');
  const [hourSlot, setHourSlot] = useState('14:00 - 15:00');
  const [targetQty, setTargetQty] = useState(120);
  const [actualQty, setActualQty] = useState(122);
  const [rejectedQty, setRejectedQty] = useState(1);
  const [operatorCount, setOperatorCount] = useState(38);
  const [helperCount, setHelperCount] = useState(10);
  const [smv, setSmv] = useState(14.5);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('garment_access_token');
      const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

      const [summaryRes, logsRes] = await Promise.all([
        fetch('/api/v1/production/sewing/lines-summary', { headers }).then(r => r.json()),
        fetch('/api/v1/production/sewing/hourly', { headers }).then(r => r.json())
      ]);

      if (summaryRes.success) setLineSummaries(summaryRes.data);
      if (logsRes.success) setHourlyLogs(logsRes.data);
    } catch (err) {
      console.error('Failed to load sewing floor data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRecordHourly = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('garment_access_token');
      const lineObj = lineSummaries.find(l => l.lineId === modalLineId);

      const res = await fetch('/api/v1/production/sewing/hourly', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          lineId: modalLineId,
          lineNumber: lineObj?.lineNumber || 'Sewing Line 01',
          hourSlot,
          styleNumber: lineObj?.currentStyle || 'TSH-2026-001',
          poNumber: lineObj?.currentPo || 'PO-2026-001',
          targetQty: Number(targetQty),
          actualQty: Number(actualQty),
          rejectedQty: Number(rejectedQty),
          operatorCount: Number(operatorCount),
          helperCount: Number(helperCount),
          smv: Number(smv)
        })
      });

      const json = await res.json();
      if (json.success) {
        setShowLogModal(false);
        fetchData();
      } else {
        alert(json.error?.message || 'Failed to record hourly output');
      }
    } catch (err) {
      console.error('Error recording hourly output', err);
    }
  };

  const selectedLine = lineSummaries.find(l => l.lineId === selectedLineId) || lineSummaries[0];
  const filteredHourlyLogs = hourlyLogs.filter(l => l.lineId === selectedLineId);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 text-slate-400">
        <Activity className="w-5 h-5 animate-spin mr-2 text-emerald-400" />
        <span>Loading Sewing Department topology & real-time line outputs...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <Activity className="h-6 w-6 text-emerald-400" />
            Sewing Floor Real-Time Output & Line Balancing
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time monitoring across Sewing Lines 01 to 04, SMV target allocation, hourly efficiency & bottleneck detection.
          </p>
        </div>

        <button
          onClick={() => setShowLogModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg shadow-lg shadow-emerald-600/20 transition cursor-pointer shrink-0"
        >
          <Plus className="h-4 w-4" />
          Log Hourly Line Output
        </button>
      </div>

      {/* 4 Lines Topology Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {lineSummaries.map((line) => {
          const isSelected = line.lineId === selectedLineId;
          const isHighEff = line.overallEfficiencyPercent >= 90;

          return (
            <div
              key={line.lineId}
              onClick={() => setSelectedLineId(line.lineId)}
              className={`p-4 rounded-xl border transition cursor-pointer flex flex-col justify-between space-y-3 ${
                isSelected
                  ? 'bg-slate-900 border-emerald-500 ring-2 ring-emerald-500/30'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white">{line.lineNumber.split('(')[0]}</h3>
                    <div className="text-xs text-emerald-400 font-medium">({line.lineNumber.split('(')[1]?.replace(')', '') || 'Knitwear'}</div>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                    isHighEff 
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                      : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  }`}>
                    {line.overallEfficiencyPercent}% EFF
                  </span>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2 p-2 bg-slate-800/40 rounded-lg text-xs">
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase">Today Target</div>
                    <div className="font-mono font-bold text-white mt-0.5">{line.todayTargetTotal} pcs</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase">Actual Done</div>
                    <div className="font-mono font-bold text-emerald-400 mt-0.5">{line.todayActualTotal} pcs</div>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                <span>{line.operatorCount} Ops / {line.helperCount} Hlprs</span>
                <span className="font-mono text-slate-300">SMV: {line.smv}m</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Line Detailed Hourly Timeline & Efficiency Monitor */}
      {selectedLine && (
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-xl space-y-4 p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-white">{selectedLine.lineNumber}</span>
                <span className="px-2 py-0.5 rounded bg-slate-800 text-xs font-mono text-slate-300">
                  Style: {selectedLine.currentStyle}
                </span>
                <span className="px-2 py-0.5 rounded bg-slate-800 text-xs font-mono text-emerald-400">
                  PO: {selectedLine.currentPo}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Hourly output logging, defect tracking, and efficiency variance.
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Current Efficiency</div>
                <div className="text-2xl font-bold text-emerald-400 font-mono">
                  {selectedLine.overallEfficiencyPercent}%
                </div>
              </div>
              <div className="text-right border-l border-slate-800 pl-4">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Target Output / Hr</div>
                <div className="text-2xl font-bold text-white font-mono">
                  {selectedLine.targetPerHour} <span className="text-xs text-slate-400 font-normal">pcs</span>
                </div>
              </div>
            </div>
          </div>

          {/* Hourly Timeline Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-800/60 text-slate-400 uppercase text-[10px] font-semibold tracking-wider">
                <tr>
                  <th className="p-3">Hour Slot</th>
                  <th className="p-3 text-right">Hourly Target</th>
                  <th className="p-3 text-right">Actual Output</th>
                  <th className="p-3 text-right">Defect / Rejected</th>
                  <th className="p-3 text-center">Efficiency %</th>
                  <th className="p-3 text-center">Progress Gauge</th>
                  <th className="p-3">Supervisor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {filteredHourlyLogs.map((log) => {
                  const percent = Math.min(120, Math.round((log.actualQty / log.targetQty) * 100));
                  return (
                    <tr key={log.id} className="hover:bg-slate-800/30 transition">
                      <td className="p-3 font-mono font-bold text-white flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-indigo-400" />
                        {log.hourSlot}
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-slate-400">
                        {log.targetQty} pcs
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-white text-sm">
                        {log.actualQty} pcs
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-rose-400">
                        {log.rejectedQty} pcs
                      </td>
                      <td className="p-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold ${
                          log.efficiencyPercent >= 100 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                          log.efficiencyPercent >= 90 ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                          'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}>
                          {log.efficiencyPercent}%
                        </span>
                      </td>
                      <td className="p-3 w-48">
                        <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${
                              percent >= 100 ? 'bg-emerald-500' : percent >= 90 ? 'bg-blue-500' : 'bg-amber-500'
                            }`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </td>
                      <td className="p-3 text-slate-400 text-[11px]">
                        {log.recordedBy}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Log Hourly Production Output */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative space-y-4">
            <button onClick={() => setShowLogModal(false)} className="absolute right-4 top-4 text-slate-400 hover:text-white">
              <X className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
              <Activity className="h-6 w-6 text-emerald-400" />
              <div>
                <h2 className="text-lg font-bold text-white">Log Hourly Sewing Line Production</h2>
                <p className="text-xs text-slate-400">Record hourly target, actual output, and sewing floor defects</p>
              </div>
            </div>

            <form onSubmit={handleRecordHourly} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-300">Production Line</label>
                  <select
                    value={modalLineId}
                    onChange={(e) => setModalLineId(e.target.value)}
                    className="mt-1 w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
                  >
                    {lineSummaries.map(l => (
                      <option key={l.lineId} value={l.lineId}>{l.lineNumber}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-300">Hour Slot</label>
                  <select
                    value={hourSlot}
                    onChange={(e) => setHourSlot(e.target.value)}
                    className="mt-1 w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="09:00 - 10:00">09:00 - 10:00</option>
                    <option value="10:00 - 11:00">10:00 - 11:00</option>
                    <option value="11:00 - 12:00">11:00 - 12:00</option>
                    <option value="12:00 - 13:00">12:00 - 13:00</option>
                    <option value="14:00 - 15:00">14:00 - 15:00</option>
                    <option value="15:00 - 16:00">15:00 - 16:00</option>
                    <option value="16:00 - 17:00">16:00 - 17:00</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-300">Target Output (Pcs)</label>
                  <input
                    type="number"
                    min="1"
                    value={targetQty}
                    onChange={(e) => setTargetQty(Number(e.target.value))}
                    className="mt-1 w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-300">Actual Output (Pcs)</label>
                  <input
                    type="number"
                    min="0"
                    value={actualQty}
                    onChange={(e) => setActualQty(Number(e.target.value))}
                    className="mt-1 w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-300">Rejected / Defects</label>
                  <input
                    type="number"
                    min="0"
                    value={rejectedQty}
                    onChange={(e) => setRejectedQty(Number(e.target.value))}
                    className="mt-1 w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white font-mono focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-300">Operators Count</label>
                  <input
                    type="number"
                    min="1"
                    value={operatorCount}
                    onChange={(e) => setOperatorCount(Number(e.target.value))}
                    className="mt-1 w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-300">Helpers Count</label>
                  <input
                    type="number"
                    min="0"
                    value={helperCount}
                    onChange={(e) => setHelperCount(Number(e.target.value))}
                    className="mt-1 w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-300">Target SMV (Min)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    value={smv}
                    onChange={(e) => setSmv(Number(e.target.value))}
                    className="mt-1 w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowLogModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-lg shadow cursor-pointer"
                >
                  Save Hourly Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
