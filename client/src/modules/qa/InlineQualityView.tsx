import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Plus, 
  AlertOctagon, 
  AlertTriangle, 
  Info, 
  X,
  ShieldCheck,
  Flame,
  CheckCircle2
} from 'lucide-react';
import { SewingDefectRecord, DefectSeverity, GarmentZone } from '../../types/qa';

export const InlineQualityView: React.FC = () => {
  const [defects, setDefects] = useState<SewingDefectRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedLineFilter, setSelectedLineFilter] = useState<string>('ALL');

  // Defect Log Form
  const [inspectionType, setInspectionType] = useState<'INLINE' | 'ENDLINE'>('INLINE');
  const [lineId, setLineId] = useState('line-sew-01');
  const [lineNumber, setLineNumber] = useState('Sewing Line 01 (Polo Shirt Specialist)');
  const [styleNumber, setStyleNumber] = useState('TSH-2026-001');
  const [poNumber, setPoNumber] = useState('PO-2026-001');
  const [defectCode, setDefectCode] = useState('DEF-ST-03');
  const [defectName, setDefectName] = useState('Skipped Stitch');
  const [severity, setSeverity] = useState<DefectSeverity>('MAJOR');
  const [zone, setZone] = useState<GarmentZone>('COLLAR');
  const [operatorStation, setOperatorStation] = useState('Station 08 (Placket Attacher)');
  const [inspectedGarments, setInspectedGarments] = useState(250);
  const [defectQty, setDefectQty] = useState(3);

  const lines = [
    { id: 'line-sew-01', name: 'Sewing Line 01 (Polo Shirt Specialist)', dhu: 1.6, status: 'GREEN' },
    { id: 'line-sew-02', name: 'Sewing Line 02 (Graphic Tees High-Speed)', dhu: 1.2, status: 'GREEN' },
    { id: 'line-sew-03', name: 'Sewing Line 03 (Hoodies & Fleece Complex)', dhu: 3.2, status: 'YELLOW' },
    { id: 'line-sew-04', name: 'Sewing Line 04 (Activewear & Shorts)', dhu: 1.0, status: 'GREEN' }
  ];

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('garment_access_token');
      const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await fetch('/api/v1/qa/inspections', { headers });
      const json = await res.json();
      if (json.success) {
        setDefects(json.data);
      }
    } catch (err) {
      console.error('Failed to load sewing defect records', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleLineSelect = (id: string, name: string) => {
    setLineId(id);
    setLineNumber(name);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('garment_access_token');
      const res = await fetch('/api/v1/qa/inspections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          inspectionType,
          lineId,
          lineNumber,
          styleNumber,
          poNumber,
          defectCode,
          defectName,
          severity,
          zone,
          operatorStation,
          inspectedGarments: Number(inspectedGarments),
          defectQty: Number(defectQty)
        })
      });

      const json = await res.json();
      if (json.success) {
        setShowModal(false);
        fetchData();
      } else {
        alert(json.error?.message || 'Failed to log defect');
      }
    } catch (err) {
      console.error('Error logging defect', err);
    }
  };

  const filteredDefects = selectedLineFilter === 'ALL' 
    ? defects 
    : defects.filter(d => d.lineId === selectedLineFilter);

  const criticalCount = defects.filter(d => d.severity === 'CRITICAL').length;
  const majorCount = defects.filter(d => d.severity === 'MAJOR').length;
  const minorCount = defects.filter(d => d.severity === 'MINOR').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 text-slate-500">
        <Activity className="w-5 h-5 animate-spin mr-2 text-emerald-700" />
        <span>Loading Inline & End-line Quality records...</span>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Activity className="h-6 w-6 text-emerald-700" />
            Inline & End-Line Sewing Quality Control (DHU Tracker)
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-Time Sewing Traffic-Light Line Audits, Critical/Major/Minor Defect Sizing, and Auto-Rework Triggering.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span>Log Sewing Line Defect</span>
        </button>
      </div>

      {/* 4 Lines Floor Topology & Traffic-Light Status */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {lines.map((line) => {
          const isGreen = line.status === 'GREEN';
          return (
            <div 
              key={line.id} 
              onClick={() => setSelectedLineFilter(selectedLineFilter === line.id ? 'ALL' : line.id)}
              className={`p-4 rounded-xl border bg-white shadow-sm transition-all cursor-pointer ${
                selectedLineFilter === line.id 
                  ? 'border-emerald-600 ring-2 ring-emerald-500/20' 
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{line.name.split('(')[0]}</h3>
                  <p className="text-[11px] text-slate-500 font-medium">{line.name.split('(')[1]?.replace(')', '')}</p>
                </div>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border ${
                  isGreen 
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                    : 'bg-amber-50 text-amber-800 border-amber-200'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${isGreen ? 'bg-emerald-600' : 'bg-amber-500'}`} />
                  {isGreen ? 'GOOD (< 2% DHU)' : 'ALERT (2-4% DHU)'}
                </span>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500">Live DHU Score</span>
                <span className="text-base font-extrabold font-mono text-slate-900">{line.dhu}%</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Severity Breakdown Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500">Critical Severity Defects</p>
            <p className="text-2xl font-extrabold text-rose-600 mt-1">{criticalCount}</p>
            <p className="text-[10px] text-rose-500 font-medium">Immediate Line Hold & Metal Audit</p>
          </div>
          <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200">
            <AlertOctagon className="w-5 h-5 text-rose-600" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500">Major Severity Defects</p>
            <p className="text-2xl font-extrabold text-amber-700 mt-1">{majorCount}</p>
            <p className="text-[10px] text-amber-600 font-medium">Automatic Rework Order Issued</p>
          </div>
          <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500">Minor Severity Defects</p>
            <p className="text-2xl font-extrabold text-sky-700 mt-1">{minorCount}</p>
            <p className="text-[10px] text-sky-600 font-medium">Floor Correction & Local Trim</p>
          </div>
          <div className="p-2.5 rounded-xl bg-sky-50 border border-sky-200">
            <Info className="w-5 h-5 text-sky-600" />
          </div>
        </div>
      </div>

      {/* Live Defect Matrix Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-slate-900">Sewing Defect Matrix Ledger</h2>
            {selectedLineFilter !== 'ALL' && (
              <span className="text-xs bg-emerald-50 text-emerald-800 font-bold px-2 py-0.5 rounded border border-emerald-200">
                Filtered: {selectedLineFilter}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setSelectedLineFilter('ALL')} 
              className={`text-xs px-2.5 py-1 rounded cursor-pointer ${
                selectedLineFilter === 'ALL' ? 'bg-slate-100 font-bold text-slate-800' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              All Lines
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold text-[10px]">
              <tr>
                <th className="py-3 px-4">Type & Code</th>
                <th className="py-3 px-4">Line & Station</th>
                <th className="py-3 px-4">Style & PO</th>
                <th className="py-3 px-4">Defect Description</th>
                <th className="py-3 px-4 text-center">Zone</th>
                <th className="py-3 px-4 text-center">Severity</th>
                <th className="py-3 px-4 text-center">Defect / Sample</th>
                <th className="py-3 px-4 text-center">DHU %</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDefects.map((d) => (
                <tr key={d.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3 px-4 font-mono">
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800 mr-1.5">
                      {d.inspectionType}
                    </span>
                    <span className="font-bold text-emerald-800">{d.defectCode}</span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-900">{d.lineNumber.split('(')[0]}</div>
                    <div className="text-[10px] text-slate-500">{d.operatorStation || 'Floor General'}</div>
                  </td>
                  <td className="py-3 px-4 font-mono">
                    <div className="text-slate-900 font-semibold">{d.styleNumber}</div>
                    <div className="text-[10px] text-slate-500">{d.poNumber}</div>
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-900">{d.defectName}</td>
                  <td className="py-3 px-4 text-center">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 font-mono">
                      {d.zone}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                      d.severity === 'CRITICAL'
                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                        : d.severity === 'MAJOR'
                        ? 'bg-amber-50 text-amber-800 border-amber-200'
                        : 'bg-sky-50 text-sky-700 border-sky-200'
                    }`}>
                      {d.severity}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center font-mono font-medium">
                    {d.defectQty} / {d.inspectedGarments}
                  </td>
                  <td className="py-3 px-4 text-center font-mono font-bold text-slate-900">
                    {d.dhuPercent}%
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                      d.status === 'REWORK_ISSUED' 
                        ? 'bg-amber-100 text-amber-800' 
                        : d.status === 'RESOLVED' 
                        ? 'bg-emerald-50 text-emerald-800' 
                        : 'bg-slate-100 text-slate-700'
                    }`}>
                      {d.status === 'REWORK_ISSUED' && <Flame className="w-3 h-3 text-amber-600" />}
                      {d.status === 'RESOLVED' && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                      {d.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Log Defect */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative space-y-4 max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setShowModal(false)} 
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200">
                <Activity className="h-6 w-6 text-emerald-700" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">Log Sewing Floor Defect</h2>
                <p className="text-xs text-slate-500">Record station audit with DHU calculation</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700">Inspection Type</label>
                  <select
                    value={inspectionType}
                    onChange={(e) => setInspectionType(e.target.value as any)}
                    className="mt-1 w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
                  >
                    <option value="INLINE">INLINE (Floor Station)</option>
                    <option value="ENDLINE">ENDLINE (Final Table)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700">Sewing Line</label>
                  <select
                    value={lineId}
                    onChange={(e) => {
                      const selected = lines.find(l => l.id === e.target.value);
                      if (selected) handleLineSelect(selected.id, selected.name);
                    }}
                    className="mt-1 w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
                  >
                    {lines.map(l => (
                      <option key={l.id} value={l.id}>{l.name.split('(')[0]}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700">Style Number</label>
                  <input
                    type="text"
                    required
                    value={styleNumber}
                    onChange={(e) => setStyleNumber(e.target.value)}
                    className="mt-1 w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 font-mono focus:outline-none focus:border-emerald-600"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700">Linked Buyer PO</label>
                  <input
                    type="text"
                    required
                    value={poNumber}
                    onChange={(e) => setPoNumber(e.target.value)}
                    className="mt-1 w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 font-mono focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700">Defect Code</label>
                  <input
                    type="text"
                    required
                    value={defectCode}
                    onChange={(e) => setDefectCode(e.target.value)}
                    className="mt-1 w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 font-mono focus:outline-none focus:border-emerald-600"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700">Defect Description</label>
                  <input
                    type="text"
                    required
                    value={defectName}
                    onChange={(e) => setDefectName(e.target.value)}
                    className="mt-1 w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700">Defect Severity</label>
                  <select
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value as any)}
                    className="mt-1 w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 font-bold focus:outline-none focus:border-emerald-600"
                  >
                    <option value="CRITICAL">CRITICAL (Needle / Stoppage)</option>
                    <option value="MAJOR">MAJOR (Auto-Rework)</option>
                    <option value="MINOR">MINOR (Local Fix)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700">Garment Zone</label>
                  <select
                    value={zone}
                    onChange={(e) => setZone(e.target.value as any)}
                    className="mt-1 w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
                  >
                    <option value="COLLAR">COLLAR</option>
                    <option value="ARMHOLE">ARMHOLE</option>
                    <option value="PLACKET">PLACKET</option>
                    <option value="HEM">HEM</option>
                    <option value="SIDE_SEAM">SIDE SEAM</option>
                    <option value="CUFF">CUFF</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Operator Workstation</label>
                <input
                  type="text"
                  value={operatorStation}
                  onChange={(e) => setOperatorStation(e.target.value)}
                  className="mt-1 w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700">Sample Inspected (Pcs)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={inspectedGarments}
                    onChange={(e) => setInspectedGarments(Number(e.target.value))}
                    className="mt-1 w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 font-mono focus:outline-none focus:border-emerald-600"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700">Defect Pieces Found</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={defectQty}
                    onChange={(e) => setDefectQty(Number(e.target.value))}
                    className="mt-1 w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 font-mono focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              {severity !== 'MINOR' && (
                <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-[11px] text-amber-800 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Logging a {severity} defect automatically creates a quarantined Rework Order for floor repair.</span>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold rounded-lg shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Confirm Defect Log</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
