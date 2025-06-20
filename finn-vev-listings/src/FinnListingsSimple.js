import React from 'react';
import { registerVevComponent } from '@vev/react';

// Simple component that should always work
const FinnListingsSimple = ({ title = "FINN Annonser" }) => {
  return (
    <div style={{ 
      padding: '40px',
      backgroundColor: '#f0f0f0',
      minHeight: '200px',
      textAlign: 'center'
    }}>
      <h2>{title}</h2>
      <p>Component is working!</p>
    </div>
  );
};

// Register with minimal configuration
registerVevComponent(FinnListingsSimple, {
  name: "FINN Simple Test",
  type: "standard",
  props: [
    {
      name: "title",
      type: "string",
      title: "Title",
      initialValue: "FINN Annonser"
    }
  ]
});

export default FinnListingsSimple;