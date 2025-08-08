# BfDsProvider

The root provider component that enables all BfDs global functionality including
toast notifications and HUD development tools.

## Interface

```tsx
export function BfDsProvider({ children }: React.PropsWithChildren);
```

The BfDsProvider accepts only children and provides comprehensive BfDs
functionality to the entire component tree.

## Usage

### Basic Setup

Wrap your entire application with BfDsProvider to enable all BfDs features:

```tsx
import { BfDsProvider } from "@bfmono/bfDs";

function App() {
  return (
    <BfDsProvider>
      {/* Your entire app goes here */}
      <MainContent />
    </BfDsProvider>
  );
}
```

### What's Included

BfDsProvider automatically includes:

- **Toast notifications** - Global toast context via BfDsToastProvider
- **HUD development tools** - Development HUD context and component via
  BfDsHudProvider + BfDsHud
- **Future global features** - Ready for additional system-wide functionality

## Features Provided

### Toast Notifications

Access toast functionality anywhere in your app:

```tsx
import { useBfDsToast } from "@bfmono/bfDs";

function MyComponent() {
  const { showToast } = useBfDsToast();

  const handleSuccess = () => {
    showToast("Operation completed successfully!", { variant: "success" });
  };

  return <button onClick={handleSuccess}>Save</button>;
}
```

### HUD Development Tools

The HUD is automatically available for development and debugging:

```tsx
import { useHud } from "@bfmono/bfDs";

function DevComponent() {
  const { addButton, sendMessage, showHud } = useHud();

  useEffect(() => {
    addButton({
      id: "debug-toggle",
      label: "Debug Mode",
      onClick: () => sendMessage("Debug mode toggled"),
      toggleable: true,
    });
  }, [addButton, sendMessage]);

  return <button onClick={showHud}>Show Debug HUD</button>;
}
```

## Architecture

BfDsProvider wraps multiple context providers in the optimal order:

```tsx
<BfDsProvider>
  <BfDsToastProvider>
    <BfDsHudProvider>
      {children}
      <BfDsHud /> {/* HUD component automatically included */}
    </BfDsHudProvider>
  </BfDsToastProvider>
</BfDsProvider>;
```

## Common Use Cases

### Application Root Setup

```tsx
// main.tsx or App.tsx
import { BfDsProvider } from "@bfmono/bfDs";
import { Router } from "./Router";

export default function App() {
  return (
    <BfDsProvider>
      <Router />
    </BfDsProvider>
  );
}
```

### Testing Setup

Use BfDsProvider in tests to provide context:

```tsx
import { render } from "@testing-library/react";
import { BfDsProvider } from "@bfmono/bfDs";
import { MyComponent } from "./MyComponent";

test("component works with BfDs context", () => {
  render(
    <BfDsProvider>
      <MyComponent />
    </BfDsProvider>,
  );
  // Test your component
});
```

### Multiple App Setup

If you have multiple sub-applications:

```tsx
function MultiAppRoot() {
  return (
    <BfDsProvider>
      <AppA />
      <AppB />
      <SharedComponents />
    </BfDsProvider>
  );
}
```

## Error Handling

Components that use BfDs hooks will throw helpful errors if used outside
BfDsProvider:

```tsx
function ComponentWithoutProvider() {
  const { showToast } = useBfDsToast(); // Error: must be used within BfDsProvider

  return <div>Won't work</div>;
}
```

## Integration with Other Providers

BfDsProvider should typically be your outermost provider:

```tsx
function App() {
  return (
    <BfDsProvider>
      <RouterProvider>
        <AuthProvider>
          <UserProvider>
            <MainApp />
          </UserProvider>
        </AuthProvider>
      </RouterProvider>
    </BfDsProvider>
  );
}
```

## Development vs Production

The HUD component is automatically included but will only be visible when
toggled on. This makes it safe for production use while providing powerful
development tools.

## Performance

BfDsProvider adds minimal overhead:

- Context providers are lightweight
- Toast rendering is optimized
- HUD is rendered but hidden by default
- No unnecessary re-renders

## Best Practices

1. **Single Provider** - Use only one BfDsProvider at your app root
2. **Early Setup** - Include BfDsProvider as early as possible in your component
   tree
3. **Testing** - Always wrap test components with BfDsProvider if they use BfDs
   hooks
4. **Error Boundaries** - Consider wrapping BfDsProvider with error boundaries
   for production apps

## Advanced Usage

### Custom Toast Configuration

While BfDsProvider provides default toast behavior, you can customize it by
using individual providers:

```tsx
import { BfDsHudProvider } from "@bfmono/bfDs/contexts/BfDsHudContext";
import { BfDsToastProvider } from "@bfmono/bfDs/contexts/BfDsToastContext";

function CustomSetup({ children }) {
  return (
    <BfDsToastProvider maxToasts={10}>
      <BfDsHudProvider>
        {children}
      </BfDsHudProvider>
    </BfDsToastProvider>
  );
}
```

However, using BfDsProvider is recommended for most use cases.

## Related Components

- **BfDsHud**: The development HUD component (automatically included)
- **BfDsToast**: Toast notification components (automatically enabled)
- **useBfDsToast**: Hook for showing toast notifications
- **useHud**: Hook for interacting with the development HUD
