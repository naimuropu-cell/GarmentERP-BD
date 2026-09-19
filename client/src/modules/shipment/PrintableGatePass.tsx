import React from 'react';
import { Printer, X, ShieldCheck, Truck, User } from 'lucide-react';
import { SecurityGatePass, Shipment } from '../../types/shipment';

interface PrintableGatePassProps {
  gatePass: SecurityGatePass;
  shipment?: Shipment;
  onClose: () => void;
}

export const PrintableGatePass: React.FC<PrintableGatePassProps> = ({ gatePass, shipment, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl p-6 shadow-2xl relative space-y-5 my-8">
        {/* Modal Controls (Hidden in Print) */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 print:hidden">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-emerald-50 text-emerald-800 rounded-lg border border-emerald-200">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Security Gate Pass Dispatch Slip</h3>
              <p className="text-[11px] text-slate-500">Official Customs & Security Gate Exit Voucher</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg transition flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Slip</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Area */}
        <div className="p-6 border-2 border-dashed border-slate-300 rounded-xl bg-slate-50/50 space-y-6 print:border-solid print:border-black print:p-8 print:bg-white">
          {/* Header */}
          <div className="flex items-start justify-between border-b-2 border-slate-800 pb-4">
            <div>
              <div className="text-xl font-extrabold tracking-tight text-slate-950 font-serif">APEX GARMENTS (BD) LTD.</div>
              <div className="text-[11px] text-slate-600 font-medium">Export Processing Zone, Savar, Dhaka, Bangladesh</div>
              <div className="text-[10px] text-slate-500">Customs Bonded Warehouse License #BD-EPZ-2018-9941</div>
            </div>
            <div className="text-right">
              <div className="inline-block px-3 py-1 bg-slate-900 text-white font-mono text-xs font-bold rounded uppercase tracking-wider">
                Official Gate Pass
              </div>
              <div className="text-xs font-mono font-extrabold text-emerald-800 mt-1.5">
                {gatePass.gatePassNumber}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">
                Date: {new Date(gatePass.dispatchTime || gatePass.createdAt || Date.now()).toLocaleDateString('en-GB')}
              </div>
            </div>
          </div>

          {/* Barcode Mock Visual */}
          <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-slate-200 print:border-slate-300">
            <div className="font-mono text-xs">
              <span className="text-slate-400">DISPATCH REF: </span>
              <strong className="text-slate-900">{gatePass.id.toUpperCase()}</strong>
            </div>
            <div className="font-mono text-xs tracking-widest bg-slate-900 text-white px-2 py-0.5 rounded">
              ||||||| | ||||| |||| |||||| |||
            </div>
          </div>

          {/* Vehicle & Logistics Details */}
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="bg-white p-3.5 rounded-lg border border-slate-200 space-y-2">
              <div className="font-bold text-slate-900 border-b border-slate-100 pb-1 flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-emerald-700" />
                <span>Transport & Vehicle Information</span>
              </div>
              <div className="space-y-1 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-500">Vehicle Type:</span>
                  <span className="font-semibold text-slate-800">Prime Mover Container Trailer</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Registration / Plate #:</span>
                  <span className="font-bold font-mono text-slate-900">{gatePass.vehicleNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Container Seal Number:</span>
                  <span className="font-bold font-mono text-emerald-800">{gatePass.containerSealNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Destination:</span>
                  <span className="font-medium text-slate-800">Chittagong Port CFS Terminal</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-3.5 rounded-lg border border-slate-200 space-y-2">
              <div className="font-bold text-slate-900 border-b border-slate-100 pb-1 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-emerald-700" />
                <span>Driver & Carrier Credentials</span>
              </div>
              <div className="space-y-1 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-500">Driver Name:</span>
                  <span className="font-semibold text-slate-800">{gatePass.driverName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Driver License #:</span>
                  <span className="font-mono text-slate-800">BD-DL-2024-8842</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Driver Mobile:</span>
                  <span className="font-mono text-slate-800">{gatePass.driverPhone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Exit Status:</span>
                  <span className="font-bold text-emerald-800">{gatePass.status}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Consignment Specs */}
          <div className="bg-white p-3.5 rounded-lg border border-slate-200 space-y-2 text-xs">
            <div className="font-bold text-slate-900 border-b border-slate-100 pb-1">
              Cargo Description & Quantities
            </div>
            <table className="w-full text-left text-[11px]">
              <thead className="text-slate-500 border-b border-slate-100 font-semibold">
                <tr>
                  <th className="py-1">Export PO #</th>
                  <th className="py-1">Product Description</th>
                  <th className="py-1 text-center">Cartons</th>
                  <th className="py-1 text-right">Total Quantity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="py-1.5 font-mono font-bold text-slate-800">{shipment?.poNumber || 'PO-2026-001'}</td>
                  <td className="py-1.5 text-slate-700">100% Cotton Crewneck T-Shirt (H&M Order)</td>
                  <td className="py-1.5 text-center font-mono font-bold text-slate-900">210 Cartons</td>
                  <td className="py-1.5 text-right font-mono font-bold text-emerald-800">{shipment?.shippedQuantity.toLocaleString() || '5,000'} Pcs</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Signatures & Security Validation */}
          <div className="pt-6 grid grid-cols-3 gap-6 text-center text-[10px] text-slate-600">
            <div className="border-t border-slate-400 pt-1.5">
              <div className="font-bold text-slate-900">{gatePass.securityOfficer || 'Md. Rafiqul Islam'}</div>
              <div>Factory Security In-Charge</div>
              <div className="text-emerald-700 font-semibold mt-0.5">VERIFIED & CLEARED</div>
            </div>
            <div className="border-t border-slate-400 pt-1.5">
              <div className="font-bold text-slate-900">Commercial Dept. Officer</div>
              <div>Logistics & Documentation</div>
              <div className="text-slate-500 mt-0.5">LC Approved</div>
            </div>
            <div className="border-t border-slate-400 pt-1.5">
              <div className="font-bold text-slate-900">{gatePass.driverName}</div>
              <div>Authorized Carrier / Driver</div>
              <div className="text-slate-500 mt-0.5">Goods Received in Good Order</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
