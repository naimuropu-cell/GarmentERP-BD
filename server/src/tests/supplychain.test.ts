process.env.NODE_ENV = 'test';
import http from 'http';
import app from '../index';

const PORT = 5057;
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

async function runPhase3Tests() {
  console.log('\n🧪 Starting GarmentERP BD Phase 3 (Supply Chain, Procurement, GRN & Negative Stock Engine) Tests...\n');
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

    // 2. Fetch Suppliers Directory
    const supListRes = await makeRequest('GET', '/api/v1/suppliers', null, adminToken);
    assert(
      supListRes.status === 200 && Array.isArray(supListRes.body.data) && supListRes.body.data.length >= 4,
      'List Bangladesh Raw Material Suppliers (Paramount, YKK, Coats, Dekko)'
    );

    // 3. Register New Certified Vendor
    const newSupRes = await makeRequest('POST', '/api/v1/suppliers', {
      name: 'Ha-Meem Denim Mills Ltd.',
      code: 'HAMEEM-BD',
      category: 'FABRIC',
      country: 'Bangladesh',
      city: 'Ashulia, Dhaka',
      leadTimeDays: 12,
      qualityRating: 4.80,
      onTimeDeliveryRate: 97.0,
      paymentTerms: 'LC 90 Days',
      contactPerson: 'Md. Delwar Hossain',
      email: 'denim-sales@hameemgroup.com',
      materialsSupplied: ['12.5oz Indigo Ring Denim', 'Stretch Twill 280 GSM']
    }, adminToken);
    assert(
      newSupRes.status === 201 && newSupRes.body.data.code === 'HAMEEM-BD',
      'Register New Certified Fabric Supplier (Ha-Meem Denim)'
    );

    // 4. Fetch Purchase Requisitions (Linked to Shortages)
    const prListRes = await makeRequest('GET', '/api/v1/requisitions', null, adminToken);
    assert(
      prListRes.status === 200 && prListRes.body.data.length >= 1,
      'Retrieve Purchase Requisitions triggered from PO Material Shortage'
    );

    // 5. Create New Requisition
    const newPrRes = await makeRequest('POST', '/api/v1/requisitions', {
      prNumber: `PR-TEST-${Date.now()}`,
      poNumber: 'PO-2026-002',
      buyerName: 'Target Brands Inc.',
      department: 'Merchandising & Sourcing',
      urgency: 'HIGH',
      items: [
        {
          sku: 'FAB-FLEECE-320',
          itemName: '80/20 Cotton/Poly 320 GSM Brushed Fleece',
          unit: 'KG',
          requiredQty: 7688,
          estimatedUnitPriceUsd: 5.20,
          estimatedTotalUsd: 39977.60,
          neededByDate: '2026-10-15'
        }
      ]
    }, adminToken);
    assert(
      newPrRes.status === 201 && newPrRes.body.data.status === 'PENDING_APPROVAL',
      'Draft Purchase Requisition for Fleece Shortage (7,688 KG)'
    );
    const createdPrId = newPrRes.body.data.id;

    // 6. Approve Purchase Requisition
    const approvePrRes = await makeRequest('PUT', `/api/v1/requisitions/${createdPrId}/approve`, {}, adminToken);
    assert(
      approvePrRes.status === 200 && approvePrRes.body.data.status === 'APPROVED',
      'Management Approval Gate for Purchase Requisition'
    );

    // 7. Generate Supplier Purchase Order (SPO)
    const newSpoRes = await makeRequest('POST', '/api/v1/procurement/orders', {
      spoNumber: `SPO-TEST-${Date.now()}`,
      prNumber: newPrRes.body.data.prNumber,
      supplierId: newSupRes.body.data.id,
      supplierName: 'Ha-Meem Denim Mills Ltd.',
      currency: 'USD',
      items: [
        {
          sku: 'FAB-FLEECE-320',
          itemName: '80/20 Cotton/Poly 320 GSM Brushed Fleece',
          unit: 'KG',
          orderedQty: 7688,
          unitPrice: 5.20
        }
      ]
    }, adminToken);
    assert(
      newSpoRes.status === 201 && newSpoRes.body.data.totalAmount > 0,
      'Dispatch Supplier Purchase Order (SPO) to Vendor'
    );

    // 8. Record Goods Received Note (GRN) Inbound
    const grnRes = await makeRequest('POST', '/api/v1/grn', {
      grnNumber: `GRN-TEST-${Date.now()}`,
      spoNumber: newSpoRes.body.data.spoNumber,
      supplierName: 'Ha-Meem Denim Mills Ltd.',
      warehouseId: 'wh-savar-fabric',
      warehouseName: 'Central Bonded Fabric Warehouse',
      vehicleNumber: 'DHAKA-METRO-TA-18-4455',
      challanNumber: 'HM-CH-8831',
      driverName: 'Mohammad Rafiq',
      qcInspectionStatus: 'PASSED',
      items: [
        {
          sku: 'FAB-FLEECE-320',
          itemName: '80/20 Cotton/Poly 320 GSM Brushed Fleece',
          orderedQty: 7688,
          receivedQty: 7688,
          acceptedQty: 7688,
          rejectedQty: 0,
          unit: 'KG',
          lotNumber: 'LOT-HM-2026-F1',
          shadeBand: 'Band A (Delta-E < 0.4)',
          binCode: 'R-B2-04'
        }
      ]
    }, adminToken);
    assert(
      grnRes.status === 201 && grnRes.body.data.qcInspectionStatus === 'PASSED',
      'Record Inbound Gate Entry & QC Passed GRN'
    );

    // 9. Multi-Warehouse Stock Query (Verify Automatic Stock Addition)
    const stockRes = await makeRequest('GET', '/api/v1/inventory/stock', null, adminToken);
    const fleeceStock = stockRes.body.data.find((s: any) => s.sku === 'FAB-FLEECE-320');
    assert(
      stockRes.status === 200 && fleeceStock && fleeceStock.availableQty >= 7688,
      'Verify Stock Auto-Increment and Multi-Warehouse Bin Placement'
    );

    // 10. Issue Stock to Production Line
    const issueRes = await makeRequest('POST', '/api/v1/inventory/transactions/issue', {
      sku: 'FAB-FLEECE-320',
      quantity: 500,
      targetLine: 'Cut Table 01 (Gerber Spreader)',
      referenceDoc: 'LINE-ISSUE-SLIP-01',
      reason: 'Issue fabric rolls for Hoodie cut lay #1'
    }, adminToken);
    assert(
      issueRes.status === 200 && issueRes.body.data.updatedStock.availableQty === (fleeceStock.availableQty - 500),
      'Issue Stock to Production Line and Safely Deduct Inventory'
    );

    // 11. CRITICAL TEST: Attempt Negative Stock Issuance (Must be Rejected)
    const negativeAttemptRes = await makeRequest('POST', '/api/v1/inventory/transactions/issue', {
      sku: 'FAB-FLEECE-320',
      quantity: 9999999, // Way more than available stock
      targetLine: 'Sewing Line 01',
      referenceDoc: 'INVALID-SLIP',
      reason: 'Attempt unauthorized over-issuance'
    }, adminToken);
    assert(
      negativeAttemptRes.status === 400 &&
      negativeAttemptRes.body.error?.code === 'STOCK_ISSUANCE_REJECTED' &&
      negativeAttemptRes.body.error?.message.includes('Negative stock issuance is strictly rejected'),
      'Strict Negative Inventory Protection Engine: Block Over-Issuance with 400 Bad Request'
    );

    // 12. Stock Transactions Ledger Audit
    const txListRes = await makeRequest('GET', '/api/v1/inventory/transactions', null, adminToken);
    assert(
      txListRes.status === 200 && txListRes.body.data.length >= 2,
      'Audit Tamper-Evident Multi-Warehouse Stock Transaction Ledger'
    );

  } catch (error) {
    console.error('Test execution error:', error);
    failed++;
  } finally {
    console.log(`\n========================================`);
    console.log(`Phase 3 Test Results: ${passed} Passed, ${failed} Failed`);
    console.log(`========================================\n`);

    server.close(() => {
      process.exit(failed > 0 ? 1 : 0);
    });
  }
}

server = app.listen(PORT, () => {
  runPhase3Tests();
});
