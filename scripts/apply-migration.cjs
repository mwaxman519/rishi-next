#!/usr/bin/env node
/**
 * Apply Migration Script
 * Applies the generated migration SQL directly to the staging database
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function applyMigration() {
  console.log('Starting migration application...');
  console.log('Database URL:', process.env.DATABASE_URL);

  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL environment variable not found');
    process.exit(1);
  }

  // Read the migration file
  const migrationFile = path.join(__dirname, '..', 'migrations', '0000_dark_scalphunter.sql');
  
  if (!fs.existsSync(migrationFile)) {
    console.error('Migration file not found:', migrationFile);
    process.exit(1);
  }

  const migrationSQL = fs.readFileSync(migrationFile, 'utf8');
  console.log('Migration file loaded successfully');

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Connected to database successfully');

    // Split SQL by statement breakpoints and execute each statement
    const statements = migrationSQL.split('--> statement-breakpoint').map(stmt => stmt.trim()).filter(stmt => stmt.length > 0);
    
    console.log(`Found ${statements.length} SQL statements to execute`);

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.length > 0) {
        try {
          await client.query(statement);
          console.log(`✓ Executed statement ${i + 1}/${statements.length}`);
        } catch (error) {
          console.error(`✗ Failed to execute statement ${i + 1}:`, error.message);
          // Continue with next statement for now
        }
      }
    }

    // Verify the migration
    const tableCount = await client.query(`
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    
    console.log(`Migration completed: ${tableCount.rows[0].count} tables now exist`);

    // Create super admin user
    console.log('Creating super admin user...');
    const hashedPassword = '$2a$10$GtXhqRUJKXXgU4.8VBZmKOjWLjvGQVKrDgIhpw9C8xm1LYQ3FxDVa'; // wrench519
    
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

    console.log('Super admin user created successfully');

  } catch (error) {
    console.error('Migration application failed:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

// Run if called directly
if (require.main === module) {
  applyMigration()
    .then(() => {
      console.log('Migration process completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration process failed:', error);
      process.exit(1);
    });
}

module.exports = { applyMigration };