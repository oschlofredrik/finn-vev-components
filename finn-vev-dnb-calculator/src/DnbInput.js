import React, { useState, useEffect, useRef } from 'react';
import { registerVevComponent } from '@vev/react';

// Available input field types
const INPUT_FIELDS = {
  propertyValue: {
    name: 'Ønsket boligverdi',
    min: 1000000,
    max: 20000000,
    step: 100000,
    defaultValue: 11000000,
    format: 'currency'
  },
  timeHorizon: {
    name: 'Sparehorisont (år)',
    min: 1,
    max: 10,
    step: 1,
    defaultValue: 4,
    format: 'years'
  },
  income: {
    name: 'Årsinntekt',
    min: 200000,
    max: 3000000,
    step: 50000,
    defaultValue: 2000000,
    format: 'currency'
  },
  equity: {
    name: 'Egenkapital',
    min: 0,
    max: 10000000,
    step: 25000,
    defaultValue: 1025000,
    format: 'currency'
  },
  debt: {
    name: 'Gjeld',
    min: 0,
    max: 5000000,
    step: 25000,
    defaultValue: 300000,
    format: 'currency'
  }
};

const formatValue = (value, format) => {
  if (format === 'currency') {
    return new Intl.NumberFormat('nb-NO', {
      style: 'currency',
      currency: 'NOK',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  } else if (format === 'years') {
    return `${value} år`;
  }
  return value.toString();
};

const DnbInput = ({ 
  fieldType = 'propertyValue',
  label,
  showLabel = true,
  customMin,
  customMax,
  customStep,
  calculatorId = 'dnb-calculator'
}) => {
  const field = INPUT_FIELDS[fieldType] || INPUT_FIELDS.propertyValue;
  const [value, setValue] = useState(field.defaultValue);
  const channelRef = useRef(null);
  const channelId = `dnb_${fieldType}_${calculatorId}`;

  // Get field configuration
  const min = customMin !== undefined ? customMin : field.min;
  const max = customMax !== undefined ? customMax : field.max;
  const step = customStep !== undefined ? customStep : field.step;
  const displayLabel = label || field.name;

  useEffect(() => {
    // Set up BroadcastChannel for communication
    try {
      channelRef.current = new BroadcastChannel(channelId);
      
      // Listen for value changes from other components
      channelRef.current.onmessage = (event) => {
        if (event.data.type === 'value_change' && event.data.fieldType === fieldType) {
          setValue(event.data.value);
        }
      };

      // Broadcast initial value
      channelRef.current.postMessage({ 
        type: 'value_change', 
        fieldType,
        value 
      });
    } catch (err) {
      console.warn('BroadcastChannel not supported:', err);
    }

    return () => {
      if (channelRef.current) {
        channelRef.current.close();
      }
    };
  }, [fieldType, channelId]);

  const handleChange = (e) => {
    const newValue = parseInt(e.target.value);
    setValue(newValue);

    // Broadcast value change
    if (channelRef.current) {
      try {
        channelRef.current.postMessage({ 
          type: 'value_change', 
          fieldType,
          value: newValue 
        });
      } catch (err) {
        console.warn('Failed to broadcast value:', err);
      }
    }
  };

  return (
    <div className="dnb-input-component" style={{ 
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      backgroundColor: '#F5F9FC',
      borderRadius: '16px',
      padding: '24px'
    }}>
      {showLabel && (
        <h3 style={{ 
          color: '#00343E',
          fontSize: '20px',
          fontWeight: 500,
          marginBottom: '16px'
        }}>
          {displayLabel}
        </h3>
      )}
      
      <div style={{ 
        backgroundColor: 'white',
        padding: '24px',
        borderRadius: '8px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <div style={{ marginBottom: '8px' }}>
          <span style={{ 
            fontSize: '32px',
            fontWeight: 600,
            color: '#00343E'
          }}>
            {formatValue(value, field.format)}
          </span>
        </div>
        
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleChange}
          style={{
            width: '100%',
            height: '6px',
            borderRadius: '3px',
            background: `linear-gradient(to right, #007272 0%, #007272 ${((value - min) / (max - min)) * 100}%, #E4E4E4 ${((value - min) / (max - min)) * 100}%, #E4E4E4 100%)`,
            outline: 'none',
            WebkitAppearance: 'none',
            cursor: 'pointer'
          }}
        />
        
        <div style={{ 
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: '8px',
          fontSize: '14px',
          color: '#666'
        }}>
          <span>{formatValue(min, field.format)}</span>
          <span>{formatValue(max, field.format)}</span>
        </div>
      </div>
    </div>
  );
};

registerVevComponent(DnbInput, {
  name: "DNB Input",
  type: "standard",
  icon: "https://cdn.builder.io/api/v1/image/assets/TEMP/f8a2c0f6b5e94d3c9c5c0f6b5e94d3c9c5c0f6b5e94d3c9c5c0f6b5e94d3c9",
  description: "Reusable input component for DNB calculator",
  props: [
    {
      name: "fieldType",
      type: "select",
      title: "Input Field Type",
      initialValue: "propertyValue",
      options: {
        display: "dropdown",
        items: [
          { label: "Ønsket boligverdi", value: "propertyValue" },
          { label: "Sparehorisont (år)", value: "timeHorizon" },
          { label: "Årsinntekt", value: "income" },
          { label: "Egenkapital", value: "equity" },
          { label: "Gjeld", value: "debt" }
        ]
      }
    },
    {
      name: "label",
      type: "string",
      title: "Custom Label (optional)",
      description: "Override the default label"
    },
    {
      name: "showLabel",
      type: "boolean",
      title: "Show Label",
      initialValue: true
    },
    {
      name: "customMin",
      type: "number",
      title: "Custom Minimum Value (optional)"
    },
    {
      name: "customMax",
      type: "number",
      title: "Custom Maximum Value (optional)"
    },
    {
      name: "customStep",
      type: "number",
      title: "Custom Step Value (optional)"
    },
    {
      name: "calculatorId",
      type: "string",
      title: "Calculator ID",
      initialValue: "dnb-calculator",
      description: "Unique ID to group related calculator components"
    }
  ]
});

export default DnbInput;