# BfDsFormSubmitButton

A specialized button component designed specifically for form submission. This
component wraps the BfDsButton component with form-specific behavior and
defaults, automatically setting the type to "submit" and integrating with form
contexts.

## Props

```typescript
export type BfDsFormSubmitButtonProps =
  & Omit<BfDsButtonProps, "type" | "onClick">
  & {
    /** Button text (defaults to "Submit") */
    text?: string;
    /** Optional click handler called before form submission */
    onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  };
```

Inherits all props from BfDsButton except `type` and `onClick`, which are
managed internally.

## Basic Usage

```tsx
import { BfDsFormSubmitButton, BfDsForm } from "@bfmono/bfDs";

// Simple submit button (defaults to "Submit" text)
<BfDsForm onSubmit={handleSubmit}>
  <BfDsFormSubmitButton />
</BfDsForm>

// Custom text
<BfDsForm onSubmit={handleSubmit}>
  <BfDsFormSubmitButton text="Save Changes" />
</BfDsForm>

// Using children for content
<BfDsForm onSubmit={handleSubmit}>
  <BfDsFormSubmitButton>
    <span>Submit Form</span>
  </BfDsFormSubmitButton>
</BfDsForm>
```

## Form Integration

BfDsFormSubmitButton automatically integrates with BfDsForm and HTML form
elements:

```tsx
const handleSubmit = (data) => {
  console.log("Form data:", data);
};

const handlePreSubmit = (e) => {
  // Called before form submission
  console.log("Pre-submit validation or processing");
};

<BfDsForm
  initialData={{ name: "", email: "" }}
  onSubmit={handleSubmit}
>
  <BfDsInput name="name" label="Name" required />
  <BfDsInput name="email" label="Email" type="email" required />

  <BfDsFormSubmitButton
    text="Create Account"
    onClick={handlePreSubmit}
    variant="primary"
  />
</BfDsForm>;
```

## Variants and Styling

Since it extends BfDsButton, all button variants and styling options are
available:

```tsx
// Different variants
<BfDsFormSubmitButton variant="primary" text="Save" />
<BfDsFormSubmitButton variant="secondary" text="Update" />
<BfDsFormSubmitButton variant="outline" text="Submit Draft" />

// Different sizes  
<BfDsFormSubmitButton size="small" text="Save" />
<BfDsFormSubmitButton size="medium" text="Save" />
<BfDsFormSubmitButton size="large" text="Save" />

// With icons
<BfDsFormSubmitButton 
  icon="checkCircle" 
  text="Complete"
  variant="primary"
/>

<BfDsFormSubmitButton 
  icon="arrowRight" 
  iconPosition="right"
  text="Continue"
/>
```

## Loading States

Handle async form submissions with loading indicators:

```tsx
const [isSubmitting, setIsSubmitting] = useState(false);

const handleSubmit = async (data) => {
  setIsSubmitting(true);
  try {
    await submitFormData(data);
  } finally {
    setIsSubmitting(false);
  }
};

<BfDsForm onSubmit={handleSubmit}>
  <BfDsInput name="data" label="Data" />

  <BfDsFormSubmitButton
    text={isSubmitting ? "Submitting..." : "Submit"}
    spinner={isSubmitting}
    disabled={isSubmitting}
  />
</BfDsForm>;
```

## Validation Integration

Works seamlessly with form validation:

```tsx
const [errors, setErrors] = useState({});

const validateForm = (data) => {
  const newErrors = {};
  if (!data.email) newErrors.email = "Email is required";
  if (!data.name) newErrors.name = "Name is required";
  return newErrors;
};

const handleSubmit = (data) => {
  const formErrors = validateForm(data);
  if (Object.keys(formErrors).length > 0) {
    setErrors(formErrors);
    return;
  }

  // Proceed with submission
  submitData(data);
};

<BfDsForm onSubmit={handleSubmit}>
  <BfDsInput
    name="name"
    label="Name"
    error={errors.name}
    required
  />
  <BfDsInput
    name="email"
    label="Email"
    type="email"
    error={errors.email}
    required
  />

  <BfDsFormSubmitButton text="Submit" />
</BfDsForm>;
```

## Common Use Cases

### Form Submission with Feedback

```tsx
const [status, setStatus] = useState("idle"); // 'idle' | 'submitting' | 'success' | 'error'

const handleSubmit = async (data) => {
  setStatus("submitting");
  try {
    await api.createUser(data);
    setStatus("success");
  } catch (error) {
    setStatus("error");
  }
};

<BfDsForm onSubmit={handleSubmit}>
  <BfDsInput name="username" label="Username" required />
  <BfDsInput name="password" label="Password" type="password" required />

  <BfDsFormSubmitButton
    text={status === "submitting"
      ? "Creating Account..."
      : status === "success"
      ? "Account Created!"
      : status === "error"
      ? "Try Again"
      : "Create Account"}
    spinner={status === "submitting"}
    disabled={status === "submitting"}
    variant={status === "error" ? "outline" : "primary"}
  />
</BfDsForm>;
```

### Multi-step Forms

```tsx
const [currentStep, setCurrentStep] = useState(1);
const totalSteps = 3;

<BfDsForm onSubmit={handleStepSubmit}>
  {/* Form fields for current step */}

  <div className="form-actions">
    {currentStep > 1 && (
      <BfDsButton
        variant="secondary"
        onClick={() => setCurrentStep((prev) => prev - 1)}
      >
        Previous
      </BfDsButton>
    )}

    <BfDsFormSubmitButton
      text={currentStep === totalSteps ? "Complete" : "Next"}
      icon={currentStep === totalSteps ? "checkCircle" : "arrowRight"}
      iconPosition="right"
    />
  </div>
</BfDsForm>;
```

### Conditional Submission

```tsx
const [isValid, setIsValid] = useState(false);
const [isDirty, setIsDirty] = useState(false);

<BfDsForm
  onSubmit={handleSubmit}
  onChange={(data) => {
    setIsDirty(true);
    setIsValid(validateFormData(data));
  }}
>
  <BfDsInput name="title" label="Title" required />
  <BfDsTextArea name="description" label="Description" required />

  <BfDsFormSubmitButton
    text="Save Changes"
    disabled={!isValid || !isDirty}
    variant={isDirty && isValid ? "primary" : "outline"}
  />
</BfDsForm>;
```

## HTML Form Integration

Also works with standard HTML forms:

```tsx
const handleSubmit = (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);
  // Process form data
};

<form onSubmit={handleSubmit}>
  <input name="email" type="email" required />
  <input name="password" type="password" required />

  <BfDsFormSubmitButton text="Sign In" variant="primary" />
</form>;
```

## Accessibility

BfDsFormSubmitButton inherits all accessibility features from BfDsButton and
adds form-specific behavior:

- **Form submission** - Automatically triggers form submission when clicked
- **Keyboard navigation** - Supports Tab, Enter, and Space keys
- **Screen reader support** - Proper semantic HTML with type="submit"
- **Focus management** - Clear focus indicators and proper focus handling
- **Loading states** - Proper ARIA attributes during loading

### Best Practices

- Use descriptive text that clearly indicates the submission action
- Provide feedback during async operations with loading states
- Disable the button during submission to prevent multiple submissions
- Use appropriate variants to indicate the action type (primary for main
  actions)
- Include validation feedback and prevent submission of invalid forms

## Styling Notes

BfDsFormSubmitButton uses the same CSS classes as BfDsButton:

- `.bfds-button` - Base button styles
- `.bfds-button--{variant}` - Variant-specific styles
- `.bfds-button--{size}` - Size-specific styles
- Additional modifiers based on props passed to the underlying BfDsButton

The component automatically:

- Sets `type="submit"` for proper form integration
- Handles click events while preserving form submission behavior
- Supports all BfDsButton styling and state management
- Integrates seamlessly with both BfDsForm and standard HTML forms
