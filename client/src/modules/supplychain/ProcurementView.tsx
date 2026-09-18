import React, { useState, useEffect } from 'react';
import { 
  FileCheck, 
  ShoppingCart, 
  Plus, 
  CheckCircle2, 
  PackageCheck, 
  X
} from 'lucide-react';
import { PurchaseRequisition, SupplierPurchaseOrder, GoodsReceivedNote } from '../../types/supplyChain';

export const ProcurementView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'PR' | 'SPO' | 'GRN'>('PR');
  const [requisitions, setRequisitions] = useState<PurchaseRequisition[]>([]);
  const [spos, setSpos] = useState<SupplierPurchaseOrder[]>([]);
  const [grns, setGrns] = useState<GoodsReceivedNote[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showPrModal, setShowPrModal] = useState(false);
  const [showGrnModal, setShowGrnModal] = useState(false);

  // PR Form
  const [prNumber, setPrNumber] = useState(`PR-${Date.now().toString().slice(-4)}`);
  const [poNumber, setPoNumber] = useState('PO-2026-001');
  const [buyerName, setBuyerName] = useState('H&M Hennes & Mauritz GBC AB');
  const [department, setDepartment] = useState('Merchandising & Planning');
  const [urgency, setUrgency] = useState<'NORMAL' | 'HIGH' | 'CRITICAL'>('HIGH');
  const [itemSku, setItemSku] = useState('FAB-CTN-PIQUE-185');
  const [itemName, setItemName] = useState('100% Cotton Pique 185 GSM');
  const [itemQty, setItemQty] = useState(3925);
  const [itemPrice, setItemPrice] = useState(4.50);

  // GRN Form
  const [grnNumber, setGrnNumber] = useState(`GRN-${Date.now().toString().slice(-4)}`);
  const [selectedSpo, setSelectedSpo] = useState('');
  const [supplierName, setSupplierName] = useState('Paramount Textile Mills Ltd.');
  const [vehicleNumber, setVehicleNumber] = useState('DHAKA-METRO-TA-14-9921');
  const [challanNumber, setChallanNumber] = useState('CH-8821');
  const [driverName, setDriverName] = useState('Abdul Malek');
  const [lotNumber, setLotNumber] = useState('LOT-PTM-2026-A');
  const [shadeBand, setShadeBand] = useState('Shade Band A (Delta-E < 0.5)');
  const [binCode, setBinCode] = useState('R-A1-01');

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('garment_access_token');
      const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

      const [prRes, spoRes, grnRes] = await Promise.all([
        fetch('/api/v1/requisitions', { headers }).then(r => r.json()),
        fetch('/api/v1/procurement/orders', { headers }).then(r => r.json()),
        fetch('/api/v1/grn', { headers }).then(r => r.json())
      ]);

      if (prRes.success) setRequisitions(prRes.data);
      if (spoRes.success) setSpos(spoRes.data);
      if (grnRes.success) setGrns(grnRes.data);
    } catch (err) {
      console.error('Failed to load procurement data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApprovePR = async (id: string) => {
    try {
      const token = localStorage.getItem('garment_access_token');
      const res = await fetch(`/api/v1/requisitions/${id}/approve`, {
        method: 'PUT',
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      const json = await res.json();
      if (json.success) {
        fetchData();
      } else {
        alert(json.error?.message || 'Approval failed');
      }
    } catch (err) {
      console.error('Approval failed', err);
    }
  };

  const handleCreatePR = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('garment_access_token');
      const res = await fetch('/api/v1/requisitions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          prNumber,
          poNumber,
          buyerName,
          department,
          urgency,
          items: [
            {
              sku: itemSku,
              itemName,
              unit: 'KG',
              requiredQty: Number(itemQty),
              estimatedUnitPriceUsd: Number(itemPrice),
              estimatedTotalUsd: Number(itemQty) * Number(itemPrice),
              neededByDate: new Date(Date.now() + 10 * 86400000).toISOString().split('T')[0]
            }
          ]
        })
      });

      const json = await res.json();
      if (json.success) {
        setShowPrModal(false);
        fetchData();
      } else {
        alert(json.error?.message || 'Failed to create PR');
      }
    } catch (err) {
      console.error('Error creating PR', err);
    }
  };

  const handleCreateGRN = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('garment_access_token');
      const res = await fetch('/api/v1/grn', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          grnNumber,
          spoNumber: selectedSpo || (spos[0]?.spoNumber || 'SPO-2026-001'),
          supplierName,
          warehouseId: 'wh-savar-fabric',
          warehouseName: 'Central Bonded Fabric Warehouse',
          vehicleNumber,
          challanNumber,
          driverName,
          qcInspectionStatus: 'PASSED',
          items: [
            {
              sku: 'FAB-CTN-PIQUE-185',
              itemName: '100% Cotton Pique 185 GSM',
              orderedQty: 3925,
              receivedQty: 3925,
              acceptedQty: 3925,
              rejectedQty: 0,
              unit: 'KG',
              lotNumber,
              shadeBand,
              binCode
            }
          ]
        })
      });

      const json = await res.json();
      if (json.success) {
        setShowGrnModal(false);
        fetchData();
      } else {
        alert(json.error?.message || 'Failed to record GRN');
      }
    } catch (err) {
      console.error('Error recording GRN', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <ShoppingCart className="h-6 w-6 text-emerald-400" />
            Procurement & Inbound Supply Pipeline
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Shortage-triggered Purchase Requisitions, Supplier Purchase Orders (SPO), and Gate Entry Goods Received Notes (GRN).
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-slate-900/80 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('PR')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-2 ${
              activeTab === 'PR' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileCheck className="h-4 w-4" />
            Requisitions (PR)
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-emerald-700/50">{requisitions.length}</span>
          </button>
          <button
            onClick={() => setActiveTab('SPO')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-2 ${
              activeTab === 'SPO' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShoppingCart className="h-4 w-4" />
            Supplier PO (SPO)
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-slate-800">{spos.length}</span>
          </button>
          <button
            onClick={() => setActiveTab('GRN')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-2 ${
              activeTab === 'GRN' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <PackageCheck className="h-4 w-4" />
            Gate Entry & GRN
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-slate-800">{grns.length}</span>
          </button>
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading ? (
        <div className="text-center py-16 text-slate-500 text-sm">
          Loading procurement pipeline records...
        </div>
      ) : (
        <>
          {/* TAB 1: PURCHASE REQUISITIONS */}
          {activeTab === 'PR' && (
            <div className="space-y-4">
          <div className="flex justify-between items-center bg-slate-900/40 p-3 rounded-xl border border-slate-800">
            <span className="text-xs text-slate-400 font-medium">
              Triggered automatically by PO BOM shortage calculations or raised by Merchandising & Sourcing.
            </span>
            <button
              onClick={() => setShowPrModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg shadow cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              Draft Requisition
            </button>
          </div>

          <div className="space-y-4">
            {requisitions.map((pr) => (
              <div key={pr.id} className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                      <span className="text-base font-bold text-white font-mono">{pr.prNumber}</span>
                      <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                        pr.urgency === 'CRITICAL' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                        pr.urgency === 'HIGH' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                        'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                      }`}>
                        {pr.urgency} URGENCY
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                        pr.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                        'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                      }`}>
                        {pr.status}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 flex items-center gap-3">
                      <span>Buyer: <strong className="text-slate-300">{pr.buyerName || 'General Export'}</strong></span>
                      {pr.poNumber && <span>Linked PO: <strong className="text-emerald-400 font-mono">{pr.poNumber}</strong></span>}
                      <span>Requested by: <strong className="text-slate-300">{pr.requestedBy}</strong></span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">Total Estimated Value</div>
                      <div className="text-base font-bold text-emerald-400 font-mono">
                        ${pr.totalEstimatedValueUsd.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                    {pr.status === 'PENDING_APPROVAL' && (
                      <button
                        onClick={() => handleApprovePR(pr.id)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg shadow cursor-pointer"
                      >
                        Approve Requisition
                      </button>
                    )}
                  </div>
                </div>

                {/* Items Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-800/40 text-slate-400 font-semibold uppercase text-[10px]">
                      <tr>
                        <th className="p-2.5">SKU</th>
                        <th className="p-2.5">Item Description</th>
                        <th className="p-2.5 text-right">Required Qty</th>
                        <th className="p-2.5 text-right">Est. Unit Price</th>
                        <th className="p-2.5 text-right">Est. Total USD</th>
                        <th className="p-2.5 text-center">Needed By</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-slate-300">
                      {pr.items.map((it, idx) => (
                        <tr key={idx} className="hover:bg-slate-800/20">
                          <td className="p-2.5 font-mono text-emerald-400 font-medium">{it.sku}</td>
                          <td className="p-2.5 font-medium text-white">{it.itemName}</td>
                          <td className="p-2.5 text-right font-mono font-bold text-white">{it.requiredQty.toLocaleString()} {it.unit}</td>
                          <td className="p-2.5 text-right font-mono">${it.estimatedUnitPriceUsd.toFixed(2)}</td>
                          <td className="p-2.5 text-right font-mono text-emerald-400 font-bold">${it.estimatedTotalUsd.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                          <td className="p-2.5 text-center text-slate-400">{it.neededByDate}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {pr.approvedBy && (
                  <div className="text-[11px] text-slate-400 flex items-center gap-1.5 pt-2 border-t border-slate-800/40">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                    Authorized by <strong className="text-slate-300">{pr.approvedBy}</strong> on {new Date(pr.approvalDate || '').toLocaleDateString()}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: SUPPLIER PURCHASE ORDERS */}
      {activeTab === 'SPO' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {spos.map((spo) => (
              <div key={spo.id} className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-base font-bold text-white font-mono">{spo.spoNumber}</span>
                      <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                        spo.status === 'DELIVERED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                        'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                      }`}>
                        {spo.status}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 mt-1">
                      Vendor: <strong className="text-slate-200">{spo.supplierName}</strong>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">Total Order Amount</div>
                    <div className="text-base font-bold text-emerald-400 font-mono">
                      ${spo.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })} {spo.currency}
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-800/40 border border-slate-800 text-xs space-y-2">
                  <div className="flex justify-between text-slate-400">
                    <span>PR Reference: <strong className="text-slate-200 font-mono">{spo.prNumber}</strong></span>
                    <span>Terms: <strong className="text-slate-200">{spo.paymentTerms}</strong></span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Order Date: <strong className="text-slate-300">{spo.orderDate}</strong></span>
                    <span>Expected Delivery: <strong className="text-emerald-400">{spo.expectedDeliveryDate}</strong></span>
                  </div>
                </div>

                {/* Items */}
                <div className="space-y-2">
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Ordered Materials:</div>
                  {spo.items.map((it, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs p-2 rounded bg-slate-800/20 border border-slate-800/60">
                      <div>
                        <div className="text-white font-medium">{it.itemName}</div>
                        <div className="text-emerald-400 font-mono text-[11px]">{it.sku}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono font-bold text-white">{it.orderedQty.toLocaleString()} {it.unit}</div>
                        <div className="text-slate-400 text-[11px]">${it.unitPrice.toFixed(2)} / {it.unit}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: GOODS RECEIVED NOTES (GRN) */}
      {activeTab === 'GRN' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-slate-900/40 p-3 rounded-xl border border-slate-800">
            <span className="text-xs text-slate-400 font-medium">
              Inbound security gate pass, challan verification, shade lot audit, and warehouse bin allocation.
            </span>
            <button
              onClick={() => setShowGrnModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg shadow cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              Record Inbound GRN
            </button>
          </div>

          <div className="space-y-4">
            {grns.map((grn) => (
              <div key={grn.id} className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                      <span className="text-base font-bold text-white font-mono">{grn.grnNumber}</span>
                      <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        QC {grn.qcInspectionStatus}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[11px] font-mono text-slate-400 bg-slate-800">
                        Challan: {grn.challanNumber}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 flex items-center gap-3">
                      <span>Supplier: <strong className="text-slate-200">{grn.supplierName}</strong></span>
                      <span>SPO: <strong className="text-emerald-400 font-mono">{grn.spoNumber}</strong></span>
                      <span>Warehouse: <strong className="text-slate-200">{grn.warehouseName}</strong></span>
                    </div>
                  </div>

                  <div className="text-right text-xs text-slate-400 space-y-0.5">
                    <div>Vehicle: <strong className="text-slate-200 font-mono">{grn.vehicleNumber}</strong></div>
                    <div>Driver: <strong className="text-slate-300">{grn.driverName}</strong></div>
                    <div>Received by: <strong className="text-emerald-400">{grn.receivedBy}</strong></div>
                  </div>
                </div>

                {/* Items & Quality Details */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-800/40 text-slate-400 font-semibold uppercase text-[10px]">
                      <tr>
                        <th className="p-2.5">SKU & Description</th>
                        <th className="p-2.5">Lot & Shade Band</th>
                        <th className="p-2.5">Bin Code</th>
                        <th className="p-2.5 text-right">Received Qty</th>
                        <th className="p-2.5 text-right">Accepted Qty</th>
                        <th className="p-2.5 text-right">Rejected</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-slate-300">
                      {grn.items.map((it, idx) => (
                        <tr key={idx} className="hover:bg-slate-800/20">
                          <td className="p-2.5">
                            <div className="font-medium text-white">{it.itemName}</div>
                            <div className="text-emerald-400 font-mono text-[11px]">{it.sku}</div>
                          </td>
                          <td className="p-2.5">
                            <div className="font-mono text-slate-200 font-bold">{it.lotNumber}</div>
                            <div className="text-slate-400 text-[11px]">{it.shadeBand || 'Standard'}</div>
                          </td>
                          <td className="p-2.5">
                            <span className="px-2 py-0.5 rounded bg-slate-800 font-mono text-amber-400 font-bold text-[11px] border border-slate-700/60">
                              {it.binCode}
                            </span>
                          </td>
                          <td className="p-2.5 text-right font-mono font-bold text-white">
                            {it.receivedQty.toLocaleString()} {it.unit}
                          </td>
                          <td className="p-2.5 text-right font-mono font-bold text-emerald-400">
                            {it.acceptedQty.toLocaleString()} {it.unit}
                          </td>
                          <td className="p-2.5 text-right font-mono font-bold text-rose-400">
                            {it.rejectedQty.toLocaleString()} {it.unit}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
        </>
      )}

      {/* Modal: Draft Purchase Requisition */}
      {showPrModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative space-y-4">
            <button onClick={() => setShowPrModal(false)} className="absolute right-4 top-4 text-slate-400 hover:text-white">
              <X className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
              <FileCheck className="h-6 w-6 text-emerald-400" />
              <div>
                <h2 className="text-lg font-bold text-white">Draft Purchase Requisition (PR)</h2>
                <p className="text-xs text-slate-400">Create raw material requisition for buyer order production shortage</p>
              </div>
            </div>

            <form onSubmit={handleCreatePR} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-300">PR Number</label>
                  <input
                    type="text"
                    required
                    value={prNumber}
                    onChange={(e) => setPrNumber(e.target.value)}
                    className="mt-1 w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-300">Linked Buyer PO</label>
                  <input
                    type="text"
                    value={poNumber}
                    onChange={(e) => setPoNumber(e.target.value)}
                    className="mt-1 w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-300">Buyer Name</label>
                  <input
                    type="text"
                    value={buyerName}
                    onChange={(e) => setBuyerName(e.target.value)}
                    className="mt-1 w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-300">Department</label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="mt-1 w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-300">Urgency Level</label>
                  <select
                    value={urgency}
                    onChange={(e) => setUrgency(e.target.value as any)}
                    className="mt-1 w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="NORMAL">Normal Urgency</option>
                    <option value="HIGH">High Urgency</option>
                    <option value="CRITICAL">Critical (Line Stoppage Risk)</option>
                  </select>
                </div>
              </div>

              <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-800 space-y-3">
                <span className="text-[11px] font-bold text-slate-400 uppercase">Material Line Item</span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-slate-300">SKU Code</label>
                    <input
                      type="text"
                      required
                      value={itemSku}
                      onChange={(e) => setItemSku(e.target.value)}
                      className="mt-1 w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white font-mono focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-300">Description</label>
                    <input
                      type="text"
                      required
                      value={itemName}
                      onChange={(e) => setItemName(e.target.value)}
                      className="mt-1 w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-slate-300">Required Quantity (KG / PCS)</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={itemQty}
                      onChange={(e) => setItemQty(Number(e.target.value))}
                      className="mt-1 w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-300">Est. Unit Price ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={itemPrice}
                      onChange={(e) => setItemPrice(Number(e.target.value))}
                      className="mt-1 w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowPrModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-lg shadow cursor-pointer"
                >
                  Submit Requisition
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Record Inbound GRN */}
      {showGrnModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative space-y-4">
            <button onClick={() => setShowGrnModal(false)} className="absolute right-4 top-4 text-slate-400 hover:text-white">
              <X className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
              <PackageCheck className="h-6 w-6 text-emerald-400" />
              <div>
                <h2 className="text-lg font-bold text-white">Record Goods Received Note (GRN)</h2>
                <p className="text-xs text-slate-400">Security gate entry, vehicle challan, and automatic warehouse stock allocation</p>
              </div>
            </div>

            <form onSubmit={handleCreateGRN} className="space-y-3.5">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-300">GRN Number</label>
                  <input
                    type="text"
                    required
                    value={grnNumber}
                    onChange={(e) => setGrnNumber(e.target.value)}
                    className="mt-1 w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-300">Target SPO Reference</label>
                  <select
                    value={selectedSpo}
                    onChange={(e) => {
                      setSelectedSpo(e.target.value);
                      const matched = spos.find(s => s.spoNumber === e.target.value);
                      if (matched) setSupplierName(matched.supplierName);
                    }}
                    className="mt-1 w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white font-mono focus:outline-none focus:border-emerald-500"
                  >
                    <option value="">Select SPO...</option>
                    {spos.map(s => (
                      <option key={s.id} value={s.spoNumber}>{s.spoNumber} ({s.supplierName})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-300">Supplier Name</label>
                  <input
                    type="text"
                    required
                    value={supplierName}
                    onChange={(e) => setSupplierName(e.target.value)}
                    className="mt-1 w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-300">Vehicle Number</label>
                  <input
                    type="text"
                    required
                    value={vehicleNumber}
                    onChange={(e) => setVehicleNumber(e.target.value)}
                    className="mt-1 w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-300">Challan No.</label>
                  <input
                    type="text"
                    required
                    value={challanNumber}
                    onChange={(e) => setChallanNumber(e.target.value)}
                    className="mt-1 w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-300">Driver Name</label>
                  <input
                    type="text"
                    value={driverName}
                    onChange={(e) => setDriverName(e.target.value)}
                    className="mt-1 w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-300">Fabric Lot No.</label>
                  <input
                    type="text"
                    required
                    value={lotNumber}
                    onChange={(e) => setLotNumber(e.target.value)}
                    className="mt-1 w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-300">Shade Band</label>
                  <input
                    type="text"
                    value={shadeBand}
                    onChange={(e) => setShadeBand(e.target.value)}
                    className="mt-1 w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-300">Target Bin Code</label>
                  <input
                    type="text"
                    required
                    value={binCode}
                    onChange={(e) => setBinCode(e.target.value)}
                    className="mt-1 w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowGrnModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-lg shadow cursor-pointer"
                >
                  Confirm Gate Entry & Add to Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
