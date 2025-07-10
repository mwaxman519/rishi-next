/**
 * Test login with debug logging
 */

// Simple test to check the login endpoint
const testData = {
  username: 'mike',
  password: 'wrench519'
};

console.log('🔧 Testing login with debug logging...');
console.log('Test data:', testData);

// Use fetch with proper error handling
fetch('http://localhost:5000/api/auth-service/routes/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(testData),
})
.then(response => {
  console.log('Response status:', response.status);
  console.log('Response headers:', Object.fromEntries(response.headers.entries()));
  
  if (!response.ok) {
    return response.json().then(errorData => {
      console.log('❌ Login failed with error:', errorData);
      throw new Error(`HTTP ${response.status}: ${errorData.error || 'Unknown error'}`);
    });
  }
  
  return response.json();
})
.then(data => {
  console.log('✅ Login successful:', data);
})
.catch(error => {
  console.error('❌ Login test failed:', error);
});