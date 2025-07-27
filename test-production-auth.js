import https from 'https';

function testProductionAuth() {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      username: 'mike',
      password: 'wrench519'
    });

    const options = {
      hostname: 'rishi-next-4g4s84iwt-mwaxman519s-projects.vercel.app',
      port: 443,
      path: '/api/auth-service/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'User-Agent': 'Node.js Test Client'
      },
      timeout: 30000
    };

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        console.log(`Status Code: ${res.statusCode}`);
        console.log(`Response Headers:`, res.headers);
        console.log(`Response Body:`, data);
        
        try {
          const parsed = JSON.parse(data);
          if (parsed.success) {
            console.log('✅ LOGIN SUCCESSFUL!');
            console.log('User:', parsed.user);
            console.log('Token present:', !!parsed.token);
          } else {
            console.log('❌ LOGIN FAILED');
            console.log('Error:', parsed.error);
          }
        } catch (e) {
          console.log('Raw response:', data);
        }
        
        resolve(data);
      });
    });

    req.on('error', (error) => {
      console.error('Request error:', error);
      reject(error);
    });

    req.on('timeout', () => {
      console.error('Request timeout');
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.write(postData);
    req.end();
  });
}

// Run the test
console.log('🧪 Testing production authentication...');
testProductionAuth()
  .then(() => console.log('Test completed'))
  .catch(error => console.error('Test failed:', error));