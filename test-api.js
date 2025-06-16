import fetch from 'node-fetch';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Configuration
const config = {
  clientId: process.env.FINN_CLIENT_ID || 'c9623ca8fdbd46768b0aff75f0dcb5d0',
  clientSecret: process.env.FINN_CLIENT_SECRET || 'ceEDbfcAe33b4E2Bb2f209a82a91ac51',
  localProxyUrl: 'http://localhost:10000/api/finn-search',
  finnProApiUrl: 'https://pro-api.m10s.io/integrations/search/quest',
  renderProxyUrl: 'https://finn-vev-components.onrender.com/api/finn-search'
};

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

// Test cases
const testCases = [
  {
    name: 'BAP - General marketplace search (sykkel)',
    body: {
      vertical: 'bap',
      filters: { q: 'sykkel' },
      size: 5,
      sort: 'PUBLISHED_DESC'
    }
  },
  {
    name: 'Recommerce - Curated eco-friendly items',
    body: {
      vertical: 'recommerce',
      filters: {},
      size: 5,
      sort: 'PUBLISHED_DESC'
    }
  },
  {
    name: 'Real Estate - Oslo apartments',
    body: {
      vertical: 'realestate',
      filters: { 
        location: '0.20061',
        property_type: 'apartment'
      },
      size: 5,
      sort: 'PUBLISHED_DESC'
    }
  },
  {
    name: 'Car - Electric vehicles',
    body: {
      vertical: 'car',
      filters: { 
        fuel: 'electric'
      },
      size: 5,
      sort: 'PUBLISHED_DESC'
    }
  },
  {
    name: 'Job - IT positions in Oslo',
    body: {
      vertical: 'job',
      filters: {
        location: '0.20061',
        occupation: '0.23'
      },
      size: 5,
      sort: 'PUBLISHED_DESC'
    }
  },
  {
    name: 'BAP - Price range filter',
    body: {
      vertical: 'bap',
      filters: { 
        q: 'iphone',
        price_from: 1000,
        price_to: 5000
      },
      size: 5,
      sort: 'PRICE_ASC'
    }
  }
];

// Function to test an endpoint
async function testEndpoint(url, testCase, useBasicAuth = false) {
  console.log(`\n${colors.cyan}Testing: ${testCase.name}${colors.reset}`);
  console.log(`URL: ${url}`);
  console.log(`Request body:`, JSON.stringify(testCase.body, null, 2));
  
  try {
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
    
    if (useBasicAuth) {
      const basicAuth = Buffer.from(`${config.clientId}:${config.clientSecret}`).toString('base64');
      headers['Authorization'] = `Basic ${basicAuth}`;
      console.log(`Using Basic Auth with client ID: ${config.clientId}`);
    }
    
    const startTime = Date.now();
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(testCase.body)
    });
    const responseTime = Date.now() - startTime;
    
    console.log(`Response status: ${response.status} (${responseTime}ms)`);
    console.log(`Response headers:`, Object.fromEntries(response.headers.entries()));
    
    const responseText = await response.text();
    
    if (response.ok) {
      try {
        const data = JSON.parse(responseText);
        console.log(`${colors.green}✓ Success${colors.reset}`);
        console.log(`Results count: ${data.docs?.length || data.results?.length || 0}`);
        
        // Display first result as sample
        const firstResult = (data.docs || data.results || [])[0];
        if (firstResult) {
          console.log(`\nFirst result sample:`);
          console.log(`- ID: ${firstResult.id || firstResult.finnkode || firstResult.ad_id}`);
          console.log(`- Title: ${firstResult.heading || firstResult.title}`);
          console.log(`- Price: ${firstResult.price?.amount || firstResult.price_amount || 'N/A'}`);
          console.log(`- URL: ${firstResult.canonical_url || firstResult.url || firstResult.ad_link || 'N/A'}`);
        }
      } catch (parseError) {
        console.log(`${colors.yellow}⚠ Response is not valid JSON${colors.reset}`);
        console.log(`Response: ${responseText.substring(0, 200)}...`);
      }
    } else {
      console.log(`${colors.red}✗ Error${colors.reset}`);
      console.log(`Response: ${responseText}`);
    }
    
    return { success: response.ok, status: response.status, time: responseTime };
  } catch (error) {
    console.log(`${colors.red}✗ Request failed${colors.reset}`);
    console.log(`Error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

// Function to test all endpoints
async function runAllTests() {
  console.log(`${colors.magenta}=== FINN Pro API Test Suite ===${colors.reset}`);
  console.log(`\nConfiguration:`);
  console.log(`- Client ID: ${config.clientId}`);
  console.log(`- Client Secret: ${config.clientSecret ? '***' + config.clientSecret.slice(-4) : 'NOT SET'}`);
  
  const results = {
    localProxy: { passed: 0, failed: 0, times: [] },
    directApi: { passed: 0, failed: 0, times: [] },
    renderProxy: { passed: 0, failed: 0, times: [] }
  };
  
  // Test 1: Local proxy
  console.log(`\n${colors.blue}--- Testing Local Proxy (${config.localProxyUrl}) ---${colors.reset}`);
  for (const testCase of testCases) {
    const result = await testEndpoint(config.localProxyUrl, testCase);
    if (result.success) {
      results.localProxy.passed++;
      results.localProxy.times.push(result.time);
    } else {
      results.localProxy.failed++;
    }
  }
  
  // Test 2: Direct API access
  console.log(`\n${colors.blue}--- Testing Direct FINN Pro API (${config.finnProApiUrl}) ---${colors.reset}`);
  for (const testCase of testCases) {
    const result = await testEndpoint(config.finnProApiUrl, testCase, true);
    if (result.success) {
      results.directApi.passed++;
      results.directApi.times.push(result.time);
    } else {
      results.directApi.failed++;
    }
  }
  
  // Test 3: Render proxy (optional)
  const testRenderProxy = process.argv.includes('--test-render');
  if (testRenderProxy) {
    console.log(`\n${colors.blue}--- Testing Render Proxy (${config.renderProxyUrl}) ---${colors.reset}`);
    for (const testCase of testCases) {
      const result = await testEndpoint(config.renderProxyUrl, testCase);
      if (result.success) {
        results.renderProxy.passed++;
        results.renderProxy.times.push(result.time);
      } else {
        results.renderProxy.failed++;
      }
    }
  }
  
  // Summary
  console.log(`\n${colors.magenta}=== Test Summary ===${colors.reset}`);
  
  const printSummary = (name, stats) => {
    const total = stats.passed + stats.failed;
    if (total === 0) return;
    
    const avgTime = stats.times.length > 0 
      ? Math.round(stats.times.reduce((a, b) => a + b, 0) / stats.times.length)
      : 0;
    
    console.log(`\n${name}:`);
    console.log(`- Total tests: ${total}`);
    console.log(`- Passed: ${colors.green}${stats.passed}${colors.reset}`);
    console.log(`- Failed: ${colors.red}${stats.failed}${colors.reset}`);
    if (avgTime > 0) {
      console.log(`- Average response time: ${avgTime}ms`);
    }
  };
  
  printSummary('Local Proxy', results.localProxy);
  printSummary('Direct API', results.directApi);
  if (testRenderProxy) {
    printSummary('Render Proxy', results.renderProxy);
  }
  
  // Additional debugging information
  console.log(`\n${colors.yellow}=== Debugging Tips ===${colors.reset}`);
  console.log(`1. Make sure the local server is running: npm start`);
  console.log(`2. Check that environment variables are set correctly`);
  console.log(`3. Verify FINN Pro API credentials are valid`);
  console.log(`4. Use --test-render flag to test the Render deployment`);
  console.log(`5. Check the server logs for more detailed error messages`);
}

// Function to test a single custom request
async function testCustomRequest() {
  console.log(`${colors.magenta}=== Custom FINN Pro API Test ===${colors.reset}`);
  
  // Custom request body - modify as needed
  const customRequest = {
    vertical: 'bap',
    filters: {
      q: 'test'
    },
    size: 10,
    sort: 'PUBLISHED_DESC'
  };
  
  console.log(`\nCustom request body:`, JSON.stringify(customRequest, null, 2));
  
  // Test against all endpoints
  await testEndpoint(config.localProxyUrl, { name: 'Custom - Local Proxy', body: customRequest });
  await testEndpoint(config.finnProApiUrl, { name: 'Custom - Direct API', body: customRequest }, true);
  
  if (process.argv.includes('--test-render')) {
    await testEndpoint(config.renderProxyUrl, { name: 'Custom - Render Proxy', body: customRequest });
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
${colors.cyan}FINN Pro API Test Script${colors.reset}

Usage: node test-api.js [options]

Options:
  --help, -h        Show this help message
  --custom          Run only the custom test (modify in script)
  --test-render     Include tests against the Render deployment
  --test <name>     Run only the test case matching the name

Environment variables:
  FINN_CLIENT_ID     Your FINN Pro API client ID
  FINN_CLIENT_SECRET Your FINN Pro API client secret

Examples:
  node test-api.js                    # Run all tests
  node test-api.js --custom          # Run custom test only
  node test-api.js --test-render     # Include Render proxy tests
  node test-api.js --test "BAP"      # Run only BAP tests
`);
    return;
  }
  
  if (args.includes('--custom')) {
    await testCustomRequest();
  } else if (args.includes('--test')) {
    const testName = args[args.indexOf('--test') + 1];
    const matchingTests = testCases.filter(tc => 
      tc.name.toLowerCase().includes(testName.toLowerCase())
    );
    
    if (matchingTests.length === 0) {
      console.log(`${colors.red}No tests found matching: ${testName}${colors.reset}`);
      return;
    }
    
    console.log(`${colors.cyan}Running ${matchingTests.length} matching test(s)${colors.reset}`);
    for (const test of matchingTests) {
      await testEndpoint(config.localProxyUrl, test);
    }
  } else {
    await runAllTests();
  }
}

// Run the script
main().catch(console.error);