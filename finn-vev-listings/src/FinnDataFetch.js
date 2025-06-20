import React, { useState } from 'react';
import { registerVevComponent } from '@vev/react';

// Component following Vev's data-fetching example pattern
const FinnDataFetch = ({ searchUrl = "", title = "FINN Annonser", proxyUrl = "https://finn-vev-components.onrender.com" }) => {
  const [listings, setListings] = useState([]);
  const [isFetching, setIsFetching] = useState(false);
  const [hasData, setHasData] = useState(false);

  // Dummy data for testing
  const dummyListings = [
    {
      id: 1,
      heading: "Test Product from Data Fetch",
      price: { amount: 1500 },
      image: { url: "https://via.placeholder.com/240" }
    },
    {
      id: 2,
      heading: "Another Test Product",
      price: { amount: 2500 },
      image: { url: "https://via.placeholder.com/240" }
    }
  ];

  const fetchData = () => {
    setIsFetching(true);
    // Simulate API call with timeout
    setTimeout(() => {
      setListings(dummyListings);
      setHasData(true);
      setIsFetching(false);
    }, 1000);
  };

  const clearData = () => {
    setListings([]);
    setHasData(false);
  };

  const formatPrice = (price) => {
    if (!price || !price.amount) return 'Kontakt selger';
    return `${price.amount} kr`;
  };

  return (
    <div style={{ padding: '20px', backgroundColor: '#f9f9f9', minHeight: '300px' }}>
      {title && <h2 style={{ marginBottom: '20px' }}>{title}</h2>}
      
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={fetchData}
          disabled={isFetching}
          style={{
            padding: '10px 20px',
            marginRight: '10px',
            backgroundColor: '#0063FB',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isFetching ? 'not-allowed' : 'pointer',
            opacity: isFetching ? 0.6 : 1
          }}
        >
          {isFetching ? 'Loading...' : 'Fetch Data'}
        </button>
        
        {hasData && (
          <button 
            onClick={clearData}
            style={{
              padding: '10px 20px',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Clear Data
          </button>
        )}
      </div>

      {isFetching && (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <p>Fetching data...</p>
        </div>
      )}

      {hasData && listings.length > 0 && (
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          {listings.map(listing => (
            <div key={listing.id} style={{
              width: '240px',
              backgroundColor: 'white',
              borderRadius: '8px',
              overflow: 'hidden',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              <img 
                src={listing.image.url} 
                alt={listing.heading}
                style={{ width: '100%', height: '180px', objectFit: 'cover' }}
              />
              <div style={{ padding: '12px' }}>
                <h3 style={{ fontSize: '16px', marginBottom: '8px' }}>{listing.heading}</h3>
                <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#0063FB' }}>
                  {formatPrice(listing.price)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {!isFetching && !hasData && (
        <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
          <p>Click "Fetch Data" to load listings</p>
        </div>
      )}
    </div>
  );
};

// Register following the exact pattern from Vev's example
registerVevComponent(FinnDataFetch, {
  name: 'FINN Data Fetch',
  type: 'standard',
  props: [
    {
      name: 'searchUrl',
      type: 'string',
      title: 'Search URL',
      initialValue: ''
    },
    {
      name: 'title',
      type: 'string', 
      title: 'Title',
      initialValue: 'FINN Annonser'
    },
    {
      name: 'proxyUrl',
      type: 'string',
      title: 'Proxy URL',
      initialValue: 'https://finn-vev-components.onrender.com'
    }
  ]
});

export default FinnDataFetch;