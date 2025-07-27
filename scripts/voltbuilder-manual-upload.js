#!/usr/bin/env node

/**
 * Manual VoltBuilder Upload
 * Simple upload script that works with VoltBuilder's web interface
 */

import fs from 'fs';
import FormData from 'form-data';
import fetch from 'node-fetch';

const API_KEY = '2f45c6b6-393f-4315-9f91-16945fc5977f:6SBjAvKYYLx1+EESEQz31ewrgPARPDxF';

async function uploadPackage(packagePath) {
  console.log('📤 VoltBuilder Manual Upload');
  console.log('============================');
  console.log(`📦 Package: ${packagePath}`);
  
  if (!fs.existsSync(packagePath)) {
    console.error('❌ Package not found:', packagePath);
    return;
  }
  
  const packageSize = fs.statSync(packagePath).size;
  console.log(`📏 Size: ${(packageSize / 1024 / 1024).toFixed(2)} MB`);
  
  try {
    // Try direct upload to VoltBuilder
    const form = new FormData();
    form.append('file', fs.createReadStream(packagePath));
    
    console.log('🚀 Uploading to VoltBuilder...');
    
    const response = await fetch('https://voltbuilder.com/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(API_KEY).toString('base64')}`,
        ...form.getHeaders()
      },
      body: form
    });
    
    console.log(`📡 Response Status: ${response.status}`);
    
    if (response.ok) {
      const result = await response.text();
      console.log('✅ Upload successful!');
      console.log('📊 Response:', result);
    } else {
      const error = await response.text();
      console.log('❌ Upload failed');
      console.log('🐛 Error:', error);
    }
    
  } catch (error) {
    console.error('❌ Network error:', error.message);
    
    // Provide manual instructions
    console.log('\n💡 Manual Upload Instructions:');
    console.log('================================');
    console.log('1. Go to https://voltbuilder.com/');
    console.log('2. Log in to your VoltBuilder Pro account');
    console.log(`3. Upload this package: ${packagePath}`);
    console.log('4. Select platforms: Android and/or iOS');
    console.log('5. Click "Build" to start compilation');
    console.log('\n🔑 Your API Key (if needed):');
    console.log(API_KEY);
  }
}

// CLI usage
const packagePath = process.argv[2];
if (!packagePath) {
  console.error('Usage: node voltbuilder-manual-upload.js <package-path>');
  console.error('Example: node voltbuilder-manual-upload.js builds/staging/rishi-staging-fullscreen-2025-07-27-2224.zip');
  process.exit(1);
}

uploadPackage(packagePath);