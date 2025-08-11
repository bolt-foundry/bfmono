import * as React from "react";
import { BfDsRange } from "../BfDsRange.tsx";
import { BfDsForm } from "../BfDsForm.tsx";
import { BfDsFormSubmitButton } from "../BfDsFormSubmitButton.tsx";
import { BfDsCallout } from "../BfDsCallout.tsx";
import { BfDsCodeExample } from "../BfDsCodeExample.tsx";

export function BfDsRangeExample() {
  const [value, setValue] = React.useState(50);
  const [volumeValue, setVolumeValue] = React.useState(0.7);
  const [temperatureValue, setTemperatureValue] = React.useState(20);
  const [formData, setFormData] = React.useState<
    Record<string, unknown> | null
  >(null);

  const handleFormSubmit = (data: Record<string, unknown>) => {
    setFormData(data);
  };

  return (
    <div className="bfds-example">
      <h2 className="bfds-example__title">BfDsRange Examples</h2>

      <div className="bfds-example__section">
        <h3>Usage</h3>
        <BfDsCodeExample
          language="tsx"
          code={`import { BfDsRange } from "@bfmono/apps/bfDs/components/BfDsRange.tsx";

// Basic usage
<BfDsRange
  label="Volume"
  value={50}
  onChange={(e) => setValue(e.target.value)}
/>

// All available props
<BfDsRange
  name="volume"                     // string - form field name
  value={50}                        // number - controlled value
  defaultValue={50}                 // number - uncontrolled default
  onChange={(e) => {}}              // (e: ChangeEvent) => void
  label="Volume"                    // string - label text
  min={0}                          // number - minimum value
  max={100}                        // number - maximum value
  step={1}                         // number - step increment
  showValue={true}                 // boolean - show current value
  formatValue={(v) => v + "%"}     // (value: number) => string
  showTicks={false}                // boolean - show tick marks
  tickLabels={[                    // Array - custom tick labels
    { value: 0, label: "Min" },
    { value: 100, label: "Max" }
  ]}
  size="medium"                    // "small" | "medium" | "large"
  state="default"                  // "default" | "error" | "success" | "disabled"
  color="#007bff"                  // string - custom color
  errorMessage=""                  // string - error message
  successMessage=""                // string - success message
  helpText=""                      // string - help text
  disabled={false}                 // boolean
  required={false}                 // boolean
  className=""                     // string
/>`}
        />
      </div>

      <section className="bfds-example__section">
        <h3 className="bfds-example__subtitle">Controlled vs Uncontrolled</h3>
        <div className="bfds-example__items">
          <BfDsRange
            label="Controlled range"
            value={value}
            onChange={(e) => setValue(Number(e.target.value))}
            helpText={`Current value: ${value}`}
          />
          <BfDsRange
            label="Uncontrolled range"
            defaultValue={30}
            helpText="Manages its own state internally"
          />
        </div>
      </section>

      <section className="bfds-example__section">
        <h3 className="bfds-example__subtitle">Sizes</h3>
        <div className="bfds-example__items">
          <BfDsRange
            label="Small"
            size="small"
            defaultValue={30}
          />
          <BfDsRange
            label="Medium (default)"
            size="medium"
            defaultValue={50}
          />
          <BfDsRange
            label="Large"
            size="large"
            defaultValue={70}
          />
        </div>
      </section>

      <section className="bfds-example__section">
        <h3 className="bfds-example__subtitle">States</h3>
        <div className="bfds-example__items">
          <BfDsRange
            label="Default state"
            defaultValue={25}
            helpText="This is a help text"
          />
          <BfDsRange
            label="Error state"
            state="error"
            defaultValue={50}
            errorMessage="Value must be between 0 and 40"
          />
          <BfDsRange
            label="Success state"
            state="success"
            defaultValue={75}
            successMessage="Perfect value!"
          />
          <BfDsRange
            label="Disabled state"
            disabled
            defaultValue={50}
          />
        </div>
      </section>

      <section className="bfds-example__section">
        <h3 className="bfds-example__subtitle">Custom Min/Max/Step</h3>
        <div className="bfds-example__items">
          <BfDsRange
            label="Volume (0-1)"
            min={0}
            max={1}
            step={0.1}
            value={volumeValue}
            onChange={(e) => setVolumeValue(Number(e.target.value))}
            formatValue={(val) => `${Math.round(val * 100)}%`}
          />
          <BfDsRange
            label="Temperature (°C)"
            min={-10}
            max={40}
            step={1}
            value={temperatureValue}
            onChange={(e) => setTemperatureValue(Number(e.target.value))}
            formatValue={(val) => `${val}°C`}
          />
        </div>
      </section>

      <section className="bfds-example__section">
        <h3 className="bfds-example__subtitle">
          Negative Ranges (Fill from Zero)
        </h3>
        <div className="bfds-example__items">
          <BfDsRange
            label="Balance (-100 to 100)"
            min={-100}
            max={100}
            step={10}
            defaultValue={0}
            showTicks
            tickLabels={[
              { value: -100, label: "-100" },
              { value: -50, label: "-50" },
              { value: 0, label: "0" },
              { value: 50, label: "50" },
              { value: 100, label: "100" },
            ]}
          />
          <BfDsRange
            label="Adjustment (-50 to 50)"
            min={-50}
            max={50}
            step={5}
            defaultValue={-20}
            formatValue={(val) => val > 0 ? `+${val}` : `${val}`}
          />
        </div>
      </section>

      <section className="bfds-example__section">
        <h3 className="bfds-example__subtitle">With Tick Marks</h3>
        <div className="bfds-example__items">
          <BfDsRange
            label="Auto-generated Ticks"
            showTicks
            defaultValue={50}
          />
          <BfDsRange
            label="Custom Tick Labels"
            showTicks
            tickLabels={[
              { value: 0, label: "Empty" },
              { value: 25, label: "Low" },
              { value: 50, label: "Medium" },
              { value: 75, label: "High" },
              { value: 100, label: "Full" },
            ]}
            defaultValue={50}
          />
        </div>
      </section>

      <section className="bfds-example__section">
        <h3 className="bfds-example__subtitle">Value Display Options</h3>
        <div className="bfds-example__items">
          <BfDsRange
            label="With Value Display (default)"
            showValue
            defaultValue={75}
          />
          <BfDsRange
            label="Without Value Display"
            showValue={false}
            defaultValue={25}
          />
        </div>
      </section>

      <section className="bfds-example__section">
        <h3 className="bfds-example__subtitle">Custom Colors</h3>
        <div className="bfds-example__items">
          <BfDsRange
            label="Red range"
            color="#ef4444"
            defaultValue={60}
          />
          <BfDsRange
            label="Green range"
            color="#10b981"
            defaultValue={40}
          />
          <BfDsRange
            label="Purple range"
            color="#8b5cf6"
            defaultValue={80}
            showTicks
          />
        </div>
      </section>

      <section className="bfds-example__section">
        <h3 className="bfds-example__subtitle">Form Integration</h3>
        <BfDsForm initialData={{}} onSubmit={handleFormSubmit}>
          <BfDsRange
            name="brightness"
            label="Brightness"
            min={0}
            max={100}
            required
            helpText="Adjust the screen brightness"
          />
          <BfDsRange
            name="contrast"
            label="Contrast"
            min={0}
            max={100}
            formatValue={(val) => `${val}%`}
          />
          <BfDsRange
            name="saturation"
            label="Saturation"
            min={-50}
            max={50}
            step={5}
            showTicks
            tickLabels={[
              { value: -50, label: "-50" },
              { value: 0, label: "Normal" },
              { value: 50, label: "+50" },
            ]}
          />
          <BfDsFormSubmitButton>Apply Settings</BfDsFormSubmitButton>
        </BfDsForm>
        {formData && (
          <BfDsCallout
            variant="info"
            details={JSON.stringify(formData, null, 2)}
          >
            <h3>Form submitted</h3>
            Settings applied successfully
          </BfDsCallout>
        )}
      </section>
    </div>
  );
}
