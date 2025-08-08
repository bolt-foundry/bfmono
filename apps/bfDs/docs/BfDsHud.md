# BfDsHud

A floating heads-up display (HUD) component for development tools, debugging,
and admin actions. The HUD provides a console interface with customizable action
buttons, message logging, and two general-purpose input fields.

## Props

The BfDsHud component doesn't take direct props. Instead, it uses the
BfDsHudContext for state management and configuration.

## Context Interface

```typescript
export interface BfDsHudButton {
  id: string;
  label: string;
  onClick: () => void;
  icon?: string;
  variant?:
    | "primary"
    | "secondary"
    | "ghost"
    | "outline"
    | "outline-secondary"
    | "ghost-primary";
  toggleable?: boolean;
  value?: boolean;
  onToggle?: (value: boolean) => void;
}

export interface BfDsHudMessage {
  id: string;
  content: string;
  timestamp: number;
  type?: "info" | "success" | "warning" | "error";
}
```

## Setup

### 1. Provider Setup

Wrap your application with the BfDsHudProvider:

```tsx
import { BfDsHudProvider } from "@bfmono/bfDs/contexts/BfDsHudContext";
import { BfDsHud } from "@bfmono/bfDs";

function App() {
  return (
    <BfDsHudProvider>
      <YourApp />
      <BfDsHud />
    </BfDsHudProvider>
  );
}
```

### 2. Using the Hooks

```tsx
import {
  useBfDsHud,
  useBfDsHudButtons,
  useBfDsHudConsole,
  useBfDsHudInputs,
} from "@bfmono/bfDs/contexts/BfDsHudContext";

// Main HUD control
const { showHud, hideHud, toggleHud, isVisible } = useBfDsHud();

// Button management
const { addButton, removeButton } = useBfDsHudButtons();

// Console messaging
const { sendMessage, clearMessages } = useBfDsHudConsole();

// Input field access
const { input1, input2, setInput1, setInput2, getInputs } = useBfDsHudInputs();
```

## Basic Usage

### Show/Hide HUD

```tsx
const { showHud, hideHud, toggleHud, isVisible } = useBfDsHud();

// Control HUD visibility
<button onClick={showHud}>Show HUD</button>
<button onClick={hideHud}>Hide HUD</button>
<button onClick={toggleHud}>Toggle HUD</button>

// Check if HUD is visible
{isVisible ? "HUD is open" : "HUD is closed"}
```

### Adding Action Buttons

```tsx
const { addButton, removeButton } = useBfDsHudButtons();
const { sendMessage } = useBfDsHudConsole();

useEffect(() => {
  // Add a simple action button
  addButton({
    id: "hello-world",
    label: "Say Hello",
    icon: "messageSquare",
    onClick: () => {
      sendMessage("Hello, World!", "info");
    },
  });

  // Cleanup
  return () => removeButton("hello-world");
}, [addButton, removeButton, sendMessage]);
```

### Console Messaging

```tsx
const { sendMessage, clearMessages } = useBfDsHudConsole();

// Send different message types
sendMessage("Information message", "info");
sendMessage("Success message", "success");
sendMessage("Warning message", "warning");
sendMessage("Error message", "error");

// Clear all messages
clearMessages();
```

### Input Field Usage

```tsx
const { input1, input2, setInput1, setInput2, getInputs } = useBfDsHudInputs();

// Set input values programmatically
setInput1("api.example.com");
setInput2("auth-token-123");

// Read current input values
const { input1: currentInput1, input2: currentInput2 } = getInputs();

// Use inputs in button actions
addButton({
  id: "api-test",
  label: "Test API",
  icon: "server",
  onClick: () => {
    const { input1: endpoint, input2: token } = getInputs();
    sendMessage(`Testing ${endpoint} with token ${token}`, "info");
  },
});
```

## Button Types

### Regular Buttons

```tsx
addButton({
  id: "action-1",
  label: "Run Action",
  icon: "play",
  variant: "primary",
  onClick: () => {
    // Perform action
    sendMessage("Action completed", "success");
  },
});
```

### Toggleable Buttons

```tsx
const [featureEnabled, setFeatureEnabled] = useState(false);

addButton({
  id: "feature-toggle",
  label: "Feature Flag",
  toggleable: true,
  value: featureEnabled,
  variant: "ghost",
  onToggle: (newValue) => {
    setFeatureEnabled(newValue);
    sendMessage(
      `Feature ${newValue ? "enabled" : "disabled"}`,
      newValue ? "success" : "info",
    );
  },
  onClick: () => {
    // Optional additional action on click
  },
});
```

## Message Types

### Info Messages

```tsx
sendMessage("General information", "info");
```

### Success Messages

```tsx
sendMessage("Operation completed successfully", "success");
```

### Warning Messages

```tsx
sendMessage("Check your configuration", "warning");
```

### Error Messages

```tsx
sendMessage("Something went wrong", "error");
```

## Features

### Draggable Interface

- The HUD is draggable by clicking and dragging the header
- Position is automatically saved to localStorage
- Constrains to screen boundaries
- Handles window resize events

### Message Navigation

- View message history with navigation controls
- Shows current message index (e.g., "3/10")
- Navigate with previous/next buttons
- Clear all messages button

### Input Fields

- Two general-purpose input fields
- Access values in button actions
- Persistent across HUD sessions

## Common Use Cases

### Development Tools

```tsx
// API testing
addButton({
  id: "api-test",
  label: "Test Endpoint",
  icon: "server",
  onClick: async () => {
    const { input1: endpoint } = getInputs();
    sendMessage(`Testing ${endpoint}...`, "info");

    try {
      const response = await fetch(endpoint);
      sendMessage(`Response: ${response.status}`, "success");
    } catch (error) {
      sendMessage(`Error: ${error.message}`, "error");
    }
  },
});
```

### Feature Flags

```tsx
const [debugMode, setDebugMode] = useState(false);

addButton({
  id: "debug-toggle",
  label: "Debug Mode",
  toggleable: true,
  value: debugMode,
  onToggle: (enabled) => {
    setDebugMode(enabled);
    // Update global debug state
    window.DEBUG = enabled;
    sendMessage(`Debug mode ${enabled ? "ON" : "OFF"}`, "success");
  },
  onClick: () => {}, // Required but can be empty
});
```

### Admin Actions

```tsx
addButton({
  id: "user-action",
  label: "Admin Action",
  icon: "user",
  variant: "primary",
  onClick: async () => {
    const { input1: username, input2: action } = getInputs();
    sendMessage(`Performing ${action} on ${username}...`, "warning");

    try {
      await performAdminAction(username, action);
      sendMessage("Admin action completed", "success");
    } catch (error) {
      sendMessage(`Failed: ${error.message}`, "error");
    }
  },
});
```

### Data Exploration

```tsx
addButton({
  id: "query-data",
  label: "Query Data",
  icon: "database",
  onClick: () => {
    const { input1: query, input2: filters } = getInputs();
    sendMessage(`Executing query: ${query}`, "info");

    // Execute data query
    queryDatabase(query, filters)
      .then((results) => {
        sendMessage(`Found ${results.length} results`, "success");
      })
      .catch((error) => {
        sendMessage(`Query failed: ${error.message}`, "error");
      });
  },
});
```

## Best Practices

### Button Management

- Use unique, descriptive IDs for buttons
- Always clean up buttons in useEffect return functions
- Group related buttons logically
- Use appropriate button variants for visual hierarchy

```tsx
useEffect(() => {
  // Add buttons
  const buttonIds = [];

  buttonIds.push(addButton({
    id: "btn-1",
    label: "Primary Action",
    variant: "primary",
    onClick: handlePrimaryAction,
  }));

  buttonIds.push(addButton({
    id: "btn-2",
    label: "Secondary Action",
    variant: "secondary",
    onClick: handleSecondaryAction,
  }));

  // Cleanup all buttons
  return () => {
    buttonIds.forEach((id) => removeButton(id));
  };
}, []);
```

### Message Guidelines

- Use appropriate message types for context
- Keep messages concise but informative
- Include timestamps for debugging
- Clear messages when starting new operations

### Input Field Usage

- Use input1 and input2 for parameters that change frequently
- Provide placeholder text or labels to indicate purpose
- Validate input values before using in actions
- Consider input format (URLs, IDs, JSON, etc.)

## Accessibility

### Keyboard Support

- Tab navigation through all interactive elements
- Enter and Space key support for buttons
- Escape key closes the HUD (unless disabled)

### Screen Reader Support

- Proper ARIA labels on buttons
- Semantic HTML structure
- Screen reader announcements for state changes

### Focus Management

- Maintains focus within HUD when open
- Returns focus to trigger element when closed
- Clear focus indicators

## Styling Notes

The HUD uses CSS classes with the `hud-` prefix:

- `.hud-container` - Main HUD container
- `.hud-header` - Draggable header area
- `.hud-body` - Main content area
- `.hud-buttons-panel` - Action buttons section
- `.hud-console-panel` - Message console section
- `.hud-button` - Individual button styling
- `.hud-message` - Message styling with type variants

The component automatically:

- Saves position to localStorage
- Constrains to screen boundaries
- Handles responsive sizing
- Manages z-index layering
