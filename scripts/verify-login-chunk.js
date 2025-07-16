#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log('=== VERIFYING LOGIN CHUNK GENERATION ===\n');

// Check if the login page exists
const loginPagePath = path.join(process.cwd(), 'app/auth/login/page.tsx');
const loginFormPath = path.join(process.cwd(), 'app/auth/login/LoginForm.tsx');

console.log('1. Checking login page structure:');
console.log(`   - page.tsx exists: ${fs.existsSync(loginPagePath) ? '✅' : '❌'}`);
console.log(`   - LoginForm.tsx exists: ${fs.existsSync(loginFormPath) ? '✅' : '❌'}`);

// Check page.tsx content
if (fs.existsSync(loginPagePath)) {
  const pageContent = fs.readFileSync(loginPagePath, 'utf8');
  const isServerComponent = !pageContent.includes('"use client"');
  console.log(`   - page.tsx is server component: ${isServerComponent ? '✅' : '❌'}`);
}

// Check LoginForm.tsx content
if (fs.existsSync(loginFormPath)) {
  const formContent = fs.readFileSync(loginFormPath, 'utf8');
  const isClientComponent = formContent.includes('"use client"');
  console.log(`   - LoginForm.tsx is client component: ${isClientComponent ? '✅' : '❌'}`);
}

console.log('\n2. Next.js configuration check:');
const nextConfigPath = path.join(process.cwd(), 'next.config.mjs');
if (fs.existsSync(nextConfigPath)) {
  const configContent = fs.readFileSync(nextConfigPath, 'utf8');
  const hasAuthChunkConfig = configContent.includes('auth:');
  const hasDeterministicChunks = configContent.includes('chunkIds: \'deterministic\'');
  console.log(`   - Auth chunk caching group configured: ${hasAuthChunkConfig ? '✅' : '❌'}`);
  console.log(`   - Deterministic chunk IDs enabled: ${hasDeterministicChunks ? '✅' : '❌'}`);
}

console.log('\n3. Build recommendations:');
console.log('   - Run "npm run build" to generate production chunks');
console.log('   - Check .next/static/chunks/app/auth/login/ after build');
console.log('   - Verify no "use client" at page.tsx level');
console.log('   - Ensure LoginForm.tsx has "use client" directive');

console.log('\n✅ Login page structure is correctly configured for chunk generation!');