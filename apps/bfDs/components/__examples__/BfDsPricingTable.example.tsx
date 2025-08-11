/**
 * @fileoverview BfDsPricingTable examples showcasing different configurations
 * @author Claude <noreply@anthropic.com>
 * @since 2.0.0
 */
import { BfDsPricingTable } from "../BfDsPricingTable.tsx";
import type { PricingTier } from "../BfDsPricingTable.tsx";
import { BfDsCodeExample } from "../BfDsCodeExample.tsx";
import { getLogger } from "@bfmono/packages/logger/logger.ts";

const logger = getLogger(import.meta);

// Bolt Foundry pricing tiers
const boltFoundryTiers: Array<PricingTier> = [
  {
    name: "Free",
    price: "Free",
    period: "",
    features: [
      "1,000 AI telemetry calls/month",
      "2 evaluation decks",
      "Basic RLHF workflow",
      "100 feedback samples",
      "30-day data retention",
      "1 team member",
      "Community support",
      "Basic analytics dashboard",
    ],
    badge: "Coming soon",
    badgeVariant: "secondary",
    buttonText: "Join waitlist",
    buttonVariant: "secondary",
    onButtonClick: () => logger.info("Join waitlist clicked"),
  },
  {
    name: "Pro",
    price: "$20",
    period: "/user/month",
    features: [
      "50,000 AI telemetry calls/month",
      "25 evaluation decks",
      "Advanced RLHF workflows",
      "10,000 feedback samples",
      "1-year data retention",
      "Unlimited team members",
      "Email support",
      "Advanced analytics & reporting",
      "Session & user tracking",
      "Multi-provider API support",
    ],
    highlighted: true,
    badge: "Most popular",
    buttonText: "Start trial",
    buttonVariant: "primary",
    onButtonClick: () => logger.info("Start Pro Trial clicked"),
  },
  {
    name: "Enterprise",
    price: "$200",
    period: "/user/month",
    features: [
      "Unlimited AI telemetry calls",
      "Unlimited evaluation decks",
      "Custom evaluation workflows",
      "Unlimited feedback samples",
      "Unlimited data retention",
      "Unlimited team members",
      "Dedicated success manager",
      "SLA guarantees",
      "Custom integrations",
      "Enterprise-grade security",
      "Priority support",
      "Custom reporting",
    ],
    buttonText: "Contact sales",
    buttonVariant: "secondary",
    onButtonClick: () => logger.info("Contact Sales clicked"),
  },
];

/**
 * Default pricing table example with demo code
 */
export function DefaultPricingTable() {
  return (
    <div className="bfds-example">
      <h2>BfDsPricingTable Examples</h2>

      <div className="bfds-example__section">
        <h3>Usage</h3>
        <BfDsCodeExample
          language="tsx"
          code={`import { BfDsPricingTable } from "@bfmono/apps/bfDs/components/BfDsPricingTable.tsx";
import type { PricingTier } from "@bfmono/apps/bfDs/components/BfDsPricingTable.tsx";

// Basic usage
<BfDsPricingTable tiers={pricingTiers} />

// Define your pricing tiers
const pricingTiers: Array<PricingTier> = [
  {
    name: "Free",                    // Tier name
    price: "Free",                   // Price display  
    period: "",                      // Price period (optional)
    features: [                      // Array of feature strings
      "1,000 API calls/month",
      "2 evaluation decks",
      "Community support"
    ],
    badge: "Coming soon",            // Badge text (optional)
    badgeVariant: "secondary",       // Badge color variant (optional)
    buttonText: "Join waitlist",     // CTA button text
    buttonVariant: "secondary",      // "primary" | "secondary" | "outline"
    onButtonClick: () => console.log("Join waitlist") // Button click handler
  },
  {
    name: "Pro",
    price: "$20", 
    period: "/user/month",
    features: [
      "50,000 API calls/month",
      "25 evaluation decks", 
      "Email support"
    ],
    highlighted: true,               // Highlight this tier
    badge: "Most popular",           // Badge text for highlighted tier
    buttonText: "Start trial",
    onButtonClick: () => console.log("Start trial")
  }
];`}
        />
      </div>

      <div className="bfds-example__section">
        <h3>Component Props</h3>
        <BfDsCodeExample
          language="tsx"
          code={`// BfDsPricingTable Props
interface BfDsPricingTableProps {
  tiers: Array<PricingTier>;         // Array of pricing tiers
  className?: string;                // Additional CSS classes
}

// PricingTier Interface
interface PricingTier {
  name: string;                      // Tier name (e.g., "Free", "Pro")
  price: string;                     // Price display (e.g., "Free", "$20")
  period?: string;                   // Price period (e.g., "/month", "/user/month")
  features: Array<string>;           // Array of features included in tier
  highlighted?: boolean;             // Whether this tier is recommended/highlighted
  badge?: string;                    // Badge text for highlighted tier
  badgeVariant?: BfDsBadgeVariant;   // Badge variant: "default" | "primary" | "secondary" | "success" | "warning" | "error" | "info"
  buttonText: string;                // CTA button text
  buttonVariant?: "primary" | "secondary" | "outline";
  onButtonClick?: () => void;        // Button click handler
  disabled?: boolean;                // Whether the button should be disabled
}`}
        />
      </div>

      <div className="bfds-example__section">
        <h3>Bolt Foundry Pricing Example</h3>
        <p>
          Three-tier pricing table with Free (coming soon), Pro, and Enterprise
          options. Built with BfDs Card components and responsive design.
        </p>
        <BfDsPricingTable tiers={boltFoundryTiers} />
      </div>
    </div>
  );
}

/**
 * Simple two-tier example
 */
export function SimplePricingTable() {
  const simpleTiers: Array<PricingTier> = [
    {
      name: "Starter",
      price: "Free",
      features: [
        "Basic features",
        "Community support",
        "1 project",
      ],
      buttonText: "Get started",
    },
    {
      name: "Professional",
      price: "$29",
      period: "/month",
      features: [
        "Advanced features",
        "Priority support",
        "Unlimited projects",
        "Analytics dashboard",
      ],
      highlighted: true,
      badge: "Recommended",
      buttonText: "Start trial",
    },
  ];

  return (
    <div className="example-section">
      <h2>Simple Pricing Example</h2>
      <BfDsPricingTable tiers={simpleTiers} />
    </div>
  );
}

/**
 * All variations showcase
 */
export function AllExamples() {
  return (
    <div className="examples-container">
      <DefaultPricingTable />
      <br />
      <SimplePricingTable />
    </div>
  );
}

export default AllExamples;
