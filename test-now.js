// Quick test to see if FINN API is working now
import https from 'https';

const CLIENT_ID = 'c9623ca8fdbd46768b0aff75f0dcb5d0';
const CLIENT_SECRET = 'ceEDbfcAe33b4E2Bb2f209a82a91ac51';
const basicAuth = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');

console.log('Testing FINN API availability...\n');

const testUrls = [
  'https://pro-api.m10s.io/quest/SEARCH_ID_BAP_COMMON?q=skolesekk&rows=3',
  'https://pro-api.m10s.io/quest/SEARCH_ID_BAP_COMMON?q=fargeblyanter&rows=3'
];

testUrls.forEach((apiUrl, index) => {
  setTimeout(() => {
    console.log(`Test ${index + 1}: ${apiUrl.split('?')[1]}`);
    
    const urlObj = new URL(apiUrl);
    
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
      console.log(`Status: ${res.statusCode}`);
      
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log('✅ SUCCESS! API is working!');
          try {
            const json = JSON.parse(data);
            console.log(`Response keys: ${Object.keys(json).join(', ')}`);
            console.log(`Sample data: ${JSON.stringify(json).substring(0, 300)}...`);
          } catch (e) {
            console.log(`Response: ${data.substring(0, 300)}...`);
          }
        } else if (res.statusCode === 503) {
          console.log('❌ Still 503 - Service Unavailable');
        } else {
          console.log(`Response: ${data.substring(0, 200)}...`);
        }
        console.log('-'.repeat(60));
      });
    });
    
    req.on('error', (e) => console.log(`Error: ${e.message}`));
    req.end();
  }, index * 2000);
});