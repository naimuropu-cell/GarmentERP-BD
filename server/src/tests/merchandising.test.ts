process.env.NODE_ENV = 'test';
import http from 'http';
import app from '../index';

const PORT = 5056;
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

async function runPhase2Tests() {
  console.log('\n🧪 Starting GarmentERP BD Phase 2 (Merchandising, Tech Pack, PO & Costing) Automated Test Suite...\n');
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

  // 1. Authenticate Merchandiser
  const loginRes = await makeRequest('POST', '/api/v1/auth/login', {
    email: 'merchandiser@garmenterp.com',
    password: 'Merch123!'
  });
  assert(loginRes.status === 200 && !!loginRes.body.data.accessToken, 'Merchandiser login returns 200 and access token');
  const merchToken = loginRes.body.data?.accessToken;

  // 2. Fetch Export Buyers List
  const buyersRes = await makeRequest('GET', '/api/v1/buyers');
  assert(
    buyersRes.status === 200 && buyersRes.body.data.some((b: any) => b.code === 'HM-EU'),
    'Buyer catalog returns global export buyers (H&M, Zara, Target)'
  );

  // 3. Merchandiser creates new Buyer
  const createBuyerRes = await makeRequest(
    'POST',
    '/api/v1/buyers',
    {
      name: 'Marks & Spencer Reliance India/UK',
      code: 'M&S-UK',
      country: 'United Kingdom',
      currency: 'GBP',
      paymentTerms: 'LC at sight 60 days',
      shippingTerms: 'FOB',
      portOfDischarge: 'Port of Felixstowe',
      contacts: [
        { name: 'Oliver Smith', email: 'oliver.smith@mns.com', phone: '+44 20 7935 4422', designation: 'Garment Merchandiser' }
      ]
    },
    merchToken
  );
  assert(createBuyerRes.status === 201 && createBuyerRes.body.data.code === 'M&S-UK', 'Merchandiser creates new buyer profile with contact & LC terms');

  // 4. Fetch Styles with Multi-Version Tech Packs
  const stylesRes = await makeRequest('GET', '/api/v1/styles');
  const poloStyle = stylesRes.body.data.find((s: any) => s.styleNumber === 'TSH-2026-001');
  assert(
    stylesRes.status === 200 && poloStyle.techPackVersions.length >= 2,
    'Styles contain multi-version Tech Packs (v1.0 & v2.0)'
  );

  // 5. Verify Measurement Tolerances in Active Tech Pack
  const activeVersion = poloStyle.techPackVersions.find((v: any) => v.version === poloStyle.activeTechPackVersion);
  const chestMeasure = activeVersion.measurements.find((m: any) => m.code === 'CHEST');
  assert(
    chestMeasure && chestMeasure.tolerancePlusCm === 1.0 && chestMeasure.specsBySize['L'] === 56,
    'Tech Pack v2.0 enforces measurement specifications and +/- tolerances'
  );

  // 6. Pre-Costing Sheet Calculation & Margin Controls
  const costingRes = await makeRequest('GET', '/api/v1/costing');
  const poloCosting = costingRes.body.data.find((c: any) => c.styleNumber === 'TSH-2026-001');
  assert(
    costingRes.status === 200 && poloCosting.totalCostUsd === 6.50 && poloCosting.profitMarginUsd === 1.50,
    'Costing accurately computes Material ($4.20) + CM ($1.80) + Overhead ($0.50) = $6.50 and Margin $1.50'
  );

  // 7. Management Approves Costing Sheet
  const adminLogin = await makeRequest('POST', '/api/v1/auth/login', {
    email: 'admin@garmenterp.com',
    password: 'Admin123!'
  });
  const adminToken = adminLogin.body.data?.accessToken;

  const approveCostingRes = await makeRequest(
    'PUT',
    `/api/v1/costing/${poloCosting.id}/approve`,
    {},
    adminToken
  );
  assert(approveCostingRes.status === 200 && approveCostingRes.body.data.status === 'APPROVED', 'Management / Admin signs off Costing Sheet');

  // 8. Buyer Purchase Order Creation with Color/Size Matrix
  const createPORes = await makeRequest(
    'POST',
    '/api/v1/orders/po',
    {
      poNumber: 'PO-2026-003',
      buyerId: poloStyle.buyerId,
      styleId: poloStyle.id,
      unitPriceUsd: 8.50,
      exFactoryDeliveryDate: '2026-12-15',
      colorSizeBreakdown: [
        { color: 'Navy Blue', size: 'M', quantity: 2000 },
        { color: 'Navy Blue', size: 'L', quantity: 2000 },
        { color: 'Navy Blue', size: 'XL', quantity: 1000 }
      ]
    },
    merchToken
  );
  assert(
    createPORes.status === 201 && createPORes.body.data.orderQuantity === 5000 && createPORes.body.data.totalOrderValueUsd === 42500,
    'Buyer PO created with 5,000 pcs matrix totaling $42,500'
  );

  // 9. Automatic BOM & MRP Shortage Generation
  const newPO = createPORes.body.data;
  const fabricBOM = newPO.bom.find((b: any) => b.itemType === 'FABRIC');
  assert(
    fabricBOM && fabricBOM.totalRequiredQty > 0 && typeof fabricBOM.shortageQty === 'number',
    'Automatic BOM & MRP calculation computes total required fabric and shortage'
  );

  // 10. Update PO Status to IN_PRODUCTION
  const updateStatusRes = await makeRequest(
    'PUT',
    `/api/v1/orders/po/${newPO.id}/status`,
    { status: 'IN_PRODUCTION' },
    merchToken
  );
  assert(updateStatusRes.status === 200 && updateStatusRes.body.data.status === 'IN_PRODUCTION', 'PO transitions to IN_PRODUCTION workflow state');

  console.log(`\n========================================`);
  console.log(`Phase 2 Test Summary: ${passed} Passed, ${failed} Failed`);
  console.log(`========================================\n`);

  server.close(() => {
    process.exit(failed > 0 ? 1 : 0);
  });
}

server = app.listen(PORT, () => {
  runPhase2Tests().catch(err => {
    console.error('Phase 2 Test run failure:', err);
    server.close(() => process.exit(1));
  });
});
