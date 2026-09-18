import React, { useState, useEffect } from 'react';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { LoginView } from './modules/auth/LoginView';
import { OrganizationView } from './modules/organization/OrganizationView';
import { RbacMatrixView } from './modules/rbac/RbacMatrixView';
import { AuditView } from './modules/audit/AuditView';
import { OverviewDashboard } from './modules/dashboard/OverviewDashboard';
import { BuyerView } from './modules/merchandising/BuyerView';
import { StyleTechPackView } from './modules/merchandising/StyleTechPackView';
import { PurchaseOrderView } from './modules/merchandising/PurchaseOrderView';
import { CostingView } from './modules/merchandising/CostingView';
import { DEMO_PROFILES } from './services/api';
import { SystemRoleCode, User } from './types';

export const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentTab, setCurrentTab] = useState<string>('overview');
  const [selectedFactoryId, setSelectedFactoryId] = useState<string>('fac-dhaka-01');
  const [loading, setLoading] = useState(true);

  // Initialize session
  useEffect(() => {
    const initSession = async () => {
      const token = localStorage.getItem('garment_access_token');
      if (token) {
        try {
          const res = await fetch('/api/v1/auth/me', {
            headers: { Authorization: `Bearer ${token}` }
          });
          const json = await res.json();
          if (json.success && json.data) {
            setCurrentUser(json.data);
            if (json.data.factories?.[0]) {
              setSelectedFactoryId(json.data.factories[0].id);
            }
            setLoading(false);
            return;
          }
        } catch (e) {
          console.warn('Backend offline or token expired', e);
        }
      }

      // Default to Super Admin for seamless immediate demo
      const defaultProf = DEMO_PROFILES.SUPER_ADMIN;
      setCurrentUser({
        id: 'usr-admin-01',
        email: defaultProf.email,
        fullName: 'Engr. Naimur Rahman (System Architect)',
        phone: '+8801700000001',
        role: {
          code: 'SUPER_ADMIN',
          name: 'Super Administrator',
          description: 'System owner with full platform sovereignty and audit privileges',
          permissions: ['all']
        },
        factories: [
          { id: 'fac-dhaka-01', name: 'Apex Garments — Dhaka Unit (Savar)', code: 'AG-SAVAR-01', division: 'Dhaka' },
          { id: 'fac-gazipur-02', name: 'Apex Garments — Gazipur Complex', code: 'AG-GAZI-02', division: 'Dhaka' }
        ]
      });
      setLoading(false);
    };

    initSession();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('garment_access_token');
    setCurrentUser(null);
  };

  const handleSwitchRole = (roleCode: SystemRoleCode) => {
    const prof = DEMO_PROFILES[roleCode];
    if (!prof) return;

    const mockPermissions: Record<SystemRoleCode, string[]> = {
      SUPER_ADMIN: ['all'],
      FACTORY_ADMIN: ['users:view', 'org:manage', 'org:view', 'audit:view'],
      MANAGEMENT: ['org:view', 'audit:view', 'costing:approve', 'orders:approve'],
      MERCHANDISER: ['org:view', 'buyers:manage', 'styles:manage', 'costing:manage', 'orders:manage'],
      PURCHASE_OFFICER: ['org:view', 'suppliers:manage', 'requisitions:manage'],
      STORE_OFFICER: ['org:view', 'inventory:manage', 'inventory:issue', 'inventory:adjust'],
      PROD_PLANNER: ['org:view', 'production:plan'],
      PROD_SUPERVISOR: ['org:view', 'production:cutting', 'production:sewing', 'production:finishing', 'production:packing'],
      QA_MANAGER: ['org:view', 'qc:inspect', 'qc:aql_approve', 'qc:defects_manage', 'qc:rework_manage', 'qc:capa_manage'],
      QC_INSPECTOR: ['org:view', 'qc:inspect', 'qc:defects_manage', 'qc:rework_manage'],
      COMMERCIAL_OFFICER: ['org:view', 'shipment:approve'],
      HR_OFFICER: ['org:view', 'hr:manage'],
      FINANCE_OFFICER: ['org:view', 'finance:manage', 'costing:approve'],
      MAINTENANCE_OFFICER: ['org:view', 'maintenance:manage']
    };

    setCurrentUser({
      id: `usr-${roleCode.toLowerCase()}`,
      email: prof.email,
      fullName: `${prof.title} (Active Persona)`,
      phone: '+8801700000000',
      role: {
        code: roleCode,
        name: prof.title,
        description: prof.dept,
        permissions: mockPermissions[roleCode] || ['org:view']
      },
      factories: [
        { id: 'fac-dhaka-01', name: 'Apex Garments — Dhaka Unit (Savar)', code: 'AG-SAVAR-01', division: 'Dhaka' },
        { id: 'fac-gazipur-02', name: 'Apex Garments — Gazipur Complex', code: 'AG-GAZI-02', division: 'Dhaka' }
      ]
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-mono text-slate-400">Loading GarmentERP BD Architecture...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <LoginView onLoginSuccess={(u) => setCurrentUser(u)} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Navbar */}
      <Navbar
        user={currentUser}
        onLogout={handleLogout}
        onSwitchRole={handleSwitchRole}
        selectedFactory={selectedFactoryId}
        onSelectFactory={(id) => setSelectedFactoryId(id)}
      />

      {/* Main Workspace Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={(tab) => setCurrentTab(tab)}
          user={currentUser}
        />

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto bg-slate-950/60 pb-16">
          {currentTab === 'overview' && (
            <OverviewDashboard user={currentUser} onNavigate={(tab) => setCurrentTab(tab)} />
          )}

          {currentTab === 'organization' && (
            <OrganizationView selectedFactoryId={selectedFactoryId} />
          )}

          {currentTab === 'rbac' && (
            <RbacMatrixView
              currentUser={currentUser}
              onSimulateRole={(code) => handleSwitchRole(code)}
            />
          )}

          {currentTab === 'audit' && (
            <AuditView />
          )}

          {currentTab === 'buyers' && (
            <BuyerView />
          )}

          {currentTab === 'styles' && (
            <StyleTechPackView />
          )}

          {currentTab === 'orders' && (
            <PurchaseOrderView />
          )}

          {currentTab === 'costing' && (
            <CostingView user={currentUser} />
          )}
        </main>
      </div>
    </div>
  );
};
