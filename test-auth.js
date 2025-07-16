const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/',
  method: 'GET',
  headers: {
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
  }
};

const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  console.log(`Headers: ${JSON.stringify(res.headers)}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    if (data.includes('Authentication Required')) {
      console.log('✅ Authentication is working - user needs to sign in');
    } else if (data.includes('CleverCompany')) {
      console.log('❌ Authentication bypass - user not required to sign in');
    } else {
      console.log('? Unknown response');
    }
    
    if (data.includes('Sign In')) {
      console.log('✅ Sign in button found');
    }
    
    console.log('Response length:', data.length);
  });
});

req.on('error', (e) => {
  console.error(`Problem with request: ${e.message}`);
});

req.end();