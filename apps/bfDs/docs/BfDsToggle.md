# BfDsToggle

A toggle switch component for binary on/off selections. Features size variants,
form integration, and full keyboard accessibility. The toggle provides an
alternative to checkboxes for boolean states with a more modern switch-like
interface.

## Props

```typescript
export type BfDsToggleSize = "small" | "medium" | "large";

export type BfDsToggleProps = {
  // Form context props
  /** Form field name for data binding */
  name?: string;

  // Standalone props
  /** Whether the toggle is on/off (controlled) */
  checked?: boolean;
  /** Default checked state for uncontrolled usage */
  defaultChecked?: boolean;
  /** Callback when toggle state changes */
  onChange?: (checked: boolean) => void;

  // Common props
  /** Label text displayed next to toggle */
  label?: string;
  /** Disables component */
  disabled?: boolean;
  /** Size variant for toggle switch */
  size?: BfDsToggleSize;
  /** Additional CSS classes */
  className?: string;
  /** Element ID */
  id?: string;
};
```

## Basic Usage

```tsx
import { BfDsToggle } from "@bfmono/bfDs";

// Simple toggle
<BfDsToggle 
  label="Enable notifications"
  checked={isEnabled}
  onChange={setIsEnabled}
/>

// With form binding
<BfDsToggle 
  name="darkMode"
  label="Dark Mode"
/>
```

## Controlled vs Uncontrolled

### Controlled Component

```tsx
const [darkMode, setDarkMode] = useState(false);

<BfDsToggle
  label="Dark Mode"
  checked={darkMode}
  onChange={setDarkMode}
/>;
```

### Uncontrolled Component

```tsx
<BfDsToggle
  label="Remember Settings"
  defaultChecked={true}
/>;
```

## Form Integration

```tsx
const [settings, setSettings] = useState({
  notifications: false,
  darkMode: true,
  autoSave: false,
});

<BfDsForm
  initialData={settings}
  onSubmit={handleSubmit}
  onChange={setSettings}
>
  <BfDsToggle
    name="notifications"
    label="Enable Notifications"
  />

  <BfDsToggle
    name="darkMode"
    label="Dark Mode"
  />

  <BfDsToggle
    name="autoSave"
    label="Auto-save Changes"
  />

  <BfDsFormSubmitButton text="Save Settings" />
</BfDsForm>;
```

## Size Variants

```tsx
<BfDsToggle
  label="Small Toggle"
  size="small"
  defaultChecked
/>

<BfDsToggle
  label="Medium Toggle"
  size="medium"
  defaultChecked
/>

<BfDsToggle
  label="Large Toggle"
  size="large"
  defaultChecked
/>
```

## States

```tsx
// Normal state
<BfDsToggle label="Normal" defaultChecked />

// Disabled state
<BfDsToggle label="Disabled" disabled defaultChecked />
```

## Common Use Cases

### Settings Panel

```tsx
<div className="settings-panel">
  <h3>Preferences</h3>

  <BfDsToggle
    name="emailNotifications"
    label="Email Notifications"
    defaultChecked
  />

  <BfDsToggle
    name="pushNotifications"
    label="Push Notifications"
    defaultChecked={false}
  />

  <BfDsToggle
    name="marketingEmails"
    label="Marketing Emails"
    defaultChecked={false}
  />
</div>;
```

### Feature Flags

```tsx
<div className="feature-toggles">
  <BfDsToggle
    label="Beta Features"
    checked={betaEnabled}
    onChange={setBetaEnabled}
  />

  <BfDsToggle
    label="Advanced Mode"
    checked={advancedMode}
    onChange={setAdvancedMode}
  />
</div>;
```

## Accessibility

- **Keyboard Navigation** - Space/Enter keys toggle state
- **ARIA Attributes** - Uses `role="switch"` and `aria-checked`
- **Screen Reader Support** - Properly announces state changes
- **Focus Management** - Clear visual focus indicators

## Styling Notes

Uses CSS classes with `bfds-toggle` prefix:

- `.bfds-toggle-wrapper` - Container label element
- `.bfds-toggle` - Main toggle switch element
- `.bfds-toggle-track` - Switch background track
- `.bfds-toggle-thumb` - Moveable switch handle
- `.bfds-toggle--{size}` - Size-specific styling
- `.bfds-toggle--checked` - Active/on state
- `.bfds-toggle--disabled` - Disabled state
