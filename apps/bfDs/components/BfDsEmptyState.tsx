/**
 * @fileoverview BfDsEmptyState - Empty state component with icon, title, and action button
 * @author Justin Carter <justin@boltfoundry.com>
 * @since 2.0.0
 */
import type { ReactNode } from "react";
import { BfDsIcon, type BfDsIconName } from "./BfDsIcon.tsx";
import { BfDsButton } from "./BfDsButton.tsx";

export interface BfDsEmptyStateProps {
  /**
   * The icon to display
   */
  icon?: BfDsIconName;

  /**
   * The main title text
   */
  title: string;

  /**
   * Optional description text
   */
  description?: string;

  /**
   * Optional action button configuration
   */
  action?: {
    label: string;
    onClick: () => void;
    variant?: "primary" | "secondary" | "outline";
  };

  /**
   * Optional secondary action button
   */
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };

  /**
   * Size variant of the empty state
   * @default "medium"
   */
  size?: "small" | "medium" | "large";

  /**
   * Additional content to display below the description
   */
  children?: ReactNode;

  /**
   * Additional CSS class name
   */
  className?: string;
}

/**
 * Empty state component for displaying when there's no data or content
 *
 * @example
 * ```tsx
 * <BfDsEmptyState
 *   icon="folder"
 *   title="No decks yet"
 *   description="Create your first evaluation deck to get started"
 *   action={{
 *     label: "Create Deck",
 *     onClick: handleCreateDeck,
 *     variant: "primary"
 *   }}
 * />
 * ```
 */
export function BfDsEmptyState({
  icon,
  title,
  description,
  action,
  secondaryAction,
  size = "medium",
  children,
  className = "",
}: BfDsEmptyStateProps) {
  const classes = [
    "bfds-empty-state",
    `bfds-empty-state--${size}`,
    className,
  ].filter(Boolean).join(" ");

  return (
    <div className={classes}>
      {icon && (
        <div className="bfds-empty-state__icon">
          <BfDsIcon
            name={icon}
            size={size === "large"
              ? "xlarge"
              : size === "small"
              ? "medium"
              : "large"}
          />
        </div>
      )}

      <h3 className="bfds-empty-state__title">{title}</h3>

      {description && (
        <p className="bfds-empty-state__description">{description}</p>
      )}

      {children && (
        <div className="bfds-empty-state__content">
          {children}
        </div>
      )}

      {(action || secondaryAction) && (
        <div className="bfds-empty-state__actions">
          {action && (
            <BfDsButton
              variant={action.variant || "primary"}
              onClick={action.onClick}
              size={size === "large" ? "large" : "medium"}
            >
              {action.label}
            </BfDsButton>
          )}
          {secondaryAction && (
            <BfDsButton
              variant="outline"
              onClick={secondaryAction.onClick}
              size={size === "large" ? "large" : "medium"}
            >
              {secondaryAction.label}
            </BfDsButton>
          )}
        </div>
      )}
    </div>
  );
}
