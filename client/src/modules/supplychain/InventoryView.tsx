import React, { useState, useEffect } from 'react';
import { 
  Package, 
  ShieldCheck, 
  AlertOctagon, 
  ArrowUpRight, 
  Search, 
  History, 
  Scissors, 
  Layers, 
  CheckCircle2, 
  X, 
  AlertTriangle,
  Building2,
  Tag
} from 'lucide-react';
import { StockItem, StockTransaction } from '../../types/supplyChain';

export const InventoryView: React.FC = () => {
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [transactions, setTransactions] = useState<StockTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  // Issue Stock Modal
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [selectedStock, setSelectedStock] = useState<StockItem | null>(null);
  const [issueQty, setIssueQty] = useState<number>(100);
  const [targetLine, setTargetLine] = useState('Cut Table 01 (Gerber Spreader)');
  const [referenceDoc, setReferenceDoc] = useState('LINE-SLIP-101');
  const [issueReason, setIssueReason] = useState('Issued for polo shirt body cutting batch #1');
  const [issueError, setIssueError] = useState<string | null>(null);
  const [issueSuccess, setIssueSuccess] = useState<string | null>(null);

  const fetchInventory = async () => {
    try {
      const token = localStorage.getItem('garment_access_token');
      const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

      const [stockRes, txRes] = await Promise.all([
        fetch('/api/v1/inventory/stock', { headers }).then(r => r.json()),
        fetch('/api/v1/inventory/transactions', { headers }).then(r => r.json())
      ]);

      if (stockRes.success) setStockItems(stockRes.data);
      if (txRes.success) setTransactions(txRes.data);
    } catch (err) {
      console.error('Failed to load inventory data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const openIssueDialog = (item: StockItem) => {
    setSelectedStock(item);
    setIssueQty(Math.min(500, item.availableQty));
    setIssueError(null);
    setIssueSuccess(null);
    setShowIssueModal(true);
  };

  const handleIssueStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStock) return;

    setIssueError(null);
    setIssueSuccess(null);

    // Front-end check matching back-end negative stock prevention
    if (issueQty > selectedStock.availableQty) {
      setIssueError(
        `Negative inventory is strictly prohibited! Requested ${issueQty} ${selectedStock.unit}, but only ${selectedStock.availableQty} ${selectedStock.unit} available in ${selectedStock.warehouseName}.`
      );
      return;
    }

    try {
      const token = localStorage.getItem('garment_access_token');
      const res = await fetch('/api/v1/inventory/transactions/issue', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          sku: selectedStock.sku,
          warehouseId: selectedStock.warehouseId,
          quantity: Number(issueQty),
          targetLine,
          referenceDoc,
          reason: issueReason
        })
      });

      const json = await res.json();
      if (json.success) {
        setIssueSuccess(json.message);
        setTimeout(() => {
          setShowIssueModal(false);
          fetchInventory();
        }, 1200);
      } else {
        setIssueError(json.error?.message || 'Stock issuance rejected');
      }
    } catch (err: any) {
      setIssueError(err.message || 'Issuance network error');
    }
  };

  const filteredStock = stockItems.filter(s => {
    const matchSearch = s.itemName.toLowerCase().includes(search.toLowerCase()) || 
      s.sku.toLowerCase().includes(search.toLowerCase()) ||
      s.binCode.toLowerCase().includes(search.toLowerCase()) ||
      s.warehouseName.toLowerCase().includes(search.toLowerCase());
    const matchCat = categoryFilter === 'ALL' || s.category === categoryFilter;
    return matchSearch && matchCat;
  });

  const totalSkus = stockItems.length;
  const fabricStockKg = stockItems
    .filter(s => s.category === 'FABRIC')
    .reduce((sum, s) => sum + s.availableQty, 0);
  const trimsStockPcs = stockItems
    .filter(s => s.category === 'TRIMS' || s.category === 'ACCESSORIES')
    .reduce((sum, s) => sum + s.availableQty, 0);

  return (
    <div className="space-y-6">
      {/* Title & Strict Negative Stock Badge */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <Package className="h-6 w-6 text-emerald-400" />
            Multi-Warehouse Inventory & Negative Stock Engine
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time tracking of Central Bonded Fabric Warehouse, Trims Store, Bin Coordinates, Lot Numbers & Zero-Negative Stock Issuance.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold shrink-0">
          <ShieldCheck className="h-4 w-4 text-emerald-400" />
          <span>Negative Stock Prevention: ACTIVE (100% Enforced)</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/50 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Inventory SKUs</span>
            <Tag className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white">{totalSkus}</span>
            <span className="text-xs text-slate-400">Tracked SKUs</span>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/50 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Bonded Fabric Stock</span>
            <Layers className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white">{fabricStockKg.toLocaleString()}</span>
            <span className="text-xs text-indigo-400 font-medium">KG Available</span>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/50 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Trims & Accessories</span>
            <Scissors className="h-4 w-4 text-amber-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white">{trimsStockPcs.toLocaleString()}</span>
            <span className="text-xs text-amber-400 font-medium">PCS In Store</span>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/50 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Stock Transactions</span>
            <History className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white">{transactions.length}</span>
            <span className="text-xs text-emerald-400 font-medium">Audited Movements</span>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-slate-900/40 p-3 rounded-xl border border-slate-800">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search SKU, Item, Bin or Warehouse..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 bg-slate-800/80 border border-slate-700/60 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          {['ALL', 'FABRIC', 'TRIMS', 'ACCESSORIES'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                categoryFilter === cat
                  ? 'bg-emerald-600 text-white shadow'
                  : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Live Stock Items Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-emerald-400" />
            <h2 className="text-base font-bold text-white">Live Multi-Warehouse Stock Ledger</h2>
          </div>
          <span className="text-xs text-slate-400">Strict negative inventory protection active</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800/60 text-slate-400 uppercase text-[10px] font-semibold tracking-wider">
              <tr>
                <th className="p-3">SKU & Item Name</th>
                <th className="p-3">Category</th>
                <th className="p-3">Warehouse & Bin</th>
                <th className="p-3">Lot No. & Shade</th>
                <th className="p-3 text-right">Available Qty</th>
                <th className="p-3 text-right">Reorder Level</th>
                <th className="p-3 text-center">Status</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">Loading multi-warehouse inventory balances...</td>
                </tr>
              ) : filteredStock.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500">No stock items found.</td>
                </tr>
              ) : (
                filteredStock.map((item) => {
                const isLow = item.availableQty <= item.reorderLevel;
                return (
                  <tr key={item.id} className="hover:bg-slate-800/30 transition">
                    <td className="p-3">
                      <div className="font-semibold text-white">{item.itemName}</div>
                      <div className="text-emerald-400 font-mono text-[11px] font-medium">{item.sku}</div>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                        item.category === 'FABRIC' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' :
                        item.category === 'TRIMS' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                        'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                      }`}>
                        {item.category}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="text-slate-200">{item.warehouseName}</div>
                      <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] font-mono text-amber-400 font-bold border border-slate-700/60">
                        Bin: {item.binCode}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="font-mono text-slate-200 font-semibold">{item.lotNumber}</div>
                      <div className="text-slate-400 text-[11px]">{item.shadeBand || 'Standard'}</div>
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-sm text-emerald-400">
                      {item.availableQty.toLocaleString()} <span className="text-[10px] text-slate-400 font-normal">{item.unit}</span>
                    </td>
                    <td className="p-3 text-right font-mono text-slate-400">
                      {item.reorderLevel.toLocaleString()} {item.unit}
                    </td>
                    <td className="p-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        isLow 
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' 
                          : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      }`}>
                        {isLow ? 'LOW STOCK' : 'HEALTHY'}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => openIssueDialog(item)}
                        className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs rounded-lg transition shadow cursor-pointer flex items-center gap-1 mx-auto"
                      >
                        <ArrowUpRight className="h-3 w-3" />
                        Issue to Line
                      </button>
                    </td>
                  </tr>
                );
              }))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stock Transaction Movement Ledger */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-xl space-y-3 p-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <History className="h-5 w-5 text-emerald-400" />
            <h2 className="text-base font-bold text-white">Stock Movement & Issuance Ledger (Audit Trail)</h2>
          </div>
          <span className="text-xs text-slate-400">Recorded with immutable timestamp & reference doc</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800/60 text-slate-400 uppercase text-[10px] font-semibold">
              <tr>
                <th className="p-2.5">TX Number</th>
                <th className="p-2.5">Type</th>
                <th className="p-2.5">SKU & Item</th>
                <th className="p-2.5">Movement Path</th>
                <th className="p-2.5 text-right">Quantity</th>
                <th className="p-2.5">Reference Doc</th>
                <th className="p-2.5">Performed By</th>
                <th className="p-2.5">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-800/20">
                  <td className="p-2.5 font-mono text-emerald-400 font-medium">{tx.transactionNumber}</td>
                  <td className="p-2.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                      tx.type === 'RECEIVE_GRN' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                      'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                    }`}>
                      {tx.type}
                    </span>
                  </td>
                  <td className="p-2.5">
                    <div className="font-semibold text-white">{tx.itemName}</div>
                    <div className="font-mono text-slate-400 text-[10px]">{tx.sku}</div>
                  </td>
                  <td className="p-2.5">
                    {tx.targetLine ? (
                      <span className="text-indigo-400 flex items-center gap-1 font-medium">
                        → {tx.targetLine}
                      </span>
                    ) : (
                      <span className="text-slate-300">
                        → {tx.toWarehouse}
                      </span>
                    )}
                  </td>
                  <td className="p-2.5 text-right font-mono font-bold text-white">
                    {tx.type === 'ISSUE_TO_LINE' ? `-${tx.quantity}` : `+${tx.quantity}`} {tx.unit}
                  </td>
                  <td className="p-2.5 font-mono text-slate-300">{tx.referenceDoc}</td>
                  <td className="p-2.5 text-slate-400">{tx.performedBy}</td>
                  <td className="p-2.5 text-slate-500 text-[11px]">{new Date(tx.timestamp).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Issue Stock to Line with LIVE Negative Balance Warning */}
      {showIssueModal && selectedStock && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative space-y-4">
            <button
              onClick={() => setShowIssueModal(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
              <ArrowUpRight className="h-6 w-6 text-indigo-400" />
              <div>
                <h2 className="text-lg font-bold text-white">Issue Stock to Production Line</h2>
                <p className="text-xs text-slate-400">Direct material issuance to Cutting or Sewing floor</p>
              </div>
            </div>

            {/* Selected Stock Banner */}
            <div className="p-3.5 bg-slate-800/60 rounded-xl border border-slate-700/80 space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-sm font-bold text-white">{selectedStock.itemName}</div>
                  <div className="text-xs text-emerald-400 font-mono font-medium">{selectedStock.sku}</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Available Stock</div>
                  <div className="text-lg font-bold text-emerald-400 font-mono">
                    {selectedStock.availableQty.toLocaleString()} {selectedStock.unit}
                  </div>
                </div>
              </div>
              <div className="text-xs text-slate-400 flex items-center justify-between pt-2 border-t border-slate-700/50">
                <span>Warehouse: <strong className="text-slate-200">{selectedStock.warehouseName}</strong></span>
                <span>Bin: <strong className="text-amber-400 font-mono">{selectedStock.binCode}</strong></span>
              </div>
            </div>

            {/* Negative Stock Warning Box if IssueQty > Available */}
            {issueQty > selectedStock.availableQty && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-start gap-2.5 animate-pulse">
                <AlertOctagon className="h-5 w-5 shrink-0 text-rose-400 mt-0.5" />
                <div>
                  <div className="font-bold">Strict Negative Inventory Violation!</div>
                  <div>
                    Issuing {issueQty} {selectedStock.unit} exceeds the available inventory ({selectedStock.availableQty} {selectedStock.unit}). The GarmentERP BD compliance engine will block this request.
                  </div>
                </div>
              </div>
            )}

            {issueError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>{issueError}</span>
              </div>
            )}

            {issueSuccess && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>{issueSuccess}</span>
              </div>
            )}

            <form onSubmit={handleIssueStock} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-300">Quantity to Issue ({selectedStock.unit})</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={issueQty}
                    onChange={(e) => setIssueQty(Number(e.target.value))}
                    className={`mt-1 w-full px-3 py-2 bg-slate-800 border rounded-lg text-sm text-white font-mono focus:outline-none ${
                      issueQty > selectedStock.availableQty 
                        ? 'border-rose-500 text-rose-400 focus:border-rose-500' 
                        : 'border-slate-700 focus:border-indigo-500'
                    }`}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-300">Target Line / Floor</label>
                  <select
                    value={targetLine}
                    onChange={(e) => setTargetLine(e.target.value)}
                    className="mt-1 w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Cut Table 01 (Gerber Spreader)">Cut Table 01 (Gerber Spreader)</option>
                    <option value="Cut Table 02 (Manual Lay)">Cut Table 02 (Manual Lay)</option>
                    <option value="Sewing Line 01 (Polo Shirt)">Sewing Line 01 (Polo Shirt)</option>
                    <option value="Sewing Line 02 (T-Shirt & Henley)">Sewing Line 02 (T-Shirt & Henley)</option>
                    <option value="Sewing Line 03 (Fleece Hoodie)">Sewing Line 03 (Fleece Hoodie)</option>
                    <option value="Sewing Line 04 (Jogger Pants)">Sewing Line 04 (Jogger Pants)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-300">Requisition Reference Slip</label>
                  <input
                    type="text"
                    required
                    value={referenceDoc}
                    onChange={(e) => setReferenceDoc(e.target.value)}
                    placeholder="e.g. SLIP-2026-09"
                    className="mt-1 w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-300">Issuance Reason / Order Batch</label>
                  <input
                    type="text"
                    value={issueReason}
                    onChange={(e) => setIssueReason(e.target.value)}
                    placeholder="e.g. For PO-2026-001 Cutting"
                    className="mt-1 w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowIssueModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold rounded-lg transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={issueQty > selectedStock.availableQty}
                  className={`px-5 py-2 text-white text-sm font-semibold rounded-lg shadow-lg transition flex items-center gap-2 ${
                    issueQty > selectedStock.availableQty
                      ? 'bg-rose-600/50 cursor-not-allowed opacity-60'
                      : 'bg-indigo-600 hover:bg-indigo-500 cursor-pointer shadow-indigo-600/20'
                  }`}
                >
                  <ArrowUpRight className="h-4 w-4" />
                  Confirm Issuance to Floor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
