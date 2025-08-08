import { useState } from "react";
import { BfDsButton } from "../BfDsButton.tsx";
import { BfDsCodeExample } from "../BfDsCodeExample.tsx";

export function BfDsButtonExample() {
  const [clickCount, setClickCount] = useState(0);

  return (
    <div className="bfds-example">
      <h2>BfDsButton Examples</h2>

      <div className="bfds-example__section">
        <h3>Usage</h3>
        <BfDsCodeExample
          language="tsx"
          code={`import { BfDsButton } from "@bfmono/apps/bfDs/components/BfDsButton.tsx";

// Basic usage
<BfDsButton onClick={() => console.log('clicked')}>
  Click me
</BfDsButton>

// All available props (extends HTML button attributes)
<BfDsButton
  variant="primary"               // "primary" | "secondary" | "outline" | "outline-secondary" | "ghost" | "ghost-primary"
  size="medium"                   // "small" | "medium" | "large"
  disabled={false}                // boolean
  onClick={(e) => {}}             // (e: MouseEvent) => void
  className=""                    // string
  icon="settings"                 // BfDsIconName or ReactNode
  iconPosition="left"             // "left" | "right"
  iconOnly={false}                // boolean - show only icon
  overlay={false}                 // boolean - overlay styling
  href="https://..."              // string - renders as <a> tag
  target="_blank"                 // "_blank" | "_self" | "_parent" | "_top"
  link="/path"                    // string - React Router link
  spinner={false}                 // boolean - show spinner
  type="button"                   // "button" | "submit" | "reset"
  // ... other HTML button attributes
>
  Button text
</BfDsButton>`}
        />
      </div>

      <div className="bfds-example__section">
        <h3>Variants</h3>
        <div className="bfds-example__group">
          <BfDsButton
            variant="primary"
            onClick={() => setClickCount((c) => c + 1)}
          >
            Primary ({clickCount})
          </BfDsButton>
          <BfDsButton variant="secondary">Secondary</BfDsButton>
          <BfDsButton variant="outline">Outline</BfDsButton>
          <BfDsButton variant="outline-secondary">Outline secondary</BfDsButton>
          <BfDsButton variant="ghost">Ghost</BfDsButton>
          <BfDsButton variant="ghost-primary">Ghost primary</BfDsButton>
        </div>
      </div>

      <div className="bfds-example__section">
        <h3>Sizes</h3>
        <div className="bfds-example__group bfds-example__group--align-center">
          <BfDsButton size="small">Small</BfDsButton>
          <BfDsButton size="medium">Medium</BfDsButton>
          <BfDsButton size="large">Large</BfDsButton>
        </div>
      </div>

      <div className="bfds-example__section">
        <h3>States</h3>
        <div className="bfds-example__group">
          <BfDsButton disabled>Disabled</BfDsButton>
          <BfDsButton variant="outline" disabled>
            Disabled Outline
          </BfDsButton>
        </div>
      </div>

      <div className="bfds-example__section">
        <h3>Icons</h3>
        <div className="bfds-example__group">
          <BfDsButton icon="arrowRight">Next</BfDsButton>
          <BfDsButton icon="arrowLeft" iconPosition="left">
            Previous
          </BfDsButton>
          <BfDsButton icon="brand-github" variant="outline">
            GitHub
          </BfDsButton>
          <BfDsButton icon="burgerMenu" variant="ghost">
            Menu
          </BfDsButton>
        </div>
      </div>

      <div className="bfds-example__section">
        <h3>Icon Positions</h3>
        <div className="bfds-example__group">
          <BfDsButton icon="arrowRight" iconPosition="left">
            Left Icon
          </BfDsButton>
          <BfDsButton icon="arrowRight" iconPosition="right">
            Right Icon
          </BfDsButton>
        </div>
      </div>

      <div className="bfds-example__section">
        <h3>Icon-Only Buttons</h3>
        <div className="bfds-example__group bfds-example__group--align-center">
          <BfDsButton icon="arrowLeft" iconOnly size="small" />
          <BfDsButton icon="burgerMenu" iconOnly />
          <BfDsButton icon="arrowRight" iconOnly size="large" />
          <BfDsButton icon="brand-github" iconOnly variant="outline" />
          <BfDsButton icon="back" iconOnly variant="ghost" />
        </div>
      </div>

      <div>
        <h3>Overlay Buttons</h3>
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <BfDsButton overlay variant="primary">Primary Overlay</BfDsButton>
          <BfDsButton overlay variant="secondary">Secondary Overlay</BfDsButton>
          <BfDsButton overlay variant="outline">Outline Overlay</BfDsButton>
          <BfDsButton overlay variant="ghost">Ghost Overlay</BfDsButton>
          <BfDsButton overlay variant="ghost-primary">
            Ghost primary Overlay
          </BfDsButton>
          <BfDsButton overlay icon="arrowRight">With Icon</BfDsButton>
          <BfDsButton overlay icon="burgerMenu" iconOnly />
        </div>
      </div>

      <div>
        <h3>Link Buttons</h3>
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <BfDsButton href="https://example.com">
            External Link (default _blank)
          </BfDsButton>
          <BfDsButton
            href="https://github.com"
            variant="outline"
            icon="brand-github"
          >
            GitHub
          </BfDsButton>
          <BfDsButton href="/blog" variant="ghost" target="_self">
            Internal Link (_self)
          </BfDsButton>
          <BfDsButton
            href="mailto:hello@example.com"
            variant="secondary"
          >
            Email
          </BfDsButton>
        </div>
      </div>

      <div>
        <h3>Router Link Buttons (Future)</h3>
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <BfDsButton link="/dashboard">Dashboard (Router Link)</BfDsButton>
          <BfDsButton link="/settings" variant="outline" icon="settings">
            Settings
          </BfDsButton>
          <BfDsButton link="/profile" variant="ghost">Profile</BfDsButton>
        </div>
        <p
          style={{
            fontSize: "0.875rem",
            color: "var(--bfds-text-secondary)",
            marginTop: "8px",
          }}
        >
          Note: Router links currently render as regular anchor tags until React
          Router integration is implemented.
        </p>
      </div>

      <div>
        <h3>Buttons with Spinners</h3>
        <div
          style={{
            display: "flex",
            gap: 12,
            flexWrap: "wrap",
            alignItems: "center",
            marginBottom: 12,
          }}
        >
          <BfDsButton variant="primary" spinner size="small">
            Loading Small...
          </BfDsButton>
          <BfDsButton variant="primary" spinner size="medium">
            Loading Medium...
          </BfDsButton>
          <BfDsButton variant="primary" spinner size="large">
            Loading Large...
          </BfDsButton>
        </div>
        <div
          style={{
            display: "flex",
            gap: 12,
            flexWrap: "wrap",
            alignItems: "center",
            marginBottom: 12,
          }}
        >
          <BfDsButton variant="secondary" spinner size="small">
            Saving Changes Small
          </BfDsButton>
          <BfDsButton variant="secondary" spinner size="medium">
            Saving Changes Medium
          </BfDsButton>
          <BfDsButton variant="secondary" spinner size="large">
            Saving Changes Large
          </BfDsButton>
        </div>
        <div
          style={{
            display: "flex",
            gap: 12,
            flexWrap: "wrap",
            alignItems: "center",
            marginBottom: 12,
          }}
        >
          <BfDsButton variant="outline" spinner icon="arrowRight" size="small">
            Processing Small
          </BfDsButton>
          <BfDsButton variant="outline" spinner icon="arrowRight" size="medium">
            Processing Medium
          </BfDsButton>
          <BfDsButton variant="outline" spinner icon="arrowRight" size="large">
            Processing Large
          </BfDsButton>
        </div>
        <div
          style={{
            display: "flex",
            gap: 12,
            flexWrap: "wrap",
            alignItems: "center",
            marginBottom: 12,
          }}
        >
          <BfDsButton
            variant="outline"
            spinner
            iconOnly
            icon="exclamationCircle"
            size="small"
          />
          <BfDsButton
            variant="outline"
            spinner
            iconOnly
            icon="exclamationCircle"
            size="medium"
          />
          <BfDsButton
            variant="outline"
            spinner
            iconOnly
            icon="exclamationCircle"
            size="large"
          />
        </div>
      </div>
    </div>
  );
}
