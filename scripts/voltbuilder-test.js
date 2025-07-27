#!/usr/bin/env node

/**
 * VoltBuilder API Test Script
 * Tests the API connection and basic functionality
 */

import fetch from 'node-fetch';

const API_KEY = '2f45c6b6-393f-4315-9f91-16945fc5977f:6SBjAvKYYLx1+EESEQz31ewrgPARPDxF';
const BASE_URL = 'https://build.voltbuilder.com';

async function testVoltBuilderAPI() {
  console.log('🧪 Testing VoltBuilder API Connection...');
  console.log('=====================================');
  
  try {
    // Test API authentication
    console.log('🔑 Testing API authentication...');
    
    const authHeader = `Basic ${Buffer.from(API_KEY).toString('base64')}`;
    
    const response = await fetch(`${BASE_URL}/status`, {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`📡 Response Status: ${response.status}`);
    console.log(`📡 Response Headers:`, Object.fromEntries(response.headers));
    
    if (response.ok) {
      const data = await response.text();
      console.log('✅ API Connection Successful!');
      console.log('📊 Response:', data);
    } else {
      console.log('❌ API Connection Failed');
      const errorText = await response.text();
      console.log('🐛 Error Response:', errorText);
    }
    
  } catch (error) {
    console.error('❌ Network Error:', error.message);
    console.error('🔍 Full Error:', error);
  }
}

// Alternative test with different endpoints
async function testVoltBuilderAlternative() {
  console.log('\n🔄 Testing Alternative VoltBuilder Endpoints...');
  
  const endpoints = [
    'https://voltbuilder.com/api/status',
    'https://api.voltbuilder.com/status',
    'https://build.voltbuilder.com/api/status'
  ];
  
  for (const endpoint of endpoints) {
    try {
      console.log(`🔍 Testing: ${endpoint}`);
      
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${Buffer.from(API_KEY).toString('base64')}`,
          'User-Agent': 'Rishi-Platform-Mobile-Builder/1.0'
        }
      });
      
      console.log(`   Status: ${response.status}`);
      
      if (response.ok) {
        console.log(`   ✅ Endpoint working: ${endpoint}`);
        const data = await response.text();
        console.log(`   📊 Response preview: ${data.substring(0, 100)}...`);
        return endpoint;
      }
      
    } catch (error) {
      console.log(`   ❌ Failed: ${error.message}`);
    }
  }
  
  return null;
}

// Run tests
console.log('🚀 VoltBuilder API Diagnostics');
console.log('==============================');

testVoltBuilderAPI()
  .then(() => testVoltBuilderAlternative())
  .then((workingEndpoint) => {
    if (workingEndpoint) {
      console.log(`\n🎉 Found working endpoint: ${workingEndpoint}`);
    } else {
      console.log('\n❌ No working endpoints found');
      console.log('💡 Suggestions:');
      console.log('   • Check VoltBuilder documentation for correct API endpoints');
      console.log('   • Verify API key is valid and has correct permissions');
      console.log('   • Check network connectivity and firewall settings');
    }
  })
  .catch(error => {
    console.error('❌ Test failed:', error.message);
  });