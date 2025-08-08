# BfDsListItem

An individual item component for use within BfDsList containers. Supports
various states, click interactions, and expandable content with automatic
integration into list context.

## Props

```typescript
export type BfDsListItemProps = {
  /** Content to display in the list item */
  children: React.ReactNode;
  /** When true, shows active state styling */
  active?: boolean;
  /** When true, disables interaction and shows disabled styling */
  disabled?: boolean;
  /** Click handler - when provided, renders as button instead of li */
  onClick?: () => void;
  /** Additional CSS classes */
  className?: string;
  /** Content to show when expanded - makes item expandable if provided */
  expandContents?: React.ReactNode;
};
```

## Basic Usage

```tsx
import { BfDsList, BfDsListItem } from "@bfmono/bfDs";

// Simple list items
<BfDsList>
  <BfDsListItem>Home</BfDsListItem>
  <BfDsListItem>About</BfDsListItem>
  <BfDsListItem>Contact</BfDsListItem>
</BfDsList>

// With states
<BfDsList>
  <BfDsListItem active>Active Item</BfDsListItem>
  <BfDsListItem disabled>Disabled Item</BfDsListItem>
</BfDsList>
```

## Interactive Items

### Clickable Items

Make items interactive with onClick handlers:

```tsx
<BfDsList>
  <BfDsListItem onClick={() => navigateTo("/dashboard")}>
    Dashboard
  </BfDsListItem>
  <BfDsListItem onClick={() => navigateTo("/projects")}>
    Projects
  </BfDsListItem>
  <BfDsListItem onClick={() => navigateTo("/settings")}>
    Settings
  </BfDsListItem>
</BfDsList>;
```

### Active States

Highlight the current or selected item:

```tsx
const [currentPage, setCurrentPage] = useState("dashboard");

<BfDsList>
  <BfDsListItem
    active={currentPage === "dashboard"}
    onClick={() => setCurrentPage("dashboard")}
  >
    Dashboard
  </BfDsListItem>
  <BfDsListItem
    active={currentPage === "projects"}
    onClick={() => setCurrentPage("projects")}
  >
    Projects
  </BfDsListItem>
</BfDsList>;
```

## Expandable Content

### Independent Expansion

Without accordion mode, multiple items can be expanded:

```tsx
<BfDsList>
  <BfDsListItem
    expandContents={
      <div style={{ padding: "12px" }}>
        <p>This is expandable content for item 1.</p>
        <button>Action Button</button>
      </div>
    }
  >
    Expandable Item 1
  </BfDsListItem>
  <BfDsListItem
    expandContents={
      <div style={{ padding: "12px" }}>
        <p>This is expandable content for item 2.</p>
        <ul>
          <li>Feature A</li>
          <li>Feature B</li>
        </ul>
      </div>
    }
  >
    Expandable Item 2
  </BfDsListItem>
</BfDsList>;
```

### Accordion Mode

In accordion mode, only one item expands at a time:

```tsx
<BfDsList accordion>
  <BfDsListItem
    expandContents={
      <div style={{ padding: "12px" }}>
        <h4>Section 1 Details</h4>
        <p>Opening this section will close others automatically.</p>
      </div>
    }
  >
    Section 1
  </BfDsListItem>
  <BfDsListItem
    expandContents={
      <div style={{ padding: "12px" }}>
        <h4>Section 2 Details</h4>
        <p>This section will close Section 1 when opened.</p>
      </div>
    }
  >
    Section 2
  </BfDsListItem>
</BfDsList>;
```

## Combined Click and Expand

Items can have both click actions AND expandable content:

```tsx
<BfDsList>
  <BfDsListItem
    onClick={() => handleItemClick("project-1")}
    expandContents={
      <div style={{ padding: "12px" }}>
        <p>Additional project details...</p>
        <div style={{ display: "flex", gap: "8px" }}>
          <button>Edit</button>
          <button>Delete</button>
        </div>
      </div>
    }
  >
    Project Alpha (Click for main action, expand for details)
  </BfDsListItem>
</BfDsList>;
```

When both `onClick` and `expandContents` are provided:

- Clicking the main content triggers the `onClick` handler
- A separate expand button appears for showing/hiding content
- Both interactions work independently

## Visual States

### Active State

```tsx
<BfDsListItem active>
  This item is currently active/selected
</BfDsListItem>;
```

### Disabled State

```tsx
<BfDsListItem disabled>
  This item cannot be interacted with
</BfDsListItem>

<BfDsListItem disabled onClick={() => console.log('Will not fire')}>
  Disabled clickable item
</BfDsListItem>
```

### Expansion Indicators

Expandable items automatically show arrow icons:

- **Right arrow** (→) when collapsed
- **Down arrow** (↓) when expanded

## Common Patterns

### Navigation Menu

```tsx
const navigationItems = [
  { id: "home", label: "Home", path: "/" },
  { id: "about", label: "About", path: "/about" },
  { id: "services", label: "Services", path: "/services" },
  { id: "contact", label: "Contact", path: "/contact" },
];

<BfDsList>
  {navigationItems.map((item) => (
    <BfDsListItem
      key={item.id}
      active={currentPath === item.path}
      onClick={() => navigateTo(item.path)}
    >
      {item.label}
    </BfDsListItem>
  ))}
</BfDsList>;
```

### FAQ Section

```tsx
<BfDsList accordion>
  <BfDsListItem
    expandContents={
      <div style={{ padding: "16px", backgroundColor: "#f8f9fa" }}>
        <p>
          <strong>Answer:</strong>{" "}
          You can reset your password by clicking the "Forgot Password" link on
          the login page.
        </p>
        <div style={{ marginTop: "12px" }}>
          <a href="/forgot-password">Go to Password Reset</a>
        </div>
      </div>
    }
  >
    How do I reset my password?
  </BfDsListItem>
  <BfDsListItem
    expandContents={
      <div style={{ padding: "16px", backgroundColor: "#f8f9fa" }}>
        <p>
          <strong>Answer:</strong> You can contact support through:
        </p>
        <ul>
          <li>Email: support@example.com</li>
          <li>Phone: 1-800-SUPPORT</li>
          <li>Live chat (bottom right corner)</li>
        </ul>
      </div>
    }
  >
    How can I contact support?
  </BfDsListItem>
</BfDsList>;
```

### Settings Categories

```tsx
<BfDsList accordion>
  <BfDsListItem
    expandContents={
      <div style={{ padding: "16px" }}>
        <div style={{ marginBottom: "16px" }}>
          <label>
            <input type="text" placeholder="Display Name" />
          </label>
        </div>
        <div style={{ marginBottom: "16px" }}>
          <label>
            <input type="email" placeholder="Email Address" />
          </label>
        </div>
        <button>Save Profile</button>
      </div>
    }
  >
    Profile Settings
  </BfDsListItem>
  <BfDsListItem
    expandContents={
      <div style={{ padding: "16px" }}>
        <label style={{ display: "block", marginBottom: "12px" }}>
          <input type="checkbox" /> Email notifications
        </label>
        <label style={{ display: "block", marginBottom: "12px" }}>
          <input type="checkbox" /> Push notifications
        </label>
        <label style={{ display: "block", marginBottom: "12px" }}>
          <input type="checkbox" /> SMS alerts
        </label>
        <button>Save Preferences</button>
      </div>
    }
  >
    Notification Preferences
  </BfDsListItem>
</BfDsList>;
```

### Action List

```tsx
<BfDsList>
  <BfDsListItem onClick={() => handleAction("save")}>
    💾 Save Changes
  </BfDsListItem>
  <BfDsListItem onClick={() => handleAction("export")}>
    📁 Export Data
  </BfDsListItem>
  <BfDsListItem onClick={() => handleAction("print")}>
    🖨️ Print Report
  </BfDsListItem>
  <BfDsListItem
    onClick={() => handleAction("delete")}
    style={{ color: "var(--bfds-danger)" }}
  >
    🗑️ Delete Project
  </BfDsListItem>
</BfDsList>;
```

## Context Integration

BfDsListItem automatically integrates with BfDsList context:

- **Accordion Mode**: Participates in single-item expansion logic
- **Index Tracking**: Automatically determines its position in the list
- **State Management**: Coordinates expansion state with parent list

## Accessibility

### Keyboard Support

- **Tab Navigation**: Focuses interactive items
- **Enter/Space**: Activates clickable items or toggles expansion
- **Arrow Keys**: Navigate between items (when in a list context)

### Screen Reader Support

- **Semantic HTML**: Uses appropriate `<li>` and `<button>` elements
- **ARIA Attributes**: Proper roles and states for expandable items
- **Focus Management**: Clear focus indicators and logical tab order

### Expandable Content

- **ARIA Expanded**: Indicates expansion state to screen readers
- **Accessible Labels**: Clear labels for expand/collapse actions
- **Content Association**: Properly associates expanded content with trigger

## Styling Notes

BfDsListItem uses CSS classes with the `bfds-list-item` prefix:

- `.bfds-list-item` - Base item styles
- `.bfds-list-item--active` - Active state styling
- `.bfds-list-item--disabled` - Disabled state styling
- `.bfds-list-item--clickable` - Clickable item styling
- `.bfds-list-item--expandable` - Expandable item styling
- `.bfds-list-item--expanded` - Expanded state styling
- `.bfds-list-item--has-separate-expand` - Items with both click and expand
- `.bfds-list-item__content` - Main content container
- `.bfds-list-item__main` - Primary content area
- `.bfds-list-item__icon` - Expansion icon container
- `.bfds-list-item__button` - Button wrapper for interactive items
- `.bfds-list-item__expand-button` - Separate expand button
- `.bfds-list-item__expanded-content` - Expanded content container

## Integration with BfDsList

BfDsListItem works seamlessly with its parent BfDsList:

### Context Awareness

- Automatically detects if it's inside an accordion list
- Manages expansion state according to list mode
- Coordinates with siblings for proper behavior

### State Management

- **Independent Mode**: Manages own expansion state
- **Accordion Mode**: Uses shared state from list context
- **Focus Management**: Proper keyboard navigation within list

### Event Handling

- Click events are properly contained
- Expansion toggles work correctly in both modes
- Multiple interaction types are supported simultaneously

## Best Practices

### Content Organization

- Keep item content concise for better scannability
- Use expandable content for detailed or secondary information
- Place primary actions on the item itself, secondary actions in expanded
  content

### Interaction Design

- Use active states to show current selection
- Disable items that are temporarily unavailable
- Provide clear visual feedback for all interactions

### Accessibility

- Ensure all interactive elements are keyboard accessible
- Use descriptive text that makes sense to screen readers
- Test navigation flow with keyboard-only interaction
