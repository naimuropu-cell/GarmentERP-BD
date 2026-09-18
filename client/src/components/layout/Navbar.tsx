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
      case 'SUPER_ADMIN': return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'QA_MANAGER': 
      case 'QC_INSPECTOR': return 'bg-emerald-50 text-emerald-800 border-emerald-200 font-bold';
      case 'MERCHANDISER': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'PROD_PLANNER':
      case 'PROD_SUPERVISOR': return 'bg-amber-50 text-amber-800 border-amber-200';
      default: return 'bg-sky-50 text-sky-700 border-sky-200';
    }
  };

  return (
    <header className="h-16 border-b border-slate-200 bg-white shadow-sm px-6 flex items-center justify-between sticky top-0 z-40">
      {/* Brand & Factory Context */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-emerald-800 to-emerald-600 flex items-center justify-center shadow-md shadow-emerald-700/20">
            <Building2 className="w-5 h-5 text-white font-bold" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-tight text-slate-900">GarmentERP</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">BD</span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">Enterprise Apparel & QA System</p>
          </div>
        </div>

        {/* Factory Switcher */}
        <div className="hidden md:flex items-center gap-2 pl-4 border-l border-slate-200">
          <MapPin className="w-4 h-4 text-emerald-700" />
          <select 
            value={selectedFactory}
            onChange={(e) => onSelectFactory(e.target.value)}
            className="bg-slate-50 text-xs font-semibold text-slate-800 border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-600 cursor-pointer"
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
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 text-xs font-mono">
          <Clock className="w-3.5 h-3.5 text-emerald-600" />
          <span className="font-semibold">{time || '02:00:00 AM'}</span>
          <span className="text-[10px] text-slate-500">BST (UTC+6)</span>
        </div>

        {/* Quick Role Switcher for Testing/Demo */}
        <div className="relative">
          <button 
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-medium text-slate-800 transition-all shadow-sm cursor-pointer"
            title="Instant RBAC Role Switcher"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span className="hidden sm:inline text-slate-600">Role:</span>
            <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold border ${getRoleBadgeColor(user.role.code)}`}>
              {user.role.name}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showRoleMenu && (
            <div className="absolute right-0 mt-2 w-72 rounded-xl bg-white border border-slate-200 shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-3 py-1.5 border-b border-slate-100 mb-1">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Preview RBAC Persona</p>
                <p className="text-[10px] text-slate-400">Switch permissions dynamically</p>
              </div>
              <div className="max-h-72 overflow-y-auto px-1 space-y-1">
                {(Object.keys(DEMO_PROFILES) as SystemRoleCode[]).map((rCode) => (
                  <button
                    key={rCode}
                    onClick={() => {
                      onSwitchRole(rCode);
                      setShowRoleMenu(false);
                    }}
                    className={`w-full text-left px-2.5 py-2 rounded-lg text-xs flex items-center justify-between transition-colors cursor-pointer ${
                      user.role.code === rCode 
                        ? 'bg-emerald-50 text-emerald-800 font-bold border border-emerald-200' 
                        : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <div>
                      <p className="font-semibold">{DEMO_PROFILES[rCode].title}</p>
                      <p className="text-[10px] text-slate-500">{DEMO_PROFILES[rCode].dept}</p>
                    </div>
                    {user.role.code === rCode && <ShieldCheck className="w-4 h-4 text-emerald-700" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Notifications */}
        <button className="relative p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-600 ring-2 ring-white" />
        </button>

        {/* User Profile */}
        <div className="relative">
          <button 
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2.5 pl-2 hover:opacity-90 transition-opacity cursor-pointer"
          >
            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-emerald-800 to-emerald-700 flex items-center justify-center font-bold text-xs text-white border border-emerald-600 shadow-sm">
              {user.fullName.split(' ').map(n => n[0]).slice(0, 2).join('')}
            </div>
            <div className="hidden xl:block text-left">
              <p className="text-xs font-bold text-slate-900 leading-tight">{user.fullName}</p>
              <p className="text-[10px] text-slate-500 leading-tight">{user.email}</p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white border border-slate-200 shadow-xl py-2 z-50">
              <div className="px-4 py-2 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-900">{user.fullName}</p>
                <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
              </div>
              <div className="py-1">
                <div className="px-4 py-1.5 text-[11px] text-slate-600">
                  <span className="font-semibold text-slate-800">Active Permissions:</span> {user.role.permissions.length} granted
                </div>
              </div>
              <div className="border-t border-slate-100 pt-1">
                <button
                  onClick={onLogout}
                  className="w-full text-left px-4 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer"
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
