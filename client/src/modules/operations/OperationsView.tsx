import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Wrench, 
  DollarSign, 
  ShieldCheck, 
  AlertTriangle, 
  Plus, 
  CheckCircle2, 
  Clock, 
  TrendingUp, 
  Activity, 
  Cpu, 
  BadgeCheck
} from 'lucide-react';
import { 
  Employee, 
  AttendanceRecord, 
  PayrollRecord, 
  MachineAsset, 
  MaintenanceTicket, 
  CostCenter, 
  FinancialTransaction, 
  OrderProfitabilityAnalysis, 
  ComplianceAudit 
} from '../../types/operations';

interface OperationsViewProps {
  initialSubTab?: 'hr' | 'maintenance' | 'finance' | 'compliance';
}

export const OperationsView: React.FC<OperationsViewProps> = ({ initialSubTab = 'hr' }) => {
  const [activeTab, setActiveTab] = useState<'hr' | 'maintenance' | 'finance' | 'compliance'>(initialSubTab);
  const [loading, setLoading] = useState(true);

  // HR State
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [payroll, setPayroll] = useState<PayrollRecord[]>([]);
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [showPunchModal, setShowPunchModal] = useState(false);
  const [showPayslipModal, setShowPayslipModal] = useState<PayrollRecord | null>(null);

  // Machinery State
  const [machines, setMachines] = useState<MachineAsset[]>([]);
  const [tickets, setTickets] = useState<MaintenanceTicket[]>([]);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [showResolveModal, setShowResolveModal] = useState<MaintenanceTicket | null>(null);

  // Finance State
  const [costCenters, setCostCenters] = useState<CostCenter[]>([]);
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);
  const [orderMargin, setOrderMargin] = useState<OrderProfitabilityAnalysis | null>(null);
  const [selectedPo, setSelectedPo] = useState('PO-2026-001');
  const [showTxnModal, setShowTxnModal] = useState(false);

  // Compliance State
  const [audits, setAudits] = useState<ComplianceAudit[]>([]);
  const [showAuditModal, setShowAuditModal] = useState(false);

  // Form States
  const [newEmpData, setNewEmpData] = useState({
    employeeCode: 'EMP-SAV-012',
    fullName: '',
    phone: '+88017',
    departmentName: 'SEWING',
    designation: 'Sewing Machine Operator',
    factoryId: 'fac-dhaka-01',
    shift: 'MORNING_GENERAL' as const,
    baseSalaryBdt: 13500
  });

  const [newPunchData, setNewPunchData] = useState({
    employeeId: '',
    date: new Date().toISOString().split('T')[0],
    checkIn: '08:00',
    checkOut: '19:00',
    biometricTerminalId: 'BIO-GATE-01'
  });

  const [newTicketData, setNewTicketData] = useState({
    machineId: '',
    issueType: 'NEEDLE_BAR_JAM' as const,
    severity: 'CRITICAL_STOPPAGE' as const,
    reportedBy: 'Line Supervisor'
  });

  const [resolveTicketData, setResolveTicketData] = useState({
    assignedMechanic: 'Rahim Mechanic',
    sparePartsReplaced: 'Needle Plate & Looper Timing Belt',
    sparePartsCostBdt: 2500,
    downtimeMinutes: 45
  });

  const [newTxnData, setNewTxnData] = useState({
    costCenterId: 'cc-sew-01',
    category: 'SEWING_MAINTENANCE',
    amount: 15000,
    currency: 'BDT' as const,
    description: 'Procurement of titanium sewing machine needles and bobbin cases',
    referencePoNumber: 'PO-2026-001'
  });

  const [newAuditData, setNewAuditData] = useState({
    auditNumber: 'AUD-BSCI-2026-002',
    standard: 'BSCI' as const,
    factoryId: 'fac-dhaka-01',
    auditorName: 'Bureau Veritas Bangladesh',
    auditDate: new Date().toISOString().split('T')[0],
    overallRating: 'GREEN_COMPLIANT' as const,
    scorePercentage: 95.0,
    findingClause: '13.2',
    findingDesc: 'Secondary fire extinguisher tag update verified',
    findingSeverity: 'MINOR' as const,
    correctiveAction: 'Laminated tag mounted with monthly check log'
  });

  const token = localStorage.getItem('garment_access_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };

  const fetchOperationsData = async () => {
    setLoading(true);
    try {
      const [
        empRes, attRes, payRes, 
        mcRes, tktRes, 
        ccRes, txnRes, marginRes, 
        auditRes
      ] = await Promise.all([
        fetch('/api/v1/operations/hr/employees', { headers }),
        fetch('/api/v1/operations/hr/attendance', { headers }),
        fetch('/api/v1/operations/hr/payroll', { headers }),
        fetch('/api/v1/operations/maintenance/machines', { headers }),
        fetch('/api/v1/operations/maintenance/tickets', { headers }),
        fetch('/api/v1/operations/finance/cost-centers', { headers }),
        fetch('/api/v1/operations/finance/transactions', { headers }),
        fetch(`/api/v1/operations/finance/order-margin/${selectedPo}`, { headers }),
        fetch('/api/v1/operations/compliance/audits', { headers })
      ]);

      const [
        empData, attData, payData,
        mcData, tktData,
        ccData, txnData, marginData,
        auditData
      ] = await Promise.all([
        empRes.json(), attRes.json(), payRes.json(),
        mcRes.json(), tktRes.json(),
        ccRes.json(), txnRes.json(), marginRes.json(),
        auditRes.json()
      ]);

      if (empData.success) setEmployees(empData.data);
      if (attData.success) setAttendance(attData.data);
      if (payData.success) setPayroll(payData.data);
      if (mcData.success) setMachines(mcData.data);
      if (tktData.success) setTickets(tktData.data);
      if (ccData.success) setCostCenters(ccData.data);
      if (txnData.success) setTransactions(txnData.data);
      if (marginData.success) setOrderMargin(marginData.data);
      if (auditData.success) setAudits(auditData.data);

      if (empData.data && empData.data.length > 0 && !newPunchData.employeeId) {
        setNewPunchData(prev => ({ ...prev, employeeId: empData.data[0].id }));
      }
      if (mcData.data && mcData.data.length > 0 && !newTicketData.machineId) {
        setNewTicketData(prev => ({ ...prev, machineId: mcData.data[0].id }));
      }
    } catch (err) {
      console.error('Failed to fetch operations data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOperationsData();
  }, [selectedPo]);

  // HR Handlers
  const handleCreateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/v1/operations/hr/employees', {
        method: 'POST',
        headers,
        body: JSON.stringify(newEmpData)
      });
      const data = await res.json();
      if (data.success) {
        setShowEmployeeModal(false);
        fetchOperationsData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handlePunchAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/v1/operations/hr/attendance', {
        method: 'POST',
        headers,
        body: JSON.stringify(newPunchData)
      });
      const data = await res.json();
      if (data.success) {
        setShowPunchModal(false);
        fetchOperationsData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCalculatePayroll = async (empId: string) => {
    try {
      const res = await fetch('/api/v1/operations/hr/payroll/calculate', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          employeeId: empId,
          monthYear: '2026-09',
          overtimeHours: 24,
          attendanceBonusBdt: 1000,
          deductionsBdt: 200
        })
      });
      const data = await res.json();
      if (data.success) {
        fetchOperationsData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Maintenance Handlers
  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/v1/operations/maintenance/tickets', {
        method: 'POST',
        headers,
        body: JSON.stringify(newTicketData)
      });
      const data = await res.json();
      if (data.success) {
        setShowTicketModal(false);
        fetchOperationsData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleResolveTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showResolveModal) return;
    try {
      const res = await fetch(`/api/v1/operations/maintenance/tickets/${showResolveModal.id}/resolve`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(resolveTicketData)
      });
      const data = await res.json();
      if (data.success) {
        setShowResolveModal(null);
        fetchOperationsData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Finance Handlers
  const handleCreateTxn = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/v1/operations/finance/transactions', {
        method: 'POST',
        headers,
        body: JSON.stringify(newTxnData)
      });
      const data = await res.json();
      if (data.success) {
        setShowTxnModal(false);
        fetchOperationsData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Compliance Handlers
  const handleCreateAudit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/v1/operations/compliance/audits', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          auditNumber: newAuditData.auditNumber,
          standard: newAuditData.standard,
          factoryId: newAuditData.factoryId,
          auditorName: newAuditData.auditorName,
          auditDate: newAuditData.auditDate,
          overallRating: newAuditData.overallRating,
          scorePercentage: newAuditData.scorePercentage,
          findings: [
            {
              clauseRef: newAuditData.findingClause,
              description: newAuditData.findingDesc,
              severity: newAuditData.findingSeverity,
              correctiveAction: newAuditData.correctiveAction,
              deadline: '2026-10-15',
              status: 'RECTIFIED_VERIFIED'
            }
          ]
        })
      });
      const data = await res.json();
      if (data.success) {
        setShowAuditModal(false);
        fetchOperationsData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Executive Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              Phase 7 Operations Suite
            </span>
            <span className="text-xs text-slate-400 font-medium">Savar & Gazipur Units</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight mt-1">
            Factory Operations & Compliance Suite
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Integrated Human Resources, Biometric Payroll (BD Labor Act 2006 2× OT), Machinery Maintenance, Operational Cost Centers, and International Social Compliance Audits.
          </p>
        </div>

        {/* Action Buttons based on Tab */}
        <div className="flex items-center gap-2">
          {activeTab === 'hr' && (
            <>
              <button
                onClick={() => setShowPunchModal(true)}
                className="px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <Clock className="w-3.5 h-3.5 text-emerald-600" />
                Biometric Punch In/Out
              </button>
              <button
                onClick={() => setShowEmployeeModal(true)}
                className="px-3.5 py-2 text-xs font-medium text-white bg-emerald-700 rounded-lg hover:bg-emerald-800 flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                Enroll Employee
              </button>
            </>
          )}

          {activeTab === 'maintenance' && (
            <button
              onClick={() => setShowTicketModal(true)}
              className="px-3.5 py-2 text-xs font-medium text-white bg-amber-600 rounded-lg hover:bg-amber-700 flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              Report Breakdown Ticket
            </button>
          )}

          {activeTab === 'finance' && (
            <button
              onClick={() => setShowTxnModal(true)}
              className="px-3.5 py-2 text-xs font-medium text-white bg-emerald-700 rounded-lg hover:bg-emerald-800 flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              Record Plant Expense
            </button>
          )}

          {activeTab === 'compliance' && (
            <button
              onClick={() => setShowAuditModal(true)}
              className="px-3.5 py-2 text-xs font-medium text-white bg-emerald-700 rounded-lg hover:bg-emerald-800 flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              Log Audit & CAPA
            </button>
          )}
        </div>
      </div>

      {/* Sub-Tab Navigation Bar */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('hr')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'hr'
              ? 'bg-emerald-700 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Users className="w-4 h-4" />
          HR & Biometric Payroll
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
            activeTab === 'hr' ? 'bg-emerald-800 text-white' : 'bg-slate-200 text-slate-700'
          }`}>
            {employees.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('maintenance')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'maintenance'
              ? 'bg-emerald-700 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Wrench className="w-4 h-4" />
          Machinery Maintenance
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
            activeTab === 'maintenance' ? 'bg-emerald-800 text-white' : 'bg-slate-200 text-slate-700'
          }`}>
            {machines.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('finance')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'finance'
              ? 'bg-emerald-700 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          Cost Centers & Profitability
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
            activeTab === 'finance' ? 'bg-emerald-800 text-white' : 'bg-slate-200 text-slate-700'
          }`}>
            {costCenters.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('compliance')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'compliance'
              ? 'bg-emerald-700 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          Social & Safety Compliance
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
            activeTab === 'compliance' ? 'bg-emerald-800 text-white' : 'bg-slate-200 text-slate-700'
          }`}>
            {audits.length}
          </span>
        </button>
      </div>

      {loading ? (
        <div className="bg-white p-12 rounded-xl border border-slate-200 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mb-3" />
          <p className="text-sm text-slate-500 font-medium">Synchronizing factory operations telemetry...</p>
        </div>
      ) : (
        <>
          {/* ========================================================================= */}
          {/* 1. HR & BIOMETRIC PAYROLL SUB-TAB */}
          {/* ========================================================================= */}
          {activeTab === 'hr' && (
            <div className="space-y-6">
              {/* HR Summary KPIs */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500">Active Operators</span>
                    <Users className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="text-2xl font-bold text-slate-800 mt-2">{employees.length} Staff</div>
                  <div className="text-[11px] text-emerald-600 font-medium mt-0.5">100% Biometric Enrolled</div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500">Daily Attendance</span>
                    <BadgeCheck className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="text-2xl font-bold text-slate-800 mt-2">
                    {attendance.filter(a => a.status === 'PRESENT').length} Present
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Zero unexcused absentees</div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500">Overtime Logged</span>
                    <Clock className="w-4 h-4 text-amber-600" />
                  </div>
                  <div className="text-2xl font-bold text-slate-800 mt-2">
                    {attendance.reduce((sum, a) => sum + a.overtimeHours, 0).toFixed(1)} hrs
                  </div>
                  <div className="text-[11px] text-amber-700 font-medium mt-0.5">Auto BD Labor Act 2x Rate</div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500">Disbursed Payroll</span>
                    <DollarSign className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="text-2xl font-bold text-slate-800 mt-2">
                    ৳{payroll.reduce((sum, p) => sum + p.netPayableBdt, 0).toLocaleString()}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Total Net Payable BDT</div>
                </div>
              </div>

              {/* Attendance & Biometric Ledger */}
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">Biometric Gate Reader Attendance Ledger</h3>
                    <p className="text-xs text-slate-500">Automated shift check-in/out and 2x overtime calculation</p>
                  </div>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                    Terminal BIO-GATE-01 (Online)
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase">
                      <tr>
                        <th className="p-3">Employee</th>
                        <th className="p-3">Date</th>
                        <th className="p-3">Check-In</th>
                        <th className="p-3">Check-Out</th>
                        <th className="p-3">Status</th>
                        <th className="p-3">Overtime Hours</th>
                        <th className="p-3">Gate Terminal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {attendance.map((att) => (
                        <tr key={att.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="p-3">
                            <div className="font-semibold text-slate-800">{att.employeeName}</div>
                            <div className="text-[11px] text-slate-400">{att.employeeCode}</div>
                          </td>
                          <td className="p-3 text-slate-600 font-medium">{att.date}</td>
                          <td className="p-3 text-emerald-700 font-semibold">{att.checkIn}</td>
                          <td className="p-3 text-emerald-700 font-semibold">{att.checkOut}</td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              {att.status}
                            </span>
                          </td>
                          <td className="p-3 font-semibold text-amber-700">
                            {att.overtimeHours > 0 ? `+${att.overtimeHours} hrs (2x OT)` : '0.0 hrs'}
                          </td>
                          <td className="p-3 text-slate-500 font-mono text-[11px]">{att.biometricTerminalId}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Employee Master & Monthly Payroll Ledger */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Employee Roster */}
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                  <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
                    <h3 className="text-sm font-bold text-slate-800">Factory Floor Operator Roster</h3>
                    <span className="text-xs text-slate-500">{employees.length} enrolled</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase">
                        <tr>
                          <th className="p-3">Operator</th>
                          <th className="p-3">Dept & Role</th>
                          <th className="p-3">Base Wage</th>
                          <th className="p-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {employees.map((emp) => (
                          <tr key={emp.id} className="hover:bg-slate-50 transition-colors">
                            <td className="p-3">
                              <div className="font-semibold text-slate-800">{emp.fullName}</div>
                              <div className="text-[11px] text-slate-400">{emp.employeeCode} · {emp.shift}</div>
                            </td>
                            <td className="p-3 text-slate-600">
                              <div>{emp.designation}</div>
                              <div className="text-[11px] text-slate-400">{emp.departmentName}</div>
                            </td>
                            <td className="p-3 font-semibold text-slate-800">৳{emp.baseSalaryBdt.toLocaleString()}</td>
                            <td className="p-3 text-right">
                              <button
                                onClick={() => handleCalculatePayroll(emp.id)}
                                className="px-2 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded text-[11px] font-semibold hover:bg-emerald-100 transition-colors"
                              >
                                Compute Payslip
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Monthly Payroll Table */}
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                  <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
                    <h3 className="text-sm font-bold text-slate-800">Monthly Payroll & Payslips</h3>
                    <span className="text-xs text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      September 2026
                    </span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase">
                        <tr>
                          <th className="p-3">Employee</th>
                          <th className="p-3">Base Wage</th>
                          <th className="p-3">OT Pay (2x)</th>
                          <th className="p-3">Net Payable</th>
                          <th className="p-3 text-right">Payslip</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {payroll.map((pay) => (
                          <tr key={pay.id} className="hover:bg-slate-50 transition-colors">
                            <td className="p-3">
                              <div className="font-semibold text-slate-800">{pay.employeeName}</div>
                              <div className="text-[11px] text-slate-400">{pay.employeeCode}</div>
                            </td>
                            <td className="p-3 text-slate-600">৳{pay.baseSalaryBdt.toLocaleString()}</td>
                            <td className="p-3 text-amber-700 font-semibold">
                              ৳{pay.overtimePayBdt.toLocaleString()}
                              <div className="text-[10px] text-slate-400">({pay.overtimeHours}h @ ৳{pay.overtimeHourlyRateBdt}/h)</div>
                            </td>
                            <td className="p-3 font-bold text-emerald-800">৳{pay.netPayableBdt.toLocaleString()}</td>
                            <td className="p-3 text-right">
                              <button
                                onClick={() => setShowPayslipModal(pay)}
                                className="px-2 py-1 text-slate-700 bg-white border border-slate-200 rounded text-[11px] font-semibold hover:bg-slate-50 transition-colors shadow-xs"
                              >
                                View Slip
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 2. MACHINERY MAINTENANCE SUB-TAB */}
          {/* ========================================================================= */}
          {activeTab === 'maintenance' && (
            <div className="space-y-6">
              {/* Machine Fleet KPIs */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500">Fleet Inventory</span>
                    <Cpu className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="text-2xl font-bold text-slate-800 mt-2">{machines.length} Machines</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Juki, Brother, Pegasus, Kansai</div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500">Operational Rate</span>
                    <Activity className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="text-2xl font-bold text-slate-800 mt-2">
                    {((machines.filter(m => m.status === 'OPERATIONAL').length / (machines.length || 1)) * 100).toFixed(0)}%
                  </div>
                  <div className="text-[11px] text-emerald-600 font-medium mt-0.5">
                    {machines.filter(m => m.status === 'OPERATIONAL').length} / {machines.length} Ready for Production
                  </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500">Active Work Orders</span>
                    <Wrench className="w-4 h-4 text-amber-600" />
                  </div>
                  <div className="text-2xl font-bold text-slate-800 mt-2">
                    {tickets.filter(t => t.status !== 'CLOSED').length} Tickets
                  </div>
                  <div className="text-[11px] text-amber-700 font-medium mt-0.5">Breakdowns & Preventive</div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500">Spare Parts Invested</span>
                    <DollarSign className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="text-2xl font-bold text-slate-800 mt-2">
                    ৳{tickets.reduce((sum, t) => sum + t.sparePartsCostBdt, 0).toLocaleString()}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Total Maintenance Spend</div>
                </div>
              </div>

              {/* Machine Registry Table */}
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">Production Machinery Assets Registry</h3>
                    <p className="text-xs text-slate-500">Serial numbers, line allocations, and preventive calibration dates</p>
                  </div>
                  <span className="text-xs font-medium text-slate-500">{machines.length} Active Assets</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase">
                      <tr>
                        <th className="p-3">Machine Code</th>
                        <th className="p-3">Brand & Model</th>
                        <th className="p-3">Machine Type</th>
                        <th className="p-3">Line Allocation</th>
                        <th className="p-3">Status</th>
                        <th className="p-3">Next Due</th>
                        <th className="p-3">Downtime</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {machines.map((mc) => (
                        <tr key={mc.id} className="hover:bg-slate-50 transition-colors">
                          <td className="p-3 font-mono font-bold text-slate-800">{mc.machineCode}</td>
                          <td className="p-3">
                            <div className="font-semibold text-slate-800">{mc.brand}</div>
                            <div className="text-[11px] text-slate-400">{mc.model}</div>
                          </td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                              {mc.type}
                            </span>
                          </td>
                          <td className="p-3 font-medium text-slate-700">{mc.lineId.toUpperCase()}</td>
                          <td className="p-3">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                              mc.status === 'OPERATIONAL'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : mc.status === 'UNDER_MAINTENANCE'
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : 'bg-red-50 text-red-700 border-red-200'
                            }`}>
                              {mc.status}
                            </span>
                          </td>
                          <td className="p-3 text-slate-600 font-medium">{mc.nextMaintenanceDueDate}</td>
                          <td className="p-3 text-slate-500">{mc.totalDowntimeHours} hrs</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Maintenance Work Orders */}
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">Breakdown & Preventive Maintenance Work Orders</h3>
                    <p className="text-xs text-slate-500">Fast mechanic response, root cause action, and spare parts accounting</p>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase">
                      <tr>
                        <th className="p-3">Ticket #</th>
                        <th className="p-3">Machine</th>
                        <th className="p-3">Issue Type</th>
                        <th className="p-3">Severity</th>
                        <th className="p-3">Mechanic</th>
                        <th className="p-3">Spare Cost</th>
                        <th className="p-3">Status</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {tickets.map((tkt) => (
                        <tr key={tkt.id} className="hover:bg-slate-50 transition-colors">
                          <td className="p-3 font-mono font-semibold text-slate-800">{tkt.ticketNumber}</td>
                          <td className="p-3 font-semibold text-slate-700">{tkt.machineCode} ({tkt.lineId})</td>
                          <td className="p-3 text-slate-600">{tkt.issueType}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              tkt.severity === 'CRITICAL_STOPPAGE'
                                ? 'bg-red-100 text-red-800'
                                : tkt.severity === 'MAJOR'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {tkt.severity}
                            </span>
                          </td>
                          <td className="p-3 text-slate-600">{tkt.assignedMechanic || 'Pending Assign'}</td>
                          <td className="p-3 font-semibold text-slate-800">
                            {tkt.sparePartsCostBdt > 0 ? `৳${tkt.sparePartsCostBdt.toLocaleString()}` : '—'}
                          </td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              tkt.status === 'CLOSED'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}>
                              {tkt.status}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            {tkt.status !== 'CLOSED' && (
                              <button
                                onClick={() => {
                                  setShowResolveModal(tkt);
                                  setResolveTicketData({
                                    assignedMechanic: tkt.assignedMechanic || 'Master Mechanic Rahim',
                                    sparePartsReplaced: 'Needle Plate & Looper Timing Belt',
                                    sparePartsCostBdt: 2500,
                                    downtimeMinutes: 45
                                  });
                                }}
                                className="px-2.5 py-1 bg-emerald-600 text-white rounded text-[11px] font-semibold hover:bg-emerald-700 transition-colors shadow-xs"
                              >
                                Resolve & Restore
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 3. COST CENTERS & REALIZED PROFITABILITY SUB-TAB */}
          {/* ========================================================================= */}
          {activeTab === 'finance' && (
            <div className="space-y-6">
              {/* Profitability Executive Card */}
              {orderMargin && (
                <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                          Realized Order Profitability
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                          {orderMargin.profitabilityRating}
                        </span>
                      </div>
                      <h2 className="text-xl font-bold text-slate-800 mt-1">
                        {orderMargin.poNumber} — {orderMargin.buyerName} ({orderMargin.styleNumber})
                      </h2>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Shipped: {orderMargin.orderQuantity.toLocaleString()} pcs @ ${orderMargin.unitPriceUsd.toFixed(2)}/pc
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <select
                        value={selectedPo}
                        onChange={(e) => setSelectedPo(e.target.value)}
                        aria-label="Select Buyer Purchase Order"
                        className="text-xs font-medium border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      >
                        <option value="PO-2026-001">PO-2026-001 (H&M Polo)</option>
                        <option value="PO-2026-002">PO-2026-002 (Zara Twill Pants)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                      <div className="text-xs text-slate-500 font-medium">Export Commercial Value</div>
                      <div className="text-xl font-bold text-slate-900 mt-1">
                        ${orderMargin.totalRevenueUsd.toLocaleString()}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">FOB Chittagong Port</div>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                      <div className="text-xs text-slate-500 font-medium">Total Cost of Production</div>
                      <div className="text-xl font-bold text-slate-900 mt-1">
                        ${orderMargin.totalCostUsd.toLocaleString()}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">Fabric + Trims + CM + OH</div>
                    </div>

                    <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-100">
                      <div className="text-xs text-emerald-700 font-medium">Realized Net Profit</div>
                      <div className="text-xl font-bold text-emerald-800 mt-1">
                        +${orderMargin.netProfitUsd.toLocaleString()}
                      </div>
                      <div className="text-[11px] text-emerald-600 mt-0.5">After all direct allocations</div>
                    </div>

                    <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-100">
                      <div className="text-xs text-emerald-700 font-medium">Net Profit Margin</div>
                      <div className="text-2xl font-black text-emerald-800 mt-1">
                        {orderMargin.netMarginPercentage}%
                      </div>
                      <div className="text-[11px] text-emerald-700 font-medium mt-0.5">High Performance Target</div>
                    </div>
                  </div>

                  {/* Cost Breakdown Visual Bar */}
                  <div className="mt-6 space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-600 font-medium">
                      <span>BOM Cost Stack Breakdown</span>
                      <span>Total Realized Cost: ${orderMargin.totalCostUsd.toLocaleString()}</span>
                    </div>
                    <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex">
                      <div 
                        style={{ width: `${(orderMargin.totalFabricCostUsd / orderMargin.totalCostUsd) * 100}%` }}
                        className="bg-emerald-600" 
                        title={`Fabric: $${orderMargin.totalFabricCostUsd}`} 
                      />
                      <div 
                        style={{ width: `${(orderMargin.totalTrimsCostUsd / orderMargin.totalCostUsd) * 100}%` }} 
                        className="bg-teal-500" 
                        title={`Trims: $${orderMargin.totalTrimsCostUsd}`} 
                      />
                      <div 
                        style={{ width: `${(orderMargin.totalCmCostUsd / orderMargin.totalCostUsd) * 100}%` }} 
                        className="bg-amber-500" 
                        title={`CM (Labor): $${orderMargin.totalCmCostUsd}`} 
                      />
                      <div 
                        style={{ width: `${(orderMargin.totalOverheadCostUsd / orderMargin.totalCostUsd) * 100}%` }} 
                        className="bg-blue-500" 
                        title={`Factory Overhead: $${orderMargin.totalOverheadCostUsd}`} 
                      />
                    </div>
                    <div className="flex items-center gap-4 text-[11px] text-slate-500 pt-1">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                        <span>Fabric: ${orderMargin.totalFabricCostUsd.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-teal-500" />
                        <span>Trims: ${orderMargin.totalTrimsCostUsd.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                        <span>CM (Labor): ${orderMargin.totalCmCostUsd.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                        <span>Overhead: ${orderMargin.totalOverheadCostUsd.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Cost Centers Table */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                  <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
                    <h3 className="text-sm font-bold text-slate-800">Operational Cost Centers</h3>
                    <span className="text-xs text-slate-500">Monthly Budget Control</span>
                  </div>
                  <div className="p-4 space-y-4">
                    {costCenters.map((cc) => {
                      const utilPct = ((cc.actualSpentBdt / cc.budgetBdt) * 100).toFixed(1);
                      return (
                        <div key={cc.id} className="p-3 rounded-lg border border-slate-100 bg-slate-50/50 space-y-2">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-xs font-bold text-slate-800">{cc.name}</div>
                              <div className="text-[11px] text-slate-400">{cc.code} · {cc.department}</div>
                            </div>
                            <div className="text-right">
                              <div className="text-xs font-bold text-slate-900">
                                ৳{cc.actualSpentBdt.toLocaleString()} / ৳{cc.budgetBdt.toLocaleString()}
                              </div>
                              <div className={`text-[10px] font-bold ${
                                Number(utilPct) > 90 ? 'text-red-600' : 'text-emerald-600'
                              }`}>
                                {utilPct}% Allocated
                              </div>
                            </div>
                          </div>
                          <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                            <div 
                              style={{ width: `${Math.min(100, Number(utilPct))}%` }} 
                              className={`h-full ${Number(utilPct) > 90 ? 'bg-red-500' : 'bg-emerald-600'}`} 
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Expense Transactions Ledger */}
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                  <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
                    <h3 className="text-sm font-bold text-slate-800">Expense Transactions Ledger</h3>
                    <span className="text-xs text-slate-500">{transactions.length} Records</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase">
                        <tr>
                          <th className="p-3">Txn #</th>
                          <th className="p-3">Category</th>
                          <th className="p-3">Amount</th>
                          <th className="p-3">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {transactions.map((txn) => (
                          <tr key={txn.id} className="hover:bg-slate-50 transition-colors">
                            <td className="p-3">
                              <div className="font-mono font-semibold text-slate-800">{txn.txnNumber}</div>
                              <div className="text-[11px] text-slate-400">{txn.date}</div>
                            </td>
                            <td className="p-3">
                              <div className="font-medium text-slate-700">{txn.category}</div>
                              <div className="text-[11px] text-slate-400 truncate max-w-xs">{txn.description}</div>
                            </td>
                            <td className="p-3 font-bold text-slate-800">
                              {txn.currency === 'USD' ? `$${txn.amount.toLocaleString()}` : `৳${txn.amount.toLocaleString()}`}
                            </td>
                            <td className="p-3">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                {txn.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 4. SOCIAL & SAFETY COMPLIANCE SUB-TAB */}
          {/* ========================================================================= */}
          {activeTab === 'compliance' && (
            <div className="space-y-6">
              {/* Compliance KPIs */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500">Audit Status</span>
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="text-2xl font-bold text-emerald-700 mt-2">GREEN COMPLIANT</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">BSCI & SEDEX SMETA Cleared</div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500">Latest Audit Score</span>
                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="text-2xl font-bold text-slate-800 mt-2">
                    {audits.length > 0 ? `${audits[0].scorePercentage}%` : '94.5%'}
                  </div>
                  <div className="text-[11px] text-emerald-600 font-medium mt-0.5">A-Grade Certification</div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500">Standards Audited</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="text-2xl font-bold text-slate-800 mt-2">3 Frameworks</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">BSCI, SMETA, RSC/Accord</div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500">Critical CAPA Open</span>
                    <AlertTriangle className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="text-2xl font-bold text-slate-800 mt-2">0 Findings</div>
                  <div className="text-[11px] text-emerald-700 font-medium mt-0.5">100% Zero Tolerance Adherence</div>
                </div>
              </div>

              {/* Audits Registry Table */}
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">Factory Social & Safety Compliance Audits</h3>
                    <p className="text-xs text-slate-500">International buyer accreditation for labor standards, fire safety & fair wages</p>
                  </div>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                    Accord / RSC Compliant
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase">
                      <tr>
                        <th className="p-3">Audit #</th>
                        <th className="p-3">Standard</th>
                        <th className="p-3">Auditing Firm</th>
                        <th className="p-3">Date</th>
                        <th className="p-3">Score</th>
                        <th className="p-3">Rating</th>
                        <th className="p-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {audits.map((aud) => (
                        <tr key={aud.id} className="hover:bg-slate-50 transition-colors">
                          <td className="p-3 font-mono font-bold text-slate-800">{aud.auditNumber}</td>
                          <td className="p-3 font-semibold text-slate-800">{aud.standard}</td>
                          <td className="p-3 text-slate-600 font-medium">{aud.auditorName}</td>
                          <td className="p-3 text-slate-600">{aud.auditDate}</td>
                          <td className="p-3 font-bold text-slate-800">{aud.scorePercentage}%</td>
                          <td className="p-3">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              {aud.overallRating}
                            </span>
                          </td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                              {aud.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* CAPA Corrective Actions Table */}
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">Corrective and Preventive Action (CAPA) Rectification Registry</h3>
                    <p className="text-xs text-slate-500">Auditor findings tracking with closure validation</p>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase">
                      <tr>
                        <th className="p-3">Clause</th>
                        <th className="p-3">Finding Description</th>
                        <th className="p-3">Severity</th>
                        <th className="p-3">Corrective Action Taken</th>
                        <th className="p-3">Target Deadline</th>
                        <th className="p-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {audits.flatMap(a => a.findings).map((f) => (
                        <tr key={f.id} className="hover:bg-slate-50 transition-colors">
                          <td className="p-3 font-mono font-bold text-slate-800">{f.clauseRef}</td>
                          <td className="p-3 text-slate-700 max-w-xs">{f.description}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              f.severity === 'CRITICAL' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                            }`}>
                              {f.severity}
                            </span>
                          </td>
                          <td className="p-3 text-emerald-800 font-medium max-w-sm">{f.correctiveAction}</td>
                          <td className="p-3 text-slate-500">{f.deadline}</td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              {f.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* ========================================================================= */}
      {/* MODALS */}
      {/* ========================================================================= */}

      {/* Enroll Employee Modal */}
      {showEmployeeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="text-sm font-bold text-slate-800">Enroll Factory Operator / Staff</h3>
              <button onClick={() => setShowEmployeeModal(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>
            <form onSubmit={handleCreateEmployee} className="p-4 space-y-3">
              <div>
                <label className="text-xs font-medium text-slate-600">Employee Code</label>
                <input
                  type="text"
                  value={newEmpData.employeeCode}
                  onChange={(e) => setNewEmpData({ ...newEmpData, employeeCode: e.target.value })}
                  className="w-full text-xs border border-slate-200 rounded px-2.5 py-1.5 mt-1"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600">Full Name</label>
                <input
                  type="text"
                  value={newEmpData.fullName}
                  onChange={(e) => setNewEmpData({ ...newEmpData, fullName: e.target.value })}
                  placeholder="e.g. Rokeya Begum"
                  className="w-full text-xs border border-slate-200 rounded px-2.5 py-1.5 mt-1"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-medium text-slate-600">Department</label>
                  <select
                    value={newEmpData.departmentName}
                    onChange={(e) => setNewEmpData({ ...newEmpData, departmentName: e.target.value })}
                    className="w-full text-xs border border-slate-200 rounded px-2.5 py-1.5 mt-1"
                  >
                    <option value="SEWING">SEWING</option>
                    <option value="CUTTING">CUTTING</option>
                    <option value="FINISHING">FINISHING</option>
                    <option value="MAINTENANCE">MAINTENANCE</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600">Shift</label>
                  <select
                    value={newEmpData.shift}
                    onChange={(e) => setNewEmpData({ ...newEmpData, shift: e.target.value as any })}
                    className="w-full text-xs border border-slate-200 rounded px-2.5 py-1.5 mt-1"
                  >
                    <option value="MORNING_GENERAL">Morning General (08:00 - 17:00)</option>
                    <option value="EVENING">Evening Shift</option>
                    <option value="NIGHT">Night Shift</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-medium text-slate-600">Designation</label>
                  <input
                    type="text"
                    value={newEmpData.designation}
                    onChange={(e) => setNewEmpData({ ...newEmpData, designation: e.target.value })}
                    className="w-full text-xs border border-slate-200 rounded px-2.5 py-1.5 mt-1"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600">Base Salary (BDT)</label>
                  <input
                    type="number"
                    value={newEmpData.baseSalaryBdt}
                    onChange={(e) => setNewEmpData({ ...newEmpData, baseSalaryBdt: Number(e.target.value) })}
                    className="w-full text-xs border border-slate-200 rounded px-2.5 py-1.5 mt-1"
                    required
                  />
                </div>
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowEmployeeModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 bg-slate-100 rounded hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 text-xs text-white bg-emerald-700 rounded hover:bg-emerald-800 font-semibold"
                >
                  Register Operator
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Biometric Gate Punch Modal */}
      {showPunchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="text-sm font-bold text-slate-800">Biometric Terminal Punch In/Out</h3>
              <button onClick={() => setShowPunchModal(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>
            <form onSubmit={handlePunchAttendance} className="p-4 space-y-3">
              <div>
                <label className="text-xs font-medium text-slate-600">Select Employee</label>
                <select
                  value={newPunchData.employeeId}
                  onChange={(e) => setNewPunchData({ ...newPunchData, employeeId: e.target.value })}
                  className="w-full text-xs border border-slate-200 rounded px-2.5 py-1.5 mt-1"
                  required
                >
                  {employees.map(e => (
                    <option key={e.id} value={e.id}>
                      {e.fullName} ({e.employeeCode}) — {e.designation}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-medium text-slate-600">Check-In Time</label>
                  <input
                    type="time"
                    value={newPunchData.checkIn}
                    onChange={(e) => setNewPunchData({ ...newPunchData, checkIn: e.target.value })}
                    className="w-full text-xs border border-slate-200 rounded px-2.5 py-1.5 mt-1"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600">Check-Out Time</label>
                  <input
                    type="time"
                    value={newPunchData.checkOut}
                    onChange={(e) => setNewPunchData({ ...newPunchData, checkOut: e.target.value })}
                    className="w-full text-xs border border-slate-200 rounded px-2.5 py-1.5 mt-1"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600">Biometric Terminal Gate</label>
                <input
                  type="text"
                  value={newPunchData.biometricTerminalId}
                  onChange={(e) => setNewPunchData({ ...newPunchData, biometricTerminalId: e.target.value })}
                  className="w-full text-xs border border-slate-200 rounded px-2.5 py-1.5 mt-1"
                  required
                />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowPunchModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 bg-slate-100 rounded hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 text-xs text-white bg-emerald-700 rounded hover:bg-emerald-800 font-semibold"
                >
                  Log Gate Punch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Machine Breakdown Ticket Modal */}
      {showTicketModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="text-sm font-bold text-slate-800">Issue Breakdown Ticket</h3>
              <button onClick={() => setShowTicketModal(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>
            <form onSubmit={handleCreateTicket} className="p-4 space-y-3">
              <div>
                <label className="text-xs font-medium text-slate-600">Select Machine</label>
                <select
                  value={newTicketData.machineId}
                  onChange={(e) => setNewTicketData({ ...newTicketData, machineId: e.target.value })}
                  className="w-full text-xs border border-slate-200 rounded px-2.5 py-1.5 mt-1"
                  required
                >
                  {machines.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.machineCode} — {m.brand} {m.model} ({m.lineId})
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-medium text-slate-600">Issue Type</label>
                  <select
                    value={newTicketData.issueType}
                    onChange={(e) => setNewTicketData({ ...newTicketData, issueType: e.target.value as any })}
                    className="w-full text-xs border border-slate-200 rounded px-2.5 py-1.5 mt-1"
                  >
                    <option value="NEEDLE_BAR_JAM">Needle Bar Jam</option>
                    <option value="THREAD_TENSION_FAILURE">Thread Tension Failure</option>
                    <option value="MOTOR_OVERHEAT">Motor Overheat</option>
                    <option value="OIL_LEAKAGE">Oil Leakage</option>
                    <option value="TIMING_BELT_SLIP">Timing Belt Slip</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600">Severity</label>
                  <select
                    value={newTicketData.severity}
                    onChange={(e) => setNewTicketData({ ...newTicketData, severity: e.target.value as any })}
                    className="w-full text-xs border border-slate-200 rounded px-2.5 py-1.5 mt-1"
                  >
                    <option value="CRITICAL_STOPPAGE">CRITICAL STOPPAGE</option>
                    <option value="MAJOR">MAJOR</option>
                    <option value="MINOR">MINOR</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600">Reported By</label>
                <input
                  type="text"
                  value={newTicketData.reportedBy}
                  onChange={(e) => setNewTicketData({ ...newTicketData, reportedBy: e.target.value })}
                  className="w-full text-xs border border-slate-200 rounded px-2.5 py-1.5 mt-1"
                  required
                />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowTicketModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 bg-slate-100 rounded hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 text-xs text-white bg-amber-600 rounded hover:bg-amber-700 font-semibold"
                >
                  Dispatch Work Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Resolve Machine Ticket Modal */}
      {showResolveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="text-sm font-bold text-slate-800">Resolve Work Order {showResolveModal.ticketNumber}</h3>
              <button onClick={() => setShowResolveModal(null)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>
            <form onSubmit={handleResolveTicket} className="p-4 space-y-3">
              <div>
                <label className="text-xs font-medium text-slate-600">Assigned Mechanic</label>
                <input
                  type="text"
                  value={resolveTicketData.assignedMechanic}
                  onChange={(e) => setResolveTicketData({ ...resolveTicketData, assignedMechanic: e.target.value })}
                  className="w-full text-xs border border-slate-200 rounded px-2.5 py-1.5 mt-1"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600">Spare Parts Replaced</label>
                <input
                  type="text"
                  value={resolveTicketData.sparePartsReplaced}
                  onChange={(e) => setResolveTicketData({ ...resolveTicketData, sparePartsReplaced: e.target.value })}
                  className="w-full text-xs border border-slate-200 rounded px-2.5 py-1.5 mt-1"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-medium text-slate-600">Spare Parts Cost (BDT)</label>
                  <input
                    type="number"
                    value={resolveTicketData.sparePartsCostBdt}
                    onChange={(e) => setResolveTicketData({ ...resolveTicketData, sparePartsCostBdt: Number(e.target.value) })}
                    className="w-full text-xs border border-slate-200 rounded px-2.5 py-1.5 mt-1"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600">Downtime (Minutes)</label>
                  <input
                    type="number"
                    value={resolveTicketData.downtimeMinutes}
                    onChange={(e) => setResolveTicketData({ ...resolveTicketData, downtimeMinutes: Number(e.target.value) })}
                    className="w-full text-xs border border-slate-200 rounded px-2.5 py-1.5 mt-1"
                    required
                  />
                </div>
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowResolveModal(null)}
                  className="px-3 py-1.5 text-xs text-slate-600 bg-slate-100 rounded hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 text-xs text-white bg-emerald-700 rounded hover:bg-emerald-800 font-semibold"
                >
                  Mark Repaired & Operational
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Expense Modal */}
      {showTxnModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="text-sm font-bold text-slate-800">Record Plant Operational Expense</h3>
              <button onClick={() => setShowTxnModal(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>
            <form onSubmit={handleCreateTxn} className="p-4 space-y-3">
              <div>
                <label className="text-xs font-medium text-slate-600">Cost Center</label>
                <select
                  value={newTxnData.costCenterId}
                  onChange={(e) => setNewTxnData({ ...newTxnData, costCenterId: e.target.value })}
                  className="w-full text-xs border border-slate-200 rounded px-2.5 py-1.5 mt-1"
                >
                  {costCenters.map(cc => (
                    <option key={cc.id} value={cc.id}>{cc.name} ({cc.department})</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-medium text-slate-600">Category</label>
                  <input
                    type="text"
                    value={newTxnData.category}
                    onChange={(e) => setNewTxnData({ ...newTxnData, category: e.target.value })}
                    className="w-full text-xs border border-slate-200 rounded px-2.5 py-1.5 mt-1"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600">Amount (BDT)</label>
                  <input
                    type="number"
                    value={newTxnData.amount}
                    onChange={(e) => setNewTxnData({ ...newTxnData, amount: Number(e.target.value) })}
                    className="w-full text-xs border border-slate-200 rounded px-2.5 py-1.5 mt-1"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600">Description</label>
                <textarea
                  value={newTxnData.description}
                  onChange={(e) => setNewTxnData({ ...newTxnData, description: e.target.value })}
                  rows={2}
                  className="w-full text-xs border border-slate-200 rounded px-2.5 py-1.5 mt-1"
                  required
                />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowTxnModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 bg-slate-100 rounded hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 text-xs text-white bg-emerald-700 rounded hover:bg-emerald-800 font-semibold"
                >
                  Post Transaction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Audit Modal */}
      {showAuditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="text-sm font-bold text-slate-800">Log Social & Safety Audit</h3>
              <button onClick={() => setShowAuditModal(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>
            <form onSubmit={handleCreateAudit} className="p-4 space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-medium text-slate-600">Audit Standard</label>
                  <select
                    value={newAuditData.standard}
                    onChange={(e) => setNewAuditData({ ...newAuditData, standard: e.target.value as any })}
                    className="w-full text-xs border border-slate-200 rounded px-2.5 py-1.5 mt-1"
                  >
                    <option value="BSCI">BSCI (Amfori)</option>
                    <option value="SEDEX_SMETA">SEDEX / SMETA</option>
                    <option value="RSC_ACCORD">RSC / Accord Fire Safety</option>
                    <option value="WRAP">WRAP Certification</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600">Score %</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newAuditData.scorePercentage}
                    onChange={(e) => setNewAuditData({ ...newAuditData, scorePercentage: Number(e.target.value) })}
                    className="w-full text-xs border border-slate-200 rounded px-2.5 py-1.5 mt-1"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600">Auditing Body</label>
                <input
                  type="text"
                  value={newAuditData.auditorName}
                  onChange={(e) => setNewAuditData({ ...newAuditData, auditorName: e.target.value })}
                  className="w-full text-xs border border-slate-200 rounded px-2.5 py-1.5 mt-1"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600">Finding Description</label>
                <input
                  type="text"
                  value={newAuditData.findingDesc}
                  onChange={(e) => setNewAuditData({ ...newAuditData, findingDesc: e.target.value })}
                  className="w-full text-xs border border-slate-200 rounded px-2.5 py-1.5 mt-1"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600">Corrective Action Taken</label>
                <input
                  type="text"
                  value={newAuditData.correctiveAction}
                  onChange={(e) => setNewAuditData({ ...newAuditData, correctiveAction: e.target.value })}
                  className="w-full text-xs border border-slate-200 rounded px-2.5 py-1.5 mt-1"
                  required
                />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAuditModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 bg-slate-100 rounded hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 text-xs text-white bg-emerald-700 rounded hover:bg-emerald-800 font-semibold"
                >
                  Certify Audit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Payslip Modal */}
      {showPayslipModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="text-sm font-bold text-slate-800">Garment Worker Monthly Payslip</h3>
                <p className="text-xs text-slate-500">BD Labor Act 2006 Overtime Rate Standard Compliance</p>
              </div>
              <button onClick={() => setShowPayslipModal(null)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <div>
                  <div className="font-bold text-slate-800">{showPayslipModal.employeeName}</div>
                  <div className="text-xs text-slate-400">{showPayslipModal.employeeCode} · {showPayslipModal.designation}</div>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                  {showPayslipModal.paymentStatus}
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Basic Salary (BDT):</span>
                  <span className="font-semibold text-slate-800">৳{showPayslipModal.baseSalaryBdt.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Overtime Rate (2× Hourly = Basic/208*2):</span>
                  <span className="font-semibold text-slate-800">৳{showPayslipModal.overtimeHourlyRateBdt}/hr</span>
                </div>
                <div className="flex justify-between text-amber-700 font-semibold">
                  <span>Overtime Pay ({showPayslipModal.overtimeHours} hrs):</span>
                  <span>+৳{showPayslipModal.overtimePayBdt.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-emerald-700">
                  <span>Attendance Bonus:</span>
                  <span className="font-semibold">+৳{showPayslipModal.attendanceBonusBdt.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-red-600">
                  <span>Statutory & Welfare Deductions:</span>
                  <span className="font-semibold">-৳{showPayslipModal.deductionsBdt.toLocaleString()}</span>
                </div>
              </div>

              <div className="border-t border-slate-200 pt-3 flex justify-between items-center bg-emerald-50/50 p-3 rounded-lg">
                <span className="text-sm font-bold text-emerald-900">Total Net Disbursed:</span>
                <span className="text-lg font-black text-emerald-800">৳{showPayslipModal.netPayableBdt.toLocaleString()}</span>
              </div>
            </div>
            <div className="p-3 border-t border-slate-200 bg-slate-50 flex justify-end">
              <button
                onClick={() => setShowPayslipModal(null)}
                className="px-4 py-1.5 text-xs text-slate-700 bg-white border border-slate-200 rounded font-semibold hover:bg-slate-100"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
