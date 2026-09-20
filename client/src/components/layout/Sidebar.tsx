import React, { useState, useEffect } from 'react';
import { 
  ChevronDown, 
  Lock, 
  Search, 
  ChevronsLeft, 
  ChevronsRight,
  Layers
} from 'lucide-react';
import { User } from '../../types';
import { 
  MODULE_MENUS, 
  findModuleByTab, 
  getBadgeColorClass 
} from '../../navigation/navConfig';

interface SidebarProps {
  currentTab: string;
  currentSubTab?: string;
  onSelectTab: (tabId: string, subTab?: string) => void;
  user: User;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  currentTab, 
  currentSubTab, 
  onSelectTab, 
  user,
  isCollapsed = false,
  onToggleCollapse
}) => {
  // Track open accordion menus (module IDs)
  const activeMod = findModuleByTab(currentTab, currentSubTab);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    dashboard: true,
    [activeMod?.id || 'merchandising']: true
  });
  const [sidebarFilter, setSidebarFilter] = useState('');

  // Automatically expand module when active tab changes
  useEffect(() => {
    if (activeMod) {
      setOpenSections(prev => ({ ...prev, [activeMod.id]: true }));
    }
  }, [activeMod?.id]);

  const toggleSection = (moduleId: string) => {
    setOpenSections(prev => ({
      ...prev,
      [moduleId]: !prev[moduleId]
    }));
  };

  const expandAll = () => {
    const allOpen: Record<string, boolean> = {};
    MODULE_MENUS.forEach(m => { allOpen[m.id] = true; });
    setOpenSections(allOpen);
  };

  const collapseAll = () => {
    setOpenSections({ [activeMod?.id || 'dashboard']: true });
  };

  // If collapsed to icon-only rail
  if (isCollapsed) {
    return (
      <aside className="w-16 border-r border-slate-200 bg-white flex flex-col justify-between shrink-0 select-none py-3 shadow-xs">
        <div className="flex flex-col items-center gap-2">
          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Expand Sidebar"
            >
              <ChevronsRight className="w-4 h-4" />
            </button>
          )}

          <div className="w-8 border-b border-slate-200 my-1" />

          {MODULE_MENUS.map((menu) => {
            const Icon = menu.icon;
            const isCurrentModule = activeMod?.id === menu.id;

            return (
              <button
                key={menu.id}
                onClick={() => onSelectTab(menu.items[0].id, menu.items[0].subTab)}
                className={`p-2.5 rounded-xl transition-all relative group cursor-pointer ${
                  isCurrentModule 
                    ? 'bg-emerald-700 text-white shadow-xs' 
                    : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
                }`}
                title={`${menu.title} (${menu.items.length} modules)`}
              >
                <Icon className="w-4 h-4" />
                {isCurrentModule && (
                  <span className="absolute right-1 top-1 w-1.5 h-1.5 rounded-full bg-emerald-400" />
                )}
              </button>
            );
          })}
        </div>

        <div className="flex justify-center text-[9px] font-bold text-slate-400">
          v1.0
        </div>
      </aside>
    );
  }

  return (
    <aside className="w-68 border-r border-slate-200 bg-white flex flex-col justify-between shrink-0 select-none overflow-hidden shadow-xs">
      {/* Top Sidebar Header with Filter & Expand/Collapse Toggles */}
      <div className="p-3 border-b border-slate-100 bg-slate-50/50 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-emerald-700" />
            Navigation Tree
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={expandAll}
              className="text-[10px] text-slate-400 hover:text-slate-700 px-1.5 py-0.5 rounded hover:bg-slate-200/50 cursor-pointer"
              title="Expand all sections"
            >
              Expand
            </button>
            <span className="text-slate-300">|</span>
            <button
              onClick={collapseAll}
              className="text-[10px] text-slate-400 hover:text-slate-700 px-1.5 py-0.5 rounded hover:bg-slate-200/50 cursor-pointer"
              title="Collapse non-active sections"
            >
              Collapse
            </button>
            {onToggleCollapse && (
              <button
                onClick={onToggleCollapse}
                className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 cursor-pointer ml-1"
                title="Minimize Sidebar"
              >
                <ChevronsLeft className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Instant Filter */}
        <div className="relative">
          <Search className="w-3 h-3 text-slate-400 absolute left-2.5 top-2.5" />
          <input
            type="text"
            value={sidebarFilter}
            onChange={(e) => setSidebarFilter(e.target.value)}
            placeholder="Filter menus & submenus..."
            className="w-full pl-7 pr-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-600 shadow-2xs"
          />
        </div>
      </div>

      {/* Accordion Menu List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {MODULE_MENUS.map((menu) => {
          const Icon = menu.icon;
          const isCurrentModule = activeMod?.id === menu.id;
          const isOpen = openSections[menu.id] || sidebarFilter.trim() !== '';

          // Filter items if search is active
          const filteredItems = sidebarFilter.trim() === '' 
            ? menu.items 
            : menu.items.filter(i => 
                i.label.toLowerCase().includes(sidebarFilter.toLowerCase()) ||
                i.description.toLowerCase().includes(sidebarFilter.toLowerCase()) ||
                menu.title.toLowerCase().includes(sidebarFilter.toLowerCase())
              );

          if (sidebarFilter.trim() !== '' && filteredItems.length === 0) {
            return null;
          }

          // Single item dashboard module
          if (menu.id === 'dashboard') {
            const isCurrent = currentTab === 'overview';
            return (
              <button
                key={menu.id}
                onClick={() => onSelectTab('overview')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isCurrent 
                    ? 'bg-emerald-800 text-white shadow-xs' 
                    : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isCurrent ? 'text-emerald-200' : 'text-slate-500'}`} />
                  <span>Executive Plant Overview</span>
                </div>
                {isCurrent && <span className="w-1.5 h-1.5 rounded-full bg-emerald-300" />}
              </button>
            );
          }

          return (
            <div 
              key={menu.id} 
              className={`rounded-xl border transition-all ${
                isCurrentModule 
                  ? 'border-emerald-200/80 bg-emerald-50/20' 
                  : 'border-slate-100 bg-white'
              }`}
            >
              {/* Module Header / Accordion Button */}
              <button
                type="button"
                onClick={() => toggleSection(menu.id)}
                className={`w-full flex items-center justify-between px-3 py-2 text-left rounded-xl transition-colors cursor-pointer group ${
                  isCurrentModule 
                    ? 'text-emerald-950 font-bold' 
                    : 'text-slate-700 hover:bg-slate-50 font-semibold'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`p-1 rounded-md shrink-0 ${
                    isCurrentModule 
                      ? 'bg-emerald-100 text-emerald-800' 
                      : 'bg-slate-100 text-slate-500 group-hover:text-emerald-700'
                  }`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs truncate">{menu.shortTitle}</span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full font-mono bg-slate-100 text-slate-500">
                    {filteredItems.length}
                  </span>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                    isOpen ? 'rotate-180 text-slate-600' : ''
                  }`} />
                </div>
              </button>

              {/* Submenus List */}
              {isOpen && (
                <div className="px-2 pb-2 pt-0.5 space-y-0.5 border-t border-slate-100/80">
                  {filteredItems.map((item) => {
                    const SubIcon = item.icon;
                    const isCurrent = (currentTab === item.id) && (!item.subTab || currentSubTab === item.subTab);
                    const hasPermission = !item.permission || user.role.code === 'SUPER_ADMIN' || user.role.permissions.includes(item.permission);

                    if (!hasPermission) {
                      return (
                        <div
                          key={`${item.id}-${item.subTab || ''}`}
                          className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs text-slate-400 opacity-50 cursor-not-allowed"
                          title="Access restricted by role permissions"
                        >
                          <div className="flex items-center gap-2 truncate">
                            <SubIcon className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                            <span className="truncate text-[11px]">{item.shortLabel || item.label}</span>
                          </div>
                          <Lock className="w-3 h-3 text-slate-400" />
                        </div>
                      );
                    }

                    return (
                      <button
                        key={`${item.id}-${item.subTab || ''}`}
                        type="button"
                        onClick={() => onSelectTab(item.id, item.subTab)}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                          isCurrent
                            ? 'bg-emerald-800 text-white font-bold shadow-xs'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                        }`}
                        title={item.description}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <SubIcon className={`w-3.5 h-3.5 shrink-0 ${isCurrent ? 'text-emerald-200' : 'text-slate-400'}`} />
                          <span className="truncate text-[11px]">{item.shortLabel || item.label}</span>
                        </div>

                        {item.badge && (
                          <span className={`text-[8px] font-bold px-1 py-0.2 rounded shrink-0 ${
                            isCurrent 
                              ? 'bg-emerald-900/60 text-emerald-100 border border-emerald-700' 
                              : getBadgeColorClass(item.badgeColor)
                          }`}>
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Sidebar Footer */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/70">
        <div className="flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-slate-700">GarmentERP BD</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          </div>
          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-white border border-slate-200 text-slate-600 shadow-2xs">
            v1.0.0
          </span>
        </div>
        <p className="text-[10px] text-slate-400 mt-1 font-medium">Production Architecture Active</p>
      </div>
    </aside>
  );
};
