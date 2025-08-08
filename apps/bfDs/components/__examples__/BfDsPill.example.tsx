import { BfDsPill } from "../BfDsPill.tsx";
import { BfDsButton } from "../BfDsButton.tsx";
import { BfDsCodeExample } from "../BfDsCodeExample.tsx";

export function BfDsPillExample() {
  return (
    <div className="bfds-example">
      <h2>BfDsPill Examples</h2>

      <div className="bfds-example__section">
        <h3>Usage</h3>
        <BfDsCodeExample
          language="tsx"
          code={`import { BfDsPill } from "@bfmono/apps/bfDs/components/BfDsPill.tsx";

// Basic usage
<BfDsPill label="Status" text="Active" />

// All available props
<BfDsPill
  label="Label"                   // string - label text
  text="Content"                  // string | number - main content
  icon="star"                     // BfDsIconName - icon to display
  variant="secondary"             // "primary" | "secondary" | "success" | "error" | "warning" | "info"
  action={<button>X</button>}     // ReactNode - action element
  className=""                    // string - additional CSS
/>`}
        />
      </div>

      <div className="bfds-example__section">
        <h3>Basic Pills</h3>
        <div className="bfds-example__group">
          <BfDsPill
            label="Info"
            text="This is a basic pill"
            variant="info"
          />

          <BfDsPill
            label="Status"
            text="Active"
            variant="primary"
          />

          <BfDsPill
            text="Just text"
            variant="secondary"
          />

          <BfDsPill
            label="Just label"
            variant="secondary"
          />
        </div>
      </div>

      <div className="bfds-example__section">
        <h3>Pills with Icons</h3>
        <div className="bfds-example__group">
          <BfDsPill
            label="Warning"
            icon="exclamationTriangle"
            variant="warning"
          />

          <BfDsPill
            label="Success"
            text="Complete"
            icon="check"
            variant="success"
          />

          <BfDsPill
            text="Error"
            icon="exclamationCircle"
            variant="error"
          />

          <BfDsPill
            icon="infoCircle"
            variant="info"
          />
        </div>
      </div>

      <div className="bfds-example__section">
        <h3>Pills with Actions</h3>
        <div className="bfds-example__group">
          <BfDsPill
            label="Removable"
            text="Tag"
            variant="primary"
            action={
              <BfDsButton
                variant="ghost"
                size="small"
                icon="cross"
                iconOnly
                onClick={() => alert("Removed!")}
              />
            }
          />

          <BfDsPill
            label="Editable"
            text="Click to edit"
            variant="secondary"
            action={
              <BfDsButton
                variant="outline"
                size="small"
                icon="pencil"
                iconOnly
                onClick={() => alert("Edit mode!")}
              />
            }
          />
        </div>
      </div>

      <div className="bfds-example__section">
        <h3>All Variants</h3>
        <div className="bfds-example__group">
          <BfDsPill
            label="Primary"
            text="Gold theme"
            variant="primary"
          />

          <BfDsPill
            label="Secondary"
            text="Gray theme"
            variant="secondary"
          />

          <BfDsPill
            label="Success"
            text="Green theme"
            variant="success"
          />

          <BfDsPill
            label="Error"
            text="Red theme"
            variant="error"
          />

          <BfDsPill
            label="Warning"
            text="Orange theme"
            variant="warning"
          />

          <BfDsPill
            label="Info"
            text="Blue theme"
            variant="info"
          />
        </div>
      </div>

      <div className="bfds-example__section">
        <h3>Numeric Values</h3>
        <div className="bfds-example__group">
          <BfDsPill
            label="Count"
            text={42}
            variant="primary"
          />

          <BfDsPill
            label="Score"
            text={95.5}
            variant="success"
          />

          <BfDsPill
            text={0}
            variant="secondary"
          />
        </div>
      </div>

      <div className="bfds-example__section">
        <h3>Paper Context (Automatic Adaptation)</h3>
        <p
          style={{
            fontSize: "14px",
            color: "var(--bfds-text-secondary)",
            marginBottom: "16px",
          }}
        >
          Pills automatically adapt their styling when inside a{" "}
          <code>.paper</code> ancestor:
        </p>

        <div
          className="paper"
          style={{
            padding: "24px",
            borderRadius: "8px",
            border: "1px solid var(--bfds-border)",
            marginBottom: "16px",
          }}
        >
          <h4 style={{ margin: "0 0 16px 0", color: "#333" }}>
            Paper Background
          </h4>
          <div className="bfds-example__group">
            <BfDsPill
              label="Primary"
              text="Gold theme"
              variant="primary"
            />

            <BfDsPill
              label="Secondary"
              text="Gray theme"
              variant="secondary"
            />

            <BfDsPill
              label="Success"
              text="Green theme"
              variant="success"
            />

            <BfDsPill
              label="Error"
              text="Red theme"
              variant="error"
            />

            <BfDsPill
              label="Warning"
              text="Orange theme"
              variant="warning"
            />

            <BfDsPill
              label="Info"
              text="Blue theme"
              variant="info"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
