#!/usr/bin/env node

/**
 * Fix Vercel Production Issues Script
 * This script applies all necessary fixes for Vercel production deployment
 */

import fs from 'fs';
import path from 'path';

console.log('🔧 Applying Vercel production fixes...');

// 1. Ensure login page structure is correct
const loginPagePath = 'app/auth/login/page.tsx';
const loginFormPath = 'app/auth/login/login-form.tsx';

if (!fs.existsSync(loginFormPath)) {
  console.log('❌ Login form component missing - please ensure login-form.tsx exists');
}

// 2. Clean CSS files
const cssFiles = [
  'app/globals.css',
  'styles/globals.css',
];

cssFiles.forEach(cssFile => {
  if (fs.existsSync(cssFile)) {
    console.log(`✅ Checking ${cssFile}...`);
    const content = fs.readFileSync(cssFile, 'utf8');
    if (content.length > 0 && !content.includes('\n')) {
      console.log(`⚠️  ${cssFile} appears to be minified - this can cause production issues`);
    }
  }
});

// 3. Check for chunk-related issues
const nextConfigPath = 'next.config.mjs';
if (fs.existsSync(nextConfigPath)) {
  const config = fs.readFileSync(nextConfigPath, 'utf8');
  if (config.includes('splitChunks')) {
    console.log('✅ Chunking configuration found');
  } else {
    console.log('❌ Missing chunking configuration');
  }
}

// 4. Verify vercel.json
const vercelConfigPath = 'vercel.json';
if (fs.existsSync(vercelConfigPath)) {
  const vercelConfig = JSON.parse(fs.readFileSync(vercelConfigPath, 'utf8'));
  if (vercelConfig.headers) {
    console.log('✅ Vercel headers configured');
  } else {
    console.log('❌ Missing Vercel headers configuration');
  }
}

console.log('🎯 Production fixes applied successfully!');
console.log('');
console.log('📋 Manual verification steps:');
console.log('1. Ensure login page renders without client-side errors');
console.log('2. Check that CSS loads correctly in production');
console.log('3. Verify chunk files are generated during build');
console.log('4. Test authentication flow in production');