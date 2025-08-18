/**
 * @fileoverview BfDsBadge - A versatile badge component for displaying status indicators, labels, tags, and other contextual information with support for various visual styles and interactive behaviors.
 * @author Justin Carter <justin@boltfoundry.com>
 * @since 2.0.0
 */
import type * as React from "react";
import type { ReactNode } from "react";
import { BfDsIcon, type BfDsIconName } from "./BfDsIcon.tsx";

export type BfDsBadgeVariant =
  | "default"
  | "primary"
  | "secondary"
  | "success"
  | "warning"
  | "error"
  | "info";

export type BfDsBadgeSize = "small" | "medium" | "large";

/**
 * Props for the BfDsBadge component
 */
export type BfDsBadgeProps = {
  /** Content inside the badge. Can be text, numbers, or any React nodes */
  children: ReactNode;
  /** Visual variant that determines the color scheme and meaning of the badge. Each variant corresponds to different semantic meanings */
  variant?: BfDsBadgeVariant;
  /** Size of the badge affecting text size, padding, and overall dimensions */
  size?: BfDsBadgeSize;
  /** Icon name from the BfDs icon set to display before the text content. Provides additional visual context */
  icon?: BfDsIconName;
  /** Whether the badge should use outlined styling instead of filled. Creates a lighter, bordered appearance */
  outlined?: boolean;
  /** Whether the badge should be rendered with rounded corners (pill shape) for a more modern look */
  rounded?: boolean;
  /** Whether the badge should be rendered as a small colored dot indicator instead of text */
  dot?: boolean;
  /** Whether the badge is clickable. When true, adds hover states, focus indicators, and keyboard navigation */
  clickable?: boolean;
  /** Click handler function for clickable badges. Only called when clickable is true */
  onClick?: () => void;
  /** Whether the badge includes a remove button. Useful for dismissible tags and filters */
  removable?: boolean;
  /** Handler function called when the remove button is clicked. Receives no parameters */
  onRemove?: () => void;
  /** Additional CSS classes to apply to the badge for custom styling */
  className?: string;
} & Omit<React.HTMLAttributes<HTMLSpanElement>, "onClick">;

/**
 * A versatile badge component for displaying status indicators, labels, tags, and other contextual information.
 * Supports multiple visual variants, sizes, icons, interactive behaviors, and customization options.
 *
 * @example
 * // Basic badge
 * <BfDsBadge>Default Badge</BfDsBadge>
 *
 * @example
 * // Status indicators with icons
 * <BfDsBadge variant="success" icon="checkCircle">
 *   Approved
 * </BfDsBadge>
 * <BfDsBadge variant="error" icon="exclamationStop">
 *   Failed
 * </BfDsBadge>
 *
 * @example
 * // Different sizes and variants
 * <BfDsBadge size="small" variant="primary">Small</BfDsBadge>
 * <BfDsBadge size="medium" variant="secondary">Medium</BfDsBadge>
 * <BfDsBadge size="large" variant="info">Large</BfDsBadge>
 *
 * @example
 * // Outlined style for subtle appearance
 * <BfDsBadge variant="primary" outlined>Outlined Primary</BfDsBadge>
 * <BfDsBadge variant="success" outlined>Outlined Success</BfDsBadge>
 *
 * @example
 * // Rounded pills for modern look
 * <BfDsBadge variant="primary" rounded>Beta</BfDsBadge>
 * <BfDsBadge variant="success" rounded icon="checkCircle">Live</BfDsBadge>
 *
 * @example
 * // Clickable badges with interaction
 * <BfDsBadge
 *   variant="primary"
 *   clickable
 *   onClick={() => console.log('Badge clicked')}
 * >
 *   Click me
 * </BfDsBadge>
 *
 * @example
 * // Removable tags for filtering
 * <BfDsBadge
 *   variant="default"
 *   removable
 *   onRemove={() => console.log('Badge removed')}
 * >
 *   Removable Tag
 * </BfDsBadge>
 *
 * @example
 * // Counter badges for notifications
 * <BfDsBadge variant="error" size="small" rounded>12</BfDsBadge>
 *
 * @example
 * // Dot indicators for compact spaces
 * <BfDsBadge variant="success" dot>Most Popular</BfDsBadge>
 * <BfDsBadge variant="secondary" dot>Coming Soon</BfDsBadge>
 *
 * @example
 * // Environment labels
 * <BfDsBadge variant="success" rounded outlined>Production</BfDsBadge>
 * <BfDsBadge variant="warning" rounded outlined>Staging</BfDsBadge>
 * <BfDsBadge variant="info" rounded outlined>Development</BfDsBadge>
 *
 * @example
 * // Priority levels with icons
 * <BfDsBadge variant="error" icon="exclamationTriangle">High Priority</BfDsBadge>
 * <BfDsBadge variant="warning" icon="exclamationCircle">Medium Priority</BfDsBadge>
 * <BfDsBadge variant="success" icon="checkCircle">Low Priority</BfDsBadge>
 *
 * @example
 * // Tag management system
 * const [tags, setTags] = useState(["React", "TypeScript", "Design System"]);
 *
 * return (
 *   <div className="tag-list">
 *     {tags.map((tag) => (
 *       <BfDsBadge
 *         key={tag}
 *         variant="primary"
 *         removable
 *         onRemove={() => removeTag(tag)}
 *       >
 *         {tag}
 *       </BfDsBadge>
 *     ))}
 *   </div>
 * );
 *
 * @param props - The badge props
 * @param props.children - Content to display inside the badge
 * @param props.variant - Visual variant determining color and meaning (default: "default")
 * @param props.size - Size of the badge (default: "medium")
 * @param props.icon - Optional icon to display before text
 * @param props.outlined - Use outlined style instead of filled (default: false)
 * @param props.rounded - Use rounded/pill shape (default: false)
 * @param props.clickable - Make the badge clickable (default: false)
 * @param props.onClick - Click handler for clickable badges
 * @param props.removable - Include a remove button (default: false)
 * @param props.onRemove - Handler for remove button
 * @param props.className - Additional CSS classes
 * @returns A badge component with the specified styling and behavior
 *
 * @accessibility
 * - Supports keyboard navigation when clickable (Enter/Space keys)
 * - Includes proper ARIA roles and attributes for interactive elements
 * - Remove button has descriptive aria-label
 * - Focus indicators for clickable badges
 * - Color variants use sufficient contrast ratios
 */
export function BfDsBadge({
  children,
  variant = "default",
  size = "medium",
  icon,
  outlined = false,
  rounded = false,
  dot = false,
  clickable = false,
  onClick,
  removable = false,
  onRemove,
  className,
  ...props
}: BfDsBadgeProps) {
  const classes = [
    "bfds-badge",
    `bfds-badge--${variant}`,
    `bfds-badge--${size}`,
    outlined && "bfds-badge--outlined",
    rounded && "bfds-badge--rounded",
    dot && "bfds-badge--dot",
    clickable && "bfds-badge--clickable",
    removable && "bfds-badge--removable",
    className,
  ].filter(Boolean).join(" ");

  const handleClick = (_e: React.MouseEvent<HTMLSpanElement>) => {
    if (clickable && onClick) {
      onClick();
    }
  };

  const handleRemoveClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (onRemove) {
      onRemove();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLSpanElement>) => {
    if (clickable && onClick && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      onClick();
    }
  };

  const iconSize = size === "small"
    ? "small"
    : size === "large"
    ? "medium"
    : "small";

  if (dot) {
    return (
      <span
        {...props}
        className={classes}
        onClick={clickable ? handleClick : undefined}
        onKeyDown={clickable ? handleKeyDown : undefined}
        tabIndex={clickable ? 0 : undefined}
        role={clickable ? "button" : undefined}
        title={typeof children === "string" ? children : undefined}
        style={props.style}
      />
    );
  }

  return (
    <span
      {...props}
      className={classes}
      onClick={clickable ? handleClick : undefined}
      onKeyDown={clickable ? handleKeyDown : undefined}
      tabIndex={clickable ? 0 : undefined}
      role={clickable ? "button" : undefined}
    >
      {icon && (
        <BfDsIcon
          name={icon}
          size={iconSize}
          className="bfds-badge__icon"
        />
      )}

      <span className="bfds-badge__content">
        {children}
      </span>

      {removable && (
        <button
          type="button"
          className="bfds-badge__remove"
          onClick={handleRemoveClick}
          aria-label="Remove badge"
          tabIndex={-1}
        >
          <BfDsIcon
            name="cross"
            size="xsmall"
          />
        </button>
      )}
    </span>
  );
}
