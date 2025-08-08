/**
 * @fileoverview BfDsFormSubmitButton - Form submit button with automatic form integration
 * @author Justin Carter <justin@boltfoundry.com>
 * @since 2.0.0
 */
import type * as React from "react";
import { BfDsButton, type BfDsButtonProps } from "./BfDsButton.tsx";

/**
 * Props for the BfDsFormSubmitButton component.
 *
 * Inherits all props from BfDsButton except `type` and `onClick`, which are
 * managed internally to provide form-specific behavior.
 *
 * @example
 * ```tsx
 * // Basic usage with default "Submit" text
 * <BfDsFormSubmitButtonProps />
 *
 * // Custom text and styling
 * <BfDsFormSubmitButtonProps
 *   text="Save Changes"
 *   variant="primary"
 *   size="large"
 * />
 *
 * // With pre-submission handler
 * <BfDsFormSubmitButtonProps
 *   text="Create Account"
 *   onClick={(e) => console.log("Pre-submit validation")}
 * />
 * ```
 */
export type BfDsFormSubmitButtonProps =
  & Omit<BfDsButtonProps, "type" | "onClick">
  & {
    /** Button text (defaults to "Submit") */
    text?: string;
    /** Optional click handler called before form submission */
    onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  };

/**
 * A specialized button component designed specifically for form submission.
 *
 * This component wraps the BfDsButton component with form-specific behavior and
 * defaults, automatically setting the type to "submit" and integrating seamlessly
 * with both BfDsForm components and standard HTML forms.
 *
 * The button automatically triggers form submission when clicked and supports
 * all BfDsButton styling options including variants, sizes, icons, and loading states.
 *
 * @example
 * ```tsx
 * // Basic usage with BfDsForm
 * <BfDsForm onSubmit={handleSubmit}>
 *   <BfDsInput name="email" label="Email" />
 *   <BfDsFormSubmitButton /> // Defaults to "Submit" text
 * </BfDsForm>
 * ```
 *
 * @example
 * ```tsx
 * // Custom text and styling
 * <BfDsForm onSubmit={handleSubmit}>
 *   <BfDsInput name="name" label="Name" />
 *   <BfDsFormSubmitButton
 *     text="Create Account"
 *     variant="primary"
 *     icon="userPlus"
 *   />
 * </BfDsForm>
 * ```
 *
 * @example
 * ```tsx
 * // With loading states for async operations
 * const [isSubmitting, setIsSubmitting] = useState(false);
 *
 * <BfDsForm onSubmit={async (data) => {
 *   setIsSubmitting(true);
 *   try {
 *     await submitData(data);
 *   } finally {
 *     setIsSubmitting(false);
 *   }
 * }}>
 *   <BfDsInput name="data" label="Data" />
 *   <BfDsFormSubmitButton
 *     text={isSubmitting ? "Submitting..." : "Submit"}
 *     spinner={isSubmitting}
 *     disabled={isSubmitting}
 *   />
 * </BfDsForm>
 * ```
 *
 * @example
 * ```tsx
 * // With pre-submission validation
 * <BfDsForm onSubmit={handleSubmit}>
 *   <BfDsInput name="email" label="Email" />
 *   <BfDsFormSubmitButton
 *     text="Sign Up"
 *     onClick={(e) => {
 *       console.log("Running pre-submit validation");
 *       // Custom validation logic here
 *     }}
 *   />
 * </BfDsForm>
 * ```
 *
 * @example
 * ```tsx
 * // Using with standard HTML forms
 * <form onSubmit={handleSubmit}>
 *   <input name="username" required />
 *   <BfDsFormSubmitButton text="Login" variant="primary" />
 * </form>
 * ```
 *
 * @example
 * ```tsx
 * // Multi-step form with conditional text
 * const isLastStep = currentStep === totalSteps;
 *
 * <BfDsForm onSubmit={handleStepSubmit}>
 *   // Form fields for current step
 *   <BfDsFormSubmitButton
 *     text={isLastStep ? "Complete" : "Next"}
 *     icon={isLastStep ? "checkCircle" : "arrowRight"}
 *     iconPosition="right"
 *   />
 * </BfDsForm>
 * ```
 *
 * ## Key Features
 *
 * **Automatic Form Integration**: Automatically sets `type="submit"` and integrates
 * with form submission handling. Works with both BfDsForm and standard HTML forms.
 *
 * **Pre-submission Hook**: Optional `onClick` handler allows for custom logic
 * before form submission (validation, analytics, etc.).
 *
 * **Full BfDsButton Feature Set**: Supports all BfDsButton props including variants,
 * sizes, icons, loading states, and accessibility features.
 *
 * **Loading State Management**: Perfect for async form submissions with built-in
 * spinner and disabled state support.
 *
 * **TypeScript Support**: Full type safety with proper prop inheritance and
 * type restrictions for form-specific behavior.
 *
 * ## Form Integration Patterns
 *
 * **Basic Form Submission**: Simply include in any form to create a submit button
 * with proper semantic HTML and form handling.
 *
 * **Async Operations**: Use with loading states to provide user feedback during
 * server requests or long-running operations.
 *
 * **Validation Integration**: Combine with form validation to disable submission
 * of invalid forms and provide appropriate user feedback.
 *
 * **Multi-step Forms**: Dynamic text and icons make it perfect for wizards and
 * multi-step form flows.
 *
 * ## Accessibility
 *
 * - **Semantic HTML**: Uses `type="submit"` for proper form semantics
 * - **Keyboard Navigation**: Full support for Tab, Enter, and Space keys
 * - **Screen Reader Support**: Proper ARIA attributes and semantic structure
 * - **Focus Management**: Clear focus indicators and proper focus handling
 * - **Loading States**: Appropriate ARIA attributes during async operations
 *
 * ## Styling
 *
 * Inherits all CSS classes and styling from BfDsButton:
 * - `.bfds-button` - Base button styles
 * - `.bfds-button--{variant}` - Variant-specific styles (primary, secondary, etc.)
 * - `.bfds-button--{size}` - Size-specific styles (small, medium, large)
 * - Additional modifiers based on button state and props
 */
export function BfDsFormSubmitButton({
  text = "Submit",
  onClick,
  children,
  ...props
}: BfDsFormSubmitButtonProps) {
  const handleClick = (
    e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>,
  ) => {
    // Call custom onClick first if provided
    onClick?.(e as React.MouseEvent<HTMLButtonElement>);

    // Let the form handle submission if we're in form context
    // The form's onSubmit will be called automatically by the form element
  };

  return (
    <BfDsButton
      {...props}
      type="submit"
      onClick={handleClick}
    >
      {children || text}
    </BfDsButton>
  );
}
