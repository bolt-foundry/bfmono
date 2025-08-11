import { useState } from "react";
import { BfDsTextArea } from "../BfDsTextArea.tsx";
import { BfDsCodeExample } from "../BfDsCodeExample.tsx";

export function BfDsTextAreaExample() {
  const [value1, setValue1] = useState("");
  const [value3, setValue3] = useState(
    "Valid content that passed validation",
  );

  return (
    <div className="bfds-example">
      <h2>BfDsTextArea Examples</h2>

      <div className="bfds-example__section">
        <h3>Usage</h3>
        <BfDsCodeExample
          language="tsx"
          code={`import { BfDsTextArea } from "@bfmono/apps/bfDs/components/BfDsTextArea.tsx";

// Basic usage
<BfDsTextArea
  label="Message"
  placeholder="Enter your message..."
  value={value}
  onChange={(e) => setValue(e.target.value)}
/>

// All available props (extends HTML textarea attributes)
<BfDsTextArea
  name="message"                  // string - form field name
  value=""                        // string - controlled value
  defaultValue=""                 // string - uncontrolled default
  onChange={(e) => {}}            // (e: ChangeEvent) => void
  label="Message"                 // string - label text
  placeholder="Enter text"        // string - placeholder
  required={false}                // boolean
  state="default"                 // "default" | "error" | "success" | "disabled"
  errorMessage=""                 // string - error message
  successMessage=""               // string - success message
  helpText=""                     // string - help text
  className=""                    // string
  resize="vertical"               // "none" | "both" | "horizontal" | "vertical"
  rows={4}                        // number - visible rows
  cols={20}                       // number - visible columns
  disabled={false}                // boolean
  readOnly={false}                // boolean
  maxLength={500}                 // number
  // ... other HTML textarea attributes
/>`}
        />
      </div>

      <div className="bfds-example__section">
        <h3>Controlled vs Uncontrolled</h3>
        <div className="bfds-example__group">
          <BfDsTextArea
            label="Controlled TextArea"
            placeholder="Enter your message here..."
            value={value1}
            onChange={(e) => setValue1(e.target.value)}
            helpText={`Character count: ${value1.length}`}
            rows={3}
          />
          <BfDsTextArea
            label="Uncontrolled TextArea"
            placeholder="Manages its own state"
            defaultValue="Initial content"
            helpText="This textarea manages its own state internally"
            rows={3}
          />
        </div>
      </div>

      <div className="bfds-example__section">
        <h3>TextArea States</h3>
        <div className="bfds-example__group">
          <BfDsTextArea
            label="Error state"
            placeholder="Enter some content"
            state="error"
            errorMessage="Content is too short"
            rows={3}
            defaultValue=""
          />
          <BfDsTextArea
            label="Success state"
            placeholder="Valid content"
            state="success"
            value={value3}
            onChange={(e) => setValue3(e.target.value)}
            successMessage="Content looks great!"
            rows={3}
          />
          <BfDsTextArea
            label="Disabled state"
            placeholder="Cannot edit this"
            state="disabled"
            defaultValue="This content cannot be edited"
            rows={3}
          />
        </div>
      </div>

      <div className="bfds-example__section">
        <h3>Resize Options</h3>
        <div className="bfds-example__group">
          <BfDsTextArea
            label="No resize"
            placeholder="Cannot be resized"
            resize="none"
            rows={2}
            defaultValue=""
          />
          <BfDsTextArea
            label="Horizontal resize"
            placeholder="Can be resized horizontally"
            resize="horizontal"
            rows={2}
            defaultValue=""
          />
          <BfDsTextArea
            label="Vertical Resize (Default)"
            placeholder="Can be resized vertically"
            resize="vertical"
            rows={2}
            defaultValue=""
          />
          <BfDsTextArea
            label="Both directions"
            placeholder="Can be resized in both directions"
            resize="both"
            rows={2}
            defaultValue=""
          />
        </div>
      </div>

      <div className="bfds-example__section">
        <h3>Different Sizes</h3>
        <div className="bfds-example__group">
          <BfDsTextArea
            label="Small (2 rows)"
            placeholder="Small textarea"
            rows={2}
            defaultValue=""
          />
          <BfDsTextArea
            label="Medium (4 rows)"
            placeholder="Medium textarea"
            rows={4}
            defaultValue=""
          />
          <BfDsTextArea
            label="Large (6 rows)"
            placeholder="Large textarea"
            rows={6}
            defaultValue=""
          />
        </div>
      </div>

      <div className="bfds-example__section">
        <h3>Without Label</h3>
        <BfDsTextArea
          placeholder="Just a placeholder with help text"
          helpText="This textarea has no label but includes help text"
          rows={3}
          defaultValue=""
        />
      </div>
    </div>
  );
}
