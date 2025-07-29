#!/usr/bin/env node

/**
 * Test Dual Redis Architecture
 * Tests both Replit Redis Cloud and Upstash configurations
 */

import { createClient } from 'redis';

async function testDualRedisArchitecture() {
  console.log('🏗️  Testing Dual Redis Architecture\n');

  // Configuration for both Redis providers
  const configs = {
    replit: {
      name: 'Replit Redis Cloud (Staging)',
      url: 'redis://default:pxtCp9pmVrmRmXGj4Y5qSPOmgjuaOAaE@redis-19771.c282.east-us-mz.azure.redns.redis-cloud.com:19771/1',
      database: 1,
      environment: 'staging'
    },
    upstash: {
      name: 'Upstash Redis (Production)',
      url: 'rediss://default:AeA2AAIjcDE0OWE1ZTcyZDE2MWE0ZmZlODk2NmJjZTVhNGY0NzkyYXAxMA@picked-ewe-57398.upstash.io:6379',
      database: 0,
      environment: 'production'
    }
  };

  const results = {};

  for (const [provider, config] of Object.entries(configs)) {
    console.log(`\n🧪 Testing ${config.name}...`);
    
    try {
      console.log(`   Creating client for ${config.environment} environment...`);
      
      const client = createClient({
        url: config.url,
        database: config.database,
        socket: {
          reconnectStrategy: false // Disable for testing
        }
      });

      client.on('error', (error) => {
        console.log(`   ❌ Connection error: ${error.message}`);
      });

      console.log('   📡 Connecting...');
      await client.connect();

      console.log('   🔍 Testing ping...');
      const pong = await client.ping();
      console.log(`   ✅ Ping response: ${pong}`);

      console.log('   📝 Testing set/get operations...');
      const testKey = `test:${provider}:${Date.now()}`;
      const testValue = `Event coordination test for ${config.environment}`;
      
      await client.set(testKey, testValue);
      await client.expire(testKey, 300); // 5 minute expiry
      
      const retrievedValue = await client.get(testKey);
      console.log(`   ✅ Set/Get test successful: ${retrievedValue === testValue ? 'PASS' : 'FAIL'}`);

      console.log('   🗂️  Testing pub/sub channels...');
      const channelName = `events:${config.environment}:test`;
      
      // Test publishing (we won't subscribe in this test to keep it simple)
      await client.publish(channelName, JSON.stringify({
        type: 'test.redis.architecture',
        environment: config.environment,
        provider: provider,
        timestamp: new Date().toISOString()
      }));
      console.log(`   ✅ Published test event to channel: ${channelName}`);

      console.log('   🧹 Cleaning up...');
      await client.del(testKey);
      await client.quit();

      results[provider] = {
        status: 'success',
        environment: config.environment,
        features: ['connection', 'ping', 'set/get', 'pub/sub'],
        provider: config.name
      };

      console.log(`   🎉 ${config.name} test completed successfully!`);

    } catch (error) {
      console.error(`   ❌ ${config.name} test failed:`, error.message);
      results[provider] = {
        status: 'failed',
        environment: config.environment,
        error: error.message,
        provider: config.name
      };
    }
  }

  // Summary
  console.log('\n📊 Dual Redis Architecture Test Results:\n');
  
  for (const [provider, result] of Object.entries(results)) {
    const status = result.status === 'success' ? '✅' : '❌';
    console.log(`${status} ${result.provider}`);
    console.log(`    Environment: ${result.environment}`);
    
    if (result.status === 'success') {
      console.log(`    Features: ${result.features.join(', ')}`);
      console.log('    Ready for event coordination');
    } else {
      console.log(`    Error: ${result.error}`);
    }
    console.log('');
  }

  console.log('🏗️  Architecture Summary:');
  console.log('• Development: Replit Redis Cloud (DB 0)');
  console.log('• Staging: Replit Redis Cloud (DB 1) ✓');
  console.log('• Production: Upstash Redis (DB 0) ✓');
  console.log('');
  console.log('🚀 Benefits:');
  console.log('• Environment isolation with dedicated databases');
  console.log('• Staging optimized for VoltBuilder mobile builds');
  console.log('• Production optimized for Vercel serverless functions');
  console.log('• TLS encryption for production security');
  console.log('• Global edge network for low latency');

  const allSuccessful = Object.values(results).every(r => r.status === 'success');
  
  if (allSuccessful) {
    console.log('\n🎉 SUCCESS: Dual Redis architecture is fully operational!');
    console.log('Ready for distributed event coordination across all environments.');
    process.exit(0);
  } else {
    console.log('\n⚠️  Some Redis providers need configuration or troubleshooting.');
    process.exit(1);
  }
}

// Run the test
testDualRedisArchitecture();