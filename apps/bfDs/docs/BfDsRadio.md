# BfDsRadio

A radio button group component for single-choice selections. Features flexible
layout orientations, size variants, and seamless form integration. Radio groups
ensure only one option can be selected at a time within the same named group.

## Props

```typescript
export type BfDsRadioOption = {
  /** The value submitted when this option is selected */
  value: string;
  /** Display text shown for this option */
  label: string;
  /** When true, this option cannot be selected */
  disabled?: boolean;
};

export type BfDsRadioSize = "small" | "medium" | "large";

export type BfDsRadioProps = {
  // Form context props
  /** Form field name for data binding (required for radio groups) */
  name: string;

  // Standalone props
  /** Currently selected value (controlled) */
  value?: string;
  /** Default selected value for uncontrolled usage */
  defaultValue?: string;
  /** Selection change callback */
  onChange?: (value: string) => void;

  // Common props
  /** Array of radio button options */
  options: Array<BfDsRadioOption>;
  /** Group label displayed above radio buttons */
  label?: string;
  /** Required for validation */
  required?: boolean;
  /** Disables entire radio group */
  disabled?: boolean;
  /** Layout direction of radio buttons */
  orientation?: "vertical" | "horizontal";
  /** Size variant for radio buttons */
  size?: BfDsRadioSize;
  /** Additional CSS classes */
  className?: string;
};
```

## Basic Usage

```tsx
import { BfDsRadio, type BfDsRadioOption } from "@bfmono/bfDs";

// Define options
const sizeOptions: BfDsRadioOption[] = [
  { value: "small", label: "Small" },
  { value: "medium", label: "Medium" },
  { value: "large", label: "Large" },
];

// Simple radio group
<BfDsRadio
  name="size"
  options={sizeOptions}
  value={selectedSize}
  onChange={setSelectedSize}
/>

// With label and required validation
<BfDsRadio
  name="priority"
  label="Priority Level"
  options={priorityOptions}
  value={selectedPriority}
  onChange={setSelectedPriority}
  required
/>
```

## Controlled vs Uncontrolled Usage

### Controlled Component

Use when you need to manage the selection state in your component:

```tsx
const [selectedValue, setSelectedValue] = useState("");

<BfDsRadio
  name="theme"
  label="Theme Preference"
  options={[
    { value: "light", label: "Light Theme" },
    { value: "dark", label: "Dark Theme" },
    { value: "auto", label: "Auto (System)" },
  ]}
  value={selectedValue}
  onChange={setSelectedValue}
/>;

// Access the selected value
console.log("Selected theme:", selectedValue);
```

### Uncontrolled Component

Use when you want the component to manage its own state:

```tsx
// With default selection
<BfDsRadio
  name="notification"
  label="Email Notifications"
  options={[
    { value: "all", label: "All Notifications" },
    { value: "important", label: "Important Only" },
    { value: "none", label: "None" },
  ]}
  defaultValue="important"
/>

// Without default (no option pre-selected)
<BfDsRadio
  name="optional"
  label="Optional Selection"
  options={categoryOptions}
/>
```

## Form Integration

BfDsRadio automatically integrates with BfDsForm:

```tsx
const [formData, setFormData] = useState({
  size: "",
  priority: "",
  theme: "",
});

<BfDsForm
  initialData={formData}
  onSubmit={handleSubmit}
  onChange={setFormData}
>
  <BfDsRadio
    name="size"
    label="Size"
    options={sizeOptions}
    required
  />

  <BfDsRadio
    name="priority"
    label="Priority"
    options={priorityOptions}
    orientation="horizontal"
  />

  <BfDsRadio
    name="theme"
    label="Theme"
    options={themeOptions}
  />

  <BfDsFormSubmitButton text="Submit" />
</BfDsForm>;
```

## Layout Orientations

Control the layout direction of radio buttons:

### Vertical Layout (Default)

```tsx
<BfDsRadio
  name="vertical-example"
  label="Vertical Layout"
  options={[
    { value: "option1", label: "First Option" },
    { value: "option2", label: "Second Option" },
    { value: "option3", label: "Third Option" },
  ]}
  orientation="vertical"
/>;
```

### Horizontal Layout

```tsx
<BfDsRadio
  name="horizontal-example"
  label="Horizontal Layout"
  options={[
    { value: "yes", label: "Yes" },
    { value: "no", label: "No" },
    { value: "maybe", label: "Maybe" },
  ]}
  orientation="horizontal"
/>;
```

## Size Variants

Choose from three size options:

```tsx
// Small size
<BfDsRadio
  name="small-radio"
  label="Small Radio Buttons"
  options={options}
  size="small"
/>

// Medium size (default)
<BfDsRadio
  name="medium-radio"
  label="Medium Radio Buttons"
  options={options}
  size="medium"
/>

// Large size
<BfDsRadio
  name="large-radio"
  label="Large Radio Buttons"
  options={options}
  size="large"
/>
```

## States and Validation

### Required Field

```tsx
<BfDsRadio
  name="required-selection"
  label="Required Selection"
  options={options}
  required
/>;
```

### Disabled State

```tsx
// Disable entire group
<BfDsRadio
  name="disabled-group"
  label="Disabled Group"
  options={options}
  disabled
/>;

// Disable individual options
const mixedOptions: BfDsRadioOption[] = [
  { value: "available", label: "Available" },
  { value: "limited", label: "Limited Access" },
  { value: "unavailable", label: "Unavailable", disabled: true },
  { value: "coming", label: "Coming Soon", disabled: true },
];

<BfDsRadio
  name="access-level"
  label="Access Level"
  options={mixedOptions}
/>;
```

## Common Use Cases

### Yes/No Questions

```tsx
<BfDsRadio
  name="agreement"
  label="Do you agree to the terms?"
  options={[
    { value: "yes", label: "Yes, I agree" },
    { value: "no", label: "No, I disagree" },
  ]}
  orientation="horizontal"
  required
/>;
```

### Priority/Level Selection

```tsx
const priorityOptions = [
  { value: "low", label: "Low Priority" },
  { value: "medium", label: "Medium Priority" },
  { value: "high", label: "High Priority" },
  { value: "urgent", label: "Urgent" },
];

<BfDsRadio
  name="task-priority"
  label="Task Priority"
  options={priorityOptions}
  defaultValue="medium"
/>;
```

### Payment Method Selection

```tsx
const paymentOptions = [
  { value: "credit", label: "Credit Card" },
  { value: "debit", label: "Debit Card" },
  { value: "paypal", label: "PayPal" },
  { value: "bank", label: "Bank Transfer" },
];

<BfDsRadio
  name="payment-method"
  label="Payment Method"
  options={paymentOptions}
  required
/>;
```

### Plan Selection

```tsx
const planOptions = [
  { value: "free", label: "Free Plan - $0/month" },
  { value: "pro", label: "Pro Plan - $19/month" },
  { value: "enterprise", label: "Enterprise Plan - $99/month" },
  { value: "custom", label: "Custom Plan - Contact us" },
];

<BfDsRadio
  name="subscription-plan"
  label="Choose Your Plan"
  options={planOptions}
  size="large"
/>;
```

### Conditional Options

```tsx
const [userType, setUserType] = useState("");
const [roleOptions, setRoleOptions] = useState<BfDsRadioOption[]>([]);

useEffect(() => {
  if (userType === "admin") {
    setRoleOptions([
      { value: "super", label: "Super Administrator" },
      { value: "admin", label: "Administrator" },
      { value: "moderator", label: "Moderator" },
    ]);
  } else if (userType === "user") {
    setRoleOptions([
      { value: "member", label: "Member" },
      { value: "contributor", label: "Contributor" },
    ]);
  }
}, [userType]);

<div>
  <BfDsRadio
    name="user-type"
    label="User Type"
    options={[
      { value: "admin", label: "Administrator" },
      { value: "user", label: "Regular User" },
    ]}
    value={userType}
    onChange={setUserType}
  />

  {userType && (
    <BfDsRadio
      name="role"
      label="Role"
      options={roleOptions}
    />
  )}
</div>;
```

### Survey Questions

```tsx
const satisfactionOptions = [
  { value: "very-satisfied", label: "Very Satisfied" },
  { value: "satisfied", label: "Satisfied" },
  { value: "neutral", label: "Neutral" },
  { value: "dissatisfied", label: "Dissatisfied" },
  { value: "very-dissatisfied", label: "Very Dissatisfied" },
];

<BfDsRadio
  name="satisfaction"
  label="How satisfied are you with our service?"
  options={satisfactionOptions}
  orientation="vertical"
  required
/>;
```

## Accessibility

BfDsRadio includes comprehensive accessibility features:

- **Semantic HTML** - Uses fieldset, legend, and proper radio input elements
- **ARIA attributes** - Includes `role="radiogroup"` and `aria-checked`
- **Screen reader support** - Proper labeling and group identification
- **Keyboard navigation** - Arrow keys navigate within the group, Tab moves
  between groups
- **Focus management** - Clear visual focus indicators
- **Required field indicators** - Visual and semantic marking

### Keyboard Navigation

- **Tab** - Move to/from the radio group
- **Arrow Up/Down** - Navigate between options in vertical layout
- **Arrow Left/Right** - Navigate between options in horizontal layout
- **Space** - Select the focused option

### Best Practices

- Always provide a group label for screen readers
- Use descriptive option labels that clearly indicate the choice
- Group related options together with meaningful names
- Consider horizontal layout for binary choices (Yes/No)
- Test keyboard navigation in both orientations
- Ensure sufficient color contrast for all states

## Styling Notes

BfDsRadio uses CSS classes with the `bfds-radio` prefix:

- `.bfds-radio-fieldset` - Fieldset wrapper (when label is provided)
- `.bfds-radio-group` - Radio group container
- `.bfds-radio-wrapper` - Individual radio option wrapper
- `.bfds-radio` - Radio button visual element
- `.bfds-radio-input` - Actual input element (visually hidden)
- `.bfds-radio-label` - Option label text
- `.bfds-radio-dot` - Selected state indicator

### State and Layout Modifiers

- `.bfds-radio-group--vertical` - Vertical layout (default)
- `.bfds-radio-group--horizontal` - Horizontal layout
- `.bfds-radio-group--{size}` - Size-specific styling
- `.bfds-radio-group--disabled` - Disabled group styling
- `.bfds-radio--checked` - Selected radio button
- `.bfds-radio--disabled` - Disabled radio button

The component automatically:

- Manages selection state across the group
- Handles focus and hover states appropriately
- Provides smooth transitions for state changes
- Ensures proper spacing in both layout orientations
- Scales appropriately for different sizes
