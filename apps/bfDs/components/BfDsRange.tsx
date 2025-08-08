/**
 * @fileoverview BfDsRange - Sophisticated range slider component with negative range support and tick marks
 * @author Justin Carter <justin@boltfoundry.com>
 * @since 2.0.0
 */
import type * as React from "react";
import { useId, useState } from "react";
import { useBfDsFormContext } from "./BfDsForm.tsx";

/**
 * Size variants for the BfDsRange component
 */
export type BfDsRangeSize = "small" | "medium" | "large";

/**
 * Visual states for the BfDsRange component
 */
export type BfDsRangeState = "default" | "error" | "success" | "disabled";

/**
 * Props for the BfDsRange component
 */
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

/**
 * A sophisticated range slider component with customizable appearance and intelligent fill rendering
 *
 * BfDsRange provides a comprehensive range slider experience with support for negative ranges,
 * custom colors, tick marks, and value formatting. It includes intelligent fill rendering that
 * handles negative ranges by filling from zero, and offers seamless form integration.
 *
 * Features:
 * - Intelligent fill rendering for negative ranges (fills from zero position)
 * - Custom colors for fill and handle
 * - Tick marks with automatic or custom labeling
 * - Custom value formatting and display
 * - Multiple visual states (default, error, success, disabled)
 * - Three size variants (small, medium, large)
 * - Seamless form integration with BfDsForm
 * - Comprehensive keyboard navigation (Arrow keys, Home/End, Page Up/Down)
 * - Accessibility features with proper ARIA attributes
 *
 * @param props - Component props
 * @param props.name - Form field name for data binding when used within BfDsForm
 * @param props.value - Current range value (controlled mode)
 * @param props.defaultValue - Default value for uncontrolled usage
 * @param props.onChange - Change event handler
 * @param props.label - Label text displayed above range
 * @param props.min - Minimum value (default: 0)
 * @param props.max - Maximum value (default: 100)
 * @param props.step - Step increment (default: 1)
 * @param props.showValue - Whether to show value display (default: true)
 * @param props.formatValue - Custom value formatter function
 * @param props.showTicks - Whether to show tick marks
 * @param props.tickLabels - Custom tick labels with values and labels
 * @param props.size - Size variant (small, medium, large)
 * @param props.state - Visual state (default, error, success, disabled)
 * @param props.color - Custom color for fill and handle
 * @param props.errorMessage - Error message to display in error state
 * @param props.successMessage - Success message to display in success state
 * @param props.helpText - Help text displayed below range
 * @param props.required - Whether input is required for form validation
 * @param props.className - Additional CSS classes to apply
 * @param props.disabled - Whether the range is disabled
 * @param props.id - Element ID for the range input
 *
 * @example
 * Basic usage:
 * ```tsx
 * <BfDsRange
 *   label="Volume"
 *   value={volume}
 *   onChange={(e) => setVolume(Number(e.target.value))}
 *   min={0}
 *   max={100}
 *   formatValue={(val) => `${val}%`}
 * />
 * ```
 *
 * @example
 * With form integration:
 * ```tsx
 * <BfDsForm initialData={formData} onChange={setFormData}>
 *   <BfDsRange
 *     name="brightness"
 *     label="Brightness"
 *     min={0}
 *     max={100}
 *     formatValue={(val) => `${val}%`}
 *     required
 *   />
 * </BfDsForm>
 * ```
 *
 * @example
 * Negative range with custom formatting:
 * ```tsx
 * <BfDsRange
 *   label="Audio Balance"
 *   min={-100}
 *   max={100}
 *   defaultValue={0}
 *   formatValue={(val) => val > 0 ? `+${val}` : `${val}`}
 *   showTicks
 *   tickLabels={[
 *     { value: -100, label: "L" },
 *     { value: 0, label: "Center" },
 *     { value: 100, label: "R" }
 *   ]}
 * />
 * ```
 *
 * @example
 * With custom color and validation:
 * ```tsx
 * const [value, setValue] = useState(50);
 * const getColor = (val) => {
 *   if (val < 30) return "#ef4444"; // red
 *   if (val < 70) return "#f59e0b"; // yellow
 *   return "#10b981"; // green
 * };
 *
 * <BfDsRange
 *   label="Performance Level"
 *   value={value}
 *   onChange={(e) => setValue(Number(e.target.value))}
 *   color={getColor(value)}
 *   showTicks
 *   formatValue={(val) => `${val}%`}
 * />
 * ```
 *
 * @returns A sophisticated range slider component with intelligent fill rendering
 */
export function BfDsRange({
  name,
  value: standaloneProp,
  defaultValue,
  onChange: standaloneOnChange,
  label,
  min = 0,
  max = 100,
  step = 1,
  showValue = true,
  formatValue = (val) => val.toString(),
  showTicks = false,
  tickLabels,
  size = "medium",
  state = "default",
  color,
  errorMessage,
  successMessage,
  helpText,
  required = false,
  className,
  disabled,
  id,
  ...props
}: BfDsRangeProps) {
  const formContext = useBfDsFormContext();
  const inputId = id || useId();
  const helpTextId = `${inputId}-help`;
  const errorId = `${inputId}-error`;
  const successId = `${inputId}-success`;

  // Internal state for uncontrolled mode
  const [internalValue, setInternalValue] = useState(
    defaultValue ?? min,
  );

  // Determine if we're in form context or standalone mode
  const isInFormContext = formContext !== null && name !== undefined;
  const isControlled = standaloneProp !== undefined;

  // Get value from form context, controlled prop, or internal state
  const value = isInFormContext && formContext?.data && name
    ? (formContext.data[name as keyof typeof formContext.data] as number) ?? min
    : isControlled
    ? standaloneProp
    : internalValue;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = parseFloat(e.target.value);

    // Round to the appropriate precision based on step to avoid floating point issues
    const decimalPlaces = step.toString().includes(".")
      ? step.toString().split(".")[1].length
      : 0;
    const newValue = Math.round(rawValue * Math.pow(10, decimalPlaces)) /
      Math.pow(10, decimalPlaces);

    if (isInFormContext && formContext?.onChange && formContext?.data && name) {
      formContext.onChange({ ...formContext.data, [name]: newValue });
    } else if (standaloneOnChange) {
      // Create a new event with the corrected value
      const correctedEvent = {
        ...e,
        target: { ...e.target, value: newValue.toString() },
      } as React.ChangeEvent<HTMLInputElement>;
      standaloneOnChange(correctedEvent);
    } else if (!isControlled) {
      // Update internal state for uncontrolled mode
      setInternalValue(newValue);
    }
  };

  // Get error state from form context if available
  const formError = isInFormContext && formContext?.errors && name
    ? formContext.errors[name as keyof typeof formContext.errors]
    : undefined;
  const actualErrorMessage =
    (formError as unknown as { message?: string })?.message ||
    errorMessage;
  const actualState = disabled ? "disabled" : (formError ? "error" : state);

  // Calculate percentage and fill position for progress fill
  const percentage = ((value - min) / (max - min)) * 100;

  // Calculate fill for negative ranges (fill from zero)
  const hasNegativeRange = min < 0 && max > 0;
  const zeroPosition = hasNegativeRange ? ((0 - min) / (max - min)) * 100 : 0;

  const fillStyle = hasNegativeRange
    ? value >= 0
      ? { left: `${zeroPosition}%`, width: `${percentage - zeroPosition}%` }
      : {
        right: `${100 - zeroPosition}%`,
        width: `${zeroPosition - percentage}%`,
      }
    : { left: "0%", width: `${percentage}%` };

  const classes = [
    "bfds-range",
    `bfds-range--${size}`,
    `bfds-range--${actualState}`,
    className,
  ].filter(Boolean).join(" ");

  const containerClasses = [
    "bfds-range-container",
    `bfds-range-container--${actualState}`,
    showTicks ? "bfds-range-container--with-ticks" : null,
  ].filter(Boolean).join(" ");

  // Generate tick marks if enabled
  const renderTicks = () => {
    if (!showTicks) return null;

    const ticks = [];
    if (tickLabels && tickLabels.length > 0) {
      // Use custom tick labels
      for (let i = 0; i < tickLabels.length; i++) {
        const tick = tickLabels[i];
        const rawPosition = ((tick.value - min) / (max - min)) * 100;
        const isFirst = i === 0;
        const isLast = i === tickLabels.length - 1;

        // Adjust position to align with handle center at min/max
        // Handle is ~18px wide (medium size), so we need ~9px offset from edges
        const handleRadius = 1; // approximate percentage of handle radius
        const handleOffset = isFirst
          ? handleRadius
          : isLast
          ? -handleRadius
          : 0;
        const position = rawPosition + handleOffset;

        const tickClass = [
          "bfds-range-tick",
          isFirst ? "bfds-range-tick--first" : null,
          isLast ? "bfds-range-tick--last" : null,
        ].filter(Boolean).join(" ");

        ticks.push(
          <div
            key={tick.value}
            className={tickClass}
            style={{ left: `${position}%` }}
          >
            <div className="bfds-range-tick-mark" />
            <div className="bfds-range-tick-label">{tick.label}</div>
          </div>,
        );
      }
    } else {
      // Generate automatic ticks
      const tickCount = 5; // Default to 5 ticks
      const tickStep = (max - min) / (tickCount - 1);
      for (let i = 0; i < tickCount; i++) {
        const tickValue = min + tickStep * i;
        const rawPosition = ((tickValue - min) / (max - min)) * 100;
        const isFirst = i === 0;
        const isLast = i === tickCount - 1;

        // Adjust position to align with handle center at min/max
        // Handle is ~18px wide (medium size), so we need ~9px offset from edges
        const handleRadius = 1; // approximate percentage of handle radius
        const handleOffset = isFirst
          ? handleRadius
          : isLast
          ? -handleRadius
          : 0;
        const position = rawPosition + handleOffset;

        const tickClass = [
          "bfds-range-tick",
          isFirst ? "bfds-range-tick--first" : null,
          isLast ? "bfds-range-tick--last" : null,
        ].filter(Boolean).join(" ");

        ticks.push(
          <div
            key={tickValue}
            className={tickClass}
            style={{ left: `${position}%` }}
          >
            <div className="bfds-range-tick-mark" />
            <div className="bfds-range-tick-label">
              {formatValue(tickValue)}
            </div>
          </div>,
        );
      }
    }
    return <div className="bfds-range-ticks">{ticks}</div>;
  };

  return (
    <div className={containerClasses}>
      <div className="bfds-range-header">
        {label && (
          <label htmlFor={inputId} className="bfds-range-label">
            {label}
            {required && <span className="bfds-range-required">*</span>}
          </label>
        )}
        {showValue && (
          <div className="bfds-range-value">{formatValue(value)}</div>
        )}
      </div>
      <div className="bfds-range-wrapper">
        <div className="bfds-range-track">
          <div
            className="bfds-range-fill"
            style={{
              ...fillStyle,
              ...(color && { backgroundColor: color }),
            }}
          />
        </div>
        <input
          {...props}
          type="range"
          id={inputId}
          name={name}
          className={classes}
          min={min}
          max={max}
          step={step}
          disabled={disabled || actualState === "disabled"}
          required={required}
          value={value}
          onChange={handleChange}
          style={{
            ...(color && {
              "--bfds-range-custom-color": color,
            } as React.CSSProperties),
          }}
          aria-describedby={[
            helpText ? helpTextId : null,
            actualErrorMessage ? errorId : null,
            successMessage ? successId : null,
          ].filter(Boolean).join(" ") || undefined}
          aria-invalid={actualState === "error"}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={value}
          aria-valuetext={formatValue(value)}
        />
        {renderTicks()}
      </div>
      {helpText && (
        <div id={helpTextId} className="bfds-range-help">
          {helpText}
        </div>
      )}
      {actualState === "error" && actualErrorMessage && (
        <div id={errorId} className="bfds-range-error" role="alert">
          {actualErrorMessage}
        </div>
      )}
      {actualState === "success" && successMessage && (
        <div id={successId} className="bfds-range-success">
          {successMessage}
        </div>
      )}
    </div>
  );
}
