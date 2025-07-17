#!/usr/bin/env node

/**
 * Test Vercel Deployment Script
 * Tests the actual deployment to understand what's working and what's not
 */

import https from 'https';

function testUrl(url) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, { method: 'HEAD' }, (res) => {
      resolve({
        url,
        status: res.statusCode,
        headers: res.headers,
        contentType: res.headers['content-type']
      });
    });
    req.on('error', reject);
    req.end();
  });
}

async function testDeployment() {
  console.log('Testing Vercel deployment...');
  
  const urls = [
    'https://rishi-next.vercel.app/',
    'https://rishi-next.vercel.app/auth/login',
    'https://rishi-next.vercel.app/api/auth-service/session',
    'https://rishi-next.vercel.app/_next/static/chunks/webpack-524b8e49035b6ebe.js',
    'https://rishi-next.vercel.app/_next/static/css/fcbb25920ac0fdce.css'
  ];
  
  for (const url of urls) {
    try {
      const result = await testUrl(url);
      console.log(`${result.status} - ${result.url}`);
      console.log(`  Content-Type: ${result.contentType || 'not set'}`);
    } catch (error) {
      console.log(`ERROR - ${url}: ${error.message}`);
    }
  }
}

testDeployment();