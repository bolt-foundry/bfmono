# BfDsButton

A versatile button component that supports multiple visual variants, sizes,
icons, and can render as either a button element or anchor link. The component
includes loading states and accessibility features.

## Props

```typescript
export type BfDsButtonProps = {
  /** Button content text or elements */
  children?: React.ReactNode;
  /** Size variant for button */
  size?: BfDsButtonSize;
  /** Visual style variant */
  variant?: BfDsButtonVariant;
  /** Disables button interaction */
  disabled?: boolean;
  /** Click event handler */
  onClick?: (
    e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>,
  ) => void;
  /** Additional CSS classes */
  className?: string;
  /** Icon name or custom icon element */
  icon?: BfDsIconName | React.ReactNode;
  /** Position of icon relative to text */
  iconPosition?: "left" | "right";
  /** When true, shows only icon without text */
  iconOnly?: boolean;
  /** When true, applies overlay styling, shows original variant on hover */
  overlay?: boolean;
  /** URL to navigate to (renders as anchor tag) */
  href?: string;
  /** Target attribute for links (defaults to _blank when href is provided) */
  target?: "_blank" | "_self" | "_parent" | "_top" | string;
  /** React Router link path (not implemented yet, falls back to anchor tag) */
  link?: string;
  /** When true, shows spinner animation */
  spinner?: boolean;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

export type BfDsButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "outline-secondary"
  | "ghost"
  | "ghost-primary";

export type BfDsButtonSize = "small" | "medium" | "large";
```

## Basic Usage

```tsx
import { BfDsButton } from "@bfmono/bfDs";

// Simple button
<BfDsButton onClick={() => handleClick()}>
  Click me
</BfDsButton>

// With icon
<BfDsButton icon="arrowRight" onClick={() => handleNext()}>
  Next
</BfDsButton>
```

## Variants

BfDsButton supports 6 visual variants for different use cases:

```tsx
<BfDsButton variant="primary">Primary</BfDsButton>
<BfDsButton variant="secondary">Secondary</BfDsButton>
<BfDsButton variant="outline">Outline</BfDsButton>
<BfDsButton variant="outline-secondary">Outline Secondary</BfDsButton>
<BfDsButton variant="ghost">Ghost</BfDsButton>
<BfDsButton variant="ghost-primary">Ghost Primary</BfDsButton>
```

### Variant Usage Guidelines

- **`primary`** - Main call-to-action buttons (save, submit, confirm)
- **`secondary`** - Secondary actions (cancel, close)
- **`outline`** - Less prominent actions with clear boundaries
- **`outline-secondary`** - Subtle outlined buttons
- **`ghost`** - Minimal buttons that blend into the background
- **`ghost-primary`** - Ghost style with primary coloring

## Sizes

Three size variants provide visual hierarchy:

```tsx
<BfDsButton size="small">Small Button</BfDsButton>
<BfDsButton size="medium">Medium Button</BfDsButton>
<BfDsButton size="large">Large Button</BfDsButton>
```

## Icons

Add visual context with icons from the BfDs icon set:

```tsx
// Icon with text
<BfDsButton icon="arrowRight">Next</BfDsButton>

// Icon position
<BfDsButton icon="arrowLeft" iconPosition="left">Previous</BfDsButton>
<BfDsButton icon="arrowRight" iconPosition="right">Forward</BfDsButton>

// Icon-only buttons
<BfDsButton icon="settings" iconOnly />
<BfDsButton icon="burgerMenu" iconOnly variant="ghost" />

// Custom icon element
<BfDsButton icon={<CustomIconComponent />}>Custom</BfDsButton>
```

## States

### Disabled State

```tsx
<BfDsButton disabled>Disabled Button</BfDsButton>
<BfDsButton disabled variant="outline">Disabled Outline</BfDsButton>
```

### Loading State

Show loading spinners for async actions:

```tsx
<BfDsButton spinner onClick={() => handleAsyncAction()}>
  Saving...
</BfDsButton>

// Different sizes
<BfDsButton spinner size="small">Processing</BfDsButton>
<BfDsButton spinner size="large">Loading Data</BfDsButton>

// Icon-only with spinner
<BfDsButton spinner iconOnly icon="refresh" />
```

## Links and Navigation

### External Links

Render as anchor tags for external navigation:

```tsx
<BfDsButton href="https://example.com">
  External Link
</BfDsButton>

<BfDsButton href="https://github.com" target="_self">
  Internal Navigation
</BfDsButton>

<BfDsButton href="mailto:hello@example.com" variant="secondary">
  Send Email
</BfDsButton>
```

### Router Links (Future Feature)

React Router integration is planned but not yet implemented:

```tsx
// Will be implemented in future versions
<BfDsButton link="/dashboard">Go to Dashboard</BfDsButton>
<BfDsButton link="/settings" icon="settings">Settings</BfDsButton>
```

_Note: Currently renders as regular anchor tags until React Router integration
is complete._

## Overlay Style

Special overlay styling that reveals the original variant on hover:

```tsx
<BfDsButton overlay variant="primary">Overlay Button</BfDsButton>
<BfDsButton overlay variant="ghost" icon="menu" iconOnly />
```

Perfect for buttons overlaid on images or complex backgrounds.

## Form Integration

Works seamlessly with HTML forms:

```tsx
<form onSubmit={handleSubmit}>
  <BfDsButton type="submit" variant="primary">
    Submit Form
  </BfDsButton>

  <BfDsButton type="reset" variant="secondary">
    Reset Form
  </BfDsButton>

  <BfDsButton type="button" onClick={() => handleCancel()}>
    Cancel
  </BfDsButton>
</form>;
```

## Common Use Cases

### Action Buttons

```tsx
// Primary actions
<BfDsButton variant="primary" icon="checkCircle">
  Save Changes
</BfDsButton>

// Secondary actions  
<BfDsButton variant="secondary" onClick={() => handleCancel()}>
  Cancel
</BfDsButton>

// Destructive actions
<BfDsButton variant="outline" icon="trash">
  Delete Item
</BfDsButton>
```

### Navigation Controls

```tsx
<div className="pagination">
  <BfDsButton
    icon="arrowLeft"
    iconPosition="left"
    variant="ghost"
    onClick={() => handlePrevious()}
  >
    Previous
  </BfDsButton>

  <BfDsButton
    icon="arrowRight"
    iconPosition="right"
    variant="ghost"
    onClick={() => handleNext()}
  >
    Next
  </BfDsButton>
</div>;
```

### Icon Toolbars

```tsx
<div className="toolbar">
  <BfDsButton icon="bold" iconOnly size="small" variant="ghost" />
  <BfDsButton icon="italic" iconOnly size="small" variant="ghost" />
  <BfDsButton icon="underline" iconOnly size="small" variant="ghost" />
  <BfDsButton icon="link" iconOnly size="small" variant="ghost" />
</div>;
```

### Loading Actions

```tsx
const [isLoading, setIsLoading] = useState(false);

const handleAsyncAction = async () => {
  setIsLoading(true);
  try {
    await performAsyncOperation();
  } finally {
    setIsLoading(false);
  }
};

<BfDsButton
  spinner={isLoading}
  disabled={isLoading}
  onClick={handleAsyncAction}
>
  {isLoading ? "Processing..." : "Start Process"}
</BfDsButton>;
```

## Accessibility

BfDsButton includes built-in accessibility features:

- **Keyboard navigation** - Full support for Tab, Enter, and Space keys
- **Screen reader support** - Proper semantic HTML elements
- **Focus indicators** - Clear visual focus states
- **Disabled state handling** - Prevents interaction and updates ARIA attributes
- **Icon accessibility** - Icons are decorative and don't interfere with screen
  readers

### Best Practices

- Use descriptive text that explains the button's action
- Don't rely solely on icons to convey meaning
- Ensure sufficient color contrast for all variants
- Test keyboard navigation in your specific context
- Use loading states to provide feedback during async operations

## Styling Notes

BfDsButton uses CSS classes with the `bfds-button` prefix:

- `.bfds-button` - Base button styles
- `.bfds-button--{variant}` - Variant-specific styles
- `.bfds-button--{size}` - Size-specific styles
- `.bfds-button--icon-only` - Icon-only button modifier
- `.bfds-button--overlay` - Overlay style modifier
- `.bfds-button-spinner` - Spinner container styles

The component automatically:

- Matches icon size to button size
- Handles spinner sizing for different button sizes
- Applies proper spacing for icon and text combinations
- Manages hover and focus states across all variants
