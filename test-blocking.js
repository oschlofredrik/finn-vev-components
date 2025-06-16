// Test if we're being blocked by IP, rate limiting, or other factors
import https from 'https';

const CLIENT_ID = 'c9623ca8fdbd46768b0aff75f0dcb5d0';
const CLIENT_SECRET = 'ceEDbfcAe33b4E2Bb2f209a82a91ac51';
const basicAuth = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');

console.log('Testing for potential blocking scenarios...\n');

// Test 1: Check rate limiting with delays
const testRateLimit = async () => {
  console.log('Test 1: Checking for rate limiting...');
  
  for (let i = 0; i < 3; i++) {
    console.log(`Request ${i + 1}/3`);
    
    const options = {
      hostname: 'pro-api.m10s.io',
      path: '/finn/search',
      method: 'POST',
      headers: {
        'Authorization': `Basic ${basicAuth}`,
        'Content-Type': 'application/json'
      }
    };
    
    const req = https.request(options, (res) => {
      console.log(`  Status: ${res.statusCode}`);
      console.log(`  Headers: Rate-Limit: ${res.headers['x-ratelimit-remaining']}, Retry-After: ${res.headers['retry-after']}`);
      
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 429) {
          console.log('  ❌ RATE LIMITED!');
        } else if (res.statusCode === 403) {
          console.log('  ❌ FORBIDDEN - Possibly IP blocked');
        }
      });
    });
    
    req.on('error', (e) => console.log(`  Error: ${e.message}`));
    req.write(JSON.stringify({ size: 1 }));
    req.end();
    
    // Wait between requests
    if (i < 2) await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  setTimeout(testWithoutAuth, 3000);
};

// Test 2: Try without authentication to see different response
const testWithoutAuth = () => {
  console.log('\nTest 2: Request without authentication (to compare responses)');
  
  const options = {
    hostname: 'pro-api.m10s.io',
    path: '/finn/search',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  };
  
  const req = https.request(options, (res) => {
    console.log(`No auth status: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
      console.log(`No auth response: ${data.substring(0, 100)}`);
      setTimeout(testDifferentUserAgent, 2000);
    });
  });
  
  req.on('error', (e) => console.log(`Error: ${e.message}`));
  req.write(JSON.stringify({ size: 1 }));
  req.end();
};

// Test 3: Try with different User-Agent
const testDifferentUserAgent = () => {
  console.log('\nTest 3: Try with different User-Agent headers');
  
  const userAgents = [
    'curl/7.68.0',
    'PostmanRuntime/7.28.0',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  ];
  
  userAgents.forEach((ua, index) => {
    setTimeout(() => {
      console.log(`Testing User-Agent: ${ua.substring(0, 30)}...`);
      
      const options = {
        hostname: 'pro-api.m10s.io',
        path: '/finn/search',
        method: 'POST',
        headers: {
          'Authorization': `Basic ${basicAuth}`,
          'Content-Type': 'application/json',
          'User-Agent': ua
        }
      };
      
      const req = https.request(options, (res) => {
        console.log(`  Status: ${res.statusCode}`);
      });
      
      req.on('error', (e) => console.log(`  Error: ${e.message}`));
      req.write(JSON.stringify({ size: 1 }));
      req.end();
    }, index * 1000);
  });
  
  setTimeout(testFromDifferentOrigin, 5000);
};

// Test 4: Test with origin headers
const testFromDifferentOrigin = () => {
  console.log('\nTest 4: Testing with different Origin headers');
  
  const origins = [
    'https://finn.no',
    'https://www.finn.no',
    'https://localhost:3000',
    null // no origin
  ];
  
  origins.forEach((origin, index) => {
    setTimeout(() => {
      console.log(`Testing origin: ${origin || 'none'}`);
      
      const headers = {
        'Authorization': `Basic ${basicAuth}`,
        'Content-Type': 'application/json'
      };
      
      if (origin) {
        headers['Origin'] = origin;
        headers['Referer'] = origin;
      }
      
      const options = {
        hostname: 'pro-api.m10s.io',
        path: '/finn/search',
        method: 'POST',
        headers: headers
      };
      
      const req = https.request(options, (res) => {
        console.log(`  Status: ${res.statusCode}`);
      });
      
      req.on('error', (e) => console.log(`  Error: ${e.message}`));
      req.write(JSON.stringify({ size: 1 }));
      req.end();
    }, index * 1000);
  });
  
  setTimeout(testIPInfo, 6000);
};

// Test 5: Check our IP and location
const testIPInfo = () => {
  console.log('\nTest 5: Checking our public IP address...');
  
  const options = {
    hostname: 'ipapi.co',
    path: '/json/',
    method: 'GET'
  };
  
  const req = https.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
      try {
        const info = JSON.parse(data);
        console.log(`Your IP: ${info.ip}`);
        console.log(`Location: ${info.city}, ${info.country_name}`);
        console.log(`ISP: ${info.org}`);
        
        if (info.country !== 'NO') {
          console.log('⚠️  You are not in Norway - this might cause geo-blocking');
        }
      } catch (e) {
        console.log('Could not get IP info');
      }
    });
  });
  
  req.on('error', (e) => console.log(`Error getting IP: ${e.message}`));
  req.end();
};

// Start tests
testRateLimit();