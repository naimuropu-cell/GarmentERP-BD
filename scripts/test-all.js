const { spawn } = require('child_process');
const path = require('path');

console.log('========================================================');
console.log('🧪 GarmentERP BD — Automated Multi-Module Verification');
console.log('========================================================');

const serverTest = spawn('npm', ['test'], {
  cwd: path.join(__dirname, '..', 'server'),
  shell: true,
  stdio: 'inherit'
});

serverTest.on('close', (code) => {
  if (code !== 0) {
    console.error(`❌ Server tests failed with code ${code}`);
    process.exit(code);
  }
  console.log('✅ Server Integration Tests Passed Completely!');
  process.exit(0);
});
