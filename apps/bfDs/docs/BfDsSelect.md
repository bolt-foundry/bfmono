# BfDsSelect

A sophisticated dropdown selection component that supports both basic selection
and typeahead functionality. Features intelligent dropdown positioning, keyboard
navigation, and seamless form integration. The component provides both
controlled and uncontrolled usage patterns.

## Props

```typescript
export type BfDsSelectOption = {
  /** The value submitted when this option is selected */
  value: string;
  /** Display text shown for this option */
  label: string;
  /** When true, this option cannot be selected */
  disabled?: boolean;
};

export type BfDsSelectProps = {
  // Form context props
  /** Form field name for data binding */
  name?: string;

  // Standalone props
  /** Currently selected value (controlled) */
  value?: string;
  /** Default selected value for uncontrolled usage */
  defaultValue?: string;
  /** Selection change callback */
  onChange?: (value: string) => void;

  // Common props
  /** Array of selectable options */
  options: Array<BfDsSelectOption>;
  /** Placeholder when nothing selected */
  placeholder?: string;
  /** Field label */
  label?: string;
  /** Required for validation */
  required?: boolean;
  /** Disables component */
  disabled?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Element ID */
  id?: string;
  /** Enable typeahead functionality */
  typeahead?: boolean;
};
```

## Basic Usage

```tsx
import { BfDsSelect, type BfDsSelectOption } from "@bfmono/bfDs";

// Define options
const countryOptions: BfDsSelectOption[] = [
  { value: "us", label: "United States" },
  { value: "ca", label: "Canada" },
  { value: "uk", label: "United Kingdom" },
  { value: "de", label: "Germany", disabled: true }, // Disabled option
];

// Simple select
<BfDsSelect
  options={countryOptions}
  value={selectedCountry}
  onChange={setSelectedCountry}
  placeholder="Choose a country"
/>

// With label
<BfDsSelect
  label="Country"
  options={countryOptions}
  value={selectedCountry}
  onChange={setSelectedCountry}
  placeholder="Select your country"
  required
/>
```

## Controlled vs Uncontrolled Usage

### Controlled Component

Use when you need to manage the selection state in your component:

```tsx
const [selectedValue, setSelectedValue] = useState("");

<BfDsSelect
  label="Priority Level"
  options={priorityOptions}
  value={selectedValue}
  onChange={setSelectedValue}
  placeholder="Select priority"
/>;

// Access the selected value
console.log("Selected:", selectedValue);
```

### Uncontrolled Component

Use when you want the component to manage its own state:

```tsx
// With default selection
<BfDsSelect
  label="Default Size"
  options={sizeOptions}
  defaultValue="medium"
  placeholder="Choose size"
/>

// Without default
<BfDsSelect
  label="Optional Selection"
  options={categoryOptions}
  placeholder="Choose category"
/>
```

## Form Integration

BfDsSelect automatically integrates with BfDsForm:

```tsx
const [formData, setFormData] = useState({
  country: "",
  size: "",
  priority: "",
});

<BfDsForm
  initialData={formData}
  onSubmit={handleSubmit}
  onChange={setFormData}
>
  <BfDsSelect
    name="country"
    label="Country"
    options={countryOptions}
    placeholder="Select country"
    required
  />

  <BfDsSelect
    name="size"
    label="Size"
    options={sizeOptions}
    placeholder="Select size"
  />

  <BfDsSelect
    name="priority"
    label="Priority"
    options={priorityOptions}
    placeholder="Select priority"
  />

  <BfDsFormSubmitButton text="Submit" />
</BfDsForm>;
```

## Typeahead Functionality

Enable typeahead for searchable dropdowns with large datasets:

```tsx
const largeCountryList: BfDsSelectOption[] = [
  { value: "af", label: "Afghanistan" },
  { value: "al", label: "Albania" },
  { value: "dz", label: "Algeria" },
  // ... many more countries
  { value: "us", label: "United States" },
  { value: "zw", label: "Zimbabwe" },
];

<BfDsSelect
  label="Country (Searchable)"
  options={largeCountryList}
  value={selectedCountry}
  onChange={setSelectedCountry}
  placeholder="Type to search countries..."
  typeahead
/>;
```

### Typeahead Features

- **Real-time filtering** - Options filter as you type
- **Keyboard navigation** - Arrow keys navigate through filtered results
- **Intelligent positioning** - Dropdown positions above or below based on
  available space
- **Scroll management** - Automatically scrolls to highlighted options
- **No results state** - Shows "No results found" when no options match

## Dropdown Options

### Basic Options

```tsx
const basicOptions: BfDsSelectOption[] = [
  { value: "option1", label: "First Option" },
  { value: "option2", label: "Second Option" },
  { value: "option3", label: "Third Option" },
];
```

### Options with Disabled Items

```tsx
const statusOptions: BfDsSelectOption[] = [
  { value: "active", label: "Active" },
  { value: "pending", label: "Pending" },
  { value: "suspended", label: "Suspended", disabled: true },
  { value: "archived", label: "Archived", disabled: true },
];
```

### Dynamic Options

```tsx
const [categoryOptions, setCategoryOptions] = useState<BfDsSelectOption[]>([]);

useEffect(() => {
  // Load options from API
  fetchCategories().then((categories) => {
    setCategoryOptions(categories.map((cat) => ({
      value: cat.id,
      label: cat.name,
      disabled: !cat.isActive,
    })));
  });
}, []);

<BfDsSelect
  label="Category"
  options={categoryOptions}
  placeholder="Select a category"
  typeahead
/>;
```

## Keyboard Navigation

BfDsSelect supports comprehensive keyboard interaction:

### When Closed

- **Arrow Down** / **Enter** / **Space** - Open dropdown
- **Tab** - Move to next form field

### When Open

- **Arrow Down** - Move to next option
- **Arrow Up** - Move to previous option
- **Enter** - Select highlighted option
- **Escape** - Close dropdown without selection
- **Tab** - Close dropdown and move to next field

### Typeahead Mode

- **Type characters** - Filter options in real-time
- **Arrow keys** - Navigate through filtered results
- **Enter** - Select highlighted filtered option

## States and Validation

### Required Field

```tsx
<BfDsSelect
  label="Required Selection"
  options={options}
  placeholder="You must select an option"
  required
/>;
```

### Disabled State

```tsx
<BfDsSelect
  label="Disabled Selection"
  options={options}
  placeholder="Cannot interact with this"
  disabled
/>;
```

### Custom Validation

```tsx
const [selectedValue, setSelectedValue] = useState("");
const [error, setError] = useState("");

const handleChange = (value: string) => {
  setSelectedValue(value);

  // Custom validation
  if (value === "restricted") {
    setError("This option is not available for your account");
  } else {
    setError("");
  }
};

<div className="form-field">
  <BfDsSelect
    label="Account Type"
    options={accountOptions}
    value={selectedValue}
    onChange={handleChange}
    placeholder="Select account type"
  />
  {error && <div className="error-message">{error}</div>}
</div>;
```

## Common Use Cases

### Country/Region Selection

```tsx
const countryOptions = [
  { value: "us", label: "United States" },
  { value: "ca", label: "Canada" },
  { value: "uk", label: "United Kingdom" },
  // ... more countries
];

<BfDsSelect
  label="Country"
  options={countryOptions}
  placeholder="Select your country"
  typeahead // Recommended for long lists
  required
/>;
```

### Priority/Status Selection

```tsx
const priorityOptions = [
  { value: "low", label: "Low Priority" },
  { value: "medium", label: "Medium Priority" },
  { value: "high", label: "High Priority" },
  { value: "urgent", label: "Urgent" },
];

<BfDsSelect
  label="Task Priority"
  options={priorityOptions}
  defaultValue="medium"
  placeholder="Select priority"
/>;
```

### Conditional Options

```tsx
const [userType, setUserType] = useState("");
const [availableOptions, setAvailableOptions] = useState<BfDsSelectOption[]>(
  [],
);

useEffect(() => {
  // Update available options based on user type
  if (userType === "admin") {
    setAvailableOptions([
      { value: "all", label: "All Users" },
      { value: "active", label: "Active Users" },
      { value: "suspended", label: "Suspended Users" },
    ]);
  } else {
    setAvailableOptions([
      { value: "active", label: "Active Users" },
    ]);
  }
}, [userType]);

<BfDsSelect
  label="User Filter"
  options={availableOptions}
  placeholder="Select user filter"
/>;
```

### Multi-Step Forms

```tsx
const [step1Value, setStep1Value] = useState("");
const [step2Options, setStep2Options] = useState<BfDsSelectOption[]>([]);

useEffect(() => {
  if (step1Value) {
    // Load step 2 options based on step 1 selection
    fetchDependentOptions(step1Value).then(setStep2Options);
  }
}, [step1Value]);

<div>
  <BfDsSelect
    label="Category"
    options={categoryOptions}
    value={step1Value}
    onChange={setStep1Value}
    placeholder="Select category first"
  />

  {step1Value && (
    <BfDsSelect
      label="Subcategory"
      options={step2Options}
      placeholder="Select subcategory"
      disabled={!step1Value}
    />
  )}
</div>;
```

### Search and Filter

```tsx
const [searchResults, setSearchResults] = useState<BfDsSelectOption[]>([]);

const handleSearch = async (query: string) => {
  if (query.length >= 2) {
    const results = await searchAPI(query);
    setSearchResults(results.map((item) => ({
      value: item.id,
      label: item.name,
    })));
  }
};

<BfDsSelect
  label="Search Products"
  options={searchResults}
  placeholder="Type to search products..."
  typeahead
  onChange={(value) => {
    // Handle selection
    console.log("Selected product:", value);
  }}
/>;
```

## Accessibility

BfDsSelect includes comprehensive accessibility features:

- **Semantic HTML** - Uses proper ARIA roles and attributes
- **Screen reader support** - Combobox role with proper labeling
- **Keyboard navigation** - Full keyboard interaction support
- **Focus management** - Proper focus handling and visual indicators
- **ARIA states** - Dynamic `aria-expanded`, `aria-selected` attributes
- **Live regions** - Screen reader announcements for state changes

### ARIA Attributes

- `role="combobox"` - Identifies the component as a combobox
- `aria-expanded` - Indicates if dropdown is open/closed
- `aria-haspopup="listbox"` - Indicates dropdown contains a list
- `aria-autocomplete` - Indicates typeahead functionality
- `role="listbox"` - On dropdown container
- `role="option"` - On each selectable option
- `aria-selected` - Indicates selected state
- `aria-disabled` - Indicates disabled options

### Best Practices

- Always provide descriptive labels
- Use meaningful option labels that are easy to understand
- Consider typeahead for lists with more than 7-10 options
- Test keyboard navigation thoroughly
- Ensure sufficient color contrast for all states
- Provide loading states for dynamic options

## Styling Notes

BfDsSelect uses CSS classes with the `bfds-select` prefix:

- `.bfds-select-container` - Main container wrapper
- `.bfds-select` - Input field styling
- `.bfds-select-wrapper` - Input and icon wrapper
- `.bfds-select-icon` - Dropdown arrow icon
- `.bfds-select-dropdown` - Dropdown container
- `.bfds-select-option` - Individual option styling
- `.bfds-select-label` - Label styling

### State Modifiers

- `.bfds-select--disabled` - Disabled state
- `.bfds-select--open` - Open dropdown state
- `.bfds-select--open-above` - Dropdown positioned above
- `.bfds-select-option--selected` - Selected option
- `.bfds-select-option--highlighted` - Keyboard-highlighted option
- `.bfds-select-option--disabled` - Disabled option

The component automatically:

- Positions dropdown based on available viewport space
- Handles overflow scrolling in dropdown
- Manages focus states and visual feedback
- Provides smooth animations for dropdown transitions
- Scales appropriately for different screen sizes
