// Test different authentication methods
import https from 'https';

const CLIENT_ID = 'c9623ca8fdbd46768b0aff75f0dcb5d0';
const CLIENT_SECRET = 'ceEDbfcAe33b4E2Bb2f209a82a91ac51';

const testAuth = (authHeader, description) => {
  console.log(`\nTesting: ${description}`);
  console.log(`Auth header: ${authHeader}`);
  
  const options = {
    hostname: 'pro-api.m10s.io',
    path: '/finn/search',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': authHeader,
      'Accept': 'application/json'
    }
  };
  
  const req = https.request(options, (res) => {
    console.log(`Status: ${res.statusCode}`);
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
      console.log('Response:', data.substring(0, 200));
    });
  });
  
  req.on('error', (e) => console.error(`Error: ${e.message}`));
  req.write('{"vertical":"bap","filters":{},"size":1}');
  req.end();
};

// Test different auth formats
testAuth(`Basic ${Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')}`, 'Basic Auth (ID:Secret)');

setTimeout(() => {
  testAuth(`Bearer ${CLIENT_SECRET}`, 'Bearer Token (Secret)');
}, 2000);

setTimeout(() => {
  testAuth(`Bearer ${CLIENT_ID}`, 'Bearer Token (Client ID)');
}, 4000);

setTimeout(() => {
  testAuth(CLIENT_SECRET, 'Raw Secret');
}, 6000);

// Test with custom headers
setTimeout(() => {
  console.log('\nTesting with custom headers...');
  const options = {
    hostname: 'pro-api.m10s.io',
    path: '/finn/search',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Client-Id': CLIENT_ID,
      'X-Client-Secret': CLIENT_SECRET,
      'Accept': 'application/json'
    }
  };
  
  const req = https.request(options, (res) => {
    console.log(`Custom headers status: ${res.statusCode}`);
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => console.log('Response:', data.substring(0, 200)));
  });
  
  req.write('{"vertical":"bap","filters":{},"size":1}');
  req.end();
}, 8000);