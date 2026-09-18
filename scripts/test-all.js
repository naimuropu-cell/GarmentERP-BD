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

  console.log('\n🎉 ALL 20 Integration Tests Passed with Zero Errors!');
  process.exit(0);
} catch (err) {
  console.error('\n❌ Test suite failed:', err);
  process.exit(1);
}
