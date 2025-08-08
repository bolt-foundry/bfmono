# BfDsCopyButton

A specialized button component for copying text to the clipboard with visual
feedback. Built on top of BfDsButton with automatic state management and
accessibility features.

## Props

```typescript
export type BfDsCopyButtonProps = {
  /** Text to copy to clipboard (required) */
  textToCopy: string;
  /** Button text when not copied */
  buttonText?: string;
  /** Button text when copied */
  copiedText?: string;
  /** Duration in ms to show copied state */
  copiedDuration?: number;
} & Omit<BfDsButtonProps, "onClick" | "children">;
```

## Basic Usage

```tsx
import { BfDsCopyButton } from "@bfmono/bfDs";

// Simple copy button (icon only)
<BfDsCopyButton textToCopy="npm install @bolt-foundry/bolt-foundry" />

// With custom labels
<BfDsCopyButton
  textToCopy="Hello World!"
  buttonText="Copy Text"
  copiedText="Copied!"
  iconOnly={false}
/>
```

## Default Behavior

BfDsCopyButton comes with sensible defaults:

- **Variant**: `outline` - subtle styling that works in most contexts
- **Icon**: `clipboard` when not copied, `clipboardCheck` when copied
- **Icon Only**: `true` - shows only the icon by default
- **Button Text**: `"Copy"` when not copied, `"Copied!"` when copied
- **Copied Duration**: `1000ms` (1 second)

## Visual States

### Default State

Shows clipboard icon with outline button styling.

### Copied State

- Changes to **primary variant** for emphasis
- Shows **clipboardCheck icon** for visual confirmation
- Displays for the specified duration (default 1 second)
- Automatically reverts to default state

## Copy Functionality

```tsx
// Copy command line instructions
<BfDsCopyButton textToCopy="aibff calibrate grader.deck.md" />

// Copy API endpoints
<BfDsCopyButton textToCopy="https://api.example.com/v1/users" />

// Copy code snippets
<BfDsCopyButton textToCopy={`
const user = {
  name: "John Doe",
  email: "john@example.com"
};
`} />
```

## Button Variants

Use different BfDsButton variants for various contexts:

```tsx
<BfDsCopyButton textToCopy="text" variant="primary" />
<BfDsCopyButton textToCopy="text" variant="secondary" />
<BfDsCopyButton textToCopy="text" variant="outline" />
<BfDsCopyButton textToCopy="text" variant="ghost" />
```

## Sizes

```tsx
<BfDsCopyButton textToCopy="text" size="small" />
<BfDsCopyButton textToCopy="text" size="medium" />
<BfDsCopyButton textToCopy="text" size="large" />
```

## Text Labels

Show text alongside the icon:

```tsx
<BfDsCopyButton
  textToCopy="npm install react"
  iconOnly={false}
  buttonText="Copy Command"
  copiedText="Command Copied!"
/>;
```

## Custom Duration

Control how long the copied state is visible:

```tsx
// Quick feedback (500ms)
<BfDsCopyButton
  textToCopy="text"
  copiedDuration={500}
/>

// Extended feedback (3 seconds)
<BfDsCopyButton
  textToCopy="text"
  copiedDuration={3000}
/>
```

## Common Use Cases

### Code Block Integration

Perfect for adding copy functionality to code blocks:

```tsx
<div className="code-block">
  <code>aibff calibrate grader.deck.md</code>
  <BfDsCopyButton
    textToCopy="aibff calibrate grader.deck.md"
    aria-label="Copy command"
  />
</div>;
```

### API Documentation

Copy endpoints and examples:

```tsx
<BfDsCopyButton
  textToCopy="GET /api/v1/users"
  buttonText="Copy"
  aria-label="Copy API endpoint"
/>;
```

### Configuration Values

Copy configuration strings, tokens, or IDs:

```tsx
<BfDsCopyButton
  textToCopy="sk_test_123456789"
  variant="ghost"
  size="small"
  aria-label="Copy API key"
/>;
```

### Multi-line Content

Works with complex multi-line text:

```tsx
<BfDsCopyButton
  textToCopy={`{
  "name": "Example Project",
  "version": "1.0.0",
  "dependencies": {
    "react": "^18.0.0"
  }
}`}
  buttonText="Copy JSON"
/>;
```

## Accessibility

BfDsCopyButton includes built-in accessibility features:

- **ARIA Labels**: Always provide `aria-label` for icon-only buttons
- **Visual Feedback**: Clear state changes provide confirmation
- **Keyboard Support**: Full keyboard navigation support
- **Screen Readers**: Proper semantic HTML and ARIA attributes

### Best Practices

```tsx
// Good: Descriptive aria-label
<BfDsCopyButton
  textToCopy="npm install package"
  aria-label="Copy npm install command"
/>

// Good: Clear button text when not icon-only
<BfDsCopyButton
  textToCopy="config value"
  iconOnly={false}
  buttonText="Copy Configuration"
/>
```

## Integration Examples

### In Lists

```tsx
<div className="command-list">
  {commands.map((cmd) => (
    <div key={cmd.id} className="command-item">
      <code>{cmd.command}</code>
      <BfDsCopyButton
        textToCopy={cmd.command}
        aria-label={`Copy ${cmd.name}`}
      />
    </div>
  ))}
</div>;
```

### In Cards

```tsx
<div className="api-card">
  <h3>User Endpoint</h3>
  <p>GET /api/users/{id}</p>
  <BfDsCopyButton
    textToCopy="GET /api/users/{id}"
    variant="ghost"
    size="small"
  />
</div>;
```

### In Documentation

```tsx
<div className="doc-example">
  <h4>Installation</h4>
  <div className="code-snippet">
    <pre><code>npm install @bolt-foundry/core</code></pre>
    <BfDsCopyButton
      textToCopy="npm install @bolt-foundry/core"
      aria-label="Copy installation command"
    />
  </div>
</div>;
```

## Error Handling

The component gracefully handles copy failures:

- Uses the `useCopyToClipboard` hook for robust clipboard operations
- Only shows success state when copy actually succeeds
- Silently handles failures without breaking the interface

## Form Integration

While not typically used in forms, BfDsCopyButton can complement form fields:

```tsx
<div className="form-field">
  <label>API Key</label>
  <div className="input-with-copy">
    <input value={apiKey} readOnly />
    <BfDsCopyButton
      textToCopy={apiKey}
      variant="outline"
      size="small"
    />
  </div>
</div>;
```

## Styling Notes

BfDsCopyButton inherits all BfDsButton styling capabilities:

- Uses the same CSS classes as BfDsButton
- Supports all BfDsButton variants and sizes
- Icon sizing automatically matches button size
- State transitions are smooth and consistent

The component automatically handles:

- Icon switching between clipboard and clipboardCheck
- Variant switching to primary during copied state
- Timing management for state transitions
