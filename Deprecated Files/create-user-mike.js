import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { db } from './db.ts';
import { users } from './shared/schema.ts';

async function createUser() {
  console.log('Creating user mike in staging database...');
  
  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash('wrench519', 10);
    const userId = uuidv4();
    
    // Create user data
    const userData = {
      id: userId,
      username: 'mike',
      password: hashedPassword,
      role: 'client_user', // Default role for testing
      full_name: 'Mike Test User',
      email: 'mike@test.com',
      phone: null,
      active: true,
      profile_image: null,
      created_at: new Date(),
      updated_at: new Date()
    };
    
    // Insert user into database
    const result = await db.insert(users).values(userData).returning();
    
    console.log('✅ User created successfully:', result[0]);
    console.log('Username: mike');
    console.log('Password: wrench519');
    console.log('Role: client_user');
    console.log('User ID:', result[0].id);
    
  } catch (error) {
    console.error('❌ Error creating user:', error);
  }
}

createUser();