/**
 * Create Mike User in Production Database
 * This script creates user 'mike' with password 'wrench519' in the production database
 */

import { Client } from 'pg';
import bcrypt from 'bcryptjs';

const DATABASE_URL = "postgresql://neondb_owner:npg_UgTA70PJweka@ep-jolly-cherry-a8pw3fqw-pooler.eastus2.azure.neon.tech/rishiapp_prod?sslmode=require&channel_binding=require";

async function createMikeUserInProduction() {
  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Connected to production database');
    
    // Hash the password
    const hashedPassword = await bcrypt.hash('wrench519', 10);
    console.log('Password hashed successfully');
    
    // Check if user exists
    const existingUser = await client.query('SELECT * FROM users WHERE username = $1', ['mike']);
    
    if (existingUser.rows.length > 0) {
      console.log('User mike already exists, updating password...');
      await client.query(
        'UPDATE users SET password = $1 WHERE username = $2',
        [hashedPassword, 'mike']
      );
      console.log('Password updated successfully');
    } else {
      console.log('Creating new user mike...');
      await client.query(
        'INSERT INTO users (username, password, email, full_name, role) VALUES ($1, $2, $3, $4, $5)',
        ['mike', hashedPassword, 'mike@rishiapp.com', 'Mike Waxman', 'super_admin']
      );
      console.log('User created successfully');
    }
    
    // Verify user creation
    const verifyUser = await client.query('SELECT username, email, full_name, role FROM users WHERE username = $1', ['mike']);
    console.log('User verification:', verifyUser.rows[0]);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.end();
  }
}

createMikeUserInProduction().catch(console.error);
