import React, { useState, useEffect } from 'react';
import { ShieldCheck, Check, X, Search, Sparkles } from 'lucide-react';
import { SystemRoleCode, User } from '../../types';

interface RbacMatrixViewProps {
  currentUser: User;
  onSimulateRole: (roleCode: SystemRoleCode) => void;
}

export const RbacMatrixView: React.FC<RbacMatrixViewProps> = ({ currentUser, onSimulateRole }) => {
  const [roles, setRoles] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const res = await fetch('/api/v1/auth/roles');
        const json = await res.json();
        if (json.success && json.data) {
          setRoles(json.data);
        }
      } catch (err) {
        console.error('Failed to load roles', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRoles();
  }, []);

  const corePermissions = [
    { code: 'users:manage', label: 'User & Role Sovereignty', group: 'Auth & Admin' },
    { code: 'org:manage', label: 'Configure Factory Lines & Floors', group: 'Organization' },
    { code: 'buyers:manage', label: 'Manage Buyer Profiles & Inquiries', group: 'Merchandising' },
    { code: 'styles:manage', label: 'Create Styles & Tech Packs', group: 'Merchandising' },
    { code: 'costing:approve', label: 'Approve Costing & Order Margin', group: 'Commercial' },
    { code: 'orders:approve', label: 'Approve Buyer Purchase Orders', group: 'Commercial' },
    { code: 'suppliers:manage', label: 'Supplier Profiles & RFQ Bidding', group: 'Procurement' },
    { code: 'inventory:issue', label: 'Issue Fabric & Accessories from Store', group: 'Warehouse' },
    { code: 'production:cutting', label: 'Issue Cut Orders & Numbered Bundles', group: 'Production' },
    { code: 'production:sewing', label: 'Sewing Line Balancing & Hourly Logs', group: 'Production' },
    { code: 'qc:inspect', label: 'Fabric 4-Point & Inline QC Audits', group: 'Quality' },
    { code: 'qc:aql_approve', label: 'Final AQL Sign-off & Shipment Lock', group: 'Quality' },
    { code: 'shipment:approve', label: 'Authorize Commercial Gate Pass', group: 'Logistics' },
    { code: 'audit:view', label: 'Inspect Non-Repudiable Audit Trails', group: 'Security' }
  ];

  const filteredRoles = roles.filter(r => 
    r.name.toLowerCase().includes(search.toLowerCase()) || 
    r.code.toLowerCase().includes(search.toLowerCase()) ||
    r.description.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-3 text-brand-400 font-mono text-sm">
          <div className="w-5 h-5 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          <span>Loading RBAC Matrix & Roles...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30">
              MODULE 01
            </span>
            <span className="text-xs text-slate-400 font-mono">Authentication & Role-Based Access Control</span>
          </div>
          <h1 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
            Enterprise RBAC Matrix & 14 Functional Personas
          </h1>
          <p className="text-xs text-slate-400">
            Granular permission governance guaranteeing segregation of duties between Merchandising, Procurement, Production, and QA/QC.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search roles..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>
      </div>

      {/* Grid of Roles */}
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredRoles.map((r) => {
          const isCurrent = currentUser.role.code === r.code;

          return (
            <div
              key={r.code}
              className={`p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-4 ${
                isCurrent 
                  ? 'bg-slate-900/90 border-brand-500 ring-1 ring-brand-500/30 shadow-xl' 
                  : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-slate-800 text-brand-400">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-white leading-tight">{r.name}</h3>
                      <span className="text-[10px] font-mono text-slate-400">{r.code}</span>
                    </div>
                  </div>
                  {isCurrent && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-brand-500/10 text-brand-400 border border-brand-500/30">
                      Active
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-400 leading-relaxed mb-4">{r.description}</p>

                {/* Permissions Breakdown Preview */}
                <div className="space-y-1.5 pt-3 border-t border-slate-800/80">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Granted Permissions ({r.permissions.length}):
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {r.permissions.slice(0, 5).map((p: string) => (
                      <span key={p} className="px-2 py-0.5 rounded text-[9px] font-mono bg-slate-800/80 text-slate-300 border border-slate-700">
                        {p}
                      </span>
                    ))}
                    {r.permissions.length > 5 && (
                      <span className="px-2 py-0.5 rounded text-[9px] font-mono bg-slate-800 text-slate-400">
                        +{r.permissions.length - 5} more
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <button
                onClick={() => onSimulateRole(r.code)}
                disabled={isCurrent}
                className={`w-full py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  isCurrent
                    ? 'bg-slate-800 text-slate-500 cursor-default'
                    : 'bg-slate-800 hover:bg-brand-600 text-slate-200 hover:text-white border border-slate-700 hover:border-brand-500'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                {isCurrent ? 'Currently Active Persona' : 'Simulate This Role'}
              </button>
            </div>
          );
        })}
      </div>

      {/* Interactive Permission Matrix Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden mt-8 shadow-xl">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white">Cross-Departmental Permission Governance</h3>
            <p className="text-xs text-slate-400">Verification matrix of operational privileges across the 14 personas.</p>
          </div>
          <span className="text-xs text-slate-400 font-mono">14 Roles • 45+ Permissions</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-900/90 text-slate-400 font-mono border-b border-slate-800">
                <th className="p-3.5 font-bold min-w-[220px]">Permission Capability</th>
                <th className="p-3.5 font-bold">Category</th>
                <th className="p-3.5 font-bold text-center">Super Admin</th>
                <th className="p-3.5 font-bold text-center">Merchandiser</th>
                <th className="p-3.5 font-bold text-center">QA Manager</th>
                <th className="p-3.5 font-bold text-center">Supervisor</th>
                <th className="p-3.5 font-bold text-center">Store Officer</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {corePermissions.map((perm) => (
                <tr key={perm.code} className="hover:bg-slate-850/50 transition-colors">
                  <td className="p-3.5 font-medium text-slate-200">
                    <p className="font-semibold text-slate-100">{perm.label}</p>
                    <p className="text-[10px] font-mono text-slate-500">{perm.code}</p>
                  </td>
                  <td className="p-3.5">
                    <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 font-mono border border-slate-700">
                      {perm.group}
                    </span>
                  </td>
                  <td className="p-3.5 text-center">
                    <Check className="w-4 h-4 text-emerald-400 mx-auto" />
                  </td>
                  <td className="p-3.5 text-center">
                    {['buyers:manage', 'styles:manage'].includes(perm.code) ? (
                      <Check className="w-4 h-4 text-emerald-400 mx-auto" />
                    ) : (
                      <X className="w-4 h-4 text-slate-600 mx-auto" />
                    )}
                  </td>
                  <td className="p-3.5 text-center">
                    {['qc:inspect', 'qc:aql_approve'].includes(perm.code) ? (
                      <Check className="w-4 h-4 text-emerald-400 mx-auto" />
                    ) : (
                      <X className="w-4 h-4 text-slate-600 mx-auto" />
                    )}
                  </td>
                  <td className="p-3.5 text-center">
                    {['production:cutting', 'production:sewing'].includes(perm.code) ? (
                      <Check className="w-4 h-4 text-emerald-400 mx-auto" />
                    ) : (
                      <X className="w-4 h-4 text-slate-600 mx-auto" />
                    )}
                  </td>
                  <td className="p-3.5 text-center">
                    {['inventory:issue'].includes(perm.code) ? (
                      <Check className="w-4 h-4 text-emerald-400 mx-auto" />
                    ) : (
                      <X className="w-4 h-4 text-slate-600 mx-auto" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
