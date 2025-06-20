import React from 'react';
import { registerVevComponent } from '@vev/react';

function TestComponent() {
  return React.createElement('div', 
    { style: { padding: '20px', backgroundColor: 'yellow' } }, 
    'Test Component Works!'
  );
}

registerVevComponent(TestComponent, {
  name: "Test Component"
});

export default TestComponent;