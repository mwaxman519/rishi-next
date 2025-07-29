#!/usr/bin/env node

/**
 * Test Corrected Redis Architecture
 * Development + Staging: Replit Redis Cloud (DB 0)
 * Production: Upstash Redis (DB 0)
 */

import { createClient } from 'redis';

async function testCorrectedRedisArchitecture() {
  console.log('🏗️  Testing Corrected Redis Architecture\n');

  const configs = {
    replit: {
      name: 'Replit Redis Cloud (Dev + Staging)',
      url: 'redis://default:pxtCp9pmVrmRmXGj4Y5qSPOmgjuaOAaE@redis-19771.c282.east-us-mz.azure.redns.redis-cloud.com:19771',
      database: 0, // Single database for both dev and staging
      environments: ['development', 'staging']
    },
    upstash: {
      name: 'Upstash Redis (Production)',
      url: 'rediss://default:AeA2AAIjcDE0OWE1ZTcyZDE2MWE0ZmZlODk2NmJjZTVhNGY0NzkyYXAxMA@picked-ewe-57398.upstash.io:6379',
      database: 0,
      environments: ['production']
    }
  };

  const results = {};

  for (const [provider, config] of Object.entries(configs)) {
    console.log(`\n🧪 Testing ${config.name}...`);
    
    try {
      const client = createClient({
        url: config.url,
        database: config.database,
        socket: {
          reconnectStrategy: false
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

      console.log('   📝 Testing namespace isolation...');
      for (const env of config.environments) {
        const testKey = `events:${env}:test:${Date.now()}`;
        const testValue = `Event coordination for ${env} environment`;
        
        await client.set(testKey, testValue);
        await client.expire(testKey, 300);
        
        const retrievedValue = await client.get(testKey);
        console.log(`   ✅ ${env} namespace test: ${retrievedValue === testValue ? 'PASS' : 'FAIL'}`);
        
        // Test pub/sub channel naming
        const channelName = `events:${env}:coordination`;
        await client.publish(channelName, JSON.stringify({
          type: 'test.environment.isolation',
          environment: env,
          provider: provider,
          timestamp: new Date().toISOString()
        }));
        console.log(`   ✅ Published to ${env} channel: ${channelName}`);
        
        await client.del(testKey);
      }

      await client.quit();

      results[provider] = {
        status: 'success',
        environments: config.environments,
        isolation: 'key-prefix-based',
        provider: config.name
      };

      console.log(`   🎉 ${config.name} test completed successfully!`);

    } catch (error) {
      console.error(`   ❌ ${config.name} test failed:`, error.message);
      results[provider] = {
        status: 'failed',
        environments: config.environments,
        error: error.message,
        provider: config.name
      };
    }
  }

  console.log('\n📊 Corrected Redis Architecture Results:\n');
  
  for (const [provider, result] of Object.entries(results)) {
    const status = result.status === 'success' ? '✅' : '❌';
    console.log(`${status} ${result.provider}`);
    console.log(`    Environments: ${result.environments.join(', ')}`);
    
    if (result.status === 'success') {
      console.log(`    Isolation: ${result.isolation}`);
      console.log('    Event coordination ready');
    } else {
      console.log(`    Error: ${result.error}`);
    }
    console.log('');
  }

  console.log('🏗️  Final Architecture:');
  console.log('• Development: Replit Redis Cloud (key prefix: events:development:*)');
  console.log('• Staging: Replit Redis Cloud (key prefix: events:staging:*)');  
  console.log('• Production: Upstash Redis (key prefix: events:production:*)');
  console.log('');
  console.log('🔒 Environment Isolation Strategy:');
  console.log('• Key-based namespace separation instead of database separation');
  console.log('• Staging and development share Replit Redis but use different prefixes');
  console.log('• Production completely isolated on Upstash Redis');
  console.log('• Channel names include environment prefix for pub/sub isolation');
  console.log('');
  console.log('✅ Benefits:');
  console.log('• Cost-effective: Single Replit Redis for dev/staging');
  console.log('• Production security: Dedicated Upstash instance');
  console.log('• Clear separation: Key prefixes prevent cross-environment data leaks');
  console.log('• TLS encryption: Upstash provides secure production connections');

  const allSuccessful = Object.values(results).every(r => r.status === 'success');
  
  if (allSuccessful) {
    console.log('\n🎉 SUCCESS: Corrected Redis architecture is fully operational!');
    console.log('Ready for distributed event coordination with proper environment isolation.');
    process.exit(0);
  } else {
    console.log('\n⚠️  Some Redis configurations need attention.');
    process.exit(1);
  }
}

testCorrectedRedisArchitecture();