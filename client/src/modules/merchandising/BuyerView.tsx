import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  Search, 
  Plus, 
  Globe2, 
  CreditCard, 
  Ship, 
  Mail, 
  User, 
  CheckCircle2, 
  X,
  Building2
} from 'lucide-react';
import { Buyer } from '../../types/merchandising';

export const BuyerView: React.FC = () => {
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // New Buyer Form State
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [country, setCountry] = useState('');
  const [currency, setCurrency] = useState<'USD' | 'EUR' | 'GBP' | 'BDT'>('USD');
  const [paymentTerms, setPaymentTerms] = useState('LC at sight');
  const [shippingTerms, setShippingTerms] = useState<'FOB' | 'CIF' | 'CFR' | 'DDP'>('FOB');
  const [portOfDischarge, setPortOfDischarge] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');

  const fetchBuyers = async () => {
    try {
      const token = localStorage.getItem('garment_access_token');
      const res = await fetch('/api/v1/buyers', {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      const json = await res.json();
      if (json.success && json.data) {
        setBuyers(json.data);
      }
    } catch (e) {
      console.error('Failed to load buyers', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBuyers();
  }, []);

  const handleCreateBuyer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('garment_access_token');
      const res = await fetch('/api/v1/buyers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          name,
          code,
          country,
          currency,
          paymentTerms,
          shippingTerms,
          portOfDischarge: portOfDischarge || 'Port of Hamburg',
          contacts: contactName ? [{
            name: contactName,
            email: contactEmail || 'contact@buyer.com',
            phone: '+8801700000000',
            designation: 'Sourcing Lead'
          }] : []
        })
      });

      const json = await res.json();
      if (json.success) {
        setShowAddModal(false);
        fetchBuyers();
        // Reset form
        setName('');
        setCode('');
        setCountry('');
        setContactName('');
        setContactEmail('');
      } else {
        alert(json.error?.message || 'Failed to create buyer');
      }
    } catch (err: any) {
      alert(err.message || 'Error creating buyer');
    }
  };

  const filteredBuyers = buyers.filter(b => 
    b.name.toLowerCase().includes(search.toLowerCase()) ||
    b.code.toLowerCase().includes(search.toLowerCase()) ||
    b.country.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-violet-500/10 text-violet-400 border border-violet-500/30">
              MODULE 03
            </span>
            <span className="text-xs text-slate-400 font-mono">Commercial & Merchandising</span>
          </div>
          <h1 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
            Global Export Buyer Accounts
          </h1>
          <p className="text-xs text-slate-400">
            Manage international apparel brands, banking Letters of Credit (LC), Incoterms, and commercial contacts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-48 sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search buyers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-3.5 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-lg shadow-brand-600/20 flex items-center gap-1.5 transition-all shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add Buyer</span>
          </button>
        </div>
      </div>

      {/* Buyer Cards Grid */}
      {loading ? (
        <div className="p-8 flex items-center justify-center min-h-[300px]">
          <div className="flex items-center gap-2 text-brand-400 text-xs font-mono">
            <div className="w-4 h-4 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
            <span>Loading Global Buyer Accounts...</span>
          </div>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredBuyers.map((b) => (
            <div
              key={b.id}
              className="glass-panel p-5 rounded-2xl border border-slate-800 flex flex-col justify-between space-y-4 hover:border-slate-700 transition-all shadow-xl"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 font-bold shrink-0">
                      <ShoppingBag className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-white leading-tight">{b.name}</h3>
                      <span className="text-[10px] font-mono text-slate-400">{b.code}</span>
                    </div>
                  </div>
                  <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    <CheckCircle2 className="w-3 h-3" />
                    Active
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/80 border border-slate-800">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <Globe2 className="w-3.5 h-3.5 text-slate-500" />
                      Country & Currency:
                    </span>
                    <span className="font-semibold text-slate-200">
                      {b.country} ({b.currency})
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/80 border border-slate-800">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <CreditCard className="w-3.5 h-3.5 text-slate-500" />
                      Payment Terms:
                    </span>
                    <span className="font-semibold text-brand-400 truncate max-w-[140px]" title={b.paymentTerms}>
                      {b.paymentTerms}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/80 border border-slate-800">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <Ship className="w-3.5 h-3.5 text-slate-500" />
                      Incoterms & Discharge:
                    </span>
                    <span className="font-semibold text-slate-200">
                      {b.shippingTerms} • {b.portOfDischarge}
                    </span>
                  </div>
                </div>

                {/* Primary Contact */}
                {b.contacts?.[0] && (
                  <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] space-y-1">
                    <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">Buyer Liaison Contact</p>
                    <div className="flex items-center gap-2 text-slate-300">
                      <User className="w-3 h-3 text-slate-500" />
                      <span className="font-medium">{b.contacts[0].name}</span>
                      <span className="text-slate-400">({b.contacts[0].designation})</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400">
                      <Mail className="w-3 h-3 text-slate-500" />
                      <span className="font-mono text-[10px]">{b.contacts[0].email}</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
                <span>Account ID: {b.id}</span>
                <span className="text-brand-400 font-semibold cursor-pointer hover:underline">View Styles & POs &rarr;</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Buyer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Building2 className="w-4 h-4 text-brand-400" />
                Register New Buyer Account
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateBuyer} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Buyer Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Next Retail Ltd."
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Buyer Code</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. NEXT-UK"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-brand-500 uppercase font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Country</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. United Kingdom"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Trade Currency</label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value as any)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="BDT">BDT (৳)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Payment Terms</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. LC at sight 90 days"
                    value={paymentTerms}
                    onChange={(e) => setPaymentTerms(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Shipping Incoterm</label>
                  <select
                    value={shippingTerms}
                    onChange={(e) => setShippingTerms(e.target.value as any)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                  >
                    <option value="FOB">FOB (Free on Board)</option>
                    <option value="CIF">CIF (Cost, Insurance, Freight)</option>
                    <option value="CFR">CFR (Cost and Freight)</option>
                    <option value="DDP">DDP (Delivered Duty Paid)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Port of Discharge / Airport</label>
                <input
                  type="text"
                  placeholder="e.g. Port of Southampton"
                  value={portOfDischarge}
                  onChange={(e) => setPortOfDischarge(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>

              <div className="pt-2 border-t border-slate-800">
                <p className="text-[11px] font-bold text-slate-300 mb-2">Primary Sourcing Contact</p>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Contact full name"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                  <input
                    type="email"
                    placeholder="Contact official email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-brand-500 font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold shadow-lg shadow-brand-600/20"
                >
                  Save Buyer Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
