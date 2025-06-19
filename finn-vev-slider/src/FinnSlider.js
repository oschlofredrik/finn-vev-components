import React, { useState } from 'react';
import { registerVevComponent } from '@vev/react';

const FinnSlider = ({ 
  min = 0, 
  max = 100, 
  initialValue = 50,
  label = "Finn Slider",
  sliderColor = "#007bff",
  trackColor = "#e0e0e0"
}) => {
  const [value, setValue] = useState(initialValue);

  const handleChange = (e) => {
    setValue(e.target.value);
  };

  return (
    <div style={{ padding: '20px' }}>
      <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>
        {label}: {value}
      </label>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={handleChange}
        style={{
          width: '100%',
          height: '8px',
          borderRadius: '4px',
          background: trackColor,
          outline: 'none',
          WebkitAppearance: 'none',
          appearance: 'none',
          cursor: 'pointer'
        }}
      />
      <style jsx>{`
        input[type="range"]::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          background: ${sliderColor};
          border-radius: 50%;
          cursor: pointer;
        }
        input[type="range"]::-moz-range-thumb {
          width: 20px;
          height: 20px;
          background: ${sliderColor};
          border-radius: 50%;
          cursor: pointer;
          border: none;
        }
      `}</style>
    </div>
  );
};

registerVevComponent(FinnSlider, {
  name: "Finn Slider",
  props: [
    {
      name: "min",
      type: "number",
      initialValue: 0
    },
    {
      name: "max",
      type: "number",
      initialValue: 100
    },
    {
      name: "initialValue",
      type: "number",
      initialValue: 50
    },
    {
      name: "label",
      type: "string",
      initialValue: "Finn Slider"
    },
    {
      name: "sliderColor",
      type: "color",
      initialValue: "#007bff"
    },
    {
      name: "trackColor",
      type: "color",
      initialValue: "#e0e0e0"
    }
  ]
});

export default FinnSlider;