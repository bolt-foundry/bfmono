/**
 * @fileoverview BfDsSelect - Sophisticated dropdown selection component with typeahead functionality
 * @author Justin Carter <justin@boltfoundry.com>
 * @since 2.0.0
 */
import type * as React from "react";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useBfDsFormContext } from "./BfDsForm.tsx";
import { BfDsIcon } from "./BfDsIcon.tsx";

/**
 * Represents a selectable option in the BfDsSelect dropdown
 */
export type BfDsSelectOption = {
  /** The value submitted when this option is selected */
  value: string;
  /** Display text shown for this option */
  label: string;
  /** When true, this option cannot be selected */
  disabled?: boolean;
};

/**
 * Props for the BfDsSelect component
 */
export type BfDsSelectProps = {
  // Form context props
  /** Form field name for data binding */
  name?: string;

  // Standalone props
  /** Currently selected value (controlled) */
  value?: string;
  /** Default selected value for uncontrolled usage */
  defaultValue?: string;
  /** Selection change callback */
  onChange?: (value: string) => void;

  // Common props
  /** Array of selectable options */
  options: Array<BfDsSelectOption>;
  /** Placeholder when nothing selected */
  placeholder?: string;
  /** Field label */
  label?: string;
  /** Required for validation */
  required?: boolean;
  /** Disables component */
  disabled?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Element ID */
  id?: string;
  /** Enable typeahead functionality */
  typeahead?: boolean;
};

/**
 * A sophisticated dropdown selection component with optional typeahead functionality
 *
 * BfDsSelect provides a comprehensive dropdown selection experience with intelligent
 * positioning, keyboard navigation, and seamless form integration. It supports both
 * basic selection and typeahead search for larger datasets.
 *
 * Features:
 * - Intelligent dropdown positioning (above/below based on available space)
 * - Full keyboard navigation support
 * - Typeahead search functionality
 * - Seamless form integration with BfDsForm
 * - Both controlled and uncontrolled usage patterns
 * - Accessibility features with proper ARIA attributes
 *
 * @param props - Component props
 * @param props.name - Form field name for data binding when used within BfDsForm
 * @param props.value - Currently selected value (controlled mode)
 * @param props.defaultValue - Default selected value for uncontrolled usage
 * @param props.onChange - Callback fired when selection changes
 * @param props.options - Array of selectable options with value, label, and optional disabled state
 * @param props.placeholder - Placeholder text shown when nothing is selected
 * @param props.disabled - Whether the component is disabled
 * @param props.required - Whether selection is required for form validation
 * @param props.className - Additional CSS classes to apply
 * @param props.id - Element ID for the select input
 * @param props.label - Field label displayed above the select
 * @param props.typeahead - Enable typeahead search functionality
 *
 * @example
 * Basic usage:
 * ```tsx
 * <BfDsSelect
 *   options={[
 *     { value: "us", label: "United States" },
 *     { value: "ca", label: "Canada" }
 *   ]}
 *   value={selectedCountry}
 *   onChange={setSelectedCountry}
 *   placeholder="Choose a country"
 * />
 * ```
 *
 * @example
 * With form integration:
 * ```tsx
 * <BfDsForm initialData={formData} onChange={setFormData}>
 *   <BfDsSelect
 *     name="country"
 *     label="Country"
 *     options={countryOptions}
 *     placeholder="Select country"
 *     required
 *   />
 * </BfDsForm>
 * ```
 *
 * @example
 * With typeahead for large datasets:
 * ```tsx
 * <BfDsSelect
 *   label="Country (Searchable)"
 *   options={largeCountryList}
 *   typeahead
 *   placeholder="Type to search countries..."
 * />
 * ```
 *
 * @example
 * Controlled with validation:
 * ```tsx
 * const [value, setValue] = useState("");
 * const [error, setError] = useState("");
 *
 * <BfDsSelect
 *   label="Required Selection"
 *   options={options}
 *   value={value}
 *   onChange={(newValue) => {
 *     setValue(newValue);
 *     setError(newValue ? "" : "Please make a selection");
 *   }}
 *   required
 * />
 * ```
 *
 * @returns A sophisticated dropdown selection component
 */
export function BfDsSelect({
  name,
  value,
  defaultValue,
  onChange,
  options,
  placeholder = "Select...",
  disabled = false,
  required = false,
  className,
  id,
  label,
  typeahead = false,
}: BfDsSelectProps) {
  const formContext = useBfDsFormContext();
  const isInForm = !!formContext;
  const selectId = id || useId();

  // Internal state for uncontrolled mode
  const [internalValue, setInternalValue] = useState(defaultValue ?? "");

  // Dropdown state (used for both regular and typeahead)
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [displayValue, setDisplayValue] = useState("");
  const [dropdownPosition, setDropdownPosition] = useState<"below" | "above">(
    "below",
  );
  const [isKeyboardNavigation, setIsKeyboardNavigation] = useState(false);

  // Refs for managing focus and clicks
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Determine control mode
  const isControlled = value !== undefined;

  // Get actual value from form context, controlled prop, or internal state
  const actualValue = isInForm
    ? (formContext.data as Record<string, unknown>)?.[name || ""] as string ||
      ""
    : isControlled
    ? value
    : internalValue;

  const actualOnChange = isInForm
    ? (newValue: string) => {
      if (name && formContext.onChange && formContext.data) {
        formContext.onChange({
          ...(formContext.data as Record<string, unknown>),
          [name]: newValue,
        });
      } else {
        // Fallback to standalone onChange if form context is incomplete
        onChange?.(newValue);
      }
    }
    : (newValue: string) => {
      onChange?.(newValue);
      if (!isControlled) {
        // Update internal state for uncontrolled mode
        setInternalValue(newValue);
      }
    };

  // Filter options based on search term
  const filteredOptions = useMemo(() => {
    if (!typeahead || !searchTerm) return options;
    return options.filter((option) =>
      option.label.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [options, searchTerm, typeahead]);

  // Update display value when actualValue changes
  useEffect(() => {
    const selectedOption = options.find((opt) => opt.value === actualValue);
    setDisplayValue(selectedOption?.label || "");
    setSearchTerm("");
  }, [actualValue, options]);

  // Calculate dropdown position when opening
  const calculateDropdownPosition = () => {
    if (!containerRef.current) return "below";

    const container = containerRef.current;
    const containerRect = container.getBoundingClientRect();
    const viewportHeight = globalThis.innerHeight;

    // Estimate dropdown height (max-height is 200px from CSS)
    const estimatedDropdownHeight = Math.min(
      filteredOptions.length * 44 + 8,
      200,
    );

    // Check if there's enough space below
    const spaceBelow = viewportHeight - containerRect.bottom;
    const spaceAbove = containerRect.top;

    // If not enough space below but enough space above, position above
    if (
      spaceBelow < estimatedDropdownHeight &&
      spaceAbove > estimatedDropdownHeight
    ) {
      return "above";
    }

    return "below";
  };

  // Scroll to highlighted option in dropdown
  const scrollToHighlightedOption = (index: number) => {
    if (!dropdownRef.current) return;

    const dropdown = dropdownRef.current;
    const option = dropdown.querySelector(
      `[data-option-index="${index}"]`,
    ) as HTMLElement;

    if (option) {
      const dropdownRect = dropdown.getBoundingClientRect();
      const optionRect = option.getBoundingClientRect();

      // Check if option is above visible area
      if (optionRect.top < dropdownRect.top) {
        dropdown.scrollTop = option.offsetTop;
      } // Check if option is below visible area
      else if (optionRect.bottom > dropdownRect.bottom) {
        dropdown.scrollTop = option.offsetTop - dropdown.clientHeight +
          option.clientHeight;
      }
    }
  };

  // Centralized dropdown close handler
  const closeDropdown = (preserveDisplayValue = false) => {
    setIsOpen(false);
    setHighlightedIndex(-1);
    setSearchTerm("");
    setIsKeyboardNavigation(false);
    if (!preserveDisplayValue) {
      // Reset display value to selected option
      const selectedOption = options.find((opt) => opt.value === actualValue);
      setDisplayValue(selectedOption?.label || "");
    }
  };

  const selectClasses = [
    "bfds-select",
    disabled && "bfds-select--disabled",
    typeahead && isOpen && dropdownPosition === "below" && "bfds-select--open",
    typeahead && isOpen && dropdownPosition === "above" &&
    "bfds-select--open-above",
    className,
  ].filter(Boolean).join(" ");

  const containerClasses = [
    "bfds-select-container",
    disabled && "bfds-select-container--disabled",
  ].filter(Boolean).join(" ");

  // Input change handler (only for typeahead)
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!typeahead) return;

    const value = e.target.value;
    setSearchTerm(value);
    setDisplayValue(value);
    setHighlightedIndex(-1);
    if (!isOpen) {
      const position = calculateDropdownPosition();
      setDropdownPosition(position);
      setIsOpen(true);
    }
  };

  const handleOptionClick = (option: BfDsSelectOption) => {
    if (option.disabled) return;

    // Close dropdown first to prevent any state conflicts
    setIsOpen(false);
    setHighlightedIndex(-1);
    setSearchTerm("");
    setIsKeyboardNavigation(false);

    // Update the value through onChange
    if (actualOnChange) {
      actualOnChange(option.value);
    }

    // Set display value immediately for better UX
    setDisplayValue(option.label);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        const position = calculateDropdownPosition();
        setDropdownPosition(position);
        setIsOpen(true);
        setHighlightedIndex(0);
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setIsKeyboardNavigation(true);
        setHighlightedIndex((prev) => {
          const newIndex = prev < filteredOptions.length - 1 ? prev + 1 : 0;
          // Scroll to the highlighted option after state update
          setTimeout(() => scrollToHighlightedOption(newIndex), 0);
          return newIndex;
        });
        break;
      case "ArrowUp":
        e.preventDefault();
        setIsKeyboardNavigation(true);
        setHighlightedIndex((prev) => {
          const newIndex = prev > 0 ? prev - 1 : filteredOptions.length - 1;
          // Scroll to the highlighted option after state update
          setTimeout(() => scrollToHighlightedOption(newIndex), 0);
          return newIndex;
        });
        break;
      case "Enter":
        e.preventDefault();
        if (
          highlightedIndex >= 0 && highlightedIndex < filteredOptions.length
        ) {
          handleOptionClick(filteredOptions[highlightedIndex]);
        }
        break;
      case "Escape":
        e.preventDefault();
        closeDropdown();
        break;
    }
  };

  const handleInputFocus = () => {
    const position = calculateDropdownPosition();
    setDropdownPosition(position);
    setIsOpen(true);
  };

  const handleInputBlur = (e: React.FocusEvent) => {
    // Don't close if clicking on an option
    if (dropdownRef.current?.contains(e.relatedTarget as Node)) {
      return;
    }

    setTimeout(() => {
      closeDropdown();
    }, 100);
  };

  const handleIconMouseDown = (e: React.MouseEvent) => {
    // Prevent the input from losing focus when clicking the icon
    e.preventDefault();
  };

  const handleIconClick = () => {
    if (!disabled) {
      if (isOpen) {
        closeDropdown();
        inputRef.current?.blur();
      } else {
        const position = calculateDropdownPosition();
        setDropdownPosition(position);
        setIsOpen(true);
        inputRef.current?.focus();
      }
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        closeDropdown();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen, actualValue, options]);

  return (
    <div className={containerClasses} ref={containerRef}>
      {label && (
        <label htmlFor={selectId} className="bfds-select-label">
          {label}
          {required && <span className="bfds-select-required">*</span>}
        </label>
      )}
      <div className="bfds-select-wrapper">
        <input
          ref={inputRef}
          id={selectId}
          name={name}
          type="text"
          value={displayValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={selectClasses}
          autoComplete="off"
          readOnly={!typeahead}
          role="combobox"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-autocomplete={typeahead ? "list" : "none"}
        />
        <BfDsIcon
          name="triangleDown"
          size="small"
          className={`bfds-select-icon ${
            isOpen ? "bfds-select-icon--open" : ""
          } bfds-select-icon--clickable`}
          onMouseDown={handleIconMouseDown}
          onClick={handleIconClick}
        />
        {isOpen && (
          <div
            ref={dropdownRef}
            className={`bfds-select-dropdown ${
              dropdownPosition === "above"
                ? "bfds-select-dropdown--above"
                : "bfds-select-dropdown--below"
            } ${
              isKeyboardNavigation ? "bfds-select-dropdown--keyboard-nav" : ""
            }`}
            role="listbox"
          >
            {filteredOptions.length === 0
              ? (
                <div className="bfds-select-option bfds-select-option--no-results">
                  No results found
                </div>
              )
              : (
                filteredOptions.map((option, index) => (
                  <div
                    key={option.value}
                    data-option-index={index}
                    className={`bfds-select-option ${
                      option.disabled ? "bfds-select-option--disabled" : ""
                    } ${
                      index === highlightedIndex
                        ? "bfds-select-option--highlighted"
                        : ""
                    } ${
                      option.value === actualValue
                        ? "bfds-select-option--selected"
                        : ""
                    }`}
                    onMouseDown={(e) => {
                      // Prevent input from losing focus when clicking on option
                      e.preventDefault();
                    }}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleOptionClick(option);
                    }}
                    onMouseEnter={() => {
                      setIsKeyboardNavigation(false);
                      setHighlightedIndex(index);
                    }}
                    role="option"
                    aria-selected={option.value === actualValue}
                    aria-disabled={option.disabled}
                  >
                    {option.label}
                  </div>
                ))
              )}
          </div>
        )}
      </div>
    </div>
  );
}
