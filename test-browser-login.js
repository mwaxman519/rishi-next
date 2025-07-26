const loginData = {
  username: 'mike',
  password: 'wrench519'
};

fetch('/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(loginData),
  credentials: 'include'
})
.then(response => response.json())
.then(data => {
  console.log('Login result:', data);
  
  // Check if we have auth cookie
  console.log('All cookies:', document.cookie);
  console.log('Has auth-token:', document.cookie.includes('auth-token'));
  
  // Try to access session endpoint
  return fetch('/api/auth-service/session', {
    credentials: 'include'
  });
})
.then(response => response.json())
.then(sessionData => {
  console.log('Session result:', sessionData);
})
.catch(error => {
  console.error('Error:', error);
});
