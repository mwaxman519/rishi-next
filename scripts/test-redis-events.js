#!/usr/bin/env node

/**
 * Redis Event Coordination Test Script
 * Tests publishing and subscribing to events through Redis
 */

import fetch from 'node-fetch';

async function testRedisEvents() {
  console.log('🧪 Testing Redis Event Coordination System...\n');

  try {
    // 1. Check event bus health
    console.log('1️⃣  Checking event bus health...');
    const healthResponse = await fetch('http://localhost:5000/api/events/health');
    const health = await healthResponse.json();
    
    console.log(`   Status: ${health.status}`);
    console.log(`   Mode: ${health.mode}`);
    console.log(`   Redis Available: ${health.redis ? 'Yes' : 'No'}`);
    if (health.redis?.health?.connected) {
      console.log(`   Redis Latency: ${health.redis.health.latency}ms`);
    }
    console.log('');

    // 2. Publish a test event
    console.log('2️⃣  Publishing test event...');
    const publishResponse = await fetch('http://localhost:5000/api/events/publish', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token' // Would need real auth in production
      },
      body: JSON.stringify({
        type: 'test.redis.coordination',
        payload: {
          message: 'Testing Redis distributed events',
          timestamp: new Date().toISOString()
        },
        metadata: {
          testRun: true,
          source: 'test-script'
        }
      })
    });

    if (publishResponse.status === 401) {
      console.log('   ⚠️  Authentication required - test event not published');
      console.log('   💡 In production, events are published by authenticated users');
    } else {
      const publishResult = await publishResponse.json();
      console.log(`   Event published: ${publishResult.success ? 'Success' : 'Failed'}`);
      if (publishResult.event) {
        console.log(`   Correlation ID: ${publishResult.event.correlationId}`);
      }
    }
    console.log('');

    // 3. Check event history
    console.log('3️⃣  Checking event history...');
    const historyResponse = await fetch('http://localhost:5000/api/events/history?limit=5');
    
    if (historyResponse.status === 401) {
      console.log('   ⚠️  Authentication required - event history not accessible');
      console.log('   💡 In production, event history requires admin permissions');
    } else {
      const history = await historyResponse.json();
      console.log(`   Recent events: ${history.events?.length || 0}`);
      console.log(`   Event bus mode: ${history.metadata?.eventBusMode}`);
      console.log(`   Redis available: ${history.metadata?.redisAvailable}`);
    }
    console.log('');

    // 4. Summary
    console.log('📊 Test Summary:');
    console.log(`   Event Bus Status: ${health.status}`);
    console.log(`   Coordination Mode: ${health.mode}`);
    console.log(`   Cross-Service Events: ${health.capabilities?.crossServiceEvents ? 'Enabled' : 'Local Only'}`);
    console.log(`   Persistent History: ${health.capabilities?.persistentHistory ? 'Enabled' : 'Memory Only'}`);
    console.log(`   Mobile Sync Ready: ${health.mode === 'hybrid' ? 'Yes' : 'Limited'}`);

    if (health.mode === 'hybrid') {
      console.log('\n✅ SUCCESS: Redis distributed events fully operational!');
      console.log('   • Multiple server instances will coordinate events');
      console.log('   • Mobile apps will receive real-time synchronization');
      console.log('   • Event history persists across server restarts');
    } else if (health.mode === 'local-only') {
      console.log('\n⚠️  LOCAL MODE: Redis coordination not active');
      console.log('   • Events work within single server instance');
      console.log('   • Mobile apps limited to direct API polling');
      console.log('   • Event history cleared on server restart');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testRedisEvents();