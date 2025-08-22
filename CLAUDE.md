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
  events: [...],
  children: {
    name: 'Items',
    icon: 'list'
  },
  panelType: 'inline', // inline or default (side panel)
  component: CustomEditPanel // Custom edit panel component
});

export default MyComponent;
```

### Registration Config Options
- **name** (required): Component name in Vev editor
- **type**: Component type
  - `'standard'`: Regular component (default)
  - `'section'`: Full-width section component
  - `'action'`: Non-visual action component
  - `'both'`: Can be either standard or section
- **size**: Default dimensions { width, height }
- **props**: Array of component properties
- **editableCSS**: CSS properties editable in editor
- **interactions**: Events the component can listen to
- **events**: Events the component can emit
- **children**: Enable Vev content as children
- **panelType**: Edit panel type ('inline' or side panel)
- **component**: Custom edit panel React component

## Vev Props System

### Available Prop Types

#### Basic Types
- **string**: Text input with validation
  ```javascript
  {
    name: 'title',
    type: 'string',
    options: {
      type: 'text', // text, date, email, url, password
      multiline: true, // or number for specific lines
      minLength: 10,
      maxLength: 100
    }
  }
  ```

- **number**: Numeric input
  ```javascript
  {
    name: 'amount',
    type: 'number',
    options: {
      min: 0,
      max: 100,
      format: '%', // %, px, deg
      display: 'slider', // input or slider
      scale: 100 // for percentage 0-1 as 0-100
    }
  }
  ```

- **boolean**: Toggle switch
  ```javascript
  {
    name: 'showOnMobile',
    type: 'boolean'
  }
  ```

- **select**: Dropdown/radio selection
  ```javascript
  {
    name: 'theme',
    type: 'select',
    options: {
      display: 'radio', // radio, dropdown, multiselect, autocomplete
      items: [
        { label: 'Light', value: 'light' },
        { label: 'Dark', value: 'dark' }
      ]
    }
  }
  ```

#### Media Types
- **image**: Image upload/selection
- **upload**: File upload with accept filter
  ```javascript
  {
    name: 'document',
    type: 'upload',
    accept: '.pdf,.doc,.docx'
  }
  ```

#### Complex Types
- **object**: Nested property groups
  ```javascript
  {
    name: 'header',
    type: 'object',
    fields: [
      { name: 'title', type: 'string' },
      { name: 'subtitle', type: 'string' },
      { name: 'image', type: 'image' }
    ]
  }
  ```

- **array**: List of items
  ```javascript
  {
    name: 'products',
    type: 'array',
    of: [
      { name: 'name', type: 'string' },
      { name: 'price', type: 'number' },
      { name: 'image', type: 'image' }
    ]
  }
  ```

- **layout**: Field arrangement
  ```javascript
  {
    type: 'layout',
    options: { display: 'row' },
    fields: [
      { name: 'x', type: 'number' },
      { name: 'y', type: 'number' }
    ]
  }
  ```

#### Special Types
- **link**: URL/page/email/phone selector
- **menu**: Project menu selection
- **variable**: Variable key selection

### Base Prop Properties
All prop types share these common properties:
- **name** (required): Property name in component
- **type** (required): Prop type (string, number, etc.)
- **title**: Display name in editor (defaults to sentence case of name)
- **description**: Help text for the field
- **initialValue**: Default value (can be function or async function)
- **validate**: Boolean or function returning boolean
- **hidden**: Boolean or function to conditionally hide field
- **onChange**: Custom change handler
- **storage**: Where to store values ('project' | 'workspace' | 'account')
- **component**: Replace field with custom React component

### Props Configuration Example
```javascript
props: [
  { 
    name: 'title', 
    type: 'string',
    title: 'Component Title',
    description: 'Main heading text',
    initialValue: 'Default Title',
    validate: (value) => value.length > 0,
    options: {
      maxLength: 50
    }
  },
  { 
    name: 'showDetails',
    type: 'boolean',
    initialValue: false
  },
  {
    name: 'details',
    type: 'string',
    hidden: (value, context) => !context.showDetails,
    options: {
      multiline: true
    }
  }
]
```

## Vev Hooks

### Available Hooks

#### Display & Layout Hooks
- **useDevice()**: Returns current device mode ('desktop' | 'tablet' | 'mobile')
  ```javascript
  const device = useDevice();
  ```

- **useViewport()**: Returns viewport dimensions and scroll height
  ```javascript
  const { width, height, scrollHeight } = useViewport();
  ```

- **useSize(ref)**: Tracks element dimensions
  ```javascript
  const { width, height } = useSize(elementRef);
  ```

- **useVisible(ref, options?)**: Detects if element is in viewport
  ```javascript
  const isVisible = useVisible(elementRef, { offsetTop: 100 });
  ```

- **useIntersection(ref, options?)**: Tracks intersection with viewport
  ```javascript
  const intersection = useIntersection(widgetRef, { steps: 10 });
  // Returns intersectionRatio, boundingClientRect, etc.
  ```

- **useScrollTop(asPercentage?)**: Returns scroll position
  ```javascript
  const scrollPos = useScrollTop(); // pixels
  const scrollPercent = useScrollTop(true); // percentage
  ```

#### Data & State Hooks
- **useMenu(menuKey?)**: Access menu structure
- **useModel(key?)**: Observe widget's content model
- **useVariable(variableKey)**: Get variable value
- **useSetVariable()**: Update variable value
  ```javascript
  const setVariable = useSetVariable();
  setVariable(variableKey, { value: 100, unit: 'px' });
  ```

#### Event & Interaction Hooks
- **useVevEvent(eventName, handler)**: Subscribe to custom events
- **useDispatchVevEvent()**: Emit custom events
  ```javascript
  const dispatch = useDispatchVevEvent();
  dispatch('CUSTOM_EVENT');
  ```
- **useTracking()**: Send analytics events

#### Editor Context Hooks
- **useEditorState()**: Returns { disabled, rule, selected }
- **useRoute()**: Returns { pageKey, path }
- **usePages()**: Returns [pages, rootDir]

#### Utility Hooks
- **useFrame(callback)**: Animation frame updates
- **useInterval(callback, delay)**: Timed intervals
- **useIcon(iconKey)**: Returns [width, height, ...paths]
- **useImage(imageKey)**: Returns ImageModel with metadata

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
```

## Memory Added

- **Add to memory**