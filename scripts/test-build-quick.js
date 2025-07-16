#!/usr/bin/env node

/**
 * Quick Build Test Script
 * Tests the build process with timeout to identify issues quickly
 */

import { spawn } from 'child_process';

console.log('🚀 Testing build process...\n');

const buildProcess = spawn('npm', ['run', 'build'], {
  stdio: 'pipe',
  timeout: 120000, // 2 minute timeout
});

let output = '';
let errorOutput = '';

buildProcess.stdout.on('data', (data) => {
  const text = data.toString();
  output += text;
  process.stdout.write(text);
});

buildProcess.stderr.on('data', (data) => {
  const text = data.toString();
  errorOutput += text;
  process.stderr.write(text);
});

buildProcess.on('close', (code) => {
  console.log(`\n📊 Build process completed with code: ${code}`);
  
  if (code === 0) {
    console.log('✅ Build successful!');
  } else {
    console.log('❌ Build failed!');
    
    // Analyze common issues
    if (output.includes('ChunkLoadError') || errorOutput.includes('ChunkLoadError')) {
      console.log('🔍 Issue: Chunk loading errors detected');
    }
    
    if (output.includes('CSS') || errorOutput.includes('CSS')) {
      console.log('🔍 Issue: CSS-related errors detected');
    }
    
    if (output.includes('TypeScript') || errorOutput.includes('TypeScript')) {
      console.log('🔍 Issue: TypeScript compilation errors detected');
    }
  }
});

buildProcess.on('error', (error) => {
  console.error('❌ Build process error:', error.message);
});

// Handle timeout
setTimeout(() => {
  if (!buildProcess.killed) {
    console.log('⏰ Build timeout - terminating process');
    buildProcess.kill();
  }
}, 120000);