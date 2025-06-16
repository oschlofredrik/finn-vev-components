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

// FINN Pro API proxy endpoint
app.post('/api/finn-search', async (req, res) => {
  try {
    const { vertical, filters, size, sort } = req.body;
    
    console.log('Request received:', { vertical, filters, size, sort });
    console.log('Environment variables:', {
      clientId: process.env.FINN_CLIENT_ID ? 'SET' : 'NOT SET',
      clientSecret: process.env.FINN_CLIENT_SECRET ? 'SET' : 'NOT SET'
    });

    // Try Basic Auth format
    const clientId = process.env.FINN_CLIENT_ID || 'c9623ca8fdbd46768b0aff75f0dcb5d0';
    const clientSecret = process.env.FINN_CLIENT_SECRET || 'ceEDbfcAe33b4E2Bb2f209a82a91ac51';
    const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    
    console.log('Trying Basic Auth with client ID:', clientId);
    
    // Build query parameters from filters
    const queryParams = new URLSearchParams(filters);
    if (size) queryParams.set('size', size);
    if (sort && !filters.sort) queryParams.set('sort', sort);
    
    // Try different endpoint structures
    const apiUrl = `https://pro-api.m10s.io/search?${queryParams.toString()}`;
    console.log('Trying API URL:', apiUrl);
    console.log('Request method: GET');
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${basicAuth}`,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('FINN API Error:', errorText);
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