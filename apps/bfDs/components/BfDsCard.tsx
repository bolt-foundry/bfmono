/**
 * @fileoverview BfDsCard - Versatile card container component for grouping content with multiple visual variants
 * @author Justin Carter <justin@boltfoundry.com>
 * @since 2.0.0
 */
import type * as React from "react";
import type { ReactNode } from "react";

/**
 * Props for the BfDsCard component.
 */
export type BfDsCardProps = {
  /** Content inside the card */
  children: ReactNode;
  /** Card header content */
  header?: ReactNode;
  /** Card footer content */
  footer?: ReactNode;
  /** Variant style of the card */
  variant?: "default" | "elevated" | "outlined" | "flat";
  /** Size variant */
  size?: "small" | "medium" | "large";
  /** Whether the card is clickable */
  clickable?: boolean;
  /** Click handler for clickable cards */
  onClick?: () => void;
  /** Whether the card is selected/active */
  selected?: boolean;
  /** Whether the card is disabled */
  disabled?: boolean;
  /** Additional CSS classes */
  className?: string;
} & Omit<React.HTMLAttributes<HTMLDivElement>, "onClick">;

/**
 * A versatile card container component for grouping related content. Features
 * multiple visual variants, optional header/footer sections, clickable states, and
 * size variations. Cards provide a consistent way to organize and present
 * information.
 *
 * @param children - Content inside the card
 * @param header - Card header content
 * @param footer - Card footer content
 * @param variant - Visual style variant ("default" | "elevated" | "outlined" | "flat")
 * @param size - Size variant ("small" | "medium" | "large")
 * @param clickable - Whether the card is clickable
 * @param onClick - Click handler for clickable cards
 * @param selected - Whether the card is selected/active
 * @param disabled - Whether the card is disabled
 * @param className - Additional CSS classes
 *
 * @example
 * Simple card:
 * ```tsx
 * <BfDsCard>
 *   <h3>Card Title</h3>
 *   <p>Card content goes here.</p>
 * </BfDsCard>
 * ```
 *
 * @example
 * Card with header and footer:
 * ```tsx
 * <BfDsCard
 *   header={<h3>Card Header</h3>}
 *   footer={<button>Action</button>}
 * >
 *   <p>Main card content.</p>
 * </BfDsCard>
 * ```
 *
 * @example
 * Visual variants:
 * ```tsx
 * <BfDsCard variant="default">Default card with subtle shadow</BfDsCard>
 * <BfDsCard variant="elevated">Elevated card with prominent shadow</BfDsCard>
 * <BfDsCard variant="outlined">Card with border outline</BfDsCard>
 * <BfDsCard variant="flat">Flat card with no elevation</BfDsCard>
 * ```
 *
 * @example
 * Size variants:
 * ```tsx
 * <BfDsCard size="small">Compact card content</BfDsCard>
 * <BfDsCard size="medium">Standard card content</BfDsCard>
 * <BfDsCard size="large">More spacious card content</BfDsCard>
 * ```
 *
 * @example
 * Clickable cards:
 * ```tsx
 * const [selectedCard, setSelectedCard] = useState(null);
 *
 * <BfDsCard
 *   clickable
 *   selected={selectedCard === 'card1'}
 *   onClick={() => setSelectedCard('card1')}
 * >
 *   <h3>Clickable Card</h3>
 *   <p>Click me to select</p>
 * </BfDsCard>
 * ```
 *
 * @example
 * Product card with complex layout:
 * ```tsx
 * <BfDsCard
 *   variant="outlined"
 *   clickable
 *   onClick={() => selectProduct(product.id)}
 *   header={
 *     <img
 *       src={product.image}
 *       alt={product.name}
 *       className="w-full h-32 object-cover"
 *     />
 *   }
 *   footer={
 *     <div className="flex justify-between items-center">
 *       <span className="font-bold">${product.price}</span>
 *       <BfDsButton size="small">Add to Cart</BfDsButton>
 *     </div>
 *   }
 * >
 *   <h3>{product.name}</h3>
 *   <p>{product.description}</p>
 * </BfDsCard>
 * ```
 *
 * @example
 * Dashboard widget:
 * ```tsx
 * <BfDsCard
 *   variant="elevated"
 *   header="Total Revenue"
 * >
 *   <div className="text-3xl font-bold text-green-600">
 *     $45,231
 *   </div>
 *   <div className="text-sm text-gray-500">
 *     +12% from last month
 *   </div>
 * </BfDsCard>
 * ```
 *
 * ## Accessibility Features
 * - **Keyboard Navigation**: Clickable cards are focusable with Tab
 * - **ARIA Attributes**: Uses `role="button"` and `aria-pressed` for clickable cards
 * - **Click Handlers**: Supports both mouse clicks and keyboard activation (Enter/Space)
 * - **Focus Management**: Clear visual focus indicators
 * - **Disabled State**: Proper handling of disabled interactions
 *
 * ## Styling Classes
 * - `.bfds-card`: Base card styling
 * - `.bfds-card--{variant}`: Variant-specific styling (default, elevated, outlined, flat)
 * - `.bfds-card--{size}`: Size-specific styling (small, medium, large)
 * - `.bfds-card--clickable`: Interactive card styling
 * - `.bfds-card--selected`: Selected state styling
 * - `.bfds-card--disabled`: Disabled state styling
 * - `.bfds-card__header`: Header section styling
 * - `.bfds-card__body`: Main content area styling
 * - `.bfds-card__footer`: Footer section styling
 */
export function BfDsCard({
  children,
  header,
  footer,
  variant = "default",
  size = "medium",
  clickable = false,
  onClick,
  selected = false,
  disabled = false,
  className,
  ...props
}: BfDsCardProps) {
  const classes = [
    "bfds-card",
    `bfds-card--${variant}`,
    `bfds-card--${size}`,
    clickable && "bfds-card--clickable",
    selected && "bfds-card--selected",
    disabled && "bfds-card--disabled",
    className,
  ].filter(Boolean).join(" ");

  const handleClick = () => {
    if (clickable && !disabled && onClick) {
      onClick();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (
      clickable && !disabled && onClick && (e.key === "Enter" || e.key === " ")
    ) {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <div
      {...props}
      className={classes}
      onClick={clickable ? handleClick : undefined}
      onKeyDown={clickable ? handleKeyDown : undefined}
      tabIndex={clickable && !disabled ? 0 : undefined}
      role={clickable ? "button" : undefined}
      aria-disabled={disabled}
      aria-pressed={clickable && selected ? true : undefined}
    >
      {header && (
        <div className="bfds-card__header">
          {header}
        </div>
      )}

      <div className="bfds-card__body">
        {children}
      </div>

      {footer && (
        <div className="bfds-card__footer">
          {footer}
        </div>
      )}
    </div>
  );
}
