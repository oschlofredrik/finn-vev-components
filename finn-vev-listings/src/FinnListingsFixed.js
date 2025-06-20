import React, { useState, useEffect } from 'react';
import { registerVevComponent } from '@vev/react';

const FinnListingsFixed = ({ 
  searchUrl = "",
  title = "",
  maxItems = 10,
  backgroundColor = "#ffffff",
  proxyUrl = "https://finn-vev-components.onrender.com"
}) => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Dummy data for testing
  const dummyListings = [
    {
      id: 1,
      heading: "Test Product 1",
      price: { amount: 1000 },
      image: { url: "https://via.placeholder.com/240" }
    },
    {
      id: 2,
      heading: "Test Product 2",
      price: { amount: 2000 },
      image: { url: "https://via.placeholder.com/240" }
    }
  ];

  useEffect(() => {
    // Always show dummy data for now to test if component works
    setListings(dummyListings);
    setLoading(false);
  }, []);

  const formatPrice = (price) => {
    if (!price || !price.amount) return 'Kontakt selger';
    return `${price.amount} kr`;
  };

  return (
    <div style={{ 
      backgroundColor,
      padding: '20px',
      minHeight: '300px'
    }}>
      {title && <h2 style={{ marginBottom: '20px' }}>{title}</h2>}
      
      {loading && <div>Loading...</div>}
      
      {!loading && listings.length === 0 && (
        <div>No listings found</div>
      )}
      
      {!loading && listings.length > 0 && (
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          {listings.map(listing => (
            <div key={listing.id} style={{
              width: '240px',
              backgroundColor: '#f8f8f8',
              borderRadius: '8px',
              overflow: 'hidden'
            }}>
              {listing.image && (
                <img 
                  src={listing.image.url} 
                  alt={listing.heading}
                  style={{ width: '100%', height: '240px', objectFit: 'cover' }}
                />
              )}
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
    </div>
  );
};

registerVevComponent(FinnListingsFixed, {
  name: "FINN Annonser Fixed",
  type: "standard",
  size: {
    width: 100,
    height: 300
  },
  props: [
    {
      name: "searchUrl",
      type: "string",
      title: "FINN søke-URL",
      initialValue: ""
    },
    {
      name: "title",
      type: "string",
      title: "Overskrift",
      initialValue: ""
    },
    {
      name: "maxItems",
      type: "number",
      title: "Maks antall",
      initialValue: 10
    },
    {
      name: "backgroundColor",
      type: "string",
      title: "Bakgrunnsfarge",
      initialValue: "#ffffff"
    },
    {
      name: "proxyUrl",
      type: "string",
      title: "Proxy URL",
      initialValue: "https://finn-vev-components.onrender.com"
    }
  ]
});

export default FinnListingsFixed;