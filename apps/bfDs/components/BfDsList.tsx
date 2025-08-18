/**
 * @fileoverview BfDsList - List container component with keyboard navigation and selection support
 * @author Justin Carter <justin@boltfoundry.com>
 * @since 2.0.0
 */
import type * as React from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { BfDsCheckbox } from "./BfDsCheckbox.tsx";

/**
 * Props for the BfDsList component.
 *
 * @example
 * ```tsx
 * // Basic list
 * <BfDsList>
 *   <BfDsListItem>Item 1</BfDsListItem>
 *   <BfDsListItem>Item 2</BfDsListItem>
 * </BfDsList>
 *
 * // List with header and accordion behavior
 * <BfDsList header="Settings" accordion>
 *   <BfDsListItem expandContents={<div>Section 1 content</div>}>
 *     Section 1
 *   </BfDsListItem>
 *   <BfDsListItem expandContents={<div>Section 2 content</div>}>
 *     Section 2
 *   </BfDsListItem>
 * </BfDsList>
 *
 * // List with bulk selection
 * <BfDsList
 *   bulkSelect
 *   initialSelectedValues={["item1"]}
 *   onSelectionChange={(selected) => console.log(selected)}
 * >
 *   <BfDsListItem value="item1">Item 1</BfDsListItem>
 *   <BfDsListItem value="item2">Item 2</BfDsListItem>
 * </BfDsList>
 * ```
 */
type BfDsListProps = {
  /** List items (typically BfDsListItem components) */
  children: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
  /** When true, only one item can be expanded at a time */
  accordion?: boolean;
  /** Optional header text to display above the list */
  header?: string;
  /** Enable bulk selection with checkboxes */
  bulkSelect?: boolean;
  /** Callback when selection changes (only used with bulkSelect) */
  onSelectionChange?: (selectedValues: Array<string>) => void;
  /** Render function for bulk actions toolbar */
  bulkActions?: (
    selectedValues: Array<string>,
    clearSelection: () => void,
  ) => React.ReactNode;
  /** Initial selected values for bulk selection */
  initialSelectedValues?: Array<string>;
};

/**
 * Context type that provides list state and controls to child components.
 *
 * This context is used internally to coordinate behavior between the list container
 * and its child items, particularly for accordion expansion management and bulk selection.
 *
 * @example
 * ```tsx
 * // Accessing list context in a custom component
 * function CustomListItem() {
 *   const listContext = useBfDsList();
 *   if (!listContext) return null;
 *
 *   const { accordion, expandedIndex, bulkSelect, selectedValues } = listContext;
 *   return (
 *     <div>
 *       {accordion ? "Accordion mode" : "Independent mode"}
 *       {bulkSelect && `${selectedValues.length} items selected`}
 *     </div>
 *   );
 * }
 * ```
 */
type BfDsListContextType = {
  /** Whether the list is in accordion mode (only one item expandable) */
  accordion: boolean;
  /** Index of the currently expanded item (null if none expanded) */
  expandedIndex: number | null;
  /** Function to set which item is expanded */
  setExpandedIndex: (index: number | null) => void;
  /** Function to get the index of a list item by its ref */
  getItemIndex: (ref: React.RefObject<HTMLElement | null>) => number | null;
  /** Whether bulk selection is enabled */
  bulkSelect: boolean;
  /** Array of currently selected item values */
  selectedValues: Array<string>;
  /** Function to toggle selection of an item */
  toggleSelection: (value: string) => void;
  /** Function to select all items */
  selectAll: () => void;
  /** Function to clear all selections */
  clearSelection: () => void;
  /** All selectable item values in the list */
  allSelectableValues: Array<string>;
  /** Function to register a selectable value */
  registerSelectableValue: (value: string) => void;
  /** Function to unregister a selectable value */
  unregisterSelectableValue: (value: string) => void;
};

/**
 * React Context for sharing list state and controls throughout the list component tree.
 * Used internally by BfDsList and consumed by BfDsListItem components.
 */
const BfDsListContext = createContext<BfDsListContextType | null>(null);

/**
 * A container component for organizing and displaying list items with optional
 * accordion behavior.
 *
 * This component works in conjunction with BfDsListItem to create structured,
 * interactive lists. It provides context to manage expansion states and supports
 * both accordion mode (one item expanded) and independent expansion modes.
 *
 * @example
 * ```tsx
 * // Simple navigation list
 * <BfDsList header="Navigation">
 *   <BfDsListItem active>Dashboard</BfDsListItem>
 *   <BfDsListItem onClick={() => navigate('/projects')}>Projects</BfDsListItem>
 *   <BfDsListItem onClick={() => navigate('/settings')}>Settings</BfDsListItem>
 * </BfDsList>
 * ```
 *
 * @example
 * ```tsx
 * // Accordion-style expandable sections
 * <BfDsList accordion header="FAQ">
 *   <BfDsListItem
 *     expandContents={
 *       <div style={{ padding: '16px' }}>
 *         <p>Answer: You can create projects from the dashboard.</p>
 *         <button>Helpful</button>
 *       </div>
 *     }
 *   >
 *     How do I create a project?
 *   </BfDsListItem>
 *   <BfDsListItem
 *     expandContents={
 *       <div style={{ padding: '16px' }}>
 *         <p>Answer: Go to Team settings and click "Invite Member".</p>
 *       </div>
 *     }
 *   >
 *     How do I add team members?
 *   </BfDsListItem>
 * </BfDsList>
 * ```
 *
 * @example
 * ```tsx
 * // Settings sections with rich content
 * <BfDsList accordion header="Account Settings">
 *   <BfDsListItem
 *     expandContents={
 *       <div>
 *         <label>Display Name</label>
 *         <input type="text" defaultValue="John Doe" />
 *         <button>Save Profile</button>
 *       </div>
 *     }
 *   >
 *     Profile Settings
 *   </BfDsListItem>
 *   <BfDsListItem
 *     expandContents={
 *       <div>
 *         <label><input type="checkbox" /> Email notifications</label>
 *         <label><input type="checkbox" /> Push notifications</label>
 *       </div>
 *     }
 *   >
 *     Notification Preferences
 *   </BfDsListItem>
 * </BfDsList>
 * ```
 *
 * @example
 * ```tsx
 * // Interactive project list
 * <BfDsList header="Projects">
 *   <BfDsListItem
 *     expandContents={
 *       <div>
 *         <p>Status: Active | Last updated: 2 hours ago</p>
 *         <div>
 *           <button>Open</button>
 *           <button>Edit</button>
 *           <button>Archive</button>
 *         </div>
 *       </div>
 *     }
 *   >
 *     Website Redesign
 *   </BfDsListItem>
 * </BfDsList>
 * ```
 *
 * ## Key Features
 *
 * **Accordion Behavior**: When `accordion={true}`, only one list item can be expanded
 * at a time. Expanding a new item automatically collapses the previously expanded item.
 *
 * **Independent Expansion**: Without accordion mode, multiple items can be expanded
 * simultaneously, providing maximum flexibility for content organization.
 *
 * **Context Management**: Provides React context to coordinate behavior between the
 * list container and its child items, handling expansion state and item indexing.
 *
 * **Semantic HTML**: Renders as a proper `<ul>` element with optional header,
 * maintaining accessibility and semantic structure.
 *
 * **Flexible Content**: Supports any React content as list items, from simple text
 * to complex interactive interfaces with forms, buttons, and rich media.
 *
 * ## Common Use Cases
 *
 * **Navigation Interfaces**: Create sidebar navigation with active states and
 * click handlers for routing.
 *
 * **FAQ Sections**: Build collapsible FAQ lists where users can expand questions
 * to see answers, with optional accordion behavior.
 *
 * **Settings Organization**: Group settings into expandable sections with forms
 * and controls contained within each section.
 *
 * **Documentation Navigation**: Create hierarchical documentation structures with
 * expandable sections and nested content.
 *
 * **Project/Content Management**: Display lists of projects, files, or content
 * with expandable details and action buttons.
 *
 * ## Context Integration
 *
 * The component provides context to child BfDsListItem components through
 * BfDsListContext, enabling:
 * - Accordion state management
 * - Item index tracking
 * - Expansion coordination
 * - Event handling coordination
 *
 * ## Accessibility
 *
 * - **Semantic Structure**: Uses proper `<ul>` and `<li>` elements
 * - **ARIA Support**: Provides proper roles and states for interactive elements
 * - **Keyboard Navigation**: Full keyboard support through child components
 * - **Screen Reader Support**: Clear structure and labeling
 *
 * ## Styling
 *
 * Uses CSS classes with the `bfds-list` prefix:
 * - `.bfds-list` - Base list container styles
 * - `.bfds-list--accordion` - Accordion mode modifier
 * - `.bfds-list-header` - Optional header styling
 */
export function BfDsList({
  children,
  className,
  accordion = false,
  header,
  bulkSelect = false,
  onSelectionChange,
  bulkActions,
  initialSelectedValues = [],
}: BfDsListProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [selectedValues, setSelectedValues] = useState<Array<string>>(
    initialSelectedValues,
  );
  const [allSelectableValues, setAllSelectableValues] = useState<Array<string>>(
    [],
  );
  const listRef = useRef<HTMLUListElement>(null);

  // Update selection when initialSelectedValues changes
  useEffect(() => {
    setSelectedValues(initialSelectedValues);
  }, [initialSelectedValues]);

  const listClasses = [
    "bfds-list",
    accordion && "bfds-list--accordion",
    bulkSelect && "bfds-list--bulk-select",
    className,
  ].filter(Boolean).join(" ");

  const getItemIndex = useCallback(
    (ref: React.RefObject<HTMLElement | null>) => {
      if (!ref.current || !listRef.current) return null;

      const listItems = Array.from(listRef.current.children);
      const index = listItems.indexOf(ref.current);
      return index >= 0 ? index : null;
    },
    [],
  );

  const toggleSelection = useCallback((value: string) => {
    setSelectedValues((prev) => {
      const newSelection = prev.includes(value)
        ? prev.filter((v) => v !== value)
        : [...prev, value];
      onSelectionChange?.(newSelection);
      return newSelection;
    });
  }, [onSelectionChange]);

  const selectAll = useCallback(() => {
    setSelectedValues([...allSelectableValues]);
    onSelectionChange?.(allSelectableValues);
  }, [allSelectableValues, onSelectionChange]);

  const clearSelection = useCallback(() => {
    setSelectedValues([]);
    onSelectionChange?.([]);
  }, [onSelectionChange]);

  const registerSelectableValueRef = useRef<
    (value: string) => void | undefined
  >(undefined);
  const unregisterSelectableValueRef = useRef<
    (value: string) => void | undefined
  >(undefined);

  registerSelectableValueRef.current = (value: string) => {
    setAllSelectableValues((prev) => {
      if (!prev.includes(value)) {
        return [...prev, value];
      }
      return prev;
    });
  };

  unregisterSelectableValueRef.current = (value: string) => {
    setAllSelectableValues((prev) => prev.filter((v) => v !== value));
    setSelectedValues((prev) => prev.filter((v) => v !== value));
  };

  const registerSelectableValue = useCallback((value: string) => {
    registerSelectableValueRef.current?.(value);
  }, []);

  const unregisterSelectableValue = useCallback((value: string) => {
    unregisterSelectableValueRef.current?.(value);
  }, []);

  const contextValue: BfDsListContextType = useMemo(() => ({
    accordion,
    expandedIndex,
    setExpandedIndex,
    getItemIndex,
    bulkSelect,
    selectedValues,
    toggleSelection,
    selectAll,
    clearSelection,
    allSelectableValues,
    registerSelectableValue,
    unregisterSelectableValue,
  }), [
    accordion,
    expandedIndex,
    setExpandedIndex,
    getItemIndex,
    bulkSelect,
    selectedValues,
    toggleSelection,
    selectAll,
    clearSelection,
    allSelectableValues,
    registerSelectableValue,
    unregisterSelectableValue,
  ]);

  const isAllSelected = bulkSelect && allSelectableValues.length > 0 &&
    selectedValues.length === allSelectableValues.length;
  const isPartiallySelected = bulkSelect && selectedValues.length > 0 &&
    selectedValues.length < allSelectableValues.length;

  return (
    <BfDsListContext.Provider value={contextValue}>
      <div className="bfds-list-container">
        <ul ref={listRef} className={listClasses}>
          {(header || bulkSelect) && (
            <div className="bfds-list-header-section">
              {header && <h3 className="bfds-list-header">{header}</h3>}
              {bulkSelect && allSelectableValues.length > 0 && (
                <div className="bfds-list-controls-row flexRow gapMedium alignItemsCenter">
                  <div className="bfds-list-select-controls">
                    <BfDsCheckbox
                      checked={isAllSelected}
                      onChange={() => {
                        if (isAllSelected || isPartiallySelected) {
                          clearSelection();
                        } else {
                          selectAll();
                        }
                      }}
                      label={isAllSelected
                        ? "Deselect all"
                        : isPartiallySelected
                        ? `${selectedValues.length} selected`
                        : "Select all"}
                      className="bfds-list-select-all"
                    />
                  </div>
                  {bulkActions && (
                    <div
                      className={`bfds-list-bulk-actions ${
                        selectedValues.length === 0
                          ? "bfds-list-bulk-actions--hidden"
                          : ""
                      }`}
                    >
                      {bulkActions(selectedValues, clearSelection)}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          {children}
        </ul>
      </div>
    </BfDsListContext.Provider>
  );
}

/**
 * React hook for accessing the BfDsList context within list item components.
 *
 * This hook provides access to the list state and controls, allowing child
 * components to coordinate with the parent list container. Must be used within
 * a BfDsList component tree.
 *
 * @returns The list context value, or null if used outside of a BfDsList
 *
 * @example
 * ```tsx
 * // Using list context in a custom component
 * function CustomListItem() {
 *   const listContext = useBfDsList();
 *
 *   if (!listContext) {
 *     // Not inside a BfDsList
 *     return null;
 *   }
 *
 *   const { accordion, expandedIndex, setExpandedIndex } = listContext;
 *
 *   return (
 *     <li>
 *       <div>Mode: {accordion ? "Accordion" : "Independent"}</div>
 *       {expandedIndex !== null && (
 *         <div>Item {expandedIndex} is currently expanded</div>
 *       )}
 *       <button onClick={() => setExpandedIndex(0)}>
 *         Expand First Item
 *       </button>
 *     </li>
 *   );
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Accessing item index in a custom list item
 * function MyListItem() {
 *   const listContext = useBfDsList();
 *   const itemRef = useRef<HTMLLIElement>(null);
 *
 *   if (!listContext) return null;
 *
 *   const { getItemIndex } = listContext;
 *   const myIndex = getItemIndex(itemRef);
 *
 *   return (
 *     <li ref={itemRef}>
 *       I am item #{myIndex}
 *     </li>
 *   );
 * }
 * ```
 *
 * ## Context Properties
 *
 * **accordion**: Boolean indicating if the list is in accordion mode
 * **expandedIndex**: Index of currently expanded item (null if none)
 * **setExpandedIndex**: Function to control which item is expanded
 * **getItemIndex**: Function to get an item's index from its DOM ref
 */
export function useBfDsList() {
  const context = useContext(BfDsListContext);
  return context;
}
