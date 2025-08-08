# BfDsList

A container component for organizing and displaying list items with optional
accordion behavior. Works in conjunction with BfDsListItem to create structured,
interactive lists.

## Props

```typescript
export type BfDsListProps = {
  /** List items (typically BfDsListItem components) */
  children: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
  /** When true, only one item can be expanded at a time */
  accordion?: boolean;
  /** Optional header text to display above the list */
  header?: string;
};
```

## Context Interface

BfDsList provides context to child components:

```typescript
type BfDsListContextType = {
  accordion: boolean;
  expandedIndex: number | null;
  setExpandedIndex: (index: number | null) => void;
  getItemIndex: (ref: React.RefObject<HTMLElement | null>) => number | null;
};
```

## Basic Usage

```tsx
import { BfDsList, BfDsListItem } from "@bfmono/bfDs";

// Simple list
<BfDsList>
  <BfDsListItem>Home</BfDsListItem>
  <BfDsListItem>About</BfDsListItem>
  <BfDsListItem>Services</BfDsListItem>
  <BfDsListItem>Contact</BfDsListItem>
</BfDsList>

// With header
<BfDsList header="Navigation Menu">
  <BfDsListItem>Dashboard</BfDsListItem>
  <BfDsListItem>Projects</BfDsListItem>
  <BfDsListItem>Settings</BfDsListItem>
</BfDsList>
```

## Accordion Behavior

When `accordion={true}`, only one list item can be expanded at a time:

```tsx
<BfDsList accordion>
  <BfDsListItem
    expandContents={
      <div>
        <p>This is section 1 content.</p>
      </div>
    }
  >
    Section 1
  </BfDsListItem>
  <BfDsListItem
    expandContents={
      <div>
        <p>This is section 2 content.</p>
      </div>
    }
  >
    Section 2
  </BfDsListItem>
</BfDsList>;
```

## Independent Expansion

Without accordion mode, multiple items can be expanded simultaneously:

```tsx
<BfDsList>
  <BfDsListItem
    expandContents={
      <div>
        <p>
          Independent expansion - this can be open while others are also open.
        </p>
      </div>
    }
  >
    Expandable Item 1
  </BfDsListItem>
  <BfDsListItem
    expandContents={
      <div>
        <p>This item expands independently too.</p>
      </div>
    }
  >
    Expandable Item 2
  </BfDsListItem>
</BfDsList>;
```

## Navigation Lists

Create navigation interfaces with active states:

```tsx
<BfDsList header="Main Navigation">
  <BfDsListItem active>Dashboard</BfDsListItem>
  <BfDsListItem onClick={() => navigateTo("/projects")}>
    Projects
  </BfDsListItem>
  <BfDsListItem onClick={() => navigateTo("/team")}>
    Team
  </BfDsListItem>
  <BfDsListItem disabled>Settings</BfDsListItem>
</BfDsList>;
```

## Interactive Lists

Lists with clickable items and actions:

```tsx
<BfDsList header="Actions">
  <BfDsListItem
    onClick={() => handleAction("save")}
  >
    Save Changes
  </BfDsListItem>
  <BfDsListItem
    onClick={() => handleAction("export")}
  >
    Export Data
  </BfDsListItem>
  <BfDsListItem
    onClick={() => handleAction("delete")}
  >
    Delete Project
  </BfDsListItem>
</BfDsList>;
```

## Complex Expandable Content

Lists can contain rich, interactive content when expanded:

```tsx
<BfDsList accordion header="FAQ">
  <BfDsListItem
    expandContents={
      <div style={{ padding: "16px" }}>
        <p>
          <strong>Answer:</strong>{" "}
          You can create a new project by clicking the "New Project" button in
          the dashboard.
        </p>
        <div style={{ marginTop: "12px" }}>
          <button>Helpful</button>
          <button>Not helpful</button>
        </div>
      </div>
    }
  >
    How do I create a new project?
  </BfDsListItem>
  <BfDsListItem
    expandContents={
      <div style={{ padding: "16px" }}>
        <p>
          <strong>Answer:</strong>{" "}
          You can invite team members from the Team settings page.
        </p>
        <ul>
          <li>Go to Team settings</li>
          <li>Click "Invite Member"</li>
          <li>Enter their email address</li>
        </ul>
      </div>
    }
  >
    How do I add team members?
  </BfDsListItem>
</BfDsList>;
```

## Custom Styling

Apply custom styles with className:

```tsx
<BfDsList className="custom-list-styles">
  <BfDsListItem>Custom styled item 1</BfDsListItem>
  <BfDsListItem>Custom styled item 2</BfDsListItem>
</BfDsList>;
```

## Common Use Cases

### Documentation Navigation

```tsx
<BfDsList accordion header="Documentation">
  <BfDsListItem
    expandContents={
      <div>
        <h4>Getting Started Guide</h4>
        <p>Learn the basics of using the platform.</p>
        <button>Read Guide</button>
      </div>
    }
  >
    Getting Started
  </BfDsListItem>
  <BfDsListItem
    expandContents={
      <div>
        <h4>API Documentation</h4>
        <p>Complete reference for all API endpoints.</p>
        <button>View API Docs</button>
      </div>
    }
  >
    API Reference
  </BfDsListItem>
</BfDsList>;
```

### Settings Sections

```tsx
<BfDsList accordion header="Account Settings">
  <BfDsListItem
    expandContents={
      <div>
        <label>Display Name</label>
        <input type="text" defaultValue="John Doe" />
        <label>Email</label>
        <input type="email" defaultValue="john@example.com" />
        <button>Save Profile</button>
      </div>
    }
  >
    Profile Settings
  </BfDsListItem>
  <BfDsListItem
    expandContents={
      <div>
        <label>
          <input type="checkbox" /> Email notifications
        </label>
        <label>
          <input type="checkbox" /> Push notifications
        </label>
        <button>Save Preferences</button>
      </div>
    }
  >
    Notification Preferences
  </BfDsListItem>
</BfDsList>;
```

### Project Organization

```tsx
<BfDsList header="Projects">
  <BfDsListItem
    expandContents={
      <div>
        <p>Status: Active</p>
        <p>Last updated: 2 hours ago</p>
        <div>
          <button>Open</button>
          <button>Edit</button>
          <button>Archive</button>
        </div>
      </div>
    }
  >
    Website Redesign
  </BfDsListItem>
  <BfDsListItem
    expandContents={
      <div>
        <p>Status: In Progress</p>
        <p>Last updated: 1 day ago</p>
        <div>
          <button>Open</button>
          <button>Edit</button>
          <button>Archive</button>
        </div>
      </div>
    }
  >
    Mobile App Development
  </BfDsListItem>
</BfDsList>;
```

## Context Usage

Access list context in custom components:

```tsx
import { useBfDsList } from "@bfmono/bfDs";

function CustomListItem() {
  const listContext = useBfDsList();

  if (!listContext) {
    // Not inside a BfDsList
    return null;
  }

  const { accordion, expandedIndex } = listContext;

  return (
    <div>
      {accordion ? "Accordion mode" : "Independent mode"}
      {expandedIndex !== null && `Item ${expandedIndex} is expanded`}
    </div>
  );
}
```

## Accessibility

BfDsList provides accessibility features:

- **Semantic HTML**: Uses proper `<ul>` and `<li>` elements
- **ARIA Support**: Proper roles and states for interactive elements
- **Keyboard Navigation**: Full keyboard support through child components
- **Screen Reader Support**: Clear structure and labeling

### Best Practices

- Use descriptive headers to provide context
- Ensure list items have clear, actionable text
- Provide adequate spacing for touch interactions
- Test keyboard navigation through all items
- Use appropriate ARIA labels for complex interactions

## Styling Notes

BfDsList uses CSS classes with the `bfds-list` prefix:

- `.bfds-list` - Base list container styles
- `.bfds-list--accordion` - Accordion mode modifier
- `.bfds-list-header` - Optional header styling

The component:

- Renders as a semantic `<ul>` element
- Provides context for child BfDsListItem components
- Manages expansion state in accordion mode
- Automatically handles item indexing for context

## Integration with BfDsListItem

BfDsList works seamlessly with BfDsListItem:

- **Context Sharing**: Passes accordion state and controls to children
- **Index Management**: Automatically tracks item positions
- **State Coordination**: Manages expansion state across items
- **Event Handling**: Coordinates interactions between items

The list context ensures that:

- Accordion behavior works correctly
- Item indices are accurate
- Expansion states are properly managed
- Child components receive necessary context
