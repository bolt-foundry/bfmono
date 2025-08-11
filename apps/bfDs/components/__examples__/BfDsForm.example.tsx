import * as React from "react";
import { getLogger } from "@bfmono/packages/logger/logger.ts";
import { BfDsForm } from "../BfDsForm.tsx";
import { BfDsCallout } from "../BfDsCallout.tsx";
import { BfDsInput } from "../BfDsInput.tsx";
import { BfDsTextArea } from "../BfDsTextArea.tsx";
import { BfDsSelect } from "../BfDsSelect.tsx";
import { BfDsCheckbox } from "../BfDsCheckbox.tsx";
import { BfDsRadio } from "../BfDsRadio.tsx";
import { BfDsToggle } from "../BfDsToggle.tsx";
import { BfDsFormSubmitButton } from "../BfDsFormSubmitButton.tsx";
import { BfDsCodeExample } from "../BfDsCodeExample.tsx";

const { useState } = React;
const logger = getLogger(import.meta);

export function BfDsFormExample() {
  type ExampleFormData = {
    name: string;
    email: string;
    message: string;
    country: string;
    newsletter: boolean;
    contactMethod: string;
    notifications: boolean;
  };

  const exampleInitialFormData: ExampleFormData = {
    name: "John Doe",
    email: "john@example.com",
    message: "Hello world!",
    country: "us",
    newsletter: false,
    contactMethod: "email",
    notifications: true,
  };

  const [notification, setNotification] = useState({
    message: "",
    details: "",
    visible: false,
  });

  function exampleOnSubmit(value: ExampleFormData) {
    logger.info("Form submitted:", value);
    setNotification({
      message: "Form submitted successfully!",
      details: JSON.stringify(value, null, 2),
      visible: true,
    });
  }

  function exampleOnChange(value: ExampleFormData) {
    logger.debug("Form changed:", value);
  }

  return (
    <div className="bfds-example">
      <h2>BfDsForm Examples</h2>

      <div className="bfds-example__section">
        <h3>Usage</h3>
        <BfDsCodeExample
          language="tsx"
          code={`import { BfDsForm } from "@bfmono/apps/bfDs/components/BfDsForm.tsx";
import { BfDsInput } from "@bfmono/apps/bfDs/components/BfDsInput.tsx";
import { BfDsFormSubmitButton } from "@bfmono/apps/bfDs/components/BfDsFormSubmitButton.tsx";

// Basic usage
<BfDsForm
  initialData={{ name: "", email: "" }}
  onSubmit={(data) => console.log(data)}
>
  <BfDsInput name="name" label="Name" required />
  <BfDsInput name="email" label="Email" type="email" required />
  <BfDsFormSubmitButton />
</BfDsForm>

// All available props
<BfDsForm<T>
  initialData={T}                 // T (required) - initial form values
  onSubmit={(data: T) => {}}      // (data: T) => void
  onChange={(data: T) => {}}      // (data: T) => void
  onError={(errors) => {}}        // (errors: FormErrors) => void
  className=""                    // string
  testId=""                       // string - for testing
>
  {/* Form controls with 'name' prop will auto-bind */}
</BfDsForm>`}
        />
      </div>

      <div className="bfds-example__section">
        <h3>Complete Form with Context Integration</h3>
        <p className="bfds-example__label">
          All form fields automatically sync with centralized form state without
          individual value/onChange props.
        </p>
        <BfDsForm<ExampleFormData>
          onSubmit={exampleOnSubmit}
          onChange={exampleOnChange}
          initialData={exampleInitialFormData}
        >
          <div className="bfds-example__group">
            <BfDsInput
              name="name"
              label="Your name"
              placeholder="Enter your name"
              required
            />
            <BfDsInput
              name="email"
              label="Email address"
              type="email"
              placeholder="email@example.com"
              required
            />
            <BfDsTextArea
              name="message"
              label="Message"
              placeholder="Enter your message..."
              rows={4}
            />
            <BfDsSelect
              name="country"
              label="Country"
              options={[
                { value: "us", label: "United States" },
                { value: "ca", label: "Canada" },
                { value: "uk", label: "United Kingdom" },
                { value: "au", label: "Australia" },
              ]}
            />
            <BfDsCheckbox
              name="newsletter"
              label="Subscribe to newsletter"
            />
            <BfDsRadio
              name="contactMethod"
              label="Preferred Contact Method"
              options={[
                { value: "email", label: "Email" },
                { value: "phone", label: "Phone" },
                { value: "text", label: "Text message" },
              ]}
            />
            <BfDsToggle
              name="notifications"
              label="Push notifications"
            />
            <BfDsFormSubmitButton text="Submit Complete Form" />
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
        <h3>Form Context Benefits</h3>
        <ul className="bfds-example__group">
          <li>Components automatically sync with form state</li>
          <li>No need to pass value/onChange to each field</li>
          <li>Form-level validation and error handling</li>
          <li>Centralized form submission logic</li>
          <li>
            Support for all input types: text, select, checkbox, radio, toggle
          </li>
          <li>TypeScript-safe form data with proper type inference</li>
        </ul>
      </div>
    </div>
  );
}
