import { useState } from "react";
import { BfDsBadge, type BfDsBadgeVariant } from "../BfDsBadge.tsx";
import { BfDsCodeExample } from "../BfDsCodeExample.tsx";
import { getLogger } from "@bfmono/packages/logger/logger.ts";

const logger = getLogger(import.meta);

type Badge = {
  id: number;
  label: string;
  variant: BfDsBadgeVariant;
};

export function BfDsBadgeExample() {
  const [badges, setBadges] = useState<Array<Badge>>([
    { id: 1, label: "React", variant: "primary" },
    { id: 2, label: "TypeScript", variant: "info" },
    { id: 3, label: "Design system", variant: "success" },
  ]);

  const removeBadge = (id: number) => {
    setBadges(badges.filter((badge) => badge.id !== id));
  };

  const addBadge = () => {
    const newId = Math.max(...badges.map((b) => b.id)) + 1;
    setBadges([...badges, {
      id: newId,
      label: `Tag ${newId}`,
      variant: "default",
    }]);
  };

  return (
    <div className="bfds-example">
      <h2>BfDsBadge Component</h2>

      <div className="bfds-example__section">
        <h3>Usage</h3>
        <BfDsCodeExample
          language="tsx"
          code={`import { BfDsBadge } from "@bfmono/apps/bfDs/components/BfDsBadge.tsx";

// Basic usage
<BfDsBadge>Default Badge</BfDsBadge>

// All available props
<BfDsBadge
  variant="primary"       // "default" | "primary" | "secondary" | "success" | "warning" | "error" | "info"
  size="medium"          // "small" | "medium" | "large"
  icon="checkCircle"     // BfDsIconName
  outlined={false}       // boolean
  rounded={false}        // boolean
  clickable={false}      // boolean
  onClick={() => {}}     // () => void
  removable={false}      // boolean
  onRemove={() => {}}    // () => void
  className=""           // string
  style={{}}            // React.CSSProperties
>
  Badge Content
</BfDsBadge>`}
        />
      </div>

      <div className="bfds-example__section">
        <h3>Basic Variants</h3>
        <div
          className="bfds-example__group"
          style={{ alignItems: "center", flexWrap: "wrap" }}
        >
          <BfDsBadge variant="default">Default</BfDsBadge>
          <BfDsBadge variant="primary">Primary</BfDsBadge>
          <BfDsBadge variant="secondary">Secondary</BfDsBadge>
          <BfDsBadge variant="success">Success</BfDsBadge>
          <BfDsBadge variant="warning">Warning</BfDsBadge>
          <BfDsBadge variant="error">Error</BfDsBadge>
          <BfDsBadge variant="info">Info</BfDsBadge>
        </div>
      </div>

      <div className="bfds-example__section">
        <h3>Outlined Variants</h3>
        <div
          className="bfds-example__group"
          style={{ alignItems: "center", flexWrap: "wrap" }}
        >
          <BfDsBadge variant="default" outlined>Default</BfDsBadge>
          <BfDsBadge variant="primary" outlined>Primary</BfDsBadge>
          <BfDsBadge variant="secondary" outlined>Secondary</BfDsBadge>
          <BfDsBadge variant="success" outlined>Success</BfDsBadge>
          <BfDsBadge variant="warning" outlined>Warning</BfDsBadge>
          <BfDsBadge variant="error" outlined>Error</BfDsBadge>
          <BfDsBadge variant="info" outlined>Info</BfDsBadge>
        </div>
      </div>

      <div className="bfds-example__section">
        <h3>Size Variants</h3>
        <div
          className="bfds-example__group"
          style={{ alignItems: "center", flexWrap: "wrap" }}
        >
          <BfDsBadge size="small" variant="primary">Small</BfDsBadge>
          <BfDsBadge size="medium" variant="primary">Medium</BfDsBadge>
          <BfDsBadge size="large" variant="primary">Large</BfDsBadge>
        </div>
      </div>

      <div className="bfds-example__section">
        <h3>With Icons</h3>
        <div
          className="bfds-example__group"
          style={{ alignItems: "center", flexWrap: "wrap" }}
        >
          <BfDsBadge variant="success" icon="checkCircle">Approved</BfDsBadge>
          <BfDsBadge variant="warning" icon="exclamationTriangle">
            Warning
          </BfDsBadge>
          <BfDsBadge variant="error" icon="exclamationStop">Error</BfDsBadge>
          <BfDsBadge variant="info" icon="infoCircle">Information</BfDsBadge>
          <BfDsBadge variant="default" icon="star">Favorite</BfDsBadge>
        </div>
      </div>

      <div className="bfds-example__section">
        <h3>Rounded Badges</h3>
        <div
          className="bfds-example__group"
          style={{ alignItems: "center", flexWrap: "wrap" }}
        >
          <BfDsBadge variant="primary" rounded>Beta</BfDsBadge>
          <BfDsBadge variant="success" rounded icon="checkCircle">
            Live
          </BfDsBadge>
          <BfDsBadge variant="warning" rounded>Draft</BfDsBadge>
          <BfDsBadge variant="error" rounded outlined>Deprecated</BfDsBadge>
        </div>
      </div>

      <div className="bfds-example__section">
        <h3>Clickable Badges</h3>
        <div
          className="bfds-example__group"
          style={{ alignItems: "center", flexWrap: "wrap" }}
        >
          <BfDsBadge
            variant="primary"
            clickable
            onClick={() => logger.info("Primary clicked")}
          >
            Click me
          </BfDsBadge>
          <BfDsBadge
            variant="secondary"
            clickable
            outlined
            onClick={() => logger.info("Secondary clicked")}
          >
            Outlined clickable
          </BfDsBadge>
          <BfDsBadge
            variant="info"
            clickable
            icon="infoCircle"
            onClick={() => logger.info("Info clicked")}
          >
            With icon
          </BfDsBadge>
        </div>
      </div>

      <div className="bfds-example__section">
        <h3>Removable Badges</h3>
        <div
          className="bfds-example__group"
          style={{ alignItems: "center", flexWrap: "wrap" }}
        >
          {badges.map((badge) => (
            <BfDsBadge
              key={badge.id}
              variant={badge.variant}
              removable
              onRemove={() => removeBadge(badge.id)}
            >
              {badge.label}
            </BfDsBadge>
          ))}
          <BfDsBadge
            variant="default"
            outlined
            clickable
            onClick={addBadge}
            icon="plus"
          >
            Add Tag
          </BfDsBadge>
        </div>
      </div>

      <div className="bfds-example__section">
        <h3>Status Indicators</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span>System Status:</span>
            <BfDsBadge variant="success" icon="checkCircle" size="small">
              Operational
            </BfDsBadge>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span>Build Status:</span>
            <BfDsBadge
              variant="warning"
              icon="exclamationTriangle"
              size="small"
            >
              In Progress
            </BfDsBadge>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span>Connection:</span>
            <BfDsBadge variant="error" icon="exclamationStop" size="small">
              Disconnected
            </BfDsBadge>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span>Version:</span>
            <BfDsBadge variant="info" size="small">v2.1.0</BfDsBadge>
          </div>
        </div>
      </div>

      <div className="bfds-example__section">
        <h3>Counter Badges</h3>
        <div
          className="bfds-example__group"
          style={{ alignItems: "center", flexWrap: "wrap" }}
        >
          <div style={{ position: "relative", display: "inline-block" }}>
            <span
              style={{
                padding: "8px 16px",
                background: "var(--bfds-background-hover)",
                borderRadius: "4px",
                marginRight: "8px",
              }}
            >
              Messages
            </span>
            <BfDsBadge
              variant="error"
              size="small"
              rounded
              style={{
                position: "absolute",
                top: "-8px",
                right: "-8px",
                minWidth: "20px",
                height: "20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              12
            </BfDsBadge>
          </div>

          <div style={{ position: "relative", display: "inline-block" }}>
            <span
              style={{
                padding: "8px 16px",
                background: "var(--bfds-background-hover)",
                borderRadius: "4px",
                marginRight: "8px",
              }}
            >
              Notifications
            </span>
            <BfDsBadge
              variant="primary"
              size="small"
              rounded
              style={{
                position: "absolute",
                top: "-8px",
                right: "-8px",
                minWidth: "20px",
                height: "20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              3
            </BfDsBadge>
          </div>
        </div>
      </div>

      <div className="bfds-example__section">
        <h3>Mixed Examples</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              flexWrap: "wrap",
            }}
          >
            <span>Technologies:</span>
            <BfDsBadge variant="primary" size="small">React</BfDsBadge>
            <BfDsBadge variant="info" size="small">TypeScript</BfDsBadge>
            <BfDsBadge variant="success" size="small">Deno</BfDsBadge>
            <BfDsBadge variant="secondary" size="small">GraphQL</BfDsBadge>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              flexWrap: "wrap",
            }}
          >
            <span>Priority:</span>
            <BfDsBadge variant="error" icon="exclamationTriangle">
              High
            </BfDsBadge>
            <BfDsBadge variant="warning" icon="exclamationCircle">
              Medium
            </BfDsBadge>
            <BfDsBadge variant="success" icon="checkCircle">Low</BfDsBadge>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              flexWrap: "wrap",
            }}
          >
            <span>Environment:</span>
            <BfDsBadge variant="success" rounded outlined>Production</BfDsBadge>
            <BfDsBadge variant="warning" rounded outlined>Staging</BfDsBadge>
            <BfDsBadge variant="info" rounded outlined>Development</BfDsBadge>
          </div>
        </div>
      </div>
    </div>
  );
}
