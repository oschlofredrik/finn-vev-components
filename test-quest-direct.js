// Test the quest endpoint directly
import https from 'https';

const CLIENT_ID = 'c9623ca8fdbd46768b0aff75f0dcb5d0';
const CLIENT_SECRET = 'ceEDbfcAe33b4E2Bb2f209a82a91ac51';
const basicAuth = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');

console.log('Testing quest endpoint directly...\n');

const testDirectQuestEndpoint = () => {
  console.log('Test 1: Direct quest endpoint');
  
  const params = new URLSearchParams({
    condition: '2',
    location: '0.20012',
    sub_category: '1.77.5195',
    rows: '5'
  });
  
  const apiUrl = `https://pro-api.m10s.io/quest/SEARCH_ID_BAP_COMMON?${params.toString()}`;
  console.log(`URL: ${apiUrl}`);
  
  makeRequest(apiUrl);
};

const testIntegrationsQuestEndpoint = () => {
  setTimeout(() => {
    console.log('\nTest 2: /integrations/search/quest endpoint');
    
    const params = new URLSearchParams({
      condition: '2',
      rows: '3'
    });
    
    const apiUrl = `https://pro-api.m10s.io/integrations/search/quest/SEARCH_ID_BAP_COMMON?${params.toString()}`;
    console.log(`URL: ${apiUrl}`);
    
    makeRequest(apiUrl);
  }, 3000);
};

const testSearchQuestEndpoint = () => {
  setTimeout(() => {
    console.log('\nTest 3: /search/quest endpoint');
    
    const params = new URLSearchParams({
      rows: '2'
    });
    
    const apiUrl = `https://pro-api.m10s.io/search/quest/SEARCH_ID_BAP_COMMON?${params.toString()}`;
    console.log(`URL: ${apiUrl}`);
    
    makeRequest(apiUrl);
  }, 6000);
};

const makeRequest = (url) => {
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
          console.log(`  Response keys: ${Object.keys(json).join(', ')}`);
          
          if (json.docs && json.docs.length > 0) {
            console.log(`  Found ${json.docs.length} results`);
            console.log(`  First result: ${json.docs[0].heading}`);
          } else if (json.results && json.results.length > 0) {
            console.log(`  Found ${json.results.length} results`);
          } else {
            console.log(`  Response sample: ${JSON.stringify(json).substring(0, 200)}`);
          }
        } catch (e) {
          console.log(`  Response: ${data.substring(0, 300)}`);
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

// Run tests
testDirectQuestEndpoint();
testIntegrationsQuestEndpoint();
testSearchQuestEndpoint();