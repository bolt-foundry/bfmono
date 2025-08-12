import { BfDsCopyButton } from "../BfDsCopyButton.tsx";
import { BfDsCodeExample } from "../BfDsCodeExample.tsx";

export function BfDsCopyButtonExample() {
  return (
    <div className="bfds-example">
      <h2>BfDsCopyButton Component</h2>

      <div className="bfds-example__section">
        <h3>Usage</h3>
        <BfDsCodeExample
          language="tsx"
          code={`import { BfDsCopyButton } from "@bfmono/apps/bfDs/components/BfDsCopyButton.tsx";

// Basic usage
<BfDsCopyButton
  textToCopy="Text to copy"
/>

// All available props (extends BfDsButton props)
<BfDsCopyButton
  textToCopy="Text to copy"       // string (required) - text to copy
  buttonText="Copy"               // string - button text when not copied
  copiedText="Copied!"           // string - button text when copied
  copiedDuration={1000}          // number - ms to show copied state
  variant="outline"              // BfDsButton variant
  icon="clipboard"               // BfDsIconName - icon when not copied
  iconOnly={true}                // boolean - show icon only
  size="medium"                  // "small" | "medium" | "large"
  disabled={false}               // boolean
  className=""                   // string
  aria-label="Copy text"         // string - important for iconOnly mode
/>`}
        />
      </div>

      <div className="bfds-example__section">
        <h3>Examples</h3>
        <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
          <div>
            <h3>Icon Only (default)</h3>
            <BfDsCopyButton
              textToCopy="npm install @bolt-foundry/bolt-foundry"
              aria-label="Copy npm command"
            />
          </div>

          <div>
            <h3>With Text</h3>
            <BfDsCopyButton
              textToCopy="npm install @bolt-foundry/bolt-foundry"
              iconOnly={false}
              buttonText="Copy command"
              copiedText="Copied!"
            />
          </div>

          <div>
            <h3>Different Variants</h3>
            <div style={{ display: "flex", gap: "8px" }}>
              <BfDsCopyButton
                textToCopy="primary variant"
                variant="primary"
                aria-label="Copy primary"
              />
              <BfDsCopyButton
                textToCopy="secondary variant"
                variant="secondary"
                aria-label="Copy secondary"
              />
              <BfDsCopyButton
                textToCopy="outline variant"
                variant="outline"
                aria-label="Copy outline"
              />
              <BfDsCopyButton
                textToCopy="ghost variant"
                variant="ghost"
                aria-label="Copy ghost"
              />
            </div>
          </div>

          <div>
            <h3>Different Sizes</h3>
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <BfDsCopyButton
                textToCopy="small size"
                size="small"
                aria-label="Copy small"
              />
              <BfDsCopyButton
                textToCopy="medium size"
                size="medium"
                aria-label="Copy medium"
              />
              <BfDsCopyButton
                textToCopy="large size"
                size="large"
                aria-label="Copy large"
              />
            </div>
          </div>

          <div>
            <h3>Code Block Example</h3>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 12px",
                backgroundColor: "#f5f5f5",
                borderRadius: "4px",
                fontFamily: "monospace",
              }}
            >
              <code>aibff calibrate grader.deck.md</code>
              <BfDsCopyButton
                textToCopy="aibff calibrate grader.deck.md"
                aria-label="Copy command"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
