import React, { useState, useEffect } from 'react';
import { 
  Award, 
  CheckCircle2, 
  XCircle, 
  Calculator, 
  FileText, 
  X,
  ShieldCheck,
  Building,
  Printer
} from 'lucide-react';
import { AqlSamplingInspection } from '../../types/qa';

export const AqlSamplingView: React.FC = () => {
  const [inspections, setInspections] = useState<AqlSamplingInspection[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedCert, setSelectedCert] = useState<AqlSamplingInspection | null>(null);

  // AQL Calculator Form
  const [poNumber, setPoNumber] = useState('PO-2026-001');
  const [buyerPo, setBuyerPo] = useState('HM-PO-99201');
  const [buyerName, setBuyerName] = useState('H&M Hennes & Mauritz GBC AB');
  const [styleNumber, setStyleNumber] = useState('TSH-2026-001');
  const [totalLotSize, setTotalLotSize] = useState(5000);
  const [generalInspectionLevel, setGeneralInspectionLevel] = useState<'LEVEL_I' | 'LEVEL_II' | 'LEVEL_III'>('LEVEL_II');
  const [criticalDefectsFound, setCriticalDefectsFound] = useState(0);
  const [majorDefectsFound, setMajorDefectsFound] = useState(3);
  const [minorDefectsFound, setMinorDefectsFound] = useState(5);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('garment_access_token');
      const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await fetch('/api/v1/qa/aql', { headers });
      const json = await res.json();
      if (json.success) {
        setInspections(json.data);
      }
    } catch (err) {
      console.error('Failed to load AQL inspections', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ISO 2859-1 Level II Normal Sampling calculation
  const getAqlParameters = (lot: number) => {
    if (lot <= 500) {
      return { code: 'H', sampleSize: 50, majorAc: 3, majorRe: 4, minorAc: 5, minorRe: 6 };
    } else if (lot <= 1200) {
      return { code: 'J', sampleSize: 80, majorAc: 5, majorRe: 6, minorAc: 7, minorRe: 8 };
    } else if (lot <= 3200) {
      return { code: 'K', sampleSize: 125, majorAc: 7, majorRe: 8, minorAc: 10, minorRe: 11 };
    } else if (lot <= 10000) {
      return { code: 'K', sampleSize: 315, majorAc: 14, majorRe: 15, minorAc: 21, minorRe: 22 };
    } else {
      return { code: 'M', sampleSize: 315, majorAc: 14, majorRe: 15, minorAc: 21, minorRe: 22 };
    }
  };

  const aqlParams = getAqlParameters(totalLotSize);
  const isCalculatedPass = 
    criticalDefectsFound === 0 &&
    majorDefectsFound <= aqlParams.majorAc &&
    minorDefectsFound <= aqlParams.minorAc;

  const handleFinalizeAql = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('garment_access_token');
      const res = await fetch('/api/v1/qa/aql/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          poNumber,
          buyerPo,
          buyerName,
          styleNumber,
          totalLotSize: Number(totalLotSize),
          generalInspectionLevel,
          criticalDefectsFound: Number(criticalDefectsFound),
          majorDefectsFound: Number(majorDefectsFound),
          minorDefectsFound: Number(minorDefectsFound)
        })
      });

      const json = await res.json();
      if (json.success) {
        setShowModal(false);
        setSelectedCert(json.data);
        fetchData();
      } else {
        alert(json.error?.message || 'Failed to finalize AQL audit');
      }
    } catch (err) {
      console.error('Error finalizing AQL audit', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 text-slate-500">
        <Award className="w-5 h-5 animate-spin mr-2 text-emerald-700" />
        <span>Loading ISO AQL 2.5 Sampling Inspection records...</span>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Award className="h-6 w-6 text-emerald-700" />
            ISO 2859-1 / ANSI-ASQ Z1.4 (AQL 2.5 Sampling Inspection)
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            General Inspection Level II Normal Sampling Plans, Dynamic Sample Sizes, Accept/Reject Limits & Final Audit Certificates.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer shrink-0"
        >
          <Calculator className="h-4 w-4" />
          <span>Execute AQL 2.5 Final Audit</span>
        </button>
      </div>

      {/* ISO Level II Standard Matrix Reference Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Standard ISO 2859-1 Level II Normal Sampling Thresholds (Garment Export Standard)
          </h3>
          <span className="text-[11px] font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            AQL 2.5 (Major) / AQL 4.0 (Minor)
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[10px] text-slate-500 font-bold block">LOT SIZE 281 - 500</span>
            <p className="font-extrabold text-slate-900 mt-1">Sample: 50 pcs (Code H)</p>
            <p className="text-[10px] text-slate-600 mt-0.5">Major Ac 3 / Re 4 • Minor Ac 5 / Re 6</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[10px] text-slate-500 font-bold block">LOT SIZE 501 - 1,200</span>
            <p className="font-extrabold text-slate-900 mt-1">Sample: 80 pcs (Code J)</p>
            <p className="text-[10px] text-slate-600 mt-0.5">Major Ac 5 / Re 6 • Minor Ac 7 / Re 8</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[10px] text-slate-500 font-bold block">LOT SIZE 1,201 - 3,200</span>
            <p className="font-extrabold text-slate-900 mt-1">Sample: 125 pcs (Code K)</p>
            <p className="text-[10px] text-slate-600 mt-0.5">Major Ac 7 / Re 8 • Minor Ac 10 / Re 11</p>
          </div>
          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
            <span className="text-[10px] text-emerald-800 font-bold block">LOT SIZE 3,201 - 10,000</span>
            <p className="font-extrabold text-emerald-950 mt-1">Sample: 315 pcs (Code K/L)</p>
            <p className="text-[10px] text-emerald-800 mt-0.5 font-bold">Major Ac 14 / Re 15 • Minor Ac 21 / Re 22</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[10px] text-slate-500 font-bold block">LOT SIZE 10,001 - 35,000</span>
            <p className="font-extrabold text-slate-900 mt-1">Sample: 315 pcs (Code M)</p>
            <p className="text-[10px] text-slate-600 mt-0.5">Major Ac 14 / Re 15 • Minor Ac 21 / Re 22</p>
          </div>
        </div>
      </div>

      {/* AQL Certificates History */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">Final Export AQL 2.5 Inspection Certificates</h2>
          <span className="text-xs text-slate-500">Total Audited Orders: {inspections.length}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold text-[10px]">
              <tr>
                <th className="py-3 px-4">Certificate Number</th>
                <th className="py-3 px-4">Buyer & Order</th>
                <th className="py-3 px-4">Style Number</th>
                <th className="py-3 px-4 text-center">Lot Size</th>
                <th className="py-3 px-4 text-center">Sample Size</th>
                <th className="py-3 px-4 text-center">Critical (0.0)</th>
                <th className="py-3 px-4 text-center">Major 2.5 (Ac/Re)</th>
                <th className="py-3 px-4 text-center">Minor 4.0 (Ac/Re)</th>
                <th className="py-3 px-4 text-center">Audit Verdict</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {inspections.map((cert) => {
                const isPass = cert.overallResult === 'ACCEPTED_PASS';

                return (
                  <tr key={cert.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4 font-mono font-bold text-emerald-800">
                      {cert.certificateNumber}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{cert.buyerName}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{cert.buyerPo} ({cert.poNumber})</div>
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold text-slate-900">
                      {cert.styleNumber}
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-bold text-slate-900">
                      {cert.totalLotSize.toLocaleString()} pcs
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-bold text-emerald-800">
                      {cert.sampleSize} pcs ({cert.sampleSizeCodeLetter})
                    </td>
                    <td className="py-3 px-4 text-center font-mono">
                      <span className={cert.criticalDefectsFound > 0 ? 'text-rose-600 font-bold' : 'text-slate-700'}>
                        {cert.criticalDefectsFound}
                      </span> / 0
                    </td>
                    <td className="py-3 px-4 text-center font-mono">
                      <span className="font-bold text-emerald-700">{cert.majorDefectsFound}</span> / {cert.majorAc}
                    </td>
                    <td className="py-3 px-4 text-center font-mono">
                      <span className="font-bold text-emerald-700">{cert.minorDefectsFound}</span> / {cert.minorAc}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                        isPass 
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}>
                        {isPass ? <CheckCircle2 className="w-3 h-3 text-emerald-700" /> : <XCircle className="w-3 h-3 text-rose-600" />}
                        {isPass ? 'PASS (RELEASED)' : 'REJECT (HOLD)'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => setSelectedCert(cert)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-bold rounded cursor-pointer transition flex items-center gap-1 mx-auto"
                      >
                        <FileText className="w-3 h-3 text-emerald-700" />
                        <span>View Certificate</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: AQL Calculator & Audit Execution */}
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
                <Award className="h-6 w-6 text-emerald-700" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">Execute ISO AQL 2.5 Final Audit</h2>
                <p className="text-xs text-slate-500">ISO 2859-1 Level II Normal Sampling & Inspection Gate</p>
              </div>
            </div>

            <form onSubmit={handleFinalizeAql} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700">Buyer Name</label>
                  <input
                    type="text"
                    required
                    value={buyerName}
                    onChange={(e) => setBuyerName(e.target.value)}
                    className="mt-1 w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700">Buyer PO Number</label>
                  <input
                    type="text"
                    required
                    value={buyerPo}
                    onChange={(e) => setBuyerPo(e.target.value)}
                    className="mt-1 w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 font-mono focus:outline-none focus:border-emerald-600"
                  />
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
                  <label className="text-xs font-semibold text-slate-700">Internal Factory PO</label>
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
                  <label className="text-xs font-semibold text-slate-700">Order Lot Size (Total Pcs)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={totalLotSize}
                    onChange={(e) => setTotalLotSize(Number(e.target.value))}
                    className="mt-1 w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 font-mono font-bold focus:outline-none focus:border-emerald-600"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700">General Inspection Level</label>
                  <select
                    value={generalInspectionLevel}
                    onChange={(e) => setGeneralInspectionLevel(e.target.value as any)}
                    className="mt-1 w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
                  >
                    <option value="LEVEL_II">Level II (Normal General Inspection)</option>
                    <option value="LEVEL_I">Level I (Reduced Inspection)</option>
                    <option value="LEVEL_III">Level III (Tightened Inspection)</option>
                  </select>
                </div>
              </div>

              {/* Dynamic Sample Parameters Display */}
              <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-2">
                <span className="text-[11px] font-bold text-emerald-950 uppercase">
                  Calculated ISO 2859-1 Sampling Standards for {totalLotSize.toLocaleString()} Pcs
                </span>
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2 bg-white rounded-lg border border-emerald-200">
                    <span className="text-[10px] text-slate-500 font-bold block">Sample Size</span>
                    <span className="font-extrabold text-sm text-emerald-800 font-mono">
                      {aqlParams.sampleSize} pcs (Code {aqlParams.code})
                    </span>
                  </div>
                  <div className="p-2 bg-white rounded-lg border border-emerald-200">
                    <span className="text-[10px] text-slate-500 font-bold block">Major 2.5 Limit</span>
                    <span className="font-extrabold text-sm text-slate-900 font-mono">
                      Ac: {aqlParams.majorAc} / Re: {aqlParams.majorRe}
                    </span>
                  </div>
                  <div className="p-2 bg-white rounded-lg border border-emerald-200">
                    <span className="text-[10px] text-slate-500 font-bold block">Minor 4.0 Limit</span>
                    <span className="font-extrabold text-sm text-slate-900 font-mono">
                      Ac: {aqlParams.minorAc} / Re: {aqlParams.minorRe}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actual Defects Found Inputs */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <span className="text-[11px] font-bold text-slate-800 uppercase">Defects Found in {aqlParams.sampleSize} Pcs Sample</span>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-[10px] text-rose-700 font-bold">Critical (Max 0)</label>
                    <input
                      type="number"
                      min="0"
                      value={criticalDefectsFound}
                      onChange={(e) => setCriticalDefectsFound(Number(e.target.value))}
                      className="mt-0.5 w-full px-2 py-1.5 bg-white border border-slate-200 rounded text-xs text-slate-900 font-mono text-center font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-700 font-bold">Major (Max {aqlParams.majorAc})</label>
                    <input
                      type="number"
                      min="0"
                      value={majorDefectsFound}
                      onChange={(e) => setMajorDefectsFound(Number(e.target.value))}
                      className="mt-0.5 w-full px-2 py-1.5 bg-white border border-slate-200 rounded text-xs text-slate-900 font-mono text-center font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-700 font-bold">Minor (Max {aqlParams.minorAc})</label>
                    <input
                      type="number"
                      min="0"
                      value={minorDefectsFound}
                      onChange={(e) => setMinorDefectsFound(Number(e.target.value))}
                      className="mt-0.5 w-full px-2 py-1.5 bg-white border border-slate-200 rounded text-xs text-slate-900 font-mono text-center font-bold"
                    />
                  </div>
                </div>

                {/* Instant Calculated Verdict */}
                <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                  <span className="text-xs text-slate-600">Audit Outcome Verdict:</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-extrabold border ${
                    isCalculatedPass 
                      ? 'bg-emerald-100 text-emerald-900 border-emerald-300' 
                      : 'bg-rose-100 text-rose-900 border-rose-300'
                  }`}>
                    {isCalculatedPass ? 'ACCEPTED — READY FOR SHIPMENT' : 'REJECTED — INITIATE 100% RE-SCREENING'}
                  </span>
                </div>
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
                  <span>Issue Official Inspection Certificate</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Official Export Certificate View */}
      {selectedCert && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative space-y-4">
            <button 
              onClick={() => setSelectedCert(null)} 
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Printable Certificate Header */}
            <div className="text-center border-b border-slate-200 pb-4 space-y-1">
              <div className="flex items-center justify-center gap-2">
                <Building className="w-5 h-5 text-emerald-800" />
                <span className="font-extrabold text-base tracking-tight text-slate-900">Apex Garments Holdings BD</span>
              </div>
              <p className="text-[11px] text-slate-500">Quality Assurance Department • Savar Dhaka Complex</p>
              <div className="inline-block px-3 py-1 mt-1 bg-emerald-50 border border-emerald-200 rounded-full text-xs font-mono font-bold text-emerald-800">
                {selectedCert.certificateNumber}
              </div>
            </div>

            {/* Certificate Details */}
            <div className="space-y-3 text-xs text-slate-700">
              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div>Buyer: <strong className="text-slate-900">{selectedCert.buyerName}</strong></div>
                <div>Buyer PO: <strong className="text-slate-900 font-mono">{selectedCert.buyerPo}</strong></div>
                <div>Style: <strong className="text-slate-900 font-mono">{selectedCert.styleNumber}</strong></div>
                <div>Internal PO: <strong className="text-slate-900 font-mono">{selectedCert.poNumber}</strong></div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-500 font-bold block">Total Lot Size</span>
                  <span className="font-extrabold text-slate-900 font-mono">{selectedCert.totalLotSize.toLocaleString()} pcs</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-500 font-bold block">Sample Inspected</span>
                  <span className="font-extrabold text-emerald-800 font-mono">{selectedCert.sampleSize} pcs</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-500 font-bold block">Sampling Plan</span>
                  <span className="font-extrabold text-slate-900 font-mono">{selectedCert.generalInspectionLevel}</span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1 text-xs">
                <div className="flex justify-between">
                  <span>Critical (AQL 0.0, Max 0):</span>
                  <strong className={selectedCert.criticalDefectsFound > 0 ? 'text-rose-600' : 'text-slate-900 font-mono'}>
                    {selectedCert.criticalDefectsFound} Defect(s)
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span>Major (AQL 2.5, Max {selectedCert.majorAc}):</span>
                  <strong className="text-slate-900 font-mono">{selectedCert.majorDefectsFound} Defect(s)</strong>
                </div>
                <div className="flex justify-between">
                  <span>Minor (AQL 4.0, Max {selectedCert.minorAc}):</span>
                  <strong className="text-slate-900 font-mono">{selectedCert.minorDefectsFound} Defect(s)</strong>
                </div>
              </div>

              {/* Final Verdict Banner */}
              <div className={`p-3 rounded-xl border text-center font-extrabold text-sm ${
                selectedCert.overallResult === 'ACCEPTED_PASS'
                  ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                  : 'bg-rose-50 text-rose-900 border-rose-200'
              }`}>
                FINAL VERDICT: {selectedCert.overallResult.replace(/_/g, ' ')}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                <span>Audited on: {new Date(selectedCert.inspectionDate).toLocaleDateString()}</span>
                <span className="font-medium text-emerald-800">Sign-off: {selectedCert.qaManagerSignoff}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Certificate</span>
              </button>
              <button
                onClick={() => setSelectedCert(null)}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold rounded-lg cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
