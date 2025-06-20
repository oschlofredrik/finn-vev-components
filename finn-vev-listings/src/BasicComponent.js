import React from 'react';
import { registerVevComponent } from '@vev/react';

const BasicComponent = () => {
  // No hooks, no state, just pure render
  return (
    <div>
      <h1>Basic Component</h1>
      <p>If you can see this, the component is working!</p>
    </div>
  );
};

// Register with minimal config
registerVevComponent(BasicComponent, {
  name: "Basic Component",
  type: "standard"
});

export default BasicComponent;