# DNB Calculator Vev Components

Modular Vev components for building DNB savings calculators with real-time synchronization.

## Components

### 🔢 DNB Input
A reusable input slider component with dropdown field selection.

**Features:**
- Dropdown to select which field (property value, income, equity, etc.)
- Customizable min/max/step values
- Real-time synchronization via BroadcastChannel
- Currency formatting
- DNB brand styling

**Usage:**
1. Add multiple DNB Input components to your page
2. Select different field types for each
3. They automatically sync with DNB Summary components

### 📊 DNB Summary
Displays calculated values with warnings for missing inputs.

**Summary Types:**
- **Lånekapasitet**: (Income × 5) - Debt
- **Total kjøpekraft**: Lending capacity + equity
- **Sparing som trengs**: Property value - buying power
- **Månedlig sparing**: Monthly savings needed

**Features:**
- Automatic calculations based on input values
- Warning messages for missing required fields
- Lists which specific inputs are missing
- Real-time updates

## How It Works

1. **Component Communication**: Uses BroadcastChannel API for real-time sync
2. **Calculator ID**: Group related components with the same Calculator ID
3. **Missing Field Detection**: Summary components warn if required inputs are missing

## Example Setup

```
Page Layout:
┌─────────────────────────────────────┐
│ DNB Input (Property Value)          │
├─────────────────────────────────────┤
│ DNB Input (Income)                  │
├─────────────────────────────────────┤
│ DNB Input (Equity)                  │
├─────────────────────────────────────┤
│ DNB Input (Debt)                    │
├─────────────────────────────────────┤
│ DNB Input (Time Horizon)            │
├─────────────────────────────────────┤
│ DNB Summary (Lending Capacity)      │
├─────────────────────────────────────┤
│ DNB Summary (Total Buying Power)    │
├─────────────────────────────────────┤
│ DNB Summary (Savings Needed)        │
└─────────────────────────────────────┘
```

## Development

```bash
# Install dependencies
npm install

# Start Vev development
vev start

# Deploy to Vev
vev deploy
```

## Component Properties

### DNB Input Props
- `fieldType`: Select which input field (dropdown)
- `label`: Custom label text
- `showLabel`: Show/hide label
- `customMin/Max/Step`: Override default ranges
- `calculatorId`: Group related components

### DNB Summary Props
- `summaryType`: Select calculation type (dropdown)
- `label`: Custom label text
- `showDescription`: Show calculation description
- `showWarnings`: Show missing field warnings
- `highlightColor`: Value text color
- `calculatorId`: Must match input components

## Tips

1. Always use the same `calculatorId` for components that should work together
2. Add all required input fields to avoid warnings
3. Summary components will show which inputs are missing
4. Components sync automatically - no manual wiring needed