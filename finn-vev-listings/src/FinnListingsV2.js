import React from 'react';
import { registerVevComponent } from '@vev/react';

const FinnListingsV2 = ({ 
  searchUrl = "",
  title = "",
  maxItems = 10,
  proxyUrl = "https://finn-vev-components.onrender.com",
  showFiksFerdig = true,
  layoutMode = "grid",
  horizontalScroll = false
}) => {
  // All hooks inside component function
  const [listings, setListings] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);

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
    <div className="finn-listings-wrapper" style={{ 
      width: '100%',
      minHeight: '300px'
    }}>
      <style dangerouslySetInnerHTML={{ __html: `
        .finn-listings-wrapper {
          padding: 20px;
          container-type: inline-size;
        }
        .finn-listings-title {
          font-size: 22px;
          font-weight: 500;
          margin-bottom: 16px;
          color: #000000;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        }
        .finn-listings-grid {
          width: 100%;
          --min-card-width: 180px;
          --max-card-width: 100%;
          --gap-x: 12px;
          --gap-y: 12px;
        }
        .finn-listings-grid > * {
          flex: 1 1 var(--min-card-width);
          min-width: var(--min-card-width);
          max-width: var(--max-card-width);
        }
        .finn-listings-card-link {
          transition: transform 0.2s ease;
        }
        .finn-listings-card-link:hover {
          transform: translateY(-2px);
        }
        .finn-listings-card-image {
          background-color: #f8f8f8;
          aspect-ratio: var(--card-aspect-ratio, auto);
        }
        .finn-listings-card-title {
          color: #000000;
        }
        .finn-listings-card-price {
          color: #0063FB;
        }
        
        /* Container query for responsive layout */
        @container (max-width: 500px) {
          .finn-listings-grid {
            flex-direction: column;
          }
          .finn-listings-grid > * {
            max-width: 100%;
          }
        }
        
        /* Layout presets */
        .finn-listings-grid.carousel {
          flex-wrap: nowrap;
          overflow-x: auto;
          scroll-snap-type: x mandatory;
        }
        .finn-listings-grid.carousel > * {
          scroll-snap-align: start;
          flex: 0 0 var(--min-card-width);
        }
        
        /* Horizontal scroll */
        .finn-listings-grid.horizontal-scroll {
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
        }
        .finn-listings-grid.horizontal-scroll::-webkit-scrollbar {
          height: 8px;
        }
        .finn-listings-grid.horizontal-scroll::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 4px;
        }
        .finn-listings-grid.horizontal-scroll::-webkit-scrollbar-thumb {
          background: #888;
          border-radius: 4px;
        }
        .finn-listings-grid.horizontal-scroll::-webkit-scrollbar-thumb:hover {
          background: #555;
        }
      `}} />
      {title && (
        <h2 className="finn-listings-title">
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
        <div className={`finn-listings-grid ${layoutMode === 'carousel' ? 'carousel' : ''} ${horizontalScroll && layoutMode !== 'carousel' ? 'horizontal-scroll' : ''}`} style={{
          display: 'flex',
          flexWrap: layoutMode === 'carousel' ? 'nowrap' : (horizontalScroll ? 'nowrap' : 'wrap'),
          gap: 'var(--gap-y, 16px) var(--gap-x, 16px)'
        }}>
          {listings.map((listing, index) => (
            <a
              key={listing.id || index}
              href={listing.canonical_url.startsWith('http') ? listing.canonical_url : `https://www.finn.no${listing.canonical_url.startsWith('/') ? '' : '/'}${listing.canonical_url}`}
              target="_blank"
              rel="noopener noreferrer"
              className="finn-listings-card-link"
              style={{
                width: '100%',
                textDecoration: 'none',
                color: 'inherit',
                display: 'block'
              }}
            >
              {listing.image && (
                <div className="finn-listings-card-image" style={{
                  width: '100%',
                  height: '180px',
                  overflow: 'hidden',
                  position: 'relative',
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
                      top: '8px',
                      left: '8px'
                    }}>
                      <svg width="92" height="24" viewBox="0 0 92 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M0 4C0 1.79086 1.79086 0 4 0H88C90.2091 0 92 1.79086 92 4V20C92 22.2091 90.2091 24 88 24H4C1.79086 24 0 22.2091 0 20V4Z" fill="#FFF5C8"/>
                        <path d="M20.0007 17.9999C19.2643 17.9999 18.6673 17.403 18.6673 16.6666C18.6673 15.9302 19.2643 15.3333 20.0007 15.3333C20.737 15.3333 21.334 15.9302 21.334 16.6666C21.334 17.403 20.737 17.9999 20.0007 17.9999Z" stroke="#885407" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M12.6667 17.9999C11.9303 17.9999 11.3333 17.403 11.3333 16.6666C11.3333 15.9302 11.9303 15.3333 12.6667 15.3333C13.403 15.3333 14 15.9302 14 16.6666C14 17.403 13.403 17.9999 12.6667 17.9999Z" stroke="#885407" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M18.666 16H13.9993" stroke="#885407" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M18 16V10C18 7.79086 16.2091 6 14 6H10.3333C9.78105 6 9.33333 6.44772 9.33333 7V7.33333" stroke="#885407" strokeLinecap="round"/>
                        <path d="M14 10H8.66667" stroke="#885407" strokeLinecap="round"/>
                        <path d="M14 12H10.6667" stroke="#885407" strokeLinecap="round"/>
                        <path d="M21.334 12H18.0007" stroke="#885407" strokeLinecap="round"/>
                        <path d="M9.33398 14.6667V15.0001C9.33398 15.5524 9.7817 16.0001 10.334 16.0001H11.334" stroke="#885407" strokeLinecap="round"/>
                        <path d="M18.0007 9.33325L19.8081 9.33325C20.0062 9.33319 20.2005 9.39061 20.369 9.49907C20.5376 9.60753 20.6738 9.76275 20.7624 9.94733L21.334 11.9999L22.3083 12.3247C22.9208 12.5289 23.334 13.1021 23.334 13.7477V14.4999C23.334 15.3283 22.6624 15.9999 21.834 15.9999H21.334" stroke="#885407" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M29.344 16C29.216 16 29.112 15.964 29.032 15.892C28.96 15.812 28.924 15.708 28.924 15.58V7.9C28.924 7.764 28.96 7.66 29.032 7.588C29.112 7.516 29.216 7.48 29.344 7.48H34.324C34.46 7.48 34.564 7.516 34.636 7.588C34.708 7.66 34.744 7.764 34.744 7.9V8.212C34.744 8.34 34.708 8.444 34.636 8.524C34.564 8.596 34.46 8.632 34.324 8.632H30.292V11.236H34C34.136 11.236 34.24 11.272 34.312 11.344C34.384 11.416 34.42 11.52 34.42 11.656V11.956C34.42 12.084 34.384 12.188 34.312 12.268C34.24 12.34 34.136 12.376 34 12.376H30.292V15.58C30.292 15.708 30.256 15.812 30.184 15.892C30.112 15.964 30.008 16 29.872 16H29.344ZM36.5753 8.932C36.3433 8.932 36.1473 8.856 35.9873 8.704C35.8273 8.544 35.7473 8.356 35.7473 8.14C35.7473 7.916 35.8273 7.728 35.9873 7.576C36.1473 7.424 36.3433 7.348 36.5753 7.348C36.8073 7.348 37.0033 7.424 37.1633 7.576C37.3233 7.728 37.4033 7.916 37.4033 8.14C37.4033 8.356 37.3233 8.544 37.1633 8.704C37.0033 8.856 36.8073 8.932 36.5753 8.932ZM36.3473 16C36.2193 16 36.1153 15.964 36.0353 15.892C35.9633 15.812 35.9273 15.708 35.9273 15.58V10.504C35.9273 10.368 35.9633 10.264 36.0353 10.192C36.1153 10.12 36.2193 10.084 36.3473 10.084H36.7793C36.9153 10.084 37.0193 10.12 37.0913 10.192C37.1633 10.264 37.1993 10.368 37.1993 10.504V15.58C37.1993 15.708 37.1633 15.812 37.0913 15.892C37.0193 15.964 36.9153 16 36.7793 16H36.3473ZM43.0495 16C42.8255 16 42.6575 15.908 42.5455 15.724L40.8895 13.156L39.9415 14.116V15.58C39.9415 15.708 39.9055 15.812 39.8335 15.892C39.7615 15.964 39.6575 16 39.5215 16H39.0895C38.9615 16 38.8575 15.964 38.7775 15.892C38.7055 15.812 38.6695 15.708 38.6695 15.58V7.9C38.6695 7.764 38.7055 7.66 38.7775 7.588C38.8575 7.516 38.9615 7.48 39.0895 7.48H39.5215C39.6575 7.48 39.7615 7.516 39.8335 7.588C39.9055 7.66 39.9415 7.764 39.9415 7.9V12.712L42.2095 10.312C42.3535 10.16 42.5295 10.084 42.7375 10.084H43.1935C43.3135 10.084 43.4015 10.108 43.4575 10.156C43.5215 10.196 43.5535 10.252 43.5535 10.324C43.5535 10.42 43.5095 10.512 43.4215 10.6L41.7655 12.328L43.8055 15.496C43.8615 15.584 43.8895 15.664 43.8895 15.736C43.8895 15.816 43.8575 15.88 43.7935 15.928C43.7295 15.976 43.6415 16 43.5295 16H43.0495ZM47.1136 16.18C46.6256 16.18 46.1896 16.12 45.8056 16C45.4296 15.872 45.0456 15.652 44.6536 15.34C44.5336 15.252 44.4736 15.152 44.4736 15.04C44.4736 14.952 44.5176 14.856 44.6056 14.752L44.7856 14.548C44.8816 14.436 44.9856 14.38 45.0976 14.38C45.1856 14.38 45.2816 14.42 45.3856 14.5C45.7216 14.748 46.0176 14.92 46.2736 15.016C46.5296 15.104 46.8176 15.148 47.1376 15.148C47.4816 15.148 47.7616 15.08 47.9776 14.944C48.2016 14.8 48.3136 14.608 48.3136 14.368C48.3136 14.184 48.2496 14.04 48.1216 13.936C48.0016 13.824 47.8416 13.74 47.6416 13.684C47.4416 13.62 47.1456 13.548 46.7536 13.468C46.2016 13.348 45.7696 13.22 45.4576 13.084C45.1536 12.94 44.9336 12.76 44.7976 12.544C44.6616 12.328 44.5936 12.052 44.5936 11.716C44.5936 11.372 44.6896 11.064 44.8816 10.792C45.0816 10.52 45.3576 10.304 45.7096 10.144C46.0696 9.984 46.4896 9.904 46.9696 9.904C47.4016 9.904 47.7856 9.952 48.1216 10.048C48.4656 10.144 48.8016 10.308 49.1296 10.54C49.2576 10.636 49.3216 10.744 49.3216 10.864C49.3216 10.944 49.2816 11.036 49.2016 11.14L49.0456 11.332C48.9576 11.444 48.8496 11.5 48.7216 11.5C48.6256 11.5 48.5336 11.468 48.4456 11.404C48.1816 11.228 47.9376 11.108 47.7136 11.044C47.4896 10.972 47.2376 10.936 46.9576 10.936C46.6136 10.936 46.3376 11.004 46.1296 11.14C45.9216 11.276 45.8176 11.452 45.8176 11.668C45.8176 11.812 45.8656 11.928 45.9616 12.016C46.0656 12.096 46.2096 12.168 46.3936 12.232C46.5856 12.288 46.8856 12.36 47.2936 12.448C47.8456 12.568 48.2816 12.704 48.6016 12.856C48.9296 13 49.1696 13.188 49.3216 13.42C49.4816 13.644 49.5616 13.936 49.5616 14.296C49.5616 14.856 49.3376 15.312 48.8896 15.664C48.4496 16.008 47.8576 16.18 47.1136 16.18ZM55.9454 8.368C55.6654 8.368 55.4614 8.436 55.3334 8.572C55.2054 8.708 55.1414 8.94 55.1414 9.268V10.084H56.1134C56.2494 10.084 56.3534 10.12 56.4254 10.192C56.4974 10.264 56.5334 10.368 56.5334 10.504V10.636C56.5334 10.764 56.4974 10.868 56.4254 10.948C56.3534 11.02 56.2494 11.056 56.1134 11.056H55.1414V15.58C55.1414 15.708 55.1054 15.812 55.0334 15.892C54.9614 15.964 54.8574 16 54.7214 16H54.2894C54.1614 16 54.0574 15.964 53.9774 15.892C53.9054 15.812 53.8694 15.708 53.8694 15.58V11.056H53.2334C53.1054 11.056 53.0014 11.02 52.9214 10.948C52.8494 10.868 52.8134 10.764 52.8134 10.636V10.504C52.8134 10.368 52.8494 10.264 52.9214 10.192C53.0014 10.12 53.1054 10.084 53.2334 10.084H53.8694V9.184C53.8694 8.568 54.0254 8.104 54.3374 7.792C54.6574 7.472 55.1174 7.312 55.7174 7.312C55.9894 7.312 56.2654 7.34 56.5454 7.396C56.7534 7.452 56.8574 7.58 56.8574 7.78C56.8574 7.836 56.8534 7.88 56.8454 7.912L56.8094 8.08C56.7614 8.288 56.6054 8.392 56.3414 8.392L56.1974 8.38C56.1414 8.372 56.0574 8.368 55.9454 8.368ZM61.4914 14.488C61.5954 14.4 61.6954 14.356 61.7914 14.356C61.8874 14.356 61.9874 14.408 62.0914 14.512L62.2594 14.692C62.3474 14.796 62.3914 14.896 62.3914 14.992C62.3914 15.096 62.3394 15.196 62.2354 15.292C61.8674 15.612 61.4994 15.84 61.1314 15.976C60.7714 16.112 60.3714 16.18 59.9314 16.18C59.3154 16.18 58.7794 16.052 58.3234 15.796C57.8754 15.54 57.5274 15.18 57.2794 14.716C57.0394 14.244 56.9194 13.7 56.9194 13.084C56.9194 12.476 57.0354 11.932 57.2674 11.452C57.5074 10.964 57.8434 10.584 58.2754 10.312C58.7154 10.04 59.2274 9.904 59.8114 9.904C60.6834 9.904 61.3554 10.164 61.8274 10.684C62.2994 11.196 62.5354 11.904 62.5354 12.808V12.916C62.5274 13.044 62.4874 13.144 62.4154 13.216C62.3434 13.288 62.2394 13.324 62.1034 13.324H58.1674C58.2154 13.852 58.3874 14.284 58.6834 14.62C58.9874 14.948 59.4114 15.112 59.9554 15.112C60.2514 15.112 60.5114 15.068 60.7354 14.98C60.9594 14.884 61.2114 14.72 61.4914 14.488ZM59.7874 10.912C59.3474 10.912 58.9914 11.044 58.7194 11.308C58.4554 11.564 58.2834 11.928 58.2034 12.4H61.2874C61.2554 11.936 61.1114 11.572 60.8554 11.308C60.5994 11.044 60.2434 10.912 59.7874 10.912ZM66.3648 10.024C66.5408 10.024 66.7208 10.044 66.9048 10.084C67.1208 10.132 67.2288 10.26 67.2288 10.468C67.2288 10.524 67.2248 10.564 67.2168 10.588L67.1568 10.876C67.1088 11.1 66.9888 11.212 66.7968 11.212L66.6888 11.2C66.5448 11.176 66.4168 11.164 66.3048 11.164C65.9048 11.164 65.5808 11.324 65.3328 11.644C65.0928 11.956 64.9728 12.392 64.9728 12.952V15.58C64.9728 15.708 64.9368 15.812 64.8648 15.892C64.7928 15.964 64.6888 16 64.5527 16H64.1208C63.9928 16 63.8888 15.964 63.8088 15.892C63.7368 15.812 63.7008 15.708 63.7008 15.58V10.504C63.7008 10.368 63.7368 10.264 63.8088 10.192C63.8888 10.12 63.9928 10.084 64.1208 10.084H64.4688C64.6048 10.084 64.7088 10.12 64.7808 10.192C64.8528 10.264 64.8888 10.368 64.8888 10.504V10.972C65.0328 10.676 65.2288 10.444 65.4768 10.276C65.7248 10.108 66.0208 10.024 66.3648 10.024ZM72.0366 7.888C72.0366 7.752 72.0726 7.648 72.1446 7.576C72.2246 7.504 72.3286 7.468 72.4566 7.468H72.8886C73.0246 7.468 73.1286 7.504 73.2006 7.576C73.2726 7.648 73.3086 7.752 73.3086 7.888V15.58C73.3086 15.708 73.2726 15.812 73.2006 15.892C73.1286 15.964 73.0246 16 72.8886 16H72.5406C72.4126 16 72.3086 15.964 72.2286 15.892C72.1566 15.812 72.1206 15.708 72.1206 15.58V15.16C71.7046 15.832 71.0526 16.168 70.1646 16.168C69.6686 16.168 69.2206 16.04 68.8206 15.784C68.4286 15.528 68.1206 15.164 67.8966 14.692C67.6726 14.22 67.5606 13.672 67.5606 13.048C67.5606 12.432 67.6726 11.888 67.8966 11.416C68.1286 10.944 68.4446 10.58 68.8446 10.324C69.2446 10.068 69.6926 9.94 70.1886 9.94C71.0046 9.94 71.6206 10.224 72.0366 10.792V7.888ZM70.4286 15.076C70.9166 15.076 71.3166 14.896 71.6286 14.536C71.9406 14.168 72.0966 13.672 72.0966 13.048C72.0966 12.424 71.9406 11.932 71.6286 11.572C71.3166 11.212 70.9166 11.032 70.4286 11.032C69.9566 11.032 69.5766 11.216 69.2886 11.584C69.0006 11.952 68.8566 12.44 68.8566 13.048C68.8566 13.664 68.9966 14.156 69.2766 14.524C69.5646 14.892 69.9486 15.076 70.4286 15.076ZM75.4347 8.932C75.2027 8.932 75.0067 8.856 74.8467 8.704C74.6867 8.544 74.6067 8.356 74.6067 8.14C74.6067 7.916 74.6867 7.728 74.8467 7.576C75.0067 7.424 75.2027 7.348 75.4347 7.348C75.6667 7.348 75.8627 7.424 76.0227 7.576C76.1827 7.728 76.2627 7.916 76.2627 8.14C76.2627 8.356 76.1827 8.544 76.0227 8.704C75.8627 8.856 75.6667 8.932 75.4347 8.932ZM75.2067 16C75.0787 16 74.9747 15.964 74.8947 15.892C74.8227 15.812 74.7867 15.708 74.7867 15.58V10.504C74.7867 10.368 74.8227 10.264 74.8947 10.192C74.9747 10.12 75.0787 10.084 75.2067 10.084H75.6387C75.7747 10.084 75.8787 10.12 75.9507 10.192C76.0227 10.264 76.0587 10.368 76.0587 10.504V15.58C76.0587 15.708 76.0227 15.812 75.9507 15.892C75.8787 15.964 75.7747 16 75.6387 16H75.2067ZM81.6929 10.468C81.6929 10.348 81.7289 10.256 81.8009 10.192C81.8809 10.12 81.9849 10.084 82.1129 10.084H82.4489C82.5849 10.084 82.6889 10.12 82.7609 10.192C82.8329 10.264 82.8689 10.368 82.8689 10.504V15.784C82.8689 16.576 82.6129 17.192 82.1009 17.632C81.5969 18.072 80.9249 18.292 80.0849 18.292C79.2449 18.292 78.4529 18.076 77.7089 17.644C77.5569 17.564 77.4809 17.456 77.4809 17.32C77.4809 17.248 77.5129 17.16 77.5769 17.056L77.7329 16.828C77.8209 16.692 77.9289 16.624 78.0569 16.624C78.1449 16.624 78.2329 16.652 78.3209 16.708C78.6409 16.892 78.9369 17.024 79.2089 17.104C79.4809 17.192 79.7689 17.236 80.0729 17.236C80.5369 17.236 80.9089 17.108 81.1889 16.852C81.4769 16.604 81.6209 16.212 81.6209 15.676V15.04C81.2209 15.608 80.6209 15.892 79.8209 15.892C79.3249 15.892 78.8769 15.768 78.4769 15.52C78.0849 15.264 77.7769 14.912 77.5529 14.464C77.3369 14.008 77.2289 13.488 77.2289 12.904C77.2289 12.32 77.3369 11.804 77.5529 11.356C77.7769 10.9 78.0849 10.544 78.4769 10.288C78.8769 10.032 79.3249 9.904 79.8209 9.904C80.6689 9.904 81.2929 10.22 81.6929 10.852V10.468ZM80.0729 14.824C80.5369 14.824 80.9169 14.648 81.2129 14.296C81.5089 13.936 81.6569 13.472 81.6569 12.904C81.6569 12.344 81.5089 11.888 81.2129 11.536C80.9249 11.176 80.5449 10.996 80.0729 10.996C79.5929 10.996 79.2129 11.172 78.9329 11.524C78.6529 11.876 78.5129 12.336 78.5129 12.904C78.5129 13.48 78.6529 13.944 78.9329 14.296C79.2129 14.648 79.5929 14.824 80.0729 14.824Z" fill="#885407"/>
                      </svg>
                    </div>
                  )}
                </div>
              )}
              
              <div className="finn-listings-card-content" style={{ paddingTop: '12px' }}>
                <h3 className="finn-listings-card-title" style={{
                  fontSize: '14px',
                  fontWeight: '400',
                  marginBottom: '4px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  lineHeight: '1.4'
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
                
                <p className="finn-listings-card-price" style={{
                  fontSize: '16px',
                  fontWeight: '500',
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

registerVevComponent(FinnListingsV2, {
  name: "FINN Annonser V2",
  type: "standard",
  editableCSS: [
    {
      selector: ".finn-listings-wrapper",
      properties: ["padding", "margin", "background"]
    },
    {
      selector: ".finn-listings-title",
      properties: ["color", "font-family", "font-size", "margin"]
    },
    {
      selector: ".finn-listings-grid",
      properties: [
        "display",
        "flex-direction",
        "flex-wrap",
        "gap",
        "--gap-x",
        "--gap-y",
        "--min-card-width",
        "--max-card-width",
        "margin", 
        "padding",
        "justify-content",
        "align-items",
        "align-content"
      ]
    },
    {
      selector: ".finn-listings-card-image",
      properties: ["background", "border-radius", "--card-aspect-ratio"]
    },
    {
      selector: ".finn-listings-card-title",
      properties: ["color", "font-family", "font-size"]
    },
    {
      selector: ".finn-listings-card-price",
      properties: ["color", "font-size", "font-weight"]
    }
  ],
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
      name: "proxyUrl",
      type: "string",
      title: "Proxy URL",
      description: "URL til din Render deployment for FINN Pro API",
      placeholder: "https://finn-vev-components.onrender.com",
      initialValue: "https://finn-vev-components.onrender.com",
      hidden: true
    },
    {
      name: "showFiksFerdig",
      type: "boolean",
      title: "Vis Fiks ferdig merke",
      description: "Vis gul Fiks ferdig badge på annonser med fast pris",
      initialValue: true
    },
    {
      name: "layoutMode",
      type: "select",
      title: "Layout Mode",
      description: "Choose a predefined layout style",
      initialValue: "grid",
      options: {
        display: "dropdown",
        items: [
          { label: "Standard Grid", value: "grid" },
          { label: "Horizontal Carousel", value: "carousel" }
        ]
      }
    },
    {
      name: "horizontalScroll",
      type: "boolean",
      title: "Enable Horizontal Scroll",
      description: "Make the grid horizontally scrollable (only works in Standard Grid mode)",
      initialValue: false,
      hidden: (_, context) => context.layoutMode === 'carousel'
    }
  ]
});

export default FinnListingsV2;