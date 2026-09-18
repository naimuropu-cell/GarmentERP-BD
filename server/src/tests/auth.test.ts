process.env.NODE_ENV = 'test';
import http from 'http';
import app from '../index';

const PORT = 5055;
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

async function runTests() {
  console.log('\n🧪 Starting GarmentERP BD Phase 1 Automated Test Suite...\n');
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

  // 1. Health check
  const healthRes = await makeRequest('GET', '/health');
  assert(healthRes.status === 200 && healthRes.body.status === 'HEALTHY', 'Health check endpoint returns 200 HEALTHY');

  // 2. Super Admin Login
  const loginRes = await makeRequest('POST', '/api/v1/auth/login', {
    email: 'admin@garmenterp.com',
    password: 'Admin123!'
  });
  assert(loginRes.status === 200 && !!loginRes.body.data.accessToken, 'Super Admin login returns 200 and access token');
  const adminToken = loginRes.body.data?.accessToken;

  // 3. Invalid credentials rejection
  const invalidLogin = await makeRequest('POST', '/api/v1/auth/login', {
    email: 'admin@garmenterp.com',
    password: 'WrongPassword999!'
  });
  assert(invalidLogin.status === 401, 'Invalid password is fundamentally rejected with 401');

  // 4. Merchandiser Login
  const merchLogin = await makeRequest('POST', '/api/v1/auth/login', {
    email: 'merchandiser@garmenterp.com',
    password: 'Merch123!'
  });
  assert(merchLogin.status === 200, 'Merchandiser login succeeds with 200');
  const merchToken = merchLogin.body.data?.accessToken;

  // 5. Protected /auth/me with Admin Token
  const meRes = await makeRequest('GET', '/api/v1/auth/me', null, adminToken);
  assert(meRes.status === 200 && meRes.body.data.role.code === 'SUPER_ADMIN', '/auth/me returns authenticated Super Admin profile');

  // 6. RBAC Check: Merchandiser attempting Admin-only user role modification
  const forbiddenRes = await makeRequest(
    'PUT',
    '/api/v1/auth/users/usr-admin-01/role',
    { roleCode: 'MERCHANDISER' },
    merchToken
  );
  assert(
    forbiddenRes.status === 403 && forbiddenRes.body.error.code === 'PERMISSION_DENIED',
    'RBAC strictly denies role modification for unauthorized Merchandiser role'
  );

  // 7. Organization Hierarchy
  const orgRes = await makeRequest('GET', '/api/v1/organization/hierarchy');
  assert(
    orgRes.status === 200 && orgRes.body.data.factories.length >= 2,
    'Organization hierarchy returns Bangladesh factories (Savar & Gazipur)'
  );

  // 8. Production Lines Count
  const factoriesRes = await makeRequest('GET', '/api/v1/organization/factories');
  assert(
    factoriesRes.status === 200 && factoriesRes.body.data[0].totalProductionLines > 0,
    'Factories contain active Cutting and Sewing production lines'
  );

  // 9. Warehouse Inventory Locations
  const warehouseRes = await makeRequest('GET', '/api/v1/organization/warehouses');
  assert(
    warehouseRes.status === 200 && warehouseRes.body.data.length >= 4,
    'Warehouses include Fabric, Trims, Accessories, and Finished Goods bonded stores'
  );

  // 10. Audit Logs Inspection
  const auditRes = await makeRequest('GET', '/api/v1/audit/logs', null, adminToken);
  assert(
    auditRes.status === 200 && auditRes.body.data.total >= 2,
    'Audit trail captures logins and system genesis records'
  );

  console.log(`\n========================================`);
  console.log(`Test Summary: ${passed} Passed, ${failed} Failed`);
  console.log(`========================================\n`);

  server.close(() => {
    process.exit(failed > 0 ? 1 : 0);
  });
}

server = app.listen(PORT, () => {
  runTests().catch(err => {
    console.error('Test run failure:', err);
    server.close();
    process.exit(1);
  });
});
