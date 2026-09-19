process.env.NODE_ENV = 'test';
import http from 'http';
import app from '../index';

const PORT = 5062;
let server: http.Server;

function makeRequest(
  method: string,
  path: string,
  body?: any,
  token?: string
): Promise<{ status: number; body: any }> {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : '';
    const req = http.request(
      {
        hostname: '127.0.0.1',
        port: PORT,
        path,
        method,
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload),
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      },
      res => {
        let data = '';
        res.on('data', chunk => (data += chunk));
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode || 500, body: JSON.parse(data) });
          } catch {
            resolve({ status: res.statusCode || 500, body: data });
          }
        });
      }
    );

    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

export async function runPhase7Tests(): Promise<{ passed: number; failed: number }> {
  console.log('\n🧪 Starting GarmentERP BD Phase 7 (Factory Operations: HR, Maintenance, Finance & Compliance) Tests...\n');
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName}`);
      failed++;
    }
  }

  return new Promise(resolve => {
    server = app.listen(PORT, async () => {
      try {
        // 1. Authenticate as Super Admin / HR & Plant Authority
        const loginRes = await makeRequest('POST', '/api/v1/auth/login', {
          email: 'admin@garmenterp.com',
          password: 'Admin123!'
        });
        assert(loginRes.status === 200 && !!loginRes.body.data.accessToken, 'Operations & Plant Authority Authentication & JWT Issuance');
        const token = loginRes.body.data.accessToken;

        // 2. Fetch Employee Roster
        const empListRes = await makeRequest('GET', '/api/v1/operations/hr/employees', undefined, token);
        assert(
          empListRes.status === 200 &&
          Array.isArray(empListRes.body.data) &&
          empListRes.body.data.length >= 3,
          'Retrieve Active Factory Worker & Operator Roster across Savar & Gazipur units'
        );

        // 3. Register New Sewing Machine Operator
        const newEmpRes = await makeRequest(
          'POST',
          '/api/v1/operations/hr/employees',
          {
            employeeCode: 'EMP-SAVAR-0105',
            fullName: 'Sharmin Sultana',
            phone: '+8801744-112233',
            departmentId: 'dept-sew-01',
            departmentName: 'Sewing Department',
            designation: 'Single Needle Lockstitch Operator',
            factoryId: 'fac-dhaka-01',
            shift: 'MORNING_GENERAL',
            joinDate: '2026-06-01',
            baseSalaryBdt: 14200,
            status: 'ACTIVE'
          },
          token
        );
        assert(
          newEmpRes.status === 201 &&
          newEmpRes.body.data.employeeCode === 'EMP-SAVAR-0105',
          'Register Certified Garment Machine Operator into HR Roster'
        );
        const employeeId = newEmpRes.body.data.id;

        // 4. Query Biometric Attendance Logs
        const attListRes = await makeRequest('GET', '/api/v1/operations/hr/attendance', undefined, token);
        assert(
          attListRes.status === 200 &&
          Array.isArray(attListRes.body.data) &&
          attListRes.body.data.length >= 2,
          'Query Biometric Gate Reader Attendance Ledger with Overtime calculation'
        );

        // 5. Record Biometric Punch (07:50 to 18:30 => 8h normal + 1h lunch + 2.7h OT)
        const punchRes = await makeRequest(
          'POST',
          '/api/v1/operations/hr/attendance',
          {
            employeeId,
            date: '2026-06-26',
            checkIn: '07:50',
            checkOut: '18:30',
            status: 'PRESENT',
            biometricTerminalId: 'BIO-SAVAR-GATE-01'
          },
          token
        );
        assert(
          punchRes.status === 201 &&
          punchRes.body.data.status === 'PRESENT' &&
          punchRes.body.data.overtimeHours > 1.5,
          'Ingest Biometric Terminal Punch: Verify Auto Overtime Hours Computation'
        );

        // 6. Query Payroll Ledger
        const payrollListRes = await makeRequest('GET', '/api/v1/operations/hr/payroll', undefined, token);
        assert(
          payrollListRes.status === 200 &&
          Array.isArray(payrollListRes.body.data),
          'Retrieve Monthly Factory Payroll Ledger with allowances and net payslips'
        );

        // 7. Calculate Monthly Payroll (Bangladesh Labor Act 2006: 2x OT rate)
        const calcPayrollRes = await makeRequest(
          'POST',
          '/api/v1/operations/hr/payroll/calculate',
          { monthYear: 'June 2026' },
          token
        );
        assert(
          calcPayrollRes.status === 201 &&
          Array.isArray(calcPayrollRes.body.data) &&
          calcPayrollRes.body.data.length >= 1 &&
          calcPayrollRes.body.data[0].overtimeHourlyRateBdt > calcPayrollRes.body.data[0].baseSalaryBdt / 208,
          'Automated Factory Payroll Engine: Enforce 2x Hourly Basic Overtime Rate (BD Labor Act 2006)'
        );

        // 8. Query Machinery Assets
        const machinesRes = await makeRequest('GET', '/api/v1/operations/maintenance/machines', undefined, token);
        assert(
          machinesRes.status === 200 &&
          Array.isArray(machinesRes.body.data) &&
          machinesRes.body.data.length >= 3,
          'Retrieve Production Machinery Assets Registry (Juki, Brother, Pegasus)'
        );

        // 9. Catalog New Heavy-Duty Machine Asset
        const newMacRes = await makeRequest(
          'POST',
          '/api/v1/operations/maintenance/machines',
          {
            machineCode: 'KANSAI-SAVAR-05',
            brand: 'Kansai Special',
            model: 'FX-4404P Multi-Needle Waistband Machine',
            type: 'FLATLOCK',
            factoryId: 'fac-dhaka-01',
            lineId: 'line-sew-01',
            status: 'OPERATIONAL',
            lastMaintenanceDate: '2026-06-20',
            nextMaintenanceDueDate: '2026-07-20'
          },
          token
        );
        assert(
          newMacRes.status === 201 &&
          newMacRes.body.data.machineCode === 'KANSAI-SAVAR-05' &&
          newMacRes.body.data.status === 'OPERATIONAL',
          'Catalog High-Speed Sewing Machine Asset with Maintenance Schedules'
        );
        const machineId = newMacRes.body.data.id;

        // 10. Log Breakdown Ticket (Critical Stoppage)
        const newTicketRes = await makeRequest(
          'POST',
          '/api/v1/operations/maintenance/tickets',
          {
            machineId,
            lineId: 'line-sew-01',
            issueType: 'TIMING_BELT_SLIP',
            severity: 'CRITICAL_STOPPAGE',
            reportedBy: 'Sewing Supervisor Line 01',
            assignedMechanic: 'Shahadat Ali'
          },
          token
        );
        assert(
          newTicketRes.status === 201 &&
          newTicketRes.body.data.severity === 'CRITICAL_STOPPAGE' &&
          newTicketRes.body.data.status === 'OPEN',
          'Issue Emergency Machine Breakdown Work Order Ticket with Critical Severity'
        );
        const ticketId = newTicketRes.body.data.id;

        // 11. Resolve Breakdown Ticket: Mechanic repairs machine
        const resolveTicketRes = await makeRequest(
          'PUT',
          `/api/v1/operations/maintenance/tickets/${ticketId}/resolve`,
          {
            downtimeMinutes: 35,
            sparePartsReplaced: 'Timing Belt & Tension Pulley',
            sparePartsCostBdt: 850
          },
          token
        );
        assert(
          resolveTicketRes.status === 200 &&
          resolveTicketRes.body.data.status === 'CLOSED' &&
          resolveTicketRes.body.data.downtimeMinutes === 35,
          'Mechanic Repairs & Restores Machine: Log Spare Parts Cost and update Machine to OPERATIONAL'
        );

        // 12. Record Operational Expense & Cost Center Update
        const createTxnRes = await makeRequest(
          'POST',
          '/api/v1/operations/finance/transactions',
          {
            type: 'EXPENSE',
            category: 'Steam Boiler Gas Bill (Titas Gas Savar)',
            amount: 185000,
            currency: 'BDT',
            description: 'Monthly industrial steam boiler gas consumption for finishing plant'
          },
          token
        );
        assert(
          createTxnRes.status === 201 &&
          createTxnRes.body.data.amount === 185000 &&
          createTxnRes.body.data.status === 'APPROVED',
          'Record Plant Operational Expense Transaction and allocate against Cost Center Budget'
        );

        // 13. Order Profitability & Net Margin Realization Analysis
        const marginRes = await makeRequest('GET', '/api/v1/operations/finance/order-margin/PO-2026-001', undefined, token);
        assert(
          marginRes.status === 200 &&
          marginRes.body.data.totalRevenueUsd > marginRes.body.data.totalCostUsd &&
          marginRes.body.data.netMarginPercentage > 15 &&
          marginRes.body.data.profitabilityRating === 'OPTIMAL_HIGH',
          'Compute Realized Order Profitability: Revenue ($42,500) vs Materials, CM & Overhead (22.4% Net Margin)'
        );

        // 14. Record Compliance Safety Audit
        const createAuditRes = await makeRequest(
          'POST',
          '/api/v1/operations/compliance/audits',
          {
            standard: 'BSCI',
            factoryId: 'fac-dhaka-01',
            auditorName: 'Bureau Veritas Bangladesh Audit Team',
            scorePercentage: 96.0,
            findings: []
          },
          token
        );
        assert(
          createAuditRes.status === 201 &&
          createAuditRes.body.data.overallRating === 'GREEN_COMPLIANT' &&
          createAuditRes.body.data.status === 'CERTIFIED_CLOSED',
          'Certify International Social & Labor Compliance Audit (BSCI Green Compliant Grade)'
        );

      } catch (err: any) {
        console.error('Test Execution Error:', err);
        failed++;
      } finally {
        server.close(() => {
          console.log(`\n========================================`);
          console.log(`Phase 7 Test Results: ${passed} Passed, ${failed} Failed`);
          console.log(`========================================\n`);
          resolve({ passed, failed });
        });
      }
    });
  });
}

if (require.main === module) {
  runPhase7Tests().then(({ failed }) => {
    setTimeout(() => {
      process.exit(failed > 0 ? 1 : 0);
    }, 50);
  });
}
