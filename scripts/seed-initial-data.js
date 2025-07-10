#!/usr/bin/env node
/**
 * Initial Data Seeding Script
 * Seeds required initial data for staging/production environments
 */

const { db } = require('../server/db.ts');
const { users, organizations, permissions, states, regions } = require('../shared/schema.ts');
const { eq } = require('drizzle-orm');
const bcrypt = require('bcryptjs');

async function seedInitialData() {
  console.log('Seeding initial data...');

  try {
    // Check if super admin user exists
    const [existingUser] = await db.select().from(users).where(eq(users.username, 'mike'));
    
    if (!existingUser) {
      console.log('Creating super admin user...');
      const hashedPassword = await bcrypt.hash('wrench519', 10);
      
      await db.insert(users).values({
        id: '261143cd-fa2b-4660-8b54-364c87b63882',
        username: 'mike',
        password: hashedPassword,
        role: 'super_admin',
        full_name: 'Mike Super Admin',
        email: 'mike@rishi.com',
        active: true,
        created_at: new Date(),
        updated_at: new Date()
      });
      
      console.log('Super admin user created successfully');
    } else {
      console.log('Super admin user already exists');
    }

    // Check if default organization exists
    const [existingOrg] = await db.select().from(organizations).where(eq(organizations.name, 'Rishi Internal'));
    
    if (!existingOrg) {
      console.log('Creating default organization...');
      await db.insert(organizations).values({
        id: 'rishi-internal',
        name: 'Rishi Internal',
        tier: 'enterprise',
        active: true,
        created_at: new Date(),
        updated_at: new Date()
      });
      
      console.log('Default organization created successfully');
    } else {
      console.log('Default organization already exists');
    }

    // Seed essential permissions if they don't exist
    const essentialPermissions = [
      { name: 'manage_users', description: 'Manage user accounts' },
      { name: 'manage_organizations', description: 'Manage organizations' },
      { name: 'manage_bookings', description: 'Manage bookings and events' },
      { name: 'view_analytics', description: 'View analytics and reports' },
      { name: 'manage_locations', description: 'Manage locations' },
      { name: 'manage_staff', description: 'Manage staff assignments' }
    ];

    for (const perm of essentialPermissions) {
      const [existing] = await db.select().from(permissions).where(eq(permissions.name, perm.name));
      if (!existing) {
        await db.insert(permissions).values(perm);
        console.log(`Created permission: ${perm.name}`);
      }
    }

    console.log('Initial data seeding completed successfully');
    
  } catch (error) {
    console.error('Initial data seeding failed:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  seedInitialData()
    .then(() => {
      console.log('Seeding process completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Seeding process failed:', error);
      process.exit(1);
    });
}

module.exports = { seedInitialData };