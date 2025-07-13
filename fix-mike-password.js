const { Client } = require('pg');
const bcrypt = require('bcryptjs');

async function fixMikePassword() {
  const client = new Client({
    connectionString: "postgresql://neondb_owner:npg_UgTA70PJweka@ep-jolly-cherry-a8pw3fqw-pooler.eastus2.azure.neon.tech/rishiapp_prod?sslmode=require&channel_binding=require",
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Connected to production database');
    
    // Get user's current password hash
    const result = await client.query('SELECT password FROM users WHERE username = $1', ['mike']);
    const storedHash = result.rows[0]?.password;
    
    if (storedHash) {
      console.log('✅ User mike found');
      
      // Test current password
      const isValid = await bcrypt.compare('wrench519', storedHash);
      console.log('Current password valid:', isValid);
      
      if (!isValid) {
        console.log('🔧 Updating password hash...');
        const newHash = await bcrypt.hash('wrench519', 10);
        await client.query('UPDATE users SET password = $1 WHERE username = $2', [newHash, 'mike']);
        console.log('✅ Password updated successfully');
        
        // Verify the update
        const verifyResult = await client.query('SELECT password FROM users WHERE username = $1', ['mike']);
        const verifyValid = await bcrypt.compare('wrench519', verifyResult.rows[0].password);
        console.log('✅ Password verification:', verifyValid);
      }
    } else {
      console.log('❌ User mike not found');
    }
    
    await client.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    await client.end();
  }
}

fixMikePassword().catch(console.error);
