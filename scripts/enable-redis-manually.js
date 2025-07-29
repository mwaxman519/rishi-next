#!/usr/bin/env node

/**
 * Manual Redis Integration Test
 * Directly tests the hybrid event bus with Redis credentials
 */

import { eventBusManager } from '../services/infrastructure/messaging/eventBusManager.js';

async function enableRedisManually() {
  console.log('🔧 Manual Redis Integration Test...\n');

  try {
    // Set environment variables programmatically for this test
    process.env.ENABLE_REDIS_EVENTS = 'true';
    process.env.REDIS_URL = 'redis://default:pxtCp9pmVrmRmXGj4Y5qSPOmgjuaOAaE@redis-19771.c282.east-us-mz.azure.redns.redis-cloud.com:19771';

    console.log('Environment configured:');
    console.log('- ENABLE_REDIS_EVENTS:', process.env.ENABLE_REDIS_EVENTS);
    console.log('- REDIS_URL: Configured');
    console.log('');

    // Initialize event bus manager
    console.log('🚀 Initializing EventBusManager...');
    await eventBusManager.initialize();

    // Get system stats
    console.log('📊 Getting system statistics...');
    const stats = await eventBusManager.getSystemStats();
    
    console.log('\nSystem Status:');
    console.log('- Initialized:', stats.initialized);
    console.log('- Mode:', stats.stats.mode);
    console.log('- Redis Connected:', stats.stats.redisHealth?.connected || false);
    if (stats.stats.redisHealth?.latency) {
      console.log('- Redis Latency:', stats.stats.redisHealth.latency + 'ms');
    }

    // Test event publishing
    console.log('\n📤 Testing event publishing...');
    await eventBusManager.publishSystemEvent(
      'test.manual.redis.integration',
      {
        message: 'Testing manual Redis integration',
        timestamp: new Date().toISOString(),
        source: 'manual-test-script'
      }
    );
    console.log('✅ Event published successfully');

    // Get event history
    console.log('\n📜 Getting event history...');
    const history = await eventBusManager.getEventHistory(undefined, 5);
    console.log(`Events in history: ${history.length}`);
    
    if (history.length > 0) {
      console.log('\nRecent events:');
      history.slice(0, 3).forEach((event, index) => {
        console.log(`  ${index + 1}. ${event.type} (${event.correlationId})`);
      });
    }

    // Health check
    console.log('\n🏥 Health check...');
    const health = await eventBusManager.healthCheck();
    console.log('Health status:', health.status);
    console.log('Details:', JSON.stringify(health.details, null, 2));

    if (health.status === 'healthy' && health.details.redisConnected) {
      console.log('\n🎉 SUCCESS: Redis distributed event coordination is working!');
      console.log('Manual test confirms Redis integration is functional.');
    } else {
      console.log('\n⚠️  Redis coordination not fully active');
      console.log('Check Redis connection and configuration.');
    }

    // Cleanup
    await eventBusManager.shutdown();

  } catch (error) {
    console.error('\n❌ Manual test failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Run manual test
enableRedisManually();