// Test with the actual URLs provided by FINN
import https from 'https';

const CLIENT_ID = 'c9623ca8fdbd46768b0aff75f0dcb5d0';
const CLIENT_SECRET = 'ceEDbfcAe33b4E2Bb2f209a82a91ac51';
const basicAuth = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');

console.log('Testing with actual FINN URLs...\n');

const finnUrls = [
  'https://www.finn.no/recommerce/forsale/search?q=skolesekk&shipping_types=0&sort=RELEVANCE',
  'https://www.finn.no/recommerce/forsale/search?q=fargeblyanter&shipping_types=0&sort=RELEVANCE',
  'https://www.finn.no/recommerce/forsale/search?children_clothing_size=1&children_clothing_size=2&children_clothing_size=3&children_clothing_size=4&children_clothing_size=5&children_clothing_size=6&q=kles&shipping_types=0&sub_category=1.68.3913'
];

const testWithFinnUrl = (finnUrl, index) => {
  console.log(`\nTest ${index + 1}: ${finnUrl.split('?')[1]?.substring(0, 50)}...`);
  console.log(`Full URL: ${finnUrl}`);
  
  // Extract query parameters from FINN URL
  const url = new URL(finnUrl);
  const params = url.searchParams;
  
  console.log('Parameters:');
  for (const [key, value] of params) {
    console.log(`  ${key}: ${value}`);
  }
  
  // Test the API with these parameters
  const apiUrl = `https://pro-api.m10s.io/quest/SEARCH_ID_BAP_COMMON?${params.toString()}`;
  console.log(`\nAPI URL: ${apiUrl}`);
  
  makeRequest(apiUrl, index + 1);
};

const makeRequest = (url, testNumber) => {
  const urlObj = new URL(url);
  
  const options = {
    hostname: urlObj.hostname,
    path: urlObj.pathname + urlObj.search,
    method: 'GET',
    headers: {
      'Authorization': `Basic ${basicAuth}`,
      'Accept': 'application/json',
      'User-Agent': 'FINNVevComponent/1.0'
    }
  };
  
  const req = https.request(options, (res) => {
    console.log(`Test ${testNumber} Status: ${res.statusCode}`);
    
    // Log response headers that might be helpful
    if (res.headers['retry-after']) {
      console.log(`  Retry-After: ${res.headers['retry-after']}`);
    }
    if (res.headers['x-ratelimit-remaining']) {
      console.log(`  Rate Limit Remaining: ${res.headers['x-ratelimit-remaining']}`);
    }
    
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
      if (res.statusCode === 200) {
        console.log(`  ✅ SUCCESS!`);
        try {
          const json = JSON.parse(data);
          console.log(`  Response structure: ${Object.keys(json).join(', ')}`);
          
          if (json.docs && json.docs.length > 0) {
            console.log(`  Found ${json.docs.length} results`);
            console.log(`  First result: "${json.docs[0].heading}"`);
            console.log(`  Price: ${json.docs[0].price?.amount || json.docs[0].price || 'N/A'}`);
          } else if (json.results) {
            console.log(`  Found ${json.results.length} results`);
          } else {
            console.log(`  Full response: ${JSON.stringify(json).substring(0, 300)}...`);
          }
        } catch (e) {
          console.log(`  Response (not JSON): ${data.substring(0, 200)}...`);
        }
      } else if (res.statusCode === 503) {
        console.log(`  ❌ Service Unavailable (503)`);
      } else if (res.statusCode === 404) {
        console.log(`  ❌ Not Found (404)`);
      } else {
        console.log(`  Response: ${data.substring(0, 150)}...`);
      }
      
      console.log('  ' + '='.repeat(60));
    });
  });
  
  req.on('error', (e) => {
    console.log(`Test ${testNumber} Error: ${e.message}`);
  });
  
  req.setTimeout(10000, () => {
    console.log(`Test ${testNumber} Timeout`);
    req.destroy();
  });
  
  req.end();
};

// Test each URL with a delay
finnUrls.forEach((url, index) => {
  setTimeout(() => {
    testWithFinnUrl(url, index);
  }, index * 5000);
});

// Also test if the service responds to a simple ping
setTimeout(() => {
  console.log('\n' + '='.repeat(80));
  console.log('Testing service availability with minimal request...');
  
  const simpleUrl = 'https://pro-api.m10s.io/quest/SEARCH_ID_BAP_COMMON?rows=1';
  makeRequest(simpleUrl, 'Simple');
}, finnUrls.length * 5000 + 2000);