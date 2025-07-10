#!/usr/bin/env node
/**
 * Direct Schema Deployment Script
 * Deploys schema directly to the staging database without using drizzle-kit
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function deploySchema() {
  console.log('Starting direct schema deployment...');
  console.log('Database URL:', process.env.DATABASE_URL);

  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL environment variable not found');
    process.exit(1);
  }

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Connected to database successfully');

    // Create the schema SQL
    const schemaSQL = `
      -- Create users table
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'client_user',
        full_name TEXT,
        email TEXT,
        phone TEXT,
        active BOOLEAN DEFAULT true,
        profile_image TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Create organizations table
      CREATE TABLE IF NOT EXISTS organizations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        tier TEXT NOT NULL DEFAULT 'staff_leasing',
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Create user_organizations table
      CREATE TABLE IF NOT EXISTS user_organizations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
        role TEXT NOT NULL DEFAULT 'client_user',
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, organization_id)
      );

      -- Create permissions table
      CREATE TABLE IF NOT EXISTS permissions (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Create states table
      CREATE TABLE IF NOT EXISTS states (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        abbreviation TEXT NOT NULL UNIQUE,
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Create regions table
      CREATE TABLE IF NOT EXISTS regions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        state_id UUID NOT NULL REFERENCES states(id) ON DELETE CASCADE,
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Create organization_regions table
      CREATE TABLE IF NOT EXISTS organization_regions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
        region_id UUID NOT NULL REFERENCES regions(id) ON DELETE CASCADE,
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(organization_id, region_id)
      );

      -- Create locations table
      CREATE TABLE IF NOT EXISTS locations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        address TEXT NOT NULL,
        city TEXT NOT NULL,
        state TEXT NOT NULL,
        zip_code TEXT NOT NULL,
        region_id UUID REFERENCES regions(id),
        latitude DECIMAL(10,8),
        longitude DECIMAL(11,8),
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Create activities table
      CREATE TABLE IF NOT EXISTS activities (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title TEXT NOT NULL,
        description TEXT,
        organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
        location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
        start_date TIMESTAMP NOT NULL,
        end_date TIMESTAMP NOT NULL,
        status TEXT NOT NULL DEFAULT 'draft',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Create essential indexes
      CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_user_organizations_user_id ON user_organizations(user_id);
      CREATE INDEX IF NOT EXISTS idx_user_organizations_organization_id ON user_organizations(organization_id);
      CREATE INDEX IF NOT EXISTS idx_activities_organization_id ON activities(organization_id);
      CREATE INDEX IF NOT EXISTS idx_activities_location_id ON activities(location_id);
      CREATE INDEX IF NOT EXISTS idx_activities_start_date ON activities(start_date);
    `;

    // Execute the schema
    await client.query(schemaSQL);
    console.log('Schema deployed successfully');

    // Insert super admin user
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

    // Insert default organization
    await client.query(`
      INSERT INTO organizations (id, name, tier, active)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (id) DO NOTHING
    `, [
      'rishi-internal',
      'Rishi Internal',
      'enterprise',
      true
    ]);

    // Insert essential permissions
    const permissions = [
      { name: 'manage_users', description: 'Manage user accounts' },
      { name: 'manage_organizations', description: 'Manage organizations' },
      { name: 'manage_bookings', description: 'Manage bookings and events' },
      { name: 'view_analytics', description: 'View analytics and reports' },
      { name: 'manage_locations', description: 'Manage locations' },
      { name: 'manage_staff', description: 'Manage staff assignments' }
    ];

    for (const perm of permissions) {
      await client.query(`
        INSERT INTO permissions (name, description)
        VALUES ($1, $2)
        ON CONFLICT (name) DO UPDATE SET
          description = EXCLUDED.description,
          updated_at = CURRENT_TIMESTAMP
      `, [perm.name, perm.description]);
    }

    console.log('Initial data seeded successfully');

    // Verify the deployment
    const tableCount = await client.query(`
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    
    console.log(`Schema deployment completed: ${tableCount.rows[0].count} tables created`);

  } catch (error) {
    console.error('Schema deployment failed:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

// Run if called directly
if (require.main === module) {
  deploySchema()
    .then(() => {
      console.log('Schema deployment process completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Schema deployment process failed:', error);
      process.exit(1);
    });
}

module.exports = { deploySchema };