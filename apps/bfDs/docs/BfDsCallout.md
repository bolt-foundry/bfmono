# BfDsCallout

A notification component for displaying important information with support for
different variants, expandable details, auto-dismiss functionality, and animated
transitions.

## Props

```typescript
export type BfDsCalloutProps = {
  /** Visual variant of the callout */
  variant?: BfDsCalloutVariant;
  /** Optional detailed content (like JSON data) */
  details?: string;
  /** Whether details are expanded by default */
  defaultExpanded?: boolean;
  /** Whether to show the callout */
  visible?: boolean;
  /** Callback when callout is dismissed */
  onDismiss?: () => void;
  /** Auto-dismiss after milliseconds (0 = no auto-dismiss) */
  autoDismiss?: number;
  /** Additional CSS classes */
  className?: string;
};

export type BfDsCalloutVariant = "info" | "success" | "warning" | "error";
```

## Basic Usage

```tsx
import { BfDsCallout } from "@bfmono/bfDs";

// Simple callout
<BfDsCallout variant="info">
  This is an informational message
</BfDsCallout>

// With dismiss functionality
<BfDsCallout 
  variant="success" 
  onDismiss={() => handleDismiss()}
>
  Operation completed successfully!
</BfDsCallout>
```

## Variants

BfDsCallout supports 4 semantic variants, each with appropriate icons and
styling:

```tsx
<BfDsCallout variant="info">
  Information message with info icon
</BfDsCallout>

<BfDsCallout variant="success">
  Success message with checkmark icon
</BfDsCallout>

<BfDsCallout variant="warning">
  Warning message with triangle icon
</BfDsCallout>

<BfDsCallout variant="error">
  Error message with stop icon
</BfDsCallout>
```

### Variant Icons

- **`info`** - Uses `infoCircle` icon
- **`success`** - Uses `checkCircle` icon
- **`warning`** - Uses `exclamationTriangle` icon
- **`error`** - Uses `exclamationStop` icon

## Expandable Details

Add detailed information that can be toggled by the user:

```tsx
const detailData = {
  timestamp: "2024-01-15T10:30:00Z",
  userId: "12345",
  operation: "data-sync"
};

<BfDsCallout 
  variant="success"
  details={JSON.stringify(detailData, null, 2)}
>
  Data synchronization completed
</BfDsCallout>

// Details expanded by default
<BfDsCallout 
  variant="error"
  details="Error stack trace here..."
  defaultExpanded={true}
>
  An error occurred during processing
</BfDsCallout>
```

## Auto-dismiss with Countdown

Automatically dismiss callouts after a specified time with visual countdown:

```tsx
<BfDsCallout 
  variant="info"
  autoDismiss={5000}
  onDismiss={() => handleAutoDismiss()}
>
  This message will auto-dismiss in 5 seconds
</BfDsCallout>

<BfDsCallout 
  variant="warning"
  autoDismiss={10000}
  onDismiss={() => console.log('Auto-dismissed')}
>
  Auto-dismiss with countdown ring. Hover to pause!
</BfDsCallout>
```

**Auto-dismiss Features:**

- Visual countdown ring around the dismiss button
- Hover to pause the countdown
- Smooth exit animation
- Configurable timing (in milliseconds)

## Visibility Control

Programmatically control callout visibility:

```tsx
const [showCallout, setShowCallout] = useState(true);

<BfDsCallout
  variant="success"
  visible={showCallout}
  onDismiss={() => setShowCallout(false)}
>
  Conditionally visible callout
</BfDsCallout>;
```

## Dynamic Notifications

Perfect for notification systems:

```tsx
const [notifications, setNotifications] = useState([]);

const addNotification = (message, variant, autoDismiss = 0) => {
  const id = Date.now();
  setNotifications((prev) => [...prev, { id, message, variant, autoDismiss }]);
};

const removeNotification = (id) => {
  setNotifications((prev) => prev.filter((n) => n.id !== id));
};

// Add notifications
addNotification("File uploaded successfully", "success", 3000);
addNotification("Connection lost", "error");

// Render notifications
{
  notifications.map((notification) => (
    <BfDsCallout
      key={notification.id}
      variant={notification.variant}
      autoDismiss={notification.autoDismiss}
      onDismiss={() => removeNotification(notification.id)}
    >
      {notification.message}
    </BfDsCallout>
  ));
}
```

## Common Use Cases

### Form Validation Messages

```tsx
<BfDsCallout variant="error">
  Please fix the following errors before submitting:
  <ul>
    <li>Email field is required</li>
    <li>Password must be at least 8 characters</li>
  </ul>
</BfDsCallout>;
```

### System Status Updates

```tsx
<BfDsCallout
  variant="info"
  autoDismiss={8000}
>
  System maintenance scheduled for tonight at 2 AM PST
</BfDsCallout>;
```

### API Response Handling

```tsx
const handleApiError = (error) => {
  return (
    <BfDsCallout
      variant="error"
      details={JSON.stringify(error.response, null, 2)}
      onDismiss={() => clearError()}
    >
      Failed to load data. Click "Show details" for more information.
    </BfDsCallout>
  );
};
```

### Progress Updates

```tsx
<BfDsCallout variant="success">
  ✅ Database backup completed successfully
</BfDsCallout>

<BfDsCallout variant="warning">
  ⚠️ Some files could not be processed - check logs for details
</BfDsCallout>
```

### Onboarding Messages

```tsx
<BfDsCallout
  variant="info"
  onDismiss={() => markOnboardingComplete()}
>
  Welcome! Here are some tips to get started with your new dashboard.
</BfDsCallout>;
```

## Accessibility

BfDsCallout includes built-in accessibility features:

- **Semantic HTML** - Proper structure for screen readers
- **ARIA labels** - Dismiss button has descriptive label
- **Keyboard navigation** - Full keyboard support for interactive elements
- **Focus management** - Proper focus handling for expand/dismiss actions
- **Screen reader announcements** - Variant-appropriate messaging

### Best Practices

- Use appropriate variants that match the message severity
- Keep main messages concise and actionable
- Use details for technical information or stack traces
- Don't overuse auto-dismiss - reserve for non-critical messages
- Test with screen readers to ensure message clarity
- Provide clear dismiss functionality for persistent messages

## Animation and Interaction

BfDsCallout includes smooth animations:

- **Entrance animation** - Fade-in with slide effect
- **Exit animation** - Fade-out when dismissed
- **Hover interactions** - Pause auto-dismiss on hover
- **Expand/collapse** - Smooth transitions for details section
- **Countdown visual** - Animated progress ring

## Styling Notes

BfDsCallout uses CSS classes with the `bfds-callout` prefix:

- `.bfds-callout` - Base callout styles
- `.bfds-callout--{variant}` - Variant-specific colors and styling
- `.bfds-callout--animating-out` - Exit animation state
- `.bfds-callout-header` - Header container with icon and content
- `.bfds-callout-content` - Main content area
- `.bfds-callout-details` - Expandable details section
- `.bfds-callout-countdown` - Auto-dismiss countdown ring
- `.bfds-callout-countdown--paused` - Paused countdown state

The component automatically handles:

- Icon selection based on variant
- Animation timing coordination
- Hover state management for auto-dismiss
- Responsive layout for different screen sizes
