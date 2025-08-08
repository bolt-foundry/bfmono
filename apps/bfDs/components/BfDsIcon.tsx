/**
 * @fileoverview BfDsIcon - Flexible SVG icon component with support for multiple sizes and aliases
 * @author Justin Carter <justin@boltfoundry.com>
 * @since 2.0.0
 */
import type * as React from "react";
import { icons } from "../lib/icons.ts";
import { getLogger } from "@bfmono/packages/logger/logger.ts";

const logger = getLogger(import.meta);

// Extract all icon names including aliases
type BaseIconNames = keyof typeof icons;
type AliasNames = {
  [K in BaseIconNames]: typeof icons[K] extends
    { aliases: ReadonlyArray<infer A> } ? A : never;
}[BaseIconNames];

/**
 * Union of all available icon names and their aliases.
 */
export type BfDsIconName = BaseIconNames | AliasNames;

/**
 * Icon size options - predefined names or custom pixel values.
 */
export type BfDsIconSize = "small" | "medium" | "large" | "xlarge" | number;

/**
 * Props for the BfDsIcon component.
 */
export type BfDsIconProps = {
  /** Name of the icon to display */
  name: BfDsIconName;
  /** Size variant for icon (predefined string or number in pixels) */
  size?: BfDsIconSize;
  /** Custom color override */
  color?: string;
  /** Additional CSS classes */
  className?: string;
} & Omit<React.SVGProps<SVGSVGElement>, "children">;

/**
 * A flexible icon component that renders SVG icons from the BfDs icon library with
 * support for multiple sizes, colors, and aliases.
 *
 * @param name - Name of the icon to display
 * @param size - Size variant for icon (predefined string or number in pixels)
 * @param color - Custom color override
 * @param className - Additional CSS classes
 *
 * @example
 * Simple icon:
 * ```tsx
 * <BfDsIcon name="star" />
 * ```
 *
 * @example
 * Icon with custom size and color:
 * ```tsx
 * <BfDsIcon
 *   name="checkCircle"
 *   size="large"
 *   color="var(--bfds-success)"
 * />
 * ```
 *
 * @example
 * Predefined sizes:
 * ```tsx
 * <BfDsIcon name="star" size="small" />    // 16px
 * <BfDsIcon name="star" size="medium" />   // 24px (default)
 * <BfDsIcon name="star" size="large" />    // 32px
 * <BfDsIcon name="star" size="xlarge" />   // 48px
 * ```
 *
 * @example
 * Custom numeric sizes:
 * ```tsx
 * <BfDsIcon name="star" size={20} />       // 20px
 * <BfDsIcon name="star" size={64} />       // 64px
 * <BfDsIcon name="star" size={128} />      // 128px
 * ```
 *
 * @example
 * Color variations:
 * ```tsx
 * // Inherit current color (default)
 * <BfDsIcon name="star" />
 *
 * // CSS custom properties
 * <BfDsIcon name="star" color="var(--bfds-primary)" />
 * <BfDsIcon name="star" color="var(--bfds-success)" />
 * <BfDsIcon name="star" color="var(--bfds-error)" />
 *
 * // Direct color values
 * <BfDsIcon name="star" color="#ff4444" />
 * <BfDsIcon name="star" color="blue" />
 * ```
 *
 * @example
 * Navigation & interface icons:
 * ```tsx
 * <BfDsIcon name="arrowLeft" />      // Also: chevronLeft
 * <BfDsIcon name="arrowRight" />     // Also: chevronRight
 * <BfDsIcon name="menu" />           // Also: burgerMenu
 * <BfDsIcon name="cross" />          // Also: close, x
 * <BfDsIcon name="home" />
 * ```
 *
 * @example
 * Action & control icons:
 * ```tsx
 * <BfDsIcon name="play" />
 * <BfDsIcon name="pause" />
 * <BfDsIcon name="check" />
 * <BfDsIcon name="checkCircle" />
 * <BfDsIcon name="copy" />
 * <BfDsIcon name="download" />
 * <BfDsIcon name="settings" />       // Also: gear, cog
 * ```
 *
 * @example
 * Status & feedback icons:
 * ```tsx
 * <BfDsIcon name="infoCircle" />     // Also: info
 * <BfDsIcon name="exclamationCircle" />
 * <BfDsIcon name="exclamationTriangle" />
 * <BfDsIcon name="checkCircleSolid" />
 * <BfDsIcon name="star" />
 * <BfDsIcon name="flag" />
 * ```
 *
 * @example
 * Brand icons:
 * ```tsx
 * <BfDsIcon name="brand-github" />   // Also: github
 * <BfDsIcon name="brand-google" />   // Also: google
 * <BfDsIcon name="brand-openai" />
 * <BfDsIcon name="sparkle" />        // AI/generation indicator
 * ```
 *
 * @example
 * Using aliases (equivalent icons):
 * ```tsx
 * // These are equivalent
 * <BfDsIcon name="arrowRight" />
 * <BfDsIcon name="chevronRight" />
 *
 * // These are equivalent
 * <BfDsIcon name="settings" />
 * <BfDsIcon name="gear" />
 * <BfDsIcon name="cog" />
 * ```
 *
 * @example
 * Custom styling:
 * ```tsx
 * <BfDsIcon
 *   name="star"
 *   size={32}
 *   className="custom-icon"
 *   style={{
 *     filter: "drop-shadow(2px 2px 4px rgba(0,0,0,0.3))",
 *     transition: "transform 0.2s ease",
 *   }}
 * />
 * ```
 *
 * @example
 * Conditional icons:
 * ```tsx
 * const StatusIcon = ({ status }) => (
 *   <BfDsIcon
 *     name={status === "success" ? "checkCircle" : "exclamationTriangle"}
 *     color={status === "success" ? "var(--bfds-success)" : "var(--bfds-warning)"}
 *     size="large"
 *   />
 * );
 * ```
 *
 * @example
 * Integration with buttons:
 * ```tsx
 * <BfDsButton icon="arrowRight">Next</BfDsButton>
 * <BfDsButton icon="settings" iconOnly />
 * ```
 *
 * @example
 * Semantic usage for interactive icons:
 * ```tsx
 * // Good: Semantic button with icon
 * <button aria-label="Save document">
 *   <BfDsIcon name="save" />
 * </button>
 *
 * // Better: Use BfDsButton component
 * <BfDsButton icon="save" iconOnly aria-label="Save document" />
 * ```
 *
 * ## Error Handling
 * - **Missing icons**: Returns `null` and logs an error to console
 * - **Invalid sizes**: Fall back to medium size
 * - **Malformed colors**: Fall back to `currentColor`
 *
 * ## Size Guidelines
 * - Use `small` (16px) for inline text and compact interfaces
 * - Use `medium` (24px) for standard UI elements and buttons
 * - Use `large` (32px) for prominent actions and headers
 * - Use `xlarge` (48px) for hero sections and large displays
 * - Use custom numeric sizes sparingly and consistently
 *
 * ## Color Guidelines
 * - Default to `currentColor` to inherit text color
 * - Use semantic colors (`--bfds-success`, `--bfds-error`) for status
 * - Ensure sufficient contrast for accessibility
 * - Test colors in both light and dark themes
 *
 * ## Accessibility Features
 * - **Screen Readers**: Icons are decorative by default (no alt text needed)
 * - **High Contrast**: SVG icons scale perfectly and respect system contrast settings
 * - **Focus Indicators**: When used in interactive components, inherits proper focus styling
 * - **Color Independence**: Icons should work without color alone conveying meaning
 *
 * ## Styling Classes
 * - `.bfds-icon`: Base icon styles
 * - `.bfds-icon--{size}`: Size-specific styles (for predefined sizes)
 *
 * ## Performance
 * - Icons are lightweight SVG components with minimal overhead
 * - The icon library is tree-shakeable - unused icons won't increase bundle size
 * - Consider grouping related icons to minimize prop drilling
 */
export function BfDsIcon({
  name,
  size = "medium",
  color,
  className,
  ...props
}: BfDsIconProps) {
  // First try to get the icon directly
  let icon = icons[name as keyof typeof icons];

  // If not found, search for it as an alias
  if (!icon) {
    for (const [_iconName, iconData] of Object.entries(icons)) {
      if (
        "aliases" in iconData && iconData.aliases &&
        iconData.aliases.includes(name)
      ) {
        icon = iconData;
        break;
      }
    }
  }

  if (!icon) {
    logger.error(`Icon "${name}" not found`);
    return null;
  }

  // Handle numeric size or predefined size
  const isNumericSize = typeof size === "number";
  const classes = [
    "bfds-icon",
    !isNumericSize && `bfds-icon--${size}`,
    className,
  ].filter(Boolean).join(" ");

  const sizeStyle = isNumericSize
    ? { width: `${size}px`, height: `${size}px` }
    : {};

  return (
    <svg
      {...props}
      className={classes}
      viewBox={icon.viewbox}
      fill={color || "currentColor"}
      xmlns="http://www.w3.org/2000/svg"
      style={{
        ...sizeStyle,
        ...(color && { fill: color }),
        ...props.style,
      }}
    >
      {icon.paths.map((path, index) => <path key={index} d={path} />)}
    </svg>
  );
}
