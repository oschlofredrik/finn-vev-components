import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';

const app = express();
const PORT = process.env.PORT || 10000;

// Enable CORS for all origins
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Get server IP endpoint
app.get('/api/server-info', async (req, res) => {
  try {
    // Get external IP
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    res.json({ 
      externalIP: data.ip,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.json({ 
      error: 'Could not determine IP',
      message: error.message 
    });
  }
});

// FINN Pro API proxy endpoint
app.post('/api/finn-search', async (req, res) => {
  try {
    const { vertical, queryString, size } = req.body;
    
    console.log('Request received:', { vertical, queryString, size });
    console.log('Environment variables:', {
      clientId: process.env.FINN_CLIENT_ID ? 'SET' : 'NOT SET',
      clientSecret: process.env.FINN_CLIENT_SECRET ? 'SET' : 'NOT SET'
    });

    // Try Basic Auth format
    const clientId = process.env.FINN_CLIENT_ID || 'c9623ca8fdbd46768b0aff75f0dcb5d0';
    const clientSecret = process.env.FINN_CLIENT_SECRET || 'ceEDbfcAe33b4E2Bb2f209a82a91ac51';
    const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    
    console.log('Trying Basic Auth with client ID:', clientId);
    
    // Use the original query string to preserve repeated parameters
    const queryParams = new URLSearchParams(queryString);
    if (size) queryParams.set('rows', size);
    
    // Use the correct FINN search endpoint (without /quest prefix)
    const apiUrl = `https://pro-api.m10s.io/finn/search/SEARCH_ID_BAP_COMMON?${queryParams.toString()}`;
    console.log('Trying API URL:', apiUrl);
    console.log('Request method: GET');
    
    // Option to use a proxy service if FINN_PROXY_URL is set
    const proxyUrl = process.env.FINN_PROXY_URL;
    let fetchUrl = apiUrl;
    let fetchOptions = {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${basicAuth}`,
        'Accept': 'application/json'
      }
    };
    
    if (proxyUrl) {
      // Example for services like ScraperAPI
      fetchUrl = `${proxyUrl}?api_key=${process.env.PROXY_API_KEY}&url=${encodeURIComponent(apiUrl)}`;
      fetchOptions.headers = {
        'Accept': 'application/json'
      };
    }
    
    const response = await fetch(fetchUrl, fetchOptions);

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('FINN API Error:', errorText);
      console.error('Response URL:', response.url);
      console.error('Is HTML error:', errorText.includes('<html>'));
      
      // If it's an HTML 403, it's likely from a proxy/firewall
      if (response.status === 403 && errorText.includes('<html>')) {
        return res.status(503).json({ 
          error: 'Service temporarily unavailable', 
          details: 'The API request is being blocked. This may be due to IP restrictions.',
          isProxyBlock: true
        });
      }
      
      return res.status(response.status).json({ 
        error: 'FINN API error', 
        details: errorText 
      });
    }

    const data = await response.json();
    return res.json(data);

  } catch (error) {
    console.error('Proxy error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

app.listen(PORT, () => {
  console.log(`FINN proxy server running on port ${PORT}`);
});