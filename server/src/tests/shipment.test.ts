process.env.NODE_ENV = 'test';
import http from 'http';
import app from '../index';

const PORT = 5060;
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

export async function runPhase6Tests(): Promise<{ passed: number; failed: number }> {
  console.log('\n🧪 Starting GarmentERP BD Phase 6 (Shipment, Export Invoices, Packing & Gate Pass) Tests...\n');
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
        // 1. Authenticate as Super Admin / Commercial Officer
        const loginRes = await makeRequest('POST', '/api/v1/auth/login', {
          email: 'admin@garmenterp.com',
          password: 'Admin123!'
        });
        assert(loginRes.status === 200 && !!loginRes.body.data.accessToken, 'Super Admin / Commercial Authority Authentication & JWT Issuance');
        const token = loginRes.body.data.accessToken;

        // 2. Fetch Export Shipments List
        const listShipmentsRes = await makeRequest('GET', '/api/v1/shipments', undefined, token);
        assert(
          listShipmentsRes.status === 200 &&
          Array.isArray(listShipmentsRes.body.data) &&
          listShipmentsRes.body.data.length >= 1 &&
          listShipmentsRes.body.data[0].aqlOverallResult === 'ACCEPTED_PASS',
          'Retrieve Export Shipments catalog showing AQL ACCEPTED_PASS certified PO'
        );

        // 3. Verify Quality Gate: Passing PO
        const gatePassRes = await makeRequest('GET', '/api/v1/shipments/verify-gate?poNumber=PO-2026-001', undefined, token);
        assert(
          gatePassRes.status === 200 &&
          gatePassRes.body.data.verified === true &&
          !!gatePassRes.body.data.aqlRecord,
          'Pre-Shipment Quality Gate verifies certified PO-2026-001 as cleared for shipment'
        );

        // 4. Verify Quality Gate: Uninspected PO
        const gateFailRes = await makeRequest('GET', '/api/v1/shipments/verify-gate?poNumber=PO-UNINSPECTED-99', undefined, token);
        assert(
          gateFailRes.status === 200 &&
          gateFailRes.body.data.verified === false &&
          gateFailRes.body.data.error.includes('Quality Gate Violation'),
          'Pre-Shipment Quality Gate flags uninspected PO with explicit violation alert'
        );

        // 5. Strict Security Guard: Block shipment generation for uninspected PO
        const blockedShipmentRes = await makeRequest(
          'POST',
          '/api/v1/shipments',
          {
            poId: 'po-uninspected-99',
            poNumber: 'PO-UNINSPECTED-99',
            buyerId: 'byr-001',
            buyerName: 'H&M Hennes & Mauritz GBC AB',
            styleNumber: 'TSH-2026-001',
            orderQuantity: 2000,
            shippedQuantity: 2000,
            vesselOrFlight: 'CMA CGM VESSEL 101',
            etd: '2026-08-01',
            eta: '2026-08-25'
          },
          token
        );
        assert(
          blockedShipmentRes.status === 400 &&
          blockedShipmentRes.body.error.code === 'QUALITY_GATE_VIOLATION',
          'Strict Quality Gate Security: Block Unauthorized Shipment without AQL pass with 400 Bad Request'
        );

        // 6. Create Approved Shipment for Certified PO
        const validShipmentRes = await makeRequest(
          'POST',
          '/api/v1/shipments',
          {
            poId: 'po-001',
            poNumber: 'PO-2026-001',
            buyerId: 'byr-001',
            buyerName: 'H&M Hennes & Mauritz GBC AB',
            styleNumber: 'TSH-2026-001',
            orderQuantity: 5000,
            shippedQuantity: 5000,
            vesselOrFlight: 'ONE COLUMBA (Voyage 024E)',
            etd: '2026-07-10',
            eta: '2026-08-05'
          },
          token
        );
        assert(
          validShipmentRes.status === 201 &&
          validShipmentRes.body.data.status === 'PLANNED' &&
          validShipmentRes.body.data.aqlOverallResult === 'ACCEPTED_PASS',
          'Create Approved Export Shipment for AQL Certified PO'
        );
        const createdShipmentId = validShipmentRes.body.data.id;

        // 7. Get Commercial Invoices
        const invoicesRes = await makeRequest('GET', '/api/v1/shipments/docs/invoices', undefined, token);
        assert(
          invoicesRes.status === 200 &&
          Array.isArray(invoicesRes.body.data) &&
          invoicesRes.body.data.length >= 1,
          'Query Commercial Invoicing ledger with Letter of Credit (LC) and banking records'
        );

        // 8. Issue New Commercial Invoice
        const createInvoiceRes = await makeRequest(
          'POST',
          '/api/v1/shipments/docs/invoices',
          {
            poId: 'po-001',
            poNumber: 'PO-2026-001',
            buyerId: 'byr-001',
            buyerName: 'H&M Hennes & Mauritz GBC AB',
            styleNumber: 'TSH-2026-001',
            lcNumber: 'LC-DE-2026-992011',
            issuingBank: 'Deutsche Bank AG Frankfurt / Standard Chartered Dhaka',
            incoterms: 'FOB',
            portOfLoading: 'Chittagong Sea Port, Bangladesh (BDCGP)',
            portOfDischarge: 'Hamburg Port, Germany (DEHAM)',
            currency: 'USD',
            invoicedQuantity: 5000,
            unitPrice: 8.50,
            paymentTerms: '100% Irrevocable At-Sight LC',
            commercialOfficerSignoff: 'Kamrul Hasan (Head of Commercial)'
          },
          token
        );
        assert(
          createInvoiceRes.status === 201 &&
          createInvoiceRes.body.data.totalAmount === 42500.00 &&
          createInvoiceRes.body.data.incoterms === 'FOB',
          'Issue Customs-Compliant Export Commercial Invoice ($42,500.00 FOB Chittagong)'
        );
        const createdInvoiceNo = createInvoiceRes.body.data.invoiceNumber;

        // 9. Get Export Packing Lists
        const packingListsRes = await makeRequest('GET', '/api/v1/shipments/docs/packing-lists', undefined, token);
        assert(
          packingListsRes.status === 200 &&
          Array.isArray(packingListsRes.body.data),
          'Retrieve Export Packing Lists with Container Gross and Net Weights'
        );

        // 10. Create Export Packing List with CBM Calculation
        const createPlRes = await makeRequest(
          'POST',
          '/api/v1/shipments/docs/packing-lists',
          {
            poId: 'po-001',
            poNumber: 'PO-2026-001',
            invoiceNumber: createdInvoiceNo,
            containerType: '40FT_HQ',
            containerNumber: 'CMAU-882194-0',
            sealNumber: 'BD-SEAL-77123',
            cartonBreakdown: [
              {
                cartonRange: 'CTN 001 - 050',
                sizeRatio: 'S:10, M:20, L:20, XL:10 (60 pcs/ctn)',
                pcsPerCarton: 60,
                totalCartons: 50,
                totalPcs: 3000,
                grossWeightKg: 850.00,
                netWeightKg: 750.00,
                dimensionsCm: '60 x 40 x 30'
              },
              {
                cartonRange: 'CTN 051 - 084',
                sizeRatio: 'S:10, M:20, L:20, XL:10 (60 pcs/ctn)',
                pcsPerCarton: 60,
                totalCartons: 34,
                totalPcs: 2000,
                grossWeightKg: 578.00,
                netWeightKg: 510.00,
                dimensionsCm: '60 x 40 x 30'
              }
            ]
          },
          token
        );
        assert(
          createPlRes.status === 201 &&
          createPlRes.body.data.totalCartons === 84 &&
          createPlRes.body.data.totalGrossWeightKg === 1428.00 &&
          createPlRes.body.data.totalCbm > 0,
          'Generate Export Packing List with Automated CBM (15.12 CBM) and 40FT HQ Container Seal'
        );

        // 11. Authorize Security Gate Pass
        const createGatePassRes = await makeRequest(
          'POST',
          '/api/v1/shipments/gate-passes',
          {
            shipmentId: createdShipmentId,
            poNumber: 'PO-2026-001',
            invoiceNumber: createdInvoiceNo,
            vehicleNumber: 'DHAKA METRO-TA 14-3329 (Covered Van)',
            driverName: 'Mohammad Shafiullah',
            driverPhone: '+8801819-876543',
            containerSealNumber: 'BD-SEAL-77123',
            destination: 'Chittagong Port CFS Depot',
            securityOfficer: 'Capt. Mahmudur Rahman (Security Head)'
          },
          token
        );
        assert(
          createGatePassRes.status === 201 &&
          createGatePassRes.body.data.status === 'PENDING_EXIT' &&
          createGatePassRes.body.data.driverName === 'Mohammad Shafiullah',
          'Authorize Plant Security Gate Pass with Driver Credentials and Container Seal Verification'
        );
        const gatePassId = createGatePassRes.body.data.id;

        // 12. Dispatch Truck: Transition to DISPATCHED_GATE_OUT
        const dispatchRes = await makeRequest(
          'PUT',
          `/api/v1/shipments/gate-passes/${gatePassId}/status`,
          { status: 'DISPATCHED_GATE_OUT' },
          token
        );
        assert(
          dispatchRes.status === 200 &&
          dispatchRes.body.data.status === 'DISPATCHED_GATE_OUT' &&
          !!dispatchRes.body.data.exitTimestamp,
          'Dispatch Container Truck from Factory Gate: Record Timestamp and update Shipment status to GATE_OUT'
        );

      } catch (err: any) {
        console.error('Test Execution Error:', err);
        failed++;
      } finally {
        server.close(() => {
          console.log(`\n========================================`);
          console.log(`Phase 6 Test Results: ${passed} Passed, ${failed} Failed`);
          console.log(`========================================\n`);
          resolve({ passed, failed });
        });
      }
    });
  });
}

if (require.main === module) {
  runPhase6Tests().then(({ failed }) => {
    setTimeout(() => {
      process.exit(failed > 0 ? 1 : 0);
    }, 50);
  });
}
