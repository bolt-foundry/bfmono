import { useState } from "react";
import { BfDsRadio, type BfDsRadioOption } from "../BfDsRadio.tsx";
import { BfDsForm } from "../BfDsForm.tsx";
import { BfDsCallout } from "../BfDsCallout.tsx";
import { BfDsFormSubmitButton } from "../BfDsFormSubmitButton.tsx";
import { BfDsCodeExample } from "../BfDsCodeExample.tsx";

export function BfDsRadioExample() {
  const [standaloneValue, setStandaloneValue] = useState("");
  const [formData, setFormData] = useState({
    size: "",
    theme: "",
    plan: "",
  });
  const [notification, setNotification] = useState({
    message: "",
    details: "",
    visible: false,
  });

  const sizeOptions: Array<BfDsRadioOption> = [
    { value: "small", label: "Small" },
    { value: "medium", label: "Medium" },
    { value: "large", label: "Large" },
  ];

  const themeOptions: Array<BfDsRadioOption> = [
    { value: "light", label: "Light Theme" },
    { value: "dark", label: "Dark Theme" },
    { value: "auto", label: "Auto (System)" },
  ];

  const planOptions: Array<BfDsRadioOption> = [
    { value: "free", label: "Free Plan" },
    { value: "pro", label: "Pro Plan" },
    { value: "enterprise", label: "Enterprise Plan" },
    { value: "beta", label: "Beta Plan", disabled: true },
  ];

  return (
    <div className="bfds-example">
      <h2>BfDsRadio Examples</h2>

      <div className="bfds-example__section">
        <h3>Usage</h3>
        <BfDsCodeExample
          language="tsx"
          code={`import { BfDsRadio } from "@bfmono/apps/bfDs/components/BfDsRadio.tsx";

// Basic usage
<BfDsRadio
  name="choice"
  options={[
    { value: "yes", label: "Yes" },
    { value: "no", label: "No" }
  ]}
  value={selectedValue}
  onChange={(value) => setSelectedValue(value)}
/>

// All available props
<BfDsRadio
  name="choice"                   // string (required) - field name
  value="yes"                     // string - controlled value
  defaultValue="no"               // string - uncontrolled default
  onChange={(value) => {}}        // (value: string) => void
  options={[                      // Array<BfDsRadioOption> (required)
    {
      value: "option1",          // string - submitted value
      label: "Option 1",         // string - display text
      disabled: false            // boolean - disable option
    }
  ]}
  label="Select an option"        // string - group label
  required={false}                // boolean
  disabled={false}                // boolean - disable all options
  orientation="vertical"          // "vertical" | "horizontal"
  size="medium"                   // "small" | "medium" | "large"
  className=""                    // string
/>`}
        />
      </div>

      <div className="bfds-example__section">
        <h3>Controlled vs Uncontrolled</h3>
        <div className="bfds-example__group">
          <BfDsRadio
            name="controlled-radio"
            label="Controlled Radio Group"
            options={sizeOptions}
            value={standaloneValue}
            onChange={setStandaloneValue}
            required
          />
          <p>Selected: {standaloneValue || "None"}</p>

          <BfDsRadio
            name="uncontrolled-radio"
            label="Uncontrolled Radio Group (starts with Medium)"
            options={sizeOptions}
            defaultValue="medium"
          />
          <p>This radio group manages its own state internally</p>
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
            <BfDsRadio
              name="size"
              label="Size"
              options={sizeOptions}
              required
            />

            <BfDsRadio
              name="theme"
              label="Theme"
              options={themeOptions}
              orientation="horizontal"
            />

            <BfDsRadio
              name="plan"
              label="Plan"
              options={planOptions}
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
        <h3>Orientations</h3>
        <div className="bfds-example__group">
          <BfDsRadio
            name="vertical-example"
            label="Vertical Layout (default)"
            options={themeOptions}
            orientation="vertical"
            defaultValue="light"
          />

          <BfDsRadio
            name="horizontal-example"
            label="Horizontal Layout"
            options={themeOptions}
            orientation="horizontal"
            defaultValue="dark"
          />
        </div>
      </div>

      <div className="bfds-example__section">
        <h3>Sizes</h3>
        <div className="bfds-example__group">
          <BfDsRadio
            name="small-example"
            label="Small Size"
            options={[{ value: "small", label: "Small" }]}
            size="small"
            defaultValue="small"
          />
          <BfDsRadio
            name="medium-example"
            label="Medium Size"
            options={[{ value: "medium", label: "Medium" }]}
            size="medium"
            defaultValue="medium"
          />
          <BfDsRadio
            name="large-example"
            label="Large Size"
            options={[{ value: "large", label: "Large" }]}
            size="large"
            defaultValue="large"
          />
        </div>
      </div>

      <div className="bfds-example__section">
        <h3>States</h3>
        <div className="bfds-example__group">
          <BfDsRadio
            name="disabled-example"
            label="Disabled Group"
            options={sizeOptions}
            disabled
          />

          <BfDsRadio
            name="mixed-disabled-example"
            label="Mixed Disabled Options"
            options={planOptions}
          />
        </div>
      </div>
    </div>
  );
}
