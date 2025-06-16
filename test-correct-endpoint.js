// Test the correct FINN API endpoint
import https from 'https';

const CLIENT_ID = 'c9623ca8fdbd46768b0aff75f0dcb5d0';
const CLIENT_SECRET = 'ceEDbfcAe33b4E2Bb2f209a82a91ac51';
const basicAuth = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');

console.log('Testing the correct FINN API endpoint...\n');

// Test with the example URL params from FINN
const testWithExampleParams = () => {
  console.log('Test 1: Using FINN example params (condition=2&location=0.20012&sub_category=1.77.5195)');
  
  const params = new URLSearchParams({
    condition: '2',
    location: '0.20012',
    sub_category: '1.77.5195'
  });
  
  const apiUrl = `https://pro-api.m10s.io/finn/search/quest/SEARCH_ID_BAP_COMMON?${params.toString()}`;
  console.log(`URL: ${apiUrl}`);
  
  makeRequest(apiUrl);
};

// Test with our original params
const testWithOurParams = () => {
  setTimeout(() => {
    console.log('\nTest 2: Using our original params (category=0.71&product_category=...)');
    
    const params = new URLSearchParams({
      category: '0.71',
      product_category: '2.71.3941.175',
      search_type: 'SEARCH_ID_BAP_ALL',
      sort: '1',
      sub_category: '1.71.3941',
      rows: '5'
    });
    
    const apiUrl = `https://pro-api.m10s.io/finn/search/quest/SEARCH_ID_BAP_COMMON?${params.toString()}`;
    console.log(`URL: ${apiUrl}`);
    
    makeRequest(apiUrl);
  }, 3000);
};

// Test with minimal params
const testMinimal = () => {
  setTimeout(() => {
    console.log('\nTest 3: Using minimal params');
    
    const params = new URLSearchParams({
      rows: '3'
    });
    
    const apiUrl = `https://pro-api.m10s.io/finn/search/quest/SEARCH_ID_BAP_COMMON?${params.toString()}`;
    console.log(`URL: ${apiUrl}`);
    
    makeRequest(apiUrl);
  }, 6000);
};

// Test different search IDs
const testDifferentSearchIds = () => {
  setTimeout(() => {
    console.log('\nTest 4: Testing different search IDs...');
    
    const searchIds = [
      'SEARCH_ID_BAP_ALL',
      'SEARCH_ID_REALESTATE_HOMES',
      'SEARCH_ID_CAR_USED'
    ];
    
    searchIds.forEach((searchId, index) => {
      setTimeout(() => {
        console.log(`  Testing: ${searchId}`);
        
        const params = new URLSearchParams({
          rows: '2'
        });
        
        const apiUrl = `https://pro-api.m10s.io/finn/search/quest/${searchId}?${params.toString()}`;
        
        makeRequest(apiUrl, searchId);
      }, index * 2000);
    });
  }, 9000);
};

const makeRequest = (url, label = '') => {
  const urlObj = new URL(url);
  
  const options = {
    hostname: urlObj.hostname,
    path: urlObj.pathname + urlObj.search,
    method: 'GET',
    headers: {
      'Authorization': `Basic ${basicAuth}`,
      'Accept': 'application/json'
    }
  };
  
  const req = https.request(options, (res) => {
    console.log(`  Status: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
      if (res.statusCode === 200) {
        console.log('  ✅ SUCCESS!');
        try {
          const json = JSON.parse(data);
          console.log(`  Found ${json.docs?.length || json.results?.length || 'unknown'} results`);
          
          if (json.docs && json.docs.length > 0) {
            const firstResult = json.docs[0];
            console.log(`  Sample result: ${firstResult.heading || firstResult.title}`);
            console.log(`  Price: ${firstResult.price?.amount || firstResult.price || 'N/A'}`);
          }
          
          // Log the structure for debugging
          console.log(`  Response structure: ${Object.keys(json).join(', ')}`);
        } catch (e) {
          console.log(`  Response: ${data.substring(0, 200)}...`);
        }
      } else {
        console.log(`  Response: ${data.substring(0, 200)}`);
      }
    });
  });
  
  req.on('error', (e) => {
    console.log(`  Error: ${e.message}`);
  });
  
  req.end();
};

// Run all tests
testWithExampleParams();
testWithOurParams();
testMinimal();
testDifferentSearchIds();