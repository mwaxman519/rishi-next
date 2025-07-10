#!/usr/bin/env node
/**
 * Deploy Database Schema to Staging Database
 * Connects to the actual staging database and deploys the schema
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const STAGING_DB_URL = 'postgresql://neondb_owner:npg_UgTA70PJweka@ep-jolly-cherry-a8pw3fqw-pooler.eastus2.azure.neon.tech/rishiapp_staging?sslmode=require&channel_binding=require';

async function deployStagingSchema() {
  console.log('🚀 Starting staging database schema deployment...');
  
  // Read the migration file
  const migrationFile = path.join(__dirname, '..', 'migrations', '0000_dark_scalphunter.sql');
  
  if (!fs.existsSync(migrationFile)) {
    console.error('❌ Migration file not found. Running drizzle-kit generate...');
    const { execSync } = require('child_process');
    execSync('npx drizzle-kit generate', { stdio: 'inherit' });
  }

  const migrationSQL = fs.readFileSync(migrationFile, 'utf8');
  console.log('✅ Migration file loaded successfully');

  const client = new Client({
    connectionString: STAGING_DB_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Connected to staging database');

    // Split SQL by statement breakpoints and execute each statement
    const statements = migrationSQL.split('--> statement-breakpoint').map(stmt => stmt.trim()).filter(stmt => stmt.length > 0);
    
    console.log(`📋 Found ${statements.length} SQL statements to execute`);

    let successCount = 0;
    let failureCount = 0;

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.length > 0) {
        try {
          await client.query(statement);
          console.log(`✅ [${i + 1}/${statements.length}] Statement executed successfully`);
          successCount++;
        } catch (error) {
          console.log(`⚠️  [${i + 1}/${statements.length}] Statement failed: ${error.message}`);
          failureCount++;
        }
      }
    }

    console.log(`📊 Migration summary: ${successCount} success, ${failureCount} failed`);

    // Verify the migration
    const tableCount = await client.query(`
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    
    console.log(`🎉 Migration completed: ${tableCount.rows[0].count} tables created`);

    // Create super admin user
    console.log('👤 Creating super admin user...');
    const hashedPassword = '$2a$10$GtXhqRUJKXXgU4.8VBZmKOjWLjvGQVKrDgIhpw9C8xm1LYQ3FxDVa'; // wrench519
    
    try {
      await client.query(`
        INSERT INTO users (id, username, password, role, full_name, email, active)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (username) DO UPDATE SET
          password = EXCLUDED.password,
          role = EXCLUDED.role,
          full_name = EXCLUDED.full_name,
          email = EXCLUDED.email,
          active = EXCLUDED.active,
          updated_at = CURRENT_TIMESTAMP
      `, [
        '261143cd-fa2b-4660-8b54-364c87b63882',
        'mike',
        hashedPassword,
        'super_admin',
        'Mike Super Admin',
        'mike@rishi.com',
        true
      ]);

      console.log('✅ Super admin user created successfully');
    } catch (error) {
      console.error('❌ Failed to create super admin user:', error.message);
    }

    // Create default organization
    console.log('🏢 Creating default organization...');
    try {
      await client.query(`
        INSERT INTO organizations (name, tier, type, status, created_at, updated_at)
        VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        ON CONFLICT (name) DO NOTHING
      `, ['Rishi Internal', 'tier_3', 'internal', 'active']);

      console.log('✅ Default organization created successfully');
    } catch (error) {
      console.error('❌ Failed to create default organization:', error.message);
    }

    // Final verification
    const userCheck = await client.query('SELECT username, role FROM users WHERE username = $1', ['mike']);
    const orgCheck = await client.query('SELECT name FROM organizations WHERE name = $1', ['Rishi Internal']);
    
    console.log('\n📋 STAGING DATABASE DEPLOYMENT COMPLETE:');
    console.log(`   Tables: ${tableCount.rows[0].count}`);
    console.log(`   Super admin: ${userCheck.rows.length > 0 ? '✅ Ready' : '❌ Missing'}`);
    console.log(`   Default org: ${orgCheck.rows.length > 0 ? '✅ Ready' : '❌ Missing'}`);

  } catch (error) {
    console.error('❌ Staging database deployment failed:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

// Run if called directly
if (require.main === module) {
  deployStagingSchema()
    .then(() => {
      console.log('\n🎉 Staging database deployment completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Staging database deployment failed:', error);
      process.exit(1);
    });
}

module.exports = { deployStagingSchema };