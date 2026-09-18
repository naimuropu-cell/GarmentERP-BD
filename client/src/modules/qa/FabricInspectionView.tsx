import React, { useState, useEffect } from 'react';
import { 
  Scissors, 
  Plus, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  X,
  FileSpreadsheet,
  Info,
  ShieldCheck
} from 'lucide-react';
import { Fabric4PointInspection } from '../../types/qa';

export const FabricInspectionView: React.FC = () => {
  const [inspections, setInspections] = useState<Fabric4PointInspection[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [rollNumber, setRollNumber] = useState(`ROL-PTM-${Date.now().toString().slice(-4)}`);
  const [fabricLot, setFabricLot] = useState('LOT-PTM-2026-A');
  const [fabricType, setFabricType] = useState('100% Combed Cotton Pique 185 GSM');
  const [inspectedLengthYards, setInspectedLengthYards] = useState(120);
  const [fabricWidthInches, setFabricWidthInches] = useState(68);
  const [defectsSize1Count, setDefectsSize1Count] = useState(2);
  const [defectsSize2Count, setDefectsSize2Count] = useState(1);
  const [defectsSize3Count, setDefectsSize3Count] = useState(0);
  const [defectsSize4Count, setDefectsSize4Count] = useState(0);
  const [comments, setComments] = useState('Uniform knit structure, zero barre shading, ready for lay spreading.');

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('garment_access_token');
      const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await fetch('/api/v1/qa/fabric-4point', { headers });
      const json = await res.json();
      if (json.success) {
        setInspections(json.data);
      }
    } catch (err) {
      console.error('Failed to load fabric 4-point inspections', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Computed point values in form
  const totalPoints = 
    (Number(defectsSize1Count) * 1) + 
    (Number(defectsSize2Count) * 2) + 
    (Number(defectsSize3Count) * 3) + 
    (Number(defectsSize4Count) * 4);

  const previewScore = (inspectedLengthYards > 0 && fabricWidthInches > 0)
    ? Number(((totalPoints * 3600) / (inspectedLengthYards * fabricWidthInches)).toFixed(2))
    : 0;

  const previewGrade = previewScore > 28 ? 'REJECTED' : (previewScore > 20 ? 'WARNING_ACCEPTABLE' : 'FIRST_QUALITY_PASS');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('garment_access_token');
      const res = await fetch('/api/v1/qa/fabric-4point', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          rollNumber,
          fabricLot,
          fabricType,
          inspectedLengthYards: Number(inspectedLengthYards),
          fabricWidthInches: Number(fabricWidthInches),
          defectsSize1Count: Number(defectsSize1Count),
          defectsSize2Count: Number(defectsSize2Count),
          defectsSize3Count: Number(defectsSize3Count),
          defectsSize4Count: Number(defectsSize4Count),
          comments
        })
      });

      const json = await res.json();
      if (json.success) {
        setShowModal(false);
        fetchData();
      } else {
        alert(json.error?.message || 'Failed to submit inspection');
      }
    } catch (err) {
      console.error('Error submitting fabric inspection', err);
    }
  };

  const passCount = inspections.filter(i => i.penaltyGrade === 'FIRST_QUALITY_PASS').length;
  const warnCount = inspections.filter(i => i.penaltyGrade === 'WARNING_ACCEPTABLE').length;
  const rejectCount = inspections.filter(i => i.penaltyGrade === 'REJECTED').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 text-slate-500">
        <Scissors className="w-5 h-5 animate-spin mr-2 text-emerald-700" />
        <span>Loading Fabric 4-Point System Registry...</span>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Scissors className="h-6 w-6 text-emerald-700" />
            Fabric 4-Point Inspection System (ASTM D5430)
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Automated Points per 100 Sq. Yards Penalty Grading, Defect Sizing Brackets, and Lay Spreading Release Gate.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span>Conduct 4-Point Inspection</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500">Total Rolls Inspected</p>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">{inspections.length}</p>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
            <FileSpreadsheet className="w-5 h-5 text-slate-600" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500">First Quality (Pass)</p>
            <p className="text-2xl font-extrabold text-emerald-700 mt-1">{passCount}</p>
            <p className="text-[10px] text-emerald-600 font-medium">≤ 20.0 pts / 100 sq yds</p>
          </div>
          <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200">
            <CheckCircle2 className="w-5 h-5 text-emerald-700" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500">Acceptable with Warning</p>
            <p className="text-2xl font-extrabold text-amber-700 mt-1">{warnCount}</p>
            <p className="text-[10px] text-amber-600 font-medium">20.1 - 28.0 pts</p>
          </div>
          <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500">Rejected Fabric Rolls</p>
            <p className="text-2xl font-extrabold text-rose-600 mt-1">{rejectCount}</p>
            <p className="text-[10px] text-rose-500 font-medium">&gt; 28.0 pts (Quarantine Hold)</p>
          </div>
          <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200">
            <XCircle className="w-5 h-5 text-rose-600" />
          </div>
        </div>
      </div>

      {/* ASTM 4-Point System Formula Banner */}
      <div className="p-4 bg-emerald-50/70 rounded-xl border border-emerald-200 flex items-start gap-3">
        <Info className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-700 space-y-1">
          <p className="font-bold text-emerald-950">ASTM D5430 Standard 4-Point Scoring Formula</p>
          <p className="font-mono text-emerald-900">
            Points / 100 Sq. Yards = (Total Defect Points × 3,600) ÷ (Inspected Length in Yards × Fabric Width in Inches)
          </p>
          <p className="text-[11px] text-slate-600">
            Defect Length Brackets: Up to 3" = <strong>1 pt</strong> | 3" to 6" = <strong>2 pts</strong> | 6" to 9" = <strong>3 pts</strong> | Over 9" or Holes = <strong>4 pts</strong>. Max 4 points per linear yard.
          </p>
        </div>
      </div>

      {/* Inspected Rolls Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">Fabric Roll Inspection Logbook</h2>
          <span className="text-xs text-slate-500">Showing {inspections.length} Inspected Rolls</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold text-[10px]">
              <tr>
                <th className="py-3 px-4">Roll & Lot</th>
                <th className="py-3 px-4">Fabric Construction</th>
                <th className="py-3 px-4">Dimensions</th>
                <th className="py-3 px-4">Defect Brackets (1/2/3/4)</th>
                <th className="py-3 px-4 text-center">Score (Pts/100 yd²)</th>
                <th className="py-3 px-4 text-center">Penalty Grade</th>
                <th className="py-3 px-4">Inspector & Date</th>
                <th className="py-3 px-4">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {inspections.map((row) => {
                const isPass = row.penaltyGrade === 'FIRST_QUALITY_PASS';
                const isWarn = row.penaltyGrade === 'WARNING_ACCEPTABLE';

                return (
                  <tr key={row.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4 font-medium text-slate-900">
                      <div className="font-mono font-bold text-emerald-800">{row.rollNumber}</div>
                      <div className="text-[10px] text-slate-500">{row.fabricLot}</div>
                    </td>
                    <td className="py-3 px-4 max-w-xs">{row.fabricType}</td>
                    <td className="py-3 px-4 font-mono">
                      <div>{row.inspectedLengthYards} yds</div>
                      <div className="text-[10px] text-slate-500">{row.fabricWidthInches}" width</div>
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px]">
                      <span className="px-1 py-0.5 bg-slate-100 rounded text-slate-700 mr-1" title="Size 1 (1 pt)">{row.defectsSize1Count}</span>
                      <span className="px-1 py-0.5 bg-slate-100 rounded text-slate-700 mr-1" title="Size 2 (2 pts)">{row.defectsSize2Count}</span>
                      <span className="px-1 py-0.5 bg-slate-100 rounded text-slate-700 mr-1" title="Size 3 (3 pts)">{row.defectsSize3Count}</span>
                      <span className="px-1 py-0.5 bg-slate-100 rounded text-slate-700" title="Size 4 (4 pts)">{row.defectsSize4Count}</span>
                      <span className="ml-2 font-bold text-slate-900">({row.totalDefectPoints} pts)</span>
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-extrabold text-sm">
                      <span className={isPass ? 'text-emerald-700' : isWarn ? 'text-amber-700' : 'text-rose-600'}>
                        {row.pointsPer100SqYards}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                        isPass 
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                          : isWarn
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}>
                        {isPass && <CheckCircle2 className="w-3 h-3" />}
                        {isWarn && <AlertTriangle className="w-3 h-3" />}
                        {!isPass && !isWarn && <XCircle className="w-3 h-3" />}
                        {row.penaltyGrade.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-slate-800 font-medium">{row.inspectorName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {new Date(row.inspectedAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-[11px] text-slate-600 max-w-xs truncate" title={row.comments}>
                      {row.comments || '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Record Fabric 4-Point Inspection */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-xl p-6 shadow-2xl relative space-y-4 max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setShowModal(false)} 
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200">
                <Scissors className="h-6 w-6 text-emerald-700" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">Conduct Fabric 4-Point Inspection</h2>
                <p className="text-xs text-slate-500">Record roll defects by standard size brackets</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700">Roll Barcode / Number</label>
                  <input
                    type="text"
                    required
                    value={rollNumber}
                    onChange={(e) => setRollNumber(e.target.value)}
                    className="mt-1 w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 font-mono focus:outline-none focus:border-emerald-600"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700">Fabric Lot Number</label>
                  <input
                    type="text"
                    required
                    value={fabricLot}
                    onChange={(e) => setFabricLot(e.target.value)}
                    className="mt-1 w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 font-mono focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Fabric Construction & Type</label>
                <input
                  type="text"
                  required
                  value={fabricType}
                  onChange={(e) => setFabricType(e.target.value)}
                  className="mt-1 w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700">Inspected Length (Yards)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={inspectedLengthYards}
                    onChange={(e) => setInspectedLengthYards(Number(e.target.value))}
                    className="mt-1 w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 font-mono focus:outline-none focus:border-emerald-600"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700">Fabric Width (Inches)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={fabricWidthInches}
                    onChange={(e) => setFabricWidthInches(Number(e.target.value))}
                    className="mt-1 w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 font-mono focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              {/* Defect Point Counts */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <span className="text-[11px] font-bold text-slate-700 uppercase">Defect Count by Length Bracket</span>
                <div className="grid grid-cols-4 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-500 font-medium">Up to 3" (1 pt)</label>
                    <input
                      type="number"
                      min="0"
                      value={defectsSize1Count}
                      onChange={(e) => setDefectsSize1Count(Number(e.target.value))}
                      className="mt-0.5 w-full px-2 py-1.5 bg-white border border-slate-200 rounded text-xs text-slate-900 font-mono text-center font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 font-medium">3" to 6" (2 pts)</label>
                    <input
                      type="number"
                      min="0"
                      value={defectsSize2Count}
                      onChange={(e) => setDefectsSize2Count(Number(e.target.value))}
                      className="mt-0.5 w-full px-2 py-1.5 bg-white border border-slate-200 rounded text-xs text-slate-900 font-mono text-center font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 font-medium">6" to 9" (3 pts)</label>
                    <input
                      type="number"
                      min="0"
                      value={defectsSize3Count}
                      onChange={(e) => setDefectsSize3Count(Number(e.target.value))}
                      className="mt-0.5 w-full px-2 py-1.5 bg-white border border-slate-200 rounded text-xs text-slate-900 font-mono text-center font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 font-medium">&gt; 9" or Hole (4 pts)</label>
                    <input
                      type="number"
                      min="0"
                      value={defectsSize4Count}
                      onChange={(e) => setDefectsSize4Count(Number(e.target.value))}
                      className="mt-0.5 w-full px-2 py-1.5 bg-white border border-slate-200 rounded text-xs text-slate-900 font-mono text-center font-bold"
                    />
                  </div>
                </div>

                {/* Real-time Calculation Preview */}
                <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
                  <span className="text-slate-600">Total Defect Points: <strong>{totalPoints} pts</strong></span>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-600">Calculated Score:</span>
                    <span className="font-mono font-extrabold text-sm text-emerald-800">{previewScore} pts/100 yd²</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                      previewGrade === 'FIRST_QUALITY_PASS' 
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                        : previewGrade === 'WARNING_ACCEPTABLE'
                        ? 'bg-amber-50 text-amber-800 border-amber-200'
                        : 'bg-rose-50 text-rose-700 border-rose-200'
                    }`}>
                      {previewGrade.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Inspection Remarks & Shade Notes</label>
                <textarea
                  rows={2}
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  className="mt-1 w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
                />
              </div>

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
                  <span>Certify Inspection</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
