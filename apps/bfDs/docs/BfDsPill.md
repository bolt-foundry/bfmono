# BfDsPill

A compact pill-shaped component for displaying labels, tags, counts, and status
indicators. Features multiple color variants, optional icons, and action
elements for versatile content labeling.

## Props

```typescript
export type BfDsPillVariant =
  | "primary"
  | "secondary"
  | "success"
  | "error"
  | "warning"
  | "info";

export type BfDsPillProps = {
  /** Label text for the pill */
  label?: string;
  /** Main content text or number */
  text?: string | number;
  /** Icon name to display */
  icon?: BfDsIconName;
  /** Visual variant for the pill */
  variant?: BfDsPillVariant;
  /** Additional action element (e.g., button) */
  action?: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
};
```

## Basic Usage

```tsx
import { BfDsPill } from "@bfmono/bfDs";

// Simple text pill
<BfDsPill text="New" />

// Pill with label
<BfDsPill label="Status" text="Active" />

// Count pill
<BfDsPill text={42} variant="primary" />

// Icon pill
<BfDsPill icon="checkCircle" variant="success" />
```

## Variants

BfDsPill supports six color variants:

```tsx
<BfDsPill text="Primary" variant="primary" />
<BfDsPill text="Secondary" variant="secondary" />
<BfDsPill text="Success" variant="success" />
<BfDsPill text="Error" variant="error" />
<BfDsPill text="Warning" variant="warning" />
<BfDsPill text="Info" variant="info" />
```

## Content Types

### Text Only

```tsx
<BfDsPill text="Badge" />
<BfDsPill text="Label" variant="primary" />
```

### Numbers and Counts

```tsx
<BfDsPill text={5} variant="error" />
<BfDsPill text={23} variant="success" />
<BfDsPill text="99+" variant="warning" />
```

### With Icons

```tsx
<BfDsPill icon="star" variant="warning" />
<BfDsPill icon="checkCircle" text="Verified" variant="success" />
<BfDsPill icon="alertTriangle" text="Warning" variant="warning" />
```

### Label and Content

```tsx
<BfDsPill label="Version" text="v2.1.0" />
<BfDsPill label="Priority" text="High" variant="error" />
<BfDsPill label="Category" text="Design" variant="info" />
```

### With Actions

```tsx
import { BfDsButton } from "@bfmono/bfDs";

<BfDsPill 
  label="Filter"
  text="JavaScript"
  action={<BfDsButton size="small" variant="ghost" icon="x" iconOnly />}
/>

<BfDsPill 
  text="Removable Tag"
  variant="secondary"
  action={<button onClick={handleRemove}>×</button>}
/>
```

## Common Use Cases

### Status Indicators

```tsx
<div className="status-pills">
  <BfDsPill text="Online" variant="success" icon="circle" />
  <BfDsPill text="Offline" variant="error" icon="circle" />
  <BfDsPill text="Pending" variant="warning" icon="clock" />
  <BfDsPill text="Processing" variant="info" icon="refresh" />
</div>;
```

### Notification Badges

```tsx
<div className="nav-item">
  <span>Messages</span>
  <BfDsPill text={12} variant="error" />
</div>

<div className="nav-item">
  <span>Notifications</span>
  <BfDsPill text="New" variant="primary" />
</div>
```

### Tags and Categories

```tsx
<div className="content-tags">
  <BfDsPill text="React" variant="info" />
  <BfDsPill text="TypeScript" variant="info" />
  <BfDsPill text="Design System" variant="info" />
</div>

<div className="blog-post">
  <h2>Post Title</h2>
  <div className="tags">
    <BfDsPill text="Tutorial" variant="success" />
    <BfDsPill text="Beginner" variant="secondary" />
    <BfDsPill text="Web Development" variant="primary" />
  </div>
</div>
```

### User Roles and Permissions

```tsx
<div className="user-card">
  <h3>John Doe</h3>
  <div className="user-roles">
    <BfDsPill text="Admin" variant="error" icon="shield" />
    <BfDsPill text="Premium" variant="warning" icon="star" />
  </div>
</div>

<div className="member-list">
  {members.map(member => (
    <div key={member.id} className="member">
      <span>{member.name}</span>
      <BfDsPill 
        text={member.role} 
        variant={getRoleVariant(member.role)} 
      />
    </div>
  ))}
</div>
```

### Filter Tags

```tsx
const [activeFilters, setActiveFilters] = useState(["JavaScript", "React"]);

<div className="filter-pills">
  {activeFilters.map((filter) => (
    <BfDsPill
      key={filter}
      text={filter}
      variant="primary"
      action={
        <button
          onClick={() => removeFilter(filter)}
          className="remove-filter"
        >
          ×
        </button>
      }
    />
  ))}
</div>;
```

### Product Labels

```tsx
<div className="product-card">
  <div className="product-badges">
    <BfDsPill text="Sale" variant="error" />
    <BfDsPill text="Free Shipping" variant="success" />
    <BfDsPill text="Limited Edition" variant="warning" />
  </div>

  <h3>Product Name</h3>
  <p>Product description...</p>
</div>;
```

### Version and Build Info

```tsx
<div className="app-info">
  <BfDsPill label="Version" text="v1.2.3" variant="info" />
  <BfDsPill label="Build" text="456" variant="secondary" />
  <BfDsPill label="Environment" text="Production" variant="success" />
</div>;
```

### Progress and Metrics

```tsx
<div className="metrics-dashboard">
  <BfDsPill label="Uptime" text="99.9%" variant="success" />
  <BfDsPill label="Load Time" text="1.2s" variant="info" />
  <BfDsPill label="Users" text="1,234" variant="primary" />
  <BfDsPill label="Errors" text={3} variant="warning" />
</div>;
```

### Interactive Elements

```tsx
const [selectedTags, setSelectedTags] = useState([]);

const toggleTag = (tag) => {
  setSelectedTags((prev) =>
    prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
  );
};

<div className="tag-selector">
  {availableTags.map((tag) => (
    <button
      key={tag}
      onClick={() => toggleTag(tag)}
      className="tag-button"
    >
      <BfDsPill
        text={tag}
        variant={selectedTags.includes(tag) ? "primary" : "secondary"}
        icon={selectedTags.includes(tag) ? "checkCircle" : undefined}
      />
    </button>
  ))}
</div>;
```

## Accessibility

BfDsPill components include basic accessibility considerations:

- **Color not sole indicator** - Uses text and icons alongside color variants
- **Readable text** - Ensures sufficient contrast in all variants
- **Semantic content** - Uses meaningful text labels
- **Interactive elements** - Action buttons maintain proper focus handling

### Best Practices

- Use descriptive text that doesn't rely solely on color
- Ensure action elements are keyboard accessible
- Provide alternative text context when using icon-only pills
- Use consistent variants for similar types of information
- Consider screen reader users when designing pill layouts

## Styling Notes

BfDsPill uses CSS classes with the `bfds-pill` prefix:

- `.bfds-pill` - Base pill container
- `.bfds-pill--{variant}` - Variant-specific coloring
- `.bfds-pill--label-only` - When only label is provided
- `.bfds-pill__label` - Label text styling
- `.bfds-pill__content` - Main content area
- `.bfds-pill__label--no-content` - Label-only styling

The component automatically:

- Adjusts layout based on content type (label, text, icon, action)
- Applies appropriate spacing between elements
- Uses variant colors for background and text
- Scales icons appropriately within the pill
- Handles overflow for long text content
