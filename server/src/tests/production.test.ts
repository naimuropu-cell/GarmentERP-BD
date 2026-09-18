process.env.NODE_ENV = 'test';
import http from 'http';
import app from '../index';

const PORT = 5058;
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

async function runPhase4Tests() {
  console.log('\n🧪 Starting GarmentERP BD Phase 4 (Production: Cutting, Relaxation, Bundles, Sewing Lines 01-04 & Packing) Tests...\n');
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

  try {
    // 1. Authenticate as Super Admin
    const loginRes = await makeRequest('POST', '/api/v1/auth/login', {
      email: 'admin@garmenterp.com',
      password: 'Admin123!'
    });
    assert(loginRes.status === 200 && !!loginRes.body.data.accessToken, 'Super Admin Authentication & JWT Generation');
    const adminToken = loginRes.body.data.accessToken;

    // 2. Fetch Fabric Relaxation Logs
    const rlxListRes = await makeRequest('GET', '/api/v1/production/relaxation', null, adminToken);
    assert(
      rlxListRes.status === 200 && Array.isArray(rlxListRes.body.data) && rlxListRes.body.data.length >= 2,
      'Retrieve Fabric Relaxation rolls with 24h tension release tracking'
    );

    // 3. Start New Fabric Roll Relaxation (24h Requirement)
    const newRlxRes = await makeRequest('POST', '/api/v1/production/relaxation', {
      rollNumber: `ROL-HOD-${Date.now().toString().slice(-4)}`,
      fabricLot: 'LOT-HM-2026-F1',
      fabricType: '80/20 Cotton/Poly 320 GSM Brushed Fleece',
      color: 'Heather Grey',
      weightGsm: 320,
      rollLengthMeters: 100,
      warehouseBin: 'R-B2-04',
      durationHours: 24,
      notes: 'Heavy fleece tension release before automatic lay'
    }, adminToken);
    assert(
      newRlxRes.status === 201 && newRlxRes.body.data.status === 'RELAXING' && !!newRlxRes.body.data.targetReadyTime,
      'Initiate 24h Fabric Relaxation Countdown with target ready timestamp'
    );
    const createdRlxId = newRlxRes.body.data.id;

    // 4. Complete Fabric Relaxation (Verify Ready for Cut)
    const completeRlxRes = await makeRequest('PUT', `/api/v1/production/relaxation/${createdRlxId}/complete`, {}, adminToken);
    assert(
      completeRlxRes.status === 200 && completeRlxRes.body.data.status === 'READY_FOR_CUT',
      'Certify Fabric Roll Relaxation Complete & Ready for Cutting Lay'
    );

    // 5. Fetch Cut Orders
    const cutOrdersRes = await makeRequest('GET', '/api/v1/production/cut-orders', null, adminToken);
    assert(
      cutOrdersRes.status === 200 && cutOrdersRes.body.data.some((c: any) => c.cutNumber === 'CUT-2026-001'),
      'Fetch Cut Orders linked to Buyer PO & Style with Marker Efficiency'
    );

    // 6. Create New Cut Order with Color/Size Matrix
    const newCutRes = await makeRequest('POST', '/api/v1/production/cut-orders', {
      cutNumber: `CUT-TEST-${Date.now().toString().slice(-4)}`,
      poNumber: 'PO-2026-002',
      buyerName: 'Target Brands Inc.',
      styleNumber: 'HOD-2026-002',
      styleName: 'Unisex Brushed Heavy Fleece Pullover Hoodie',
      markerLengthMeters: 9.4,
      pliesCount: 60,
      markerEfficiencyPercent: 88.7,
      cuttingTableId: 'line-cut-1',
      cuttingTableName: 'Cut Table 01 (Gerber Spreader)',
      colorSizeBreakdown: [
        { color: 'Heather Grey', size: 'M', plannedPcs: 1000 },
        { color: 'Heather Grey', size: 'L', plannedPcs: 1000 }
      ]
    }, adminToken);
    assert(
      newCutRes.status === 201 && newCutRes.body.data.totalPlannedPcs === 2000,
      'Create Production Cut Order with Plies, Lay Length & Marker Efficiency %'
    );
    const createdCutId = newCutRes.body.data.id;

    // 7. Generate QR / Barcode Bundles for Cut Order
    const genBundlesRes = await makeRequest('POST', `/api/v1/production/cut-orders/${createdCutId}/bundles`, {
      bundleSize: 250
    }, adminToken);
    assert(
      genBundlesRes.status === 201 && genBundlesRes.body.count === 8,
      'Automated QR/Barcode Bundle Generation (8 bundles of 250 pcs from 2000 cut pieces)'
    );

    // 8. List All Production Bundles
    const bundlesListRes = await makeRequest('GET', '/api/v1/production/bundles', null, adminToken);
    assert(
      bundlesListRes.status === 200 && bundlesListRes.body.data.length >= 13,
      'Query Bundle Ticketing Registry with Barcodes and Piece Serial Ranges'
    );

    // 9. Record Hourly Output on Sewing Line
    const hourlyLogRes = await makeRequest('POST', '/api/v1/production/sewing/hourly', {
      lineId: 'line-sew-01',
      lineNumber: 'Sewing Line 01 (Polo Shirt)',
      hourSlot: '14:00 - 15:00',
      styleNumber: 'TSH-2026-001',
      poNumber: 'PO-2026-001',
      targetQty: 120,
      actualQty: 124,
      rejectedQty: 1,
      operatorCount: 38,
      helperCount: 10,
      smv: 14.5
    }, adminToken);
    assert(
      hourlyLogRes.status === 201 && hourlyLogRes.body.data.efficiencyPercent >= 103.0,
      'Record Real-Time Sewing Hourly Output with Calculated Line Efficiency %'
    );

    // 10. Sewing Floor Executive Summary for Lines 01 to 04
    const linesSummaryRes = await makeRequest('GET', '/api/v1/production/sewing/lines-summary', null, adminToken);
    assert(
      linesSummaryRes.status === 200 && linesSummaryRes.body.data.length === 4,
      'Retrieve Real-Time Efficiency Summary for Sewing Lines 01 to 04'
    );

    // 11. Update Finishing Batch Pipeline Stage
    const finishListRes = await makeRequest('GET', '/api/v1/production/finishing', null, adminToken);
    const firstBatchId = finishListRes.body.data[0]?.id;
    const updateFinRes = await makeRequest('PUT', `/api/v1/production/finishing/${firstBatchId}/stage`, {
      stage: 'steamIronedPcs',
      quantity: 50
    }, adminToken);
    assert(
      updateFinRes.status === 200 && updateFinRes.body.data.steamIronedPcs === 2500,
      'Advance Finishing Section Process (Thread Trimming -> Steam Press -> Metal Check)'
    );

    // 12. Create Carton Packing Record with Ratio Assortment
    const cartonRes = await makeRequest('POST', '/api/v1/production/packing', {
      cartonNumber: `CTN-PO01-${Date.now().toString().slice(-4)}`,
      poNumber: 'PO-2026-001',
      buyerPo: 'HM-PO-99201',
      styleNumber: 'TSH-2026-001',
      color: 'White',
      sizeRatio: { S: 10, M: 20, L: 20, XL: 10 },
      grossWeightKg: 14.2,
      netWeightKg: 12.8,
      cartonDimensionsCm: '60 x 40 x 30',
      barcode: `BC-CTN-HM-${Date.now().toString().slice(-4)}`
    }, adminToken);
    assert(
      cartonRes.status === 201 && cartonRes.body.data.totalPcsPerCarton === 60,
      'Pack Carton with Ratio Assortment (S:10, M:20, L:20, XL:10 = 60 pcs) & Weight Audit'
    );

  } catch (error) {
    console.error('Test execution error:', error);
    failed++;
  } finally {
    console.log(`\n========================================`);
    console.log(`Phase 4 Test Results: ${passed} Passed, ${failed} Failed`);
    console.log(`========================================\n`);

    server.close(() => {
      process.exit(failed > 0 ? 1 : 0);
    });
  }
}

server = app.listen(PORT, () => {
  runPhase4Tests();
});
