// Simple raw API test to see exactly what FINN returns
import https from 'https';

// Your credentials
const CLIENT_ID = 'c9623ca8fdbd46768b0aff75f0dcb5d0';
const CLIENT_SECRET = 'ceEDbfcAe33b4E2Bb2f209a82a91ac51';

// Create Basic Auth token
const basicAuth = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');

// Test different endpoints
const endpoints = [
  'https://pro-api.m10s.io/finn/search',
  'https://pro-api.m10s.io/integrations/search/quest',
  'https://pro-api.m10s.io/search',
  'https://pro-api.m10s.io/api/search'
];

// Request body based on FINN's test URL
const requestBody = JSON.stringify({
  vertical: 'recommerce',
  filters: {
    category: '0.71',
    product_category: '2.71.3941.175',
    search_type: 'SEARCH_ID_BAP_ALL',
    sort: '1',
    sub_category: '1.71.3941'
  },
  size: 5,
  sort: '1'
});

console.log('Testing FINN Pro API with Basic Auth');
console.log('Client ID:', CLIENT_ID);
console.log('Request Body:', requestBody);
console.log('-----------------------------------\n');

// Test each endpoint
endpoints.forEach((url, index) => {
  setTimeout(() => {
    console.log(`\n[${index + 1}] Testing: ${url}`);
    
    const urlParts = new URL(url);
    
    const options = {
      hostname: urlParts.hostname,
      path: urlParts.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${basicAuth}`,
        'Accept': 'application/json',
        'Content-Length': Buffer.byteLength(requestBody)
      }
    };
    
    const req = https.request(options, (res) => {
      console.log(`Status: ${res.statusCode}`);
      console.log(`Headers: ${JSON.stringify(res.headers, null, 2)}`);
      
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log('Response Body:');
        try {
          // Try to parse as JSON
          const json = JSON.parse(data);
          console.log(JSON.stringify(json, null, 2));
        } catch (e) {
          // If not JSON, show raw response
          console.log(data);
        }
        console.log('-----------------------------------');
      });
    });
    
    req.on('error', (e) => {
      console.error(`Request error: ${e.message}`);
    });
    
    req.write(requestBody);
    req.end();
  }, index * 2000); // Space out requests by 2 seconds
});

// Also test GET request on some endpoints
setTimeout(() => {
  console.log('\n\nTesting GET request to base URL...');
  
  const getOptions = {
    hostname: 'pro-api.m10s.io',
    path: '/',
    method: 'GET',
    headers: {
      'Authorization': `Basic ${basicAuth}`,
      'Accept': 'application/json'
    }
  };
  
  const req = https.request(getOptions, (res) => {
    console.log(`GET / Status: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
      console.log('GET / Response:', data.substring(0, 200) + '...');
    });
  });
  
  req.on('error', (e) => console.error(`GET request error: ${e.message}`));
  req.end();
}, 10000);