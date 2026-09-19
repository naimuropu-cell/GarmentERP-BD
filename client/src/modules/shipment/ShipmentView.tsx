import React, { useState, useEffect } from 'react';
import { 
  Ship, 
  FileText, 
  Package, 
  Truck, 
  ShieldCheck, 
  AlertTriangle, 
  Plus, 
  CheckCircle2, 
  Search, 
  Anchor, 
  Printer,
  BadgeCheck,
  Clock
} from 'lucide-react';
import { 
  Shipment, 
  CommercialInvoice, 
  PackingList, 
  SecurityGatePass, 
  ShipmentStatus 
} from '../../types/shipment';

export const ShipmentView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'shipments' | 'invoices' | 'packing' | 'gatepass'>('shipments');
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [invoices, setInvoices] = useState<CommercialInvoice[]>([]);
  const [packingLists, setPackingLists] = useState<PackingList[]>([]);
  const [gatePasses, setGatePasses] = useState<SecurityGatePass[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [poNumberInput, setPoNumberInput] = useState('PO-2026-001');
  const [vesselInput, setVesselInput] = useState('MSC ARIES (Voyage 2608W)');
  const [etdInput, setEtdInput] = useState('2026-07-02');
  const [etaInput, setEtaInput] = useState('2026-07-28');
  const [qtyInput, setQtyInput] = useState(5000);
  const [gateCheckStatus, setGateCheckStatus] = useState<{ verified: boolean; message: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const token = localStorage.getItem('garment_access_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [shipmentsRes, invoicesRes, plRes, gpRes] = await Promise.all([
        fetch('/api/v1/shipments', { headers }),
        fetch('/api/v1/shipments/docs/invoices', { headers }),
        fetch('/api/v1/shipments/docs/packing-lists', { headers }),
        fetch('/api/v1/shipments/gate-passes', { headers })
      ]);

      const [shipmentsJson, invoicesJson, plJson, gpJson] = await Promise.all([
        shipmentsRes.json(),
        invoicesRes.json(),
        plRes.json(),
        gpRes.json()
      ]);

      if (shipmentsJson.success) setShipments(shipmentsJson.data);
      if (invoicesJson.success) setInvoices(invoicesJson.data);
      if (plJson.success) setPackingLists(plJson.data);
      if (gpJson.success) setGatePasses(gpJson.data);
    } catch (err) {
      console.error('Failed to load shipment data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Real-time Quality Gate Checker
  const checkQualityGate = async (poNum: string) => {
    if (!poNum.trim()) {
      setGateCheckStatus(null);
      return;
    }
    try {
      const res = await fetch(`/api/v1/shipments/verify-gate?poNumber=${encodeURIComponent(poNum)}`, { headers });
      const json = await res.json();
      if (json.success && json.data.verified) {
        setGateCheckStatus({
          verified: true,
          message: `Quality Gate Cleared: AQL Certificate ${json.data.aqlRecord.certificateNumber} (ACCEPTED PASS)`
        });
      } else {
        setGateCheckStatus({
          verified: false,
          message: json.data?.error || 'Quality Gate Violation: No certified ACCEPTED PASS AQL audit found.'
        });
      }
    } catch (e) {
      setGateCheckStatus({ verified: false, message: 'Failed to verify quality gate.' });
    }
  };

  useEffect(() => {
    if (showCreateModal) {
      checkQualityGate(poNumberInput);
    }
  }, [showCreateModal, poNumberInput]);

  const handleCreateShipment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (gateCheckStatus && !gateCheckStatus.verified) {
      alert('Cannot create shipment: Pre-shipment AQL quality gate has not passed.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/v1/shipments', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          poId: 'po-001',
          poNumber: poNumberInput,
          buyerId: 'byr-001',
          buyerName: 'H&M Hennes & Mauritz GBC AB',
          styleNumber: 'TSH-2026-001',
          orderQuantity: Number(qtyInput),
          shippedQuantity: Number(qtyInput),
          vesselOrFlight: vesselInput,
          etd: etdInput,
          eta: etaInput
        })
      });

      const json = await res.json();
      if (json.success) {
        setShowCreateModal(false);
        fetchAllData();
      } else {
        alert(json.error?.message || 'Failed to create shipment');
      }
    } catch (err: any) {
      alert(err.message || 'Error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDispatchGatePass = async (id: string) => {
    try {
      const res = await fetch(`/api/v1/shipments/gate-passes/${id}/status`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ status: 'DISPATCHED_GATE_OUT' })
      });
      const json = await res.json();
      if (json.success) {
        fetchAllData();
      } else {
        alert(json.error?.message || 'Failed to dispatch gate pass');
      }
    } catch (e: any) {
      alert(e.message || 'Dispatch error');
    }
  };

  const getStatusBadge = (status: ShipmentStatus) => {
    switch (status) {
      case 'GATE_OUT':
      case 'IN_TRANSIT':
        return <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1"><Truck className="w-3 h-3" /> Gate Out / On Road</span>;
      case 'DOCS_PREPARED':
        return <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1"><FileText className="w-3 h-3" /> Docs Ready</span>;
      case 'PORT_DELIVERED':
      case 'COMPLETED':
        return <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Port Delivered</span>;
      case 'PLANNED':
      default:
        return <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1"><Clock className="w-3 h-3" /> Planned</span>;
    }
  };

  const filteredShipments = shipments.filter(s => 
    s.shipmentTrackingNumber.toLowerCase().includes(search.toLowerCase()) ||
    s.poNumber.toLowerCase().includes(search.toLowerCase()) ||
    s.buyerName.toLowerCase().includes(search.toLowerCase()) ||
    s.vesselOrFlight.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header & Badges */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
              MODULE 21 • PHASE 6
            </span>
            <span className="text-xs text-slate-500 font-medium">Export Logistics & Commercial Invoicing</span>
            {loading && <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded animate-pulse font-mono font-medium">Syncing live SCM data...</span>}
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Ship className="w-6 h-6 text-emerald-700" />
            <span>Shipment, Commercial Export & Gate Pass</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Full export lifecycle: Commercial Invoices, Packing Lists, CBM Container Loading, Gate Pass Issuance, and Pre-Shipment ISO AQL Quality Gate Security.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-sm flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Export Shipment</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500">Active Shipments</span>
            <p className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">{shipments.length}</p>
            <span className="text-[11px] font-medium text-emerald-700 flex items-center gap-1 mt-0.5">
              <ShieldCheck className="w-3.5 h-3.5" /> 100% AQL Verified
            </span>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700">
            <Ship className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500">Commercial Invoiced</span>
            <p className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
              ${invoices.reduce((acc, curr) => acc + curr.totalAmount, 0).toLocaleString()}
            </p>
            <span className="text-[11px] font-medium text-slate-500 mt-0.5">USD via Irrevocable LC</span>
          </div>
          <div className="p-3 rounded-xl bg-blue-50 text-blue-700">
            <FileText className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500">Export Cartons Packed</span>
            <p className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
              {packingLists.reduce((acc, curr) => acc + curr.totalCartons, 0)} Cartons
            </p>
            <span className="text-[11px] font-medium text-emerald-700 mt-0.5">
              {packingLists.reduce((acc, curr) => acc + curr.totalCbm, 0).toFixed(2)} Total CBM
            </span>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700">
            <Package className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500">Factory Gate Status</span>
            <p className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
              {gatePasses.filter(g => g.status === 'DISPATCHED_GATE_OUT').length} On Road
            </p>
            <span className="text-[11px] font-medium text-amber-700 mt-0.5 flex items-center gap-1">
              <Truck className="w-3.5 h-3.5" /> Bound for Chittagong Port
            </span>
          </div>
          <div className="p-3 rounded-xl bg-amber-50 text-amber-700">
            <Truck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Quality Gate Rule Notice */}
      <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 flex items-start gap-3">
        <BadgeCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-700 leading-relaxed">
          <span className="font-bold text-emerald-900">Mandatory Pre-Shipment Quality Gate Active:</span> Under international buyer guidelines and GarmentERP BD export protocols, Commercial Invoicing, Packing List generation, and Security Gate Pass issuance are strictly locked until the Buyer PO achieves an authorized <strong>ISO 2859-1 Level II ACCEPTED PASS</strong> AQL certificate.
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('shipments')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'shipments'
              ? 'border-emerald-700 text-emerald-800 bg-emerald-50/40'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Ship className="w-4 h-4" />
          <span>Shipment Registry ({shipments.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('invoices')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'invoices'
              ? 'border-emerald-700 text-emerald-800 bg-emerald-50/40'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Commercial Invoices ({invoices.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('packing')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'packing'
              ? 'border-emerald-700 text-emerald-800 bg-emerald-50/40'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Export Packing Lists ({packingLists.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('gatepass')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'gatepass'
              ? 'border-emerald-700 text-emerald-800 bg-emerald-50/40'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Truck className="w-4 h-4" />
          <span>Security Gate Passes ({gatePasses.length})</span>
        </button>
      </div>

      {/* Tab 1: Shipments Overview */}
      {activeTab === 'shipments' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="relative w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search shipments, PO, buyer, vessel..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl text-xs bg-white border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="p-3.5">Shipment Tracking</th>
                  <th className="p-3.5">Buyer PO & Style</th>
                  <th className="p-3.5">Shipped Qty</th>
                  <th className="p-3.5">AQL Certificate</th>
                  <th className="p-3.5">Vessel / Flight</th>
                  <th className="p-3.5">ETD & ETA</th>
                  <th className="p-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredShipments.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-3.5">
                      <div className="font-bold text-slate-900 font-mono">{s.shipmentTrackingNumber}</div>
                      <div className="text-[10px] text-slate-400">Created: {new Date(s.createdAt).toLocaleDateString()}</div>
                    </td>
                    <td className="p-3.5">
                      <div className="font-bold text-slate-900">{s.buyerName}</div>
                      <div className="text-[11px] text-emerald-800 font-mono font-semibold">{s.poNumber} • {s.styleNumber}</div>
                    </td>
                    <td className="p-3.5">
                      <div className="font-extrabold text-slate-900">{s.shippedQuantity.toLocaleString()} pcs</div>
                      <div className="text-[10px] text-slate-400">Order: {s.orderQuantity.toLocaleString()} pcs</div>
                    </td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1 w-fit">
                        <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                        {s.aqlCertificateNumber}
                      </span>
                    </td>
                    <td className="p-3.5 font-medium text-slate-700">
                      <div className="flex items-center gap-1.5">
                        <Anchor className="w-3.5 h-3.5 text-slate-400" />
                        <span>{s.vesselOrFlight}</span>
                      </div>
                    </td>
                    <td className="p-3.5 text-slate-600 text-[11px]">
                      <div>ETD: <span className="font-semibold text-slate-900">{s.etd}</span></div>
                      <div>ETA: <span className="font-semibold text-slate-900">{s.eta}</span></div>
                    </td>
                    <td className="p-3.5">
                      {getStatusBadge(s.status)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Commercial Invoices */}
      {activeTab === 'invoices' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {invoices.map((inv) => (
            <div key={inv.id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4 hover:shadow-md transition-all">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                    EXPORT COMMERCIAL INVOICE
                  </span>
                  <h3 className="text-base font-extrabold text-slate-900 font-mono mt-1">{inv.invoiceNumber}</h3>
                </div>
                <button 
                  onClick={() => window.print()}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
                  title="Print Invoice"
                >
                  <Printer className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 font-medium">Buyer Reference:</span>
                  <p className="font-bold text-slate-900">{inv.buyerName}</p>
                  <p className="text-slate-600 font-mono text-[11px]">PO: {inv.poNumber} • Style: {inv.styleNumber}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Letter of Credit (LC):</span>
                  <p className="font-bold text-slate-900 font-mono">{inv.lcNumber}</p>
                  <p className="text-slate-500 text-[10px] truncate">{inv.issuingBank}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Incoterms & Ports:</span>
                  <p className="font-bold text-emerald-800">{inv.incoterms} ({inv.currency})</p>
                  <p className="text-[10px] text-slate-500">POL: {inv.portOfLoading}</p>
                  <p className="text-[10px] text-slate-500">POD: {inv.portOfDischarge}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Invoiced Quantity & Rate:</span>
                  <p className="font-bold text-slate-900">{inv.invoicedQuantity.toLocaleString()} pcs @ ${inv.unitPrice.toFixed(2)}</p>
                  <p className="text-emerald-800 text-[10px] font-semibold">{inv.paymentTerms}</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600">Total Invoice Value:</span>
                <span className="text-xl font-extrabold text-emerald-800 font-mono">
                  ${inv.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })} {inv.currency}
                </span>
              </div>

              <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-100">
                <span>Signoff: <strong className="text-slate-700">{inv.commercialOfficerSignoff}</strong></span>
                <span>{new Date(inv.createdAt).toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: Export Packing Lists */}
      {activeTab === 'packing' && (
        <div className="space-y-6">
          {packingLists.map((pl) => (
            <div key={pl.id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                    CONTAINER EXPORT PACKING LIST
                  </span>
                  <h3 className="text-base font-extrabold text-slate-900 font-mono mt-1">
                    {pl.packingListNumber} (Ref: {pl.invoiceNumber})
                  </h3>
                </div>
                <div className="flex items-center gap-4 text-xs font-mono">
                  <div className="px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-200">
                    Container: <strong className="text-slate-900">{pl.containerNumber}</strong> ({pl.containerType})
                  </div>
                  <div className="px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-200">
                    Seal: <strong className="text-emerald-800">{pl.sealNumber}</strong>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-500">Total Cartons:</span>
                  <p className="text-lg font-extrabold text-slate-900 mt-0.5">{pl.totalCartons} Cartons</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-500">Gross Weight:</span>
                  <p className="text-lg font-extrabold text-slate-900 mt-0.5">{pl.totalGrossWeightKg.toLocaleString()} KG</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-500">Net Weight:</span>
                  <p className="text-lg font-extrabold text-slate-900 mt-0.5">{pl.totalNetWeightKg.toLocaleString()} KG</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-500">Total Volume:</span>
                  <p className="text-lg font-extrabold text-emerald-800 mt-0.5">{pl.totalCbm} CBM</p>
                </div>
              </div>

              <div className="overflow-hidden rounded-xl border border-slate-200">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-semibold uppercase text-[10px]">
                    <tr>
                      <th className="p-2.5">Carton Range</th>
                      <th className="p-2.5">Size Assortment</th>
                      <th className="p-2.5">Pcs / Ctn</th>
                      <th className="p-2.5">Total Ctns</th>
                      <th className="p-2.5">Total Pcs</th>
                      <th className="p-2.5">Gross Wt (KG)</th>
                      <th className="p-2.5">CBM</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {pl.cartonBreakdown.map((item, i) => (
                      <tr key={i} className="hover:bg-slate-50/50">
                        <td className="p-2.5 font-bold text-slate-900 font-mono">{item.cartonRange}</td>
                        <td className="p-2.5 text-slate-600">{item.sizeRatio}</td>
                        <td className="p-2.5 font-semibold text-slate-800">{item.pcsPerCarton}</td>
                        <td className="p-2.5 font-semibold text-slate-800">{item.totalCartons}</td>
                        <td className="p-2.5 font-bold text-emerald-800">{item.totalPcs}</td>
                        <td className="p-2.5 text-slate-700">{item.grossWeightKg.toFixed(2)}</td>
                        <td className="p-2.5 font-mono text-slate-900">{item.cbm.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 4: Security Gate Passes */}
      {activeTab === 'gatepass' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {gatePasses.map((gp) => (
            <div key={gp.id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4 hover:shadow-md transition-all">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                    PLANT SECURITY GATE PASS
                  </span>
                  <h3 className="text-base font-extrabold text-slate-900 font-mono mt-1">{gp.gatePassNumber}</h3>
                </div>
                {gp.status === 'DISPATCHED_GATE_OUT' ? (
                  <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                    <Truck className="w-3.5 h-3.5" /> Gate Out / Dispatched
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                    Pending Gate Exit
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 font-medium">Prime Mover / Vehicle:</span>
                  <p className="font-bold text-slate-900 font-mono">{gp.vehicleNumber}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Container Seal No:</span>
                  <p className="font-bold text-emerald-800 font-mono">{gp.containerSealNumber}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Driver Information:</span>
                  <p className="font-bold text-slate-900">{gp.driverName}</p>
                  <p className="text-slate-500 font-mono">{gp.driverPhone}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Destination Terminal:</span>
                  <p className="font-bold text-slate-900">{gp.destination}</p>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[11px] text-slate-400">Security Officer:</span>
                  <p className="font-semibold text-slate-800">{gp.securityOfficer}</p>
                </div>
                {gp.exitTimestamp && (
                  <div className="text-right">
                    <span className="text-[11px] text-slate-400">Exit Timestamp:</span>
                    <p className="font-mono text-slate-800 text-[11px]">{new Date(gp.exitTimestamp).toLocaleTimeString()}</p>
                  </div>
                )}
              </div>

              {gp.status === 'PENDING_EXIT' && (
                <button
                  onClick={() => handleDispatchGatePass(gp.id)}
                  className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Truck className="w-4 h-4" />
                  <span>Authorize Gate Exit & Dispatch Container</span>
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal: New Export Shipment */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-lg w-full p-6 shadow-xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Ship className="w-5 h-5 text-emerald-700" />
                <h3 className="text-base font-extrabold text-slate-900">Initiate Export Shipment</h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg leading-none cursor-pointer"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateShipment} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Buyer Purchase Order (PO Number)</label>
                <input
                  type="text"
                  value={poNumberInput}
                  onChange={(e) => setPoNumberInput(e.target.value)}
                  placeholder="e.g. PO-2026-001"
                  required
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono text-xs focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
                />
              </div>

              {/* Quality Gate Verification Indicator */}
              {gateCheckStatus && (
                <div className={`p-3 rounded-xl border flex items-start gap-2.5 ${
                  gateCheckStatus.verified 
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900' 
                    : 'bg-rose-50 border-rose-200 text-rose-900'
                }`}>
                  {gateCheckStatus.verified ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  )}
                  <span className="text-[11px] font-medium leading-relaxed">{gateCheckStatus.message}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Shipped Quantity (Pieces)</label>
                  <input
                    type="number"
                    value={qtyInput}
                    onChange={(e) => setQtyInput(Number(e.target.value))}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Ocean Vessel / Flight No.</label>
                  <input
                    type="text"
                    value={vesselInput}
                    onChange={(e) => setVesselInput(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Estimated Departure (ETD)</label>
                  <input
                    type="date"
                    value={etdInput}
                    onChange={(e) => setEtdInput(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Estimated Arrival (ETA)</label>
                  <input
                    type="date"
                    value={etaInput}
                    onChange={(e) => setEtaInput(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || (gateCheckStatus !== null && !gateCheckStatus.verified)}
                  className={`px-5 py-2 rounded-xl text-white font-bold flex items-center gap-2 cursor-pointer ${
                    gateCheckStatus && !gateCheckStatus.verified
                      ? 'bg-slate-400 cursor-not-allowed'
                      : 'bg-emerald-700 hover:bg-emerald-800'
                  }`}
                >
                  {isSubmitting ? 'Verifying...' : 'Authorize & Plan Shipment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
