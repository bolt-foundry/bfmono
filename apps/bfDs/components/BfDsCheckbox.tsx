/**
 * @fileoverview BfDsCheckbox - Flexible checkbox component with form integration and accessibility features
 * @author Justin Carter <justin@boltfoundry.com>
 * @since 2.0.0
 */
import type * as React from "react";
import { useState } from "react";
import { useBfDsFormContext } from "./BfDsForm.tsx";
import { BfDsIcon } from "./BfDsIcon.tsx";

/**
 * Props for the BfDsCheckbox component.
 */
export type BfDsCheckboxProps = {
  // Form context props
  /** Form field name for data binding */
  name?: string;

  // Standalone props
  /** Whether the checkbox is checked (controlled) */
  checked?: boolean;
  /** Default checked state for uncontrolled usage */
  defaultChecked?: boolean;
  /** Callback when check state changes */
  onChange?: (checked: boolean) => void;

  // Common props
  /** Label text displayed next to checkbox */
  label?: string;
  /** Required for validation */
  required?: boolean;
  /** Disables component */
  disabled?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Element ID */
  id?: string;
};

/**
 * A flexible checkbox component that supports both standalone and form integration
 * modes with proper accessibility features and visual state management.
 *
 * @param name - Form field name for data binding
 * @param checked - Whether the checkbox is checked (controlled)
 * @param defaultChecked - Default checked state for uncontrolled usage
 * @param onChange - Callback when check state changes
 * @param label - Label text displayed next to checkbox
 * @param required - Required for validation
 * @param disabled - Disables component
 * @param className - Additional CSS classes
 * @param id - Element ID
 *
 * @example
 * Simple checkbox:
 * ```tsx
 * <BfDsCheckbox
 *   label="I agree to the terms"
 *   onChange={(checked) => handleChange(checked)}
 * />
 * ```
 *
 * @example
 * Controlled checkbox:
 * ```tsx
 * <BfDsCheckbox
 *   label="Enable notifications"
 *   checked={isEnabled}
 *   onChange={setIsEnabled}
 * />
 * ```
 *
 * @example
 * Uncontrolled checkbox:
 * ```tsx
 * <BfDsCheckbox
 *   label="Uncontrolled checkbox"
 *   defaultChecked={true}
 *   onChange={(checked) => console.log("Changed:", checked)}
 * />
 * ```
 *
 * @example
 * Form integration:
 * ```tsx
 * <BfDsForm initialData={{ terms: false }} onSubmit={handleSubmit}>
 *   <BfDsCheckbox
 *     name="terms"
 *     label="I agree to the terms and conditions"
 *     required
 *   />
 *   <BfDsFormSubmitButton text="Submit" />
 * </BfDsForm>
 * ```
 *
 * @example
 * Settings preferences:
 * ```tsx
 * const [settings, setSettings] = useState({
 *   emailNotifications: true,
 *   pushNotifications: false,
 *   marketingEmails: false,
 * });
 *
 * <div className="settings-panel">
 *   <h3>Notification Preferences</h3>
 *   <BfDsCheckbox
 *     label="Email notifications"
 *     checked={settings.emailNotifications}
 *     onChange={(checked) =>
 *       setSettings((prev) => ({ ...prev, emailNotifications: checked }))}
 *   />
 *   <BfDsCheckbox
 *     label="Push notifications"
 *     checked={settings.pushNotifications}
 *     onChange={(checked) =>
 *       setSettings((prev) => ({ ...prev, pushNotifications: checked }))}
 *   />
 * </div>
 * ```
 *
 * @example
 * Terms and agreements:
 * ```tsx
 * const [agreements, setAgreements] = useState({
 *   terms: false,
 *   privacy: false,
 *   marketing: false,
 * });
 *
 * const canSubmit = agreements.terms && agreements.privacy;
 *
 * <form onSubmit={handleRegistration}>
 *   <BfDsCheckbox
 *     label="I accept the Terms of Service"
 *     checked={agreements.terms}
 *     onChange={(checked) =>
 *       setAgreements((prev) => ({ ...prev, terms: checked }))}
 *     required
 *   />
 *   <BfDsCheckbox
 *     label="I accept the Privacy Policy"
 *     checked={agreements.privacy}
 *     onChange={(checked) =>
 *       setAgreements((prev) => ({ ...prev, privacy: checked }))}
 *     required
 *   />
 *   <BfDsCheckbox
 *     label="I agree to receive marketing communications (optional)"
 *     checked={agreements.marketing}
 *     onChange={(checked) =>
 *       setAgreements((prev) => ({ ...prev, marketing: checked }))}
 *   />
 *   <BfDsButton type="submit" disabled={!canSubmit} variant="primary">
 *     Register Account
 *   </BfDsButton>
 * </form>
 * ```
 *
 * @example
 * Feature toggles:
 * ```tsx
 * const [features, setFeatures] = useState({
 *   darkMode: false,
 *   betaFeatures: false,
 *   analytics: true,
 *   autoSave: true,
 * });
 *
 * <div className="feature-toggles">
 *   <h3>Feature Settings</h3>
 *   <BfDsCheckbox
 *     label="Dark mode"
 *     checked={features.darkMode}
 *     onChange={(checked) => {
 *       setFeatures((prev) => ({ ...prev, darkMode: checked }));
 *       document.body.classList.toggle("dark-mode", checked);
 *     }}
 *   />
 *   <BfDsCheckbox
 *     label="Beta features (experimental)"
 *     checked={features.betaFeatures}
 *     onChange={(checked) =>
 *       setFeatures((prev) => ({ ...prev, betaFeatures: checked }))}
 *   />
 * </div>
 * ```
 *
 * @example
 * Various states:
 * ```tsx
 * // Default states
 * <BfDsCheckbox label="Unchecked" />
 * <BfDsCheckbox label="Checked" defaultChecked />
 *
 * // Disabled states
 * <BfDsCheckbox label="Disabled unchecked" disabled />
 * <BfDsCheckbox label="Disabled checked" defaultChecked disabled />
 *
 * // Required field
 * <BfDsCheckbox label="Required field" required />
 * ```
 *
 * ## Control Modes
 *
 * **Controlled Mode**: When you provide a `checked` prop, the component operates in controlled mode.
 * You must handle state updates via the `onChange` callback.
 *
 * **Uncontrolled Mode**: Without a `checked` prop, the component manages its own internal state.
 * Use `defaultChecked` to set the initial state.
 *
 * **Form Integration**: When used within `BfDsForm` with a `name` prop, the component automatically
 * integrates with form state management.
 *
 * ## Accessibility Features
 * - **Semantic HTML**: Uses proper `input[type="checkbox"]` with label association
 * - **Keyboard Navigation**: Full support for Tab, Space, and Enter keys
 * - **Screen Reader Support**: Proper ARIA attributes and roles
 * - **Focus Indicators**: Clear visual focus states
 * - **Required Field Marking**: Visual and semantic indication of required fields
 *
 * ## Best Practices
 * - Always provide descriptive labels that clearly explain what checking the box means
 * - Use `required` prop for fields that must be checked before form submission
 * - Group related checkboxes using fieldsets when appropriate
 * - Ensure sufficient color contrast for all visual states
 * - Test keyboard navigation thoroughly
 *
 * ## Form Context Integration
 * BfDsCheckbox seamlessly integrates with the BfDs form system:
 * 1. **Automatic state management**: When used with `name` prop inside `BfDsForm`
 * 2. **Validation support**: Works with form validation rules
 * 3. **Data binding**: Automatically updates form data object
 * 4. **Error handling**: Integrates with form-level error messaging
 *
 * ## Styling Classes
 * - `.bfds-checkbox-wrapper`: Container element
 * - `.bfds-checkbox`: Visual checkbox element
 * - `.bfds-checkbox--checked`: Checked state modifier
 * - `.bfds-checkbox--disabled`: Disabled state modifier
 * - `.bfds-checkbox-input`: Hidden native input element
 * - `.bfds-checkbox-label`: Label text element
 * - `.bfds-checkbox-required`: Required asterisk element
 * - `.bfds-checkbox-icon`: Check mark icon element
 */
export function BfDsCheckbox({
  name,
  checked,
  defaultChecked,
  onChange,
  label,
  disabled = false,
  required = false,
  className,
  id,
}: BfDsCheckboxProps) {
  const formContext = useBfDsFormContext();
  const isInForm = !!formContext;

  // Internal state for uncontrolled mode
  const [internalChecked, setInternalChecked] = useState(
    defaultChecked ?? false,
  );

  // Determine control mode
  const isControlled = checked !== undefined;

  // Get actual checked state from form context, controlled prop, or internal state
  const actualChecked = isInForm
    ? (formContext.data as Record<string, unknown>)?.[name || ""] === true
    : isControlled
    ? checked
    : internalChecked;

  const actualOnChange = isInForm
    ? (newChecked: boolean) => {
      if (name && formContext.onChange && formContext.data) {
        formContext.onChange({
          ...(formContext.data as Record<string, unknown>),
          [name]: newChecked,
        });
      }
    }
    : (newChecked: boolean) => {
      onChange?.(newChecked);
      if (!isControlled) {
        // Update internal state for uncontrolled mode
        setInternalChecked(newChecked);
      }
    };

  const checkboxClasses = [
    "bfds-checkbox",
    actualChecked && "bfds-checkbox--checked",
    disabled && "bfds-checkbox--disabled",
    className,
  ].filter(Boolean).join(" ");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (actualOnChange) {
      actualOnChange(e.target.checked);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (actualOnChange && !disabled) {
        actualOnChange(!actualChecked);
      }
    }
  };

  return (
    <label className="bfds-checkbox-wrapper">
      <input
        type="checkbox"
        id={id}
        name={name}
        checked={actualChecked}
        onChange={handleChange}
        disabled={disabled}
        required={required}
        className="bfds-checkbox-input"
      />
      <div
        className={checkboxClasses}
        role="checkbox"
        aria-checked={actualChecked}
        tabIndex={disabled ? -1 : 0}
        onKeyDown={handleKeyDown}
      >
        <BfDsIcon
          name="check"
          size="small"
          className={`bfds-checkbox-icon ${
            actualChecked ? "" : "bfds-checkbox-icon--hidden"
          }`}
        />
      </div>
      {label && (
        <span className="bfds-checkbox-label">
          {label}
          {required && <span className="bfds-checkbox-required">*</span>}
        </span>
      )}
    </label>
  );
}
