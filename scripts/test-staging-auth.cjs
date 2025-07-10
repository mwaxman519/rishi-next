#!/usr/bin/env node

/**
 * Test Staging Authentication Script
 * This script tests the staging authentication endpoint to ensure it works correctly
 */

const http = require('http');
const https = require('https');

async function testStagingAuth() {
  console.log('🧪 Testing staging authentication...');
  
  const data = JSON.stringify({
    username: 'mike',
    password: 'wrench519'
  });

  // Test local development first
  await testEndpoint('localhost', 5000, false, data);
  
  // Test staging environment
  await testEndpoint('rishi-staging.replit.app', 443, true, data);
}

function testEndpoint(hostname, port, isHttps, data) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: hostname,
      port: port,
      path: '/api/auth-service/routes/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };

    const client = isHttps ? https : http;
    
    console.log(`🔍 Testing ${isHttps ? 'https' : 'http'}://${hostname}:${port}/api/auth-service/routes/login`);
    
    const req = client.request(options, (res) => {
      console.log(`   Status: ${res.statusCode}`);
      console.log(`   Headers: ${JSON.stringify(res.headers, null, 2)}`);
      
      let responseData = '';
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        console.log(`   Response: ${responseData}`);
        
        if (res.statusCode === 200) {
          console.log(`   ✅ ${hostname} authentication successful`);
        } else {
          console.log(`   ❌ ${hostname} authentication failed`);
        }
        
        resolve();
      });
    });

    req.on('error', (e) => {
      console.error(`   ❌ ${hostname} request error:`, e.message);
      resolve();
    });

    req.setTimeout(10000, () => {
      console.error(`   ❌ ${hostname} request timeout`);
      req.destroy();
      resolve();
    });

    req.write(data);
    req.end();
  });
}

// Run the test
testStagingAuth().catch(console.error);