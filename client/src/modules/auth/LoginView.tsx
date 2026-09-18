import React, { useState } from 'react';
import { Building2, ShieldCheck, ArrowRight, Lock, Mail, CheckCircle, Sparkles } from 'lucide-react';
import { DEMO_PROFILES } from '../../services/api';
import { SystemRoleCode, User } from '../../types';

interface LoginViewProps {
  onLoginSuccess: (user: User) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('admin@garmenterp.com');
  const [password, setPassword] = useState('Admin123!');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const result = await response.json();
      if (result.success && result.data) {
        localStorage.setItem('garment_access_token', result.data.accessToken);
        onLoginSuccess(result.data.user);
      } else {
        setError(result.error?.message || 'Authentication failed. Check credentials.');
      }
    } catch (err: any) {
      // Offline fallback: find matching demo user
      const foundEntry = Object.entries(DEMO_PROFILES).find(([_, prof]) => prof.email.toLowerCase() === email.toLowerCase());
      if (foundEntry) {
        const [rCode, prof] = foundEntry;
        const mockUser: User = {
          id: `usr-${rCode.toLowerCase()}`,
          email: prof.email,
          fullName: `${prof.title} (Demo User)`,
          role: {
            code: rCode as SystemRoleCode,
            name: prof.title,
            description: prof.dept,
            permissions: rCode === 'SUPER_ADMIN' ? ['all'] : ['org:view', 'audit:view']
          },
          factories: [
            { id: 'fac-dhaka-01', name: 'Apex Garments — Dhaka Unit (Savar)', code: 'AG-SAVAR-01', division: 'Dhaka' },
            { id: 'fac-gazipur-02', name: 'Apex Garments — Gazipur Complex', code: 'AG-GAZI-02', division: 'Dhaka' }
          ]
        };
        onLoginSuccess(mockUser);
      } else {
        setError('Connection error or invalid credentials. Use a quick demo profile below.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (roleCode: SystemRoleCode) => {
    const prof = DEMO_PROFILES[roleCode];
    if (prof) {
      setEmail(prof.email);
      setPassword(prof.pass);
      setError(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background glowing gradients */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-4xl grid md:grid-cols-12 gap-8 z-10">
        {/* Left Form Panel */}
        <div className="md:col-span-7 bg-slate-900/90 border border-slate-800 p-8 rounded-2xl shadow-2xl backdrop-blur-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="h-11 w-11 rounded-xl bg-gradient-to-tr from-brand-600 to-emerald-400 flex items-center justify-center shadow-lg shadow-brand-500/25">
                <Building2 className="w-6 h-6 text-slate-950 font-bold" />
              </div>
              <div>
                <h1 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
                  GarmentERP <span className="text-brand-400">BD</span>
                </h1>
                <p className="text-xs text-slate-400">Bangladesh Garments Manufacturing & QA/QC Portal</p>
              </div>
            </div>

            <h2 className="text-lg font-bold text-slate-100 mb-1">Sign In to Workstation</h2>
            <p className="text-xs text-slate-400 mb-6">Enter enterprise credentials to access factory lines and quality audits.</p>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400 flex items-center gap-2">
                <span className="font-bold">Error:</span> {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Official Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
                    placeholder="name@garmenterp.com"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-300">Access Key / Password</label>
                  <span className="text-[11px] text-brand-400 hover:underline cursor-pointer">Forgot password?</span>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all font-mono"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-brand-600/30 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
              >
                {loading ? 'Authenticating with RBAC...' : (
                  <>
                    <span>Enter Workstation</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="mt-8 pt-4 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-500">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <CheckCircle className="w-3.5 h-3.5" />
              OWASP & JWT Secured
            </span>
            <span>Asia/Dhaka Standard Time</span>
          </div>
        </div>

        {/* Right Quick-Persona Switcher Panel */}
        <div className="md:col-span-5 flex flex-col justify-between space-y-4">
          <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl backdrop-blur-xl">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Instant 1-Click Role Profiles</h3>
            </div>
            <p className="text-[11px] text-slate-400 mb-4">
              Select any role to auto-populate credentials and test access permissions instantly:
            </p>

            <div className="space-y-2">
              {[
                { code: 'SUPER_ADMIN' as SystemRoleCode, badge: 'Full Sovereignty', border: 'border-rose-500/30 hover:bg-rose-500/10' },
                { code: 'FACTORY_ADMIN' as SystemRoleCode, badge: 'Savar GM', border: 'border-sky-500/30 hover:bg-sky-500/10' },
                { code: 'MERCHANDISER' as SystemRoleCode, badge: 'Buyer & Costing', border: 'border-violet-500/30 hover:bg-violet-500/10' },
                { code: 'QA_MANAGER' as SystemRoleCode, badge: 'AQL & Defect Sign-off', border: 'border-emerald-500/30 hover:bg-emerald-500/10' },
                { code: 'PROD_SUPERVISOR' as SystemRoleCode, badge: 'Floor 2 Lines', border: 'border-amber-500/30 hover:bg-amber-500/10' },
                { code: 'STORE_OFFICER' as SystemRoleCode, badge: 'Bonded Warehouse', border: 'border-teal-500/30 hover:bg-teal-500/10' }
              ].map(item => {
                const prof = DEMO_PROFILES[item.code];
                const isSelected = email.toLowerCase() === prof.email.toLowerCase();

                return (
                  <button
                    key={item.code}
                    type="button"
                    onClick={() => handleQuickFill(item.code)}
                    className={`w-full text-left p-2.5 rounded-xl border transition-all text-xs flex items-center justify-between ${
                      isSelected ? 'bg-slate-800 border-brand-500 shadow-md ring-1 ring-brand-500/30' : `bg-slate-800/40 border-slate-700/60 ${item.border}`
                    }`}
                  >
                    <div>
                      <p className="font-bold text-slate-200">{prof.title}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{prof.email}</p>
                    </div>
                    <span className="text-[9px] font-semibold px-2 py-0.5 rounded-md bg-slate-900 border border-slate-700 text-slate-300">
                      {item.badge}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/80 text-[11px] text-slate-400 flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-brand-400 shrink-0" />
            <span>Multi-tenant architecture configured for Bangladesh RMG production compliance.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
