import React, { useState, useEffect, useRef } from 'react';
import { 
  Building2, 
  Clock, 
  ShieldCheck, 
  Bell, 
  LogOut, 
  ChevronDown, 
  Sparkles, 
  MapPin,
  Search,
  ChevronRight,
  Command,
  X,
  CheckCircle2,
  Lock
} from 'lucide-react';
import { User, SystemRoleCode } from '../../types';
import { DEMO_PROFILES } from '../../services/api';
import { 
  MODULE_MENUS, 
  SubMenuItem, 
  findModuleByTab, 
  findSubmenuItem, 
  getBadgeColorClass 
} from '../../navigation/navConfig';
import { useLanguage } from '../../context/LanguageContext';

interface NavbarProps {
  user: User;
  currentTab: string;
  currentSubTab?: string;
  onSelectTab: (tabId: string, subTab?: string) => void;
  onLogout: () => void;
  onSwitchRole: (roleCode: SystemRoleCode) => void;
  selectedFactory: string;
  onSelectFactory: (id: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  currentTab,
  currentSubTab,
  onSelectTab,
  onLogout,
  onSwitchRole,
  selectedFactory,
  onSelectFactory
}) => {
  const { language, toggleLanguage, t, toBengaliNumber } = useLanguage();
  const [time, setTime] = useState('');
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const menubarRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Live Bangladesh BST Local Clock (Bilingual English & Bengali)
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      if (language === 'bn') {
        const rawTime = now.toLocaleTimeString('en-US', { 
          timeZone: 'Asia/Dhaka', 
          hour12: true, 
          hour: '2-digit', 
          minute: '2-digit', 
          second: '2-digit' 
        });
        const isPM = rawTime.includes('PM');
        const timeDigits = rawTime.replace(/\s*(AM|PM)/i, '');
        const bnDigits = toBengaliNumber(timeDigits);
        setTime(`${bnDigits} ${isPM ? 'অপরাহ্ন' : 'পূর্বাহ্ন'}`);
      } else {
        setTime(now.toLocaleTimeString('en-US', { 
          timeZone: 'Asia/Dhaka', 
          hour12: true, 
          hour: '2-digit', 
          minute: '2-digit', 
          second: '2-digit' 
        }));
      }
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [language, toBengaliNumber]);

  // Global Click-Outside & Escape key listener for open menus and modals
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menubarRef.current && !menubarRef.current.contains(e.target as Node)) {
        setOpenMenuId(null);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpenMenuId(null);
        setShowRoleMenu(false);
        setShowUserMenu(false);
        setShowSearchModal(false);
      }
      // Ctrl+K or Cmd+K shortcut for quick command finder
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setShowSearchModal(prev => !prev);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Auto-focus search input when modal opens
  useEffect(() => {
    if (showSearchModal) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    } else {
      setSearchQuery('');
    }
  }, [showSearchModal]);

  const activeModule = findModuleByTab(currentTab, currentSubTab);
  const activeSubmenu = findSubmenuItem(currentTab, currentSubTab);

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

  const handleMenuClick = (menuId: string) => {
    // If it's dashboard, navigate directly and close
    if (menuId === 'dashboard') {
      onSelectTab('overview');
      setOpenMenuId(null);
      return;
    }
    // Toggle menu
    setOpenMenuId(prev => (prev === menuId ? null : menuId));
  };

  const handleSubmenuSelect = (item: SubMenuItem) => {
    onSelectTab(item.id, item.subTab);
    setOpenMenuId(null);
  };

  // Filtered submenus for Quick Search Modal
  const allSubmenus = MODULE_MENUS.flatMap(m => 
    m.items.map(item => ({ ...item, parentModule: m }))
  );

  const searchResults = searchQuery.trim() === '' 
    ? allSubmenus 
    : allSubmenus.filter(item => 
        item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.parentModule.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.badge && item.badge.toLowerCase().includes(searchQuery.toLowerCase()))
      );

  return (
    <header className="border-b border-slate-200 bg-white sticky top-0 z-40 shadow-xs select-none">
      {/* ========================================================================= */}
      {/* TIER 1: BRANDING & UTILITY BAR (Corporate Header) */}
      {/* ========================================================================= */}
      <div className="h-14 px-5 flex items-center justify-between border-b border-slate-100">
        {/* Left: Brand Identity & Plant Context */}
        <div className="flex items-center gap-5">
          {/* Logo & Platform Name */}
          <div 
            onClick={() => onSelectTab('overview')}
            className="flex items-center gap-2.5 cursor-pointer group"
            title="GarmentERP BD — Return to Dashboard"
          >
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-emerald-800 via-emerald-700 to-emerald-600 flex items-center justify-center shadow-md shadow-emerald-700/20 group-hover:scale-105 transition-transform">
              <Building2 className="w-5 h-5 text-white font-bold" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base tracking-tight text-slate-900 group-hover:text-emerald-800 transition-colors">
                  GarmentERP
                </span>
                <span className="px-1.5 py-0.2 rounded text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-0.5">
                  BD
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-600 inline-block ml-0.5" title="Bangladesh Sovereign Edition" />
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium tracking-tight">{t('brand_tagline', 'Enterprise Apparel & QA System')}</p>
            </div>
          </div>

          {/* Factory Plant Switcher */}
          <div className="hidden md:flex items-center gap-2 pl-4 border-l border-slate-200">
            <div className="p-1 rounded-md bg-emerald-50 text-emerald-700">
              <MapPin className="w-3.5 h-3.5" />
            </div>
            <select 
              value={selectedFactory}
              onChange={(e) => onSelectFactory(e.target.value)}
              className="bg-slate-50 text-xs font-semibold text-slate-800 border border-slate-200 rounded-lg px-2.5 py-1 focus:outline-none focus:ring-1 focus:ring-emerald-600 cursor-pointer hover:bg-slate-100 transition-colors"
            >
              {user.factories.map(f => (
                <option key={f.id} value={f.id}>
                  {language === 'bn' 
                    ? (f.code === 'AG-SAVAR-01' ? 'এপেক্স গার্মেন্টস — ঢাকা ইউনিট (সাভার)' : 'এপেক্স গার্মেন্টস — গাজীপুর কমপ্লেক্স')
                    : f.name} ({f.code})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Center: Quick Command Finder Trigger */}
        <div className="hidden lg:block max-w-sm w-full mx-4">
          <button
            onClick={() => setShowSearchModal(true)}
            className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-400 hover:text-slate-600 text-xs transition-all cursor-pointer shadow-2xs group"
          >
            <div className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-700 transition-colors" />
              <span className="text-slate-500 font-medium">{t('quick_find_placeholder', 'Quick find module, order, QC audit...')}</span>
            </div>
            <kbd className="hidden xl:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono bg-white border border-slate-200 rounded text-slate-500 shadow-2xs">
              <Command className="w-2.5 h-2.5" /> K
            </kbd>
          </button>
        </div>

        {/* Right: Language Switcher, Bangladesh Local Clock, Role Persona, Status & User Menu */}
        <div className="flex items-center gap-2.5">
          {/* Language Switcher (EN / বাংলা) */}
          <button 
            type="button"
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-800 transition-all cursor-pointer shadow-2xs group"
            title={language === 'en' ? 'বাংলা ভাষায় পরিবর্তন করুন (Switch to Bangla)' : 'Switch to English language'}
          >
            <span className="text-xs">🌐</span>
            <span className={`text-[11px] font-bold ${language === 'en' ? 'text-emerald-800 underline decoration-2' : 'text-slate-400'}`}>EN</span>
            <span className="text-slate-300 text-[10px]">|</span>
            <span className={`text-[11px] font-bold ${language === 'bn' ? 'text-emerald-800 underline decoration-2' : 'text-slate-400'}`}>বাংলা</span>
          </button>

          {/* Bangladesh Local Clock */}
          <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 text-xs font-mono">
            <Clock className="w-3.5 h-3.5 text-emerald-600" />
            <span className="font-semibold">{time || (language === 'bn' ? '০২:০০:০০ পূর্বাহ্ন' : '02:00:00 AM')}</span>
            <span className="text-[10px] text-slate-400 uppercase font-medium">{t('bst_timezone', 'BST (+6)')}</span>
          </div>

          {/* Quick RBAC Role Switcher */}
          <div className="relative">
            <button 
              onClick={() => {
                setShowRoleMenu(!showRoleMenu);
                setShowUserMenu(false);
                setOpenMenuId(null);
              }}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-medium text-slate-800 transition-all cursor-pointer shadow-2xs"
              title="Instant RBAC Role Switcher"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span className="hidden sm:inline text-slate-500 text-[11px]">{t('role_label', 'Role:')}</span>
              <span className={`px-1.5 py-0.2 rounded text-[11px] font-bold border ${getRoleBadgeColor(user.role.code)}`}>
                {t(`role_${user.role.code}`, user.role.name)}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {showRoleMenu && (
              <div className="absolute right-0 mt-2 w-72 rounded-xl bg-white border border-slate-200 shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-3 py-1.5 border-b border-slate-100 mb-1">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{t('role_preview_title', 'Preview RBAC Persona')}</p>
                  <p className="text-[10px] text-slate-400">{t('role_preview_desc', 'Switch permissions across 14 Garment ERP roles')}</p>
                </div>
                <div className="max-h-72 overflow-y-auto px-1 space-y-1">
                  {(Object.keys(DEMO_PROFILES) as SystemRoleCode[]).map((rCode) => (
                    <button
                      key={rCode}
                      onClick={() => {
                        onSwitchRole(rCode);
                        setShowRoleMenu(false);
                      }}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors cursor-pointer ${
                        user.role.code === rCode 
                          ? 'bg-emerald-50 text-emerald-800 font-bold border border-emerald-200' 
                          : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      <div>
                        <p className="font-semibold">{t(`role_${rCode}`, DEMO_PROFILES[rCode].title)}</p>
                        <p className="text-[10px] text-slate-500">{DEMO_PROFILES[rCode].dept}</p>
                      </div>
                      {user.role.code === rCode && <ShieldCheck className="w-4 h-4 text-emerald-700" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* System Pulse Indicator */}
          <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-md bg-emerald-50 border border-emerald-200/60 text-emerald-800 text-[11px] font-semibold" title="API Status: Healthy (96/96 Integration Tests Passing)">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
            </span>
            <span>{t('status_online', 'Online')}</span>
          </div>

          {/* Plant Notifications Bell */}
          <button 
            onClick={() => onSelectTab('analytics', 'alerts')}
            className="relative p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
            title="View Real-Time Plant Alerts"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-600 ring-2 ring-white" />
          </button>

          {/* User Profile Avatar & Menu */}
          <div className="relative">
            <button 
              onClick={() => {
                setShowUserMenu(!showUserMenu);
                setShowRoleMenu(false);
                setOpenMenuId(null);
              }}
              className="flex items-center gap-2 pl-1 hover:opacity-90 transition-opacity cursor-pointer"
            >
              <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-emerald-800 to-emerald-700 flex items-center justify-center font-bold text-xs text-white border border-emerald-600 shadow-sm">
                {user.fullName.split(' ').map(n => n[0]).slice(0, 2).join('')}
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-60 rounded-xl bg-white border border-slate-200 shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-4 py-2 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-900 leading-tight">{user.fullName}</p>
                  <p className="text-[11px] text-slate-500 truncate mt-0.5">{user.email}</p>
                </div>
                <div className="py-2 px-4 space-y-1 text-[11px] text-slate-600 border-b border-slate-100">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Department:</span>
                    <span className="font-semibold text-slate-700">{user.role.description}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Active Permissions:</span>
                    <span className="font-semibold text-emerald-700">{user.role.permissions.length} granted</span>
                  </div>
                </div>
                <div className="pt-1">
                  <button
                    onClick={onLogout}
                    className="w-full text-left px-4 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Sign Out Session
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TIER 2: PROFESSIONAL ENTERPRISE MENUBAR & SUBMENU ENGINE */}
      {/* ========================================================================= */}
      <div 
        ref={menubarRef}
        className="relative bg-white px-4 flex items-center justify-between border-b border-slate-200 text-xs font-medium overflow-visible"
      >
        {/* Horizontal List of Module Menus */}
        <nav className="flex items-center gap-1 py-1.5 overflow-visible">
          {MODULE_MENUS.map((menu) => {
            const Icon = menu.icon;
            const isMenuOpen = openMenuId === menu.id;
            const isCurrentModule = activeModule?.id === menu.id;
            const isDashboard = menu.id === 'dashboard';

            return (
              <div key={menu.id} className="relative shrink-0">
                {/* Module Menu Button */}
                <button
                  type="button"
                  onClick={() => handleMenuClick(menu.id)}
                  onMouseEnter={() => {
                    if (openMenuId !== null && openMenuId !== menu.id && !isDashboard) {
                      setOpenMenuId(menu.id);
                    }
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    isMenuOpen
                      ? 'bg-emerald-800 text-white shadow-sm ring-1 ring-emerald-900 font-bold'
                      : isCurrentModule
                        ? 'bg-emerald-50 text-emerald-900 font-bold border border-emerald-200 shadow-2xs'
                        : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                  aria-expanded={isMenuOpen}
                  aria-haspopup={!isDashboard}
                >
                  <Icon className={`w-3.5 h-3.5 shrink-0 ${
                    isMenuOpen 
                      ? 'text-emerald-200' 
                      : isCurrentModule 
                        ? 'text-emerald-700' 
                        : 'text-slate-500'
                  }`} />
                  
                  <span>{t('module_' + menu.id, menu.shortTitle)}</span>

                  {!isDashboard && (
                    <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${
                      isMenuOpen ? 'rotate-180 text-emerald-200' : 'text-slate-400'
                    }`} />
                  )}

                  {isCurrentModule && !isMenuOpen && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shadow-2xs" />
                  )}
                </button>

                {/* ================================================================= */}
                {/* FLOATING SUBMENU PANEL (Opens on clicking Module Name/Menu) */}
                {/* ================================================================= */}
                {isMenuOpen && !isDashboard && (
                  <div 
                    className={`absolute ${menu.id === 'admin' || menu.id === 'analytics' ? 'right-0' : 'left-0'} top-full mt-1.5 w-[380px] sm:w-[420px] rounded-2xl bg-white border border-slate-200/90 shadow-2xl z-50 p-3.5 animate-in fade-in zoom-in-95 duration-150`}
                  >
                    {/* Submenu Header banner */}
                    <div className="flex items-start justify-between pb-3 mb-2.5 border-b border-slate-100">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-900 text-sm">{t('module_' + menu.id + '_full', menu.title)}</h4>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                            {menu.phaseBadge}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{menu.description}</p>
                        <button
                          type="button"
                          onClick={() => {
                            onSelectTab(menu.defaultTabId);
                            setOpenMenuId(null);
                          }}
                          className="text-[11px] font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 mt-1 hover:underline cursor-pointer"
                        >
                          <span>{t('open_module_view', 'Open Full Department →')}</span>
                        </button>
                      </div>
                      <button 
                        onClick={(e) => { e.stopPropagation(); setOpenMenuId(null); }}
                        className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                        title="Close menu"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>


                    {/* Submenus List */}
                    <div className="space-y-1.5 max-h-[440px] overflow-y-auto pr-1">
                      {menu.items.map((item) => {
                        const SubIcon = item.icon;
                        const isSubActive = (currentTab === item.id) && (!item.subTab || currentSubTab === item.subTab);
                        const hasPermission = !item.permission || user.role.code === 'SUPER_ADMIN' || user.role.permissions.includes(item.permission);

                        if (!hasPermission) {
                          return (
                            <div 
                              key={`${item.id}-${item.subTab || ''}`}
                              className="p-2.5 rounded-xl border border-slate-100 bg-slate-50/70 text-slate-400 opacity-60 flex items-start gap-3 cursor-not-allowed"
                              title="Access restricted by role permissions"
                            >
                              <div className="p-2 rounded-lg bg-slate-100 text-slate-400 mt-0.5">
                                <Lock className="w-4 h-4" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <span className="font-semibold text-xs text-slate-500">{item.label}</span>
                                  <span className="text-[10px] text-slate-400">Locked</span>
                                </div>
                                <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">{item.description}</p>
                              </div>
                            </div>
                          );
                        }

                        return (
                          <button
                            key={`${item.id}-${item.subTab || ''}`}
                            type="button"
                            onClick={() => handleSubmenuSelect(item)}
                            className={`w-full text-left p-2.5 rounded-xl border transition-all flex items-start gap-3 group cursor-pointer ${
                              isSubActive
                                ? 'bg-emerald-50/80 border-emerald-300 ring-1 ring-emerald-400/40 shadow-xs'
                                : 'border-slate-100 hover:border-slate-300 hover:bg-slate-50/80'
                            }`}
                          >
                            {/* Submenu Icon */}
                            <div className={`p-2 rounded-lg shrink-0 transition-colors ${
                              isSubActive 
                                ? 'bg-emerald-600 text-white shadow-xs' 
                                : 'bg-slate-100 text-slate-600 group-hover:bg-emerald-50 group-hover:text-emerald-700'
                            }`}>
                              <SubIcon className="w-4 h-4" />
                            </div>

                            {/* Submenu Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-1">
                                <span className={`font-semibold text-xs transition-colors ${
                                  isSubActive ? 'text-emerald-950 font-bold' : 'text-slate-800 group-hover:text-emerald-800'
                                }`}>
                                  {t('sub_' + item.id.replace(/-/g, '_'), item.label)}
                                </span>

                                {item.badge && (
                                  <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold border shrink-0 ${getBadgeColorClass(item.badgeColor)}`}>
                                    {item.badge}
                                  </span>
                                )}
                              </div>

                              <p className="text-[11px] text-slate-500 mt-0.5 leading-snug line-clamp-2">
                                {item.description}
                              </p>
                            </div>

                            {/* Active Check indicator */}
                            {isSubActive && (
                              <div className="shrink-0 self-center text-emerald-700">
                                <CheckCircle2 className="w-4 h-4" />
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* Submenu Footer */}
                    <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                      <span>{menu.items.length} specialized modules</span>
                      <span className="font-mono">{t('esc_to_close', 'Press Esc to close')}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Right side of Menubar: Active Path Breadcrumbs */}
        <div className="hidden lg:flex items-center gap-1 text-[11px] text-slate-400 py-1 pl-4 shrink-0 font-medium">
          <span className="text-slate-500 font-semibold">{t('brand_name', 'GarmentERP')}</span>
          <ChevronRight className="w-3 h-3 text-slate-300" />
          <span className="text-slate-600">{t('module_' + (activeModule?.id || 'dashboard'), activeModule?.shortTitle || 'Plant')}</span>
          <ChevronRight className="w-3 h-3 text-slate-300" />
          <span className="text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            {t('sub_' + (activeSubmenu?.id.replace(/-/g, '_') || 'overview'), activeSubmenu?.shortLabel || activeSubmenu?.label || 'Overview')}
          </span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* QUICK COMMAND PALETTE MODAL (Ctrl+K) */}
      {/* ========================================================================= */}
      {showSearchModal && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs z-50 flex items-start justify-center pt-20 p-4">
          <div 
            className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Search Input Box */}
            <div className="p-3.5 border-b border-slate-200 flex items-center gap-3 bg-slate-50/50">
              <Search className="w-5 h-5 text-emerald-700 shrink-0" />
              <input 
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('quick_find_placeholder', 'Search any Garment ERP module, feature, tech pack, QC audit, payroll...')}
                className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none font-medium"
              />
              <button 
                onClick={() => setShowSearchModal(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200/60"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Results List */}
            <div className="max-h-96 overflow-y-auto p-2 space-y-1">
              {searchResults.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs">
                  No matching module or feature found for "<span className="font-semibold text-slate-600">{searchQuery}</span>"
                </div>
              ) : (
                searchResults.map((item) => {
                  const ItemIcon = item.icon;
                  const isCurrent = (currentTab === item.id) && (!item.subTab || currentSubTab === item.subTab);

                  return (
                    <button
                      key={`${item.parentModule.id}-${item.id}-${item.subTab || ''}`}
                      onClick={() => {
                        onSelectTab(item.id, item.subTab);
                        setShowSearchModal(false);
                      }}
                      className={`w-full text-left p-2.5 rounded-xl transition-colors flex items-center justify-between group cursor-pointer ${
                        isCurrent 
                          ? 'bg-emerald-50 text-emerald-900 border border-emerald-200' 
                          : 'hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`p-2 rounded-lg shrink-0 ${
                          isCurrent ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600 group-hover:bg-emerald-50 group-hover:text-emerald-700'
                        }`}>
                          <ItemIcon className="w-4 h-4" />
                        </div>
                        <div className="truncate">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-slate-900">{item.label}</span>
                            <span className="text-[10px] text-slate-400">in {item.parentModule.title}</span>
                          </div>
                          <p className="text-[11px] text-slate-500 truncate">{item.description}</p>
                        </div>
                      </div>

                      {item.badge && (
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold border shrink-0 ${getBadgeColorClass(item.badgeColor)}`}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-2.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1.5">
                <kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-200 font-mono text-[10px]">Esc</kbd> to close
              </span>
              <span>26 Specialized Garment Manufacturing Modules</span>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
