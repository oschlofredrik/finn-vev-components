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

// Summary calculation types
const SUMMARY_TYPES = {
  lendingCapacity: {
    name: 'Lånekapasitet',
    description: 'Beregnet som (årsinntekt × 5) - gjeld',
    requiredFields: ['income', 'debt'],
    calculate: (values) => Math.max(0, (values.income || 0) * 5 - (values.debt || 0))
  },
  totalBuyingPower: {
    name: 'Total kjøpekraft',
    description: 'Lånekapasitet + egenkapital (begrenset av boligverdi)',
    requiredFields: ['income', 'debt', 'equity', 'propertyValue'],
    calculate: (values) => {
      const lendingCapacity = Math.max(0, (values.income || 0) * 5 - (values.debt || 0));
      const maxPropertyValue = Math.min((values.equity || 0) * 10, values.propertyValue || 0);
      return Math.min(lendingCapacity + (values.equity || 0), maxPropertyValue);
    }
  },
  savingsNeeded: {
    name: 'Sparing som trengs',
    description: 'Ønsket boligverdi - total kjøpekraft',
    requiredFields: ['propertyValue', 'income', 'debt', 'equity'],
    calculate: (values) => {
      const lendingCapacity = Math.max(0, (values.income || 0) * 5 - (values.debt || 0));
      const maxPropertyValue = Math.min((values.equity || 0) * 10, values.propertyValue || 0);
      const totalBuyingPower = Math.min(lendingCapacity + (values.equity || 0), maxPropertyValue);
      return Math.max(0, (values.propertyValue || 0) - totalBuyingPower);
    }
  },
  monthlySavings: {
    name: 'Månedlig sparing',
    description: 'Sparebeløp fordelt på måneder',
    requiredFields: ['propertyValue', 'income', 'debt', 'equity', 'timeHorizon'],
    calculate: (values) => {
      const lendingCapacity = Math.max(0, (values.income || 0) * 5 - (values.debt || 0));
      const maxPropertyValue = Math.min((values.equity || 0) * 10, values.propertyValue || 0);
      const totalBuyingPower = Math.min(lendingCapacity + (values.equity || 0), maxPropertyValue);
      const savingsNeeded = Math.max(0, (values.propertyValue || 0) - totalBuyingPower);
      return values.timeHorizon > 0 ? savingsNeeded / (values.timeHorizon * 12) : 0;
    }
  }
};

const formatCurrency = (value) => {
  return new Intl.NumberFormat('nb-NO', {
    style: 'currency',
    currency: 'NOK',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const DnbSummary = ({ 
  summaryType = 'lendingCapacity',
  showDescription = true,
  showWarnings = true,
  calculatorId = 'dnb-sparekalkulator',
  label,
  highlightColor = '#007272'
}) => {
  const [values, setValues] = useState({
    propertyValue: null,
    timeHorizon: null,
    income: null,
    equity: null,
    debt: null
  });
  const [missingFields, setMissingFields] = useState([]);
  const channelsRef = useRef({});

  const summaryConfig = SUMMARY_TYPES[summaryType] || SUMMARY_TYPES.lendingCapacity;
  const displayLabel = label || summaryConfig.name;

  useEffect(() => {
    let cleanup = false;
    const channels = {};
    
    // Set up BroadcastChannels for each field
    const fields = ['propertyValue', 'timeHorizon', 'income', 'equity', 'debt'];
    
    const setupChannels = () => {
      // Check if BroadcastChannel is supported
      if (typeof BroadcastChannel !== 'undefined' && !cleanup) {
        fields.forEach(field => {
          const channelType = CHANNEL_TYPE_MAP[field] || field;
          const channelId = `${channelType}_slider_state_${calculatorId}`;
          
          try {
            // Close any existing channel for this field
            if (channelsRef.current[field]) {
              try {
                channelsRef.current[field].close();
              } catch (err) {
                // Ignore errors when closing
              }
            }
            
            const channel = new BroadcastChannel(channelId);
            channels[field] = channel;
            channelsRef.current[field] = channel;
            
            channel.onmessage = (event) => {
              if (cleanup) return;
              try {
                // Listen for messages in finn-kalkulatorer format
                const channelType = CHANNEL_TYPE_MAP[field] || field;
                const messageType = `${channelType}_value_change`;
                if (event.data && event.data.type === messageType) {
                  setValues(prev => ({
                    ...prev,
                    [field]: event.data.value
                  }));
                }
              } catch (err) {
                console.warn(`Error handling message for ${field}:`, err);
              }
            };

            // Add error handler
            channel.onerror = (err) => {
              console.warn(`BroadcastChannel error for ${field}:`, err);
              // Try to reconnect after error
              setTimeout(() => {
                if (!cleanup) {
                  setupChannels();
                }
              }, 100);
            };
          } catch (err) {
            console.warn(`BroadcastChannel for ${field} setup failed:`, err);
          }
        });
      }
    };
    
    setupChannels();

    return () => {
      cleanup = true;
      // Close all channels on unmount
      Object.values(channels).forEach(channel => {
        if (channel) {
          try {
            channel.close();
          } catch (err) {
            // Ignore errors during cleanup
          }
        }
      });
      channelsRef.current = {};
    };
  }, [calculatorId]);

  // Check for missing required fields
  useEffect(() => {
    const missing = summaryConfig.requiredFields.filter(field => 
      values[field] === null || values[field] === undefined
    );
    setMissingFields(missing);
  }, [values, summaryConfig.requiredFields]);

  // Calculate the summary value
  const calculatedValue = missingFields.length === 0 
    ? summaryConfig.calculate(values) 
    : 0;

  const fieldNameMap = {
    propertyValue: 'Ønsket boligverdi',
    timeHorizon: 'Sparehorisont',
    income: 'Årsinntekt',
    equity: 'Egenkapital',
    debt: 'Gjeld'
  };

  return (
    <div className="dnb-summary-component" style={{ 
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      backgroundColor: '#F5F9FC',
      borderRadius: '16px',
      padding: '24px'
    }}>
      <h3 style={{ 
        color: '#00343E',
        fontSize: '20px',
        fontWeight: 500,
        marginBottom: '16px'
      }}>
        {displayLabel}
      </h3>

      {showWarnings && missingFields.length > 0 && (
        <div style={{
          backgroundColor: '#FFF3CD',
          border: '1px solid #FFE69C',
          borderRadius: '8px',
          padding: '12px',
          marginBottom: '16px',
          fontSize: '14px',
          color: '#856404'
        }}>
          <strong>⚠️ Mangler input-felt:</strong>
          <ul style={{ margin: '8px 0 0 20px', padding: 0 }}>
            {missingFields.map(field => (
              <li key={field}>{fieldNameMap[field]}</li>
            ))}
          </ul>
          <div style={{ marginTop: '8px', fontSize: '12px' }}>
            Legg til de manglende DNB Input-komponentene på siden.
          </div>
        </div>
      )}

      <div style={{ 
        backgroundColor: 'white',
        padding: '24px',
        borderRadius: '8px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        transition: 'all 0.3s ease'
      }}>
        <div style={{ 
          fontSize: '36px',
          fontWeight: 600,
          color: missingFields.length === 0 ? highlightColor : '#999',
          marginBottom: '8px'
        }}>
          {formatCurrency(calculatedValue)}
        </div>

        {showDescription && (
          <p style={{ 
            fontSize: '14px',
            color: '#666',
            margin: 0
          }}>
            {summaryConfig.description}
          </p>
        )}

        {missingFields.length === 0 && summaryType === 'monthlySavings' && values.timeHorizon && (
          <div style={{
            marginTop: '16px',
            padding: '12px',
            backgroundColor: '#E8F5F5',
            borderRadius: '6px',
            fontSize: '14px',
            color: '#00343E'
          }}>
            Basert på {values.timeHorizon} års sparehorisont
          </div>
        )}
      </div>
    </div>
  );
};

registerVevComponent(DnbSummary, {
  name: "DNB Summary",
  type: "standard",
  icon: "https://cdn.builder.io/api/v1/image/assets/TEMP/summary-icon",
  description: "Summary calculations for DNB calculator with warnings for missing inputs",
  size: {
    width: 384,
    height: 250
  },
  props: [
    {
      name: "summaryType",
      type: "select",
      title: "Summary Type",
      initialValue: "lendingCapacity",
      options: {
        display: "dropdown",
        items: [
          { label: "Lånekapasitet", value: "lendingCapacity" },
          { label: "Total kjøpekraft", value: "totalBuyingPower" },
          { label: "Sparing som trengs", value: "savingsNeeded" },
          { label: "Månedlig sparing", value: "monthlySavings" }
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
      name: "showDescription",
      type: "boolean",
      title: "Show Description",
      initialValue: true
    },
    {
      name: "showWarnings",
      type: "boolean",
      title: "Show Missing Field Warnings",
      initialValue: true
    },
    {
      name: "highlightColor",
      type: "string",
      title: "Highlight Color",
      initialValue: "#007272"
    },
    {
      name: "calculatorId",
      type: "string",
      title: "Calculator ID",
      initialValue: "dnb-sparekalkulator",
      description: "Must match the Calculator ID used in DNB Input components"
    }
  ],
  editableCSS: [
    {
      selector: '.dnb-summary-component',
      properties: ['height', 'min-height', 'max-height']
    }
  ]
});

export default DnbSummary;