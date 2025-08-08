import { useState } from "react";
import { BfDsFormSubmitButton } from "../BfDsFormSubmitButton.tsx";
import { BfDsCallout } from "../BfDsCallout.tsx";
import { BfDsForm } from "../BfDsForm.tsx";
import { BfDsInput } from "../BfDsInput.tsx";
import { BfDsCodeExample } from "../BfDsCodeExample.tsx";

export function BfDsFormSubmitButtonExample() {
  const [formData, setFormData] = useState({ name: "" });
  const [notification, setNotification] = useState({
    message: "",
    details: "",
    visible: false,
  });

  return (
    <div className="bfds-example">
      <h2>BfDsFormSubmitButton Examples</h2>

      <div className="bfds-example__section">
        <h3>Usage</h3>
        <BfDsCodeExample
          language="tsx"
          code={`import { BfDsFormSubmitButton } from "@bfmono/apps/bfDs/components/BfDsFormSubmitButton.tsx";
import { BfDsForm } from "@bfmono/apps/bfDs/components/BfDsForm.tsx";

// Basic usage (inside BfDsForm)
<BfDsForm onSubmit={handleSubmit}>
  <BfDsFormSubmitButton />
</BfDsForm>

// All available props (inherits from BfDsButton)
<BfDsFormSubmitButton
  text="Submit"           // string (default: "Submit")
  onClick={(e) => {}}     // (e: MouseEvent) => void (optional)
  variant="primary"       // "primary" | "secondary" | "ghost" | "outline" | "danger"
  size="medium"          // "small" | "medium" | "large"
  disabled={false}        // boolean
  loading={false}         // boolean
  loadingText="..."       // string
  icon="send"            // BfDsIconName
  iconPosition="left"    // "left" | "right"
  fullWidth={false}       // boolean
  className=""           // string
>
  Custom Submit Text
</BfDsFormSubmitButton>`}
        />
      </div>

      <div className="bfds-example__section">
        <h3>Form Integration</h3>
        <p className="bfds-example__label">
          Submit button automatically integrates with form context for
          submission handling.
        </p>
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
            <BfDsInput
              name="name"
              label="Your Name"
              placeholder="Enter your name"
              required
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
    </div>
  );
}
