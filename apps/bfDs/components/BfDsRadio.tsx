/**
 * @fileoverview BfDsRadio - Radio button group component with form integration and option management
 * @author Justin Carter <justin@boltfoundry.com>
 * @since 2.0.0
 */
import type * as React from "react";
import { useState } from "react";
import { useBfDsFormContext } from "./BfDsForm.tsx";

/**
 * Configuration object for a single radio button option.
 */
export type BfDsRadioOption = {
  /** The value submitted when this option is selected */
  value: string;
  /** Display text shown for this option */
  label: string;
  /** When true, this option cannot be selected */
  disabled?: boolean;
};

/**
 * Size variants for radio buttons.
 */
export type BfDsRadioSize = "small" | "medium" | "large";

/**
 * Props for the BfDsRadio component.
 */
export type BfDsRadioProps = {
  // Form context props
  /** Form field name for data binding (required for radio groups) */
  name: string;

  // Standalone props
  /** Currently selected value (controlled) */
  value?: string;
  /** Default selected value for uncontrolled usage */
  defaultValue?: string;
  /** Selection change callback */
  onChange?: (value: string) => void;

  // Common props
  /** Array of radio button options */
  options: Array<BfDsRadioOption>;
  /** Group label displayed above radio buttons */
  label?: string;
  /** Required for validation */
  required?: boolean;
  /** Disables entire radio group */
  disabled?: boolean;
  /** Layout direction of radio buttons */
  orientation?: "vertical" | "horizontal";
  /** Size variant for radio buttons */
  size?: BfDsRadioSize;
  /** Additional CSS classes */
  className?: string;
};

/**
 * A radio button group component for single-choice selections. Features flexible
 * layout orientations, size variants, and seamless form integration. Radio groups
 * ensure only one option can be selected at a time within the same named group.
 *
 * @param name - Form field name for data binding (required for radio groups)
 * @param value - Currently selected value (controlled)
 * @param defaultValue - Default selected value for uncontrolled usage
 * @param onChange - Selection change callback
 * @param options - Array of radio button options
 * @param label - Group label displayed above radio buttons
 * @param required - Required for validation
 * @param disabled - Disables entire radio group
 * @param orientation - Layout direction of radio buttons ("vertical" | "horizontal")
 * @param size - Size variant for radio buttons ("small" | "medium" | "large")
 * @param className - Additional CSS classes
 *
 * @example
 * Basic usage:
 * ```tsx
 * const sizeOptions: BfDsRadioOption[] = [
 *   { value: "small", label: "Small" },
 *   { value: "medium", label: "Medium" },
 *   { value: "large", label: "Large" },
 * ];
 *
 * <BfDsRadio
 *   name="size"
 *   options={sizeOptions}
 *   value={selectedSize}
 *   onChange={setSelectedSize}
 * />
 * ```
 *
 * @example
 * With label and required validation:
 * ```tsx
 * <BfDsRadio
 *   name="priority"
 *   label="Priority Level"
 *   options={priorityOptions}
 *   value={selectedPriority}
 *   onChange={setSelectedPriority}
 *   required
 * />
 * ```
 *
 * @example
 * Controlled component:
 * ```tsx
 * const [selectedValue, setSelectedValue] = useState("");
 *
 * <BfDsRadio
 *   name="theme"
 *   label="Theme Preference"
 *   options={[
 *     { value: "light", label: "Light Theme" },
 *     { value: "dark", label: "Dark Theme" },
 *     { value: "auto", label: "Auto (System)" },
 *   ]}
 *   value={selectedValue}
 *   onChange={setSelectedValue}
 * />
 * ```
 *
 * @example
 * Uncontrolled component:
 * ```tsx
 * <BfDsRadio
 *   name="notification"
 *   label="Email Notifications"
 *   options={[
 *     { value: "all", label: "All Notifications" },
 *     { value: "important", label: "Important Only" },
 *     { value: "none", label: "None" },
 *   ]}
 *   defaultValue="important"
 * />
 * ```
 *
 * @example
 * Form integration:
 * ```tsx
 * <BfDsForm
 *   initialData={{ size: "", priority: "", theme: "" }}
 *   onSubmit={handleSubmit}
 * >
 *   <BfDsRadio
 *     name="size"
 *     label="Size"
 *     options={sizeOptions}
 *     required
 *   />
 *   <BfDsRadio
 *     name="priority"
 *     label="Priority"
 *     options={priorityOptions}
 *     orientation="horizontal"
 *   />
 *   <BfDsFormSubmitButton text="Submit" />
 * </BfDsForm>
 * ```
 *
 * @example
 * Vertical layout (default):
 * ```tsx
 * <BfDsRadio
 *   name="vertical-example"
 *   label="Vertical Layout"
 *   options={[
 *     { value: "option1", label: "First Option" },
 *     { value: "option2", label: "Second Option" },
 *     { value: "option3", label: "Third Option" },
 *   ]}
 *   orientation="vertical"
 * />
 * ```
 *
 * @example
 * Horizontal layout:
 * ```tsx
 * <BfDsRadio
 *   name="horizontal-example"
 *   label="Horizontal Layout"
 *   options={[
 *     { value: "yes", label: "Yes" },
 *     { value: "no", label: "No" },
 *     { value: "maybe", label: "Maybe" },
 *   ]}
 *   orientation="horizontal"
 * />
 * ```
 *
 * @example
 * Size variants:
 * ```tsx
 * <BfDsRadio name="small-radio" options={options} size="small" />
 * <BfDsRadio name="medium-radio" options={options} size="medium" />
 * <BfDsRadio name="large-radio" options={options} size="large" />
 * ```
 *
 * @example
 * Yes/No question:
 * ```tsx
 * <BfDsRadio
 *   name="agreement"
 *   label="Do you agree to the terms?"
 *   options={[
 *     { value: "yes", label: "Yes, I agree" },
 *     { value: "no", label: "No, I disagree" },
 *   ]}
 *   orientation="horizontal"
 *   required
 * />
 * ```
 *
 * @example
 * Priority selection:
 * ```tsx
 * const priorityOptions = [
 *   { value: "low", label: "Low Priority" },
 *   { value: "medium", label: "Medium Priority" },
 *   { value: "high", label: "High Priority" },
 *   { value: "urgent", label: "Urgent" },
 * ];
 *
 * <BfDsRadio
 *   name="task-priority"
 *   label="Task Priority"
 *   options={priorityOptions}
 *   defaultValue="medium"
 * />
 * ```
 *
 * @example
 * Payment method selection:
 * ```tsx
 * const paymentOptions = [
 *   { value: "credit", label: "Credit Card" },
 *   { value: "debit", label: "Debit Card" },
 *   { value: "paypal", label: "PayPal" },
 *   { value: "bank", label: "Bank Transfer" },
 * ];
 *
 * <BfDsRadio
 *   name="payment-method"
 *   label="Payment Method"
 *   options={paymentOptions}
 *   required
 * />
 * ```
 *
 * @example
 * Disabled states:
 * ```tsx
 * // Disable entire group
 * <BfDsRadio
 *   name="disabled-group"
 *   label="Disabled Group"
 *   options={options}
 *   disabled
 * />
 *
 * // Disable individual options
 * const mixedOptions: BfDsRadioOption[] = [
 *   { value: "available", label: "Available" },
 *   { value: "limited", label: "Limited Access" },
 *   { value: "unavailable", label: "Unavailable", disabled: true },
 *   { value: "coming", label: "Coming Soon", disabled: true },
 * ];
 *
 * <BfDsRadio
 *   name="access-level"
 *   label="Access Level"
 *   options={mixedOptions}
 * />
 * ```
 *
 * @example
 * Conditional options:
 * ```tsx
 * const [userType, setUserType] = useState("");
 * const [roleOptions, setRoleOptions] = useState<BfDsRadioOption[]>([]);
 *
 * useEffect(() => {
 *   if (userType === "admin") {
 *     setRoleOptions([
 *       { value: "super", label: "Super Administrator" },
 *       { value: "admin", label: "Administrator" },
 *       { value: "moderator", label: "Moderator" },
 *     ]);
 *   } else if (userType === "user") {
 *     setRoleOptions([
 *       { value: "member", label: "Member" },
 *       { value: "contributor", label: "Contributor" },
 *     ]);
 *   }
 * }, [userType]);
 *
 * <div>
 *   <BfDsRadio
 *     name="user-type"
 *     label="User Type"
 *     options={[
 *       { value: "admin", label: "Administrator" },
 *       { value: "user", label: "Regular User" },
 *     ]}
 *     value={userType}
 *     onChange={setUserType}
 *   />
 *   {userType && (
 *     <BfDsRadio
 *       name="role"
 *       label="Role"
 *       options={roleOptions}
 *     />
 *   )}
 * </div>
 * ```
 *
 * @example
 * Survey question:
 * ```tsx
 * const satisfactionOptions = [
 *   { value: "very-satisfied", label: "Very Satisfied" },
 *   { value: "satisfied", label: "Satisfied" },
 *   { value: "neutral", label: "Neutral" },
 *   { value: "dissatisfied", label: "Dissatisfied" },
 *   { value: "very-dissatisfied", label: "Very Dissatisfied" },
 * ];
 *
 * <BfDsRadio
 *   name="satisfaction"
 *   label="How satisfied are you with our service?"
 *   options={satisfactionOptions}
 *   orientation="vertical"
 *   required
 * />
 * ```
 *
 * ## Control Modes
 *
 * **Controlled Component**: Use when you need to manage the selection state in your component.
 * Provide both `value` and `onChange` props.
 *
 * **Uncontrolled Component**: Use when you want the component to manage its own state.
 * Use `defaultValue` to set initial selection.
 *
 * **Form Integration**: When used within `BfDsForm` with a `name` prop, automatically
 * integrates with form state management.
 *
 * ## Layout Orientations
 *
 * **Vertical Layout (Default)**: Radio buttons are stacked vertically. Best for longer
 * option lists or when space allows.
 *
 * **Horizontal Layout**: Radio buttons are arranged horizontally. Best for short option
 * lists (2-4 options) and binary choices.
 *
 * ## Accessibility Features
 * - **Semantic HTML**: Uses fieldset, legend, and proper radio input elements
 * - **ARIA Attributes**: Includes `role="radiogroup"` and `aria-checked`
 * - **Screen Reader Support**: Proper labeling and group identification
 * - **Keyboard Navigation**: Arrow keys navigate within the group, Tab moves between groups
 * - **Focus Management**: Clear visual focus indicators
 * - **Required Field Indicators**: Visual and semantic marking
 *
 * ## Keyboard Navigation
 * - **Tab**: Move to/from the radio group
 * - **Arrow Up/Down**: Navigate between options in vertical layout
 * - **Arrow Left/Right**: Navigate between options in horizontal layout
 * - **Space**: Select the focused option
 *
 * ## Best Practices
 * - Always provide a group label for screen readers
 * - Use descriptive option labels that clearly indicate the choice
 * - Group related options together with meaningful names
 * - Consider horizontal layout for binary choices (Yes/No)
 * - Test keyboard navigation in both orientations
 * - Ensure sufficient color contrast for all states
 *
 * ## Styling Classes
 * - `.bfds-radio-fieldset`: Fieldset wrapper (when label is provided)
 * - `.bfds-radio-group`: Radio group container
 * - `.bfds-radio-group--vertical`: Vertical layout (default)
 * - `.bfds-radio-group--horizontal`: Horizontal layout
 * - `.bfds-radio-group--{size}`: Size-specific styling
 * - `.bfds-radio-group--disabled`: Disabled group styling
 * - `.bfds-radio-wrapper`: Individual radio option wrapper
 * - `.bfds-radio`: Radio button visual element
 * - `.bfds-radio--checked`: Selected radio button
 * - `.bfds-radio--disabled`: Disabled radio button
 * - `.bfds-radio-input`: Actual input element (visually hidden)
 * - `.bfds-radio-label`: Option label text
 * - `.bfds-radio-dot`: Selected state indicator
 */
export function BfDsRadio({
  name,
  value,
  defaultValue,
  onChange,
  options,
  disabled = false,
  required = false,
  className,
  orientation = "vertical",
  size = "medium",
  label,
}: BfDsRadioProps) {
  const formContext = useBfDsFormContext();
  const isInForm = !!formContext;

  // Internal state for uncontrolled mode
  const [internalValue, setInternalValue] = useState(defaultValue ?? "");

  // Determine control mode
  const isControlled = value !== undefined;

  // Get actual value from form context, controlled prop, or internal state
  const actualValue = isInForm
    ? (formContext.data as Record<string, unknown>)?.[name] as string || ""
    : isControlled
    ? value
    : internalValue;

  const actualOnChange = isInForm
    ? (newValue: string) => {
      if (formContext.onChange && formContext.data) {
        formContext.onChange({
          ...(formContext.data as Record<string, unknown>),
          [name]: newValue,
        });
      }
    }
    : (newValue: string) => {
      onChange?.(newValue);
      if (!isControlled) {
        // Update internal state for uncontrolled mode
        setInternalValue(newValue);
      }
    };

  const radioGroupClasses = [
    "bfds-radio-group",
    `bfds-radio-group--${orientation}`,
    `bfds-radio-group--${size}`,
    disabled && "bfds-radio-group--disabled",
    className,
  ].filter(Boolean).join(" ");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (actualOnChange) {
      actualOnChange(e.target.value);
    }
  };

  const radioGroupContent = (
    <div className={radioGroupClasses} role="radiogroup">
      {options.map((option, index) => {
        const isChecked = actualValue === option.value;
        const isDisabled = disabled || option.disabled;
        const radioId = `${name}-${option.value}`;

        const radioClasses = [
          "bfds-radio",
          `bfds-radio--${size}`,
          isChecked && "bfds-radio--checked",
          isDisabled && "bfds-radio--disabled",
        ].filter(Boolean).join(" ");

        return (
          <label key={option.value} className="bfds-radio-wrapper">
            <input
              type="radio"
              id={radioId}
              name={name}
              value={option.value}
              checked={isChecked}
              onChange={handleChange}
              disabled={isDisabled}
              required={required && index === 0} // Only first radio needs required for validation
              className="bfds-radio-input"
            />
            <div
              className={radioClasses}
              role="radio"
              aria-checked={isChecked}
            >
              {isChecked && <div className="bfds-radio-dot" />}
            </div>
            <span className="bfds-radio-label">
              {option.label}
            </span>
          </label>
        );
      })}
    </div>
  );

  if (label) {
    return (
      <fieldset className="bfds-radio-fieldset">
        <legend className="bfds-input-label">
          {label}
          {required && <span className="bfds-input-required">*</span>}
        </legend>
        {radioGroupContent}
      </fieldset>
    );
  }

  return radioGroupContent;
}
