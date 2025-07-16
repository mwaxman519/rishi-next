#!/usr/bin/env node

/**
 * Simple Build Test for Vercel
 * Tests if the current configuration can build successfully
 */

import { spawn } from 'child_process';

console.log('🧪 Testing build configuration for Vercel...\n');

const buildProcess = spawn('npm', ['run', 'build'], {
  stdio: 'inherit',
  timeout: 120000, // 2 minutes
});

buildProcess.on('close', (code) => {
  if (code === 0) {
    console.log('\n✅ Build test successful!');
    console.log('📦 Configuration ready for Vercel deployment');
    console.log('🚀 Commit and push to trigger deployment');
  } else {
    console.log('\n❌ Build test failed');
    console.log('🔍 Check the output above for errors');
  }
});

buildProcess.on('error', (error) => {
  console.error('❌ Build process error:', error.message);
});