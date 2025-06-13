import React, { useState, useEffect } from 'react';
import { registerVevComponent } from '@vev/react';

const FinnListings = ({ 
  searchUrl = "",
  title = "",
  maxItems = 10,
  backgroundColor = "#ffffff",
  cardBackground = "#f8f8f8",
  titleColor = "#000000",
  proxyUrl = ""
}) => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Dummy data for preview/development
  const dummyListings = [
    {
      id: 1,
      heading: "Holzweiler Besseggen",
      price: { amount: 1100 },
      image: { url: "https://images.pexels.com/photos/16170003/pexels-photo-16170003.jpeg?auto=compress&cs=tinysrgb&w=600" },
      canonical_url: "bap/forsale/ad.html?finnkode=123456",
      fiks_ferdig: true
    },
    {
      id: 2,
      heading: "Strikket genser",
      price: { amount: 800 },
      image: { url: "https://images.pexels.com/photos/6764928/pexels-photo-6764928.jpeg?auto=compress&cs=tinysrgb&w=600" },
      canonical_url: "bap/forsale/ad.html?finnkode=123457",
      fiks_ferdig: true
    },
    {
      id: 3,
      heading: "Vinterjakke",
      price: { amount: 2200 },
      image: { url: "https://images.pexels.com/photos/5480696/pexels-photo-5480696.jpeg?auto=compress&cs=tinysrgb&w=600" },
      canonical_url: "bap/forsale/ad.html?finnkode=123458",
      fiks_ferdig: true
    },
    {
      id: 4,
      heading: "Vintage denimjakke",
      price: { amount: 450 },
      image: { url: "https://images.pexels.com/photos/4937449/pexels-photo-4937449.jpeg?auto=compress&cs=tinysrgb&w=600" },
      canonical_url: "bap/forsale/ad.html?finnkode=123459",
      fiks_ferdig: false
    }
  ];

  useEffect(() => {
    if (searchUrl) {
      fetchListings();
    } else {
      // Use dummy data for preview when no URL is provided
      setListings(dummyListings);
    }
  }, [searchUrl]);

  const fetchListings = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Extract search parameters from FINN URL
      const url = new URL(searchUrl);
      const pathSegments = url.pathname.split('/').filter(Boolean);
      
      // Extract vertical from URL path
      let vertical = pathSegments[0] || 'bap';
      const verticalMapping = {
        'realestate': 'realestate',
        'car': 'car',
        'mc': 'mc',
        'boat': 'boat',
        'bap': 'bap',
        'job': 'job',
        'b2b': 'b2b',
        'travel': 'travel'
      };
      vertical = verticalMapping[vertical] || 'bap';
      
      // Build request body
      const searchParams = Object.fromEntries(url.searchParams);
      const requestBody = {
        vertical: vertical,
        filters: searchParams,
        size: maxItems,
        sort: searchParams.sort || 'PUBLISHED_DESC'
      };
      
      // Use proxy URL if provided, otherwise try the public API
      let apiUrl;
      let response;
      
      // Require proxy URL for Pro API access
      if (!proxyUrl) {
        throw new Error('Proxy URL kreves for å bruke FINN Pro API');
      }
      
      // Use the provided proxy endpoint
      apiUrl = proxyUrl.endsWith('/') ? `${proxyUrl}api/finn-search` : `${proxyUrl}/api/finn-search`;
      response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });
      
      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }
      
      const data = await response.json();
      
      // Transform response based on which API was used
      const transformedListings = (data.docs || data.results || []).map(listing => {
        let imageUrl = null;
        if (listing.image) {
          if (typeof listing.image === 'string') {
            imageUrl = listing.image;
          } else if (listing.image.url) {
            imageUrl = listing.image.url;
          } else if (listing.images && listing.images.length > 0) {
            imageUrl = listing.images[0].url || listing.images[0];
          }
          
          if (imageUrl && !imageUrl.startsWith('http')) {
            imageUrl = `https:${imageUrl}`;
          }
          if (imageUrl && imageUrl.includes('finncdn.no')) {
            imageUrl = imageUrl.replace('image.jpg', 'image_480_360.jpg');
          }
        }
        
        return {
          id: listing.id || listing.finnkode || listing.ad_id,
          heading: listing.heading || listing.title,
          price: listing.price || { amount: listing.price_amount },
          image: imageUrl ? { url: imageUrl } : null,
          canonical_url: listing.canonical_url || listing.url || listing.ad_link || `/${vertical}/ad.html?finnkode=${listing.id}`,
          fiks_ferdig: listing.trade_type === 'FIKS_FERDIG' || listing.fiks_ferdig || false,
          location: listing.location
        };
      });
      
      setListings(transformedListings);
    } catch (err) {
      setError('Kunne ikke laste annonser fra FINN');
      console.error('Error fetching FINN listings:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    if (!price) return 'Kontakt selger';
    return new Intl.NumberFormat('no-NO', {
      style: 'currency',
      currency: 'NOK',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  // Component now shows dummy data when no URL is provided, so we don't need this check

  return (
    <div style={{ 
      backgroundColor,
      padding: '24px 0',
      width: '100%',
      overflow: 'hidden'
    }}>
      {title && (
        <h2 style={{ 
          color: titleColor,
          fontSize: '24px',
          fontWeight: '600',
          marginBottom: '20px',
          paddingLeft: '24px'
        }}>
          {title}
        </h2>
      )}
      
      {loading && (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          Laster annonser...
        </div>
      )}
      
      {error && (
        <div style={{ textAlign: 'center', padding: '40px', color: '#d32f2f' }}>
          {error}
        </div>
      )}
      
      {!loading && !error && listings.length > 0 && (
        <div style={{
          display: 'flex',
          overflowX: 'auto',
          gap: '16px',
          paddingLeft: '24px',
          paddingRight: '24px',
          scrollbarWidth: 'thin',
          WebkitOverflowScrolling: 'touch'
        }}>
          {listings.map((listing, index) => (
            <a
              key={listing.id || index}
              href={`https://www.finn.no/${listing.canonical_url || listing.id}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                minWidth: '280px',
                backgroundColor: cardBackground,
                borderRadius: '8px',
                overflow: 'hidden',
                textDecoration: 'none',
                color: 'inherit',
                transition: 'transform 0.2s',
                display: 'block'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              {listing.image && (
                <div style={{
                  width: '100%',
                  height: '180px',
                  overflow: 'hidden',
                  position: 'relative'
                }}>
                  <img 
                    src={listing.image.url || listing.image}
                    alt={listing.heading}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                  {listing.fiks_ferdig && (
                    <div style={{
                      position: 'absolute',
                      top: '8px',
                      left: '8px',
                      backgroundColor: '#FFDB00',
                      color: '#000',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 6L9 17l-5-5"/>
                      </svg>
                      Fiks ferdig
                    </div>
                  )}
                </div>
              )}
              
              <div style={{ padding: '16px' }}>
                <h3 style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  marginBottom: '8px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical'
                }}>
                  {listing.heading}
                </h3>
                
                {listing.location && (
                  <p style={{
                    fontSize: '14px',
                    color: '#484848',
                    marginBottom: '8px'
                  }}>
                    {listing.location}
                  </p>
                )}
                
                <p style={{
                  fontSize: '20px',
                  fontWeight: '700',
                  color: '#0063fb'
                }}>
                  {formatPrice(listing.price?.amount || listing.price)}
                </p>
              </div>
            </a>
          ))}
        </div>
      )}
      
      <style jsx>{`
        div::-webkit-scrollbar {
          height: 8px;
        }
        div::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 4px;
        }
        div::-webkit-scrollbar-thumb {
          background: #888;
          border-radius: 4px;
        }
        div::-webkit-scrollbar-thumb:hover {
          background: #555;
        }
      `}</style>
    </div>
  );
};

registerVevComponent(FinnListings, {
  name: "FINN Annonser",
  type: "standard",
  props: [
    {
      name: "searchUrl",
      type: "string",
      title: "FINN søke-URL",
      description: "URL fra FINN.no søk eller kuratert liste",
      placeholder: "https://www.finn.no/bap/forsale/search.html?q=sykkel"
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
      title: "Maks antall annonser",
      initialValue: 10,
      min: 1,
      max: 50
    },
    {
      name: "backgroundColor",
      type: "color",
      title: "Bakgrunnsfarge",
      initialValue: "#ffffff"
    },
    {
      name: "cardBackground",
      type: "color",
      title: "Kortbakgrunn",
      initialValue: "#f8f8f8"
    },
    {
      name: "titleColor",
      type: "color",
      title: "Tittellfarge",
      initialValue: "#000000"
    },
    {
      name: "proxyUrl",
      type: "string",
      title: "Proxy URL (påkrevd)",
      description: "URL til din Render deployment for FINN Pro API",
      placeholder: "https://finn-vev-components.onrender.com",
      initialValue: "https://finn-vev-components.onrender.com"
    }
  ],
  editableCSS: [
    {
      selector: "div",
      properties: ["margin", "padding"]
    }
  ]
});

export default FinnListings;