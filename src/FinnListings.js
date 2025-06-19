import React, { useState, useEffect } from 'react';
import { registerVevComponent } from '@vev/react';

const FinnListings = ({ 
  searchUrl = "",
  title = "",
  maxItems = 10,
  backgroundColor = "#ffffff",
  cardBackground = "#f8f8f8",
  titleColor = "#000000",
  proxyUrl = "",
  showMetadata = false,
  showViews = false,
  showFavorites = false,
  showPublished = false,
  showSeller = false,
  showFiksFerdig = true
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
    setListings([]); // Clear any existing listings (including dummy data)
    
    console.log('=== FINN Component Debug ===');
    console.log('Search URL:', searchUrl);
    console.log('Proxy URL:', proxyUrl);
    
    try {
      // Extract search parameters from FINN URL
      const url = new URL(searchUrl);
      const pathSegments = url.pathname.split('/').filter(Boolean);
      
      // Extract vertical from URL path
      let vertical = pathSegments[0] || 'bap';
      
      // Special handling for recommerce URLs
      if (vertical === 'recommerce') {
        vertical = 'recommerce';
      } else {
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
      }
      
      console.log('Detected vertical:', vertical);
      console.log('URL path segments:', pathSegments);
      console.log('Original query string:', url.search);
      console.log('Query parameters:', url.search.substring(1));
      
      // Build request body - preserve all query parameters including repeated ones
      const requestBody = {
        vertical: vertical,
        queryString: url.search.substring(1), // Remove the leading '?'
        size: maxItems
      };
      
      // Use proxy URL if provided, otherwise try the public API
      let apiUrl = '';
      let response;
      
      // Require proxy URL for Pro API access
      if (!proxyUrl || proxyUrl.trim() === '') {
        throw new Error('Proxy URL kreves for å bruke FINN Pro API. Vennligst legg til Render proxy URL i komponentinnstillingene.');
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
        const errorText = await response.text();
        console.error('API Response Status:', response.status);
        console.error('API Response:', errorText);
        throw new Error(`API returned ${response.status}: ${errorText}`);
      }
      
      const data = await response.json();
      
      // Log first listing to see available metadata
      if ((data.docs || data.results || []).length > 0) {
        console.log('First listing raw data:', JSON.stringify((data.docs || data.results)[0], null, 2));
      }
      
      // Transform response based on which API was used
      const transformedListings = (data.docs || data.results || []).map(listing => {
        try {
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
          fiks_ferdig: (listing.labels && listing.labels.some(label => label.id === 'fiks_ferdig')) || false,
          gi_bud: listing.price === null || listing.price === undefined,
          location: listing.location,
          // Map actual FINN API fields
          published: listing.timestamp ? new Date(listing.timestamp) : null,
          coordinates: listing.coordinates || null,
          flags: listing.flags || [],
          labels: listing.labels || [],
          // These fields are not provided by FINN API, but keep for future compatibility
          views: listing.views || null,
          favorites: listing.favorites || null,
          seller: listing.seller || null
        };
        } catch (e) {
          console.error('Error transforming listing:', e, listing);
          return null;
        }
      }).filter(Boolean);
      
      setListings(transformedListings);
    } catch (err) {
      console.error('Error fetching FINN listings:', err);
      console.error('Proxy URL:', proxyUrl);
      console.error('API URL used:', apiUrl);
      console.error('Request body:', requestBody);
      
      // Provide user-friendly error messages
      let errorMessage = 'Kunne ikke laste annonser fra FINN.';
      if (err.message.includes('401')) {
        errorMessage = 'Autentiseringsfeil. Sjekk at API-nøklene er gyldige.';
      } else if (err.message.includes('404')) {
        errorMessage = 'API-endepunkt ikke funnet. FINN jobber med å fikse dette.';
      } else if (err.message.includes('503')) {
        errorMessage = 'FINN API er midlertidig utilgjengelig. FINN jobber med å fikse tjenesten.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price, gi_bud) => {
    if (gi_bud) return 'Gi bud';
    if (!price || !price.amount) return 'Kontakt selger';
    return new Intl.NumberFormat('no-NO', {
      style: 'currency',
      currency: 'NOK',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price.amount);
  };

  // Component now shows dummy data when no URL is provided, so we don't need this check

  return (
    <div style={{ 
      backgroundColor,
      padding: '20px 0',
      width: '100%',
      overflow: 'hidden'
    }}>
      {title && (
        <h2 style={{ 
          color: titleColor,
          fontSize: '22px',
          fontWeight: '500',
          marginBottom: '16px',
          paddingLeft: '24px',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
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
          gap: '12px',
          paddingLeft: '24px',
          paddingRight: '24px',
          scrollbarWidth: 'thin',
          WebkitOverflowScrolling: 'touch'
        }}>
          {listings.map((listing, index) => (
            <a
              key={listing.id || index}
              href={(() => {
                try {
                  if (!listing.canonical_url) return `https://www.finn.no/ad.html?finnkode=${listing.id}`;
                  if (listing.canonical_url.startsWith('http')) return listing.canonical_url;
                  return `https://www.finn.no${listing.canonical_url.startsWith('/') ? '' : '/'}${listing.canonical_url}`;
                } catch (e) {
                  return `https://www.finn.no/ad.html?finnkode=${listing.id}`;
                }
              })()}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                minWidth: '240px',
                maxWidth: '240px',
                backgroundColor: cardBackground,
                borderRadius: '8px',
                overflow: 'hidden',
                textDecoration: 'none',
                color: 'inherit',
                display: 'block',
                boxShadow: '0 1px 3px rgba(0,0,0,0.12)'
              }}
            >
              {listing.image && (
                <div style={{
                  width: '100%',
                  height: '240px',
                  overflow: 'hidden',
                  position: 'relative'
                }}>
                  <img 
                    src={listing.image?.url || listing.image}
                    alt={listing.heading}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.parentElement.style.backgroundColor = '#f5f5f5';
                    }}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                  {showFiksFerdig && listing.fiks_ferdig && (
                    <div style={{
                      position: 'absolute',
                      top: '12px',
                      left: '12px',
                      backgroundColor: '#FFE08A',
                      color: '#000',
                      padding: '6px 12px',
                      borderRadius: '4px',
                      fontSize: '13px',
                      fontWeight: '500',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                    }}>
                      Fiks ferdig
                    </div>
                  )}
                </div>
              )}
              
              <div style={{ padding: '12px' }}>
                <h3 style={{
                  fontSize: '15px',
                  fontWeight: '400',
                  marginBottom: '4px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  lineHeight: '1.4',
                  color: '#000'
                }}>
                  {listing.heading}
                </h3>
                
                {listing.location && (
                  <p style={{
                    fontSize: '13px',
                    color: '#767676',
                    marginBottom: '4px',
                    marginTop: '2px'
                  }}>
                    {listing.location}
                  </p>
                )}
                
                <p style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#0063FB',
                  marginTop: '4px'
                }}>
                  {formatPrice(listing.price, listing.gi_bud)}
                </p>
                
                {/* Metadata display section */}
                {showMetadata && (
                  <div style={{
                    marginTop: '12px',
                    paddingTop: '12px',
                    borderTop: '1px solid #e0e0e0',
                    fontSize: '12px',
                    color: '#666'
                  }}>
                    {showViews && listing.views !== null && (
                      <div style={{ marginBottom: '4px' }}>
                        👁️ {listing.views} visninger
                      </div>
                    )}
                    {showFavorites && listing.favorites !== null && (
                      <div style={{ marginBottom: '4px' }}>
                        ❤️ {listing.favorites} favoritter
                      </div>
                    )}
                    {showPublished && listing.published && (
                      <div style={{ marginBottom: '4px' }}>
                        📅 {listing.published.toLocaleDateString('no-NO')}
                      </div>
                    )}
                    {showSeller && listing.seller !== null && listing.seller?.name && (
                      <div style={{ marginBottom: '4px' }}>
                        👤 {listing.seller.name}
                      </div>
                    )}
                  </div>
                )}
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
    },
    {
      name: "showMetadata",
      type: "boolean",
      title: "Vis metadata",
      description: "Aktiver for å vise tilleggsinformasjon",
      initialValue: false
    },
    {
      name: "showViews",
      type: "boolean",
      title: "Vis visninger",
      description: "Vis antall visninger (krever at metadata er aktivert)",
      initialValue: false
    },
    {
      name: "showFavorites",
      type: "boolean",
      title: "Vis favoritter",
      description: "Vis antall favoritter (krever at metadata er aktivert)",
      initialValue: false
    },
    {
      name: "showPublished",
      type: "boolean",
      title: "Vis publiseringsdato",
      description: "Vis når annonsen ble publisert (krever at metadata er aktivert)",
      initialValue: false
    },
    {
      name: "showSeller",
      type: "boolean",
      title: "Vis selger",
      description: "Vis selgerinformasjon (krever at metadata er aktivert)",
      initialValue: false
    },
    {
      name: "showFiksFerdig",
      type: "boolean",
      title: "Vis Fiks ferdig merke",
      description: "Vis gul Fiks ferdig badge på annonser med fast pris",
      initialValue: true
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