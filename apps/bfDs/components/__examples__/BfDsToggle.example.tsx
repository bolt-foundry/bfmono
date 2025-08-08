import { useState } from "react";
import { BfDsToggle } from "../BfDsToggle.tsx";
import { BfDsForm } from "../BfDsForm.tsx";
import { BfDsCallout } from "../BfDsCallout.tsx";
import { BfDsFormSubmitButton } from "../BfDsFormSubmitButton.tsx";
import { BfDsCodeExample } from "../BfDsCodeExample.tsx";

export function BfDsToggleExample() {
  const [standaloneChecked, setStandaloneChecked] = useState(false);
  const [formData, setFormData] = useState({
    darkMode: false,
    notifications: false,
    autoSave: false,
  });
  const [notification, setNotification] = useState({
    message: "",
    details: "",
    visible: false,
  });

  return (
    <div className="bfds-example">
      <h2>BfDsToggle Examples</h2>

      <div className="bfds-example__section">
        <h3>Usage</h3>
        <BfDsCodeExample
          language="tsx"
          code={`import { BfDsToggle } from "@bfmono/apps/bfDs/components/BfDsToggle.tsx";

// Basic usage
<BfDsToggle
  label="Enable notifications"
  checked={checked}
  onChange={(isChecked) => setChecked(isChecked)}
/>

// All available props
<BfDsToggle
  name="notifications"            // string - form field name
  checked={true}                  // boolean - controlled state
  defaultChecked={false}          // boolean - uncontrolled default
  onChange={(checked) => {}}      // (checked: boolean) => void
  label="Enable feature"          // string - label text
  disabled={false}                // boolean
  size="medium"                   // "small" | "medium" | "large"
  className=""                    // string
  id="toggle-1"                   // string - element ID
/>`}
        />
      </div>

      <div className="bfds-example__section">
        <h3>Standalone Toggle</h3>
        <div className="bfds-example__group">
          <BfDsToggle
            label="Enable feature"
            checked={standaloneChecked}
            onChange={setStandaloneChecked}
          />
          <p>Checked: {standaloneChecked ? "Yes" : "No"}</p>
        </div>
      </div>

      <div className="bfds-example__section">
        <h3>With BfDsForm Integration</h3>
        <BfDsForm
          initialData={formData}
          onSubmit={(data) => {
            setNotification({
              message: "Form submitted successfully!",
              details: JSON.stringify(data, null, 2),
              visible: true,
            });
            setFormData(data as typeof formData);
          }}
        >
          <div className="bfds-example__group">
            <BfDsToggle
              name="darkMode"
              label="Dark mode"
            />

            <BfDsToggle
              name="notifications"
              label="Push notifications"
            />

            <BfDsToggle
              name="autoSave"
              label="Auto-save documents"
            />

            <BfDsFormSubmitButton text="Submit Form" />
          </div>
        </BfDsForm>
        <BfDsCallout
          variant="success"
          details={notification.details}
          visible={notification.visible}
          onDismiss={() =>
            setNotification({ message: "", details: "", visible: false })}
          autoDismiss={5000}
        >
          {notification.message}
        </BfDsCallout>
      </div>

      <div className="bfds-example__section">
        <h3>Sizes</h3>
        <div className="bfds-example__group">
          <BfDsToggle
            label="Small toggle"
            size="small"
            defaultChecked
          />

          <BfDsToggle
            label="Medium toggle (default)"
            size="medium"
            defaultChecked
          />

          <BfDsToggle
            label="Large toggle"
            size="large"
            defaultChecked
          />
        </div>
      </div>

      <div className="bfds-example__section">
        <h3>States</h3>
        <div className="bfds-example__group">
          <BfDsToggle
            label="Unchecked"
            defaultChecked={false}
          />

          <BfDsToggle
            label="Checked"
            defaultChecked
          />

          <BfDsToggle
            label="Disabled Unchecked"
            defaultChecked={false}
            disabled
          />

          <BfDsToggle
            label="Disabled Checked"
            defaultChecked
            disabled
          />

          <BfDsToggle label="Without onChange Handler" />

          <BfDsToggle
            label="No Label"
            defaultChecked={false}
          />
        </div>
      </div>
    </div>
  );
}
