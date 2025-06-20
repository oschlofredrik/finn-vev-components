import React, { useState, useEffect } from 'react';
import { registerVevComponent } from '@vev/react';

const FinnListingsClean = ({ 
  searchUrl = "",
  title = "",
  maxItems = 10,
  backgroundColor = "#ffffff",
  cardBackground = "#f8f8f8",
  titleColor = "#000000",
  proxyUrl = "https://finn-vev-components.onrender.com",
  showFiksFerdig = true
}) => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Dummy data
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
    }
  ];

  useEffect(() => {
    // For now, just use dummy data to test if component works
    setListings(dummyListings.slice(0, maxItems));
  }, [maxItems]);

  const formatPrice = (price) => {
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
      backgroundColor,
      padding: '20px 0',
      width: '100%',
      minHeight: '300px'
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
          paddingRight: '24px'
        }}>
          {listings.map((listing) => (
            <a
              key={listing.id}
              href={`https://www.finn.no/${listing.canonical_url}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                minWidth: '240px',
                maxWidth: '240px',
                textDecoration: 'none',
                color: 'inherit',
                display: 'block'
              }}
            >
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
                  src={listing.image?.url}
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
                
                <p style={{
                  fontSize: '18px',
                  fontWeight: '500',
                  color: '#0063FB',
                  marginTop: '4px'
                }}>
                  {formatPrice(listing.price)}
                </p>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
};

registerVevComponent(FinnListingsClean, {
  name: "FINN Annonser Clean",
  type: "standard",
  props: [
    {
      name: "searchUrl",
      type: "string",
      title: "FINN søke-URL",
      description: "URL fra FINN.no søk",
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
      title: "Proxy URL",
      initialValue: "https://finn-vev-components.onrender.com"
    },
    {
      name: "showFiksFerdig",
      type: "boolean",
      title: "Vis Fiks ferdig merke",
      initialValue: true
    }
  ]
});

export default FinnListingsClean;