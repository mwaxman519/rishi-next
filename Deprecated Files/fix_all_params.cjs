const fs = require('fs');

// Continue fixing the remaining files manually
const filesToCheck = [
  'app/api/availability/[id]/route.ts',
  'app/api/kits/activity-kits/[id]/route.ts',
  'app/api/shifts/[id]/route.ts',
  'app/api/team/[id]/route.ts',
  'app/api/organizations/[id]/feature-settings/route.ts',
  'app/api/users/[id]/permissions/route.ts'
];

console.log('Checking remaining critical files...');

for (const file of filesToCheck) {
  if (fs.existsSync(file)) {
    const content = fs.readFileSync(file, 'utf8');
    const hasOldPattern = content.includes('params: { id: string }');
    console.log(`${file}: ${hasOldPattern ? '❌ NEEDS FIX' : '✅ OK'}`);
  } else {
    console.log(`${file}: ⚠️  NOT FOUND`);
  }
}
