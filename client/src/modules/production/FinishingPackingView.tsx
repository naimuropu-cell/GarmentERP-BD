import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Sparkles, 
  Plus, 
  Box, 
  ShieldCheck, 
  X
} from 'lucide-react';
import { FinishingBatch, CartonPackingRecord } from '../../types/production';

export const FinishingPackingView: React.FC = () => {
  const [batches, setBatches] = useState<FinishingBatch[]>([]);
  const [cartons, setCartons] = useState<CartonPackingRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [showPackModal, setShowPackModal] = useState(false);
  const [cartonNumber, setCartonNumber] = useState(`CTN-2026-${Date.now().toString().slice(-4)}`);
  const [poNumber, setPoNumber] = useState('PO-2026-001');
  const [buyerPo, setBuyerPo] = useState('HM-PO-99201');
  const [styleNumber, setStyleNumber] = useState('TSH-2026-001');
  const [color, setColor] = useState('White');
  const [ratioS, setRatioS] = useState(10);
  const [ratioM, setRatioM] = useState(20);
  const [ratioL, setRatioL] = useState(20);
  const [ratioXL, setRatioXL] = useState(10);
  const [grossWeightKg, setGrossWeightKg] = useState(13.9);
  const [netWeightKg, setNetWeightKg] = useState(12.6);
  const [cartonDimensionsCm, setCartonDimensionsCm] = useState('60 x 40 x 30');

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('garment_access_token');
      const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

      const [finRes, ctnRes] = await Promise.all([
        fetch('/api/v1/production/finishing', { headers }).then(r => r.json()),
        fetch('/api/v1/production/packing', { headers }).then(r => r.json())
      ]);

      if (finRes.success) setBatches(finRes.data);
      if (ctnRes.success) setCartons(ctnRes.data);
    } catch (err) {
      console.error('Failed to load finishing/packing data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAdvanceStage = async (batchId: string, stage: string) => {
    try {
      const token = localStorage.getItem('garment_access_token');
      const res = await fetch(`/api/v1/production/finishing/${batchId}/stage`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ stage, quantity: 50 })
      });

      const json = await res.json();
      if (json.success) {
        fetchData();
      } else {
        alert(json.error?.message || 'Failed to advance stage');
      }
    } catch (err) {
      console.error('Error advancing stage', err);
    }
  };

  const handlePackCarton = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('garment_access_token');
      const res = await fetch('/api/v1/production/packing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          cartonNumber,
          poNumber,
          buyerPo,
          styleNumber,
          color,
          sizeRatio: {
            S: Number(ratioS),
            M: Number(ratioM),
            L: Number(ratioL),
            XL: Number(ratioXL)
          },
          grossWeightKg: Number(grossWeightKg),
          netWeightKg: Number(netWeightKg),
          cartonDimensionsCm
        })
      });

      const json = await res.json();
      if (json.success) {
        setShowPackModal(false);
        fetchData();
      } else {
        alert(json.error?.message || 'Failed to pack carton');
      }
    } catch (err) {
      console.error('Error packing carton', err);
    }
  };

  const totalCartons = cartons.length;
  const totalPackedPcs = cartons.reduce((sum, c) => sum + c.totalPcsPerCarton, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 text-slate-400">
        <Box className="w-5 h-5 animate-spin mr-2 text-emerald-400" />
        <span>Loading Finishing & Packing registry...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <Box className="h-6 w-6 text-emerald-400" />
            Finishing & Export Carton Ratio Packing
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            4-Stage Finishing Pipeline (Trimming, Steam Iron, Metal Detection & Polybag) and Ratio Assortment Carton Auditing.
          </p>
        </div>

        <button
          onClick={() => setShowPackModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg shadow-lg shadow-emerald-600/20 transition cursor-pointer shrink-0"
        >
          <Plus className="h-4 w-4" />
          Pack Export Carton
        </button>
      </div>

      {/* Finishing Pipeline Tracker */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-indigo-400" />
            <h2 className="text-base font-bold text-white">4-Stage Garment Finishing Pipeline</h2>
          </div>
          <span className="text-xs text-slate-400">100% Needle Detector Scanned for Safety Compliance</span>
        </div>

        {loading ? (
          <div className="text-center py-8 text-slate-500 text-sm">Loading finishing pipeline...</div>
        ) : (
          <div className="space-y-4">
            {batches.map((batch) => {
              const total = batch.totalReceivedPcs;
              const trimPct = Math.round((batch.threadTrimmedPcs / total) * 100);
              const ironPct = Math.round((batch.steamIronedPcs / total) * 100);
              const metalPct = Math.round((batch.metalDetectedPcs / total) * 100);
              const polyPct = Math.round((batch.polybaggedPcs / total) * 100);

              return (
                <div key={batch.id} className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                    <div className="flex items-center gap-2.5">
                      <span className="text-base font-bold text-white font-mono">{batch.batchNumber}</span>
                      <span className="px-2 py-0.5 rounded text-[11px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">
                        {batch.styleNumber} | {batch.poNumber}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400">
                      Total Received: <strong className="text-white font-mono text-sm">{total.toLocaleString()} pcs</strong> | Defect Rejections: <strong className="text-rose-400 font-mono">{batch.rejectedPcs} pcs</strong>
                    </div>
                  </div>

                  {/* 4 Pipeline Stages */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {/* Stage 1: Thread Trimming */}
                    <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-800 space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-300 font-semibold">1. Thread Trimming</span>
                        <span className="font-mono text-emerald-400 font-bold">{trimPct}%</span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                        <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${trimPct}%` }} />
                      </div>
                      <div className="flex justify-between items-center text-[11px] text-slate-400">
                        <span>{batch.threadTrimmedPcs} / {total} pcs</span>
                        <button 
                          onClick={() => handleAdvanceStage(batch.id, 'threadTrimmedPcs')}
                          className="text-indigo-400 hover:text-indigo-300 cursor-pointer font-semibold"
                        >
                          +50 pcs
                        </button>
                      </div>
                    </div>

                    {/* Stage 2: Steam Iron Press */}
                    <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-800 space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-300 font-semibold">2. Steam Pressing</span>
                        <span className="font-mono text-emerald-400 font-bold">{ironPct}%</span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                        <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${ironPct}%` }} />
                      </div>
                      <div className="flex justify-between items-center text-[11px] text-slate-400">
                        <span>{batch.steamIronedPcs} / {total} pcs</span>
                        <button 
                          onClick={() => handleAdvanceStage(batch.id, 'steamIronedPcs')}
                          className="text-indigo-400 hover:text-indigo-300 cursor-pointer font-semibold"
                        >
                          +50 pcs
                        </button>
                      </div>
                    </div>

                    {/* Stage 3: Metal Detector Audit */}
                    <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-800 space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-300 font-semibold flex items-center gap-1">
                          <ShieldCheck className="h-3 w-3 text-emerald-400" />
                          3. Metal Detection
                        </span>
                        <span className="font-mono text-emerald-400 font-bold">{metalPct}%</span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                        <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${metalPct}%` }} />
                      </div>
                      <div className="flex justify-between items-center text-[11px] text-slate-400">
                        <span>{batch.metalDetectedPcs} / {total} pcs</span>
                        <button 
                          onClick={() => handleAdvanceStage(batch.id, 'metalDetectedPcs')}
                          className="text-emerald-400 hover:text-emerald-300 cursor-pointer font-semibold"
                        >
                          +50 pcs
                        </button>
                      </div>
                    </div>

                    {/* Stage 4: Polybagging */}
                    <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-800 space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-300 font-semibold">4. Polybag & Tag</span>
                        <span className="font-mono text-emerald-400 font-bold">{polyPct}%</span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                        <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${polyPct}%` }} />
                      </div>
                      <div className="flex justify-between items-center text-[11px] text-slate-400">
                        <span>{batch.polybaggedPcs} / {total} pcs</span>
                        <button 
                          onClick={() => handleAdvanceStage(batch.id, 'polybaggedPcs')}
                          className="text-emerald-400 hover:text-emerald-300 cursor-pointer font-semibold"
                        >
                          +50 pcs
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Export Carton Ratio Packing Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-xl space-y-3">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-emerald-400" />
            <h2 className="text-base font-bold text-white">Export Carton Ratio Packing Registry</h2>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            Packed: {totalCartons} Cartons ({totalPackedPcs} pcs)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800/60 text-slate-400 uppercase text-[10px] font-semibold tracking-wider">
              <tr>
                <th className="p-3">Carton No.</th>
                <th className="p-3">Style & Buyer PO</th>
                <th className="p-3">Size Ratio Breakdown</th>
                <th className="p-3 text-right">Total Pcs</th>
                <th className="p-3 text-right">Weight (Gross/Net)</th>
                <th className="p-3">Dimensions & CBM</th>
                <th className="p-3">Barcode</th>
                <th className="p-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {cartons.map((ctn) => (
                <tr key={ctn.id} className="hover:bg-slate-800/30 transition">
                  <td className="p-3">
                    <span className="font-mono font-bold text-white text-sm">{ctn.cartonNumber}</span>
                    <div className="text-[10px] text-slate-500">{new Date(ctn.packedAt).toLocaleDateString()}</div>
                  </td>
                  <td className="p-3">
                    <div className="font-semibold text-white">{ctn.styleNumber}</div>
                    <div className="text-[11px] text-slate-400 font-mono">{ctn.buyerPo} | {ctn.color}</div>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {Object.entries(ctn.sizeRatio).map(([sz, qty]) => (
                        <span key={sz} className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] font-mono border border-slate-700/60">
                          {sz}: <strong className="text-emerald-400">{qty}</strong>
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="p-3 text-right font-mono font-bold text-sm text-white">
                    {ctn.totalPcsPerCarton} pcs
                  </td>
                  <td className="p-3 text-right font-mono">
                    <div className="text-white font-bold">{ctn.grossWeightKg} KG</div>
                    <div className="text-slate-400 text-[10px]">{ctn.netWeightKg} KG Net</div>
                  </td>
                  <td className="p-3">
                    <div className="text-slate-300 font-mono">{ctn.cartonDimensionsCm} cm</div>
                    <div className="text-slate-500 text-[10px] font-mono">{ctn.cbm} CBM</div>
                  </td>
                  <td className="p-3 font-mono text-slate-400 text-[11px]">
                    {ctn.barcode}
                  </td>
                  <td className="p-3 text-center">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      READY FOR SHIPMENT
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Pack Export Carton */}
      {showPackModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative space-y-4">
            <button onClick={() => setShowPackModal(false)} className="absolute right-4 top-4 text-slate-400 hover:text-white">
              <X className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
              <Box className="h-6 w-6 text-emerald-400" />
              <div>
                <h2 className="text-lg font-bold text-white">Pack Export Carton (Ratio Assortment)</h2>
                <p className="text-xs text-slate-400">Record solid or ratio pack with weight scale audit</p>
              </div>
            </div>

            <form onSubmit={handlePackCarton} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-300">Carton Number</label>
                  <input
                    type="text"
                    required
                    value={cartonNumber}
                    onChange={(e) => setCartonNumber(e.target.value)}
                    className="mt-1 w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-300">Buyer PO Number</label>
                  <input
                    type="text"
                    required
                    value={buyerPo}
                    onChange={(e) => setBuyerPo(e.target.value)}
                    className="mt-1 w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-300">Internal PO</label>
                  <input
                    type="text"
                    required
                    value={poNumber}
                    onChange={(e) => setPoNumber(e.target.value)}
                    className="mt-1 w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-300">Style Number</label>
                  <input
                    type="text"
                    required
                    value={styleNumber}
                    onChange={(e) => setStyleNumber(e.target.value)}
                    className="mt-1 w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-300">Color</label>
                  <input
                    type="text"
                    required
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="mt-1 w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-800 space-y-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase">Ratio Pack by Size (Pcs)</span>
                <div className="grid grid-cols-4 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-400">Size S</label>
                    <input
                      type="number"
                      min="0"
                      value={ratioS}
                      onChange={(e) => setRatioS(Number(e.target.value))}
                      className="mt-0.5 w-full px-2 py-1.5 bg-slate-800 border border-slate-700 rounded text-xs text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400">Size M</label>
                    <input
                      type="number"
                      min="0"
                      value={ratioM}
                      onChange={(e) => setRatioM(Number(e.target.value))}
                      className="mt-0.5 w-full px-2 py-1.5 bg-slate-800 border border-slate-700 rounded text-xs text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400">Size L</label>
                    <input
                      type="number"
                      min="0"
                      value={ratioL}
                      onChange={(e) => setRatioL(Number(e.target.value))}
                      className="mt-0.5 w-full px-2 py-1.5 bg-slate-800 border border-slate-700 rounded text-xs text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400">Size XL</label>
                    <input
                      type="number"
                      min="0"
                      value={ratioXL}
                      onChange={(e) => setRatioXL(Number(e.target.value))}
                      className="mt-0.5 w-full px-2 py-1.5 bg-slate-800 border border-slate-700 rounded text-xs text-white font-mono"
                    />
                  </div>
                </div>
                <div className="text-right text-xs font-mono text-emerald-400 font-bold pt-1">
                  Total: {Number(ratioS) + Number(ratioM) + Number(ratioL) + Number(ratioXL)} pcs / carton
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-300">Gross Wt (KG)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={grossWeightKg}
                    onChange={(e) => setGrossWeightKg(Number(e.target.value))}
                    className="mt-1 w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-300">Net Wt (KG)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={netWeightKg}
                    onChange={(e) => setNetWeightKg(Number(e.target.value))}
                    className="mt-1 w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-300">Dimensions (cm)</label>
                  <input
                    type="text"
                    value={cartonDimensionsCm}
                    onChange={(e) => setCartonDimensionsCm(e.target.value)}
                    className="mt-1 w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowPackModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-lg shadow cursor-pointer"
                >
                  Confirm & Print Carton Barcode
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
