import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Layers, 
  AlertTriangle, 
  CheckCircle2, 
  Package
} from 'lucide-react';
import { BuyerPurchaseOrder, POStatus } from '../../types/merchandising';

export const PurchaseOrderView: React.FC = () => {
  const [orders, setOrders] = useState<BuyerPurchaseOrder[]>([]);
  const [selectedPoId, setSelectedPoId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('garment_access_token');
      const res = await fetch('/api/v1/orders/po', {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      const json = await res.json();
      if (json.success && json.data) {
        setOrders(json.data);
        if (json.data.length > 0) {
          setSelectedPoId(json.data[0].id);
        }
      }
    } catch (e) {
      console.error('Failed to load orders', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (poId: string, newStatus: POStatus) => {
    try {
      const token = localStorage.getItem('garment_access_token');
      const res = await fetch(`/api/v1/orders/po/${poId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ status: newStatus })
      });
      const json = await res.json();
      if (json.success) {
        fetchOrders();
      } else {
        alert(json.error?.message || 'Failed to update PO status');
      }
    } catch (err: any) {
      alert(err.message || 'Status update error');
    }
  };

  const currentPO = orders.find(po => po.id === selectedPoId) || orders[0];

  const getStatusBadge = (status: POStatus) => {
    switch (status) {
      case 'IN_PRODUCTION': return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'APPROVED': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'SHIPPED':
      case 'COMPLETED': return 'bg-sky-500/10 text-sky-400 border-sky-500/30';
      case 'CANCELLED': return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      default: return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  const filteredOrders = orders.filter(po =>
    po.poNumber.toLowerCase().includes(search.toLowerCase()) ||
    po.buyerName.toLowerCase().includes(search.toLowerCase()) ||
    po.styleNumber.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-violet-500/10 text-violet-400 border border-violet-500/30">
              MODULE 06 & 08
            </span>
            <span className="text-xs text-slate-400 font-mono">Central Order Backbone & BOM / MRP</span>
          </div>
          <h1 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
            Buyer Purchase Orders & MRP Shortage Engine
          </h1>
          <p className="text-xs text-slate-400">
            Order matrix tracking with automatic Bill of Materials explosion, stock availability checks, and procurement shortage alerts.
          </p>
        </div>

        <div className="relative w-48 sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search POs, styles, buyers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>
      </div>

      {loading ? (
        <div className="p-8 flex items-center justify-center min-h-[300px]">
          <div className="flex items-center gap-2 text-brand-400 text-xs font-mono">
            <div className="w-4 h-4 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
            <span>Loading Purchase Orders & MRP Calculations...</span>
          </div>
        </div>
      ) : !currentPO ? (
        <div className="p-8 text-slate-400">No active Purchase Orders found.</div>
      ) : (
        <div className="grid lg:grid-cols-12 gap-6">
          {/* Left Column: PO List (4 cols) */}
          <div className="lg:col-span-4 space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400 font-medium px-1">
              <span>Active Orders ({filteredOrders.length})</span>
              <span className="text-[10px] font-mono">Select to view BOM</span>
            </div>

            <div className="space-y-2">
              {filteredOrders.map((po) => {
                const isSelected = po.id === currentPO.id;
                const hasShortage = po.bom.some(b => b.shortageQty > 0);

                return (
                  <button
                    key={po.id}
                    onClick={() => setSelectedPoId(po.id)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all flex flex-col justify-between space-y-3 ${
                      isSelected
                        ? 'bg-slate-900 border-brand-500 ring-1 ring-brand-500/30 shadow-xl'
                        : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-xs font-bold text-white font-mono flex items-center gap-1.5">
                          {po.poNumber}
                          {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-brand-400" />}
                        </span>
                        <p className="text-xs text-slate-300 font-medium mt-0.5 line-clamp-1">{po.styleName}</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold border ${getStatusBadge(po.status)}`}>
                        {po.status}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400 font-mono">{po.orderQuantity.toLocaleString()} pcs</span>
                      <span className="text-emerald-400 font-bold font-mono">${po.totalOrderValueUsd.toLocaleString()}</span>
                    </div>

                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
                      <span>Buyer: <strong className="text-slate-200">{po.buyerName.split(' ')[0]}</strong></span>
                      {hasShortage ? (
                        <span className="flex items-center gap-1 text-amber-400 font-semibold">
                          <AlertTriangle className="w-3 h-3" />
                          Material Shortage
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                          <CheckCircle2 className="w-3 h-3" />
                          Materials Ready
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Order Details, Matrix & BOM MRP (8 cols) */}
          <div className="lg:col-span-8 space-y-5">
            {/* PO Overview Banner */}
            <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-base font-extrabold text-white font-mono">{currentPO.poNumber}</h2>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
                      Style: {currentPO.styleNumber}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">{currentPO.styleName}</p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Buyer: <span className="text-white font-semibold">{currentPO.buyerName}</span> • Plant: <span className="text-brand-400">{currentPO.factoryName}</span>
                  </p>
                </div>

                {/* Workflow Status Controls */}
                <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 p-1 rounded-xl shrink-0">
                  <span className="text-[11px] font-semibold text-slate-400 px-2">Lifecycle State:</span>
                  <select
                    value={currentPO.status}
                    onChange={(e) => handleStatusChange(currentPO.id, e.target.value as POStatus)}
                    className="bg-slate-800 text-xs font-bold text-brand-400 border border-slate-700 rounded-lg px-2.5 py-1 focus:outline-none focus:ring-1 focus:ring-brand-500 cursor-pointer font-mono"
                  >
                    <option value="DRAFT">DRAFT</option>
                    <option value="SUBMITTED">SUBMITTED</option>
                    <option value="APPROVED">APPROVED</option>
                    <option value="IN_PRODUCTION">IN_PRODUCTION</option>
                    <option value="PACKED">PACKED</option>
                    <option value="SHIPPED">SHIPPED</option>
                    <option value="COMPLETED">COMPLETED</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 pt-3 border-t border-slate-800/80 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Total Order Quantity</span>
                  <p className="text-base font-extrabold text-white font-mono mt-0.5">{currentPO.orderQuantity.toLocaleString()} pcs</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Contracted Value</span>
                  <p className="text-base font-extrabold text-emerald-400 font-mono mt-0.5">${currentPO.totalOrderValueUsd.toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Ex-Factory Delivery Date</span>
                  <p className="text-base font-extrabold text-amber-400 font-mono mt-0.5">{currentPO.exFactoryDeliveryDate}</p>
                </div>
              </div>
            </div>

            {/* Color & Size Quantity Matrix */}
            <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4 text-brand-400" />
                Color & Graded Size Distribution Matrix
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {currentPO.colorSizeBreakdown.map((item, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-semibold text-slate-200">{item.color}</p>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-brand-400 font-bold">
                        Size: {item.size}
                      </span>
                    </div>
                    <span className="text-sm font-extrabold text-white font-mono">
                      {item.quantity.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Automated BOM & Material Requirement Planning (MRP) */}
            <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
              <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-white">
                  <Package className="w-4 h-4 text-amber-400" />
                  <span>BOM & Material Requirement Planning (MRP Shortage Engine)</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">Automated 5% wastage allowance</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-900/90 text-slate-400 font-mono border-b border-slate-800">
                      <th className="p-3 font-bold">Type</th>
                      <th className="p-3 font-bold min-w-[200px]">Item & Specification</th>
                      <th className="p-3 font-bold text-center">Unit</th>
                      <th className="p-3 font-bold text-right">Gross Required</th>
                      <th className="p-3 font-bold text-right">Available Stock</th>
                      <th className="p-3 font-bold text-right">Procurement Shortage</th>
                      <th className="p-3 font-bold text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    {currentPO.bom.map((bomItem) => (
                      <tr key={bomItem.id} className="hover:bg-slate-850/50 transition-colors">
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded text-[9px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                            {bomItem.itemType}
                          </span>
                        </td>
                        <td className="p-3 font-sans">
                          <p className="font-semibold text-slate-100">{bomItem.itemName}</p>
                          <p className="text-[10px] text-slate-500">{bomItem.specification}</p>
                        </td>
                        <td className="p-3 text-center text-slate-400">{bomItem.unit}</td>
                        <td className="p-3 text-right font-bold text-white">
                          {bomItem.totalRequiredQty.toLocaleString()}
                        </td>
                        <td className="p-3 text-right text-slate-300">
                          {bomItem.availableStockQty.toLocaleString()}
                        </td>
                        <td className={`p-3 text-right font-bold ${
                          bomItem.shortageQty > 0 ? 'text-amber-400' : 'text-slate-500'
                        }`}>
                          {bomItem.shortageQty > 0 ? `-${bomItem.shortageQty.toLocaleString()}` : '0'}
                        </td>
                        <td className="p-3 text-center">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${
                            bomItem.procurementStatus === 'SHORTAGE'
                              ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                              : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          }`}>
                            {bomItem.procurementStatus}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
