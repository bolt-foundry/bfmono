import { getLogger } from "@bfmono/packages/logger/logger.ts";
import { BfDsButton } from "../BfDsButton.tsx";
import {
  BfDsToastProvider,
  useBfDsToast,
} from "@bfmono/apps/bfDs/contexts/BfDsToastContext.tsx";

const logger = getLogger(import.meta);

function ToastDemoContent() {
  const { showToast, clearAllToasts } = useBfDsToast();

  return (
    <div className="bfds-example">
      <h2>BfDsToast Examples</h2>

      <div className="bfds-example__section">
        <h3>Usage</h3>
        <pre className="bfds-example__code">
{`import { BfDsToastProvider, useBfDsToast } from "@bfmono/apps/bfDs/components/BfDsToastProvider.tsx";

// 1. Wrap your app with BfDsToastProvider
<BfDsToastProvider>
  <App />
</BfDsToastProvider>

// 2. Use the toast hook in any component
const { showToast, clearAllToasts } = useBfDsToast();

// Basic usage
showToast("Success!");

// With options
showToast("Operation completed", {
  variant: "success",      // "info" | "success" | "warning" | "error"
  timeout: 5000,          // auto-dismiss after ms (0 = no auto-dismiss)
  details: "JSON data",   // expandable details
  onDismiss: () => {}     // callback when dismissed
});

// Clear all toasts
clearAllToasts();`}
        </pre>
      </div>

      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
        <BfDsButton
          variant="primary"
          onClick={() => showToast("This is an info message!")}
        >
          Info Toast
        </BfDsButton>

        <BfDsButton
          variant="secondary"
          onClick={() =>
            showToast("Operation completed successfully!", {
              variant: "success",
            })}
        >
          Success Toast
        </BfDsButton>

        <BfDsButton
          variant="outline"
          onClick={() =>
            showToast("Please check your input.", { variant: "warning" })}
        >
          Warning Toast
        </BfDsButton>

        <BfDsButton
          variant="ghost"
          onClick={() =>
            showToast("Something went wrong!", { variant: "error" })}
        >
          Error Toast
        </BfDsButton>
      </div>

      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
        <BfDsButton
          variant="primary"
          onClick={() =>
            showToast(
              "This toast will disappear in 10 seconds - watch the countdown! Hover to pause.",
              { timeout: 10000, variant: "info" },
            )}
        >
          Long Timeout (10s)
        </BfDsButton>

        <BfDsButton
          variant="secondary"
          onClick={() =>
            showToast(
              "This toast will stay until dismissed",
              { timeout: 0, variant: "warning" },
            )}
        >
          No Auto-dismiss
        </BfDsButton>

        <BfDsButton
          variant="outline"
          onClick={() =>
            showToast(
              "Toast with details",
              {
                variant: "info",
                details: JSON.stringify(
                  {
                    timestamp: new Date().toISOString(),
                    user: "demo-user",
                    action: "example_action",
                  },
                  null,
                  2,
                ),
              },
            )}
        >
          With Details
        </BfDsButton>

        <BfDsButton
          variant="ghost"
          onClick={() =>
            showToast(
              "Quick countdown demo - 3 seconds!",
              { timeout: 3000, variant: "warning" },
            )}
        >
          Quick Countdown (3s)
        </BfDsButton>
      </div>

      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
        <BfDsButton
          variant="primary"
          onClick={() => {
            // Show multiple toasts in sequence
            showToast("First toast");
            setTimeout(
              () => showToast("Second toast", { variant: "success" }),
              500,
            );
            setTimeout(
              () => showToast("Third toast", { variant: "warning" }),
              1000,
            );
            setTimeout(
              () => showToast("Fourth toast", { variant: "error" }),
              1500,
            );
          }}
        >
          Multiple Toasts
        </BfDsButton>

        <BfDsButton
          variant="secondary"
          onClick={() => {
            const id = showToast("Persistent toast with custom ID", {
              timeout: 0,
              variant: "info",
              id: "persistent-toast",
            });
            logger.info("Created toast with ID:", id);
          }}
        >
          Custom ID Toast
        </BfDsButton>

        <BfDsButton
          variant="outline"
          onClick={() =>
            showToast(
              "Toast with callback",
              {
                variant: "success",
                onDismiss: () => logger.info("Toast was dismissed!"),
              },
            )}
        >
          With Callback
        </BfDsButton>
      </div>

      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
        <BfDsButton
          variant="ghost"
          onClick={clearAllToasts}
        >
          Clear All Toasts
        </BfDsButton>
      </div>

      <div style={{ marginTop: "32px" }}>
        <h3>Usage Instructions:</h3>
        <ul>
          <li>Toasts appear in the bottom-right corner</li>
          <li>New toasts are added to the bottom of the stack</li>
          <li>Click the × button to dismiss manually</li>
          <li>Toasts auto-dismiss after 5 seconds by default</li>
          <li>Use details prop for expandable JSON/text content</li>
          <li>Set timeout to 0 to disable auto-dismiss</li>
          <li>
            Countdown ring appears around close button showing remaining time
          </li>
          <li>
            Hover over a toast to pause the countdown (ring will pulse when
            paused)
          </li>
        </ul>
      </div>
    </div>
  );
}

export function BfDsToastExample() {
  return (
    <BfDsToastProvider>
      <ToastDemoContent />
    </BfDsToastProvider>
  );
}
