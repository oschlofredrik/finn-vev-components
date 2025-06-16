// Test different request formats and structures
import https from 'https';
import { URL } from 'url';

const CLIENT_ID = 'c9623ca8fdbd46768b0aff75f0dcb5d0';
const CLIENT_SECRET = 'ceEDbfcAe33b4E2Bb2f209a82a91ac51';
const basicAuth = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');

// Extract query params from FINN URL
const finnUrl = 'https://www.finn.no/recommerce/forsale/search?category=0.71&product_category=2.71.3941.175&search_type=SEARCH_ID_BAP_ALL&sort=1&sub_category=1.71.3941';
const finnParams = new URL(finnUrl).searchParams;

console.log('Testing different request formats...\n');

const tests = [
  {
    name: 'Test 1: Simple GET with query params',
    method: 'GET',
    path: `/finn/search?${finnParams.toString()}`,
    body: null
  },
  {
    name: 'Test 2: GET with minimal params',
    method: 'GET',
    path: '/finn/search?category=0.71&size=5',
    body: null
  },
  {
    name: 'Test 3: POST with flat structure',
    method: 'POST',
    path: '/finn/search',
    body: JSON.stringify({
      category: '0.71',
      product_category: '2.71.3941.175',
      search_type: 'SEARCH_ID_BAP_ALL',
      sort: '1',
      sub_category: '1.71.3941',
      size: 5
    })
  },
  {
    name: 'Test 4: POST with different structure',
    method: 'POST',
    path: '/finn/search',
    body: JSON.stringify({
      query: {
        category: '0.71',
        product_category: '2.71.3941.175'
      },
      pagination: {
        size: 5,
        page: 0
      }
    })
  },
  {
    name: 'Test 5: POST to /search endpoint',
    method: 'POST',
    path: '/search',
    body: JSON.stringify({
      vertical: 'recommerce',
      category: '0.71',
      size: 5
    })
  },
  {
    name: 'Test 6: GET to /api/v1/search',
    method: 'GET',
    path: '/api/v1/search?category=0.71',
    body: null
  },
  {
    name: 'Test 7: POST with search wrapper',
    method: 'POST',
    path: '/finn/search',
    body: JSON.stringify({
      search: {
        vertical: 'recommerce',
        filters: {
          category: '0.71'
        }
      }
    })
  },
  {
    name: 'Test 8: POST as form data',
    method: 'POST',
    path: '/finn/search',
    body: 'category=0.71&product_category=2.71.3941.175&size=5',
    contentType: 'application/x-www-form-urlencoded'
  }
];

let testIndex = 0;

const runTest = () => {
  if (testIndex >= tests.length) {
    console.log('\nAll tests completed!');
    testAlternativeHosts();
    return;
  }
  
  const test = tests[testIndex];
  console.log(`\n${test.name}`);
  console.log(`${test.method} ${test.path}`);
  if (test.body) console.log(`Body: ${test.body.substring(0, 100)}...`);
  
  const options = {
    hostname: 'pro-api.m10s.io',
    path: test.path,
    method: test.method,
    headers: {
      'Authorization': `Basic ${basicAuth}`,
      'Accept': 'application/json'
    }
  };
  
  if (test.body) {
    options.headers['Content-Type'] = test.contentType || 'application/json';
    options.headers['Content-Length'] = Buffer.byteLength(test.body);
  }
  
  const req = https.request(options, (res) => {
    console.log(`Status: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
      if (res.statusCode === 200) {
        console.log('✅ SUCCESS! Response:');
        try {
          const json = JSON.parse(data);
          console.log(JSON.stringify(json, null, 2).substring(0, 500));
        } catch (e) {
          console.log(data.substring(0, 200));
        }
      } else {
        console.log('Response:', data.substring(0, 200));
      }
      
      testIndex++;
      setTimeout(runTest, 1500);
    });
  });
  
  req.on('error', (e) => {
    console.error(`Error: ${e.message}`);
    testIndex++;
    setTimeout(runTest, 1500);
  });
  
  if (test.body) {
    req.write(test.body);
  }
  req.end();
};

// Test alternative hosts
const testAlternativeHosts = () => {
  console.log('\n\nTesting alternative hosts/domains...');
  
  const hosts = [
    'api.finn.no',
    'finn.no',
    'm10s.io',
    'api.m10s.io'
  ];
  
  hosts.forEach((host, index) => {
    setTimeout(() => {
      console.log(`\nTrying host: ${host}`);
      
      const options = {
        hostname: host,
        path: '/search',
        method: 'GET',
        headers: {
          'Authorization': `Basic ${basicAuth}`,
          'Accept': 'application/json'
        }
      };
      
      const req = https.request(options, (res) => {
        console.log(`${host} - Status: ${res.statusCode}`);
      });
      
      req.on('error', (e) => console.log(`${host} - Error: ${e.message}`));
      req.end();
    }, index * 1000);
  });
};

// Start tests
runTest();