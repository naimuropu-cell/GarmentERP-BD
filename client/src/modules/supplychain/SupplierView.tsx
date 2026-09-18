import React, { useState, useEffect } from 'react';
import { 
  Truck, 
  Search, 
  Plus, 
  Star, 
  Clock, 
  Award, 
  Building2, 
  Phone, 
  Mail, 
  X, 
  Layers
} from 'lucide-react';
import { Supplier } from '../../types/supplyChain';

export const SupplierView: React.FC = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [category, setCategory] = useState<'FABRIC' | 'TRIMS' | 'ACCESSORIES' | 'CHEMICALS' | 'PACKAGING'>('FABRIC');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('Bangladesh');
  const [leadTimeDays, setLeadTimeDays] = useState(14);
  const [qualityRating, setQualityRating] = useState(4.8);
  const [onTimeDeliveryRate, setOnTimeDeliveryRate] = useState(96.0);
  const [paymentTerms, setPaymentTerms] = useState('LC 60 Days');
  const [contactPerson, setContactPerson] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [materials, setMaterials] = useState('');

  const fetchSuppliers = async () => {
    try {
      const token = localStorage.getItem('garment_access_token');
      const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await fetch('/api/v1/suppliers', { headers });
      const json = await res.json();
      if (json.success && json.data) {
        setSuppliers(json.data);
      }
    } catch (err) {
      console.error('Failed to load suppliers', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const handleCreateSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('garment_access_token');
      const materialsSupplied = materials.split(',').map(m => m.trim()).filter(Boolean);
      const res = await fetch('/api/v1/suppliers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          name,
          code,
          category,
          country,
          city,
          leadTimeDays: Number(leadTimeDays),
          qualityRating: Number(qualityRating),
          onTimeDeliveryRate: Number(onTimeDeliveryRate),
          paymentTerms,
          contactPerson,
          email,
          phone,
          materialsSupplied
        })
      });

      const json = await res.json();
      if (json.success) {
        setShowAddModal(false);
        setName('');
        setCode('');
        setCity('');
        setMaterials('');
        fetchSuppliers();
      } else {
        alert(json.error?.message || 'Failed to create supplier');
      }
    } catch (err) {
      console.error('Failed to register vendor', err);
    }
  };

  const filteredSuppliers = suppliers.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) || 
      s.code.toLowerCase().includes(search.toLowerCase()) ||
      s.city.toLowerCase().includes(search.toLowerCase());
    const matchCat = selectedCategory === 'ALL' || s.category === selectedCategory;
    return matchSearch && matchCat;
  });

  const avgQuality = (suppliers.reduce((acc, s) => acc + s.qualityRating, 0) / (suppliers.length || 1)).toFixed(2);
  const avgOtd = (suppliers.reduce((acc, s) => acc + s.onTimeDeliveryRate, 0) / (suppliers.length || 1)).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Header & Metrics */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <Truck className="h-6 w-6 text-emerald-400" />
            Certified RMG Raw Material Suppliers & Mill Directory
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Certified spinning, weaving, trims, and button vendors with live vendor scorecards, quality ratings & lead times.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-lg shadow-lg shadow-emerald-600/20 transition cursor-pointer shrink-0"
        >
          <Plus className="h-4 w-4" />
          Register Certified Supplier
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/50 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Suppliers</span>
            <Building2 className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white">{suppliers.length}</span>
            <span className="text-xs text-emerald-400 font-medium">100% Certified</span>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/50 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Avg Quality Rating</span>
            <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white">{avgQuality}</span>
            <span className="text-xs text-slate-400">/ 5.0 (AQL Passed)</span>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/50 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Avg On-Time Delivery</span>
            <Clock className="h-4 w-4 text-blue-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white">{avgOtd}%</span>
            <span className="text-xs text-emerald-400 font-medium">High Reliability</span>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/50 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Sourcing Categories</span>
            <Layers className="h-4 w-4 text-purple-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white">4</span>
            <span className="text-xs text-slate-400">Fabric, Trims, Acc, Pkg</span>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-slate-900/40 p-3 rounded-xl border border-slate-800">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search vendor by name, code, or city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 bg-slate-800/80 border border-slate-700/60 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          {['ALL', 'FABRIC', 'TRIMS', 'ACCESSORIES'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                selectedCategory === cat
                  ? 'bg-emerald-600 text-white shadow'
                  : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Supplier Grid */}
      {loading ? (
        <div className="text-center py-12 text-slate-500 text-sm">Loading certified suppliers...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredSuppliers.map((s) => (
            <div 
              key={s.id} 
              className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 hover:border-slate-700 transition flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-white">{s.name}</h3>
                      <span className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {s.code}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{s.city}, {s.country}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-semibold uppercase tracking-wider ${
                    s.category === 'FABRIC' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' :
                    s.category === 'TRIMS' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                    'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                  }`}>
                    {s.category}
                  </span>
                </div>

                {/* Scorecard Strip */}
                <div className="grid grid-cols-3 gap-2 p-2.5 rounded-lg bg-slate-800/40 border border-slate-800/80 text-center">
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">Quality</div>
                    <div className="text-sm font-bold text-amber-400 flex items-center justify-center gap-1 mt-0.5">
                      <Star className="h-3 w-3 fill-amber-400" />
                      {s.qualityRating.toFixed(2)}
                    </div>
                  </div>
                  <div className="border-x border-slate-700/60">
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">OTD %</div>
                    <div className="text-sm font-bold text-emerald-400 mt-0.5">
                      {s.onTimeDeliveryRate.toFixed(1)}%
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">Lead Time</div>
                    <div className="text-sm font-bold text-blue-400 mt-0.5">
                      {s.leadTimeDays} Days
                    </div>
                  </div>
                </div>

                {/* Materials Supplied */}
                <div className="space-y-1.5">
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Certified Materials:</div>
                  <div className="flex flex-wrap gap-1.5">
                    {s.materialsSupplied.map((mat, i) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-slate-800 text-[11px] text-slate-300 border border-slate-700/50">
                        {mat}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Contact Footer */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <div className="space-y-0.5">
                  <div className="text-slate-300 font-medium">{s.contactPerson}</div>
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1"><Mail className="h-3 w-3 text-slate-500" /> {s.email}</span>
                    <span className="flex items-center gap-1"><Phone className="h-3 w-3 text-slate-500" /> {s.phone}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="px-2 py-1 rounded bg-slate-800 text-[10px] font-mono text-slate-400">
                    {s.paymentTerms}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Supplier Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl p-6 shadow-2xl relative space-y-4 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
              <Award className="h-6 w-6 text-emerald-400" />
              <div>
                <h2 className="text-lg font-bold text-white">Register Certified Raw Material Supplier</h2>
                <p className="text-xs text-slate-400">Add verified textile, trims, or accessories vendor to factory database</p>
              </div>
            </div>

            <form onSubmit={handleCreateSupplier} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-300">Supplier Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Beximco Textiles Ltd."
                    className="mt-1 w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-300">Supplier Code</label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="e.g. BEXIMCO-BD"
                    className="mt-1 w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-300">Material Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="mt-1 w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="FABRIC">Fabric (Knit / Woven / Fleece)</option>
                    <option value="TRIMS">Trims (Zippers, Labels, Threads)</option>
                    <option value="ACCESSORIES">Accessories (Buttons, Polybags, Hangtags)</option>
                    <option value="CHEMICALS">Chemicals (Washing, Dyes)</option>
                    <option value="PACKAGING">Packaging (Cartons, Poly)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-300">Country</label>
                  <input
                    type="text"
                    required
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="Bangladesh"
                    className="mt-1 w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-300">City / Industrial Area</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Narayanganj / DEPZ Savar"
                    className="mt-1 w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-300">Lead Time (Days)</label>
                  <input
                    type="number"
                    min="1"
                    value={leadTimeDays}
                    onChange={(e) => setLeadTimeDays(Number(e.target.value))}
                    className="mt-1 w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-300">Quality Rating</label>
                  <input
                    type="number"
                    step="0.05"
                    min="1"
                    max="5"
                    value={qualityRating}
                    onChange={(e) => setQualityRating(Number(e.target.value))}
                    className="mt-1 w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-300">OTD %</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="100"
                    value={onTimeDeliveryRate}
                    onChange={(e) => setOnTimeDeliveryRate(Number(e.target.value))}
                    className="mt-1 w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-300">Payment Terms</label>
                  <input
                    type="text"
                    value={paymentTerms}
                    onChange={(e) => setPaymentTerms(e.target.value)}
                    placeholder="e.g. LC 60 Days"
                    className="mt-1 w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-300">Contact Person</label>
                  <input
                    type="text"
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    placeholder="Sales Rep Name"
                    className="mt-1 w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-300">Official Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="sales@vendor.com"
                    className="mt-1 w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-300">Phone</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+880..."
                    className="mt-1 w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300">Materials Supplied (comma-separated)</label>
                <input
                  type="text"
                  value={materials}
                  onChange={(e) => setMaterials(e.target.value)}
                  placeholder="e.g. 100% Cotton Pique, Single Jersey 180 GSM, Rib Knit"
                  className="mt-1 w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold rounded-lg transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-lg shadow-lg shadow-emerald-600/20 transition cursor-pointer"
                >
                  Save Supplier Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
