# BfDsModal

A modal dialog component for displaying content in an overlay above the main
application. Includes automatic focus management, backdrop controls, and
keyboard accessibility features.

## Props

```typescript
export interface BfDsModalProps {
  /** Controls whether the modal is visible (required) */
  isOpen: boolean;
  /** Callback when the modal should be closed (required) */
  onClose: () => void;
  /** The title displayed in the modal header */
  title?: string;
  /** The modal content */
  children: ReactNode;
  /** Custom footer content. If not provided, no footer is shown */
  footer?: ReactNode;
  /** Size variant of the modal */
  size?: "small" | "medium" | "large" | "fullscreen";
  /** Whether clicking the backdrop closes the modal */
  closeOnBackdropClick?: boolean;
  /** Whether pressing Escape closes the modal */
  closeOnEscape?: boolean;
  /** Additional CSS class name */
  className?: string;
  /** Whether to show the close button in the header */
  showCloseButton?: boolean;
}
```

## Basic Usage

```tsx
import { BfDsModal, BfDsButton } from "@bfmono/bfDs";

const [isOpen, setIsOpen] = useState(false);

// Simple modal
<BfDsModal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Simple Modal"
>
  <p>This is a simple modal with basic content.</p>
</BfDsModal>

// Modal with footer
<BfDsModal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Modal with Actions"
  footer={
    <>
      <BfDsButton variant="outline" onClick={() => setIsOpen(false)}>
        Cancel
      </BfDsButton>
      <BfDsButton variant="primary" onClick={handleSave}>
        Save
      </BfDsButton>
    </>
  }
>
  <p>Modal content with action buttons in the footer.</p>
</BfDsModal>
```

## Modal Sizes

### Small Modal

Compact modal for simple interactions:

```tsx
<BfDsModal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Confirm Action"
  size="small"
  footer={
    <>
      <BfDsButton variant="outline" onClick={() => setIsOpen(false)}>
        Cancel
      </BfDsButton>
      <BfDsButton variant="primary" onClick={handleConfirm}>
        Confirm
      </BfDsButton>
    </>
  }
>
  <p>Are you sure you want to delete this item?</p>
</BfDsModal>;
```

### Medium Modal (Default)

Standard size for most modal content:

```tsx
<BfDsModal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Edit Profile"
  size="medium"
>
  <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
    <BfDsInput label="Name" defaultValue="John Doe" />
    <BfDsInput label="Email" type="email" defaultValue="john@example.com" />
    <BfDsTextArea label="Bio" rows={3} />
  </div>
</BfDsModal>;
```

### Large Modal

Spacious modal for complex content:

```tsx
<BfDsModal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Project Settings"
  size="large"
>
  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
    <div>
      <h3>General Settings</h3>
      <BfDsInput label="Project Name" />
      <BfDsSelect label="Category" options={[]} />
    </div>
    <div>
      <h3>Advanced Settings</h3>
      <BfDsCheckbox label="Enable notifications" />
      <BfDsCheckbox label="Public project" />
    </div>
  </div>
</BfDsModal>;
```

### Fullscreen Modal

Takes up the entire viewport:

```tsx
<BfDsModal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Document Editor"
  size="fullscreen"
>
  <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
    <div>Toolbar</div>
    <div style={{ flex: 1, border: "1px solid #ccc", padding: "1rem" }}>
      Document content editor area...
    </div>
  </div>
</BfDsModal>;
```

## Form Modals

Perfect for creating and editing data:

```tsx
const [formData, setFormData] = useState({ name: "", description: "" });

<BfDsModal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Create New Project"
  footer={
    <>
      <BfDsButton
        variant="outline"
        onClick={() => setIsOpen(false)}
      >
        Cancel
      </BfDsButton>
      <BfDsButton
        variant="primary"
        onClick={handleCreate}
        disabled={!formData.name}
      >
        Create Project
      </BfDsButton>
    </>
  }
>
  <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
    <BfDsInput
      label="Project Name"
      value={formData.name}
      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
      placeholder="Enter project name"
      required
    />
    <BfDsTextArea
      label="Description"
      value={formData.description}
      onChange={(e) =>
        setFormData({ ...formData, description: e.target.value })}
      placeholder="Describe your project"
      rows={4}
    />
  </div>
</BfDsModal>;
```

## Confirmation Modals

For important or destructive actions:

```tsx
<BfDsModal
  isOpen={deleteModalOpen}
  onClose={() => setDeleteModalOpen(false)}
  title="Delete Project"
  size="small"
  footer={
    <>
      <BfDsButton variant="outline" onClick={() => setDeleteModalOpen(false)}>
        Cancel
      </BfDsButton>
      <BfDsButton variant="danger" onClick={handleDelete}>
        Delete
      </BfDsButton>
    </>
  }
>
  <p>
    Are you sure you want to delete this project? This action cannot be undone.
  </p>
  <div
    style={{
      padding: "12px",
      backgroundColor: "var(--bfds-warning-surface)",
      borderRadius: "6px",
      marginTop: "1rem",
    }}
  >
    <strong>Warning:</strong>{" "}
    All project data and associated files will be permanently deleted.
  </div>
</BfDsModal>;
```

## Information Modals

For displaying read-only information:

```tsx
<BfDsModal
  isOpen={infoModalOpen}
  onClose={() => setInfoModalOpen(false)}
  title="System Information"
>
  <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
    <div>
      <strong>Version:</strong> 2.1.4
    </div>
    <div>
      <strong>Last Updated:</strong> March 15, 2024
    </div>
    <div>
      <strong>Environment:</strong> Production
    </div>
    <div>
      <strong>Status:</strong> All systems operational
    </div>
  </div>
</BfDsModal>;
```

## Backdrop and Close Behavior

### Default Behavior

By default, modals can be closed by:

- Clicking the backdrop
- Pressing the Escape key
- Clicking the close button (X)

### Prevent Accidental Closure

For critical actions, disable easy dismissal:

```tsx
<BfDsModal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Important Action Required"
  closeOnBackdropClick={false}
  closeOnEscape={false}
  showCloseButton={false}
  footer={
    <BfDsButton variant="primary" onClick={handleComplete}>
      I Understand
    </BfDsButton>
  }
>
  <p>Please read this important information carefully.</p>
  <p>You must acknowledge this message to continue.</p>
</BfDsModal>;
```

### Custom Close Handling

```tsx
<BfDsModal
  isOpen={isOpen}
  onClose={handleModalClose}
  title="Unsaved Changes"
  closeOnBackdropClick={false}
  footer={
    <>
      <BfDsButton variant="outline" onClick={handleDiscard}>
        Discard Changes
      </BfDsButton>
      <BfDsButton variant="primary" onClick={handleSave}>
        Save & Close
      </BfDsButton>
    </>
  }
>
  <p>You have unsaved changes. What would you like to do?</p>
</BfDsModal>;
```

## Multi-Step Modals

For wizards and multi-step processes:

```tsx
const [step, setStep] = useState(1);
const totalSteps = 3;

<BfDsModal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title={`Setup Wizard - Step ${step} of ${totalSteps}`}
  footer={
    <>
      <BfDsButton
        variant="outline"
        onClick={() => step > 1 ? setStep(step - 1) : setIsOpen(false)}
      >
        {step > 1 ? "Previous" : "Cancel"}
      </BfDsButton>
      <BfDsButton
        variant="primary"
        onClick={() => step < totalSteps ? setStep(step + 1) : handleFinish()}
      >
        {step < totalSteps ? "Next" : "Finish"}
      </BfDsButton>
    </>
  }
>
  {step === 1 && (
    <div>
      <h3>Welcome</h3>
      <p>Let's get you set up with your new account.</p>
    </div>
  )}
  {step === 2 && (
    <div>
      <h3>Profile Information</h3>
      <BfDsInput label="Display Name" />
    </div>
  )}
  {step === 3 && (
    <div>
      <h3>Preferences</h3>
      <BfDsCheckbox label="Email notifications" />
    </div>
  )}
</BfDsModal>;
```

## Accessibility Features

### Focus Management

BfDsModal automatically:

- Traps focus within the modal when open
- Focuses the modal container on open
- Returns focus to the previously focused element on close
- Manages tab order within the modal

### Keyboard Navigation

- **Escape Key**: Closes modal (unless disabled)
- **Tab/Shift+Tab**: Navigates through focusable elements
- **Enter/Space**: Activates buttons and other interactive elements

### Screen Reader Support

- Uses proper ARIA attributes (`role="dialog"`, `aria-modal="true"`)
- Associates title with modal using `aria-labelledby`
- Provides semantic structure for assistive technologies

## Body Scroll Prevention

When a modal is open:

- Body scrolling is automatically disabled
- Scroll position is preserved
- Scrolling is restored when modal closes

## Common Patterns

### Loading States in Modals

```tsx
const [loading, setLoading] = useState(false);

<BfDsModal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Processing..."
  footer={
    <BfDsButton
      variant="primary"
      disabled={loading}
      onClick={handleSubmit}
    >
      {loading ? <BfDsSpinner size="small" /> : "Submit"}
    </BfDsButton>
  }
>
  {loading
    ? (
      <div style={{ textAlign: "center", padding: "2rem" }}>
        <BfDsSpinner />
        <p>Processing your request...</p>
      </div>
    )
    : <p>Click submit to process your request.</p>}
</BfDsModal>;
```

### Error States in Modals

```tsx
<BfDsModal
  isOpen={errorModalOpen}
  onClose={() => setErrorModalOpen(false)}
  title="Error"
  footer={
    <>
      <BfDsButton variant="outline" onClick={handleRetry}>
        Try Again
      </BfDsButton>
      <BfDsButton variant="primary" onClick={() => setErrorModalOpen(false)}>
        Close
      </BfDsButton>
    </>
  }
>
  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
    <BfDsIcon name="alertCircle" size="large" color="var(--bfds-error)" />
    <div>
      <p>Something went wrong while processing your request.</p>
      <p style={{ fontSize: "14px", color: "var(--bfds-text-secondary)" }}>
        Error: {errorMessage}
      </p>
    </div>
  </div>
</BfDsModal>;
```

## Best Practices

### Content Organization

- Keep modal content focused and concise
- Use clear, action-oriented titles
- Place primary actions on the right in footers
- Limit modal complexity to avoid overwhelming users

### User Experience

- Provide clear ways to close the modal
- Use appropriate sizes for content
- Consider the user's context when showing modals
- Avoid stacking multiple modals

### Accessibility

- Always provide meaningful titles
- Ensure sufficient color contrast
- Test with keyboard navigation
- Verify screen reader compatibility

## Styling Notes

BfDsModal uses CSS classes with the `bfds-modal` prefix:

- `.bfds-modal-backdrop` - Background overlay
- `.bfds-modal` - Main modal container
- `.bfds-modal--{size}` - Size-specific styling
- `.bfds-modal-header` - Header section
- `.bfds-modal-title` - Title text styling
- `.bfds-modal-close` - Close button styling
- `.bfds-modal-body` - Main content area
- `.bfds-modal-footer` - Footer section

The component automatically handles:

- Responsive sizing based on screen size
- Proper z-index layering
- Smooth transitions and animations
- Focus outline styling
