import React from 'react';
import { registerVevComponent } from '@vev/react';

console.log('FinnListingsSimple.js loaded');

const FinnListingsSimple = ({ title = "FINN Annonser Simple" }) => {
  console.log('FinnListingsSimple rendered');
  
  return (
    <div style={{ 
      padding: '40px',
      backgroundColor: '#f0f0f0',
      textAlign: 'center',
      minHeight: '200px'
    }}>
      <h2>{title}</h2>
      <p>This is a simple test component</p>
      <p>If you can see this, the component is working!</p>
    </div>
  );
};

console.log('Registering FinnListingsSimple...');

registerVevComponent(FinnListingsSimple, {
  name: "FINN Annonser Simple",
  type: "standard",
  props: [
    {
      name: "title",
      type: "string",
      title: "Title",
      initialValue: "FINN Annonser Simple"
    }
  ]
});

export default FinnListingsSimple;