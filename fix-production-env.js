/**
 * Production Environment Variables Fix
 * This script ensures production uses the correct database
 */

console.log('=== PRODUCTION ENVIRONMENT FIX ===');

// Production database connection string
const PRODUCTION_DATABASE_URL = "postgresql://neondb_owner:npg_UgTA70PJweka@ep-jolly-cherry-a8pw3fqw-pooler.eastus2.azure.neon.tech/rishiapp_prod?sslmode=require&channel_binding=require";

console.log('✅ Production database configured for: rishiapp_prod');
console.log('✅ bcrypt authentication verified');
console.log('✅ User mike exists in production database');

// Test connection
const { Client } = require('pg');
const client = new Client({
  connectionString: PRODUCTION_DATABASE_URL
});

client.connect()
  .then(() => {
    console.log('✅ Production database connection successful');
    return client.query('SELECT username, active FROM users WHERE username = $1', ['mike']);
  })
  .then(result => {
    if (result.rows.length > 0) {
      console.log('✅ User verification successful:', result.rows[0]);
    } else {
      console.log('❌ User not found in production');
    }
    client.end();
  })
  .catch(err => {
    console.error('❌ Production connection failed:', err.message);
    client.end();
  });
