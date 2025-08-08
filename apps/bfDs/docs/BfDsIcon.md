# BfDsIcon

A flexible icon component that renders SVG icons from the BfDs icon library with
support for multiple sizes, colors, and aliases.

## Props

```typescript
export type BfDsIconProps = {
  /** Name of the icon to display */
  name: BfDsIconName;
  /** Size variant for icon (predefined string or number in pixels) */
  size?: BfDsIconSize;
  /** Custom color override */
  color?: string;
  /** Additional CSS classes */
  className?: string;
} & Omit<React.SVGProps<SVGSVGElement>, "children">;

export type BfDsIconName = BaseIconNames | AliasNames; // Union of all available icon names and their aliases
export type BfDsIconSize = "small" | "medium" | "large" | "xlarge" | number;
```

## Basic Usage

```tsx
import { BfDsIcon } from "@bfmono/bfDs";

// Simple icon
<BfDsIcon name="star" />

// With custom size and color
<BfDsIcon 
  name="checkCircle" 
  size="large" 
  color="var(--bfds-success)" 
/>
```

## Sizes

BfDsIcon supports both predefined size names and custom numeric values:

### Predefined Sizes

```tsx
<BfDsIcon name="star" size="small" />    {/* 16px */}
<BfDsIcon name="star" size="medium" />   {/* 24px (default) */}
<BfDsIcon name="star" size="large" />    {/* 32px */}
<BfDsIcon name="star" size="xlarge" />   {/* 48px */}
```

### Custom Numeric Sizes

```tsx
<BfDsIcon name="star" size={20} />       {/* 20px */}
<BfDsIcon name="star" size={64} />       {/* 64px */}
<BfDsIcon name="star" size={128} />      {/* 128px */}
```

## Colors

Icons inherit the current text color by default but can be customized:

```tsx
{/* Inherit current color (default) */}
<BfDsIcon name="star" />

{/* CSS custom properties */}
<BfDsIcon name="star" color="var(--bfds-primary)" />
<BfDsIcon name="star" color="var(--bfds-success)" />
<BfDsIcon name="star" color="var(--bfds-error)" />

{/* Direct color values */}
<BfDsIcon name="star" color="#ff4444" />
<BfDsIcon name="star" color="blue" />
<BfDsIcon name="star" color="rgb(255, 0, 128)" />
```

## Available Icons

The BfDs icon library includes a comprehensive set of icons organized by
category:

### Navigation & Interface

```tsx
<BfDsIcon name="arrowLeft" />      {/* Also: chevronLeft */}
<BfDsIcon name="arrowRight" />     {/* Also: chevronRight */}
<BfDsIcon name="arrowUp" />        {/* Also: chevronUp */}
<BfDsIcon name="arrowDown" />      {/* Also: chevronDown */}
<BfDsIcon name="back" />
<BfDsIcon name="menu" />           {/* Also: burgerMenu */}
<BfDsIcon name="cross" />          {/* Also: close, x */}
<BfDsIcon name="home" />
```

### Actions & Controls

```tsx
<BfDsIcon name="play" />
<BfDsIcon name="pause" />
<BfDsIcon name="check" />
<BfDsIcon name="checkCircle" />
<BfDsIcon name="copy" />
<BfDsIcon name="download" />
<BfDsIcon name="maximize" />
<BfDsIcon name="minimize" />
<BfDsIcon name="settings" />       {/* Also: gear, cog */}
```

### Status & Feedback

```tsx
<BfDsIcon name="infoCircle" />     {/* Also: info */}
<BfDsIcon name="exclamationCircle" />
<BfDsIcon name="exclamationTriangle" />
<BfDsIcon name="exclamationStop" />
<BfDsIcon name="checkCircleSolid" />
<BfDsIcon name="star" />
<BfDsIcon name="flag" />
```

### Content & Communication

```tsx
<BfDsIcon name="comment" />
<BfDsIcon name="chat" />
<BfDsIcon name="note" />
<BfDsIcon name="pencil" />         {/* Also: edit */}
<BfDsIcon name="trash" />          {/* Also: delete */}
<BfDsIcon name="clipboard" />
<BfDsIcon name="code" />
```

### Brands & External

```tsx
<BfDsIcon name="brand-github" />   {/* Also: github */}
<BfDsIcon name="brand-google" />   {/* Also: google */}
<BfDsIcon name="brand-openai" />
<BfDsIcon name="sparkle" />        {/* AI/generation indicator */}
```

_Note: The complete icon library includes 50+ icons. Use the interactive icon
explorer in the component examples to browse all available icons._

## Icon Aliases

Many icons have aliases for convenience and compatibility:

```tsx
{/* These are equivalent */}
<BfDsIcon name="arrowRight" />
<BfDsIcon name="chevronRight" />

{/* These are equivalent */}
<BfDsIcon name="settings" />
<BfDsIcon name="gear" />
<BfDsIcon name="cog" />

{/* These are equivalent */}
<BfDsIcon name="cross" />
<BfDsIcon name="close" />
<BfDsIcon name="x" />
```

## Integration with Other Components

BfDsIcon is used throughout the BfDs component library:

### With Buttons

```tsx
<BfDsButton icon="arrowRight">Next</BfDsButton>
<BfDsButton icon="settings" iconOnly />
```

### With Badges

```tsx
<BfDsBadge icon="checkCircle" variant="success">
  Approved
</BfDsBadge>;
```

### With Callouts

```tsx
{/* Icons are automatically selected based on variant */}
<BfDsCallout variant="success">Success message</BfDsCallout>
<BfDsCallout variant="error">Error message</BfDsCallout>
```

## Advanced Usage

### Custom Styling

```tsx
<BfDsIcon
  name="star"
  size={32}
  className="custom-icon"
  style={{
    filter: "drop-shadow(2px 2px 4px rgba(0,0,0,0.3))",
    transition: "transform 0.2s ease",
  }}
/>;
```

### Conditional Icons

```tsx
const StatusIcon = ({ status }) => (
  <BfDsIcon
    name={status === "success" ? "checkCircle" : "exclamationTriangle"}
    color={status === "success" ? "var(--bfds-success)" : "var(--bfds-warning)"}
    size="large"
  />
);
```

### Icon Grids

```tsx
const iconList = ["star", "heart", "flag", "home"];

<div className="icon-grid">
  {iconList.map((iconName) => (
    <BfDsIcon key={iconName} name={iconName} size="medium" />
  ))}
</div>;
```

## Error Handling

BfDsIcon includes robust error handling:

- **Missing icons** return `null` and log an error to console
- **Invalid sizes** fall back to medium size
- **Malformed colors** fall back to `currentColor`

```tsx
{/* These will handle errors gracefully */}
<BfDsIcon name="nonexistent-icon" />     {/* Returns null, logs error */}
<BfDsIcon name="star" color="invalid" /> {/* Falls back to currentColor */}
```

## Generated Icons

Some icons in the library are AI-generated and marked with the `generated: true`
flag. These icons:

- Show a sparkle badge in the icon explorer
- Are created to fill gaps in the icon set
- Maintain consistency with the overall design system

## Best Practices

### Semantic Usage

- Choose icons that clearly represent their function
- Use consistent icons for similar actions across your app
- Consider cultural context for international applications

### Size Guidelines

- Use `small` (16px) for inline text and compact interfaces
- Use `medium` (24px) for standard UI elements and buttons
- Use `large` (32px) for prominent actions and headers
- Use custom numeric sizes sparingly and consistently

### Color Guidelines

- Default to `currentColor` to inherit text color
- Use semantic colors (`--bfds-success`, `--bfds-error`) for status
- Ensure sufficient contrast for accessibility
- Test colors in both light and dark themes

### Performance

- Icons are lightweight SVG components with minimal overhead
- The icon library is tree-shakeable - unused icons won't increase bundle size
- Consider grouping related icons to minimize prop drilling

## Accessibility

BfDsIcon is designed with accessibility in mind:

- **Screen readers** - Icons are decorative by default (no alt text needed)
- **High contrast** - SVG icons scale perfectly and respect system contrast
  settings
- **Focus indicators** - When used in interactive components, inherits proper
  focus styling
- **Color independence** - Icons should work without color alone conveying
  meaning

For interactive icons, wrap in appropriate semantic elements:

```tsx
{/* Good: Semantic button with icon */}
<button aria-label="Save document">
  <BfDsIcon name="save" />
</button>;

{/* Better: Use BfDsButton component */}
<BfDsButton icon="save" iconOnly aria-label="Save document" />;
```

## Styling Notes

BfDsIcon renders as an SVG element with CSS classes:

- `.bfds-icon` - Base icon styles
- `.bfds-icon--{size}` - Size-specific styles (for predefined sizes)

The component automatically handles:

- ViewBox and path rendering from the icon library
- Size calculations for both named and numeric sizes
- Color inheritance and overrides
- Error states and fallbacks
