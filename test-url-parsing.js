// Test script to understand how URL parameters are being parsed

const testUrl = "https://www.finn.no/recommerce/forsale/search?children_clothing_size=1&children_clothing_size=2&children_clothing_size=3&children_clothing_size=4&children_clothing_size=5&children_clothing_size=6&q=kles&shipping_types=0&sub_category=1.68.3913";

console.log('Testing URL parsing for:', testUrl);
console.log('===================================\n');

// Parse URL
const url = new URL(testUrl);

// Method 1: Using Object.fromEntries(url.searchParams)
console.log('Method 1: Object.fromEntries(url.searchParams)');
const params1 = Object.fromEntries(url.searchParams);
console.log('Result:', JSON.stringify(params1, null, 2));
console.log('children_clothing_size value:', params1.children_clothing_size);
console.log('\n');

// Method 2: Using URLSearchParams.getAll()
console.log('Method 2: URLSearchParams.getAll()');
const allSizes = url.searchParams.getAll('children_clothing_size');
console.log('All children_clothing_size values:', allSizes);
console.log('\n');

// Method 3: Manual iteration
console.log('Method 3: Manual iteration over searchParams');
const params3 = {};
for (const [key, value] of url.searchParams) {
  if (!params3[key]) {
    params3[key] = [];
  }
  params3[key].push(value);
}
console.log('Result:', JSON.stringify(params3, null, 2));
console.log('\n');

// Method 4: Building query string back
console.log('Method 4: Building query string');
const queryParams = new URLSearchParams(url.searchParams);
console.log('Query string:', queryParams.toString());
console.log('\n');

// Test what happens when we pass params1 to URLSearchParams
console.log('Test: new URLSearchParams with params1 (Object.fromEntries result)');
const rebuiltParams = new URLSearchParams(params1);
console.log('Rebuilt query string:', rebuiltParams.toString());
console.log('\n');

// Path extraction
console.log('Path analysis:');
const pathSegments = url.pathname.split('/').filter(Boolean);
console.log('Path segments:', pathSegments);
console.log('First segment (vertical):', pathSegments[0]);