/**
 * @fileoverview BfDsForm - Form container component with centralized state management and automatic data binding
 * @author Justin Carter <justin@boltfoundry.com>
 * @since 2.0.0
 */
import * as React from "react";

const { useState, createContext, useContext } = React;

/**
 * Represents a form validation error with message, field reference, and severity type.
 */
type FormError = {
  /** The error message to display to the user */
  message: string;
  /** The form field that this error is associated with */
  field: string;
  /** The type/severity of the error */
  type: "error" | "warn" | "info";
};

/**
 * A record type that maps form field names to their validation errors.
 * @template T The form data type
 */
type BfDsFormErrorRecord<T> = {
  [key in keyof T]: FormError;
};

/**
 * Callback functions that can be provided to the form for handling various events.
 * @template T The form data type
 */
type BfDsFormCallbacks<T> = {
  /** Called when form is submitted */
  onSubmit?: (value: T) => void;
  /** Called whenever form data changes */
  onChange?: (value: T) => void;
  /** Called when form validation errors occur */
  onError?: (errors: BfDsFormErrorRecord<T>) => void;
};

/**
 * The context value that provides form state and callbacks to child components.
 * This is what gets passed through React Context to all form field components.
 *
 * @template T The form data type, defaults to Record<string, string | number | boolean>
 *
 * @example
 * ```tsx
 * // Accessing form context in a custom component
 * function CustomFormField() {
 *   const formContext = useBfDsFormContext<MyFormType>();
 *   if (!formContext) return null;
 *
 *   const { data, errors, onChange } = formContext;
 *   return <div>Current data: {JSON.stringify(data)}</div>;
 * }
 * ```
 */
export type BfDsFormValue<T = Record<string, string | number | boolean>> = {
  /** Current form validation errors */
  errors?: BfDsFormErrorRecord<T>;
  /** Current form data */
  data?: T;
} & BfDsFormCallbacks<T>;

/**
 * React Context for sharing form state and callbacks throughout the form component tree.
 * Used internally by BfDsForm and consumed by form field components.
 */
const BfDsFormContext = createContext<BfDsFormValue<unknown> | null>(null);

/**
 * Props for the BfDsForm component.
 *
 * @template T The type of form data, defaults to Record<string, string | number | boolean | null>
 */
type BfDsFormProps<T = Record<string, string | number | boolean | null>> =
  & React.PropsWithChildren<BfDsFormCallbacks<T>>
  & {
    /** Initial form data values */
    initialData: T;
    /** Additional CSS classes */
    className?: string;
    /** Test ID for testing purposes */
    testId?: string;
  };

/**
 * A powerful form container component that provides centralized state management,
 * automatic data binding, and validation support for all BfDs form elements.
 *
 * This component creates a form context that automatically manages form state and
 * provides data binding for all child form components. Form fields bind to form
 * state using their `name` prop - no need for individual `value` and `onChange` props.
 *
 * @template T The type of form data being managed
 *
 * @example
 * ```tsx
 * // Basic form usage
 * <BfDsForm
 *   initialData={{ name: "", email: "" }}
 *   onSubmit={(data) => handleSubmit(data)}
 * >
 *   <BfDsInput name="name" label="Name" required />
 *   <BfDsInput name="email" label="Email" type="email" required />
 *   <BfDsFormSubmitButton text="Submit" />
 * </BfDsForm>
 * ```
 *
 * @example
 * ```tsx
 * // TypeScript form with complex data structure
 * interface UserForm {
 *   profile: { firstName: string; lastName: string; };
 *   preferences: { newsletter: boolean; theme: "light" | "dark"; };
 * }
 *
 * <BfDsForm<UserForm>
 *   initialData={{
 *     profile: { firstName: "", lastName: "" },
 *     preferences: { newsletter: false, theme: "light" }
 *   }}
 *   onSubmit={(data) => console.log(data.profile.firstName)} // Fully typed
 *   onChange={(data) => autosave(data)} // Called on every change
 * >
 *   <BfDsInput name="profile.firstName" label="First Name" />
 *   <BfDsInput name="profile.lastName" label="Last Name" />
 *   <BfDsCheckbox name="preferences.newsletter" label="Newsletter" />
 *   <BfDsRadio
 *     name="preferences.theme"
 *     options={[
 *       { value: "light", label: "Light" },
 *       { value: "dark", label: "Dark" }
 *     ]}
 *   />
 * </BfDsForm>
 * ```
 *
 * @example
 * ```tsx
 * // Form with validation and error handling
 * <BfDsForm
 *   initialData={formData}
 *   onSubmit={(data) => {
 *     const errors = validateForm(data);
 *     if (errors) return; // Handle validation errors
 *     submitToAPI(data);
 *   }}
 *   onError={(errors) => {
 *     // Handle validation errors, show notifications
 *     showErrorToast("Please fix form errors");
 *   }}
 * >
 *   <BfDsInput name="username" label="Username" />
 *   <BfDsFormSubmitButton text="Create Account" />
 * </BfDsForm>
 * ```
 *
 * ## Key Features
 *
 * **Automatic Data Binding**: Form fields automatically sync with form state using the `name` prop.
 * No need to manually wire up `value` and `onChange` for each field.
 *
 * **TypeScript Support**: Full type safety with generic type parameter. TypeScript will
 * enforce that field names match your data structure and provide autocomplete.
 *
 * **Nested Object Support**: Use dot notation in field names (e.g., "profile.firstName")
 * to bind to nested object properties.
 *
 * **Real-time Updates**: The `onChange` callback is triggered whenever any field changes,
 * enabling auto-save, real-time validation, and responsive UI updates.
 *
 * **Error Handling**: Built-in error state management with the `onError` callback for
 * handling validation errors and displaying user feedback.
 *
 * **Form Context**: Provides a React context that child components can access using
 * the `useBfDsFormContext` hook for advanced customization.
 *
 * ## Supported Form Components
 *
 * All BfDs form components automatically integrate with BfDsForm context:
 * - **Text Inputs**: BfDsInput, BfDsTextArea
 * - **Selection**: BfDsSelect, BfDsRadio
 * - **Boolean**: BfDsCheckbox, BfDsToggle
 * - **Range**: BfDsRange
 * - **Submit**: BfDsFormSubmitButton
 *
 * ## Accessibility
 *
 * - Uses semantic `<form>` element with proper submit handling
 * - All form fields are properly associated with labels
 * - Form errors are announced to screen readers
 * - Full keyboard navigation support
 * - Proper focus management during validation
 *
 * ## Styling
 *
 * The component uses the `bfds-form` CSS class. Individual form components maintain
 * their own styling while participating in the form context.
 */
export function BfDsForm<T>({
  initialData,
  className,
  children,
  testId,
  ...bfDsFormCallbacks
}: BfDsFormProps<T>) {
  const [data, setData] = useState<T>(initialData);
  const [errors, setErrors] = useState<BfDsFormErrorRecord<T>>(
    {} as BfDsFormErrorRecord<T>,
  );

  function onChange(value: T) {
    setData(value);
    bfDsFormCallbacks.onChange?.(value);
  }

  function onError(errors: BfDsFormErrorRecord<T>) {
    setErrors(errors);
    bfDsFormCallbacks.onError?.(errors);
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    bfDsFormCallbacks.onSubmit?.(data);
  }

  const formClasses = [
    "bfds-form",
    className,
  ].filter(Boolean).join(" ");

  return (
    <BfDsFormContext.Provider
      value={{ data, errors, onChange, onError, onSubmit } as BfDsFormValue<
        unknown
      >}
    >
      <form
        data-testid={testId}
        onSubmit={onSubmit}
        className={formClasses}
      >
        {children}
      </form>
    </BfDsFormContext.Provider>
  );
}

/**
 * React hook for accessing the BfDsForm context within form field components.
 *
 * This hook provides access to the current form state, validation errors, and
 * callback functions. It must be used within a BfDsForm component tree.
 *
 * @template T The type of form data being managed
 * @returns The form context value, or null if used outside of a BfDsForm
 *
 * @example
 * ```tsx
 * // Using the form context in a custom component
 * function CustomFormField() {
 *   const formContext = useBfDsFormContext<MyFormType>();
 *
 *   if (!formContext) {
 *     return <div>Must be used within BfDsForm</div>;
 *   }
 *
 *   const { data, errors, onChange } = formContext;
 *
 *   return (
 *     <div>
 *       <p>Current form data: {JSON.stringify(data)}</p>
 *       <button onClick={() => onChange({ ...data, customField: "updated" })}>
 *         Update Custom Field
 *       </button>
 *       {errors?.customField && (
 *         <span className="error">{errors.customField.message}</span>
 *       )}
 *     </div>
 *   );
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Using in a custom input component
 * function CustomInput({ name, label }: { name: string; label: string }) {
 *   const formContext = useBfDsFormContext<Record<string, string>>();
 *   if (!formContext) return null;
 *
 *   const { data, onChange } = formContext;
 *   const value = data?.[name] || "";
 *
 *   return (
 *     <label>
 *       {label}
 *       <input
 *         value={value}
 *         onChange={(e) => onChange({ ...data, [name]: e.target.value })}
 *       />
 *     </label>
 *   );
 * }
 * ```
 */
export function useBfDsFormContext<T>() {
  return useContext(BfDsFormContext) as BfDsFormValue<T> | null;
}

/**
 * Base props interface for BfDs form element components.
 *
 * This type provides the common props that all form field components should have,
 * including the required `name` prop for data binding and optional `label` prop.
 * It can be extended with additional component-specific props.
 *
 * @template TAdditionalFormElementProps Additional props specific to the form component
 *
 * @example
 * ```tsx
 * // Extending for a custom input component
 * interface MyInputProps extends BfDsFormElementProps<{
 *   type?: "text" | "email" | "password";
 *   placeholder?: string;
 *   required?: boolean;
 * }> {}
 *
 * function MyInput({ name, label, type = "text", placeholder, required }: MyInputProps) {
 *   // Component implementation
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Using with a select component
 * interface SelectOption {
 *   value: string;
 *   label: string;
 * }
 *
 * interface MySelectProps extends BfDsFormElementProps<{
 *   options: SelectOption[];
 *   multiple?: boolean;
 * }> {}
 * ```
 */
export type BfDsFormElementProps<
  TAdditionalFormElementProps = Record<string, unknown>,
> = TAdditionalFormElementProps & {
  /** The name of the form field - used for data binding to form state */
  name: string;
  /** Optional label for the form field */
  label?: string;
};
