/**
 * @fileoverview BfDsPill - A compact pill-shaped component for displaying labels, tags, counts, and status indicators. Features multiple color variants, optional icons, and action elements for versatile content labeling.
 * @author Justin Carter <justin@boltfoundry.com>
 * @since 2.0.0
 */
import type * as React from "react";
import { BfDsIcon, type BfDsIconName } from "./BfDsIcon.tsx";

export type BfDsPillVariant =
  | "primary"
  | "secondary"
  | "success"
  | "error"
  | "warning"
  | "info";

/**
 * Props for the BfDsPill component
 */
export type BfDsPillProps = {
  /** Optional label text that appears as a prefix to the main content, useful for categorizing */
  label?: string;
  /** Main content text or number to display in the pill body */
  text?: string | number;
  /** Icon name from the BfDs icon set to display alongside the content */
  icon?: BfDsIconName;
  /** Visual variant that determines the color scheme and styling of the pill */
  variant?: BfDsPillVariant;
  /** Additional interactive element such as a remove button or action control */
  action?: React.ReactNode;
  /** Additional CSS classes to apply to the pill container */
  className?: string;
};

/**
 * A compact pill-shaped component for displaying labels, tags, counts, and status indicators.
 * Supports multiple color variants, optional icons, and action elements, making it perfect for
 * categorization, metrics display, and interactive content labeling.
 *
 * @example
 * // Simple text pill
 * <BfDsPill text="New" />
 *
 * @example
 * // Pill with label for categorization
 * <BfDsPill label="Status" text="Active" />
 *
 * @example
 * // Count or number display
 * <BfDsPill text={42} variant="primary" />
 *
 * @example
 * // Icon-only pill for status indicators
 * <BfDsPill icon="checkCircle" variant="success" />
 *
 * @example
 * // All color variants
 * <BfDsPill text="Primary" variant="primary" />
 * <BfDsPill text="Secondary" variant="secondary" />
 * <BfDsPill text="Success" variant="success" />
 * <BfDsPill text="Error" variant="error" />
 * <BfDsPill text="Warning" variant="warning" />
 * <BfDsPill text="Info" variant="info" />
 *
 * @example
 * // Pills with icons for enhanced meaning
 * <BfDsPill icon="star" variant="warning" />
 * <BfDsPill icon="checkCircle" text="Verified" variant="success" />
 * <BfDsPill icon="alertTriangle" text="Warning" variant="warning" />
 *
 * @example
 * // Label and content combinations
 * <BfDsPill label="Version" text="v2.1.0" />
 * <BfDsPill label="Priority" text="High" variant="error" />
 * <BfDsPill label="Category" text="Design" variant="info" />
 *
 * @example
 * // With action buttons for removable tags
 * <BfDsPill
 *   label="Filter"
 *   text="JavaScript"
 *   action={<BfDsButton size="small" variant="ghost" icon="cross" iconOnly />}
 * />
 *
 * @example
 * // Status indicators with icons and colors
 * <div className="status-pills">
 *   <BfDsPill text="Online" variant="success" icon="circle" />
 *   <BfDsPill text="Offline" variant="error" icon="circle" />
 *   <BfDsPill text="Pending" variant="warning" icon="clock" />
 *   <BfDsPill text="Processing" variant="info" icon="refresh" />
 * </div>
 *
 * @example
 * // Notification badges and counters
 * <div className="nav-item">
 *   <span>Messages</span>
 *   <BfDsPill text={12} variant="error" />
 * </div>
 * <div className="nav-item">
 *   <span>Notifications</span>
 *   <BfDsPill text="New" variant="primary" />
 * </div>
 *
 * @example
 * // Content categorization and tagging
 * <div className="content-tags">
 *   <BfDsPill text="React" variant="info" />
 *   <BfDsPill text="TypeScript" variant="info" />
 *   <BfDsPill text="Design System" variant="info" />
 * </div>
 *
 * @example
 * // User roles and permissions
 * <div className="user-roles">
 *   <BfDsPill text="Admin" variant="error" icon="shield" />
 *   <BfDsPill text="Premium" variant="warning" icon="star" />
 * </div>
 *
 * @example
 * // Dynamic filter system with removable tags
 * const [activeFilters, setActiveFilters] = useState(["JavaScript", "React"]);
 *
 * <div className="filter-pills">
 *   {activeFilters.map((filter) => (
 *     <BfDsPill
 *       key={filter}
 *       text={filter}
 *       variant="primary"
 *       action={
 *         <button
 *           onClick={() => removeFilter(filter)}
 *           className="remove-filter"
 *         >
 *           ×
 *         </button>
 *       }
 *     />
 *   ))}
 * </div>
 *
 * @example
 * // Product and pricing labels
 * <div className="product-badges">
 *   <BfDsPill text="Sale" variant="error" />
 *   <BfDsPill text="Free Shipping" variant="success" />
 *   <BfDsPill text="Limited Edition" variant="warning" />
 * </div>
 *
 * @example
 * // System information and metrics
 * <div className="metrics-dashboard">
 *   <BfDsPill label="Uptime" text="99.9%" variant="success" />
 *   <BfDsPill label="Load Time" text="1.2s" variant="info" />
 *   <BfDsPill label="Users" text="1,234" variant="primary" />
 *   <BfDsPill label="Errors" text={3} variant="warning" />
 * </div>
 *
 * @example
 * // Interactive tag selector
 * const [selectedTags, setSelectedTags] = useState([]);
 *
 * const toggleTag = (tag) => {
 *   setSelectedTags((prev) =>
 *     prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
 *   );
 * };
 *
 * <div className="tag-selector">
 *   {availableTags.map((tag) => (
 *     <button
 *       key={tag}
 *       onClick={() => toggleTag(tag)}
 *       className="tag-button"
 *     >
 *       <BfDsPill
 *         text={tag}
 *         variant={selectedTags.includes(tag) ? "primary" : "secondary"}
 *         icon={selectedTags.includes(tag) ? "checkCircle" : undefined}
 *       />
 *     </button>
 *   ))}
 * </div>
 *
 * @example
 * // Progress and completion indicators
 * <BfDsPill label="Progress" text="78%" variant="success" />
 * <BfDsPill label="Tasks" text="12/15" variant="info" />
 * <BfDsPill label="Score" text="95" variant="success" />
 *
 * @param props - The pill props
 * @param props.label - Optional prefix label text
 * @param props.text - Main content text or number
 * @param props.icon - Optional icon name
 * @param props.variant - Color variant (default: "secondary")
 * @param props.action - Optional action element
 * @param props.className - Additional CSS classes
 * @returns A pill component with the specified content and styling
 *
 * @accessibility
 * - Uses meaningful text content that doesn't rely solely on color
 * - Ensures sufficient contrast ratios across all variants
 * - Action elements maintain proper focus handling
 * - Icons complement rather than replace text content
 * - Screen reader compatible with semantic HTML structure
 */
export function BfDsPill({
  label,
  text,
  icon,
  variant = "secondary",
  action,
  className,
}: BfDsPillProps) {
  const classes = [
    "bfds-pill",
    `bfds-pill--${variant}`,
    !text && !icon && !action && "bfds-pill--label-only",
    className,
  ].filter(Boolean).join(" ");

  const labelClasses = [
    "bfds-pill__label",
    !text && !icon && !action && "bfds-pill__label--no-content",
  ].filter(Boolean).join(" ");

  return (
    <div className={classes}>
      {label && (
        <div className={labelClasses}>
          {label}
        </div>
      )}
      {(text || icon || action) && (
        <div className="bfds-pill__content">
          {text}
          {icon && <BfDsIcon name={icon} size="small" />}
          {action}
        </div>
      )}
    </div>
  );
}
