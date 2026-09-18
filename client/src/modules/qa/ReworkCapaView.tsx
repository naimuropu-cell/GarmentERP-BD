import React, { useState, useEffect } from 'react';
import { 
  RefreshCw, 
  FileCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Plus, 
  X, 
  UserCheck, 
  Clock, 
  Wrench
} from 'lucide-react';
import { ReworkOrder, CapaRecord, ReworkStatus } from '../../types/qa';

export const ReworkCapaView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'rework' | 'capa'>('rework');
  const [reworkOrders, setReworkOrders] = useState<ReworkOrder[]>([]);
  const [capaRecords, setCapaRecords] = useState<CapaRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Rework Status Update Modal
  const [selectedRework, setSelectedRework] = useState<ReworkOrder | null>(null);
  const [updateStatus, setUpdateStatus] = useState<ReworkStatus>('RE_INSPECTED_PASS');
  const [repairedQty, setRepairedQty] = useState(0);
  const [scrappedQty, setScrappedQty] = useState(0);

  // New CAPA Modal
  const [showCapaModal, setShowCapaModal] = useState(false);
  const [capaTitle, setCapaTitle] = useState('');
  const [issueDescription, setIssueDescription] = useState('');
  const [lineId, setLineId] = useState('line-sew-01');
  const [lineNumber, setLineNumber] = useState('Sewing Line 01 (Polo Shirt Specialist)');
  const [defectType, setDefectType] = useState('Repetitive Open Seam on Armhole');
  const [why1, setWhy1] = useState('Seam failed tensile pull test after wash.');
  const [why2, setWhy2] = useState('Stitch tension was too tight causing thread snapping under stretch.');
  const [why3, setWhy3] = useState('Operator adjusted machine tension screw manually without tension meter.');
  const [why4, setWhy4] = useState('Tension meter was missing from Line 01 toolkit.');
  const [why5RootCause, setWhy5RootCause] = useState('Lack of calibrated gauge tool storage policy and unauthorized operator tension adjustment.');
  const [category, setCategory] = useState<'MACHINE' | 'METHOD_TRAINING' | 'MATERIAL' | 'MANPOWER'>('METHOD_TRAINING');
  const [correctiveAction, setCorrectiveAction] = useState('Recalibrated all Line 01 sewing heads to 14 SPI using digital tension meter.');
  const [preventiveAction, setPreventiveAction] = useState('Tension knobs locked with mechanical guard; adjustment permitted only by certified mechanic.');
  const [assignedTo, setAssignedTo] = useState('Engr. Naimur Rahman (QA Head)');
  const [targetClosureDate, setTargetClosureDate] = useState('2026-07-25');

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('garment_access_token');
      const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
      const [rwkRes, capaRes] = await Promise.all([
        fetch('/api/v1/qa/rework-orders', { headers }).then(r => r.json()),
        fetch('/api/v1/qa/capa', { headers }).then(r => r.json())
      ]);

      if (rwkRes.success) setReworkOrders(rwkRes.data);
      if (capaRes.success) setCapaRecords(capaRes.data);
    } catch (err) {
      console.error('Failed to load rework/CAPA data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdateReworkStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRework) return;

    try {
      const token = localStorage.getItem('garment_access_token');
      const res = await fetch(`/api/v1/qa/rework-orders/${selectedRework.id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          status: updateStatus,
          repairedQty: Number(repairedQty),
          scrappedQty: Number(scrappedQty)
        })
      });

      const json = await res.json();
      if (json.success) {
        setSelectedRework(null);
        fetchData();
      } else {
        alert(json.error?.message || 'Failed to update rework order');
      }
    } catch (err) {
      console.error('Error updating rework order', err);
    }
  };

  const handleCreateCapa = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('garment_access_token');
      const res = await fetch('/api/v1/qa/capa', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          title: capaTitle,
          issueDescription,
          lineId,
          lineNumber,
          defectType,
          why1,
          why2,
          why3,
          why4,
          why5RootCause,
          category,
          correctiveAction,
          preventiveAction,
          assignedTo,
          targetClosureDate
        })
      });

      const json = await res.json();
      if (json.success) {
        setShowCapaModal(false);
        fetchData();
      } else {
        alert(json.error?.message || 'Failed to create CAPA');
      }
    } catch (err) {
      console.error('Error creating CAPA', err);
    }
  };

  const handleVerifyCapa = async (capaId: string) => {
    try {
      const token = localStorage.getItem('garment_access_token');
      const res = await fetch(`/api/v1/qa/capa/${capaId}/verify`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          signature: 'FA-QA-DIR-SIGN-OFF'
        })
      });

      const json = await res.json();
      if (json.success) {
        alert('CAPA Investigation approved & verified by QA Manager!');
        fetchData();
      } else {
        alert(json.error?.message || 'Failed to verify CAPA');
      }
    } catch (err) {
      console.error('Error verifying CAPA', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 text-slate-500">
        <RefreshCw className="w-5 h-5 animate-spin mr-2 text-emerald-700" />
        <span>Loading Rework & CAPA workflows...</span>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <RefreshCw className="h-6 w-6 text-emerald-700" />
            Rework Quarantine Orders & CAPA 5-Whys Root Cause
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Quarantine Defect Resolution, Floor Rework Station Routing, and Systematic 5-Whys Preventive Barriers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'capa' && (
            <button
              onClick={() => setShowCapaModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Initiate 5-Whys CAPA</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('rework')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'rework'
              ? 'border-emerald-700 text-emerald-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <RefreshCw className="w-4 h-4" />
          <span>Rework Quarantine Orders ({reworkOrders.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('capa')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'capa'
              ? 'border-emerald-700 text-emerald-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileCheck className="w-4 h-4" />
          <span>CAPA 5-Whys Investigations ({capaRecords.length})</span>
        </button>
      </div>

      {/* TAB 1: Rework Quarantine Orders */}
      {activeTab === 'rework' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900">Active Rework Quarantine Queue</h2>
              <span className="text-xs text-slate-500">Total Defective Pieces in Flow: {reworkOrders.reduce((sum, r) => sum + r.quarantineQty, 0)} pcs</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Rework Number</th>
                    <th className="py-3 px-4">Style & PO</th>
                    <th className="py-3 px-4">Defect & Severity</th>
                    <th className="py-3 px-4">Line & Repair Station</th>
                    <th className="py-3 px-4 text-center">Quarantine Qty</th>
                    <th className="py-3 px-4 text-center">Repaired / Scrapped</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {reworkOrders.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-4 font-mono font-bold text-emerald-800">
                        {r.reworkNumber}
                      </td>
                      <td className="py-3 px-4 font-mono">
                        <div className="font-semibold text-slate-900">{r.styleNumber}</div>
                        <div className="text-[10px] text-slate-500">{r.poNumber}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">{r.defectName}</div>
                        <span className={`inline-block mt-0.5 px-1.5 py-0.2 rounded text-[9px] font-bold border ${
                          r.severity === 'CRITICAL'
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : 'bg-amber-50 text-amber-800 border-amber-200'
                        }`}>
                          {r.severity}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-slate-900 font-medium">{r.lineNumber.split('(')[0]}</div>
                        <div className="text-[10px] text-slate-500">{r.assignedRepairOperator}</div>
                      </td>
                      <td className="py-3 px-4 text-center font-mono font-extrabold text-sm text-slate-900">
                        {r.quarantineQty} pcs
                      </td>
                      <td className="py-3 px-4 text-center font-mono text-[11px]">
                        <span className="text-emerald-700 font-bold">{r.repairedQty} rep</span>
                        <span className="text-slate-400 mx-1">/</span>
                        <span className="text-rose-600 font-bold">{r.scrappedQty} scrap</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold inline-flex items-center gap-1 border ${
                          r.status === 'RE_INSPECTED_PASS'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : r.status === 'IN_REPAIR'
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}>
                          {r.status === 'RE_INSPECTED_PASS' && <CheckCircle2 className="w-3 h-3 text-emerald-700" />}
                          {r.status === 'IN_REPAIR' && <Wrench className="w-3 h-3 text-amber-700" />}
                          {r.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => {
                            setSelectedRework(r);
                            setRepairedQty(r.repairedQty || r.quarantineQty);
                            setScrappedQty(r.scrappedQty || 0);
                            setUpdateStatus(r.status);
                          }}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-bold rounded cursor-pointer transition shadow-2xs"
                        >
                          Update Status
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CAPA 5-Whys Investigations */}
      {activeTab === 'capa' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {capaRecords.map((capa) => {
              const isApproved = capa.status === 'APPROVED_ACTIVE' || capa.status === 'VERIFIED_CLOSED';

              return (
                <div key={capa.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded border border-emerald-200">
                          {capa.capaNumber}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 uppercase">
                          {capa.category}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          isApproved 
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                            : 'bg-amber-50 text-amber-800 border-amber-200'
                        }`}>
                          {capa.status.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-slate-900 mt-1">{capa.title}</h3>
                      <p className="text-xs text-slate-500 mt-0.5">{capa.issueDescription}</p>
                    </div>

                    {!isApproved && (
                      <button
                        onClick={() => handleVerifyCapa(capa.id)}
                        className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl shadow cursor-pointer transition flex items-center gap-1.5 shrink-0"
                      >
                        <UserCheck className="w-4 h-4" />
                        <span>QA Manager Sign-Off</span>
                      </button>
                    )}
                  </div>

                  {/* 5-Whys Causality Chain */}
                  <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200 space-y-2">
                    <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider">
                      5-Whys Root Cause Chain
                    </span>
                    <div className="space-y-1.5 text-xs text-slate-700 font-medium">
                      <div className="flex items-start gap-2">
                        <span className="px-1.5 py-0.2 bg-white border border-slate-200 rounded font-mono font-bold text-[10px] text-slate-500 shrink-0">Why 1</span>
                        <span>{capa.why1}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="px-1.5 py-0.2 bg-white border border-slate-200 rounded font-mono font-bold text-[10px] text-slate-500 shrink-0">Why 2</span>
                        <span>{capa.why2}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="px-1.5 py-0.2 bg-white border border-slate-200 rounded font-mono font-bold text-[10px] text-slate-500 shrink-0">Why 3</span>
                        <span>{capa.why3}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="px-1.5 py-0.2 bg-white border border-slate-200 rounded font-mono font-bold text-[10px] text-slate-500 shrink-0">Why 4</span>
                        <span>{capa.why4}</span>
                      </div>
                      <div className="flex items-start gap-2 pt-1 border-t border-slate-200 text-rose-900 font-bold">
                        <span className="px-1.5 py-0.2 bg-rose-100 border border-rose-200 rounded font-mono font-bold text-[10px] text-rose-700 shrink-0">ROOT CAUSE</span>
                        <span>{capa.why5RootCause}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions & Verification */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1">
                      <span className="text-[10px] font-bold text-emerald-800 uppercase">Corrective Action Taken</span>
                      <p className="text-slate-700">{capa.correctiveAction}</p>
                    </div>
                    <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1">
                      <span className="text-[10px] font-bold text-amber-800 uppercase">Preventive Barrier (Poka-Yoke)</span>
                      <p className="text-slate-700">{capa.preventiveAction}</p>
                    </div>
                  </div>

                  {/* Sign-off footer */}
                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>Target Closure: <strong className="text-slate-800 font-mono">{capa.targetClosureDate}</strong></span>
                    </div>
                    {capa.qaManagerApproval && (
                      <div className="flex items-center gap-1 text-emerald-700 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Signed by {capa.qaManagerApproval.approvedBy}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal: Update Rework Order */}
      {selectedRework && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md p-6 shadow-2xl relative space-y-4">
            <button 
              onClick={() => setSelectedRework(null)} 
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200">
                <RefreshCw className="h-6 w-6 text-emerald-700" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">Update Rework Status</h2>
                <p className="text-xs text-slate-500">Record repair completion or scrap quantities</p>
              </div>
            </div>

            <form onSubmit={handleUpdateReworkStatus} className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-slate-700">Rework Lifecycle Status</label>
                <select
                  value={updateStatus}
                  onChange={(e) => setUpdateStatus(e.target.value as any)}
                  className="mt-1 w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 font-bold focus:outline-none focus:border-emerald-600"
                >
                  <option value="PENDING_REWORK">PENDING REWORK (Quarantined)</option>
                  <option value="IN_REPAIR">IN REPAIR (At Repair Station)</option>
                  <option value="RE_INSPECTED_PASS">RE-INSPECTED PASS (Return to Good Stream)</option>
                  <option value="SCRAPPED_B_GRADE">SCRAPPED / B-GRADE (Downgraded)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700">Repaired Pieces (Pcs)</label>
                  <input
                    type="number"
                    min="0"
                    value={repairedQty}
                    onChange={(e) => setRepairedQty(Number(e.target.value))}
                    className="mt-1 w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 font-mono focus:outline-none focus:border-emerald-600"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700">Scrapped Pieces (Pcs)</label>
                  <input
                    type="number"
                    min="0"
                    value={scrappedQty}
                    onChange={(e) => setScrappedQty(Number(e.target.value))}
                    className="mt-1 w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 font-mono focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedRework(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold rounded-lg shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Save Status</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Initiate CAPA */}
      {showCapaModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-xl p-6 shadow-2xl relative space-y-4 max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setShowCapaModal(false)} 
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200">
                <FileCheck className="h-6 w-6 text-emerald-700" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">Initiate CAPA 5-Whys Root Cause Investigation</h2>
                <p className="text-xs text-slate-500">Systematic preventive barrier for recurring quality incidents</p>
              </div>
            </div>

            <form onSubmit={handleCreateCapa} className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-slate-700">Incident Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Broken needle cluster on heavyweight fleece"
                  value={capaTitle}
                  onChange={(e) => setCapaTitle(e.target.value)}
                  className="mt-1 w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700">Sewing Line</label>
                  <select
                    value={lineId}
                    onChange={(e) => {
                      setLineId(e.target.value);
                      setLineNumber(e.target.options[e.target.selectedIndex].text);
                    }}
                    className="mt-1 w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
                  >
                    <option value="line-sew-01">Sewing Line 01 (Polo Shirt Specialist)</option>
                    <option value="line-sew-02">Sewing Line 02 (Basic Crew Neck Tee)</option>
                    <option value="line-sew-03">Sewing Line 03 (Fleece Hoodie Line)</option>
                    <option value="line-sew-04">Sewing Line 04 (Denim Jacket Assembly)</option>
                    <option value="line-sew-05">Sewing Line 05 (Woven Chino Pant)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700">Defect Type</label>
                  <input
                    type="text"
                    required
                    value={defectType}
                    onChange={(e) => setDefectType(e.target.value)}
                    className="mt-1 w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="mt-1 w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
                  >
                    <option value="MACHINE">MACHINE (Mechanical / Gauge)</option>
                    <option value="METHOD_TRAINING">METHOD & TRAINING (SOP)</option>
                    <option value="MATERIAL">MATERIAL (Fabric / Thread)</option>
                    <option value="MANPOWER">MANPOWER (Human Error)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Problem Description</label>
                <textarea
                  rows={2}
                  required
                  value={issueDescription}
                  onChange={(e) => setIssueDescription(e.target.value)}
                  className="mt-1 w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
                />
              </div>

              {/* 5 Whys */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <span className="text-[11px] font-bold text-slate-700 uppercase">5-Whys Cascade</span>
                <div>
                  <label className="text-[10px] text-slate-500 font-bold">1. Why did the defect happen?</label>
                  <input
                    type="text"
                    required
                    value={why1}
                    onChange={(e) => setWhy1(e.target.value)}
                    className="mt-0.5 w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded text-xs text-slate-900"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 font-bold">2. Why did that condition occur?</label>
                  <input
                    type="text"
                    required
                    value={why2}
                    onChange={(e) => setWhy2(e.target.value)}
                    className="mt-0.5 w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded text-xs text-slate-900"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 font-bold">3. Why was that not prevented?</label>
                  <input
                    type="text"
                    required
                    value={why3}
                    onChange={(e) => setWhy3(e.target.value)}
                    className="mt-0.5 w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded text-xs text-slate-900"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 font-bold">4. Why did the standard process fail?</label>
                  <input
                    type="text"
                    required
                    value={why4}
                    onChange={(e) => setWhy4(e.target.value)}
                    className="mt-0.5 w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded text-xs text-slate-900"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-rose-700 font-bold">5. Why (Fundamental Root Cause):</label>
                  <input
                    type="text"
                    required
                    value={why5RootCause}
                    onChange={(e) => setWhy5RootCause(e.target.value)}
                    className="mt-0.5 w-full px-2.5 py-1.5 bg-white border border-rose-300 rounded text-xs text-rose-950 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Corrective Action</label>
                <input
                  type="text"
                  required
                  value={correctiveAction}
                  onChange={(e) => setCorrectiveAction(e.target.value)}
                  className="mt-1 w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Preventive Barrier (Poka-Yoke / SOP Update)</label>
                <input
                  type="text"
                  required
                  value={preventiveAction}
                  onChange={(e) => setPreventiveAction(e.target.value)}
                  className="mt-1 w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700">Responsible QA Engineer</label>
                  <input
                    type="text"
                    required
                    value={assignedTo}
                    onChange={(e) => setAssignedTo(e.target.value)}
                    className="mt-1 w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700">Target Closure Date</label>
                  <input
                    type="date"
                    required
                    value={targetClosureDate}
                    onChange={(e) => setTargetClosureDate(e.target.value)}
                    className="mt-1 w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCapaModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold rounded-lg shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <AlertTriangle className="w-4 h-4" />
                  <span>Submit CAPA Plan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
