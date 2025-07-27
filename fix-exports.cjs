const fs = require('fs');
const path = require('path');

console.log('🔧 FIXING MISSING EXPORTS AND IMPORTS');

// Fix auth-utils.ts to remove broken imports
const authUtilsPath = 'lib/auth-utils.ts';
let authUtilsContent = fs.readFileSync(authUtilsPath, 'utf8');

// Remove the broken import line
authUtilsContent = authUtilsContent.replace(/export \{ hashPassword, comparePasswords \} from "\.\/auth-server";/, '');

// Add the exports at the end
if (!authUtilsContent.includes('export { hashPassword, comparePasswords }')) {
  authUtilsContent += '\n\n// Re-export auth functions\nexport { hashPassword, comparePasswords } from "./auth-server";\n';
}

fs.writeFileSync(authUtilsPath, authUtilsContent);
console.log('Fixed: lib/auth-utils.ts');
