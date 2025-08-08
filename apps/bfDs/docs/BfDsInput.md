# BfDsInput

A comprehensive text input component that supports both standalone and form
integration modes with validation states, help text, and full accessibility
features.

## Props

```typescript
export type BfDsInputProps = {
  // Form context props
  /** Form field name for data binding */
  name?: string;

  // Standalone props
  /** Current input value (controlled) */
  value?: string;
  /** Default value for uncontrolled usage */
  defaultValue?: string;
  /** Change event handler */
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;

  // Common props
  /** Label text displayed above input */
  label?: string;
  /** Placeholder text when empty */
  placeholder?: string;
  /** Required for validation */
  required?: boolean;
  /** Visual state of the input */
  state?: BfDsInputState;
  /** Error message to display */
  errorMessage?: string;
  /** Success message to display */
  successMessage?: string;
  /** Help text displayed below input */
  helpText?: string;
  /** Additional CSS classes */
  className?: string;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange">;

export type BfDsInputState = "default" | "error" | "success" | "disabled";
```

## Basic Usage

```tsx
import { BfDsInput } from "@bfmono/bfDs";

// Simple input
<BfDsInput 
  label="Name" 
  placeholder="Enter your name"
  onChange={(e) => handleChange(e.target.value)} 
/>

// Controlled input
<BfDsInput 
  label="Email" 
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  type="email"
/>
```

## Control Modes

### Controlled Mode

When you provide a `value` prop, the component operates in controlled mode:

```tsx
const [username, setUsername] = useState("");

<BfDsInput
  label="Username"
  value={username}
  onChange={(e) => setUsername(e.target.value)}
  placeholder="Enter username"
/>;
```

### Uncontrolled Mode

Without a `value` prop, the component manages its own state:

```tsx
<BfDsInput
  label="Description"
  defaultValue="Initial content"
  onChange={(e) => console.log("Changed:", e.target.value)}
  placeholder="Enter description"
/>;
```

### Form Integration

When used within `BfDsForm`, the component automatically integrates with form
state:

```tsx
<BfDsForm initialData={{ username: "", email: "" }} onSubmit={handleSubmit}>
  <BfDsInput
    name="username"
    label="Username"
    placeholder="Choose a username"
    required
  />
  <BfDsInput
    name="email"
    label="Email Address"
    type="email"
    placeholder="your@email.com"
    required
  />
  <BfDsFormSubmitButton text="Register" />
</BfDsForm>;
```

## Visual States

### Default State

```tsx
<BfDsInput
  label="Default Input"
  placeholder="Enter some text"
  helpText="This is helpful information about the field"
/>;
```

### Error State

```tsx
<BfDsInput
  label="Email Address"
  value="invalid-email"
  state="error"
  errorMessage="Please enter a valid email address"
  placeholder="your@email.com"
/>;
```

### Success State

```tsx
<BfDsInput
  label="Username"
  value="validuser123"
  state="success"
  successMessage="Username is available!"
  placeholder="Choose a username"
/>;
```

### Disabled State

```tsx
<BfDsInput
  label="Account ID"
  value="ACC-123456"
  state="disabled"
  helpText="This field cannot be modified"
/>;
```

## Input Types

BfDsInput supports all HTML input types:

```tsx
{/* Text inputs */}
<BfDsInput label="Name" type="text" />
<BfDsInput label="Email" type="email" />
<BfDsInput label="Phone" type="tel" />
<BfDsInput label="Website" type="url" />

{/* Number inputs */}
<BfDsInput label="Age" type="number" min="1" max="120" />
<BfDsInput label="Price" type="number" step="0.01" />

{/* Date and time */}
<BfDsInput label="Birth Date" type="date" />
<BfDsInput label="Meeting Time" type="datetime-local" />
<BfDsInput label="Month" type="month" />

{/* Secure inputs */}
<BfDsInput label="Password" type="password" />
<BfDsInput label="Confirm Password" type="password" />

{/* Other types */}
<BfDsInput label="Search" type="search" />
<BfDsInput label="Color" type="color" />
```

## Advanced Features

### With Help Text

```tsx
<BfDsInput
  label="Password"
  type="password"
  helpText="Must be at least 8 characters with uppercase, lowercase, and numbers"
  placeholder="Enter secure password"
/>;
```

### Required Fields

```tsx
<BfDsInput
  label="Email Address"
  type="email"
  required
  placeholder="your@email.com"
  helpText="We'll send confirmation to this address"
/>;
```

### Custom Validation

```tsx
const [email, setEmail] = useState("");
const [emailState, setEmailState] = useState("default");
const [emailMessage, setEmailMessage] = useState("");

const validateEmail = (value) => {
  if (!value) {
    setEmailState("error");
    setEmailMessage("Email is required");
  } else if (!value.includes("@")) {
    setEmailState("error");
    setEmailMessage("Please enter a valid email");
  } else {
    setEmailState("success");
    setEmailMessage("Email looks good!");
  }
};

<BfDsInput
  label="Email Address"
  value={email}
  onChange={(e) => {
    setEmail(e.target.value);
    validateEmail(e.target.value);
  }}
  state={emailState}
  errorMessage={emailState === "error" ? emailMessage : undefined}
  successMessage={emailState === "success" ? emailMessage : undefined}
  type="email"
/>;
```

## Common Use Cases

### Login Form

```tsx
const [credentials, setCredentials] = useState({
  username: "",
  password: "",
});

return (
  <form onSubmit={handleLogin}>
    <BfDsInput
      label="Username or Email"
      value={credentials.username}
      onChange={(e) =>
        setCredentials((prev) => ({
          ...prev,
          username: e.target.value,
        }))}
      placeholder="Enter username or email"
      required
    />

    <BfDsInput
      label="Password"
      type="password"
      value={credentials.password}
      onChange={(e) =>
        setCredentials((prev) => ({
          ...prev,
          password: e.target.value,
        }))}
      placeholder="Enter password"
      required
    />

    <BfDsButton type="submit" variant="primary">
      Sign In
    </BfDsButton>
  </form>
);
```

### Profile Settings

```tsx
const [profile, setProfile] = useState({
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  website: "",
});

return (
  <BfDsForm initialData={profile} onSubmit={handleSaveProfile}>
    <div className="profile-form">
      <BfDsInput
        name="firstName"
        label="First Name"
        placeholder="Enter your first name"
        required
      />

      <BfDsInput
        name="lastName"
        label="Last Name"
        placeholder="Enter your last name"
        required
      />

      <BfDsInput
        name="email"
        label="Email Address"
        type="email"
        placeholder="your@email.com"
        required
        helpText="This will be your primary contact email"
      />

      <BfDsInput
        name="phone"
        label="Phone Number"
        type="tel"
        placeholder="+1 (555) 123-4567"
        helpText="Optional - for account security"
      />

      <BfDsInput
        name="website"
        label="Website"
        type="url"
        placeholder="https://your-website.com"
        helpText="Optional - your personal or business website"
      />
    </div>

    <BfDsFormSubmitButton text="Save Profile" />
  </BfDsForm>
);
```

### Search with Validation

```tsx
const [searchTerm, setSearchTerm] = useState("");
const [searchResults, setSearchResults] = useState([]);
const [isSearching, setIsSearching] = useState(false);

const handleSearch = async (term) => {
  if (term.length < 3) return;

  setIsSearching(true);
  try {
    const results = await searchAPI(term);
    setSearchResults(results);
  } finally {
    setIsSearching(false);
  }
};

return (
  <div className="search-container">
    <BfDsInput
      label="Search"
      type="search"
      value={searchTerm}
      onChange={(e) => {
        setSearchTerm(e.target.value);
        handleSearch(e.target.value);
      }}
      placeholder="Search for items..."
      helpText={searchTerm.length > 0 && searchTerm.length < 3
        ? "Enter at least 3 characters to search"
        : `${searchResults.length} results found`}
      state={searchTerm.length > 0 && searchTerm.length < 3
        ? "error"
        : "default"}
    />

    {isSearching && <BfDsSpinner />}

    <div className="search-results">
      {searchResults.map((result) => <div key={result.id}>{result.title}</div>)}
    </div>
  </div>
);
```

## Accessibility

BfDsInput includes comprehensive accessibility features:

- **Semantic HTML** - Uses proper `input` elements with label association
- **ARIA attributes** - Includes `aria-describedby`, `aria-invalid`, and
  `role="alert"` for errors
- **Keyboard navigation** - Full keyboard support for all input types
- **Screen reader support** - Proper announcement of labels, help text, and
  error messages
- **Focus indicators** - Clear visual focus states
- **Required field marking** - Visual and semantic indication with asterisk

### Best Practices

- Always provide descriptive labels that explain the expected input
- Use appropriate input types for better mobile keyboard experience
- Include helpful placeholder text and help text for complex fields
- Provide clear error messages that explain how to fix the issue
- Test with screen readers and keyboard-only navigation
- Ensure sufficient color contrast for all visual states

## Integration with Form Context

BfDsInput seamlessly integrates with the BfDs form system:

1. **Automatic state management** - When used with `name` prop inside `BfDsForm`
2. **Validation support** - Integrates with form validation rules and displays
   errors
3. **Data binding** - Automatically updates form data object
4. **Error handling** - Shows form-level errors with proper styling

```tsx
// The input automatically manages its state through the form context
<BfDsForm
  initialData={{ user: { name: "", email: "" } }}
  validation={{
    "user.email": (value) =>
      value.includes("@") ? null : { message: "Invalid email" },
  }}
>
  <BfDsInput
    name="user.name"
    label="Full Name"
    required
  />
  <BfDsInput
    name="user.email"
    label="Email Address"
    type="email"
    required
  />
</BfDsForm>;
```

## Styling Notes

BfDsInput uses CSS classes with the `bfds-input` prefix:

- `.bfds-input-container` - Wrapper container for the entire input component
- `.bfds-input-container--{state}` - Container state modifiers
- `.bfds-input` - The actual input element
- `.bfds-input--{state}` - Input state modifiers (default, error, success,
  disabled)
- `.bfds-input-label` - Label element
- `.bfds-input-required` - Required asterisk element
- `.bfds-input-help` - Help text element
- `.bfds-input-error` - Error message element with `role="alert"`
- `.bfds-input-success` - Success message element

The component automatically handles:

- Visual state transitions and styling
- Proper ARIA associations between elements
- Focus and hover state management
- Responsive layout and spacing
