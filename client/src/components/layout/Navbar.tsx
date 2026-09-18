import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Clock, 
  ShieldCheck, 
  Bell, 
  LogOut, 
  ChevronDown, 
  Sparkles,
  MapPin
} from 'lucide-react';
import { User, SystemRoleCode } from '../../types';
import { DEMO_PROFILES } from '../../services/api';

interface NavbarProps {
  user: User;
  onLogout: () => void;
  onSwitchRole: (roleCode: SystemRoleCode) => void;
  selectedFactory: string;
  onSelectFactory: (id: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  onLogout,
  onSwitchRole,
  selectedFactory,
  onSelectFactory
}) => {
  const [time, setTime] = useState('');
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-US', { timeZone: 'Asia/Dhaka', hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const getRoleBadgeColor = (code: SystemRoleCode) => {
    switch (code) {
      case 'SUPER_ADMIN': return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      case 'QA_MANAGER': 
      case 'QC_INSPECTOR': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'MERCHANDISER': return 'bg-violet-500/10 text-violet-400 border-violet-500/30';
      case 'PROD_PLANNER':
      case 'PROD_SUPERVISOR': return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      default: return 'bg-sky-500/10 text-sky-400 border-sky-500/30';
    }
  };

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-40">
      {/* Brand & Factory Context */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-brand-600 to-emerald-400 flex items-center justify-center shadow-lg shadow-brand-500/20">
            <Building2 className="w-5 h-5 text-slate-950 font-bold" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-tight text-white">GarmentERP</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">BD</span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Enterprise Apparel & QA System</p>
          </div>
        </div>

        {/* Factory Switcher */}
        <div className="hidden md:flex items-center gap-2 pl-4 border-l border-slate-800">
          <MapPin className="w-4 h-4 text-slate-400" />
          <select 
            value={selectedFactory}
            onChange={(e) => onSelectFactory(e.target.value)}
            className="bg-slate-800/80 text-xs font-semibold text-slate-200 border border-slate-700 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-brand-500 cursor-pointer"
          >
            {user.factories.map(f => (
              <option key={f.id} value={f.id}>
                {f.name} ({f.code})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Right Controls: Clock, Role Switcher, Profile */}
      <div className="flex items-center gap-4">
        {/* Bangladesh Local Clock */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/50 border border-slate-800 text-slate-300 text-xs font-mono">
          <Clock className="w-3.5 h-3.5 text-brand-500" />
          <span>{time || '02:00:00 AM'}</span>
          <span className="text-[10px] text-slate-500">BST (UTC+6)</span>
        </div>

        {/* Quick Role Switcher for Testing/Demo */}
        <div className="relative">
          <button 
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 border border-slate-700 text-xs font-medium text-slate-200 transition-all shadow-sm"
            title="Instant RBAC Role Switcher"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Role:</span>
            <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold border ${getRoleBadgeColor(user.role.code)}`}>
              {user.role.name}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showRoleMenu && (
            <div className="absolute right-0 mt-2 w-72 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-3 py-1.5 border-b border-slate-800 mb-1">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Preview RBAC Persona</p>
                <p className="text-[10px] text-slate-500">Switch permissions dynamically</p>
              </div>
              <div className="max-h-72 overflow-y-auto px-1 space-y-1">
                {(Object.keys(DEMO_PROFILES) as SystemRoleCode[]).map((rCode) => (
                  <button
                    key={rCode}
                    onClick={() => {
                      onSwitchRole(rCode);
                      setShowRoleMenu(false);
                    }}
                    className={`w-full text-left px-2.5 py-2 rounded-lg text-xs flex items-center justify-between transition-colors ${
                      user.role.code === rCode 
                        ? 'bg-brand-500/10 text-brand-400 font-semibold' 
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <div>
                      <p className="font-medium">{DEMO_PROFILES[rCode].title}</p>
                      <p className="text-[10px] text-slate-500">{DEMO_PROFILES[rCode].dept}</p>
                    </div>
                    {user.role.code === rCode && <ShieldCheck className="w-4 h-4 text-brand-500" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Notifications */}
        <button className="relative p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-brand-500 ring-2 ring-slate-900" />
        </button>

        {/* User Profile */}
        <div className="relative">
          <button 
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2.5 pl-2 hover:opacity-90 transition-opacity"
          >
            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-slate-700 to-slate-600 flex items-center justify-center font-bold text-xs text-white border border-slate-600">
              {user.fullName.split(' ').map(n => n[0]).slice(0, 2).join('')}
            </div>
            <div className="hidden xl:block text-left">
              <p className="text-xs font-semibold text-white leading-tight">{user.fullName}</p>
              <p className="text-[10px] text-slate-400 leading-tight">{user.email}</p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl py-2 z-50">
              <div className="px-4 py-2 border-b border-slate-800">
                <p className="text-xs font-bold text-white">{user.fullName}</p>
                <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
              </div>
              <div className="py-1">
                <div className="px-4 py-1.5 text-[11px] text-slate-400">
                  <span className="font-semibold text-slate-300">Active Permissions:</span> {user.role.permissions.length} granted
                </div>
              </div>
              <div className="border-t border-slate-800 pt-1">
                <button
                  onClick={onLogout}
                  className="w-full text-left px-4 py-2 text-xs font-medium text-rose-400 hover:bg-rose-500/10 flex items-center gap-2"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
