#!/usr/bin/env node

/**
 * Create Super Admin User Script
 * Creates user 'mike' with password 'wrench519' as super admin
 */

import { config } from 'dotenv';
import { db } from './db.ts';
import { users, organizations, userOrganizations } from './shared/schema.ts';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

// Load environment variables
config();

async function hashPassword(password) {
  return await bcrypt.hash(password, 12);
}

async function createSuperAdminUser() {
  try {
    console.log('🚀 Creating super admin user "mike"...');
    
    // Check if user already exists
    const existingUser = await db.select().from(users).where(eq(users.username, 'mike'));
    if (existingUser.length > 0) {
      console.log('⚠️  User "mike" already exists. Updating password...');
      
      const hashedPassword = await hashPassword('wrench519');
      await db.update(users)
        .set({ 
          password: hashedPassword,
          role: 'super_admin',
          updatedAt: new Date()
        })
        .where(eq(users.username, 'mike'));
      
      console.log('✅ User "mike" password updated successfully!');
      return;
    }
    
    // Create new super admin user
    const userId = uuidv4();
    const hashedPassword = await hashPassword('wrench519');
    
    const newUser = await db.insert(users).values({
      id: userId,
      username: 'mike',
      email: 'mike@rishi.com',
      password: hashedPassword,
      fullName: 'Mike Waxman',
      role: 'super_admin',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning();
    
    console.log('✅ Super admin user created successfully!');
    console.log('📋 User Details:');
    console.log('   Username: mike');
    console.log('   Password: wrench519');
    console.log('   Role: super_admin');
    console.log('   Full Name: Mike Waxman');
    console.log('   Email: mike@rishi.com');
    
    // Create default organization if it doesn't exist
    const defaultOrg = await db.select().from(organizations).where(eq(organizations.name, 'Rishi Platform'));
    let orgId;
    
    if (defaultOrg.length === 0) {
      const orgResult = await db.insert(organizations).values({
        id: uuidv4(),
        name: 'Rishi Platform',
        tier: 'tier_3',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      }).returning();
      orgId = orgResult[0].id;
      console.log('✅ Default organization "Rishi Platform" created');
    } else {
      orgId = defaultOrg[0].id;
      console.log('📋 Using existing organization "Rishi Platform"');
    }
    
    // Associate user with organization
    await db.insert(userOrganizations).values({
      id: uuidv4(),
      userId: userId,
      organizationId: orgId,
      role: 'super_admin',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    console.log('✅ User associated with organization successfully!');
    console.log('🎉 Setup complete! You can now log in with:');
    console.log('   Username: mike');
    console.log('   Password: wrench519');
    
  } catch (error) {
    console.error('❌ Error creating super admin user:', error);
    process.exit(1);
  }
}

// Run the script
createSuperAdminUser().then(() => {
  console.log('🏁 Script completed successfully!');
  process.exit(0);
}).catch((error) => {
  console.error('💥 Script failed:', error);
  process.exit(1);
});