import React from 'react';
import { Printer, X, FileText } from 'lucide-react';
import { CommercialInvoice } from '../../types/shipment';

interface PrintableInvoiceProps {
  invoice: CommercialInvoice;
  onClose: () => void;
}

export const PrintableInvoice: React.FC<PrintableInvoiceProps> = ({ invoice, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-3xl p-6 shadow-2xl relative space-y-5 my-8">
        {/* Modal Controls (Hidden in Print) */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 print:hidden">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-emerald-50 text-emerald-800 rounded-lg border border-emerald-200">
              <FileText className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Commercial Export Invoice</h3>
              <p className="text-[11px] text-slate-500">Customs Clearance & Letter of Credit Negotiation Document</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg transition flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Invoice</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Sheet */}
        <div className="p-8 border border-slate-200 rounded-xl bg-white space-y-6 text-slate-800 print:border-none print:p-0">
          {/* Company Header */}
          <div className="flex items-start justify-between border-b-2 border-slate-900 pb-4">
            <div>
              <h1 className="text-2xl font-serif font-black tracking-tight text-slate-950">APEX GARMENTS (BD) LTD.</h1>
              <p className="text-xs text-slate-600 font-medium">100% Export Oriented Garments Manufacturer</p>
              <p className="text-[11px] text-slate-500">Plot #42-45, Savar Export Processing Zone, Dhaka, Bangladesh</p>
              <p className="text-[11px] text-slate-500">TIN: 4892-0192-3312 | BIN: 001928374-0101 | EXP Reg: #EXP-2024-991</p>
            </div>
            <div className="text-right">
              <span className="inline-block px-3 py-1 bg-slate-900 text-white font-mono text-xs font-bold rounded">
                COMMERCIAL INVOICE
              </span>
              <div className="text-sm font-mono font-bold text-emerald-800 mt-2">{invoice.invoiceNumber}</div>
              <div className="text-xs text-slate-500">Date: {new Date(invoice.createdAt || Date.now()).toLocaleDateString('en-GB')}</div>
            </div>
          </div>

          {/* Parties Grid */}
          <div className="grid grid-cols-2 gap-6 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Shipper / Exporter:</span>
              <div className="font-bold text-slate-900 text-sm">Apex Garments (BD) Ltd.</div>
              <div>Savar Export Processing Zone, Dhaka, Bangladesh</div>
              <div>Bank: Standard Chartered Bank, Gulshan Branch, Dhaka</div>
              <div>Swift: SCBLBDDX | IBAN: BD12SCBL00192837401</div>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Buyer / Consignee:</span>
              <div className="font-bold text-slate-900 text-sm">{invoice.buyerName}</div>
              <div>Mäster Samuelsgatan 46A, SE-106 38 Stockholm, Sweden</div>
              <div>VAT ID: SE556042722001</div>
              <div className="font-mono text-emerald-800 font-bold">LC #: {invoice.lcNumber}</div>
            </div>
          </div>

          {/* Shipping & Shipment Meta */}
          <div className="grid grid-cols-4 gap-3 text-xs bg-slate-50 p-3 rounded-lg border border-slate-200">
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Port of Loading</span>
              <span className="font-bold text-slate-800">{invoice.portOfLoading}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Port of Discharge</span>
              <span className="font-bold text-slate-800">{invoice.portOfDischarge}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Incoterm</span>
              <span className="font-bold text-emerald-800 font-mono">{invoice.incoterms}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Internal PO Ref</span>
              <span className="font-bold text-slate-800 font-mono">{invoice.poNumber}</span>
            </div>
          </div>

          {/* Line Items Table */}
          <table className="w-full text-left text-xs border border-slate-200 rounded-lg overflow-hidden">
            <thead className="bg-slate-100 text-slate-700 uppercase text-[10px] font-bold">
              <tr>
                <th className="py-2.5 px-3">Item / Description</th>
                <th className="py-2.5 px-3">HS Code</th>
                <th className="py-2.5 px-3 text-right">Quantity (Pcs)</th>
                <th className="py-2.5 px-3 text-right">Unit Price (USD)</th>
                <th className="py-2.5 px-3 text-right">Total FOB (USD)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              <tr>
                <td className="py-3 px-3">
                  <div className="font-bold text-slate-900">Men's Classic Cotton Crewneck T-Shirt</div>
                  <div className="text-[11px] text-slate-500">Style: TSH-2026-001 | Order: {invoice.poNumber}</div>
                </td>
                <td className="py-3 px-3 font-mono text-slate-600">6109.10.00</td>
                <td className="py-3 px-3 text-right font-mono font-bold text-slate-800">5,000</td>
                <td className="py-3 px-3 text-right font-mono text-slate-800">${(invoice.totalAmount / 5000).toFixed(2)}</td>
                <td className="py-3 px-3 text-right font-mono font-bold text-emerald-800">${invoice.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
              </tr>
            </tbody>
            <tfoot className="bg-slate-50 border-t-2 border-slate-300 text-slate-900 font-bold">
              <tr>
                <td colSpan={3} className="py-3 px-3 text-right uppercase text-[11px]">Total FOB Invoice Value:</td>
                <td colSpan={2} className="py-3 px-3 text-right font-mono text-base text-emerald-900">
                  ${invoice.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })} {invoice.currency}
                </td>
              </tr>
            </tfoot>
          </table>

          {/* Declaration & Signatures */}
          <div className="pt-8 grid grid-cols-2 gap-8 text-xs">
            <div className="text-[11px] text-slate-500 leading-relaxed">
              <strong>Declaration:</strong> We certify that this commercial invoice is authentic and that the goods described herein are of Bangladesh origin manufactured under strict BGMEA and compliance guidelines.
            </div>
            <div className="text-right border-t border-slate-400 pt-2">
              <div className="font-bold text-slate-900 font-serif">For APEX GARMENTS (BD) LTD.</div>
              <div className="text-[11px] text-slate-500 mt-6">Authorized Signatory & Official Company Seal</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
