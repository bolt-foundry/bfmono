# BfDsToast

A toast notification system built on top of BfDsCallout, providing temporary
messages that appear in the corner of the screen. Toasts automatically disappear
after a timeout and can include detailed information, custom callbacks, and
visual feedback.

## Types

```typescript
export type BfDsToastItem = {
  id: string;
  message: React.ReactNode;
  variant?: BfDsCalloutVariant;
  details?: string;
  timeout?: number;
  onDismiss?: () => void;
};

export const TOAST_TRANSITION_DURATION = 300; // milliseconds
```

## Setup Required

Toast notifications require the BfDsProvider at your application root:

```tsx
import { BfDsProvider } from "@bfmono/bfDs";

function App() {
  return (
    <BfDsProvider>
      <YourAppContent />
    </BfDsProvider>
  );
}
```

You also need a `toast-root` element in your HTML:

```html
<!DOCTYPE html>
<html>
  <body>
    <div id="root"></div>
    <div id="toast-root"></div>
    <!-- Toasts render here -->
  </body>
</html>
```

## Using Toast Notifications

### Basic Usage

```tsx
import { useBfDsToast } from "@bfmono/bfDs";

function MyComponent() {
  const { showToast } = useBfDsToast();

  return (
    <div>
      <button onClick={() => showToast("Hello World!")}>
        Show Basic Toast
      </button>
      <button onClick={() => showToast("Success!", { variant: "success" })}>
        Show Success Toast
      </button>
    </div>
  );
}
```

### Toast Variants

Toasts support all BfDsCallout variants:

```tsx
const { showToast } = useBfDsToast();

// Info toast (default)
showToast("Information message", { variant: "info" });

// Success toast
showToast("Operation completed!", { variant: "success" });

// Warning toast
showToast("Please check your input", { variant: "warning" });

// Error toast
showToast("Something went wrong", { variant: "error" });
```

### Timeout Control

```tsx
// Default 5-second timeout
showToast("Auto-dismiss in 5 seconds");

// Custom timeout
showToast("Auto-dismiss in 10 seconds", { timeout: 10000 });

// No auto-dismiss (user must manually close)
showToast("Stays until dismissed", { timeout: 0 });

// Quick notification
showToast("Quick message", { timeout: 2000 });
```

### Detailed Information

Add expandable details to toasts:

```tsx
showToast("API request completed", {
  variant: "success",
  details: JSON.stringify(
    {
      endpoint: "/api/users",
      method: "POST",
      status: 201,
      duration: "1.2s",
    },
    null,
    2,
  ),
});

showToast("Process completed", {
  variant: "info",
  details: `
    - 150 items processed
    - 3 warnings encountered
    - 0 errors
    - Total time: 45 seconds
  `,
});
```

### Custom Callbacks

React to toast dismissal:

```tsx
showToast("File uploaded successfully", {
  variant: "success",
  timeout: 5000,
  onDismiss: () => {
    console.log("Toast was dismissed");
    // Refresh data, log analytics, etc.
  },
});

showToast("Connection restored", {
  variant: "success",
  onDismiss: () => {
    // Re-enable features that were disabled
    setConnectionStatus("connected");
  },
});
```

### Custom IDs

Manage specific toasts by ID:

```tsx
const { showToast, hideToast } = useBfDsToast();

// Show with custom ID
const toastId = showToast("Processing...", {
  timeout: 0,
  id: "process-status",
});

// Later, hide specific toast
hideToast(toastId);

// Or use your own ID
showToast("Custom ID toast", { id: "my-toast" });
hideToast("my-toast");
```

## Hook API

### showToast

```tsx
const toastId = showToast(message, options);
```

**Parameters:**

- `message` (ReactNode): The main toast content
- `options` (object, optional):
  - `variant` - Toast visual style: "info" | "success" | "warning" | "error"
  - `details` - Expandable detail text
  - `timeout` - Auto-dismiss time in milliseconds (0 = no timeout)
  - `onDismiss` - Callback when toast is dismissed
  - `id` - Custom toast ID

**Returns:** Toast ID string

### hideToast

```tsx
hideToast(toastId);
```

**Parameters:**

- `toastId` (string): ID of toast to hide

### clearAllToasts

```tsx
clearAllToasts();
```

Removes all currently displayed toasts.

## Common Patterns

### Form Submission Feedback

```tsx
function FormComponent() {
  const { showToast } = useBfDsToast();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data) => {
    setLoading(true);

    try {
      await submitForm(data);
      showToast("Form submitted successfully!", {
        variant: "success",
        timeout: 3000,
      });
    } catch (error) {
      showToast("Failed to submit form", {
        variant: "error",
        details: error.message,
        timeout: 0, // Keep error visible until dismissed
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* form fields */}
      <button type="submit" disabled={loading}>
        {loading ? "Submitting..." : "Submit"}
      </button>
    </form>
  );
}
```

### API Status Updates

```tsx
function ApiComponent() {
  const { showToast } = useBfDsToast();

  const fetchData = async () => {
    const loadingToastId = showToast("Loading data...", {
      variant: "info",
      timeout: 0,
      id: "data-loading",
    });

    try {
      const data = await api.getData();

      // Hide loading toast
      hideToast(loadingToastId);

      // Show success
      showToast(`Loaded ${data.length} items`, {
        variant: "success",
        timeout: 3000,
      });
    } catch (error) {
      // Hide loading toast
      hideToast(loadingToastId);

      // Show error
      showToast("Failed to load data", {
        variant: "error",
        details: `Error: ${error.message}`,
        timeout: 0,
      });
    }
  };

  return <button onClick={fetchData}>Load Data</button>;
}
```

### Progressive Operations

```tsx
function ProgressiveOperation() {
  const { showToast, hideToast } = useBfDsToast();

  const runLongProcess = async () => {
    // Step 1
    const step1Toast = showToast("Step 1: Preparing data...", {
      variant: "info",
      timeout: 0,
      id: "step-1",
    });

    await performStep1();
    hideToast(step1Toast);

    // Step 2
    const step2Toast = showToast("Step 2: Processing...", {
      variant: "info",
      timeout: 0,
      id: "step-2",
    });

    await performStep2();
    hideToast(step2Toast);

    // Complete
    showToast("All steps completed successfully!", {
      variant: "success",
      timeout: 5000,
      onDismiss: () => {
        // Refresh UI or redirect
        window.location.reload();
      },
    });
  };

  return <button onClick={runLongProcess}>Start Process</button>;
}
```

### Connection Status

```tsx
function ConnectionMonitor() {
  const { showToast } = useBfDsToast();
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      showToast("Connection restored", {
        variant: "success",
        timeout: 3000,
      });
    };

    const handleOffline = () => {
      setIsOnline(false);
      showToast("Connection lost", {
        variant: "warning",
        timeout: 0, // Keep visible until connection restored
      });
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [showToast]);

  return (
    <div>
      Status: {isOnline ? "Online" : "Offline"}
    </div>
  );
}
```

## Toast Behavior

### Positioning

- Toasts appear in the bottom-right corner by default
- New toasts are added to the bottom of the stack
- Toasts stack vertically with consistent spacing

### Animation

- **Entrance**: Slides in from the right with opacity fade
- **Exit**: Slides out to the right with opacity fade
- **Duration**: 300ms transition (configurable via `TOAST_TRANSITION_DURATION`)

### Auto-Dismiss

- Default timeout: 5000ms (5 seconds)
- Countdown indicator on close button
- Hover pauses countdown (ring pulsing indicates pause)
- Set `timeout: 0` to disable auto-dismiss

### Interaction

- Click X button to dismiss manually
- Toasts with details can be expanded/collapsed
- Keyboard accessible (focus management)

## Accessibility

### Screen Reader Support

- Toast content is announced when displayed
- Proper ARIA labeling for dismiss buttons
- Semantic structure for details expansion

### Keyboard Navigation

- Toasts can receive focus
- Tab navigation through interactive elements
- Escape key dismisses focused toast

### Visual Indicators

- Color coding for different toast types
- Icons provide additional context
- Countdown ring shows remaining time

## Best Practices

### Message Guidelines

- Keep messages concise and actionable
- Use appropriate variants for context
- Provide details for complex operations
- Include recovery actions when possible

### Timing

- Use shorter timeouts for confirmations (2-3 seconds)
- Use longer timeouts for informational messages (5-8 seconds)
- No timeout for errors that require user action
- No timeout for critical warnings

### User Experience

- Don't overwhelm users with too many toasts
- Clear previous related toasts before showing new ones
- Provide context about what triggered the toast
- Use consistent language across your application

### Performance

- Clean up toast event listeners
- Avoid showing toasts in tight loops
- Use toast IDs to prevent duplicates
- Clear toasts when navigating away from pages

## Technical Details

### Portal Rendering

Toasts use React portals to render outside the normal component tree:

- Rendered into `#toast-root` element
- Avoid z-index conflicts with modals
- Independent of parent component styling

### State Management

- Toast state managed by BfDsToastProvider context
- Each toast has unique ID for tracking
- Automatic cleanup on component unmount
- Memory efficient with configurable limits

### Integration with BfDsCallout

- Toasts are essentially positioned BfDsCallout components
- Inherit all BfDsCallout features (variants, details, etc.)
- Consistent styling across the design system
- Same accessibility patterns
