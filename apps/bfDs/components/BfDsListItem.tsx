/**
 * @fileoverview BfDsListItem - An individual item component for use within BfDsList containers. Supports various states, click interactions, expandable content, and automatic integration into list context.
 * @author Justin Carter <justin@boltfoundry.com>
 * @since 2.0.0
 */
import type * as React from "react";
import { useEffect, useRef, useState } from "react";
import { BfDsIcon } from "./BfDsIcon.tsx";
import { useBfDsList } from "./BfDsList.tsx";

/**
 * Props for the BfDsListItem component
 */
export type BfDsListItemProps = {
  /** Content to display in the main area of the list item */
  children: React.ReactNode;
  /** When true, applies active/selected state styling to highlight the current item */
  active?: boolean;
  /** When true, disables all interactions and applies disabled styling */
  disabled?: boolean;
  /** Click handler for the main item content. When provided, makes the item clickable */
  onClick?: () => void;
  /** Additional CSS classes to apply to the list item */
  className?: string;
  /** Content to display in the expandable section. When provided, makes the item expandable with toggle functionality */
  expandContents?: React.ReactNode;
};

/**
 * An individual item component for use within BfDsList containers. Supports various interactive states,
 * click handlers, expandable content, and automatically integrates with parent list context for features
 * like accordion mode. Provides consistent styling and accessibility features.
 *
 * @example
 * // Basic list items
 * <BfDsList>
 *   <BfDsListItem>Home</BfDsListItem>
 *   <BfDsListItem>About</BfDsListItem>
 *   <BfDsListItem>Contact</BfDsListItem>
 * </BfDsList>
 *
 * @example
 * // With active and disabled states
 * <BfDsList>
 *   <BfDsListItem active>Currently Selected</BfDsListItem>
 *   <BfDsListItem>Regular Item</BfDsListItem>
 *   <BfDsListItem disabled>Disabled Item</BfDsListItem>
 * </BfDsList>
 *
 * @example
 * // Clickable navigation items
 * <BfDsList>
 *   <BfDsListItem onClick={() => navigateTo("/dashboard")}>
 *     Dashboard
 *   </BfDsListItem>
 *   <BfDsListItem onClick={() => navigateTo("/projects")}>
 *     Projects
 *   </BfDsListItem>
 *   <BfDsListItem onClick={() => navigateTo("/settings")}>
 *     Settings
 *   </BfDsListItem>
 * </BfDsList>
 *
 * @example
 * // Navigation with active state management
 * const [currentPage, setCurrentPage] = useState("dashboard");
 *
 * <BfDsList>
 *   <BfDsListItem
 *     active={currentPage === "dashboard"}
 *     onClick={() => setCurrentPage("dashboard")}
 *   >
 *     Dashboard
 *   </BfDsListItem>
 *   <BfDsListItem
 *     active={currentPage === "projects"}
 *     onClick={() => setCurrentPage("projects")}
 *   >
 *     Projects
 *   </BfDsListItem>
 * </BfDsList>
 *
 * @example
 * // Expandable items with detailed content
 * <BfDsList>
 *   <BfDsListItem
 *     expandContents={
 *       <div style={{ padding: "12px" }}>
 *         <p>This is expandable content for item 1.</p>
 *         <BfDsButton variant="outline" size="small">Action Button</BfDsButton>
 *       </div>
 *     }
 *   >
 *     Expandable Item 1
 *   </BfDsListItem>
 *   <BfDsListItem
 *     expandContents={
 *       <div style={{ padding: "12px" }}>
 *         <h4>Features</h4>
 *         <ul>
 *           <li>Feature A</li>
 *           <li>Feature B</li>
 *           <li>Feature C</li>
 *         </ul>
 *       </div>
 *     }
 *   >
 *     Expandable Item 2
 *   </BfDsListItem>
 * </BfDsList>
 *
 * @example
 * // Accordion mode (only one item expands at a time)
 * <BfDsList accordion>
 *   <BfDsListItem
 *     expandContents={
 *       <div style={{ padding: "12px" }}>
 *         <h4>Section 1 Details</h4>
 *         <p>Opening this section will close others automatically.</p>
 *       </div>
 *     }
 *   >
 *     Section 1
 *   </BfDsListItem>
 *   <BfDsListItem
 *     expandContents={
 *       <div style={{ padding: "12px" }}>
 *         <h4>Section 2 Details</h4>
 *         <p>This section will close Section 1 when opened.</p>
 *       </div>
 *     }
 *   >
 *     Section 2
 *   </BfDsListItem>
 * </BfDsList>
 *
 * @example
 * // Combined click action and expand functionality
 * <BfDsList>
 *   <BfDsListItem
 *     onClick={() => console.log('Main action triggered')}
 *     expandContents={
 *       <div style={{ padding: "12px" }}>
 *         <p>Additional project details...</p>
 *         <div style={{ display: "flex", gap: "8px" }}>
 *           <BfDsButton variant="outline" size="small">Edit</BfDsButton>
 *           <BfDsButton variant="outline" size="small">Delete</BfDsButton>
 *         </div>
 *       </div>
 *     }
 *   >
 *     Project Alpha (Click for main action, expand for details)
 *   </BfDsListItem>
 * </BfDsList>
 *
 * @example
 * // FAQ section with accordion behavior
 * <BfDsList accordion>
 *   <BfDsListItem
 *     expandContents={
 *       <div style={{ padding: "16px", backgroundColor: "#f8f9fa" }}>
 *         <p><strong>Answer:</strong> You can reset your password by clicking the "Forgot Password" link.</p>
 *         <BfDsButton variant="outline" size="small">
 *           Go to Password Reset
 *         </BfDsButton>
 *       </div>
 *     }
 *   >
 *     How do I reset my password?
 *   </BfDsListItem>
 *   <BfDsListItem
 *     expandContents={
 *       <div style={{ padding: "16px", backgroundColor: "#f8f9fa" }}>
 *         <p><strong>Answer:</strong> You can contact support through:</p>
 *         <ul>
 *           <li>Email: support@example.com</li>
 *           <li>Phone: 1-800-SUPPORT</li>
 *           <li>Live chat (bottom right corner)</li>
 *         </ul>
 *       </div>
 *     }
 *   >
 *     How can I contact support?
 *   </BfDsListItem>
 * </BfDsList>
 *
 * @example
 * // Settings categories with forms in expanded content
 * <BfDsList accordion>
 *   <BfDsListItem
 *     expandContents={
 *       <div style={{ padding: "16px" }}>
 *         <BfDsInput label="Display Name" />
 *         <BfDsInput label="Email" type="email" />
 *         <BfDsTextArea label="Bio" />
 *         <BfDsButton variant="primary">Save Profile</BfDsButton>
 *       </div>
 *     }
 *   >
 *     Profile Settings
 *   </BfDsListItem>
 *   <BfDsListItem
 *     expandContents={
 *       <div style={{ padding: "16px" }}>
 *         <BfDsCheckbox label="Email notifications" />
 *         <BfDsCheckbox label="Push notifications" />
 *         <BfDsCheckbox label="SMS alerts" />
 *         <BfDsButton variant="primary">Save Preferences</BfDsButton>
 *       </div>
 *     }
 *   >
 *     Notification Preferences
 *   </BfDsListItem>
 * </BfDsList>
 *
 * @example
 * // Dynamic list with state management
 * const navigationItems = [
 *   { id: "home", label: "Home", path: "/" },
 *   { id: "about", label: "About", path: "/about" },
 *   { id: "services", label: "Services", path: "/services" },
 *   { id: "contact", label: "Contact", path: "/contact" },
 * ];
 *
 * <BfDsList>
 *   {navigationItems.map((item) => (
 *     <BfDsListItem
 *       key={item.id}
 *       active={currentPath === item.path}
 *       onClick={() => navigateTo(item.path)}
 *     >
 *       {item.label}
 *     </BfDsListItem>
 *   ))}
 * </BfDsList>
 *
 * @example
 * // Action list with icons and styling
 * <BfDsList>
 *   <BfDsListItem onClick={() => handleAction("save")}>
 *     💾 Save Changes
 *   </BfDsListItem>
 *   <BfDsListItem onClick={() => handleAction("export")}>
 *     📁 Export Data
 *   </BfDsListItem>
 *   <BfDsListItem
 *     onClick={() => handleAction("delete")}
 *     style={{ color: "var(--bfds-danger)" }}
 *   >
 *     🗑️ Delete Project
 *   </BfDsListItem>
 * </BfDsList>
 *
 * @param props - The list item props
 * @param props.children - Content to display in the main item area
 * @param props.active - Apply active/selected styling (default: false)
 * @param props.disabled - Disable all interactions (default: false)
 * @param props.onClick - Click handler for main content
 * @param props.className - Additional CSS classes
 * @param props.expandContents - Content for expandable section
 * @returns A list item with optional interactive and expansion capabilities
 *
 * @accessibility
 * - Uses semantic HTML with proper li and button elements
 * - Supports full keyboard navigation (Tab, Enter, Space, Arrow keys)
 * - Includes proper ARIA attributes for expandable content
 * - Provides clear focus indicators for interactive elements
 * - Screen reader compatible with proper semantic structure
 * - Expansion state is properly announced to assistive technologies
 */
export function BfDsListItem({
  children,
  active = false,
  disabled = false,
  onClick,
  className,
  expandContents,
}: BfDsListItemProps) {
  const [localIsExpanded, setLocalIsExpanded] = useState(false);
  const listContext = useBfDsList();
  const itemRef = useRef<HTMLLIElement>(null);
  const [listIndex, setListIndex] = useState<number | null>(null);
  const isExpandable = !!expandContents;

  // Get the item index from the list context after mounting
  useEffect(() => {
    if (listContext && itemRef.current) {
      const index = listContext.getItemIndex(itemRef);
      setListIndex(index);
    }
  }, [listContext]);

  // Use accordion state if available, otherwise use local state
  const isExpanded = listContext?.accordion && typeof listIndex === "number"
    ? listContext.expandedIndex === listIndex
    : localIsExpanded;

  const itemClasses = [
    "bfds-list-item",
    active && "bfds-list-item--active",
    disabled && "bfds-list-item--disabled",
    (onClick || isExpandable) && !disabled && "bfds-list-item--clickable",
    isExpandable && "bfds-list-item--expandable",
    isExpanded && "bfds-list-item--expanded",
    onClick && isExpandable && "bfds-list-item--has-separate-expand",
    className,
  ].filter(Boolean).join(" ");

  const handleExpandClick = () => {
    if (disabled) return;

    if (listContext?.accordion && typeof listIndex === "number") {
      // Accordion mode: toggle via context
      listContext.setExpandedIndex(isExpanded ? null : listIndex);
    } else {
      // Independent mode: toggle local state
      setLocalIsExpanded(!localIsExpanded);
    }
  };

  const handleMainClick = () => {
    if (disabled) return;
    if (onClick) {
      onClick();
    }
  };

  const mainContent = (
    <div className="bfds-list-item__content">
      <div className="bfds-list-item__main">
        {children}
      </div>
      {isExpandable && (
        <div className="bfds-list-item__icon">
          <BfDsIcon
            name={isExpanded ? "arrowDown" : "arrowLeft"}
            size="small"
          />
        </div>
      )}
    </div>
  );

  const expandedContent = isExpandable && isExpanded && expandContents && (
    <div className="bfds-list-item__expanded-content">
      {expandContents}
    </div>
  );

  // For expandable items, we need a wrapper li to contain both the button and expanded content
  if (isExpandable) {
    return (
      <li ref={itemRef} className={itemClasses}>
        <button
          type="button"
          className="bfds-list-item__button"
          onClick={onClick ? handleMainClick : handleExpandClick}
          disabled={disabled}
        >
          {onClick
            ? (
              // If there's an onClick, show content without expand icon since expansion will be via separate trigger
              <div className="bfds-list-item__content">
                <div className="bfds-list-item__main">
                  {children}
                </div>
              </div>
            )
            : mainContent}
        </button>
        {onClick && (
          // Separate expand button when there's also an onClick
          <button
            type="button"
            className="bfds-list-item__expand-button"
            onClick={handleExpandClick}
            disabled={disabled}
            aria-label={isExpanded ? "Collapse" : "Expand"}
          >
            <BfDsIcon
              name={isExpanded ? "arrowDown" : "arrowLeft"}
              size="small"
            />
          </button>
        )}
        {expandedContent}
      </li>
    );
  }

  // For non-expandable items, always render as li with optional button child
  return (
    <li ref={itemRef} className={itemClasses}>
      {onClick && !disabled
        ? (
          <button
            type="button"
            className="bfds-list-item__button"
            onClick={handleMainClick}
            disabled={disabled}
          >
            {mainContent}
          </button>
        )
        : mainContent}
    </li>
  );
}
