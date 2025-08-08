# BfDsForm

A powerful form container component that provides centralized state management,
automatic data binding, and validation support for all BfDs form elements.

## Props

```typescript
export type BfDsFormProps<
  T = Record<string, string | number | boolean | null>,
> = {
  /** Initial form data values */
  initialData: T;
  /** Called when form is submitted */
  onSubmit?: (data: T) => void;
  /** Called whenever form data changes */
  onChange?: (data: T) => void;
  /** Called when form validation errors occur */
  onError?: (errors: BfDsFormErrorRecord<T>) => void;
  /** Additional CSS classes */
  className?: string;
  /** Test ID for testing purposes */
  testId?: string;
  /** Form content */
  children: React.ReactNode;
};

export type BfDsFormValue<T> = {
  errors?: BfDsFormErrorRecord<T>;
  data?: T;
  onChange?: (value: T) => void;
  onError?: (errors: BfDsFormErrorRecord<T>) => void;
  onSubmit?: (value: T) => void;
};
```

## Basic Usage

```tsx
import { BfDsForm, BfDsFormSubmitButton, BfDsInput } from "@bfmono/bfDs";

// Simple form
<BfDsForm
  initialData={{ name: "", email: "" }}
  onSubmit={(data) => handleSubmit(data)}
>
  <BfDsInput name="name" label="Name" required />
  <BfDsInput name="email" label="Email" type="email" required />
  <BfDsFormSubmitButton text="Submit" />
</BfDsForm>;
```

## Key Features

### Automatic Data Binding

Form fields automatically bind to form state using the `name` prop - no need for
individual `value` and `onChange` props:

```tsx
type UserData = {
  firstName: string;
  lastName: string;
  email: string;
  age: number;
  isActive: boolean;
};

<BfDsForm<UserData>
  initialData={{
    firstName: "",
    lastName: "",
    email: "",
    age: 0,
    isActive: true,
  }}
  onSubmit={handleSubmit}
>
  {/* These fields automatically sync with form state */}
  <BfDsInput name="firstName" label="First Name" />
  <BfDsInput name="lastName" label="Last Name" />
  <BfDsInput name="email" label="Email" type="email" />
  <BfDsInput name="age" label="Age" type="number" />
  <BfDsCheckbox name="isActive" label="Active User" />

  <BfDsFormSubmitButton text="Save User" />
</BfDsForm>;
```

### TypeScript Support

BfDsForm provides full TypeScript support with type inference:

```tsx
interface ContactForm {
  name: string;
  email: string;
  message: string;
  contactMethod: "email" | "phone";
  newsletter: boolean;
}

<BfDsForm<ContactForm>
  initialData={{
    name: "",
    email: "",
    message: "",
    contactMethod: "email",
    newsletter: false,
  }}
  onSubmit={(data: ContactForm) => {
    // data is fully typed as ContactForm
    console.log(data.name); // TypeScript knows this is a string
  }}
>
  <BfDsInput name="name" label="Name" />
  <BfDsInput name="email" label="Email" type="email" />
  <BfDsTextArea name="message" label="Message" />
  <BfDsRadio
    name="contactMethod"
    label="Contact Method"
    options={[
      { value: "email", label: "Email" },
      { value: "phone", label: "Phone" },
    ]}
  />
  <BfDsCheckbox name="newsletter" label="Newsletter" />
</BfDsForm>;
```

## Form Callbacks

### onSubmit

Called when the form is submitted (user clicks submit button or presses Enter):

```tsx
<BfDsForm
  initialData={formData}
  onSubmit={(data) => {
    console.log("Form submitted:", data);
    // Handle form submission - API call, validation, etc.
    submitToAPI(data);
  }}
>
  {/* Form fields */}
</BfDsForm>;
```

### onChange

Called whenever any form field changes - useful for real-time validation or
auto-save:

```tsx
<BfDsForm
  initialData={formData}
  onChange={(data) => {
    console.log("Form data changed:", data);
    // Auto-save draft
    localStorage.setItem("formDraft", JSON.stringify(data));
  }}
  onSubmit={handleSubmit}
>
  {/* Form fields */}
</BfDsForm>;
```

### onError

Called when validation errors occur:

```tsx
<BfDsForm
  initialData={formData}
  onError={(errors) => {
    console.log("Form validation errors:", errors);
    // Handle errors - show notifications, focus first error field, etc.
  }}
  onSubmit={handleSubmit}
>
  {/* Form fields */}
</BfDsForm>;
```

## Comprehensive Form Example

```tsx
interface RegistrationForm {
  profile: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  preferences: {
    newsletter: boolean;
    notifications: boolean;
    theme: "light" | "dark";
  };
  terms: {
    service: boolean;
    privacy: boolean;
  };
}

const initialData: RegistrationForm = {
  profile: {
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  },
  preferences: {
    newsletter: false,
    notifications: true,
    theme: "light",
  },
  terms: {
    service: false,
    privacy: false,
  },
};

<BfDsForm<RegistrationForm>
  initialData={initialData}
  onSubmit={async (data) => {
    try {
      await registerUser(data);
      showSuccessMessage("Registration successful!");
    } catch (error) {
      showErrorMessage("Registration failed. Please try again.");
    }
  }}
  onChange={(data) => {
    // Auto-save draft
    draftService.save("registration", data);
  }}
>
  <div className="form-section">
    <h3>Profile Information</h3>
    <BfDsInput
      name="profile.firstName"
      label="First Name"
      required
    />
    <BfDsInput
      name="profile.lastName"
      label="Last Name"
      required
    />
    <BfDsInput
      name="profile.email"
      label="Email Address"
      type="email"
      required
    />
    <BfDsInput
      name="profile.phone"
      label="Phone Number"
      type="tel"
    />
  </div>

  <div className="form-section">
    <h3>Preferences</h3>
    <BfDsCheckbox
      name="preferences.newsletter"
      label="Subscribe to newsletter"
    />
    <BfDsToggle
      name="preferences.notifications"
      label="Enable notifications"
    />
    <BfDsRadio
      name="preferences.theme"
      label="Theme Preference"
      options={[
        { value: "light", label: "Light Theme" },
        { value: "dark", label: "Dark Theme" },
      ]}
    />
  </div>

  <div className="form-section">
    <h3>Terms & Conditions</h3>
    <BfDsCheckbox
      name="terms.service"
      label="I agree to the Terms of Service"
      required
    />
    <BfDsCheckbox
      name="terms.privacy"
      label="I agree to the Privacy Policy"
      required
    />
  </div>

  <BfDsFormSubmitButton text="Create Account" />
</BfDsForm>;
```

## Supported Form Components

All BfDs form components automatically integrate with BfDsForm context:

### Text Inputs

```tsx
<BfDsInput name="username" label="Username" />
<BfDsTextArea name="description" label="Description" />
```

### Selection Components

```tsx
<BfDsSelect 
  name="country" 
  options={countryOptions} 
  label="Country" 
/>
<BfDsRadio 
  name="size" 
  options={sizeOptions} 
  label="Size" 
/>
```

### Boolean Components

```tsx
<BfDsCheckbox name="subscribe" label="Subscribe" />
<BfDsToggle name="enabled" label="Enable Feature" />
```

### Range Input

```tsx
<BfDsRange name="volume" label="Volume" min={0} max={100} />;
```

## Form Context Hook

Use the `useBfDsFormContext` hook to access form state in custom components:

```tsx
import { useBfDsFormContext } from "@bfmono/bfDs";

function CustomFormComponent() {
  const formContext = useBfDsFormContext<MyFormType>();

  if (!formContext) {
    return <div>Must be used within BfDsForm</div>;
  }

  const { data, errors, onChange } = formContext;

  return (
    <div>
      <p>Current form data: {JSON.stringify(data)}</p>
      <button onClick={() => onChange({ ...data, customField: "updated" })}>
        Update Custom Field
      </button>
    </div>
  );
}

// Usage within form
<BfDsForm initialData={data} onSubmit={handleSubmit}>
  <BfDsInput name="name" label="Name" />
  <CustomFormComponent />
  <BfDsFormSubmitButton />
</BfDsForm>;
```

## Common Patterns

### Form with Validation

```tsx
const validateForm = (data: FormData) => {
  const errors: any = {};

  if (!data.email?.includes("@")) {
    errors.email = {
      message: "Please enter a valid email",
      field: "email",
      type: "error",
    };
  }

  if (data.age && data.age < 18) {
    errors.age = {
      message: "Must be 18 or older",
      field: "age",
      type: "error",
    };
  }

  return Object.keys(errors).length > 0 ? errors : null;
};

<BfDsForm
  initialData={formData}
  onSubmit={(data) => {
    const errors = validateForm(data);
    if (errors) {
      // Handle validation errors
      return;
    }
    // Submit form
    handleSubmit(data);
  }}
>
  {/* Form fields */}
</BfDsForm>;
```

### Multi-Step Form

```tsx
const [currentStep, setCurrentStep] = useState(1);
const [formData, setFormData] = useState(initialFormData);

<BfDsForm
  initialData={formData}
  onChange={(data) => setFormData(data)}
  onSubmit={(data) => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      handleFinalSubmit(data);
    }
  }}
>
  {currentStep === 1 && (
    <div className="form-step">
      <BfDsInput name="firstName" label="First Name" />
      <BfDsInput name="lastName" label="Last Name" />
    </div>
  )}

  {currentStep === 2 && (
    <div className="form-step">
      <BfDsInput name="email" label="Email" type="email" />
      <BfDsInput name="phone" label="Phone" type="tel" />
    </div>
  )}

  <div className="form-navigation">
    {currentStep > 1 && (
      <BfDsButton
        variant="secondary"
        onClick={() => setCurrentStep(currentStep - 1)}
      >
        Previous
      </BfDsButton>
    )}
    <BfDsFormSubmitButton
      text={currentStep < totalSteps ? "Next" : "Submit"}
    />
  </div>
</BfDsForm>;
```

## Best Practices

### Type Safety

- Always provide TypeScript types for your form data
- Use specific types rather than generic `Record<string, any>`
- Leverage type inference for better development experience

### Performance

- Use `onChange` sparingly for expensive operations
- Consider debouncing auto-save functionality
- Avoid deep nesting in form data structure when possible

### User Experience

- Provide immediate feedback through `onChange`
- Use proper validation with helpful error messages
- Consider progressive enhancement with multi-step forms
- Always include a submit button for accessibility

### Error Handling

- Validate on both client and server
- Provide specific, actionable error messages
- Use appropriate form states (error, success) for visual feedback

## Accessibility

BfDsForm maintains accessibility standards:

- **Form semantics** - Proper `<form>` element with submit handling
- **Field association** - All form fields are properly associated with labels
- **Error announcement** - Form errors are announced to screen readers
- **Keyboard navigation** - Full keyboard support for form submission
- **Focus management** - Proper focus handling during validation

## Styling Notes

BfDsForm uses the `bfds-form` CSS class for the form element. Individual form
components maintain their own styling while participating in the form context.

The component automatically handles:

- Form submission prevention and custom handling
- Context value updates and propagation
- Error state management across form fields
- TypeScript type safety for form data
