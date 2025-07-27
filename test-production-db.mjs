import { Client } from 'pg';

const client = new Client({
  connectionString: "postgresql://neondb_owner:npg_UgTA70PJweka@ep-jolly-cherry-a8pw3fqw-pooler.eastus2.azure.neon.tech/rishiapp_prod?sslmode=require&channel_binding=require",
  ssl: { rejectUnauthorized: false }
});

try {
  console.log('🔄 Testing production database connection...');
  await client.connect();
  console.log('✅ Connected to production database');
  
  const result = await client.query('SELECT username, password FROM users WHERE username = $1', ['mike']);
  if (result.rows.length > 0) {
    console.log('✅ User mike found in production database');
    console.log('User data:', { username: result.rows[0].username, hasPassword: !!result.rows[0].password });
  } else {
    console.log('❌ User mike NOT found in production database');
  }
  
  await client.end();
  console.log('✅ Test completed successfully');
} catch (error) {
  console.error('❌ Database connection error:', error.message);
  process.exit(1);
}
