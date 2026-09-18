import React, { useState, useEffect } from 'react';
import { 
  Scissors, 
  Clock, 
  Plus, 
  QrCode, 
  Layers, 
  X
} from 'lucide-react';
import { FabricRelaxationRecord, CutOrder, CutBundle } from '../../types/production';

export const CuttingView: React.FC = () => {
  const [relaxations, setRelaxations] = useState<FabricRelaxationRecord[]>([]);
  const [cutOrders, setCutOrders] = useState<CutOrder[]>([]);
  const [bundles, setBundles] = useState<CutBundle[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showRlxModal, setShowRlxModal] = useState(false);
  const [showCutModal, setShowCutModal] = useState(false);

  // Relaxation Form
  const [rollNumber, setRollNumber] = useState(`ROL-PTM-${Date.now().toString().slice(-4)}`);
  const [fabricLot, setFabricLot] = useState('LOT-PTM-2026-A');
  const [fabricType, setFabricType] = useState('100% Cotton Pique 185 GSM');
  const [color, setColor] = useState('Navy Blue');
  const [weightGsm, setWeightGsm] = useState(185);
  const [rollLengthMeters, setRollLengthMeters] = useState(130);
  const [warehouseBin, setWarehouseBin] = useState('R-A1-02');
  const [durationHours, setDurationHours] = useState(24);

  // Cut Order Form
  const [cutNumber, setCutNumber] = useState(`CUT-${Date.now().toString().slice(-4)}`);
  const [poNumber, setPoNumber] = useState('PO-2026-001');
  const [styleNumber, setStyleNumber] = useState('TSH-2026-001');
  const [styleName, setStyleName] = useState('Men’s Regular Pique Polo Shirt');
  const [markerLength, setMarkerLength] = useState(7.8);
  const [pliesCount, setPliesCount] = useState(80);
  const [markerEfficiency, setMarkerEfficiency] = useState(89.5);
  const [bundleSize, setBundleSize] = useState(250);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('garment_access_token');
      const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

      const [rlxRes, cutRes, bndRes] = await Promise.all([
        fetch('/api/v1/production/relaxation', { headers }).then(r => r.json()),
        fetch('/api/v1/production/cut-orders', { headers }).then(r => r.json()),
        fetch('/api/v1/production/bundles', { headers }).then(r => r.json())
      ]);

      if (rlxRes.success) setRelaxations(rlxRes.data);
      if (cutRes.success) setCutOrders(cutRes.data);
      if (bndRes.success) setBundles(bndRes.data);
    } catch (err) {
      console.error('Failed to load cutting data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleStartRelaxation = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('garment_access_token');
      const res = await fetch('/api/v1/production/relaxation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          rollNumber,
          fabricLot,
          fabricType,
          color,
          weightGsm: Number(weightGsm),
          rollLengthMeters: Number(rollLengthMeters),
          warehouseBin,
          durationHours: Number(durationHours)
        })
      });

      const json = await res.json();
      if (json.success) {
        setShowRlxModal(false);
        fetchData();
      } else {
        alert(json.error?.message || 'Failed to start relaxation');
      }
    } catch (err) {
      console.error('Error starting relaxation', err);
    }
  };

  const handleCompleteRelaxation = async (id: string) => {
    try {
      const token = localStorage.getItem('garment_access_token');
      const res = await fetch(`/api/v1/production/relaxation/${id}/complete`, {
        method: 'PUT',
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      const json = await res.json();
      if (json.success) {
        fetchData();
      } else {
        alert(json.error?.message || 'Failed to complete relaxation');
      }
    } catch (err) {
      console.error('Error completing relaxation', err);
    }
  };

  const handleCreateCutOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('garment_access_token');
      const res = await fetch('/api/v1/production/cut-orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          cutNumber,
          poNumber,
          styleNumber,
          styleName,
          markerLengthMeters: Number(markerLength),
          pliesCount: Number(pliesCount),
          markerEfficiencyPercent: Number(markerEfficiency),
          colorSizeBreakdown: [
            { color: 'White', size: 'S', plannedPcs: 500 },
            { color: 'White', size: 'M', plannedPcs: 1000 },
            { color: 'White', size: 'L', plannedPcs: 1000 }
          ]
        })
      });

      const json = await res.json();
      if (json.success) {
        setShowCutModal(false);
        fetchData();
      } else {
        alert(json.error?.message || 'Failed to create cut order');
      }
    } catch (err) {
      console.error('Error creating cut order', err);
    }
  };

  const handleGenerateBundles = async (cutOrderId: string) => {
    try {
      const token = localStorage.getItem('garment_access_token');
      const res = await fetch(`/api/v1/production/cut-orders/${cutOrderId}/bundles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ bundleSize })
      });

      const json = await res.json();
      if (json.success) {
        alert(`Generated ${json.count} bundle tickets with barcodes!`);
        fetchData();
      } else {
        alert(json.error?.message || 'Failed to generate bundles');
      }
    } catch (err) {
      console.error('Error generating bundles', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <Scissors className="h-6 w-6 text-emerald-400" />
            Cutting Department & Spreading Floor
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            24-Hour Fabric Relaxation Countdown, Automatic Lay Plies, Cut Order Marker Efficiency & QR Bundle Ticketing.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setShowRlxModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow cursor-pointer transition"
          >
            <Clock className="h-4 w-4" />
            Start 24h Relaxation
          </button>
          <button
            onClick={() => setShowCutModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg shadow cursor-pointer transition"
          >
            <Plus className="h-4 w-4" />
            Create Cut Order
          </button>
        </div>
      </div>

      {/* 1. Fabric Relaxation 24h Countdown Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-indigo-400" />
            <h2 className="text-base font-bold text-white">Fabric Roll Relaxation Status (24-Hour Mandatory Tension Release)</h2>
          </div>
          <span className="text-xs text-slate-400">Strictly enforced before laying to eliminate shrink deformation</span>
        </div>

        {loading ? (
          <div className="text-center py-8 text-slate-500 text-sm">Loading relaxation records...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {relaxations.map((r) => {
              const isReady = r.status === 'READY_FOR_CUT';
              const targetDate = new Date(r.targetReadyTime);
              const now = new Date();
              const hoursLeft = Math.max(0, Math.round((targetDate.getTime() - now.getTime()) / (1000 * 3600)));

              return (
                <div 
                  key={r.id} 
                  className={`p-4 rounded-xl border flex flex-col justify-between space-y-3 transition ${
                    isReady 
                      ? 'bg-emerald-950/20 border-emerald-500/40 ring-1 ring-emerald-500/20' 
                      : 'bg-slate-900/60 border-slate-800'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-sm font-bold text-white font-mono">{r.rollNumber}</div>
                        <div className="text-xs text-slate-400 mt-0.5">{r.fabricType} ({r.color})</div>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase ${
                        isReady 
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' 
                          : 'bg-amber-500/20 text-amber-400 border border-amber-500/40 animate-pulse'
                      }`}>
                        {r.status === 'READY_FOR_CUT' ? 'READY FOR CUT' : `RELAXING (${hoursLeft}h left)`}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 p-2 bg-slate-800/40 rounded-lg text-[11px] text-slate-300">
                      <div>Lot: <strong className="text-slate-100 font-mono">{r.fabricLot}</strong></div>
                      <div>Rack Bin: <strong className="text-amber-400 font-mono">{r.warehouseBin}</strong></div>
                      <div>Roll Length: <strong className="text-slate-100">{r.rollLengthMeters} Meters</strong></div>
                      <div>Weight: <strong className="text-slate-100">{r.weightGsm} GSM</strong></div>
                    </div>

                    <p className="text-[11px] text-slate-400 italic">
                      "{r.notes || 'Spreading on tension-free relaxation table.'}"
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-xs">
                    <span className="text-slate-500 text-[10px]">
                      By: {r.inspectedBy}
                    </span>
                    {!isReady && (
                      <button
                        onClick={() => handleCompleteRelaxation(r.id)}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-semibold rounded cursor-pointer transition"
                      >
                        Force Complete
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 2. Cut Orders Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-xl space-y-3">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-emerald-400" />
            <h2 className="text-base font-bold text-white">Cut Orders & Spreading Lay Efficiency</h2>
          </div>
          <span className="text-xs text-slate-400">Integrated with CAD Nesting & Gerber Automatic Spreaders</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800/60 text-slate-400 uppercase text-[10px] font-semibold tracking-wider">
              <tr>
                <th className="p-3">Cut Order No.</th>
                <th className="p-3">Style & Linked PO</th>
                <th className="p-3">Cutting Table</th>
                <th className="p-3 text-center">Plies Count</th>
                <th className="p-3 text-center">Marker Eff. %</th>
                <th className="p-3 text-right">Planned Cut Pcs</th>
                <th className="p-3 text-center">Bundles</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {cutOrders.map((cut) => (
                <tr key={cut.id} className="hover:bg-slate-800/30 transition">
                  <td className="p-3">
                    <span className="font-mono font-bold text-emerald-400 text-sm">{cut.cutNumber}</span>
                    <div className="text-[10px] text-slate-500">{new Date(cut.createdAt).toLocaleDateString()}</div>
                  </td>
                  <td className="p-3">
                    <div className="font-semibold text-white">{cut.styleName}</div>
                    <div className="text-[11px] text-slate-400 font-mono">{cut.styleNumber} | {cut.poNumber}</div>
                  </td>
                  <td className="p-3">
                    <span className="text-slate-200">{cut.cuttingTableName}</span>
                    <div className="text-[10px] text-slate-400 font-mono">Lay Length: {cut.markerLengthMeters}m</div>
                  </td>
                  <td className="p-3 text-center font-mono font-bold text-white">
                    {cut.pliesCount} Plies
                  </td>
                  <td className="p-3 text-center">
                    <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      {cut.markerEfficiencyPercent}%
                    </span>
                  </td>
                  <td className="p-3 text-right font-mono font-bold text-sm text-white">
                    {cut.totalPlannedPcs.toLocaleString()} pcs
                  </td>
                  <td className="p-3 text-center">
                    <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-800 text-slate-300">
                      {cut.bundles?.length || 0} Tickets
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => handleGenerateBundles(cut.id)}
                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-[11px] rounded transition shadow cursor-pointer flex items-center gap-1 mx-auto"
                    >
                      <QrCode className="h-3 w-3" />
                      Generate Bundles
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. QR / Barcode Bundle Tickets Explorer */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <QrCode className="h-5 w-5 text-emerald-400" />
            <h2 className="text-base font-bold text-white">QR / Barcode Bundle Ticketing Registry</h2>
          </div>
          <div className="flex items-center gap-3">
            <label className="text-xs text-slate-400 flex items-center gap-1.5 font-medium">
              <span>Bundle Size:</span>
              <input
                type="number"
                min="10"
                max="500"
                value={bundleSize}
                onChange={(e) => setBundleSize(Number(e.target.value))}
                className="w-16 px-2 py-0.5 bg-slate-800 border border-slate-700 rounded text-xs text-white font-mono"
              />
              <span className="text-[11px] text-slate-500">pcs</span>
            </label>
            <span className="text-xs text-slate-400">Total Bundles: {bundles.length}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-96 overflow-y-auto pr-1">
          {bundles.map((b) => (
            <div 
              key={b.id} 
              className="p-3 rounded-xl border border-slate-800 bg-slate-950/60 space-y-2 hover:border-slate-700 transition"
            >
              <div className="flex justify-between items-start">
                <span className="text-xs font-mono font-bold text-emerald-400">{b.bundleNumber}</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 uppercase">
                  Size: {b.size}
                </span>
              </div>

              <div className="text-[11px] text-slate-400 space-y-0.5">
                <div>Cut: <strong className="text-slate-200">{b.cutNumber}</strong></div>
                <div>Quantity: <strong className="text-white font-mono">{b.quantity} pcs</strong></div>
                <div>Serial Range: <strong className="text-amber-400 font-mono">#{b.serialStart} - #{b.serialEnd}</strong></div>
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                <span className="px-1.5 py-0.5 rounded bg-slate-900 font-mono text-[9px] text-slate-500">
                  {b.barcode}
                </span>
                <span className="text-[10px] text-indigo-400 font-semibold">
                  {b.assignedLineName?.split(' ')[0]} {b.assignedLineName?.split(' ')[1]}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal: Start Fabric Relaxation */}
      {showRlxModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative space-y-4">
            <button onClick={() => setShowRlxModal(false)} className="absolute right-4 top-4 text-slate-400 hover:text-white">
              <X className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
              <Clock className="h-6 w-6 text-indigo-400" />
              <div>
                <h2 className="text-lg font-bold text-white">Start 24-Hour Fabric Relaxation</h2>
                <p className="text-xs text-slate-400">Initiate countdown cycle on relaxation spreading racks</p>
              </div>
            </div>

            <form onSubmit={handleStartRelaxation} className="space-y-3.5">
              <div>
                <label className="text-xs font-medium text-slate-300">Fabric Roll Barcode / Number</label>
                <input
                  type="text"
                  required
                  value={rollNumber}
                  onChange={(e) => setRollNumber(e.target.value)}
                  className="mt-1 w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300">Fabric Construction & Type</label>
                <input
                  type="text"
                  required
                  value={fabricType}
                  onChange={(e) => setFabricType(e.target.value)}
                  className="mt-1 w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-300">Fabric Lot Number</label>
                  <input
                    type="text"
                    required
                    value={fabricLot}
                    onChange={(e) => setFabricLot(e.target.value)}
                    className="mt-1 w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-300">Color</label>
                  <input
                    type="text"
                    required
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="mt-1 w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-300">Length (Meters)</label>
                  <input
                    type="number"
                    min="1"
                    value={rollLengthMeters}
                    onChange={(e) => setRollLengthMeters(Number(e.target.value))}
                    className="mt-1 w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-300">Weight (GSM)</label>
                  <input
                    type="number"
                    min="50"
                    value={weightGsm}
                    onChange={(e) => setWeightGsm(Number(e.target.value))}
                    className="mt-1 w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-300">Duration (Hrs)</label>
                  <input
                    type="number"
                    min="1"
                    value={durationHours}
                    onChange={(e) => setDurationHours(Number(e.target.value))}
                    className="mt-1 w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300">Warehouse Bin Coordinate</label>
                <input
                  type="text"
                  required
                  value={warehouseBin}
                  onChange={(e) => setWarehouseBin(e.target.value)}
                  className="mt-1 w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowRlxModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-lg shadow cursor-pointer"
                >
                  Start 24h Countdown
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Create Cut Order */}
      {showCutModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative space-y-4">
            <button onClick={() => setShowCutModal(false)} className="absolute right-4 top-4 text-slate-400 hover:text-white">
              <X className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
              <Scissors className="h-6 w-6 text-emerald-400" />
              <div>
                <h2 className="text-lg font-bold text-white">Create Production Cut Order</h2>
                <p className="text-xs text-slate-400">Generate lay spreading plan with marker efficiency</p>
              </div>
            </div>

            <form onSubmit={handleCreateCutOrder} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-300">Cut Order Number</label>
                  <input
                    type="text"
                    required
                    value={cutNumber}
                    onChange={(e) => setCutNumber(e.target.value)}
                    className="mt-1 w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-300">Linked Buyer PO</label>
                  <input
                    type="text"
                    required
                    value={poNumber}
                    onChange={(e) => setPoNumber(e.target.value)}
                    className="mt-1 w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
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
                  <label className="text-xs font-medium text-slate-300">Style Description</label>
                  <input
                    type="text"
                    value={styleName}
                    onChange={(e) => setStyleName(e.target.value)}
                    className="mt-1 w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-300">Marker Length (m)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={markerLength}
                    onChange={(e) => setMarkerLength(Number(e.target.value))}
                    className="mt-1 w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-300">Plies Count</label>
                  <input
                    type="number"
                    min="1"
                    value={pliesCount}
                    onChange={(e) => setPliesCount(Number(e.target.value))}
                    className="mt-1 w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-300">Marker Eff. (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={markerEfficiency}
                    onChange={(e) => setMarkerEfficiency(Number(e.target.value))}
                    className="mt-1 w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCutModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-lg shadow cursor-pointer"
                >
                  Confirm Cut Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
