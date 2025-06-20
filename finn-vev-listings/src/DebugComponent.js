import React from 'react';
import { registerVevComponent } from '@vev/react';

console.log('[DebugComponent] File loaded');

const DebugComponent = (props) => {
  console.log('[DebugComponent] Component function called with props:', props);
  
  // Use React.createElement to avoid any JSX compilation issues
  return React.createElement(
    'div',
    { 
      style: { 
        padding: '40px', 
        backgroundColor: '#ffeb3b',
        border: '2px solid #000',
        textAlign: 'center'
      } 
    },
    React.createElement('h1', null, 'Debug Component'),
    React.createElement('p', null, 'Component is rendering!'),
    React.createElement('pre', null, JSON.stringify(props, null, 2))
  );
};

console.log('[DebugComponent] About to register');

try {
  registerVevComponent(DebugComponent, {
    name: "Debug Component",
    type: "standard"
  });
  console.log('[DebugComponent] Registration successful');
} catch (error) {
  console.error('[DebugComponent] Registration failed:', error);
}

export default DebugComponent;