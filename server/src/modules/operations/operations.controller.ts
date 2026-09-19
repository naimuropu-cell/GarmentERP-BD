import { Request, Response } from 'express';
import { z } from 'zod';
import { store } from '../../services/store';

// ==========================================
// 1. Zod Validation Schemas
// ==========================================
const CreateEmployeeSchema = z.object({
  employeeCode: z.string().min(1, 'Employee Code is required'),
  fullName: z.string().min(1, 'Full Name is required'),
  phone: z.string().min(1, 'Phone number is required'),
  departmentId: z.string().min(1, 'Department is required'),
  departmentName: z.string().min(1, 'Department Name is required'),
  designation: z.string().min(1, 'Designation is required'),
  factoryId: z.string().min(1, 'Factory is required'),
  shift: z.enum(['MORNING_GENERAL', 'EVENING', 'NIGHT']),
  joinDate: z.string().min(1, 'Join Date is required'),
  baseSalaryBdt: z.number().positive('Base salary must be positive'),
  status: z.enum(['ACTIVE', 'ON_LEAVE', 'TERMINATED']).default('ACTIVE')
});

const RecordAttendanceSchema = z.object({
  employeeId: z.string().min(1, 'Employee ID is required'),
  date: z.string().min(1, 'Date is required'),
  checkIn: z.string().min(1, 'Check-in time is required'),
  checkOut: z.string().min(1, 'Check-out time is required'),
  status: z.enum(['PRESENT', 'LATE', 'ABSENT', 'ON_LEAVE']),
  biometricTerminalId: z.string().min(1, 'Biometric Terminal ID is required')
});

const CreateMachineSchema = z.object({
  machineCode: z.string().min(1, 'Machine Code is required'),
  brand: z.string().min(1, 'Brand is required'),
  model: z.string().min(1, 'Model is required'),
  type: z.enum(['LOCKSTITCH', 'OVERLOCK', 'FLATLOCK', 'BUTTON_HOLE', 'BAR_TACK', 'NEEDLE_DETECTOR', 'STEAM_PRESS']),
  factoryId: z.string().min(1, 'Factory ID is required'),
  lineId: z.string().min(1, 'Line ID is required'),
  status: z.enum(['OPERATIONAL', 'UNDER_MAINTENANCE', 'BREAKDOWN_STOPPED', 'DECOMMISSIONED']),
  lastMaintenanceDate: z.string().min(1, 'Last Maintenance Date is required'),
  nextMaintenanceDueDate: z.string().min(1, 'Next Maintenance Due Date is required')
});

const CreateMaintenanceTicketSchema = z.object({
  machineId: z.string().min(1, 'Machine ID is required'),
  lineId: z.string().min(1, 'Line ID is required'),
  issueType: z.enum(['NEEDLE_BAR_JAM', 'THREAD_TENSION_FAILURE', 'MOTOR_OVERHEAT', 'OIL_LEAKAGE', 'TIMING_BELT_SLIP', 'CALIBRATION_ERROR']),
  severity: z.enum(['CRITICAL_STOPPAGE', 'MAJOR', 'MINOR']),
  reportedBy: z.string().min(1, 'Reported by is required'),
  assignedMechanic: z.string().min(1, 'Assigned Mechanic is required')
});

const ResolveMaintenanceTicketSchema = z.object({
  downtimeMinutes: z.number().nonnegative(),
  sparePartsReplaced: z.string().min(1, 'Spare Parts description is required'),
  sparePartsCostBdt: z.number().nonnegative()
});

const CreateFinancialTransactionSchema = z.object({
  type: z.enum(['EXPENSE', 'BUYER_RECEIVABLE', 'SUPPLIER_PAYABLE']),
  category: z.string().min(1, 'Category is required'),
  amount: z.number().positive('Amount must be positive'),
  currency: z.enum(['BDT', 'USD']),
  referencePoNumber: z.string().optional(),
  description: z.string().min(1, 'Description is required')
});

const CreateComplianceAuditSchema = z.object({
  standard: z.enum(['BSCI', 'SEDEX_SMETA', 'WRAP', 'FIRE_BUILDING_SAFETY', 'RSC_ACCORD']),
  factoryId: z.string().min(1, 'Factory ID is required'),
  auditorName: z.string().min(1, 'Auditor Name is required'),
  scorePercentage: z.number().min(0).max(100),
  findings: z.array(z.object({
    clauseRef: z.string(),
    description: z.string(),
    severity: z.enum(['CRITICAL', 'MAJOR', 'MINOR']),
    correctiveAction: z.string(),
    deadline: z.string()
  })).optional()
});

// ==========================================
// 2. HR & Payroll Controllers
// ==========================================
export const getEmployees = (req: Request, res: Response) => {
  const employees = store.getAllEmployees();
  return res.json({ success: true, data: employees });
};

export const createEmployee = (req: Request, res: Response) => {
  const parsed = CreateEmployeeSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message }
    });
  }

  const employee = store.createEmployee(parsed.data);
  return res.status(201).json({ success: true, data: employee });
};

export const getAttendance = (req: Request, res: Response) => {
  const attendance = store.getAllAttendance();
  return res.json({ success: true, data: attendance });
};

export const recordAttendance = (req: Request, res: Response) => {
  const parsed = RecordAttendanceSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message }
    });
  }

  const record = store.recordAttendance(parsed.data);
  return res.status(201).json({ success: true, data: record });
};

export const getPayroll = (req: Request, res: Response) => {
  const payroll = store.getAllPayroll();
  return res.json({ success: true, data: payroll });
};

export const calculateMonthlyPayroll = (req: Request, res: Response) => {
  const { monthYear } = req.body;
  if (!monthYear) {
    return res.status(400).json({
      success: false,
      error: { message: "monthYear parameter is required (e.g. 'July 2026')" }
    });
  }

  const records = store.calculateMonthlyPayroll(monthYear);
  return res.status(201).json({ success: true, data: records });
};

// ==========================================
// 3. Machinery & Maintenance Controllers
// ==========================================
export const getMachines = (req: Request, res: Response) => {
  const machines = store.getAllMachines();
  return res.json({ success: true, data: machines });
};

export const createMachine = (req: Request, res: Response) => {
  const parsed = CreateMachineSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message }
    });
  }

  const machine = store.createMachine(parsed.data);
  return res.status(201).json({ success: true, data: machine });
};

export const getMaintenanceTickets = (req: Request, res: Response) => {
  const tickets = store.getAllMaintenanceTickets();
  return res.json({ success: true, data: tickets });
};

export const createMaintenanceTicket = (req: Request, res: Response) => {
  const parsed = CreateMaintenanceTicketSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message }
    });
  }

  const ticket = store.createMaintenanceTicket(parsed.data);
  return res.status(201).json({ success: true, data: ticket });
};

export const resolveMaintenanceTicket = (req: Request, res: Response) => {
  const { id } = req.params;
  const parsed = ResolveMaintenanceTicketSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message }
    });
  }

  const ticket = store.resolveMaintenanceTicket(
    id,
    parsed.data.downtimeMinutes,
    parsed.data.sparePartsReplaced,
    parsed.data.sparePartsCostBdt
  );

  if (!ticket) {
    return res.status(404).json({ success: false, error: { message: 'Maintenance ticket not found' } });
  }

  return res.json({ success: true, data: ticket });
};

// ==========================================
// 4. Operational Finance Controllers
// ==========================================
export const getCostCenters = (req: Request, res: Response) => {
  const centers = store.getAllCostCenters();
  return res.json({ success: true, data: centers });
};

export const getFinancialTransactions = (req: Request, res: Response) => {
  const transactions = store.getAllFinancialTransactions();
  return res.json({ success: true, data: transactions });
};

export const createFinancialTransaction = (req: Request, res: Response) => {
  const parsed = CreateFinancialTransactionSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message }
    });
  }

  const txn = store.createFinancialTransaction(parsed.data);
  return res.status(201).json({ success: true, data: txn });
};

export const getOrderProfitability = (req: Request, res: Response) => {
  const { poNumber } = req.params;
  const analysis = store.calculateOrderProfitability(poNumber);
  return res.json({ success: true, data: analysis });
};

// ==========================================
// 5. Compliance Audits Controllers
// ==========================================
export const getComplianceAudits = (req: Request, res: Response) => {
  const audits = store.getAllComplianceAudits();
  return res.json({ success: true, data: audits });
};

export const createComplianceAudit = (req: Request, res: Response) => {
  const parsed = CreateComplianceAuditSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message }
    });
  }

  const audit = store.createComplianceAudit(parsed.data);
  return res.status(201).json({ success: true, data: audit });
};
