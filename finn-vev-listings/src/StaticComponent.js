import React from 'react';
import { registerVevComponent } from '@vev/react';

// Ultra-simple static component - no hooks, no state
const StaticComponent = (props) => {
  // Just render static content based on props
  const { title = "Static Component", message = "This is a static component" } = props;
  
  return React.createElement(
    'div',
    {
      style: {
        padding: '40px',
        backgroundColor: '#e3f2fd',
        border: '2px solid #1976d2',
        borderRadius: '8px',
        textAlign: 'center'
      }
    },
    React.createElement('h1', { style: { color: '#1976d2' } }, title),
    React.createElement('p', { style: { fontSize: '18px' } }, message),
    React.createElement('p', { style: { fontSize: '14px', marginTop: '20px' } }, 
      'If you see this, static components work!')
  );
};

// Register with minimal configuration
registerVevComponent(StaticComponent, {
  name: 'Static Component',
  type: 'standard',
  props: [
    {
      name: 'title',
      type: 'string',
      title: 'Title',
      initialValue: 'Static Component'
    },
    {
      name: 'message',
      type: 'string',
      title: 'Message',
      initialValue: 'This is a static component'
    }
  ]
});

export default StaticComponent;