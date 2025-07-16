#!/usr/bin/env node

/**
 * Fix Staging Authentication Script
 * This script fixes the database connection issues causing authentication failures in staging
 */

const { neon } = require('@neondatabase/serverless');

async function fixStagingAuthentication() {
  console.log('🔧 Fixing staging authentication...');
  
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.error('❌ DATABASE_URL environment variable is not set');
    console.error('❌ This script requires DATABASE_URL to be configured');
    process.exit(1);
  }
  
  const sql = neon(databaseUrl);
  
  try {
    // Test database connection
    console.log('🔍 Testing database connection...');
    const result = await sql`SELECT NOW() as current_time`;
    console.log('✅ Database connection successful');
    
    // Verify user exists
    console.log('🔍 Verifying user mike exists...');
    const users = await sql`SELECT id, username, password, role, active FROM users WHERE username = 'mike'`;
    
    if (users.length === 0) {
      console.log('❌ User mike not found, creating...');
      await sql`
        INSERT INTO users (id, username, password, role, full_name, email, active)
        VALUES ('261143cd-fa2b-4660-8b54-364c87b63882', 'mike', 'wrench519', 'super_admin', 'Mike Admin', 'mike@rishi.com', true)
        ON CONFLICT (id) DO UPDATE SET
          username = EXCLUDED.username,
          password = EXCLUDED.password,
          role = EXCLUDED.role,
          active = EXCLUDED.active
      `;
      console.log('✅ User mike created successfully');
    } else {
      console.log('✅ User mike found:', {
        id: users[0].id,
        username: users[0].username,
        role: users[0].role,
        active: users[0].active
      });
    }
    
    // Verify organization exists
    console.log('🔍 Verifying Rishi Internal organization exists...');
    const orgs = await sql`SELECT id, name, type FROM organizations WHERE name = 'Rishi Internal'`;
    
    if (orgs.length === 0) {
      console.log('❌ Rishi Internal organization not found, creating...');
      await sql`
        INSERT INTO organizations (id, name, type, status, created_at, updated_at)
        VALUES ('00000000-0000-0000-0000-000000000001', 'Rishi Internal', 'internal', 'active', NOW(), NOW())
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          type = EXCLUDED.type,
          status = EXCLUDED.status
      `;
      console.log('✅ Rishi Internal organization created successfully');
    } else {
      console.log('✅ Rishi Internal organization found:', {
        id: orgs[0].id,
        name: orgs[0].name,
        type: orgs[0].type
      });
    }
    
    // Test authentication flow
    console.log('🔍 Testing authentication flow...');
    const authTest = await sql`
      SELECT u.id, u.username, u.password, u.role, u.active
      FROM users u
      WHERE u.username = 'mike' AND u.password = 'wrench519' AND u.active = true
    `;
    
    if (authTest.length > 0) {
      console.log('✅ Authentication test successful');
    } else {
      console.log('❌ Authentication test failed');
    }
    
    console.log('🎉 Staging authentication fix completed successfully!');
    
  } catch (error) {
    console.error('❌ Error fixing staging authentication:', error);
    process.exit(1);
  }
}

// Run the fix
fixStagingAuthentication();