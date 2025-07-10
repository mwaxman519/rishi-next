import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

async function createMikeUser() {
  console.log('🔧 Creating user mike for staging database...');
  
  try {
    // Generate user ID and hash password
    const userId = uuidv4();
    const hashedPassword = await bcrypt.hash('wrench519', 10);
    
    console.log('✅ User ID generated:', userId);
    console.log('✅ Password hashed successfully');
    
    // Output the SQL command to insert the user
    const sqlCommand = `INSERT INTO users (id, username, password, role, full_name, email, active, created_at, updated_at) 
VALUES ('${userId}', 'mike', '${hashedPassword}', 'client_user', 'Mike Test User', 'mike@test.com', true, NOW(), NOW());`;
    
    console.log('\n📝 SQL Command to execute:');
    console.log(sqlCommand);
    
    return {
      userId,
      hashedPassword,
      sqlCommand
    };
    
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  }
}

createMikeUser().then(result => {
  console.log('\n🎯 User creation data ready!');
  console.log('Username: mike');
  console.log('Password: wrench519');
  console.log('Role: client_user');
  console.log('User ID:', result.userId);
}).catch(console.error);