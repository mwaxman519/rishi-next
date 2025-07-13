/**
 * Production Environment Variables Fix
 * This script ensures production uses the correct database
 */

import { neon } from '@neondatabase/serverless';

// Production database URL (correct one)
const PRODUCTION_DB_URL = 'postgresql://neondb_owner:npg_UgTA70PJweka@ep-jolly-cherry-a8pw3fqw-pooler.eastus2.azure.neon.tech/rishiapp_prod?sslmode=require&channel_binding=require';

async function testProductionDatabase() {
  console.log('🔧 Testing production database connection...');
  
  try {
    const sql = neon(PRODUCTION_DB_URL);
    
    // Test connection
    const result = await sql`SELECT NOW() as current_time, current_database() as db_name`;
    console.log('✅ Production database connection successful');
    console.log('Database:', result[0].db_name);
    console.log('Time:', result[0].current_time);
    
    // Test user lookup
    const users = await sql`SELECT username, email, role, active FROM users WHERE username = 'mike'`;
    console.log('✅ User lookup successful');
    console.log('Users found:', users.length);
    if (users.length > 0) {
      console.log('User details:', users[0]);
    }
    
  } catch (error) {
    console.error('❌ Production database test failed:', error.message);
  }
}

testProductionDatabase();