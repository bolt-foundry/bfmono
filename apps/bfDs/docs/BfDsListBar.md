# BfDsListBar

A horizontal layout component for displaying structured information with left,
center, and right sections. Ideal for list items, cards, and data rows that need
consistent alignment and optional interactive behavior.

## Props

```typescript
export type BfDsListBarProps = {
  /** Content for the left section (usually title and metadata) */
  left: React.ReactNode;
  /** Content for the center section (usually description) */
  center?: React.ReactNode;
  /** Content for the right section (usually actions and status) */
  right?: React.ReactNode;
  /** When true, shows active/selected state styling */
  active?: boolean;
  /** When true, shows hover state and makes clickable */
  clickable?: boolean;
  /** Click handler for the entire bar */
  onClick?: () => void;
  /** Additional CSS classes */
  className?: string;
};
```

## Basic Usage

```tsx
import { BfDsListBar } from "@bfmono/bfDs";

// Simple list bar with only left content
<BfDsListBar left={<span>Simple content</span>} />

// Full layout with all sections
<BfDsListBar
  left={<span>Title</span>}
  center={<span>Description</span>}
  right={<span>Action</span>}
/>
```

## Layout Sections

### Left Section

The primary content area, typically containing titles, names, or main
information:

```tsx
<BfDsListBar
  left={
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <BfDsIcon name="autoframe" size="small" />
      <div>
        <div style={{ fontWeight: "600" }}>Project Name</div>
        <div style={{ fontSize: "13px", color: "var(--bfds-text-secondary)" }}>
          Created 2 days ago
        </div>
      </div>
      <BfDsBadge variant="success">Active</BfDsBadge>
    </div>
  }
/>;
```

### Center Section

Optional middle content, often used for descriptions or secondary information:

```tsx
<BfDsListBar
  left={<span>Project Title</span>}
  center={
    <div style={{ color: "var(--bfds-text-secondary)" }}>
      A detailed description of the project that provides context
    </div>
  }
/>;
```

### Right Section

Actions, status indicators, or controls:

```tsx
<BfDsListBar
  left={<span>Item Name</span>}
  right={
    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
      <BfDsPill variant="success" text="98% complete" />
      <BfDsButton variant="ghost" size="small" icon="settings" iconOnly />
    </div>
  }
/>;
```

## Interactive Behavior

### Clickable Bars

Make the entire bar interactive:

```tsx
<BfDsListBar
  left={<span>Click me!</span>}
  center={<span>This bar is clickable</span>}
  clickable
  onClick={() => handleClick()}
/>;
```

### Active State

Highlight selected or current items:

```tsx
<BfDsListBar
  left={<span>Current Item</span>}
  center={<span>This item is currently selected</span>}
  active
/>;
```

## Common Patterns

### Project Lists

```tsx
<BfDsListBar
  left={
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <BfDsIcon name="autoframe" size="small" />
      <span style={{ fontWeight: "600" }}>Website Redesign</span>
      <BfDsBadge variant="success">Active</BfDsBadge>
    </div>
  }
  center={
    <span style={{ color: "var(--bfds-text-secondary)" }}>
      Complete redesign of the company website with modern UI
    </span>
  }
  right={
    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
      <BfDsPill variant="success" text="92% complete" />
      <BfDsButton variant="ghost" size="small" icon="settings" iconOnly />
    </div>
  }
  clickable
  onClick={() => openProject("website-redesign")}
/>;
```

### User Management

```tsx
<BfDsListBar
  left={
    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
      <div className="avatar">JD</div>
      <div>
        <div style={{ fontWeight: "600" }}>John Doe</div>
        <div style={{ fontSize: "13px", color: "var(--bfds-text-secondary)" }}>
          john@example.com
        </div>
      </div>
    </div>
  }
  center={
    <div>
      <BfDsPill variant="default" text="Admin" />
      <span style={{ marginLeft: "8px", color: "var(--bfds-text-secondary)" }}>
        Last active 2 hours ago
      </span>
    </div>
  }
  right={
    <div style={{ display: "flex", gap: "8px" }}>
      <BfDsButton variant="outline" size="small">Edit</BfDsButton>
      <BfDsButton variant="ghost" size="small" icon="moreHorizontal" iconOnly />
    </div>
  }
/>;
```

### API Endpoints

```tsx
<BfDsListBar
  left={
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <BfDsBadge variant="success">GET</BfDsBadge>
      <code>/api/users/{id}</code>
    </div>
  }
  center={
    <span style={{ color: "var(--bfds-text-secondary)" }}>
      Retrieve a specific user by ID
    </span>
  }
  right={
    <div style={{ display: "flex", gap: "8px" }}>
      <BfDsButton variant="ghost" size="small">Test</BfDsButton>
      <BfDsCopyButton textToCopy="/api/users/{id}" size="small" />
    </div>
  }
  clickable
  onClick={() => openEndpointDocs("get-user")}
/>;
```

### File Lists

```tsx
<BfDsListBar
  left={
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <BfDsIcon name="fileText" size="small" />
      <div>
        <div style={{ fontWeight: "500" }}>document.pdf</div>
        <div style={{ fontSize: "13px", color: "var(--bfds-text-secondary)" }}>
          2.4 MB • Modified 3 hours ago
        </div>
      </div>
    </div>
  }
  right={
    <div style={{ display: "flex", gap: "8px" }}>
      <BfDsButton variant="ghost" size="small" icon="download" iconOnly />
      <BfDsButton variant="ghost" size="small" icon="share" iconOnly />
      <BfDsButton variant="ghost" size="small" icon="moreVertical" iconOnly />
    </div>
  }
  clickable
  onClick={() => openFile("document.pdf")}
/>;
```

## Multiple List Bars

Create consistent lists with multiple items:

```tsx
{
  items.map((item, index) => (
    <BfDsListBar
      key={index}
      left={
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <BfDsIcon name={item.icon} size="small" />
          <span style={{ fontWeight: "600" }}>{item.name}</span>
          <BfDsBadge variant={item.status === "active" ? "success" : "default"}>
            {item.status}
          </BfDsBadge>
        </div>
      }
      center={
        <span style={{ color: "var(--bfds-text-secondary)" }}>
          {item.description}
        </span>
      }
      right={
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <BfDsPill
            variant={item.score >= 90 ? "success" : "warning"}
            text={`${item.score}% accuracy`}
          />
          <BfDsButton variant="ghost" size="small" icon="settings" iconOnly />
        </div>
      }
      clickable
      onClick={() => handleItemClick(item)}
    />
  ));
}
```

## Responsive Behavior

BfDsListBar automatically handles responsive layouts:

```tsx
// On smaller screens, center content may wrap or truncate
<BfDsListBar
  left={<span>Always visible title</span>}
  center={<span>May wrap on small screens</span>}
  right={<span>Actions remain accessible</span>}
/>;
```

## Accessibility

### Keyboard Navigation

When `clickable={true}`, the list bar becomes keyboard accessible:

```tsx
<BfDsListBar
  left={<span>Keyboard accessible</span>}
  clickable
  onClick={handleClick}
  // Supports Enter and Space key activation
/>;
```

### Focus Management

- Receives focus when `clickable` is true
- Clear focus indicators
- Proper tab order integration

### Screen Reader Support

- Uses appropriate ARIA roles when interactive
- Provides context for assistive technologies

## Styling Customization

Add custom styles with className:

```tsx
<BfDsListBar
  className="custom-bar-styles"
  left={<span>Custom styled bar</span>}
/>;
```

## Best Practices

### Content Organization

- **Left**: Primary identifiers, titles, names
- **Center**: Descriptions, secondary information
- **Right**: Actions, status, controls

### Visual Hierarchy

- Use font weights to establish importance
- Apply consistent spacing between sections
- Use color to indicate states and relationships

### Interaction Design

- Make clickable areas clear with hover states
- Group related actions in the right section
- Provide clear visual feedback for active states

## Styling Notes

BfDsListBar uses CSS classes with the `bfds-list-bar` prefix:

- `.bfds-list-bar` - Base container styles
- `.bfds-list-bar--active` - Active state styling
- `.bfds-list-bar--clickable` - Clickable interaction styles
- `.bfds-list-bar__left` - Left section container
- `.bfds-list-bar__center` - Center section container
- `.bfds-list-bar__right` - Right section container

The component automatically:

- Handles flexbox layout for proper alignment
- Applies hover states for clickable bars
- Manages focus states for keyboard navigation
- Ensures consistent spacing across sections

## Integration with Other Components

BfDsListBar works well with other BfDs components:

- **BfDsIcon**: For visual identifiers
- **BfDsBadge**: For status indicators
- **BfDsPill**: For metrics and labels
- **BfDsButton**: For actions
- **BfDsCopyButton**: For copyable content

This combination creates rich, interactive interfaces while maintaining
consistency across the design system.
