const { execSync } = require('child_process');
const path = require('path');

console.log('========================================================');
console.log('🧪 GarmentERP BD — Automated Multi-Module Verification');
console.log('========================================================');

const serverDir = path.join(__dirname, '..', 'server');

try {
  console.log('\n▶ Running Phase 1 (Auth & RBAC) Tests...');
  execSync('node dist/tests/auth.test.js', { cwd: serverDir, stdio: 'inherit' });

  console.log('\n▶ Running Phase 2 (Merchandising, Costing & PO) Tests...');
  execSync('node dist/tests/merchandising.test.js', { cwd: serverDir, stdio: 'inherit' });

  console.log('\n▶ Running Phase 3 (Supply Chain, Procurement & Inventory) Tests...');
  execSync('node dist/tests/supplychain.test.js', { cwd: serverDir, stdio: 'inherit' });

  console.log('\n▶ Running Phase 4 (Production: Cutting, Bundles, Sewing Lines 01-04 & Packing) Tests...');
  execSync('node dist/tests/production.test.js', { cwd: serverDir, stdio: 'inherit' });

  console.log('\n▶ Running Phase 5 (Core QA/QC: 4-Point, Inline, Rework, CAPA & AQL 2.5) Tests...');
  execSync('node dist/tests/qa.test.js', { cwd: serverDir, stdio: 'inherit' });

  console.log('\n🎉 ALL 56 Integration Tests Passed with Zero Errors across all modules!');
  process.exit(0);
} catch (err) {
  console.error('\n❌ Test suite failed:', err);
  process.exit(1);
}
