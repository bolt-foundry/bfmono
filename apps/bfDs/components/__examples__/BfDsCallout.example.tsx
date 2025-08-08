import { useState } from "react";
import { getLogger } from "@bfmono/packages/logger/logger.ts";
import { BfDsCallout, type BfDsCalloutVariant } from "../BfDsCallout.tsx";
import { BfDsCodeExample } from "../BfDsCodeExample.tsx";

const logger = getLogger(import.meta);

export function BfDsCalloutExample() {
  const [notifications, setNotifications] = useState<
    Array<{
      id: number;
      message: string;
      variant: BfDsCalloutVariant;
      details?: string;
      autoDismiss?: number;
    }>
  >([]);
  const [nextId, setNextId] = useState(1);

  const addNotification = (
    message: string,
    variant: BfDsCalloutVariant,
    details?: string,
    autoDismiss?: number,
  ) => {
    setNotifications(
      (
        prev,
      ) => [...prev, { id: nextId, message, variant, details, autoDismiss }],
    );
    setNextId((prev) => prev + 1);
  };

  const removeNotification = (id: number) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const sampleData = {
    name: "John Doe",
    email: "john@example.com",
    preferences: {
      theme: "dark",
      notifications: true,
    },
  };

  return (
    <div className="bfds-example">
      <h2>BfDsCallout Examples</h2>

      <div className="bfds-example__section">
        <h3>Usage</h3>
        <BfDsCodeExample
          language="tsx"
          code={`import { BfDsCallout } from "@bfmono/apps/bfDs/components/BfDsCallout.tsx";

// Basic usage
<BfDsCallout variant="info">
  Information message
</BfDsCallout>

// All available props
<BfDsCallout
  variant="info"          // "info" | "success" | "warning" | "error"
  details="JSON data"     // string - expandable details section
  defaultExpanded={false} // boolean - show details by default
  visible={true}          // boolean - visibility control
  onDismiss={() => {}}    // () => void - dismiss callback
  autoDismiss={5000}      // number - auto-dismiss after ms (0 = no auto-dismiss)
  className=""            // string - additional CSS classes
>
  Callout message content
</BfDsCallout>`}
        />
      </div>

      <div className="bfds-example__section">
        <h3>Static Examples</h3>
        <div className="bfds-example__group">
          <BfDsCallout variant="info">
            This is an informational message
          </BfDsCallout>
          <BfDsCallout variant="success">
            Operation completed successfully!
          </BfDsCallout>
          <BfDsCallout variant="warning">
            Please review your settings
          </BfDsCallout>
          <BfDsCallout variant="error">
            An error occurred while processing
          </BfDsCallout>
        </div>
      </div>

      <div className="bfds-example__section">
        <h3>With Details</h3>
        <BfDsCallout
          variant="success"
          details={JSON.stringify(sampleData, null, 2)}
          onDismiss={() => {}}
        >
          Form submitted successfully
        </BfDsCallout>
      </div>

      <div>
        <h3>With Auto-dismiss and Countdown</h3>
        <BfDsCallout
          variant="info"
          autoDismiss={10000}
          onDismiss={() => logger.info("Auto-dismissed")}
        >
          This callout will auto-dismiss in 10 seconds. Notice the countdown
          ring around the close button.
          <strong>
            Try hovering over this callout to pause the countdown!
          </strong>
        </BfDsCallout>
      </div>

      <div className="bfds-example__section">
        <h3>Dynamic Notifications</h3>
        <div className="bfds-example__controls">
          <button
            type="button"
            onClick={() => addNotification("Info notification", "info")}
            className="bfds-example__control"
          >
            Add Info
          </button>
          <button
            type="button"
            onClick={() => addNotification("Success!", "success")}
            className="bfds-example__control"
          >
            Add Success
          </button>
          <button
            type="button"
            onClick={() =>
              addNotification(
                "Form data saved",
                "success",
                JSON.stringify(sampleData, null, 2),
              )}
            className="bfds-example__control"
          >
            Add with Details
          </button>
          <button
            type="button"
            onClick={() =>
              addNotification(
                "Auto-dismiss in 5 seconds",
                "warning",
                undefined,
                5000,
              )}
            style={{
              padding: "8px 16px",
              backgroundColor: "var(--bfds-primary)",
              color: "var(--bfds-background)",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Add Auto-dismiss
          </button>
        </div>

        <div className="bfds-example__group">
          {notifications.map((notification) => (
            <BfDsCallout
              key={notification.id}
              variant={notification.variant}
              details={notification.details}
              autoDismiss={notification.autoDismiss}
              onDismiss={() => removeNotification(notification.id)}
            >
              {notification.message}
            </BfDsCallout>
          ))}
        </div>
      </div>
    </div>
  );
}
