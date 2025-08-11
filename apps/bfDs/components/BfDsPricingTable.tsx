/**
 * @fileoverview BfDsPricingTable - Pricing table component built with BfDsCard
 * @author Claude <noreply@anthropic.com>
 * @since 2.0.0
 */
import type { ReactNode } from "react";
import { BfDsCard } from "./BfDsCard.tsx";
import { BfDsButton } from "./BfDsButton.tsx";
import { BfDsBadge, type BfDsBadgeVariant } from "./BfDsBadge.tsx";
import { BfDsIcon } from "./BfDsIcon.tsx";

/**
 * Props for individual pricing tier
 */
export type PricingTier = {
  /** Tier name (e.g., "Free", "Pro", "Enterprise") */
  name: string;
  /** Price display (e.g., "Free", "$20", "$200") */
  price: string;
  /** Price period (e.g., "/month", "/user/month") */
  period?: string;
  /** Array of features included in this tier */
  features: Array<string>;
  /** Whether this tier is highlighted/recommended */
  highlighted?: boolean;
  /** Badge text for highlighted tier */
  badge?: string;
  /** Badge variant for styling */
  badgeVariant?: BfDsBadgeVariant;
  /** CTA button text */
  buttonText: string;
  /** Button variant */
  buttonVariant?: "primary" | "secondary" | "outline";
  /** Click handler for CTA button */
  onButtonClick?: () => void;
  /** Whether the button should be disabled */
  disabled?: boolean;
};

/**
 * Props for the BfDsPricingTable component
 */
export type BfDsPricingTableProps = {
  /** Array of pricing tiers to display */
  tiers: Array<PricingTier>;
  /** Additional CSS classes */
  className?: string;
};

/**
 * A responsive pricing table component that displays pricing tiers using BfDsCard.
 * Features support for highlighted tiers, coming soon states, and customizable CTAs.
 *
 * @param tiers - Array of pricing tiers to display
 * @param className - Additional CSS classes
 *
 * @example
 * ```tsx
 * const pricingTiers = [
 *   {
 *     name: "Free",
 *     price: "Free",
 *     period: "",
 *     features: ["1,000 API calls/month", "2 evaluation decks"],
 *     buttonText: "Coming Soon",
 *     comingSoon: true
 *   },
 *   {
 *     name: "Pro",
 *     price: "$20",
 *     period: "/user/month",
 *     features: ["50,000 API calls/month", "25 evaluation decks"],
 *     highlighted: true,
 *     badge: "Most Popular",
 *     buttonText: "Start Pro Trial"
 *   }
 * ];
 *
 * <BfDsPricingTable tiers={pricingTiers} />
 * ```
 */
export function BfDsPricingTable({ tiers, className }: BfDsPricingTableProps) {
  const containerClasses = [
    "bfds-pricing-table",
    className,
  ].filter(Boolean).join(" ");

  return (
    <div className={containerClasses}>
      <div className="bfds-pricing-table__grid">
        {tiers.map((tier, index) => (
          <BfDsCard
            key={`${tier.name}-${index}`}
            variant={tier.highlighted ? "elevated" : "outlined"}
            className={[
              "bfds-pricing-table__card",
              tier.highlighted && "bfds-pricing-table__card--highlighted",
              tier.disabled && "bfds-pricing-table__card--disabled",
            ].filter(Boolean).join(" ")}
            header={
              <div className="bfds-pricing-table__header">
                {tier.badge && (
                  <BfDsBadge
                    variant={tier.badgeVariant || "primary"}
                    className="bfds-pricing-table__badge"
                  >
                    {tier.badge}
                  </BfDsBadge>
                )}
                <h3 className="bfds-pricing-table__tier-name">
                  {tier.name}
                </h3>
                <div className="bfds-pricing-table__price">
                  <span className="bfds-pricing-table__price-amount">
                    {tier.price}
                  </span>
                  {tier.period && (
                    <span className="bfds-pricing-table__price-period">
                      {tier.period}
                    </span>
                  )}
                </div>
              </div>
            }
            footer={
              <div className="bfds-pricing-table__footer">
                <BfDsButton
                  variant={tier.buttonVariant ||
                    (tier.highlighted ? "primary" : "outline")}
                  disabled={tier.disabled}
                  onClick={tier.onButtonClick}
                  className="bfds-pricing-table__cta"
                >
                  {tier.buttonText}
                </BfDsButton>
              </div>
            }
          >
            <div className="bfds-pricing-table__features">
              <ul className="bfds-pricing-table__features-list">
                {tier.features.map((feature, featureIndex) => (
                  <li
                    key={featureIndex}
                    className="bfds-pricing-table__feature"
                  >
                    <BfDsIcon
                      name="check"
                      size="small"
                      className="bfds-pricing-table__feature-icon"
                    />
                    <span className="bfds-pricing-table__feature-text">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </BfDsCard>
        ))}
      </div>
    </div>
  );
}
