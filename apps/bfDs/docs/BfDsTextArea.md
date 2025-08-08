# BfDsTextArea

A multi-line text input component that supports form integration, validation
states, and flexible resize behavior. The component provides both controlled and
uncontrolled usage patterns and integrates seamlessly with the BfDsForm context.

## Props

```typescript
export type BfDsTextAreaState = "default" | "error" | "success" | "disabled";

export type BfDsTextAreaProps =
  & {
    // Form context props
    /** Form field name for data binding */
    name?: string;

    // Standalone props
    /** Current textarea value (controlled) */
    value?: string;
    /** Default value for uncontrolled usage */
    defaultValue?: string;
    /** Change event handler */
    onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;

    // Common props
    /** Label text displayed above textarea */
    label?: string;
    /** Placeholder text when empty */
    placeholder?: string;
    /** Required for validation */
    required?: boolean;
    /** Visual state of the textarea */
    state?: BfDsTextAreaState;
    /** Error message to display */
    errorMessage?: string;
    /** Success message to display */
    successMessage?: string;
    /** Help text displayed below textarea */
    helpText?: string;
    /** Additional CSS classes */
    className?: string;
    /** Resize behavior for textarea */
    resize?: "none" | "both" | "horizontal" | "vertical";
  }
  & Omit<
    React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    "value" | "onChange"
  >;
```

## Basic Usage

```tsx
import { BfDsTextArea } from "@bfmono/bfDs";

// Simple textarea
<BfDsTextArea 
  label="Message"
  placeholder="Enter your message..."
  value={message}
  onChange={(e) => setMessage(e.target.value)}
/>

// With help text
<BfDsTextArea
  label="Description"
  placeholder="Describe your project..."
  helpText="Please provide as much detail as possible"
  rows={4}
/>
```

## Controlled vs Uncontrolled Usage

### Controlled Component

Use when you need to manage the textarea value in your component state:

```tsx
const [description, setDescription] = useState("");

<BfDsTextArea
  label="Project Description"
  value={description}
  onChange={(e) => setDescription(e.target.value)}
  placeholder="Tell us about your project..."
  helpText={`Characters: ${description.length}`}
/>;
```

### Uncontrolled Component

Use when you want the component to manage its own state internally:

```tsx
// With default value
<BfDsTextArea
  label="Comments"
  defaultValue="Initial comment text"
  placeholder="Add your comments..."
  rows={3}
/>

// Without default value
<BfDsTextArea
  label="Notes"
  placeholder="Add notes here..."
/>
```

## Form Integration

BfDsTextArea automatically integrates with BfDsForm when used within a form
context:

```tsx
const [formData, setFormData] = useState({
  title: "",
  description: "",
  notes: "",
});

<BfDsForm
  initialData={formData}
  onSubmit={handleSubmit}
  onChange={setFormData}
>
  <BfDsInput name="title" label="Title" />

  <BfDsTextArea
    name="description"
    label="Description"
    placeholder="Describe your project..."
    required
    rows={4}
  />

  <BfDsTextArea
    name="notes"
    label="Additional Notes"
    placeholder="Any additional information..."
    rows={3}
  />

  <BfDsFormSubmitButton text="Save Project" />
</BfDsForm>;
```

## States

BfDsTextArea supports different visual states:

### Default State

```tsx
<BfDsTextArea
  label="Normal Input"
  placeholder="Enter text here..."
  state="default"
/>;
```

### Error State

```tsx
<BfDsTextArea
  label="Description"
  placeholder="Enter description..."
  state="error"
  errorMessage="Description must be at least 10 characters long"
/>;
```

### Success State

```tsx
<BfDsTextArea
  label="Biography"
  value={validBio}
  onChange={(e) => setValidBio(e.target.value)}
  state="success"
  successMessage="Biography looks great!"
/>;
```

### Disabled State

```tsx
<BfDsTextArea
  label="System Message"
  value="This content cannot be modified"
  state="disabled"
  disabled
/>;
```

## Resize Behavior

Control how users can resize the textarea:

```tsx
// No resizing allowed
<BfDsTextArea
  label="Fixed Size"
  resize="none"
  rows={3}
/>

// Vertical resizing only (default)
<BfDsTextArea
  label="Adjust Height"
  resize="vertical"
  rows={3}
/>

// Horizontal resizing only
<BfDsTextArea
  label="Adjust Width"
  resize="horizontal"
  rows={3}
/>

// Both directions
<BfDsTextArea
  label="Fully Resizable"
  resize="both"
  rows={3}
/>
```

## Size Variations

Use the standard HTML `rows` and `cols` attributes to control size:

```tsx
// Small textarea
<BfDsTextArea
  label="Brief Note"
  placeholder="Short note..."
  rows={2}
/>

// Medium textarea
<BfDsTextArea
  label="Description"
  placeholder="Project description..."
  rows={4}
/>

// Large textarea
<BfDsTextArea
  label="Detailed Report"
  placeholder="Write your report..."
  rows={8}
/>

// Wide textarea
<BfDsTextArea
  label="Code Snippet"
  placeholder="Paste your code..."
  rows={6}
  cols={80}
/>
```

## Validation and Constraints

Use HTML attributes and custom validation:

```tsx
const [content, setContent] = useState("");
const maxLength = 500;
const minLength = 10;

const isValid = content.length >= minLength && content.length <= maxLength;
const hasError = content.length > 0 && !isValid;

<BfDsTextArea
  label="Article Content"
  value={content}
  onChange={(e) => setContent(e.target.value)}
  placeholder={`Write your article (${minLength}-${maxLength} characters)...`}
  maxLength={maxLength}
  required
  state={hasError ? "error" : (isValid ? "success" : "default")}
  errorMessage={content.length < minLength
    ? `Content must be at least ${minLength} characters`
    : `Content cannot exceed ${maxLength} characters`}
  successMessage="Content length looks good!"
  helpText={`${content.length}/${maxLength} characters`}
  rows={5}
/>;
```

## Common Use Cases

### Character Counter

```tsx
const [text, setText] = useState("");
const maxChars = 280;

<BfDsTextArea
  label="Tweet"
  value={text}
  onChange={(e) => setText(e.target.value)}
  placeholder="What's happening?"
  maxLength={maxChars}
  helpText={`${text.length}/${maxChars} characters`}
  state={text.length > maxChars ? "error" : "default"}
  errorMessage="Tweet is too long"
  rows={3}
/>;
```

### Auto-growing TextArea

```tsx
const [content, setContent] = useState("");
const estimatedRows = Math.max(3, Math.ceil(content.length / 50));

<BfDsTextArea
  label="Dynamic Content"
  value={content}
  onChange={(e) => setContent(e.target.value)}
  placeholder="Start typing..."
  rows={estimatedRows}
  resize="none"
  helpText="Textarea grows as you type"
/>;
```

### Rich Text Preparation

```tsx
const [markdown, setMarkdown] = useState("");

<BfDsTextArea
  label="Markdown Content"
  value={markdown}
  onChange={(e) => setMarkdown(e.target.value)}
  placeholder="Write in markdown format..."
  helpText="Supports **bold**, *italic*, and [links](url)"
  rows={8}
  resize="vertical"
  className="monospace-font"
/>;
```

### Form Validation

```tsx
const validateDescription = (value) => {
  if (!value) return "Description is required";
  if (value.length < 20) return "Description must be at least 20 characters";
  if (value.length > 500) return "Description cannot exceed 500 characters";
  return null;
};

const [description, setDescription] = useState("");
const [error, setError] = useState(null);

const handleChange = (e) => {
  const value = e.target.value;
  setDescription(value);
  setError(validateDescription(value));
};

<BfDsTextArea
  label="Product Description"
  value={description}
  onChange={handleChange}
  placeholder="Describe your product..."
  required
  state={error ? "error" : "default"}
  errorMessage={error}
  helpText="Provide a detailed description of your product (20-500 characters)"
  rows={4}
  maxLength={500}
/>;
```

### Read-Only Display

```tsx
<BfDsTextArea
  label="Generated Report"
  value={generatedContent}
  readOnly
  rows={8}
  resize="none"
  helpText="This content was automatically generated"
  className="readonly-content"
/>;
```

## Accessibility

BfDsTextArea includes comprehensive accessibility features:

- **Semantic HTML** - Uses proper `textarea` element with labels
- **ARIA attributes** - Includes `aria-describedby` and `aria-invalid`
- **Screen reader support** - Help text, error messages, and success messages
  are properly associated
- **Keyboard navigation** - Full keyboard support with Tab navigation
- **Focus management** - Clear visual focus indicators
- **Required field indicators** - Visual and semantic marking of required fields

### Best Practices

- Always provide descriptive labels for screen readers
- Use help text to explain formatting requirements or constraints
- Provide clear error messages that explain how to fix the issue
- Use appropriate `rows` and `cols` attributes to set reasonable default sizes
- Consider the resize behavior based on your layout requirements
- Test keyboard navigation and screen reader compatibility

## Styling Notes

BfDsTextArea uses CSS classes with the `bfds-textarea` prefix:

- `.bfds-textarea-container` - Container wrapper
- `.bfds-textarea` - The textarea element itself
- `.bfds-textarea-label` - Label styling
- `.bfds-textarea-help` - Help text styling
- `.bfds-textarea-error` - Error message styling
- `.bfds-textarea-success` - Success message styling
- `.bfds-textarea--{state}` - State-specific styling
- `.bfds-textarea--resize-{direction}` - Resize-specific styling

The component automatically:

- Manages focus states and visual feedback
- Handles state transitions smoothly
- Provides consistent spacing and typography
- Ensures proper color contrast for all states
- Scales appropriately with different content sizes
