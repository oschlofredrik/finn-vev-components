# FINN Vev Components

This repository contains Vev components and applications for FINN.no integration.

## Project Structure

### 📁 finn-vev-listings
Vev component for displaying FINN.no listings.
- **Type**: Vev Component
- **Features**: Display FINN listings with customizable layouts
- **Status**: Production ready

### 📁 finn-vev-dnb-calculator
Modular Vev components for DNB savings calculator.
- **Type**: Vev Components
- **Components**: DnbInput (with field selector), DnbSummary (with warnings)
- **Features**: Real-time sync, missing field detection, calculations
- **Status**: Production ready

### 📁 finn-kalkulatorer
A standalone React application with financial calculators (OBOS, DNB, Audi).
- **URL**: https://finn-kalkulatorer.onrender.com/
- **Tech**: React, TypeScript, Vite, Tailwind CSS
- **Deployment**: Render

### 📁 api
Proxy server for FINN API requests.
- **Deployment**: Render
- **Purpose**: Handle CORS and authentication for FINN Pro API

## Components

### 1. FINN Annonser
Display FINN.no listings in a responsive grid or carousel layout.

**Features:**
- Fetches real listings from FINN.no via proxy API
- Responsive layout (horizontal scroll on desktop, grid on mobile)
- Fiks ferdig badge support
- Customizable styling
- Shows dummy data in editor when no URL provided
- Transparent background with no padding

**Props:**
- `searchUrl` - FINN.no search URL (e.g., `https://www.finn.no/bap/forsale/search.html?q=sykkel`)
- `title` - Optional heading
- `maxItems` - Maximum number of listings (1-50)
- `cardBackground` - Card background color
- `titleColor` - Title text color
- `proxyUrl` - Your Render deployment URL (default: `https://finn-vev-components.onrender.com`)
- `showFiksFerdig` - Show/hide Fiks ferdig badges
- `layoutOrientation` - Layout direction (auto/horizontal/vertical)
- `mobileBreakpoint` - When to switch to vertical layout (mobile/tablet)

### 2. DNB Input
Reusable input slider component for DNB calculators.

**Features:**
- Multiple field types (property value, income, equity, debt, time horizon)
- Real-time synchronization between components via BroadcastChannel
- Customizable min/max values
- Currency formatting
- Scoped CSS to prevent global style conflicts

### 3. DNB Summary
Summary display component that calculates values based on DNB Input components.

**Features:**
- Multiple calculation types (lending capacity, buying power, savings needed, monthly savings)
- Automatic synchronization with input components
- Missing field warnings
- Real-time calculations

## Setup for FINN Pro API

### Deploy to Render

1. Fork or clone this repository
2. Create an account on [Render](https://render.com)
3. Create a new Web Service:
   - Connect your GitHub repository
   - Name: `finn-vev-proxy` (or your choice)
   - Runtime: Node
   - Build Command: `npm install --production`
   - Start Command: `node server.js`
4. Add environment variables:
   - `FINN_CLIENT_ID`: [Your FINN Client ID]
   - `FINN_CLIENT_SECRET`: [Your FINN Client Secret]
   - `ALLOWED_ORIGINS`: Comma-separated list of allowed domains
5. Deploy the service

### Configure Component in Vev

1. In Vev Design Editor, add the "FINN Annonser" component
2. In the "Proxy URL" field, enter your Render URL (e.g., `https://finn-vev-proxy.onrender.com`)
3. Add a FINN search URL in the "FINN søke-URL" field

## Development

```bash
# Install Vev CLI
npm install -g @vev/cli

# Login
vev login

# Start development
cd finn-vev-listings  # or finn-vev-dnb-calculator
vev start

# Deploy to Vev
vev deploy
```

## Known Issues & Solutions

### Components Not Showing on Published Sites
**Issue:** Components work in Vev editor but not on published sites.

**Solution:** 
- All React hooks must be inside the component function, not at the file top level
- Use dynamic imports for SSR-incompatible features (like `useDevice`)
- Follow the pattern used in the current implementation

### DNB Components Hiding Other UI Elements
**Issue:** DNB components' CSS affects other page elements.

**Solution:**
- Use scoped CSS with unique class names
- Avoid global `<style jsx>` tags
- All styles now use unique identifiers per component instance

### Double URL in Links
**Issue:** Links opening with duplicate domains (e.g., `https://www.finn.no/https://www.finn.no/...`)

**Solution:**
- Check if URL already starts with `http` before prepending domain
- Handle both relative and absolute URLs from the API

### Render Server Sleeping
**Issue:** First request fails because Render free tier puts servers to sleep.

**Solution:**
- Component automatically retries up to 3 times
- Shows user-friendly messages during wake-up
- Consider upgrading to paid Render tier for always-on service

## API Endpoint

Proxy endpoint: `/api/finn-search`

Request (POST):
```json
{
  "vertical": "bap",
  "queryString": "q=sykkel&location=Oslo",
  "size": 10
}
```

## Standard Deployment Process

When deploying changes, ALWAYS follow this process:

1. **Deploy to Vev**: Run `vev deploy` to update components in Vev Design Editor
2. **Commit to Git**: Add and commit all changes with descriptive commit message
3. **Push to GitHub**: Push changes to trigger automatic Render deployment

This ensures both the Vev components and the proxy server are always in sync.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Support

For issues or questions:
- Create an issue on GitHub
- Contact the maintainer: oschlofredrik