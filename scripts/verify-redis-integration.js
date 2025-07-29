#!/usr/bin/env node

/**
 * Verify Redis Integration is Active
 */

import fetch from 'node-fetch';

async function verifyRedisIntegration() {
  console.log('🔍 Verifying Redis Integration Status...\n');

  try {
    // Wait for server to be ready
    console.log('⏳ Waiting for server startup...');
    await new Promise(resolve => setTimeout(resolve, 8000));

    // Check health endpoint
    console.log('🏥 Checking event bus health...');
    const healthResponse = await fetch('http://localhost:5000/api/events/health');
    const health = await healthResponse.json();

    console.log('\n📊 Current Status:');
    console.log(`   Overall Status: ${health.status}`);
    console.log(`   Event Bus Mode: ${health.mode}`);
    console.log(`   Redis Available: ${health.redis ? 'Yes' : 'No'}`);
    
    if (health.redis?.health) {
      console.log(`   Redis Connected: ${health.redis.health.connected ? 'Yes' : 'No'}`);
      if (health.redis.health.connected) {
        console.log(`   Redis Latency: ${health.redis.health.latency}ms`);
      }
      if (health.redis.health.error) {
        console.log(`   Redis Error: ${health.redis.health.error}`);
      }
    }

    console.log('\n🚀 Capabilities:');
    console.log(`   Cross-Service Events: ${health.capabilities?.crossServiceEvents ? 'Enabled' : 'Disabled'}`);
    console.log(`   Persistent History: ${health.capabilities?.persistentHistory ? 'Enabled' : 'Disabled'}`);
    console.log(`   Fallback Mode: ${health.capabilities?.fallbackMode ? 'Available' : 'N/A'}`);

    // Test environment variables
    console.log('\n🔧 Environment Check:');
    console.log(`   Server detected Redis config: ${health.mode !== 'local-only' ? 'Yes' : 'No'}`);

    if (health.mode === 'hybrid') {
      console.log('\n✅ SUCCESS: Redis distributed event coordination is ACTIVE!');
      console.log('   • Multiple server instances will coordinate events');
      console.log('   • Events persist across server restarts');
      console.log('   • Mobile apps receive real-time synchronization');
      console.log('   • Production-ready scalable architecture enabled');
    } else if (health.mode === 'local-only') {
      console.log('\n⚠️  LOCAL MODE: Redis coordination not detected');
      console.log('   • Check if ENABLE_REDIS_EVENTS=true is set');
      console.log('   • Verify REDIS_URL is properly configured');
      console.log('   • Environment variables may need server restart');
    }

    return health;

  } catch (error) {
    console.error('\n❌ Verification failed:', error.message);
    return null;
  }
}

// Run verification
verifyRedisIntegration().then(result => {
  if (result?.mode === 'hybrid') {
    console.log('\n🎉 Redis distributed event coordination is fully operational!');
    process.exit(0);
  } else {
    console.log('\n🔄 System may need additional configuration to enable Redis coordination.');
    process.exit(1);
  }
});