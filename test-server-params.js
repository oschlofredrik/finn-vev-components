// Test how server.js handles the parameters

const testUrl = "https://www.finn.no/recommerce/forsale/search?children_clothing_size=1&children_clothing_size=2&children_clothing_size=3&children_clothing_size=4&children_clothing_size=5&children_clothing_size=6&q=kles&shipping_types=0&sub_category=1.68.3913";

// Simulate what FinnListings.js does
const url = new URL(testUrl);
const searchParams = Object.fromEntries(url.searchParams);

console.log('What FinnListings.js sends to server:');
console.log('filters:', JSON.stringify(searchParams, null, 2));

// What server.js does with it
const queryParams = new URLSearchParams(searchParams);
console.log('\nWhat server.js builds as query string:');
console.log(queryParams.toString());

// Compare with original
console.log('\nOriginal query string:');
console.log(url.searchParams.toString());

// Show the difference
console.log('\nMissing parameters:');
const original = url.searchParams.toString();
const rebuilt = queryParams.toString();
if (original !== rebuilt) {
  console.log('Original has multiple values for children_clothing_size: 1,2,3,4,5,6');
  console.log('Rebuilt only has: 6');
}