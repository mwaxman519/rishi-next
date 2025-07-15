/**
 * Script to update Matt's password to "password123" for production deployment
 */

import { db } from '../db.js';
import { users } from '../shared/schema.js';
import { eq } from 'drizzle-orm';
import * as bcrypt from 'bcryptjs';

async function updateMattPassword() {
  try {
    console.log('🔍 Finding user "matt" with email mgill0x@gmail.com...');
    
    // Find the user
    const user = await db.query.users.findFirst({
      where: eq(users.username, 'matt'),
    });
    
    if (!user) {
      console.log('❌ User "matt" not found');
      return;
    }
    
    console.log('✅ Found user:', {
      id: user.id,
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
    });
    
    // Hash the new password using the same method as the application
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash('password123', saltRounds);
    console.log('🔐 New password hashed successfully');
    
    // Update the user's password and email
    const result = await db.update(users)
      .set({
        password: hashedPassword,
        email: 'mgill0x@gmail.com',
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id))
      .returning();
    
    console.log('✅ User updated successfully:', {
      id: result[0].id,
      username: result[0].username,
      email: result[0].email,
      fullName: result[0].fullName,
      role: result[0].role,
    });
    
    return result[0];
  } catch (error) {
    console.error('❌ Error updating user:', error);
    throw error;
  }
}

// Run the function
updateMattPassword()
  .then(() => {
    console.log('✅ User "matt" password updated to "password123" successfully!');
    console.log('🚀 Ready for Vercel production deployment');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Failed to update user:', error);
    process.exit(1);
  });