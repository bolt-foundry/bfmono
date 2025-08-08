/**
 * @fileoverview BfDsListBar - A horizontal layout component for displaying structured information with left, center, and right sections. Ideal for list items, cards, and data rows that need consistent alignment and optional interactive behavior.
 * @author Justin Carter <justin@boltfoundry.com>
 * @since 2.0.0
 */
import type * as React from "react";

/**
 * Props for the BfDsListBar component
 */
export type BfDsListBarProps = {
  /** Content for the left section, typically containing titles, names, icons, and primary identifiers */
  left: React.ReactNode;
  /** Optional content for the center section, usually used for descriptions or secondary information */
  center?: React.ReactNode;
  /** Optional content for the right section, commonly used for actions, status indicators, or controls */
  right?: React.ReactNode;
  /** When true, applies active/selected state styling to highlight the current or selected item */
  active?: boolean;
  /** When true, enables hover interactions and makes the entire bar clickable with proper accessibility */
  clickable?: boolean;
  /** Click handler function called when the bar is clicked (requires clickable to be true) */
  onClick?: () => void;
  /** Additional CSS classes to apply to the list bar container for custom styling */
  className?: string;
};

/**
 * A horizontal layout component for displaying structured information with consistent left, center, and right sections.
 * Perfect for creating uniform list items, data rows, and card layouts with optional interactive behavior and proper
 * accessibility support.
 *
 * @example
 * // Simple list bar with only left content
 * <BfDsListBar left={<span>Simple content</span>} />
 *
 * @example
 * // Full layout with all three sections
 * <BfDsListBar
 *   left={<span>Primary Title</span>}
 *   center={<span>Description or details</span>}
 *   right={<span>Actions or status</span>}
 * />
 *
 * @example
 * // Project list with rich content
 * <BfDsListBar
 *   left={
 *     <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
 *       <BfDsIcon name="autoframe" size="small" />
 *       <div>
 *         <div style={{ fontWeight: "600" }}>Website Redesign</div>
 *         <div style={{ fontSize: "13px", color: "var(--bfds-text-secondary)" }}>
 *           Created 2 days ago
 *         </div>
 *       </div>
 *       <BfDsBadge variant="success">Active</BfDsBadge>
 *     </div>
 *   }
 *   center={
 *     <span style={{ color: "var(--bfds-text-secondary)" }}>
 *       Complete redesign of the company website with modern UI
 *     </span>
 *   }
 *   right={
 *     <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
 *       <BfDsPill variant="success" text="92% complete" />
 *       <BfDsButton variant="ghost" size="small" icon="settings" iconOnly />
 *     </div>
 *   }
 * />
 *
 * @example
 * // Clickable bar with active state
 * <BfDsListBar
 *   left={<span>Clickable Item</span>}
 *   center={<span>This bar responds to clicks</span>}
 *   active={isSelected}
 *   clickable
 *   onClick={() => handleItemClick()}
 * />
 *
 * @example
 * // User management interface
 * <BfDsListBar
 *   left={
 *     <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
 *       <div className="avatar">JD</div>
 *       <div>
 *         <div style={{ fontWeight: "600" }}>John Doe</div>
 *         <div style={{ fontSize: "13px", color: "var(--bfds-text-secondary)" }}>
 *           john@example.com
 *         </div>
 *       </div>
 *     </div>
 *   }
 *   center={
 *     <div>
 *       <BfDsPill variant="default" text="Admin" />
 *       <span style={{ marginLeft: "8px", color: "var(--bfds-text-secondary)" }}>
 *         Last active 2 hours ago
 *       </span>
 *     </div>
 *   }
 *   right={
 *     <div style={{ display: "flex", gap: "8px" }}>
 *       <BfDsButton variant="outline" size="small">Edit</BfDsButton>
 *       <BfDsButton variant="ghost" size="small" icon="moreHorizontal" iconOnly />
 *     </div>
 *   }
 * />
 *
 * @example
 * // API endpoint documentation
 * <BfDsListBar
 *   left={
 *     <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
 *       <BfDsBadge variant="success">GET</BfDsBadge>
 *       <code>/api/users/{id}</code>
 *     </div>
 *   }
 *   center={
 *     <span style={{ color: "var(--bfds-text-secondary)" }}>
 *       Retrieve a specific user by ID
 *     </span>
 *   }
 *   right={
 *     <div style={{ display: "flex", gap: "8px" }}>
 *       <BfDsButton variant="ghost" size="small">Test</BfDsButton>
 *       <BfDsCopyButton textToCopy="/api/users/{id}" size="small" />
 *     </div>
 *   }
 *   clickable
 *   onClick={() => openEndpointDocs()}
 * />
 *
 * @example
 * // File browser interface
 * <BfDsListBar
 *   left={
 *     <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
 *       <BfDsIcon name="fileText" size="small" />
 *       <div>
 *         <div style={{ fontWeight: "500" }}>document.pdf</div>
 *         <div style={{ fontSize: "13px", color: "var(--bfds-text-secondary)" }}>
 *           2.4 MB • Modified 3 hours ago
 *         </div>
 *       </div>
 *     </div>
 *   }
 *   right={
 *     <div style={{ display: "flex", gap: "8px" }}>
 *       <BfDsButton variant="ghost" size="small" icon="download" iconOnly />
 *       <BfDsButton variant="ghost" size="small" icon="share" iconOnly />
 *       <BfDsButton variant="ghost" size="small" icon="moreVertical" iconOnly />
 *     </div>
 *   }
 *   clickable
 *   onClick={() => openFile()}
 * />
 *
 * @example
 * // Data table rows with consistent layout
 * {items.map((item) => (
 *   <BfDsListBar
 *     key={item.id}
 *     left={
 *       <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
 *         <BfDsIcon name={item.icon} size="small" />
 *         <span style={{ fontWeight: "600" }}>{item.name}</span>
 *         <BfDsBadge
 *           variant={item.status === "active" ? "success" : "default"}
 *         >
 *           {item.status}
 *         </BfDsBadge>
 *       </div>
 *     }
 *     center={
 *       <span style={{ color: "var(--bfds-text-secondary)" }}>
 *         {item.description}
 *       </span>
 *     }
 *     right={
 *       <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
 *         <BfDsPill
 *           variant={item.score >= 90 ? "success" : "warning"}
 *           text={`${item.score}% accuracy`}
 *         />
 *         <BfDsButton variant="ghost" size="small" icon="settings" iconOnly />
 *       </div>
 *     }
 *     clickable
 *     onClick={() => handleItemClick(item)}
 *   />
 * ))}
 *
 * @param props - The list bar props
 * @param props.left - Content for the left section (required)
 * @param props.center - Optional content for the center section
 * @param props.right - Optional content for the right section
 * @param props.active - Apply active/selected styling (default: false)
 * @param props.clickable - Enable click interactions (default: false)
 * @param props.onClick - Click handler function
 * @param props.className - Additional CSS classes
 * @returns A horizontal layout bar with three content sections
 *
 * @accessibility
 * - Uses appropriate ARIA roles when interactive (role="button")
 * - Supports keyboard navigation (Enter/Space keys)
 * - Clear focus indicators for clickable bars
 * - Proper tab order integration
 * - Screen reader friendly structure
 */
export function BfDsListBar({
  left,
  center,
  right,
  active = false,
  clickable = false,
  onClick,
  className,
}: BfDsListBarProps) {
  const barClasses = [
    "bfds-list-bar",
    active && "bfds-list-bar--active",
    clickable && "bfds-list-bar--clickable",
    className,
  ].filter(Boolean).join(" ");

  const handleClick = (_e: React.MouseEvent) => {
    if (onClick) {
      onClick();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (onClick && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <div
      className={barClasses}
      onClick={clickable ? handleClick : undefined}
      onKeyDown={clickable ? handleKeyDown : undefined}
      tabIndex={clickable ? 0 : undefined}
      role={clickable ? "button" : undefined}
    >
      <div className="bfds-list-bar__left">
        {left}
      </div>
      {center && (
        <div className="bfds-list-bar__center">
          {center}
        </div>
      )}
      {right && (
        <div className="bfds-list-bar__right">
          {right}
        </div>
      )}
    </div>
  );
}
