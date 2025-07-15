import { db } from './app/lib/db.js';
import { users } from './shared/schema.js';
import { hashPassword } from './app/lib/auth-server.js';

async function createMattUser() {
  try {
    console.log('Creating user "matt" with email mgill0x@gmail.com...');
    
    // Hash the password
    const hashedPassword = await hashPassword('password123');
    console.log('Password hashed successfully');
    
    // Create the user
    const result = await db.insert(users).values({
      username: 'matt',
      email: 'mgill0x@gmail.com',
      password: hashedPassword,
      fullName: 'Matt Gill',
      role: 'brand_agent',
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();
    
    console.log('User created successfully:', {
      id: result[0].id,
      username: result[0].username,
      email: result[0].email,
      fullName: result[0].fullName,
      role: result[0].role,
    });
    
    return result[0];
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}

// Run the function
createMattUser()
  .then(() => {
    console.log('✅ User "matt" created successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Failed to create user:', error);
    process.exit(1);
  });