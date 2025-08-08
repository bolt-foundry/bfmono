# BfDsCheckbox

A flexible checkbox component that supports both standalone and form integration
modes with proper accessibility features and visual state management.

## Props

```typescript
export type BfDsCheckboxProps = {
  // Form context props
  /** Form field name for data binding */
  name?: string;

  // Standalone props
  /** Whether the checkbox is checked (controlled) */
  checked?: boolean;
  /** Default checked state for uncontrolled usage */
  defaultChecked?: boolean;
  /** Callback when check state changes */
  onChange?: (checked: boolean) => void;

  // Common props
  /** Label text displayed next to checkbox */
  label?: string;
  /** Required for validation */
  required?: boolean;
  /** Disables component */
  disabled?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Element ID */
  id?: string;
};
```

## Basic Usage

```tsx
import { BfDsCheckbox } from "@bfmono/bfDs";

// Simple checkbox
<BfDsCheckbox 
  label="I agree to the terms" 
  onChange={(checked) => handleChange(checked)} 
/>

// Controlled checkbox
<BfDsCheckbox 
  label="Enable notifications" 
  checked={isEnabled} 
  onChange={setIsEnabled} 
/>
```

## Control Modes

### Controlled Mode

When you provide a `checked` prop, the component operates in controlled mode:

```tsx
const [isChecked, setIsChecked] = useState(false);

<BfDsCheckbox
  label="Controlled checkbox"
  checked={isChecked}
  onChange={setIsChecked}
/>;
```

### Uncontrolled Mode

Without a `checked` prop, the component manages its own state:

```tsx
<BfDsCheckbox
  label="Uncontrolled checkbox"
  defaultChecked={true}
  onChange={(checked) => console.log("Changed:", checked)}
/>;
```

### Form Integration

When used within `BfDsForm`, the component automatically integrates with form
state:

```tsx
<BfDsForm initialData={{ terms: false }} onSubmit={handleSubmit}>
  <BfDsCheckbox
    name="terms"
    label="I agree to the terms and conditions"
    required
  />
  <BfDsFormSubmitButton text="Submit" />
</BfDsForm>;
```

## States and Styling

### Basic States

```tsx
{/* Default states */}
<BfDsCheckbox label="Unchecked" />
<BfDsCheckbox label="Checked" defaultChecked />

{/* Disabled states */}
<BfDsCheckbox label="Disabled unchecked" disabled />
<BfDsCheckbox label="Disabled checked" defaultChecked disabled />

{/* Required field */}
<BfDsCheckbox label="Required field" required />
```

## Form Integration Examples

### Simple Form

```tsx
const [formData, setFormData] = useState({
  newsletter: false,
  terms: false,
  notifications: true,
});

<BfDsForm initialData={formData} onSubmit={handleSubmit}>
  <BfDsCheckbox
    name="newsletter"
    label="Subscribe to newsletter"
  />
  <BfDsCheckbox
    name="terms"
    label="Accept terms and conditions"
    required
  />
  <BfDsCheckbox
    name="notifications"
    label="Enable push notifications"
  />
  <BfDsFormSubmitButton text="Save Preferences" />
</BfDsForm>;
```

### Validation with Required Fields

```tsx
<BfDsForm
  initialData={{ terms: false }}
  onSubmit={(data) => {
    if (!data.terms) {
      alert("You must accept the terms to continue");
      return;
    }
    // Process form...
  }}
>
  <BfDsCheckbox
    name="terms"
    label="I have read and agree to the Terms of Service"
    required
  />

  <BfDsCheckbox
    name="privacy"
    label="I have read and agree to the Privacy Policy"
    required
  />

  <BfDsFormSubmitButton text="Create Account" />
</BfDsForm>;
```

## Common Use Cases

### Settings and Preferences

```tsx
const [settings, setSettings] = useState({
  emailNotifications: true,
  pushNotifications: false,
  marketingEmails: false,
  securityAlerts: true,
});

return (
  <div className="settings-panel">
    <h3>Notification Preferences</h3>

    <BfDsCheckbox
      label="Email notifications"
      checked={settings.emailNotifications}
      onChange={(checked) =>
        setSettings((prev) => ({ ...prev, emailNotifications: checked }))}
    />

    <BfDsCheckbox
      label="Push notifications"
      checked={settings.pushNotifications}
      onChange={(checked) =>
        setSettings((prev) => ({ ...prev, pushNotifications: checked }))}
    />

    <BfDsCheckbox
      label="Marketing emails"
      checked={settings.marketingEmails}
      onChange={(checked) =>
        setSettings((prev) => ({ ...prev, marketingEmails: checked }))}
    />

    <BfDsCheckbox
      label="Security alerts"
      checked={settings.securityAlerts}
      onChange={(checked) =>
        setSettings((prev) => ({ ...prev, securityAlerts: checked }))}
      disabled
    />
  </div>
);
```

### Terms and Agreements

```tsx
const [agreements, setAgreements] = useState({
  terms: false,
  privacy: false,
  marketing: false,
});

const canSubmit = agreements.terms && agreements.privacy;

return (
  <form onSubmit={handleRegistration}>
    <BfDsCheckbox
      label="I accept the Terms of Service"
      checked={agreements.terms}
      onChange={(checked) =>
        setAgreements((prev) => ({ ...prev, terms: checked }))}
      required
    />

    <BfDsCheckbox
      label="I accept the Privacy Policy"
      checked={agreements.privacy}
      onChange={(checked) =>
        setAgreements((prev) => ({ ...prev, privacy: checked }))}
      required
    />

    <BfDsCheckbox
      label="I agree to receive marketing communications (optional)"
      checked={agreements.marketing}
      onChange={(checked) =>
        setAgreements((prev) => ({ ...prev, marketing: checked }))}
    />

    <BfDsButton
      type="submit"
      disabled={!canSubmit}
      variant="primary"
    >
      Register Account
    </BfDsButton>
  </form>
);
```

### Feature Toggles

```tsx
const [features, setFeatures] = useState({
  darkMode: false,
  betaFeatures: false,
  analytics: true,
  autoSave: true,
});

return (
  <div className="feature-toggles">
    <h3>Feature Settings</h3>

    <BfDsCheckbox
      label="Dark mode"
      checked={features.darkMode}
      onChange={(checked) => {
        setFeatures((prev) => ({ ...prev, darkMode: checked }));
        document.body.classList.toggle("dark-mode", checked);
      }}
    />

    <BfDsCheckbox
      label="Beta features (experimental)"
      checked={features.betaFeatures}
      onChange={(checked) =>
        setFeatures((prev) => ({ ...prev, betaFeatures: checked }))}
    />

    <BfDsCheckbox
      label="Usage analytics"
      checked={features.analytics}
      onChange={(checked) =>
        setFeatures((prev) => ({ ...prev, analytics: checked }))}
    />

    <BfDsCheckbox
      label="Auto-save documents"
      checked={features.autoSave}
      onChange={(checked) =>
        setFeatures((prev) => ({ ...prev, autoSave: checked }))}
    />
  </div>
);
```

## Accessibility

BfDsCheckbox includes comprehensive accessibility features:

- **Semantic HTML** - Uses proper `input[type="checkbox"]` with label
  association
- **Keyboard navigation** - Full support for Tab, Space, and Enter keys
- **Screen reader support** - Proper ARIA attributes and roles
- **Focus indicators** - Clear visual focus states
- **Required field marking** - Visual and semantic indication of required fields

### Best Practices

- Always provide descriptive labels that clearly explain what checking the box
  means
- Use `required` prop for fields that must be checked before form submission
- Group related checkboxes using fieldsets when appropriate
- Ensure sufficient color contrast for all visual states
- Test with screen readers and keyboard-only navigation

## Integration with Form Context

BfDsCheckbox seamlessly integrates with the BfDs form system:

1. **Automatic state management** - When used with `name` prop inside `BfDsForm`
2. **Validation support** - Works with form validation rules
3. **Data binding** - Automatically updates form data object
4. **Error handling** - Integrates with form-level error messaging

```tsx
// The checkbox automatically manages its state through the form context
<BfDsForm initialData={{ preferences: { emails: false } }}>
  <BfDsCheckbox
    name="preferences.emails"
    label="Receive email updates"
  />
</BfDsForm>;
```

## Styling Notes

BfDsCheckbox uses CSS classes with the `bfds-checkbox` prefix:

- `.bfds-checkbox-wrapper` - Container element
- `.bfds-checkbox` - Visual checkbox element
- `.bfds-checkbox--checked` - Checked state modifier
- `.bfds-checkbox--disabled` - Disabled state modifier
- `.bfds-checkbox-input` - Hidden native input element
- `.bfds-checkbox-label` - Label text element
- `.bfds-checkbox-required` - Required asterisk element
- `.bfds-checkbox-icon` - Check mark icon element

The component automatically handles:

- Visual state transitions and animations
- Icon rendering for checked states
- Focus and hover state styling
- Proper spacing and alignment with labels
