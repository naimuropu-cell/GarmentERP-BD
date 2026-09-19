process.env.NODE_ENV = 'test';
import http from 'http';
import app from '../index';

const PORT = 5064;
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

export async function runPhase8Tests(): Promise<{ passed: number; failed: number }> {
  console.log('\n🧪 Starting GarmentERP BD Phase 8 (System Intelligence, 360° Traceability & Executive BI) Tests...\n');
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

  let adminToken = '';
  let simulatedAlertId = '';

  try {
    // 1. Authentication
    const loginRes = await makeRequest('POST', '/api/v1/auth/login', {
      email: 'admin@garmenterp.com',
      password: 'Admin123!'
    });
    assert(loginRes.status === 200 && loginRes.body.success, 'Executive & System Authority Authentication & JWT Issuance');
    adminToken = loginRes.body.data.accessToken;

    // 2. Order Traceability 360° for valid PO
    const traceRes = await makeRequest('GET', '/api/v1/analytics/order-traceability/PO-2026-001', undefined, adminToken);
    assert(
      traceRes.status === 200 &&
      traceRes.body.data.poNumber === 'PO-2026-001' &&
      traceRes.body.data.totalRevenueUsd === 80000 &&
      traceRes.body.data.overallHealth === 'HEALTHY_ON_TRACK',
      'Order Traceability 360°: Retrieve unified digital passport for PO-2026-001 ($80,000 Revenue)'
    );

    // 3. Rejects invalid PO
    const invalidTraceRes = await makeRequest('GET', '/api/v1/analytics/order-traceability/PO-INVALID-99', undefined, adminToken);
    assert(invalidTraceRes.status === 404 && !invalidTraceRes.body.success, 'Order Traceability 360°: Safely reject non-existent purchase order with 404');

    // 4. Milestone chronological sequence integrity
    const milestones = traceRes.body.data.milestones || [];
    assert(
      milestones.length === 10 &&
      milestones[0].stageCode === 'BUYER_PO_CONTRACT' &&
      milestones[9].stageCode === 'EXPORT_DISPATCH_AND_MARGIN',
      'Milestone Chronology Integrity: 10 chronological stages from PO Registration to Port Gate Out'
    );

    // 5. Milestone Quality Gate validation
    const allQualityGatesPassed = milestones.every((m: any) => m.passedQualityGate === true);
    assert(allQualityGatesPassed, 'Milestone Quality Gate Security: All 10 manufacturing checkpoints verified and signed off');

    // 6. Executive BI & OEE summary computation
    const execRes = await makeRequest('GET', '/api/v1/analytics/executive-summary', undefined, adminToken);
    const summary = execRes.body.data;
    assert(
      execRes.status === 200 &&
      summary.efficiency.overallOeePercentage >= 80 &&
      summary.pipeline.totalRevenueUsd >= 42500 &&
      summary.pipeline.shippedOrders >= 1,
      'Executive Plant BI Engine: Compute Overall Equipment Effectiveness (85.1% OEE) and Revenue Pipeline'
    );

    // 7. Multi-Line real-time efficiency metrics
    const lines = summary.efficiency.linesEfficiency || [];
    assert(
      lines.length === 4 &&
      lines[0].lineNumber === 'Line 01' &&
      lines[0].efficiencyPercent > 90,
      'Multi-Line Telemetry: Real-time efficiency and hourly piece output across Sewing Lines 01 to 04'
    );

    // 8. Quality health index metrics
    assert(
      summary.quality.factoryDhuPercentage < 2.0 &&
      summary.quality.aqlPassRatePercentage === 100.0,
      'Quality Health Index: Factory Average DHU (1.18%) and ISO AQL 2.5 pass rate (100%)'
    );

    // 9. Workforce & machinery telemetry
    assert(
      summary.workforce.attendanceRatePercentage > 90 &&
      summary.machinery.operationalUptimePercentage >= 75,
      'Plant Operations Telemetry: Workforce attendance rate (>90%) and machine fleet uptime (>75%)'
    );

    // 10. Query system event stream alerts
    const alertsRes = await makeRequest('GET', '/api/v1/analytics/alerts', undefined, adminToken);
    assert(
      alertsRes.status === 200 &&
      alertsRes.body.data.length >= 2,
      'Event Stream Alerts Engine: Ingest and query active factory notifications ledger'
    );

    // 11. Query alerts filtered by severity
    const critAlertsRes = await makeRequest('GET', '/api/v1/analytics/alerts?severity=CRITICAL', undefined, adminToken);
    assert(
      critAlertsRes.status === 200 &&
      critAlertsRes.body.data.every((a: any) => a.severity === 'CRITICAL'),
      'Alert Filtering: Filter plant alerts by CRITICAL severity threshold'
    );

    // 12. Simulate real-time factory floor alert
    const simRes = await makeRequest(
      'POST',
      '/api/v1/analytics/alerts/simulate',
      {
        severity: 'CRITICAL',
        category: 'QUALITY',
        sourceModule: 'SEWING_QC',
        title: 'Emergency DHU Spike on Line 02',
        message: 'Continuous puckering defect detected on 12 consecutive pieces. Line supervisor flagged.',
        referenceId: 'PO-2026-001'
      },
      adminToken
    );
    assert(
      simRes.status === 201 &&
      simRes.body.data.severity === 'CRITICAL' &&
      simRes.body.data.id,
      'Event Dispatch: Simulate real-time factory telemetry sensor alert with immediate broadcast'
    );
    simulatedAlertId = simRes.body.data.id;

    // 13. Acknowledge and resolve critical alert
    const ackRes = await makeRequest(
      'POST',
      '/api/v1/analytics/alerts/acknowledge',
      {
        alertId: simulatedAlertId,
        acknowledgedBy: 'QA Manager Tariqul'
      },
      adminToken
    );
    assert(
      ackRes.status === 200 &&
      ackRes.body.data.acknowledged === true &&
      ackRes.body.data.acknowledgedBy === 'QA Manager Tariqul',
      'Alert Acknowledgment: Operations authority acknowledges alert and updates resolution audit trail'
    );

    // 14. Multi-factory comparative benchmarks
    const compRes = await makeRequest('GET', '/api/v1/analytics/factory-comparison', undefined, adminToken);
    assert(
      compRes.status === 200 &&
      compRes.body.data.length === 2 &&
      compRes.body.data[0].code === 'AG-SAVAR-01' &&
      compRes.body.data[1].code === 'AG-GAZI-02',
      'Cross-Factory Benchmarking: Side-by-side comparative analytics for Savar Unit 1 vs Gazipur Complex'
    );

  } catch (err) {
    console.error('Test execution error:', err);
    failed++;
  }

  console.log('\n========================================');
  console.log(`Phase 8 Test Results: ${passed} Passed, ${failed} Failed`);
  console.log('========================================\n');
  return { passed, failed };
}

// Standalone execution
if (require.main === module) {
  server = app.listen(PORT, async () => {
    try {
      const results = await runPhase8Tests();
      server.close();
      setTimeout(() => process.exit(results.failed > 0 ? 1 : 0), 50);
    } catch (err) {
      console.error(err);
      server.close();
      setTimeout(() => process.exit(1), 50);
    }
  });
}
