import React from 'react';
import { registerVevComponent, useDevice } from '@vev/react';

const FinnListings = ({ 
  searchUrl = "",
  title = "",
  maxItems = 10,
  cardBackground = "#f8f8f8",
  titleColor = "#000000",
  proxyUrl = "https://finn-vev-components.onrender.com",
  showFiksFerdig = true,
  layoutOrientation = "auto",
  mobileBreakpoint = "tablet"
}) => {
  // All hooks inside component function
  const [listings, setListings] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  
  // Use Vev's useDevice hook with defensive programming for SSR
  let device = 'desktop';
  try {
    // Only call useDevice if it's available (might not be during SSR)
    device = useDevice() || 'desktop';
  } catch (error) {
    // Fallback to desktop on SSR or if hook fails
    console.log('useDevice not available, defaulting to desktop');
  }
  
  // Determine if we should use vertical layout based on device and settings
  const useVerticalLayout = React.useMemo(() => {
    if (layoutOrientation === 'horizontal') return false;
    if (layoutOrientation === 'vertical') return true;
    
    // Auto mode: responsive based on device
    if (layoutOrientation === 'auto') {
      if (mobileBreakpoint === 'mobile') {
        return device === 'mobile';
      } else {
        return device === 'mobile' || device === 'tablet';
      }
    }
    return false;
  }, [layoutOrientation, mobileBreakpoint, device]);

  // Dummy data for preview
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

  const fetchListings = React.useCallback(async () => {
    if (!searchUrl || !proxyUrl) {
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const url = new URL(searchUrl);
      const pathSegments = url.pathname.split('/').filter(Boolean);
      
      let vertical = pathSegments[0] || 'bap';
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
      
      const requestBody = {
        vertical: vertical,
        queryString: url.search.substring(1),
        size: maxItems
      };
      
      const apiUrl = proxyUrl.endsWith('/') ? `${proxyUrl}api/finn-search` : `${proxyUrl}/api/finn-search`;
      
      const response = await fetch(apiUrl, {
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
          fiks_ferdig: (listing.labels && listing.labels.some(label => label.id === 'fiks_ferdig')) || false,
          gi_bud: listing.price === null || listing.price === undefined,
          location: listing.location
        };
      }).filter(Boolean);
      
      setListings(transformedListings);
    } catch (err) {
      setError('Kunne ikke laste annonser fra FINN.');
    } finally {
      setLoading(false);
    }
  }, [searchUrl, proxyUrl, maxItems]);

  // Load data on mount or when URL changes
  React.useEffect(() => {
    if (searchUrl && proxyUrl) {
      fetchListings();
    } else if (!searchUrl) {
      // Use dummy data when no URL provided
      setListings(dummyListings.slice(0, maxItems));
    }
  }, [searchUrl, proxyUrl, maxItems]);

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

  return (
    <div style={{ 
      width: '100%',
      minHeight: '300px'
    }}>
      {title && (
        <h2 style={{ 
          color: titleColor,
          fontSize: '22px',
          fontWeight: '500',
          marginBottom: '16px',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        }}>
          {title}
        </h2>
      )}
      
      {loading && (
        <div style={{ 
          textAlign: 'center', 
          padding: '40px',
          color: '#666'
        }}>
          Laster annonser...
        </div>
      )}
      
      {error && (
        <div style={{ 
          textAlign: 'center', 
          padding: '24px',
          backgroundColor: '#FFEBEE',
          border: '1px solid #FFCDD2',
          borderRadius: '8px',
          margin: '0 24px',
          color: '#d32f2f'
        }}>
          {error}
        </div>
      )}
      
      {!loading && !error && listings.length === 0 && searchUrl && (
        <div style={{ 
          textAlign: 'center', 
          padding: '40px',
          color: '#666'
        }}>
          Ingen annonser funnet
        </div>
      )}
      
      {!loading && !error && listings.length > 0 && (
        <div style={{
          display: useVerticalLayout ? 'grid' : 'flex',
          ...(useVerticalLayout ? {
            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
            gap: '16px'
          } : {
            overflowX: 'auto',
            gap: '12px'
          })
        }}>
          {listings.map((listing, index) => (
            <a
              key={listing.id || index}
              href={listing.canonical_url.startsWith('http') ? listing.canonical_url : `https://www.finn.no${listing.canonical_url.startsWith('/') ? '' : '/'}${listing.canonical_url}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                ...(useVerticalLayout ? {
                  width: '100%'
                } : {
                  minWidth: '240px',
                  maxWidth: '240px'
                }),
                textDecoration: 'none',
                color: 'inherit',
                display: 'block'
              }}
            >
              {listing.image && (
                <div style={{
                  width: '100%',
                  height: '240px',
                  overflow: 'hidden',
                  position: 'relative',
                  backgroundColor: cardBackground,
                  borderRadius: '8px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.12)'
                }}>
                  <img 
                    src={listing.image.url}
                    alt={listing.heading}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                  {showFiksFerdig && listing.fiks_ferdig && (
                    <div style={{
                      position: 'absolute',
                      top: '0',
                      left: '0',
                      backgroundColor: '#fff5c8',
                      color: '#000',
                      padding: '6px 12px',
                      borderTopLeftRadius: '8px',
                      borderBottomRightRadius: '4px',
                      fontSize: '12px',
                      fontWeight: '500'
                    }}>
                      Fiks ferdig
                    </div>
                  )}
                </div>
              )}
              
              <div style={{ paddingTop: '12px' }}>
                <h3 style={{
                  fontSize: '16px',
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
                  fontWeight: '500',
                  color: '#0063FB',
                  marginTop: '4px'
                }}>
                  {formatPrice(listing.price, listing.gi_bud)}
                </p>
              </div>
            </a>
          ))}
        </div>
      )}
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
      title: "Proxy URL",
      description: "URL til din Render deployment for FINN Pro API",
      placeholder: "https://finn-vev-components.onrender.com",
      initialValue: "https://finn-vev-components.onrender.com"
    },
    {
      name: "showFiksFerdig",
      type: "boolean",
      title: "Vis Fiks ferdig merke",
      description: "Vis gul Fiks ferdig badge på annonser med fast pris",
      initialValue: true
    },
    {
      name: "layoutOrientation",
      type: "select",
      title: "Layout retning",
      description: "Velg hvordan annonser skal vises",
      initialValue: "auto",
      options: {
        display: "dropdown",
        items: [
          { label: "Auto (responsiv)", value: "auto" },
          { label: "Horisontal (alltid)", value: "horizontal" },
          { label: "Vertikal (alltid)", value: "vertical" }
        ]
      }
    },
    {
      name: "mobileBreakpoint",
      type: "select",
      title: "Mobil breakpoint",
      description: "Når skal vertikal layout aktiveres (kun i Auto modus)",
      initialValue: "tablet",
      options: {
        display: "dropdown",
        items: [
          { label: "Kun mobil", value: "mobile" },
          { label: "Mobil og nettbrett", value: "tablet" }
        ]
      }
    }
  ]
});

export default FinnListings;