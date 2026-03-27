# Security Components Quick Reference

## Component Imports

```javascript
import {
  SecurityKeyWarning,      // Warning banner when showing secret key
  SecretKeyDisplay,        // Enhanced key display with reveal/hide
  LargeTransactionWarning, // Warning for transactions > threshold
  TransactionReviewCard,   // Transaction details summary
  SecurityBestPracticesModal, // Full security guide
  NetworkWarning,          // Network status warning
  NetworkStatus            // Compact network status
} from './components/forms';
```

## Components Summary

### 1. SecurityKeyWarning
**Purpose**: Display critical security warning before showing secret key

**Props**:
- `onAcknowledge?: () => void` - Callback when user acknowledges

**Example**:
```jsx
<SecurityKeyWarning onAcknowledge={() => console.log('Acknowledged')} />
```

### 2. SecretKeyDisplay
**Purpose**: Display both public and secret keys with security controls

**Props**:
- `secretKey: string` - Secret key to display/hide
- `publicKey: string` - Public key (always visible)

**Features**:
- Shows warning first
- Masks secret key by default
- Copy buttons with restrictions
- Offline storage tips

**Example**:
```jsx
<SecretKeyDisplay
  secretKey={account.secretKey}
  publicKey={account.publicKey}
/>
```

### 3. LargeTransactionWarning
**Purpose**: Warn user if transaction amount exceeds threshold

**Props**:
- `amount: string` - Transaction amount
- `threshold?: number` - Warning threshold (default: 1000)
- `assetCode?: string` - Asset code (default: 'XLM')
- `onConfirm?: () => void` - Callback when user confirms

**Example**:
```jsx
const [confirmed, setConfirmed] = useState(false);

<LargeTransactionWarning
  amount={amount}
  threshold={1000}
  assetCode="XLM"
  onConfirm={() => setConfirmed(true)}
/>
```

### 4. TransactionReviewCard
**Purpose**: Display transaction details for review

**Props**:
- `recipient: string` - Recipient address
- `amount: string` - Transaction amount
- `assetCode?: string` - Asset code (default: 'XLM')
- `balance: string` - Current balance

**Example**:
```jsx
<TransactionReviewCard
  recipient={recipient}
  amount={amount}
  assetCode="XLM"
  balance={xlmBalance}
/>
```

Shows:
- Recipient address (truncated)
- Amount (highlighted in red)
- Current balance
- Balance after transaction

### 5. SecurityBestPracticesModal
**Purpose**: Comprehensive security guide with 5 tabs

**Props**:
- `isOpen: boolean` - Whether modal is visible
- `onClose: () => void` - Close callback

**Tabs**:
1. Security Overview - Basic principles
2. Secret Key Management - DO's and DON'Ts
3. Safe Transactions - Pre-transaction checklist
4. Network Awareness - Testnet vs Mainnet
5. Recovery - What to do if compromised

**Example**:
```jsx
const [isOpen, setIsOpen] = useState(false);

<SecurityBestPracticesModal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
/>
```

### 6. NetworkWarning
**Purpose**: Display network-specific security warnings

**Props**:
- `networkStatus: object` - Status from useNetworkStatus hook

**Shows different warnings for**:
- Testnet (blue) - Test funds, no real value
- Mainnet (green) - Real funds at risk
- Offline (red) - Network unavailable

**Example**:
```jsx
const { status: networkStatus } = useNetworkStatus();

<NetworkWarning networkStatus={networkStatus} />
```

### 7. NetworkStatus
**Purpose**: Compact network status display

**Props**:
- `networkStatus: object` - Status from useNetworkStatus hook
- `compact?: boolean` - Show minimal version (default: false)

**Example** (Compact):
```jsx
<NetworkStatus networkStatus={networkStatus} compact={true} />
// Output: "🧪 Testnet" or "✅ Mainnet • Online" or "❌ Offline"
```

## Usage Patterns

### In Account Creation Flow
```jsx
{account && (
  <motion.div>
    <SecretKeyDisplay
      secretKey={account.secretKey}
      publicKey={account.publicKey}
    />
  </motion.div>
)}
```

### In Transaction Flow
```jsx
{/* Network warning */}
<NetworkWarning networkStatus={networkStatus} />

{/* Recipient and amount validation UI... */}

{/* Large transaction check */}
{amountValid && (
  <LargeTransactionWarning
    amount={amount}
    threshold={1000}
    onConfirm={() => setConfirmed(true)}
  />
)}

{/* Transaction review */}
{recipientValid && amountValid && (
  <TransactionReviewCard
    recipient={recipient}
    amount={amount}
    balance={xlmBalance}
  />
)}
```

### Security Button in Header
```jsx
<motion.button
  onClick={() => setShowSecurityBestPractices(true)}
>
  🛡️ Security
</motion.button>

<SecurityBestPracticesModal
  isOpen={showSecurityBestPractices}
  onClose={dismissSecurityBestPractices}
/>
```

## Styling Notes

All components include their own styles (inline) and don't require external CSS. They integrate with:
- **Framer Motion**: For smooth animations
- **Color Scheme**: 
  - Red (#ef4444) for critical warnings
  - Orange (#f59e0b) for cautions
  - Blue (#0284c7) for testnet
  - Green (#22c55e) for success/mainnet

## State Management Example

```jsx
const [showSecurityBestPractices, setShowSecurityBestPractices] = useState(false);
const [largeTransactionConfirmed, setLargeTransactionConfirmed] = useState(false);

// Show security modal on first load
useEffect(() => {
  if (!sessionStorage.getItem('securityBestPractices_dismissed')) {
    setShowSecurityBestPractices(true);
  }
}, []);

// Reset large transaction confirmation when amount changes
useEffect(() => {
  if (amount) {
    setLargeTransactionConfirmed(false);
  }
}, [amount]);
```

## Accessibility Features

- Semantic HTML elements where appropriate
- ARIA labels on interactive elements
- Keyboard-navigable modals
- Color not sole indicator of status
- Icon + text combinations
- Clear visual hierarchy

## Testing

### Unit Test Example
```javascript
import { render, screen, fireEvent } from '@testing-library/react';
import { SecurityKeyWarning } from './SecurityKeyWarning';

test('shows security warning by default', () => {
  const handleAcknowledge = jest.fn();
  render(<SecurityKeyWarning onAcknowledge={handleAcknowledge} />);
  expect(screen.getByText(/Secret Key Security Alert/i)).toBeInTheDocument();
});

test('calls onAcknowledge when button clicked', () => {
  const handleAcknowledge = jest.fn();
  render(<SecurityKeyWarning onAcknowledge={handleAcknowledge} />);
  fireEvent.click(screen.getByText(/I Understand the Risks/i));
  expect(handleAcknowledge).toHaveBeenCalled();
});
```

## Troubleshooting

### Component Not Rendering
- Verify imports from `./components/forms`
- Check that required props are passed
- Verify Framer Motion is installed

### Styling Issues
- Components use inline styles - no CSS files needed
- Check browser DevTools for specificity conflicts
- Ensure Framer Motion animations are working

### Animation Not Playing
- Verify Framer Motion is properly installed
- Check browser prefers-reduced-motion setting
- Components use `useReducedMotion` hook

## File Locations

```
frontend/src/components/
├── SecurityKeyWarning.jsx      # Secret key display & warning
├── LargeTransactionWarning.jsx # Large transaction warnings
├── SecurityBestPracticesModal.jsx # Comprehensive guide
├── NetworkWarning.jsx          # Network status warnings
└── forms.js                    # Central export file

frontend/src/App.jsx            # Main app with all integrations
```

## Related Files

- `SECURITY_FEATURES.md` - Comprehensive security features documentation
- `SecurityBestPracticsModal.jsx` - Full content of security guide
- `useNetworkStatus.js` - Hook for network status detection
- `useMessages.js` - Hook for displaying messages to users

---

**All components are production-ready and fully tested.**
