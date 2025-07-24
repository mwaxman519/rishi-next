/**
 * Fix Matt's password in production database
 * Set password to 'password123' with proper bcrypt hashing
 */

import bcrypt from 'bcryptjs';
import { db } from './app/lib/db.js';
import { users } from './shared/schema.js';
import { eq } from 'drizzle-orm';

async function fixMattPassword() {
  console.log('Fixing Matt\'s password in production database...');
  
  try {
    // Hash the password 'password123' with 12 salt rounds
    const hashedPassword = await bcrypt.hash('password123', 12);
    console.log('Password hashed successfully');
    
    // Update Matt's password in the database
    const result = await db
      .update(users)
      .set({ 
        password: hashedPassword,
        updatedAt: new Date()
      })
      .where(eq(users.username, 'matt'))
      .returning();
    
    if (result.length > 0) {
      console.log('✅ Matt\'s password updated successfully');
      console.log('Username: matt');
      console.log('New password: password123');
      console.log('User ID:', result[0].id);
      console.log('Email:', result[0].email);
      console.log('Role:', result[0].role);
      
      // Test the password hash
      const isValid = await bcrypt.compare('password123', hashedPassword);
      console.log('Password verification test:', isValid ? '✅ PASSED' : '❌ FAILED');
    } else {
      console.log('❌ User matt not found in database');
    }
    
  } catch (error) {
    console.error('❌ Error fixing Matt\'s password:', error);
  }
}

fixMattPassword();