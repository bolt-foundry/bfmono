# BfDsRange

A sophisticated range slider component with customizable appearance, tick marks,
and value formatting. Features intelligent fill rendering for negative ranges,
custom colors, and seamless form integration. Supports both controlled and
uncontrolled usage patterns.

## Props

```typescript
export type BfDsRangeSize = "small" | "medium" | "large";
export type BfDsRangeState = "default" | "error" | "success" | "disabled";

export type BfDsRangeProps =
  & {
    // Form context props
    /** Form field name for data binding */
    name?: string;

    // Standalone props
    /** Current range value (controlled) */
    value?: number;
    /** Default value for uncontrolled usage */
    defaultValue?: number;
    /** Change event handler */
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;

    // Common props
    /** Label text displayed above range */
    label?: string;
    /** Minimum value */
    min?: number;
    /** Maximum value */
    max?: number;
    /** Step increment */
    step?: number;
    /** Show value display */
    showValue?: boolean;
    /** Custom value formatter */
    formatValue?: (value: number) => string;
    /** Show tick marks */
    showTicks?: boolean;
    /** Custom tick labels */
    tickLabels?: Array<{ value: number; label: string }>;
    /** Size variant */
    size?: BfDsRangeSize;
    /** Visual state of the range */
    state?: BfDsRangeState;
    /** Custom color for the fill and handle */
    color?: string;
    /** Error message to display */
    errorMessage?: string;
    /** Success message to display */
    successMessage?: string;
    /** Help text displayed below range */
    helpText?: string;
    /** Required for validation */
    required?: boolean;
    /** Additional CSS classes */
    className?: string;
  }
  & Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "value" | "onChange" | "type" | "min" | "max" | "step" | "size"
  >;
```

## Basic Usage

```tsx
import { BfDsRange } from "@bfmono/bfDs";

// Simple range
<BfDsRange
  label="Volume"
  value={volume}
  onChange={(e) => setVolume(Number(e.target.value))}
  min={0}
  max={100}
/>

// With custom formatting
<BfDsRange
  label="Brightness"
  value={brightness}
  onChange={(e) => setBrightness(Number(e.target.value))}
  min={0}
  max={100}
  formatValue={(val) => `${val}%`}
/>
```

## Controlled vs Uncontrolled Usage

### Controlled Component

Use when you need to manage the range value in your component state:

```tsx
const [volume, setVolume] = useState(50);

<BfDsRange
  label="Volume Control"
  value={volume}
  onChange={(e) => setVolume(Number(e.target.value))}
  min={0}
  max={100}
  formatValue={(val) => `${val}%`}
  helpText={`Current volume: ${volume}%`}
/>;
```

### Uncontrolled Component

Use when you want the component to manage its own state:

```tsx
// With default value
<BfDsRange
  label="Default Brightness"
  defaultValue={75}
  min={0}
  max={100}
  formatValue={(val) => `${val}%`}
/>

// Without default (starts at minimum)
<BfDsRange
  label="Adjustment"
  min={-50}
  max={50}
  step={5}
/>
```

## Form Integration

BfDsRange automatically integrates with BfDsForm:

```tsx
const [formData, setFormData] = useState({
  brightness: 50,
  contrast: 75,
  saturation: 0,
});

<BfDsForm
  initialData={formData}
  onSubmit={handleSubmit}
  onChange={setFormData}
>
  <BfDsRange
    name="brightness"
    label="Brightness"
    min={0}
    max={100}
    formatValue={(val) => `${val}%`}
    required
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
  />

  <BfDsFormSubmitButton text="Apply Settings" />
</BfDsForm>;
```

## Range Configuration

### Min/Max/Step

```tsx
// Basic 0-100 range
<BfDsRange
  label="Percentage"
  min={0}
  max={100}
  step={1}
  defaultValue={50}
/>

// Decimal values
<BfDsRange
  label="Volume (0-1)"
  min={0}
  max={1}
  step={0.1}
  defaultValue={0.5}
  formatValue={(val) => `${Math.round(val * 100)}%`}
/>

// Temperature range
<BfDsRange
  label="Temperature"
  min={-10}
  max={40}
  step={1}
  defaultValue={20}
  formatValue={(val) => `${val}°C`}
/>

// Large range with bigger steps
<BfDsRange
  label="Price Range"
  min={0}
  max={1000}
  step={50}
  defaultValue={200}
  formatValue={(val) => `$${val}`}
/>
```

## Negative Range Support

BfDsRange intelligently handles negative ranges by filling from zero:

```tsx
// Balance control (-100 to 100)
<BfDsRange
  label="Audio Balance"
  min={-100}
  max={100}
  step={10}
  defaultValue={0}
  formatValue={(val) => val > 0 ? `+${val}` : `${val}`}
  showTicks
  tickLabels={[
    { value: -100, label: "L" },
    { value: 0, label: "Center" },
    { value: 100, label: "R" },
  ]}
/>

// Adjustment range
<BfDsRange
  label="Image Adjustment"
  min={-50}
  max={50}
  step={5}
  defaultValue={-10}
  formatValue={(val) => val > 0 ? `+${val}` : `${val}`}
/>
```

## Value Display and Formatting

### Show/Hide Value Display

```tsx
// With value display (default)
<BfDsRange
  label="With Value"
  showValue
  defaultValue={75}
/>

// Without value display
<BfDsRange
  label="Without Value"
  showValue={false}
  defaultValue={25}
/>
```

### Custom Value Formatting

```tsx
// Percentage format
<BfDsRange
  label="Progress"
  defaultValue={65}
  formatValue={(val) => `${val}%`}
/>

// Currency format
<BfDsRange
  label="Budget"
  min={0}
  max={5000}
  step={100}
  defaultValue={1500}
  formatValue={(val) => `$${val.toLocaleString()}`}
/>

// Time format
<BfDsRange
  label="Duration (minutes)"
  min={0}
  max={120}
  step={5}
  defaultValue={30}
  formatValue={(val) => `${val} min`}
/>

// Custom units
<BfDsRange
  label="File Size"
  min={1}
  max={100}
  step={1}
  defaultValue={25}
  formatValue={(val) => `${val} MB`}
/>
```

## Tick Marks

### Automatic Tick Generation

```tsx
<BfDsRange
  label="Auto Ticks"
  showTicks
  defaultValue={50}
  helpText="Automatically generates 5 evenly spaced ticks"
/>;
```

### Custom Tick Labels

```tsx
<BfDsRange
  label="Quality Setting"
  min={0}
  max={100}
  showTicks
  tickLabels={[
    { value: 0, label: "Low" },
    { value: 25, label: "Medium" },
    { value: 50, label: "High" },
    { value: 75, label: "Ultra" },
    { value: 100, label: "Max" },
  ]}
  defaultValue={50}
/>;
```

### Performance Ticks

```tsx
<BfDsRange
  label="Performance vs Quality"
  min={0}
  max={10}
  showTicks
  tickLabels={[
    { value: 0, label: "Performance" },
    { value: 5, label: "Balanced" },
    { value: 10, label: "Quality" },
  ]}
  defaultValue={5}
/>;
```

## Size Variants

```tsx
// Small size
<BfDsRange
  label="Small Range"
  size="small"
  defaultValue={30}
/>

// Medium size (default)
<BfDsRange
  label="Medium Range"
  size="medium"
  defaultValue={50}
/>

// Large size
<BfDsRange
  label="Large Range"
  size="large"
  defaultValue={70}
/>
```

## States

### Default State

```tsx
<BfDsRange
  label="Normal Range"
  defaultValue={50}
  helpText="This is a normal range slider"
/>;
```

### Error State

```tsx
<BfDsRange
  label="Invalid Value"
  state="error"
  defaultValue={85}
  errorMessage="Value must be between 0 and 75"
/>;
```

### Success State

```tsx
<BfDsRange
  label="Optimal Setting"
  state="success"
  defaultValue={65}
  successMessage="Perfect setting!"
/>;
```

### Disabled State

```tsx
<BfDsRange
  label="Locked Setting"
  disabled
  defaultValue={50}
/>;
```

## Custom Colors

Apply custom colors to the range fill and handle:

```tsx
// Red range
<BfDsRange
  label="Red Range"
  color="#ef4444"
  defaultValue={60}
/>

// Green range
<BfDsRange
  label="Success Range"
  color="#10b981"
  defaultValue={40}
/>

// Purple range with ticks
<BfDsRange
  label="Custom Purple"
  color="#8b5cf6"
  defaultValue={80}
  showTicks
/>

// Dynamic color based on value
const [value, setValue] = useState(50);
const getColor = (val: number) => {
  if (val < 30) return "#ef4444"; // red
  if (val < 70) return "#f59e0b"; // yellow
  return "#10b981"; // green
};

<BfDsRange
  label="Dynamic Color"
  value={value}
  onChange={(e) => setValue(Number(e.target.value))}
  color={getColor(value)}
/>
```

## Common Use Cases

### Audio Controls

```tsx
<div className="audio-controls">
  <BfDsRange
    label="Volume"
    min={0}
    max={100}
    defaultValue={70}
    formatValue={(val) => `${val}%`}
    color="#10b981"
  />

  <BfDsRange
    label="Balance"
    min={-50}
    max={50}
    defaultValue={0}
    formatValue={(val) =>
      val === 0 ? "Center" : val > 0 ? `R+${val}` : `L${val}`}
    showTicks
    tickLabels={[
      { value: -50, label: "L" },
      { value: 0, label: "C" },
      { value: 50, label: "R" },
    ]}
  />

  <BfDsRange
    label="Bass"
    min={-10}
    max={10}
    step={1}
    defaultValue={0}
    formatValue={(val) => val > 0 ? `+${val}dB` : `${val}dB`}
  />
</div>;
```

### Image Editor

```tsx
<div className="image-editor">
  <BfDsRange
    label="Brightness"
    min={-100}
    max={100}
    defaultValue={0}
    formatValue={(val) => val > 0 ? `+${val}` : `${val}`}
  />

  <BfDsRange
    label="Contrast"
    min={0}
    max={200}
    defaultValue={100}
    formatValue={(val) => `${val}%`}
  />

  <BfDsRange
    label="Saturation"
    min={0}
    max={200}
    defaultValue={100}
    formatValue={(val) => `${val}%`}
  />

  <BfDsRange
    label="Opacity"
    min={0}
    max={1}
    step={0.05}
    defaultValue={1}
    formatValue={(val) => `${Math.round(val * 100)}%`}
  />
</div>;
```

### Performance Settings

```tsx
<div className="performance-settings">
  <BfDsRange
    label="Graphics Quality"
    min={0}
    max={5}
    showTicks
    tickLabels={[
      { value: 0, label: "Low" },
      { value: 1, label: "Medium" },
      { value: 2, label: "High" },
      { value: 3, label: "Ultra" },
      { value: 4, label: "Epic" },
      { value: 5, label: "Cinematic" },
    ]}
    defaultValue={2}
  />

  <BfDsRange
    label="Frame Rate Limit"
    min={30}
    max={144}
    step={15}
    defaultValue={60}
    formatValue={(val) => `${val} FPS`}
    showTicks
  />
</div>;
```

### Price Range Filter

```tsx
const [minPrice, setMinPrice] = useState(100);
const [maxPrice, setMaxPrice] = useState(800);

<div className="price-filter">
  <BfDsRange
    label="Minimum Price"
    min={0}
    max={1000}
    step={25}
    value={minPrice}
    onChange={(e) => setMinPrice(Number(e.target.value))}
    formatValue={(val) => `$${val}`}
  />

  <BfDsRange
    label="Maximum Price"
    min={0}
    max={1000}
    step={25}
    value={maxPrice}
    onChange={(e) => setMaxPrice(Number(e.target.value))}
    formatValue={(val) => `$${val}`}
  />

  <div>Price range: ${minPrice} - ${maxPrice}</div>
</div>;
```

## Accessibility

BfDsRange includes comprehensive accessibility features:

- **Semantic HTML** - Uses proper range input element with labels
- **ARIA attributes** - Includes `aria-valuemin`, `aria-valuemax`,
  `aria-valuenow`, `aria-valuetext`
- **Screen reader support** - Value changes are announced properly
- **Keyboard navigation** - Arrow keys adjust value, Home/End go to min/max
- **Focus management** - Clear visual focus indicators
- **Value formatting** - Custom formatted values are announced to screen readers

### Keyboard Navigation

- **Left/Down Arrow** - Decrease value by step
- **Right/Up Arrow** - Increase value by step
- **Home** - Go to minimum value
- **End** - Go to maximum value
- **Page Up/Down** - Large increment/decrement (10% of range)

### Best Practices

- Always provide descriptive labels
- Use appropriate min/max/step values for the use case
- Consider custom formatting for better user understanding
- Test keyboard navigation thoroughly
- Ensure sufficient color contrast for custom colors
- Provide help text for complex ranges

## Styling Notes

BfDsRange uses CSS classes with the `bfds-range` prefix:

- `.bfds-range-container` - Main container wrapper
- `.bfds-range-header` - Label and value display container
- `.bfds-range-wrapper` - Range input wrapper
- `.bfds-range-track` - Range track background
- `.bfds-range-fill` - Active range fill
- `.bfds-range` - The range input element
- `.bfds-range-ticks` - Tick marks container
- `.bfds-range-tick` - Individual tick mark
- `.bfds-range-label` - Range label styling

### State and Size Modifiers

- `.bfds-range--{size}` - Size-specific styling
- `.bfds-range--{state}` - State-specific styling
- `.bfds-range-container--with-ticks` - When ticks are enabled

The component automatically:

- Calculates fill position based on value and range
- Handles negative ranges by filling from zero position
- Positions tick marks accurately along the track
- Applies custom colors via CSS custom properties
- Manages focus and hover states appropriately
- Ensures proper value precision based on step size
