# BfDsSpinner

Loading spinner components for indicating progress and waiting states. Includes
both a customizable spinner component and a full-page loading overlay variant
with animated icon support.

## Props

### BfDsSpinner

```typescript
export type BfDsSpinnerProps = {
  /** Size of the spinner in pixels */
  size?: number;
  /** Color of the spinner (defaults to currentColor to inherit parent text color) */
  color?: string;
  /** 0-1 percentage to offset the starting point */
  offset?: number;
  /** When true, shows an animated icon inside the spinner */
  waitIcon?: boolean;
};
```

### BfDsFullPageSpinner

```typescript
export interface BfDsFullPageSpinnerProps {
  /** Additional styles to apply to the container */
  xstyle?: React.CSSProperties;
}
```

## Basic Usage

```tsx
import { BfDsSpinner, BfDsFullPageSpinner } from "@bfmono/bfDs";

// Simple spinner
<BfDsSpinner />

// Custom size and color
<BfDsSpinner 
  size={32}
  color="#007bff"
/>

// With animated icon
<BfDsSpinner 
  waitIcon
  size={48}
/>

// Full page loading
<BfDsFullPageSpinner />
```

## Spinner Variants

### Basic Spinner

```tsx
// Default spinner (48px, currentColor)
<BfDsSpinner />

// Small spinner
<BfDsSpinner size={24} />

// Large spinner
<BfDsSpinner size={64} />
```

### Custom Colors

```tsx
// Primary color
<BfDsSpinner color="var(--bfds-primary)" />

// Custom colors
<BfDsSpinner color="#10b981" size={36} />
<BfDsSpinner color="#ef4444" size={36} />
<BfDsSpinner color="#8b5cf6" size={36} />
```

### With Animated Icon

```tsx
// Spinner with animated bolt/hourglass icon
<BfDsSpinner waitIcon size={64} />

// Different sizes with icon
<BfDsSpinner waitIcon size={32} />
<BfDsSpinner waitIcon size={48} />
<BfDsSpinner waitIcon size={72} />
```

## Full Page Loading

```tsx
// Basic full page spinner
<BfDsFullPageSpinner />

// With custom styling
<BfDsFullPageSpinner 
  xstyle={{ 
    backgroundColor: 'rgba(0,0,0,0.1)',
    backdropFilter: 'blur(2px)'
  }} 
/>
```

## Common Use Cases

### Button Loading States

```tsx
const [isLoading, setIsLoading] = useState(false);

<BfDsButton
  onClick={handleAsyncAction}
  disabled={isLoading}
>
  {isLoading
    ? (
      <div className="flex items-center gap-2">
        <BfDsSpinner size={16} />
        Processing...
      </div>
    )
    : (
      "Submit"
    )}
</BfDsButton>;
```

### Content Loading

```tsx
const [isLoading, setIsLoading] = useState(true);
const [data, setData] = useState(null);

return (
  <div className="content-area">
    {isLoading
      ? (
        <div className="flex justify-center py-8">
          <BfDsSpinner size={32} />
        </div>
      )
      : <div>{data}</div>}
  </div>
);
```

### Card Loading State

```tsx
<BfDsCard>
  {isLoading
    ? (
      <div className="flex flex-col items-center py-6">
        <BfDsSpinner waitIcon size={48} />
        <p className="mt-4 text-gray-500">Loading data...</p>
      </div>
    )
    : (
      <div>
        <h3>Data Title</h3>
        <p>Data content...</p>
      </div>
    )}
</BfDsCard>;
```

### Form Submission Loading

```tsx
<BfDsForm onSubmit={handleSubmit}>
  <BfDsInput name="email" label="Email" />
  <BfDsInput name="password" label="Password" type="password" />

  <BfDsButton type="submit" disabled={isSubmitting}>
    {isSubmitting
      ? (
        <div className="flex items-center gap-2">
          <BfDsSpinner size={16} color="white" />
          Signing In...
        </div>
      )
      : (
        "Sign In"
      )}
  </BfDsButton>
</BfDsForm>;
```

### Application Loading

```tsx
function App() {
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    initializeApp().then(() => {
      setIsInitializing(false);
    });
  }, []);

  if (isInitializing) {
    return <BfDsFullPageSpinner />;
  }

  return <MainApplication />;
}
```

### Inline Loading States

```tsx
<div className="dashboard">
  <h2>Dashboard</h2>

  <div className="widgets">
    <BfDsCard header="Revenue">
      {revenueLoading
        ? <BfDsSpinner size={24} />
        : <div className="text-2xl">${revenue}</div>}
    </BfDsCard>

    <BfDsCard header="Users">
      {usersLoading
        ? <BfDsSpinner size={24} />
        : <div className="text-2xl">{userCount}</div>}
    </BfDsCard>
  </div>
</div>;
```

### Modal Loading

```tsx
<BfDsModal isOpen={modalOpen} onClose={closeModal}>
  {isModalLoading
    ? (
      <div className="flex justify-center py-12">
        <BfDsSpinner waitIcon size={56} />
      </div>
    )
    : (
      <div>
        <h3>Modal Content</h3>
        <p>Content loaded successfully!</p>
      </div>
    )}
</BfDsModal>;
```

## Accessibility

BfDsSpinner components include accessibility considerations:

- **Semantic markup** - Uses appropriate SVG elements for screen readers
- **Visual indicators** - Clear visual feedback for loading states
- **Color inheritance** - Respects parent text color by default
- **Focus management** - Doesn't interfere with keyboard navigation

### Best Practices

- Always provide context for loading states (loading text)
- Use appropriate sizes for the context
- Consider using the waitIcon for longer loading operations
- Don't rely solely on spinners for feedback - include text when possible
- Ensure sufficient color contrast for custom colors

## Styling Notes

BfDsSpinner uses CSS classes with the `bfds-spinner` prefix:

- `.bfds-spinner-container` - Container wrapper for positioning
- `.bfds-spinner` - Main spinner SVG element
- Animation handled through CSS keyframes: `@keyframes bfds-spinner-rotate`

The component automatically:

- Inherits text color when no custom color is provided
- Scales stroke width proportionally to size
- Centers the spinner within its container
- Provides smooth rotation animation
- Handles the animated icon overlay when `waitIcon` is enabled

### Full Page Spinner Styling

BfDsFullPageSpinner automatically:

- Centers content horizontally and vertically
- Takes full viewport dimensions
- Includes fade-in animation for smooth appearance
- Uses CSS custom properties for primary color
- Provides proper spacing and padding
