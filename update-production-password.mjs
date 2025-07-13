import { Client } from 'pg';
import bcrypt from 'bcryptjs';

const client = new Client({
  connectionString: "postgresql://neondb_owner:npg_UgTA70PJweka@ep-jolly-cherry-a8pw3fqw-pooler.eastus2.azure.neon.tech/rishiapp_prod?sslmode=require&channel_binding=require",
  ssl: { rejectUnauthorized: false }
});

try {
  await client.connect();
  console.log('✅ Connected to production database');
  
  // Generate new password hash
  const newHash = await bcrypt.hash('wrench519', 10);
  
  // Update user password
  await client.query('UPDATE users SET password = $1 WHERE username = $2', [newHash, 'mike']);
  console.log('✅ Password updated for user mike');
  
  // Verify the update
  const result = await client.query('SELECT username FROM users WHERE username = $1', ['mike']);
  console.log('✅ User verification:', result.rows[0]);
  
  await client.end();
  console.log('✅ Production password update completed');
} catch (error) {
  console.error('❌ Error:', error.message);
}
