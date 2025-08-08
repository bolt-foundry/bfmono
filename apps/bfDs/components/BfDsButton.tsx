/**
 * @fileoverview BfDsButton - Versatile button component with multiple variants, sizes, and interactive states
 * @author Justin Carter <justin@boltfoundry.com>
 * @since 2.0.0
 */
import type * as React from "react";
import { BfDsIcon, type BfDsIconName } from "./BfDsIcon.tsx";
import { BfDsSpinner } from "./BfDsSpinner.tsx";

/**
 * Button size variants that provide visual hierarchy.
 * - `small` - Compact buttons for toolbars or secondary actions
 * - `medium` - Standard size for most buttons (default)
 * - `large` - Prominent buttons for primary actions
 */
export type BfDsButtonSize = "small" | "medium" | "large";

/**
 * Button visual style variants for different use cases.
 * - `primary` - Main call-to-action buttons (save, submit, confirm)
 * - `secondary` - Secondary actions (cancel, close)
 * - `outline` - Less prominent actions with clear boundaries
 * - `outline-secondary` - Subtle outlined buttons
 * - `ghost` - Minimal buttons that blend into the background
 * - `ghost-primary` - Ghost style with primary coloring
 */
export type BfDsButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "outline-secondary"
  | "ghost"
  | "ghost-primary";

/**
 * Props for the BfDsButton component.
 * Extends React.ButtonHTMLAttributes to support all standard button attributes.
 */
export type BfDsButtonProps = {
  /** Button content text or elements */
  children?: React.ReactNode;
  /** Size variant for button */
  size?: BfDsButtonSize;
  /** Visual style variant */
  variant?: BfDsButtonVariant;
  /** Disables button interaction */
  disabled?: boolean;
  /** Click event handler */
  onClick?: (
    e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>,
  ) => void;
  /** Additional CSS classes */
  className?: string;
  /** Icon name or custom icon element */
  icon?: BfDsIconName | React.ReactNode;
  /** Position of icon relative to text */
  iconPosition?: "left" | "right";
  /** When true, shows only icon without text */
  iconOnly?: boolean;
  /** When true, applies overlay styling, shows original variant on hover */
  overlay?: boolean;
  /** URL to navigate to (renders as anchor tag) */
  href?: string;
  /** Target attribute for links (defaults to _blank when href is provided) */
  target?: "_blank" | "_self" | "_parent" | "_top" | string;
  /** React Router link path (not implemented yet, falls back to anchor tag) */
  link?: string;
  /** When true, shows spinner animation */
  spinner?: boolean;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

/**
 * A versatile button component that supports multiple visual variants, sizes,
 * icons, and can render as either a button element or anchor link. The component
 * includes loading states and accessibility features.
 *
 * @param props - The button component props
 * @param props.children - Button content text or elements
 * @param props.size - Size variant for button. Options: "small", "medium", "large". Defaults to "medium"
 * @param props.variant - Visual style variant. Options: "primary", "secondary", "outline", "outline-secondary", "ghost", "ghost-primary". Defaults to "primary"
 * @param props.disabled - Disables button interaction when true. Defaults to false
 * @param props.onClick - Click event handler for button interactions
 * @param props.className - Additional CSS classes to apply to the button
 * @param props.icon - Icon name from BfDs icon set or custom React element to display
 * @param props.iconPosition - Position of icon relative to text. Options: "left", "right". Defaults to "left"
 * @param props.iconOnly - When true, shows only icon without text content. Useful for toolbar buttons
 * @param props.overlay - When true, applies overlay styling that reveals original variant on hover. Perfect for buttons on images or complex backgrounds
 * @param props.href - URL to navigate to. When provided, renders as anchor tag instead of button
 * @param props.target - Target attribute for links. Defaults to "_blank" when href is provided. Options: "_blank", "_self", "_parent", "_top"
 * @param props.link - React Router link path (not implemented yet, falls back to anchor tag)
 * @param props.spinner - When true, shows spinner animation for loading states
 *
 * @example
 * // Basic button
 * <BfDsButton onClick={() => handleClick()}>
 *   Click me
 * </BfDsButton>
 *
 * @example
 * // Primary action with icon
 * <BfDsButton variant="primary" icon="checkCircle" onClick={handleSave}>
 *   Save Changes
 * </BfDsButton>
 *
 * @example
 * // Icon-only toolbar button
 * <BfDsButton icon="settings" iconOnly variant="ghost" size="small" />
 *
 * @example
 * // External link
 * <BfDsButton href="https://example.com" variant="secondary">
 *   External Link
 * </BfDsButton>
 *
 * @example
 * // Loading state
 * <BfDsButton spinner={isLoading} disabled={isLoading} onClick={handleAsync}>
 *   {isLoading ? "Processing..." : "Start Process"}
 * </BfDsButton>
 *
 * @example
 * // Form submit button
 * <BfDsButton type="submit" variant="primary">
 *   Submit Form
 * </BfDsButton>
 *
 * @example
 * // Navigation controls
 * <BfDsButton
 *   icon="arrowLeft"
 *   iconPosition="left"
 *   variant="ghost"
 *   onClick={() => handlePrevious()}
 * >
 *   Previous
 * </BfDsButton>
 *
 * @example
 * // Overlay button on complex background
 * <BfDsButton overlay variant="primary" icon="play">
 *   Play Video
 * </BfDsButton>
 *
 * @returns JSX element that renders as either a button or anchor tag
 *
 * @see {@link BfDsIcon} for available icon names
 * @see {@link BfDsSpinner} for spinner component used in loading states
 */
export function BfDsButton({
  children,
  size = "medium",
  variant = "primary",
  disabled = false,
  onClick,
  className,
  href: _href,
  icon,
  iconPosition = "left",
  iconOnly = false,
  overlay = false,
  href,
  target = "_blank",
  link,
  spinner = false,
  ...props
}: BfDsButtonProps) {
  const handleClick = (
    e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>,
  ) => {
    if (disabled) return;
    onClick?.(e);
    // TODO: href navigation will be implemented later
  };

  const classes = [
    "bfds-button",
    `bfds-button--${variant}`,
    `bfds-button--${size}`,
    iconOnly && "bfds-button--icon-only",
    overlay && "bfds-button--overlay",
    className,
  ].filter(Boolean).join(" ");

  // Set icon size based on button size
  const iconSize = size;

  // Determine spinner size based on button size
  let spinnerSize;
  switch (size) {
    case "small":
      spinnerSize = iconOnly ? 24 : 16;
      break;
    case "large":
      spinnerSize = iconOnly ? 40 : 32;
      break;
    default:
      spinnerSize = iconOnly ? 32 : 24;
  }

  // Render icon element
  const iconElement = icon
    ? (
      typeof icon === "string"
        ? <BfDsIcon name={icon as BfDsIconName} size={iconSize} />
        : icon
    )
    : null;

  // TODO: Change to React Router Link component when implemented
  if (link) {
    return (
      <a
        href={link}
        className={classes}
        onClick={handleClick}
        target="_self"
      >
        {spinner && (
          <div className="bfds-button-spinner">
            <BfDsSpinner size={spinnerSize} />
          </div>
        )}
        {iconPosition === "left" && iconElement}
        {!iconOnly && children}
        {iconPosition === "right" && iconElement}
      </a>
    );
  }

  if (href) {
    return (
      <a
        href={href}
        className={classes}
        onClick={handleClick}
        target={target}
      >
        {spinner && (
          <div className="bfds-button-spinner">
            <BfDsSpinner size={spinnerSize} />
          </div>
        )}
        {iconPosition === "left" && iconElement}
        {!iconOnly && children}
        {iconPosition === "right" && iconElement}
      </a>
    );
  }

  return (
    <button
      {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)}
      type={props.type ?? "button"}
      className={classes}
      disabled={disabled}
      onClick={handleClick}
    >
      {spinner && (
        <div className="bfds-button-spinner">
          <BfDsSpinner size={spinnerSize} />
        </div>
      )}
      {iconPosition === "left" && iconElement}
      {!iconOnly && children}
      {iconPosition === "right" && iconElement}
    </button>
  );
}
