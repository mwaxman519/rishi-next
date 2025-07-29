#!/usr/bin/env node

/**
 * Direct Redis Connection Test
 */

import { createClient } from 'redis';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.development' });

async function testRedisConnection() {
  console.log('🔧 Testing Redis Connection...\n');
  
  const redisUrl = process.env.REDIS_URL;
  console.log('Redis URL:', redisUrl ? 'Configured' : 'Missing');
  console.log('Enable Redis Events:', process.env.ENABLE_REDIS_EVENTS);
  console.log('');

  if (!redisUrl) {
    console.log('❌ No REDIS_URL found in environment variables');
    return;
  }

  try {
    console.log('🚀 Creating Redis client...');
    const client = createClient({
      url: redisUrl,
      socket: {
        reconnectStrategy: false // Disable auto-reconnect for testing
      }
    });

    client.on('error', (error) => {
      console.log('❌ Redis connection error:', error.message);
    });

    client.on('connect', () => {
      console.log('✅ Redis connected successfully');
    });

    console.log('📡 Attempting connection...');
    await client.connect();

    console.log('🔍 Testing ping...');
    const pong = await client.ping();
    console.log('✅ Ping response:', pong);

    console.log('📝 Testing basic operations...');
    await client.set('test:redis:connection', 'success');
    const value = await client.get('test:redis:connection');
    console.log('✅ Set/Get test:', value);

    console.log('🧹 Cleaning up...');
    await client.del('test:redis:connection');
    await client.quit();

    console.log('\n🎉 Redis connection test successful!');
    console.log('The Redis instance is working correctly.');

  } catch (error) {
    console.error('\n❌ Redis connection failed:', error.message);
    console.log('\nTroubleshooting:');
    console.log('1. Check if Redis URL is correct');
    console.log('2. Verify network connectivity');
    console.log('3. Confirm Redis credentials');
    console.log('4. Check Redis Cloud dashboard for status');
  }
}

testRedisConnection();