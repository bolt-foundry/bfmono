import { useEffect, useState } from "react";
import { useHud } from "@bfmono/apps/bfDs/contexts/BfDsHudContext.tsx";
import { BfDsButton } from "@bfmono/apps/bfDs/components/BfDsButton.tsx";
import { BfDsToggle } from "@bfmono/apps/bfDs/components/BfDsToggle.tsx";
import { BfDsCodeExample } from "../BfDsCodeExample.tsx";

export function BfDsHudExample() {
  const {
    addButton,
    removeButton,
    sendMessage,
    getInputs,
    showHud,
    hideHud,
    isVisible,
  } = useHud();

  // State for toggle examples
  const [debugMode, setDebugMode] = useState(false);
  const [apiEnabled, setApiEnabled] = useState(true);

  useEffect(() => {
    // Add example buttons
    addButton({
      id: "btn-1",
      label: "Say hello",
      icon: "messageSquare",
      onClick: () => {
        const { input1, input2 } = getInputs();
        sendMessage(`Hello ${input1 || "World"}! ${input2 || ""}`, "info");
      },
    });

    addButton({
      id: "btn-2",
      label: "Test success",
      icon: "checkCircle",
      variant: "primary",
      onClick: () => {
        sendMessage("Operation completed successfully!", "success");
      },
    });

    addButton({
      id: "btn-3",
      label: "Test warning",
      icon: "alertTriangle",
      variant: "outline",
      onClick: () => {
        sendMessage("This is a warning message", "warning");
      },
    });

    addButton({
      id: "btn-4",
      label: "Test error",
      icon: "alertCircle",
      variant: "ghost",
      onClick: () => {
        sendMessage("An error occurred!", "error");
      },
    });

    addButton({
      id: "btn-5",
      label: "Log inputs",
      icon: "terminal",
      variant: "secondary",
      onClick: () => {
        const { input1, input2 } = getInputs();
        sendMessage(`Input 1: "${input1}", Input 2: "${input2}"`, "info");
      },
    });

    // Add toggleable buttons
    addButton({
      id: "btn-6",
      label: "Debug mode",
      toggleable: true,
      value: debugMode,
      variant: "ghost",
      onToggle: (newValue) => {
        setDebugMode(newValue);
        sendMessage(
          `Debug mode ${newValue ? "enabled" : "disabled"}`,
          newValue ? "success" : "info",
        );
      },
      onClick: () => {
        // Optional: Additional action on click
      },
    });

    addButton({
      id: "btn-7",
      label: "API Access",
      toggleable: true,
      value: apiEnabled,
      variant: "outline",
      onToggle: (newValue) => {
        setApiEnabled(newValue);
        sendMessage(
          `API access ${newValue ? "enabled" : "disabled"}`,
          newValue ? "success" : "warning",
        );
      },
      onClick: () => {
        // Optional: Additional action on click
      },
    });

    // Cleanup function to remove buttons
    return () => {
      removeButton("btn-1");
      removeButton("btn-2");
      removeButton("btn-3");
      removeButton("btn-4");
      removeButton("btn-5");
      removeButton("btn-6");
      removeButton("btn-7");
    };
  }, [addButton, removeButton, sendMessage, getInputs, debugMode, apiEnabled]);

  return (
    <div className="bfds-example">
      <h2>HUD (Heads-Up Display) Example</h2>
      <p>
        A floating console for development tools, debugging, and admin actions.
      </p>

      <div className="bfds-example__section">
        <h3>Usage</h3>
        <BfDsCodeExample
          language="tsx"
          code={`// 1. First, wrap your app with HudProvider (already done in App.tsx)
import { BfDsHudProvider } from "@bfmono/apps/boltfoundry-com/contexts/HudContext.tsx";
import { BfDsHud } from "@bfmono/apps/bfDs/components/BfDsHud.tsx";

<BfDsHudProvider>
  <YourApp />
  <BfDsHud />
</BfDsHudProvider>

// 2. Use the simplified hook in your components
import { useHud } from "@bfmono/bfDs";

function MyComponent() {
  // Single hook provides all HUD functionality
  const {
    showHud,
    hideHud,
    toggleHud,
    addButton,
    removeButton,
    sendMessage,
    clearMessages,
    input1,
    input2,
    getInputs
  } = useHud();

  useEffect(() => {
    addButton({
      id: "my-action",
      label: "Run action",
      icon: "play",
      variant: "primary",
      onClick: () => {
        const { input1, input2 } = getInputs();
        sendMessage(\`Running with: \${input1}, \${input2}\`, "info");
      }
    });

    return () => removeButton("my-action");
  }, [addButton, removeButton, getInputs, sendMessage]);

  // Add toggleable buttons
  const [featureEnabled, setFeatureEnabled] = useState(false);

  useEffect(() => {
    addButton({
      id: "toggle-feature",
      label: "Feature flag",
      toggleable: true,
      value: featureEnabled,
      onToggle: (newValue) => {
        setFeatureEnabled(newValue);
        sendMessage(\`Feature \${newValue ? "enabled" : "disabled"}\`, "success");
      },
      onClick: () => {
        // Optional additional action
      }
    });
  }, [addButton, featureEnabled, sendMessage]);

  // Send messages
  const handleSendMessages = () => {
    sendMessage("Operation started", "info");
    sendMessage("Success!", "success");
    sendMessage("Warning: Check config", "warning");
    sendMessage("Error occurred", "error");
  };

  // Access input values
  const handleGetInputs = () => {
    const values = getInputs(); // { input1: string, input2: string }
    sendMessage(\`Input values: \${JSON.stringify(values)}\`, "info");
  };

  // Set values programmatically
  const handleSetInputs = () => {
    setInput1("api.example.com");
    setInput2("auth-token-123");
    sendMessage("Input values set programmatically", "success");
  };
}`}
        />
      </div>

      <div className="bfds-example__section">
        <h3>Features</h3>
        <ul>
          <li>
            <strong>Two Input Fields</strong>{" "}
            - General purpose inputs for parameters
          </li>
          <li>
            <strong>Action Buttons</strong>{" "}
            - Persistent buttons on the left panel
          </li>
          <li>
            <strong>Toggleable Buttons</strong>{" "}
            - Boolean state buttons with toggleLeft/Right icons
          </li>
          <li>
            <strong>Console Messages</strong> - Message history with navigation
          </li>
          <li>
            <strong>Message Types</strong> - info, success, warning, error
          </li>
        </ul>
      </div>

      <div className="bfds-example__section">
        <h3>Interactive Demo</h3>
        <p>
          Click "Show HUD" to see the example implementation with various action
          buttons.
        </p>

        <div className="bfds-example__group">
          <BfDsButton
            variant="primary"
            onClick={() => isVisible ? hideHud() : showHud()}
            icon={isVisible ? "cross" : "terminal"}
          >
            {isVisible ? "Hide HUD" : "Show HUD"}
          </BfDsButton>
          <BfDsButton
            variant="secondary"
            onClick={() => {
              sendMessage("Hello from the example page!", "info");
              showHud();
            }}
            icon="messageSquare"
          >
            Send Test Message
          </BfDsButton>
        </div>

        {/* State display card */}
        <div
          className="bfds-card"
          style={{ marginTop: "1rem", padding: "1rem" }}
        >
          <h4 style={{ marginTop: 0 }}>Toggle Button States</h4>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
          >
            <BfDsToggle
              label="Debug mode"
              checked={debugMode}
              onChange={(checked) => {
                setDebugMode(checked);
                sendMessage(
                  `Debug mode ${checked ? "enabled" : "disabled"}`,
                  checked ? "success" : "info",
                );
              }}
            />
            <BfDsToggle
              label="API Access"
              checked={apiEnabled}
              onChange={(checked) => {
                setApiEnabled(checked);
                sendMessage(
                  `API access ${checked ? "enabled" : "disabled"}`,
                  checked ? "success" : "warning",
                );
              }}
            />
          </div>
        </div>

        <div style={{ marginTop: "1rem" }}>
          <h4>Try these interactions:</h4>
          <ol>
            <li>Type your name in Input 1 and click "Say hello"</li>
            <li>Enter values in both inputs and click "Log inputs"</li>
            <li>Test different message types with the colored buttons</li>
            <li>
              Toggle "Debug mode" and "API access" buttons to see the toggle
              icons change
            </li>
            <li>Navigate through message history with arrow buttons</li>
          </ol>
        </div>
      </div>

      <div className="bfds-example__section">
        <h3>Example Use Cases</h3>
        <BfDsCodeExample
          language="tsx"
          code={`// Development Tools
addButton({
  id: "api-test",
  label: "Test API",
  icon: "server",
  onClick: () => {
    const { input1: endpoint, input2: token } = getInputs();
    sendMessage(\`Testing \${endpoint} with token \${token}\`, "info");
    // Make API call here
  }
});

// Debugging Tools
const [featureEnabled, setFeatureEnabled] = useState(false);

addButton({
  id: "toggle-feature",
  label: "Toggle feature",
  toggleable: true,
  value: featureEnabled,
  onToggle: (newValue) => {
    const { input1: userId, input2: featureFlag } = getInputs();
    setFeatureEnabled(newValue);
    sendMessage(\`\${newValue ? "Enabled" : "Disabled"} \${featureFlag} for user \${userId}\`, "success");
    // Toggle feature flag implementation here
  },
  onClick: () => {
    // Optional additional action on click
  }
});

// Admin Actions
addButton({
  id: "user-action",
  label: "User action",
  icon: "user",
  variant: "primary",
  onClick: async () => {
    const { input1: username, input2: action } = getInputs();
    sendMessage(\`Performing \${action} on \${username}...\`, "warning");
    try {
      // Perform action
      sendMessage("Action completed!", "success");
    } catch (error) {
      sendMessage(\`Error: \${error.message}\`, "error");
    }
  }
});`}
        />
      </div>
    </div>
  );
}
