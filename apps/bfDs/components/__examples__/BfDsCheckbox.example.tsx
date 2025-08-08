import { useState } from "react";
import { BfDsCheckbox } from "../BfDsCheckbox.tsx";
import { BfDsForm } from "../BfDsForm.tsx";
import { BfDsCallout } from "../BfDsCallout.tsx";
import { BfDsFormSubmitButton } from "../BfDsFormSubmitButton.tsx";
import { BfDsCodeExample } from "../BfDsCodeExample.tsx";

export function BfDsCheckboxExample() {
  const [standaloneChecked, setStandaloneChecked] = useState(false);
  const [formData, setFormData] = useState({
    terms: false,
    newsletter: false,
    notifications: false,
  });
  const [notification, setNotification] = useState({
    message: "",
    details: "",
    visible: false,
  });

  return (
    <div className="bfds-example">
      <h2>BfDsCheckbox Examples</h2>

      <div className="bfds-example__section">
        <h3>Usage</h3>
        <BfDsCodeExample
          language="tsx"
          code={`import { BfDsCheckbox } from "@bfmono/apps/bfDs/components/BfDsCheckbox.tsx";

// Basic usage
<BfDsCheckbox
  label="I agree to the terms"
  checked={checked}
  onChange={(isChecked) => setChecked(isChecked)}
/>

// All available props
<BfDsCheckbox
  name="terms"                    // string - form field name
  checked={true}                  // boolean - controlled state
  defaultChecked={false}          // boolean - uncontrolled default
  onChange={(checked) => {}}      // (checked: boolean) => void
  label="I agree"                 // string - label text
  required={false}                // boolean
  disabled={false}                // boolean
  className=""                    // string
  id="checkbox-1"                 // string - element ID
/>`}
        />
      </div>

      <div className="bfds-example__section">
        <h3>Controlled vs Uncontrolled</h3>
        <div className="bfds-example__group">
          <BfDsCheckbox
            label="Controlled Checkbox"
            checked={standaloneChecked}
            onChange={setStandaloneChecked}
          />
          <p>Checked: {standaloneChecked ? "Yes" : "No"}</p>

          <BfDsCheckbox
            label="Uncontrolled Checkbox (starts checked)"
            defaultChecked
          />
          <p>This checkbox manages its own state internally</p>
        </div>
      </div>

      <div className="bfds-example__section">
        <h3>With BfDsForm Integration</h3>
        <BfDsForm
          initialData={formData}
          onSubmit={(data: unknown) => {
            setNotification({
              message: "Form submitted successfully!",
              details: JSON.stringify(data, null, 2),
              visible: true,
            });
            setFormData(data as typeof formData);
          }}
        >
          <div className="bfds-example__group">
            <BfDsCheckbox
              name="terms"
              label="I agree to the terms and conditions"
              required
            />

            <BfDsCheckbox
              name="newsletter"
              label="Subscribe to newsletter"
            />

            <BfDsCheckbox
              name="notifications"
              label="Enable push notifications"
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
        <h3>States</h3>
        <div className="bfds-example__group">
          <BfDsCheckbox
            label="Unchecked"
            defaultChecked={false}
          />

          <BfDsCheckbox
            label="Checked"
            defaultChecked
          />

          <BfDsCheckbox
            label="Disabled Unchecked"
            defaultChecked={false}
            disabled
          />

          <BfDsCheckbox
            label="Disabled Checked"
            defaultChecked
            disabled
          />

          <BfDsCheckbox
            label="Required"
            required
            onChange={() => {}}
          />

          <BfDsCheckbox
            label="No Label"
            onChange={() => {}}
          />
        </div>
      </div>
    </div>
  );
}
