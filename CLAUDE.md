# Vev Developer Documentation Summary

## Overview
Vev is a visual no-code/low-code web design platform that allows developers to create custom React components that integrate with the Vev design editor.

## Getting Started with Vev CLI

### Prerequisites
- Node.js v16 or higher
- Vev account (free tier available)

### Installation
```bash
# Install CLI globally
npm install -g @vev/cli

# Authenticate
vev login

# Create new project or initialize existing
vev create [my-project]  # or
vev init  # in existing directory

# Start development
vev start
```

## Component Registration

### Basic Component Structure
```javascript
import React from 'react';
import { registerVevComponent } from '@vev/react';

const MyComponent = ({ title, image, products = [] }) => {
  return <div>{/* Component JSX */}</div>;
};

registerVevComponent(MyComponent, {
  name: "My Component",
  type: "standard", // standard, section, action, or both
  size: { width: 100, height: 100 },
  props: [...],
  editableCSS: [...],
  interactions: [...],
  events: [...]
});

export default MyComponent;
```

## Vev Props System

### Available Prop Types
- **string**: Text input with min/max length validation
- **number**: Numeric input with min/max, format (%, px, deg), display options
- **boolean**: Toggle switch
- **select**: Radio/dropdown/multiselect options
- **image**: Image upload field
- **link**: Internal/external link selector
- **object**: Nested property groups
- **array**: List of editable items
- **layout**: Field arrangement configuration
- **upload**: File upload with type restrictions
- **menu**: Project menu selection
- **variable**: Variable key selection

### Props Configuration Example
```javascript
props: [
  { 
    name: 'title', 
    type: 'string',
    title: 'Component Title',
    initialValue: 'Default Title'
  },
  { 
    name: 'products', 
    type: 'array',
    of: [
      { name: 'name', type: 'string' },
      { name: 'price', type: 'number', format: '$' },
      { name: 'image', type: 'image' }
    ]
  }
]
```

## Vev Hooks

### Available Hooks
- **useMenu(menuKey?)**: Access menu structure
- **useVevEvent()**: Handle Vev events (requires interactions config)
- **useDispatchVevEvent()**: Emit events to trigger interactions
- **useModel()**: Observe other widget's form values
- **useScrollTop()**: Track page scroll position
- **useIntersection()**: Track element viewport intersection
- **useDevice()**: Get current device mode (desktop/tablet/mobile)
- **useEditorState()**: Access editor context (disabled, rule, selected)
- **useFrame()**: Animation frame callback
- **useIcon()**: Retrieve SVG icon data
- **useImage()**: Fetch image metadata
- **useInterval()**: Timed interval execution
- **useRoute()**: Page route information
- **useSize()**: Element dimensions
- **useViewport()**: Screen dimensions
- **useVisible()**: Element visibility
- **useTracking()**: Event tracking
- **useVariable()**: Variable state management

## Styling and CSS

### Editable CSS Configuration
```javascript
editableCSS: [
  {
    selector: styles.wrapper,
    properties: ['background', 'border-radius', 'margin', 'padding']
  },
  {
    selector: styles.title,
    properties: ['color', 'font-family', 'opacity']
  }
]
```

### Available Editable Properties
- font-family, background, color, margin, padding
- border, border-radius, opacity, filter

### Tailwind CSS Integration
```javascript
// tailwind.config.js
module.exports = {
  content: ['src/**/*.{ts,tsx}'],
  corePlugins: {
    preflight: false, // Recommended to avoid conflicts
  },
};
```

## Built-in Components

```javascript
import { Image, Link, Render } from '@vev/react';

// Image component
<Image src={imageData} />

// Link component
<Link href={linkData}>Click here</Link>

// Render Vev projects
<Render 
  projectKey="project-key" 
  pageKey="page-key"
  noCache={false}
  fallback={<div>Loading...</div>}
/>
```

## Events and Interactions

```javascript
// Emit events
const dispatch = useDispatchVevEvent();
dispatch('CUSTOM_EVENT');

// Listen to events
const eventData = useVevEvent('CUSTOM_EVENT');
```

## CLI Commands

- `vev login [--force]`: Authenticate CLI
- `vev create [project-name]`: Create new project
- `vev init`: Initialize existing project
- `vev start [--debug]`: Start development server
- `vev deploy`: Deploy component to Design Editor
- `vev compile [project-id] [--dist folder]`: Compile for production

## CMS Integration

### Variable Types
- Text Variables
- Image Variables  
- List Variables
- Styling Variables

### Integration Methods
- **Client-side**: Variables replaced in browser using Vev Embed
- **Server-side**: Variables replaced on server using Mustache templates

## API Authentication

```bash
# Test authentication
curl --header "x-vev-key: [your-key]" \
  https://api.vev.design/api-key/introspection
```

- Create API keys in Design Editor user profile
- Use `x-vev-key` header for all requests

## Deployment

### Static Export
```bash
vev compile [project-id]
```
Generates:
- Client rendering: `embed/[pageKey].js`
- Server rendering: `template/[pageKey].mustache`

### Framework Integration
- **Next.js**: Configure with `output: 'export'` in next.config.js
- **Gatsby**: Place compiled files in static folder

## Best Practices

1. **Component Structure**: Place all components in `./src` directory
2. **Performance**: Use `useFrame` instead of setTimeout/setInterval
3. **Styling**: Disable Tailwind preflight to avoid conflicts
4. **Development**: Keep `vev start` running during development

## Project-Specific Notes

This project (`finn-vev-components`) contains custom Vev components for FINN.no integration:
- **FinnListings.js**: Component for displaying FINN listings with proxy support
- **DnbInput.js**: Reusable input component for DNB calculator
- **DnbSummary.js**: Summary calculations for DNB calculator

## Environment Setup

### Vev Account IDs
- **Staging**: `GtZQvGjTwe` - For testing and development
- **Production**: `OUHC2VBLOj` - For production-ready components

### Deployment Workflow
1. Components are first deployed to the staging account (GtZQvGjTwe)
2. After testing and validation, share components with production account (OUHC2VBLOj)
3. This ensures stable components in production

## Standard Deployment Process

When deploying changes, ALWAYS follow this standard process:

1. **Deploy to Staging**: Run `vev deploy` to update components in staging environment (GtZQvGjTwe)
2. **Test in Staging**: Thoroughly test components in the staging Vev account
3. **Share to Production**: Once validated, share components with production account (OUHC2VBLOj) via Vev Design Editor
4. **Commit to Git**: Add and commit all changes with descriptive commit message
5. **Push to GitHub**: Push changes to trigger automatic Render deployment

This ensures both the Vev components and the proxy server are always in sync, with proper staging validation.

## Critical Learnings & Solutions

### 1. Components Not Working on Published Sites
**Problem:** Components work in Vev editor but fail on published sites due to SSR issues.

**Root Cause:** React hooks (useState, useEffect) at the file top level cause SSR failures.

**Solution:**
```javascript
// ❌ WRONG - Hooks at file level
import React, { useState } from 'react';
const [value, setValue] = useState(0);

// ✅ CORRECT - All hooks inside component
const Component = () => {
  const [value, setValue] = React.useState(0);
  return <div>{value}</div>;
};
```

**Additional Requirements:**
- Use dynamic imports for SSR-incompatible features
- Wrap `useDevice` in try-catch blocks
- Test on published sites, not just editor

### 2. CSS Conflicts Hiding UI Elements
**Problem:** DNB components made other Vev UI elements disappear.

**Root Cause:** Global CSS from `<style jsx>` affecting all elements on page.

**Solution:**
```javascript
// ❌ WRONG - Global styles
<style jsx>{`
  input[type="range"] { /* affects ALL inputs */ }
`}</style>

// ✅ CORRECT - Scoped styles with unique classes
const uniqueClassName = `component-${Math.random().toString(36).substr(2, 9)}`;
<style dangerouslySetInnerHTML={{ __html: `
  .${uniqueClassName} input[type="range"] { /* only affects this component */ }
`}} />
```

### 3. URL Construction Issues
**Problem:** Links had duplicate domains (https://www.finn.no/https://www.finn.no/...)

**Root Cause:** API sometimes returns full URLs, sometimes relative paths.

**Solution:**
```javascript
// Check if URL already includes protocol
href={listing.canonical_url.startsWith('http') 
  ? listing.canonical_url 
  : `https://www.finn.no${listing.canonical_url.startsWith('/') ? '' : '/'}${listing.canonical_url}`}
```

### 4. Component Directory Structure
**Problem:** Components deployed from wrong directory, old code being used.

**Root Cause:** Multiple src directories, Vev deploying from subdirectory.

**Solution:**
- Keep components in `finn-vev-listings/src/` for Vev deployment
- Main `/src` directory is for reference only
- Always check which directory Vev is building from

### 5. Package Key Conflicts
**Problem:** All components share same key, overwriting each other.

**Note:** Creating unique keys causes "Cannot read properties of undefined (reading 'creator')" error.

**Current State:** All components use shared key `gwDGt7Nl8HLWjbO14egY` - this works but means careful deployment coordination.

### 6. Vev Component Best Practices
- Keep components simple and focused
- Avoid complex state management at file level
- Use inline styles over CSS modules for better isolation
- Test thoroughly on published sites, not just editor
- Components should degrade gracefully (show dummy data when no real data)

### 7. Debugging Tips
- Published site issues are often different from editor issues
- Check browser console on published sites
- Use defensive programming for all Vev hooks
- Add fallbacks for all external dependencies
- Test with both dummy and real data

### 8. API Integration Patterns
- Always handle both relative and absolute URLs from APIs
- Implement retry logic for sleeping servers (Render free tier)
- Show user-friendly error messages during retries
- Use proxy servers for CORS-restricted APIs

### 9. Component Communication
- DNB components use BroadcastChannel for real-time sync
- Always clean up channels on unmount
- Implement fallback communication methods
- Use unique channel IDs to prevent conflicts