// Test script to verify component imports work
import path from 'path';
import fs from 'fs';

console.log('🔍 Testing component imports...');

// Test all UI components exist
const uiComponents = [
  'card', 'button', 'badge', 'textarea', 'input', 
  'select', 'skeleton', 'avatar', 'tabs', 'form', 'label'
];

let allExist = true;
uiComponents.forEach(component => {
  const filePath = `components/ui/${component}.tsx`;
  const exists = fs.existsSync(filePath);
  console.log(`${exists ? '✅' : '❌'} ${component}.tsx: ${exists ? 'EXISTS' : 'MISSING'}`);
  if (!exists) allExist = false;
});

// Test problem pages
const problemPages = [
  'app/admin/page.tsx',
  'app/admin/organizations/page.tsx',
  'app/admin/users/page.tsx'
];

problemPages.forEach(page => {
  if (fs.existsSync(page)) {
    const content = fs.readFileSync(page, 'utf8');
    const uiImports = content.match(/@\/components\/ui\/[^'"]*/g) || [];
    console.log(`📄 ${page}: ${uiImports.length} UI imports`);
    uiImports.forEach(imp => console.log(`   - ${imp}`));
  }
});

console.log(`\n${allExist ? '✅ ALL COMPONENTS EXIST' : '❌ MISSING COMPONENTS'}`);