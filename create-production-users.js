import { Pool, neonConfig } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';
import ws from 'ws';

// Configure WebSocket for serverless
neonConfig.webSocketConstructor = ws;

// Production database URL
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_tuJ0c2Lqwzmg@ep-blue-firefly-a578pzjz.us-east-2.aws.neon.tech/rishiapp_prod?sslmode=require';

async function createProductionUsers() {
  const pool = new Pool({ connectionString: DATABASE_URL });
  
  try {
    console.log('Creating production users...');
    
    // Hash passwords
    const mikePassword = await bcrypt.hash('wrench519', 10);
    const mattPassword = await bcrypt.hash('password123', 10);
    
    // Create user mike
    const mikeResult = await pool.query(`
      INSERT INTO users (
        id, username, email, password, full_name, 
        role, active, created_at, updated_at
      ) VALUES (
        gen_random_uuid(), 'mike', 'mike@rishiplatform.com', $1, 'Mike User',
        'super_admin', true, NOW(), NOW()
      )
      ON CONFLICT (username) DO UPDATE SET
        password = $1,
        email = 'mike@rishiplatform.com',
        full_name = 'Mike User',
        role = 'super_admin',
        active = true,
        updated_at = NOW()
      RETURNING username, role;
    `, [mikePassword]);
    
    console.log('✓ Created/Updated user mike:', mikeResult.rows[0]);
    
    // Create user matt
    const mattResult = await pool.query(`
      INSERT INTO users (
        id, username, email, password, full_name, 
        role, active, created_at, updated_at
      ) VALUES (
        gen_random_uuid(), 'matt', 'matt@rishiplatform.com', $1, 'Matt User',
        'super_admin', true, NOW(), NOW()
      )
      ON CONFLICT (username) DO UPDATE SET
        password = $1,
        email = 'matt@rishiplatform.com',
        full_name = 'Matt User',
        role = 'super_admin',
        active = true,
        updated_at = NOW()
      RETURNING username, role;
    `, [mattPassword]);
    
    console.log('✓ Created/Updated user matt:', mattResult.rows[0]);
    
    // Verify users exist
    const verifyResult = await pool.query(`
      SELECT username, email, full_name, role, active 
      FROM users 
      WHERE username IN ('mike', 'matt')
      ORDER BY username;
    `);
    
    console.log('\nProduction users verification:');
    verifyResult.rows.forEach(user => {
      console.log(`- ${user.username}: ${user.email} (${user.role}) - Active: ${user.active}`);
    });
    
  } catch (error) {
    console.error('Error creating production users:', error);
  } finally {
    await pool.end();
  }
}

createProductionUsers();