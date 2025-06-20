import React from 'react';
import { registerVevComponent } from '@vev/react';

// Following Vev's official pattern more closely
function VevPatternComponent({ title = "Vev Component" }) {
  return (
    <div className="vev-pattern-component">
      <h1>{title}</h1>
      <p>This follows Vev's pattern</p>
    </div>
  );
}

// Register exactly like Vev's examples
registerVevComponent(VevPatternComponent, {
  name: 'Vev Pattern Component',
  props: [
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      initialValue: 'Vev Component'
    }
  ],
  type: 'standard'
});

export default VevPatternComponent;