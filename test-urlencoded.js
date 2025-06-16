// Test with URL-encoded parameters in different ways
import https from 'https';

const CLIENT_ID = 'c9623ca8fdbd46768b0aff75f0dcb5d0';
const CLIENT_SECRET = 'ceEDbfcAe33b4E2Bb2f209a82a91ac51';
const basicAuth = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');

console.log('Testing URL-encoded approaches...\n');

// Test 1: Query string in POST body
const test1 = () => {
  console.log('\nTest 1: URL-encoded filters in JSON body');
  
  const params = new URLSearchParams({
    category: '0.71',
    product_category: '2.71.3941.175',
    search_type: 'SEARCH_ID_BAP_ALL',
    sort: '1',
    sub_category: '1.71.3941'
  });
  
  const body = JSON.stringify({
    vertical: 'recommerce',
    filters: params.toString(),
    size: 5
  });
  
  makeRequest('/finn/search', 'POST', body, 'application/json');
};

// Test 2: Direct to integrations endpoint
const test2 = () => {
  console.log('\nTest 2: Direct POST to /integrations/search/quest');
  
  const body = JSON.stringify({
    vertical: 'recommerce',
    filters: {
      category: '0.71',
      product_category: '2.71.3941.175'
    },
    size: 5
  });
  
  makeRequest('/integrations/search/quest', 'POST', body, 'application/json');
};

// Test 3: Try without /finn prefix
const test3 = () => {
  console.log('\nTest 3: POST to /search/quest');
  
  const body = JSON.stringify({
    category: '0.71',
    size: 5
  });
  
  makeRequest('/search/quest', 'POST', body, 'application/json');
};

// Test 4: Try GraphQL style
const test4 = () => {
  console.log('\nTest 4: GraphQL-style request');
  
  const body = JSON.stringify({
    query: `{
      search(vertical: "recommerce", category: "0.71") {
        results
      }
    }`
  });
  
  makeRequest('/graphql', 'POST', body, 'application/json');
};

// Test 5: Try with API key in different header
const test5 = () => {
  console.log('\nTest 5: API key in X-API-Key header');
  
  const options = {
    hostname: 'pro-api.m10s.io',
    path: '/finn/search',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': CLIENT_SECRET,
      'Accept': 'application/json'
    }
  };
  
  const req = https.request(options, handleResponse);
  req.on('error', (e) => console.error(`Error: ${e.message}`));
  req.write(JSON.stringify({ vertical: 'bap', size: 1 }));
  req.end();
};

// Helper function
const makeRequest = (path, method, body, contentType) => {
  console.log(`${method} ${path}`);
  if (body) console.log(`Body: ${body.substring(0, 100)}...`);
  
  const options = {
    hostname: 'pro-api.m10s.io',
    path: path,
    method: method,
    headers: {
      'Authorization': `Basic ${basicAuth}`,
      'Accept': 'application/json'
    }
  };
  
  if (body) {
    options.headers['Content-Type'] = contentType;
    options.headers['Content-Length'] = Buffer.byteLength(body);
  }
  
  const req = https.request(options, handleResponse);
  req.on('error', (e) => console.error(`Error: ${e.message}`));
  
  if (body) req.write(body);
  req.end();
};

const handleResponse = (res) => {
  console.log(`Status: ${res.statusCode}`);
  
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    if (res.statusCode === 200) {
      console.log('✅ SUCCESS!');
      try {
        const json = JSON.parse(data);
        console.log(JSON.stringify(json, null, 2).substring(0, 300));
      } catch (e) {
        console.log(data.substring(0, 200));
      }
    } else {
      console.log('Response:', data.substring(0, 200));
    }
  });
};

// Run tests with delays
test1();
setTimeout(test2, 2000);
setTimeout(test3, 4000);
setTimeout(test4, 6000);
setTimeout(test5, 8000);

// Test OPTIONS request to check CORS
setTimeout(() => {
  console.log('\nTest 6: OPTIONS request to check allowed methods');
  
  const options = {
    hostname: 'pro-api.m10s.io',
    path: '/finn/search',
    method: 'OPTIONS',
    headers: {
      'Origin': 'https://editor.vev.design',
      'Access-Control-Request-Method': 'POST',
      'Access-Control-Request-Headers': 'authorization,content-type'
    }
  };
  
  const req = https.request(options, (res) => {
    console.log(`OPTIONS Status: ${res.statusCode}`);
    console.log('CORS Headers:');
    console.log('- Allow:', res.headers['allow']);
    console.log('- Access-Control-Allow-Methods:', res.headers['access-control-allow-methods']);
    console.log('- Access-Control-Allow-Headers:', res.headers['access-control-allow-headers']);
  });
  
  req.on('error', (e) => console.error(`Error: ${e.message}`));
  req.end();
}, 10000);