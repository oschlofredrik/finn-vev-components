import React, { useState, useEffect, useRef } from 'react';
import { registerVevComponent } from '@vev/react';

// Map fieldType to channel naming convention used in finn-kalkulatorer
const CHANNEL_TYPE_MAP = {
  propertyValue: 'property_value',
  timeHorizon: 'time_horizon',
  income: 'income',
  equity: 'equity',
  debt: 'debt'
};

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
  calculatorId = 'dnb-sparekalkulator'
}) => {
  const field = INPUT_FIELDS[fieldType] || INPUT_FIELDS.propertyValue;
  const [value, setValue] = useState(field.defaultValue);
  const channelRef = useRef(null);
  const channelType = CHANNEL_TYPE_MAP[fieldType] || fieldType;
  const channelId = `${channelType}_slider_state_${calculatorId}`;

  // Get field configuration
  const min = customMin !== undefined ? customMin : field.min;
  const max = customMax !== undefined ? customMax : field.max;
  const step = customStep !== undefined ? customStep : field.step;
  const displayLabel = label || field.name;

  useEffect(() => {
    let cleanup = false;
    
    // Set up BroadcastChannel for communication
    const setupChannel = () => {
      try {
        // Check if BroadcastChannel is supported
        if (typeof BroadcastChannel !== 'undefined' && !cleanup) {
          // Close any existing channel first
          if (channelRef.current) {
            try {
              channelRef.current.close();
            } catch (err) {
              // Ignore errors when closing
            }
          }
          
          channelRef.current = new BroadcastChannel(channelId);
          
          // Listen for value changes from other components
          channelRef.current.onmessage = (event) => {
            if (cleanup) return;
            try {
              // Listen for messages in finn-kalkulatorer format
              const channelType = CHANNEL_TYPE_MAP[fieldType] || fieldType;
              const messageType = `${channelType}_value_change`;
              if (event.data && event.data.type === messageType && event.data.sender !== channelId) {
                setValue(event.data.value);
              }
            } catch (err) {
              console.warn('Error handling message:', err);
            }
          };

          // Add error handler
          channelRef.current.onerror = (err) => {
            console.warn('BroadcastChannel error:', err);
            // Try to reconnect after error
            setTimeout(() => {
              if (!cleanup) {
                setupChannel();
              }
            }, 100);
          };

          // Broadcast initial value with a small delay to ensure channel is ready
          setTimeout(() => {
            if (channelRef.current && !cleanup) {
              try {
                // Use message format from finn-kalkulatorer
                const channelType = CHANNEL_TYPE_MAP[fieldType] || fieldType;
                const messageType = `${channelType}_value_change`;
                channelRef.current.postMessage({ 
                  type: messageType,
                  value,
                  sender: channelId // Add sender ID to prevent echo
                });
              } catch (err) {
                console.warn('Failed to post initial message:', err);
              }
            }
          }, 50);
        }
      } catch (err) {
        console.warn('BroadcastChannel setup failed:', err);
      }
    };
    
    setupChannel();

    return () => {
      cleanup = true;
      if (channelRef.current) {
        try {
          channelRef.current.close();
          channelRef.current = null;
        } catch (err) {
          // Ignore errors during cleanup
        }
      }
    };
  }, [fieldType, channelId, value]);

  const handleChange = (e) => {
    const newValue = parseInt(e.target.value);
    setValue(newValue);

    // Broadcast value change
    if (channelRef.current) {
      try {
        const channelType = CHANNEL_TYPE_MAP[fieldType] || fieldType;
        const messageType = `${channelType}_value_change`;
        channelRef.current.postMessage({ 
          type: messageType,
          value: newValue,
          sender: channelId // Add sender ID to prevent echo
        });
      } catch (err) {
        console.warn('Failed to broadcast value:', err);
        // Try to recreate channel on error
        if (channelRef.current) {
          try {
            channelRef.current.close();
          } catch (e) {
            // Ignore
          }
          channelRef.current = null;
        }
      }
    }
  };

  return (
    <div className="dnb-input-component" style={{ 
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      backgroundColor: '#F5F9FC',
      borderRadius: '16px',
      padding: showLabel ? '24px' : '0',
      height: '100%',
      display: 'flex',
      flexDirection: 'column'
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
        borderRadius: showLabel ? '8px' : '16px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center'
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
  size: {
    width: 384,
    height: 200
  },
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
      initialValue: "dnb-sparekalkulator",
      description: "Unique ID to group related calculator components"
    }
  ],
  editableCSS: [
    {
      selector: '.dnb-input-component',
      properties: ['height', 'min-height', 'max-height']
    }
  ]
});

export default DnbInput;