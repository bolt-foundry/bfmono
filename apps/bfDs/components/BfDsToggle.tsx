/**
 * @fileoverview BfDsToggle - Toggle switch component with form integration and customizable styling
 * @author Justin Carter <justin@boltfoundry.com>
 * @since 2.0.0
 */
import type * as React from "react";
import { useState } from "react";
import { useBfDsFormContext } from "./BfDsForm.tsx";

/**
 * Size variants for the BfDsToggle component
 */
export type BfDsToggleSize = "small" | "medium" | "large";

/**
 * Props for the BfDsToggle component
 */
export type BfDsToggleProps = {
  // Form context props
  /** Form field name for data binding */
  name?: string;

  // Standalone props
  /** Whether the toggle is on/off (controlled) */
  checked?: boolean;
  /** Default checked state for uncontrolled usage */
  defaultChecked?: boolean;
  /** Callback when toggle state changes */
  onChange?: (checked: boolean) => void;

  // Common props
  /** Label text displayed next to toggle */
  label?: string;
  /** Disables component */
  disabled?: boolean;
  /** Size variant for toggle switch */
  size?: BfDsToggleSize;
  /** Additional CSS classes */
  className?: string;
  /** Element ID */
  id?: string;
};

/**
 * A toggle switch component for binary on/off selections
 *
 * BfDsToggle provides a modern switch-like interface for boolean states, serving as
 * an alternative to checkboxes. It features multiple size variants, form integration,
 * and comprehensive keyboard accessibility.
 *
 * Features:
 * - Three size variants (small, medium, large)
 * - Seamless form integration with BfDsForm
 * - Both controlled and uncontrolled usage patterns
 * - Full keyboard accessibility with Space/Enter support
 * - Proper ARIA attributes for screen readers
 * - Smooth visual transitions
 *
 * @param props - Component props
 * @param props.name - Form field name for data binding when used within BfDsForm
 * @param props.checked - Whether the toggle is on/off (controlled mode)
 * @param props.defaultChecked - Default checked state for uncontrolled usage
 * @param props.onChange - Callback fired when toggle state changes
 * @param props.label - Label text displayed next to toggle
 * @param props.disabled - Whether the component is disabled
 * @param props.className - Additional CSS classes to apply
 * @param props.id - Element ID for the toggle input
 * @param props.size - Size variant (small, medium, large)
 *
 * @example
 * Basic usage:
 * ```tsx
 * <BfDsToggle
 *   label="Enable notifications"
 *   checked={isEnabled}
 *   onChange={setIsEnabled}
 * />
 * ```
 *
 * @example
 * With form integration:
 * ```tsx
 * <BfDsForm initialData={settings} onChange={setSettings}>
 *   <BfDsToggle
 *     name="darkMode"
 *     label="Dark Mode"
 *   />
 *   <BfDsToggle
 *     name="notifications"
 *     label="Enable Notifications"
 *   />
 * </BfDsForm>
 * ```
 *
 * @example
 * Different sizes:
 * ```tsx
 * <BfDsToggle label="Small" size="small" defaultChecked />
 * <BfDsToggle label="Medium" size="medium" defaultChecked />
 * <BfDsToggle label="Large" size="large" defaultChecked />
 * ```
 *
 * @example
 * Settings panel:
 * ```tsx
 * <div className="settings-panel">
 *   <BfDsToggle
 *     label="Email Notifications"
 *     checked={settings.emailNotifications}
 *     onChange={(checked) =>
 *       setSettings({...settings, emailNotifications: checked})
 *     }
 *   />
 *   <BfDsToggle
 *     label="Push Notifications"
 *     defaultChecked={false}
 *   />
 * </div>
 * ```
 *
 * @returns A toggle switch component for binary selections
 */
export function BfDsToggle({
  name,
  checked,
  defaultChecked,
  onChange,
  label,
  disabled = false,
  className,
  id,
  size = "medium",
}: BfDsToggleProps) {
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

  const toggleClasses = [
    "bfds-toggle",
    `bfds-toggle--${size}`,
    actualChecked && "bfds-toggle--checked",
    disabled && "bfds-toggle--disabled",
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
    <label className="bfds-toggle-wrapper">
      <input
        type="checkbox"
        id={id}
        name={name}
        checked={actualChecked}
        onChange={handleChange}
        disabled={disabled}
        className="bfds-toggle-input"
      />
      <div
        className={toggleClasses}
        role="switch"
        aria-checked={actualChecked}
        tabIndex={disabled ? -1 : 0}
        onKeyDown={handleKeyDown}
      >
        <div className="bfds-toggle-track">
          <div className="bfds-toggle-thumb" />
        </div>
      </div>
      {label && (
        <span className="bfds-toggle-label">
          {label}
        </span>
      )}
    </label>
  );
}
