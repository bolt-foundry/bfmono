# BfDsBadge

A versatile badge component for displaying status indicators, labels, tags, and
other contextual information with support for various visual styles and
interactive behaviors.

## Props

```typescript
export type BfDsBadgeProps = {
  /** Content inside the badge */
  children: ReactNode;
  /** Visual variant of the badge */
  variant?: BfDsBadgeVariant;
  /** Size of the badge */
  size?: BfDsBadgeSize;
  /** Icon to display before the text */
  icon?: BfDsIconName;
  /** Whether the badge should be outlined instead of filled */
  outlined?: boolean;
  /** Whether the badge should be rounded (pill shape) */
  rounded?: boolean;
  /** Whether the badge is clickable */
  clickable?: boolean;
  /** Click handler for clickable badges */
  onClick?: () => void;
  /** Whether the badge is removable */
  removable?: boolean;
  /** Handler for remove action */
  onRemove?: () => void;
  /** Additional CSS classes */
  className?: string;
} & Omit<React.HTMLAttributes<HTMLSpanElement>, "onClick">;

export type BfDsBadgeVariant =
  | "default"
  | "primary"
  | "secondary"
  | "success"
  | "warning"
  | "error"
  | "info";

export type BfDsBadgeSize = "small" | "medium" | "large";
```

## Basic Usage

```tsx
import { BfDsBadge } from "@bfmono/bfDs";

// Simple badge
<BfDsBadge>Default Badge</BfDsBadge>

// With variant and icon
<BfDsBadge variant="success" icon="checkCircle">
  Approved
</BfDsBadge>
```

## Variants

BfDsBadge supports 7 semantic variants to communicate different types of
information:

```tsx
<BfDsBadge variant="default">Default</BfDsBadge>
<BfDsBadge variant="primary">Primary</BfDsBadge>
<BfDsBadge variant="secondary">Secondary</BfDsBadge>
<BfDsBadge variant="success">Success</BfDsBadge>
<BfDsBadge variant="warning">Warning</BfDsBadge>
<BfDsBadge variant="error">Error</BfDsBadge>
<BfDsBadge variant="info">Info</BfDsBadge>
```

### Outlined Style

Add `outlined` prop for a lighter, bordered appearance:

```tsx
<BfDsBadge variant="primary" outlined>Outlined Badge</BfDsBadge>
<BfDsBadge variant="success" outlined>Success Outlined</BfDsBadge>
```

## Sizes

Three size variants are available:

```tsx
<BfDsBadge size="small">Small Badge</BfDsBadge>
<BfDsBadge size="medium">Medium Badge</BfDsBadge>
<BfDsBadge size="large">Large Badge</BfDsBadge>
```

## Icons

Add visual context with icons from the BfDs icon set:

```tsx
<BfDsBadge variant="success" icon="checkCircle">Completed</BfDsBadge>
<BfDsBadge variant="warning" icon="exclamationTriangle">Warning</BfDsBadge>
<BfDsBadge variant="error" icon="exclamationStop">Error</BfDsBadge>
<BfDsBadge variant="info" icon="infoCircle">Information</BfDsBadge>
```

## Rounded Badges

Use the `rounded` prop for pill-shaped badges:

```tsx
<BfDsBadge variant="primary" rounded>Beta</BfDsBadge>
<BfDsBadge variant="success" rounded icon="checkCircle">Live</BfDsBadge>
```

## Interactive Badges

### Clickable Badges

Make badges interactive with the `clickable` prop:

```tsx
<BfDsBadge
  variant="primary"
  clickable
  onClick={() => handleBadgeClick()}
>
  Click me
</BfDsBadge>;
```

Clickable badges automatically include:

- Keyboard navigation (Enter/Space keys)
- Proper ARIA roles and attributes
- Focus indicators
- Hover states

### Removable Badges

Create dismissible badges for tags and filters:

```tsx
<BfDsBadge
  variant="default"
  removable
  onRemove={() => removeBadge(id)}
>
  Removable Tag
</BfDsBadge>;
```

## Common Use Cases

### Status Indicators

```tsx
<div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
  <span>System Status:</span>
  <BfDsBadge variant="success" icon="checkCircle" size="small">
    Operational
  </BfDsBadge>
</div>;
```

### Tag Management

```tsx
const [tags, setTags] = useState(["React", "TypeScript", "Design System"]);

return (
  <div className="tag-list">
    {tags.map((tag) => (
      <BfDsBadge
        key={tag}
        variant="primary"
        removable
        onRemove={() => removeTag(tag)}
      >
        {tag}
      </BfDsBadge>
    ))}
  </div>
);
```

### Counter Badges

```tsx
<div style={{ position: "relative" }}>
  <button>Messages</button>
  <BfDsBadge
    variant="error"
    size="small"
    rounded
    style={{
      position: "absolute",
      top: "-8px",
      right: "-8px",
      minWidth: "20px",
      height: "20px",
    }}
  >
    12
  </BfDsBadge>
</div>;
```

### Priority Levels

```tsx
<BfDsBadge variant="error" icon="exclamationTriangle">High Priority</BfDsBadge>
<BfDsBadge variant="warning" icon="exclamationCircle">Medium Priority</BfDsBadge>
<BfDsBadge variant="success" icon="checkCircle">Low Priority</BfDsBadge>
```

### Environment Labels

```tsx
<BfDsBadge variant="success" rounded outlined>Production</BfDsBadge>
<BfDsBadge variant="warning" rounded outlined>Staging</BfDsBadge>
<BfDsBadge variant="info" rounded outlined>Development</BfDsBadge>
```

## Best Practices

### Visual Hierarchy

- Use semantic variants that match the content meaning
- Reserve `error` and `success` for actual status information
- Use `outlined` style for less prominent badges

### Accessibility

- Provide meaningful content that describes the badge's purpose
- Use icons to enhance understanding, not replace text
- Ensure sufficient color contrast for all variants
- Test keyboard navigation for interactive badges

### Content Guidelines

- Keep text concise (1-3 words)
- Use consistent terminology across similar badges
- Consider localization for international applications

### Interactive Behavior

- Only make badges clickable when there's a clear action
- Use `removable` for user-manageable content like tags
- Provide clear visual feedback for interactive states

## Styling Notes

BfDsBadge uses CSS classes with the `bfds-badge` prefix:

- `.bfds-badge` - Base badge styles
- `.bfds-badge--{variant}` - Variant-specific styles
- `.bfds-badge--{size}` - Size-specific styles
- `.bfds-badge--outlined` - Outlined style modifier
- `.bfds-badge--rounded` - Rounded style modifier
- `.bfds-badge--clickable` - Clickable style modifier
- `.bfds-badge--removable` - Removable style modifier

The component automatically handles icon sizing relative to badge size and
provides proper spacing for all combinations of props.
