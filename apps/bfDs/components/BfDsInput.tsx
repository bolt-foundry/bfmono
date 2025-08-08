/**
 * @fileoverview BfDsInput - Comprehensive text input component with form integration and validation states
 * @author Justin Carter <justin@boltfoundry.com>
 * @since 2.0.0
 */
import type * as React from "react";
import { useId, useState } from "react";
import { useBfDsFormContext } from "./BfDsForm.tsx";

/**
 * Visual state options for the BfDsInput component.
 */
export type BfDsInputState = "default" | "error" | "success" | "disabled";

/**
 * Props for the BfDsInput component.
 *
 * @typedef {Object} BfDsInputProps
 * @property {string} [name] - Form field name for data binding when used within BfDsForm
 * @property {string} [value] - Current input value (controlled mode)
 * @property {string} [defaultValue] - Default value for uncontrolled usage
 * @property {function} [onChange] - Change event handler
 * @property {string} [label] - Label text displayed above input
 * @property {string} [placeholder] - Placeholder text when empty
 * @property {boolean} [required] - Required for validation
 * @property {BfDsInputState} [state] - Visual state of the input
 * @property {string} [errorMessage] - Error message to display
 * @property {string} [successMessage] - Success message to display
 * @property {string} [helpText] - Help text displayed below input
 * @property {string} [className] - Additional CSS classes
 */
export type BfDsInputProps = {
  // Form context props
  /** Form field name for data binding */
  name?: string;

  // Standalone props
  /** Current input value (controlled) */
  value?: string;
  /** Default value for uncontrolled usage */
  defaultValue?: string;
  /** Change event handler */
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;

  // Common props
  /** Label text displayed above input */
  label?: string;
  /** Placeholder text when empty */
  placeholder?: string;
  /** Required for validation */
  required?: boolean;
  /** Visual state of the input */
  state?: BfDsInputState;
  /** Error message to display */
  errorMessage?: string;
  /** Success message to display */
  successMessage?: string;
  /** Help text displayed below input */
  helpText?: string;
  /** Additional CSS classes */
  className?: string;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange">;

/**
 * A comprehensive text input component that supports both standalone and form integration modes
 * with validation states, help text, and full accessibility features.
 *
 * The component operates in three distinct modes:
 * - **Controlled Mode**: When you provide a `value` prop, you control the input state
 * - **Uncontrolled Mode**: Without a `value` prop, the component manages its own state
 * - **Form Integration**: When used within `BfDsForm` with a `name` prop, automatically integrates with form state
 *
 * @component
 * @param {BfDsInputProps} props - The component props
 * @returns {React.ReactElement} The rendered input component
 *
 * @example
 * // Simple controlled input
 * <BfDsInput
 *   label="Name"
 *   value={name}
 *   onChange={(e) => setName(e.target.value)}
 *   placeholder="Enter your name"
 * />
 *
 * @example
 * // Uncontrolled input with default value
 * <BfDsInput
 *   label="Description"
 *   defaultValue="Initial content"
 *   onChange={(e) => console.log("Changed:", e.target.value)}
 *   placeholder="Enter description"
 * />
 *
 * @example
 * // Form integration with validation
 * <BfDsForm initialData={{ username: "", email: "" }} onSubmit={handleSubmit}>
 *   <BfDsInput
 *     name="username"
 *     label="Username"
 *     placeholder="Choose a username"
 *     required
 *   />
 *   <BfDsInput
 *     name="email"
 *     label="Email Address"
 *     type="email"
 *     placeholder="your@email.com"
 *     required
 *   />
 * </BfDsForm>
 *
 * @example
 * // Error state with custom message
 * <BfDsInput
 *   label="Email Address"
 *   value="invalid-email"
 *   state="error"
 *   errorMessage="Please enter a valid email address"
 *   placeholder="your@email.com"
 * />
 *
 * @example
 * // Success state with confirmation
 * <BfDsInput
 *   label="Username"
 *   value="validuser123"
 *   state="success"
 *   successMessage="Username is available!"
 *   placeholder="Choose a username"
 * />
 *
 * @example
 * // Different input types
 * <BfDsInput label="Email" type="email" />
 * <BfDsInput label="Phone" type="tel" />
 * <BfDsInput label="Age" type="number" min="1" max="120" />
 * <BfDsInput label="Birth Date" type="date" />
 * <BfDsInput label="Password" type="password" />
 *
 * @example
 * // With help text and validation
 * <BfDsInput
 *   label="Password"
 *   type="password"
 *   helpText="Must be at least 8 characters with uppercase, lowercase, and numbers"
 *   placeholder="Enter secure password"
 *   required
 * />
 *
 * @example
 * // Custom validation with state management
 * const [email, setEmail] = useState("");
 * const [emailState, setEmailState] = useState("default");
 * const [emailMessage, setEmailMessage] = useState("");
 *
 * const validateEmail = (value) => {
 *   if (!value) {
 *     setEmailState("error");
 *     setEmailMessage("Email is required");
 *   } else if (!value.includes("@")) {
 *     setEmailState("error");
 *     setEmailMessage("Please enter a valid email");
 *   } else {
 *     setEmailState("success");
 *     setEmailMessage("Email looks good!");
 *   }
 * };
 *
 * <BfDsInput
 *   label="Email Address"
 *   value={email}
 *   onChange={(e) => {
 *     setEmail(e.target.value);
 *     validateEmail(e.target.value);
 *   }}
 *   state={emailState}
 *   errorMessage={emailState === "error" ? emailMessage : undefined}
 *   successMessage={emailState === "success" ? emailMessage : undefined}
 *   type="email"
 * />
 *
 * @accessibility
 * - Uses semantic HTML with proper label association
 * - Includes ARIA attributes: aria-describedby, aria-invalid, role="alert" for errors
 * - Full keyboard navigation support for all input types
 * - Screen reader support with proper announcement of labels, help text, and error messages
 * - Clear visual focus indicators and required field marking
 *
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input} for input types
 */
export function BfDsInput({
  name,
  value: standaloneProp,
  defaultValue,
  onChange: standaloneOnChange,
  label,
  placeholder,
  required = false,
  state = "default",
  errorMessage,
  successMessage,
  helpText,
  className,
  disabled,
  id,
  ...props
}: BfDsInputProps) {
  const formContext = useBfDsFormContext();
  const inputId = id || useId();
  const helpTextId = `${inputId}-help`;
  const errorId = `${inputId}-error`;
  const successId = `${inputId}-success`;

  // Internal state for uncontrolled mode
  const [internalValue, setInternalValue] = useState(defaultValue ?? "");

  // Determine if we're in form context or standalone mode
  const isInFormContext = formContext !== null && name !== undefined;
  const isControlled = standaloneProp !== undefined;

  // Get value from form context, controlled prop, or internal state
  const value = isInFormContext && formContext?.data && name
    ? (formContext.data[name as keyof typeof formContext.data] as string) ?? ""
    : isControlled
    ? standaloneProp
    : internalValue;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isInFormContext && formContext?.onChange && formContext?.data && name) {
      formContext.onChange({ ...formContext.data, [name]: e.target.value });
    } else if (standaloneOnChange) {
      standaloneOnChange(e);
    } else if (!isControlled) {
      // Update internal state for uncontrolled mode
      setInternalValue(e.target.value);
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

  const classes = [
    "bfds-input",
    `bfds-input--${actualState}`,
    className,
  ].filter(Boolean).join(" ");

  const containerClasses = [
    "bfds-input-container",
    `bfds-input-container--${actualState}`,
  ].filter(Boolean).join(" ");

  return (
    <div className={containerClasses}>
      {label && (
        <label htmlFor={inputId} className="bfds-input-label">
          {label}
          {required && <span className="bfds-input-required">*</span>}
        </label>
      )}
      <input
        {...props}
        id={inputId}
        name={name}
        className={classes}
        placeholder={placeholder}
        disabled={disabled || actualState === "disabled"}
        required={required}
        value={value}
        onChange={handleChange}
        aria-describedby={[
          helpText ? helpTextId : null,
          actualErrorMessage ? errorId : null,
          successMessage ? successId : null,
        ].filter(Boolean).join(" ") || undefined}
        aria-invalid={actualState === "error"}
      />
      {helpText && (
        <div id={helpTextId} className="bfds-input-help">
          {helpText}
        </div>
      )}
      {actualState === "error" && actualErrorMessage && (
        <div id={errorId} className="bfds-input-error" role="alert">
          {actualErrorMessage}
        </div>
      )}
      {actualState === "success" && successMessage && (
        <div id={successId} className="bfds-input-success">
          {successMessage}
        </div>
      )}
    </div>
  );
}
