// Test script to fetch from FINN API and see metadata
import fetch from 'node-fetch';

const PROXY_URL = 'https://finn-vev-components.onrender.com';

async function testFinnAPI() {
  console.log('Testing FINN API through proxy...\n');
  
  // Test search parameters
  const requestBody = {
    vertical: 'bap',
    filters: {
      q: 'sykkel',
      location: '0.20061'
    },
    size: 3,
    sort: 'PUBLISHED_DESC'
  };
  
  try {
    const apiUrl = `${PROXY_URL}/api/finn-search`;
    console.log('Calling:', apiUrl);
    console.log('Request body:', JSON.stringify(requestBody, null, 2));
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });
    
    console.log('\nResponse status:', response.status);
    console.log('Response headers:', response.headers.raw());
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      return;
    }
    
    const data = await response.json();
    console.log('\n=== API Response ===');
    console.log('Response keys:', Object.keys(data));
    console.log('Total results:', data.metadata?.result_size?.total || 'N/A');
    
    // Check if we have listings
    const listings = data.docs || data.results || [];
    console.log('Number of listings:', listings.length);
    
    if (listings.length > 0) {
      console.log('\n=== First Listing Raw Data ===');
      console.log(JSON.stringify(listings[0], null, 2));
      
      console.log('\n=== Metadata Fields Found ===');
      const firstListing = listings[0];
      
      // Check for various metadata fields
      const metadataFields = [
        'id',
        'heading',
        'price',
        'location',
        'published',
        'updated',
        'views',
        'favorites',
        'seller',
        'category',
        'subcategory',
        'attributes',
        'metadata',
        'description',
        'trade_type',
        'fiks_ferdig',
        'canonical_url',
        'image',
        'images'
      ];
      
      metadataFields.forEach(field => {
        if (firstListing[field] !== undefined) {
          console.log(`✓ ${field}:`, typeof firstListing[field] === 'object' 
            ? JSON.stringify(firstListing[field], null, 2).substring(0, 100) + '...'
            : firstListing[field]);
        } else {
          console.log(`✗ ${field}: Not found`);
        }
      });
      
      // Check for nested metadata
      if (firstListing.metadata) {
        console.log('\n=== Nested Metadata ===');
        console.log(JSON.stringify(firstListing.metadata, null, 2));
      }
      
      if (firstListing.attributes) {
        console.log('\n=== Attributes ===');
        console.log(JSON.stringify(firstListing.attributes, null, 2));
      }
    }
    
  } catch (error) {
    console.error('Error fetching from API:', error);
  }
}

// Run the test
testFinnAPI();