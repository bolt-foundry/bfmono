/**
 * @fileoverview BfDsTextArea - Multi-line text input component with flexible resize and form integration
 * @author Justin Carter <justin@boltfoundry.com>
 * @since 2.0.0
 */
import type * as React from "react";
import { forwardRef, useId, useState } from "react";
import { useBfDsFormContext } from "./BfDsForm.tsx";

/**
 * Visual states for the BfDsTextArea component
 */
export type BfDsTextAreaState = "default" | "error" | "success" | "disabled";

/**
 * Props for the BfDsTextArea component
 */
export type BfDsTextAreaProps =
  & {
    // Form context props
    /** Form field name for data binding */
    name?: string;

    // Standalone props
    /** Current textarea value (controlled) */
    value?: string;
    /** Default value for uncontrolled usage */
    defaultValue?: string;
    /** Change event handler */
    onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;

    // Common props
    /** Label text displayed above textarea */
    label?: string;
    /** Placeholder text when empty */
    placeholder?: string;
    /** Required for validation */
    required?: boolean;
    /** Visual state of the textarea */
    state?: BfDsTextAreaState;
    /** Error message to display */
    errorMessage?: string;
    /** Success message to display */
    successMessage?: string;
    /** Help text displayed below textarea */
    helpText?: string;
    /** Additional CSS classes */
    className?: string;
    /** Resize behavior for textarea */
    resize?: "none" | "both" | "horizontal" | "vertical";
  }
  & Omit<
    React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    "value" | "onChange"
  >;

/**
 * A multi-line text input component with flexible resize behavior and comprehensive form integration
 *
 * BfDsTextArea provides a robust multi-line text input experience with validation states,
 * form integration, and customizable resize behavior. It supports both controlled and
 * uncontrolled usage patterns with comprehensive accessibility features.
 *
 * Features:
 * - Multiple visual states (default, error, success, disabled)
 * - Flexible resize behavior (none, vertical, horizontal, both)
 * - Seamless form integration with BfDsForm
 * - Both controlled and uncontrolled usage patterns
 * - Accessibility features with proper ARIA attributes
 * - Character counting and validation support
 *
 * @param props - Component props
 * @param props.name - Form field name for data binding when used within BfDsForm
 * @param props.value - Current textarea value (controlled mode)
 * @param props.defaultValue - Default value for uncontrolled usage
 * @param props.onChange - Change event handler
 * @param props.label - Label text displayed above textarea
 * @param props.placeholder - Placeholder text when empty
 * @param props.required - Whether input is required for form validation
 * @param props.state - Visual state (default, error, success, disabled)
 * @param props.errorMessage - Error message to display in error state
 * @param props.successMessage - Success message to display in success state
 * @param props.helpText - Help text displayed below textarea
 * @param props.className - Additional CSS classes to apply
 * @param props.disabled - Whether the textarea is disabled
 * @param props.id - Element ID for the textarea
 * @param props.resize - Resize behavior (none, vertical, horizontal, both)
 * @param ref - Forwarded ref to the textarea element
 *
 * @example
 * Basic usage:
 * ```tsx
 * <BfDsTextArea
 *   label="Message"
 *   placeholder="Enter your message..."
 *   value={message}
 *   onChange={(e) => setMessage(e.target.value)}
 * />
 * ```
 *
 * @example
 * With form integration:
 * ```tsx
 * <BfDsForm initialData={formData} onChange={setFormData}>
 *   <BfDsTextArea
 *     name="description"
 *     label="Project Description"
 *     placeholder="Describe your project..."
 *     required
 *     rows={4}
 *   />
 * </BfDsForm>
 * ```
 *
 * @example
 * With validation and character counting:
 * ```tsx
 * const [content, setContent] = useState("");
 * const maxLength = 500;
 * const isValid = content.length >= 10 && content.length <= maxLength;
 *
 * <BfDsTextArea
 *   label="Article Content"
 *   value={content}
 *   onChange={(e) => setContent(e.target.value)}
 *   maxLength={maxLength}
 *   state={content.length > 0 && !isValid ? "error" : "default"}
 *   errorMessage={`Content must be 10-${maxLength} characters`}
 *   helpText={`${content.length}/${maxLength} characters`}
 *   rows={5}
 * />
 * ```
 *
 * @example
 * With custom resize behavior:
 * ```tsx
 * <BfDsTextArea
 *   label="Fixed Size Notes"
 *   placeholder="Notes..."
 *   resize="none"
 *   rows={3}
 * />
 * ```
 *
 * @returns A comprehensive multi-line text input component
 */
export const BfDsTextArea = forwardRef<HTMLTextAreaElement, BfDsTextAreaProps>(
  function BfDsTextArea({
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
    resize = "vertical",
    ...props
  }, ref) {
    const formContext = useBfDsFormContext();
    const textAreaId = id || useId();
    const helpTextId = `${textAreaId}-help`;
    const errorId = `${textAreaId}-error`;
    const successId = `${textAreaId}-success`;

    // Internal state for uncontrolled mode
    const [internalValue, setInternalValue] = useState(defaultValue ?? "");

    // Determine if we're in form context or standalone mode
    const isInFormContext = formContext !== null && name !== undefined;
    const isControlled = standaloneProp !== undefined;

    // Get value from form context, controlled prop, or internal state
    const value = isInFormContext && formContext?.data && name
      ? (formContext.data[name as keyof typeof formContext.data] as string) ??
        ""
      : isControlled
      ? standaloneProp
      : internalValue;

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (
        isInFormContext && formContext?.onChange && formContext?.data && name
      ) {
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
      "bfds-textarea",
      `bfds-textarea--${actualState}`,
      `bfds-textarea--resize-${resize}`,
      className,
    ].filter(Boolean).join(" ");

    const containerClasses = [
      "bfds-textarea-container",
      `bfds-textarea-container--${actualState}`,
    ].filter(Boolean).join(" ");

    return (
      <div className={containerClasses}>
        {label && (
          <label htmlFor={textAreaId} className="bfds-textarea-label">
            {label}
            {required && <span className="bfds-textarea-required">*</span>}
          </label>
        )}
        <textarea
          {...props}
          ref={ref}
          id={textAreaId}
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
          <div id={helpTextId} className="bfds-textarea-help">
            {helpText}
          </div>
        )}
        {actualState === "error" && actualErrorMessage && (
          <div id={errorId} className="bfds-textarea-error" role="alert">
            {actualErrorMessage}
          </div>
        )}
        {actualState === "success" && successMessage && (
          <div id={successId} className="bfds-textarea-success">
            {successMessage}
          </div>
        )}
      </div>
    );
  },
);
