// Test timing and see if there are specific times when it works
import https from 'https';

const CLIENT_ID = 'c9623ca8fdbd46768b0aff75f0dcb5d0';
const CLIENT_SECRET = 'ceEDbfcAe33b4E2Bb2f209a82a91ac51';
const basicAuth = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');

console.log('Testing for service patterns and potential issues...\n');

// Test 1: Try the exact working endpoint format from another service
const testSimilarFormat = () => {
  console.log('Test 1: Trying different API patterns that might work...\n');
  
  // Based on error showing /integrations/search/quest, try variations
  const endpoints = [
    '/integrations/search',
    '/integrations/finn/search',
    '/api/integrations/search/quest',
    '/v1/integrations/search/quest',
    '/quest/search',
    '/quest'
  ];
  
  endpoints.forEach((endpoint, index) => {
    setTimeout(() => {
      console.log(`Trying: ${endpoint}`);
      
      const options = {
        hostname: 'pro-api.m10s.io',
        path: endpoint,
        method: 'POST',
        headers: {
          'Authorization': `Basic ${basicAuth}`,
          'Content-Type': 'application/json'
        }
      };
      
      const req = https.request(options, (res) => {
        console.log(`  Status: ${res.statusCode}`);
        
        // Log interesting status codes
        if (res.statusCode !== 503 && res.statusCode !== 404) {
          console.log(`  ⭐ Different response! Status: ${res.statusCode}`);
          
          let data = '';
          res.on('data', (chunk) => data += chunk);
          res.on('end', () => {
            console.log(`  Response: ${data.substring(0, 200)}`);
          });
        } else {
          res.on('data', () => {}); // consume response
        }
      });
      
      req.on('error', (e) => console.log(`  Error: ${e.message}`));
      req.write(JSON.stringify({ query: 'test', size: 1 }));
      req.end();
    }, index * 800);
  });
};

// Test 2: Check if HEAD requests work (lighter than POST)
const testHeadRequests = () => {
  setTimeout(() => {
    console.log('\nTest 2: Trying HEAD requests to see service availability...');
    
    const paths = ['/finn/search', '/integrations/search/quest', '/health', '/status'];
    
    paths.forEach((path, index) => {
      setTimeout(() => {
        console.log(`HEAD ${path}`);
        
        const options = {
          hostname: 'pro-api.m10s.io',
          path: path,
          method: 'HEAD',
          headers: {
            'Authorization': `Basic ${basicAuth}`
          }
        };
        
        const req = https.request(options, (res) => {
          console.log(`  Status: ${res.statusCode}`);
          if (res.headers['retry-after']) {
            console.log(`  ⚠️  Retry-After: ${res.headers['retry-after']}`);
          }
          if (res.headers['x-maintenance']) {
            console.log(`  ⚠️  Maintenance: ${res.headers['x-maintenance']}`);
          }
        });
        
        req.on('error', (e) => console.log(`  Error: ${e.message}`));
        req.end();
      }, index * 500);
    });
  }, 6000);
};

// Test 3: Check if there's a working health endpoint
const testHealthEndpoints = () => {
  setTimeout(() => {
    console.log('\nTest 3: Checking for working health/status endpoints...');
    
    const healthPaths = [
      '/health',
      '/status', 
      '/ping',
      '/api/health',
      '/_health',
      '/actuator/health'
    ];
    
    healthPaths.forEach((path, index) => {
      setTimeout(() => {
        console.log(`GET ${path}`);
        
        const options = {
          hostname: 'pro-api.m10s.io',
          path: path,
          method: 'GET'
        };
        
        const req = https.request(options, (res) => {
          console.log(`  Status: ${res.statusCode}`);
          
          if (res.statusCode === 200) {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
              console.log(`  ✅ WORKING! Response: ${data.substring(0, 100)}`);
            });
          } else {
            res.on('data', () => {}); // consume response
          }
        });
        
        req.on('error', (e) => console.log(`  Error: ${e.message}`));
        req.end();
      }, index * 400);
    });
  }, 9000);
};

// Test 4: Check for maintenance mode indicators
const testMaintenanceMode = () => {
  setTimeout(() => {
    console.log('\nTest 4: Checking for maintenance mode indicators...');
    
    const options = {
      hostname: 'pro-api.m10s.io',
      path: '/finn/search',
      method: 'GET',
      headers: {
        'Authorization': `Basic ${basicAuth}`,
        'Accept': 'application/json, text/html'
      }
    };
    
    const req = https.request(options, (res) => {
      console.log(`Status: ${res.statusCode}`);
      console.log('Response headers:');
      
      // Check for maintenance indicators
      Object.keys(res.headers).forEach(header => {
        if (header.includes('maintenance') || 
            header.includes('retry') || 
            header.includes('service') ||
            header.includes('x-')) {
          console.log(`  ${header}: ${res.headers[header]}`);
        }
      });
      
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        if (data.includes('maintenance') || data.includes('unavailable')) {
          console.log('  ⚠️  Service appears to be in maintenance mode');
        }
      });
    });
    
    req.on('error', (e) => console.log(`Error: ${e.message}`));
    req.end();
  }, 12000);
};

// Start all tests
testSimilarFormat();
testHeadRequests();
testHealthEndpoints();
testMaintenanceMode();