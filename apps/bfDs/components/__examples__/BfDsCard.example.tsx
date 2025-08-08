import { useState } from "react";
import { BfDsCard } from "../BfDsCard.tsx";
import { BfDsButton } from "../BfDsButton.tsx";
import { BfDsIcon } from "../BfDsIcon.tsx";
import { BfDsCodeExample } from "../BfDsCodeExample.tsx";

export function BfDsCardExample() {
  const [selectedCard, setSelectedCard] = useState<string | null>(null);

  return (
    <div className="bfds-example">
      <h2>BfDsCard Component</h2>

      <div className="bfds-example__section">
        <h3>Usage</h3>
        <BfDsCodeExample
          language="tsx"
          code={`import { BfDsCard } from "@bfmono/apps/bfDs/components/BfDsCard.tsx";

// Basic usage
<BfDsCard>
  <p>Card content</p>
</BfDsCard>

// All available props
<BfDsCard
  header={<h3>Card Title</h3>}   // ReactNode - header content
  footer={<div>Footer</div>}     // ReactNode - footer content
  variant="default"               // "default" | "elevated" | "outlined" | "flat"
  size="medium"                   // "small" | "medium" | "large"
  clickable={false}               // boolean - make card clickable
  onClick={() => {}}              // () => void - click handler
  selected={false}                // boolean - show selected state
  disabled={false}                // boolean - disable interaction
  className=""                    // string - additional CSS
>
  Card body content
</BfDsCard>`}
        />
      </div>

      <div className="bfds-example__section">
        <h3>Basic Cards</h3>
        <div className="bfds-example__group">
          <BfDsCard>
            <h4 style={{ margin: "0 0 8px 0" }}>Default Card</h4>
            <p style={{ margin: 0, color: "var(--bfds-text-secondary)" }}>
              This is a basic card with default styling.
            </p>
          </BfDsCard>

          <BfDsCard variant="elevated">
            <h4 style={{ margin: "0 0 8px 0" }}>Elevated Card</h4>
            <p style={{ margin: 0, color: "var(--bfds-text-secondary)" }}>
              This card has elevated styling with shadow.
            </p>
          </BfDsCard>

          <BfDsCard variant="outlined">
            <h4 style={{ margin: "0 0 8px 0" }}>Outlined Card</h4>
            <p style={{ margin: 0, color: "var(--bfds-text-secondary)" }}>
              This card has outlined styling with border.
            </p>
          </BfDsCard>

          <BfDsCard variant="flat">
            <h4 style={{ margin: "0 0 8px 0" }}>Flat Card</h4>
            <p style={{ margin: 0, color: "var(--bfds-text-secondary)" }}>
              This card has flat styling with minimal visual weight.
            </p>
          </BfDsCard>
        </div>
      </div>

      <div className="bfds-example__section">
        <h3>Card with Header and Footer</h3>
        <div className="bfds-example__group">
          <BfDsCard
            header={
              <div
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <BfDsIcon name="star" size="small" />
                <span style={{ fontWeight: "600" }}>Card Header</span>
              </div>
            }
            footer={
              <div
                style={{
                  display: "flex",
                  gap: "8px",
                  justifyContent: "flex-end",
                }}
              >
                <BfDsButton variant="outline" size="small">
                  Cancel
                </BfDsButton>
                <BfDsButton variant="primary" size="small">
                  Confirm
                </BfDsButton>
              </div>
            }
          >
            <p style={{ margin: 0 }}>
              This card demonstrates header and footer sections with content in
              between.
            </p>
          </BfDsCard>
        </div>
      </div>

      <div className="bfds-example__section">
        <h3>Size Variants</h3>
        <div className="bfds-example__group">
          <BfDsCard size="small">
            <h5 style={{ margin: "0 0 4px 0" }}>Small Card</h5>
            <p
              style={{
                margin: 0,
                fontSize: "0.875rem",
                color: "var(--bfds-text-secondary)",
              }}
            >
              Compact card for small content.
            </p>
          </BfDsCard>

          <BfDsCard size="medium">
            <h4 style={{ margin: "0 0 8px 0" }}>Medium Card</h4>
            <p style={{ margin: 0, color: "var(--bfds-text-secondary)" }}>
              Default sized card for regular content.
            </p>
          </BfDsCard>

          <BfDsCard size="large">
            <h3 style={{ margin: "0 0 12px 0" }}>Large Card</h3>
            <p style={{ margin: 0, color: "var(--bfds-text-secondary)" }}>
              Spacious card for more substantial content blocks.
            </p>
          </BfDsCard>
        </div>
      </div>

      <div className="bfds-example__section">
        <h3>Clickable Cards</h3>
        <div className="bfds-example__group">
          {[
            {
              id: "option1",
              title: "Option 1",
              desc: "First selectable option",
            },
            {
              id: "option2",
              title: "Option 2",
              desc: "Second selectable option",
            },
            {
              id: "option3",
              title: "Option 3",
              desc: "Third selectable option",
            },
          ].map((option) => (
            <BfDsCard
              key={option.id}
              clickable
              selected={selectedCard === option.id}
              onClick={() => setSelectedCard(option.id)}
              variant="outlined"
            >
              <h4 style={{ margin: "0 0 4px 0" }}>{option.title}</h4>
              <p style={{ margin: 0, color: "var(--bfds-text-secondary)" }}>
                {option.desc}
              </p>
            </BfDsCard>
          ))}
        </div>
      </div>

      <div className="bfds-example__section">
        <h3>Card States</h3>
        <div className="bfds-example__group">
          <BfDsCard>
            <h4 style={{ margin: "0 0 8px 0" }}>Normal Card</h4>
            <p style={{ margin: 0, color: "var(--bfds-text-secondary)" }}>
              Regular interactive card.
            </p>
          </BfDsCard>

          <BfDsCard selected>
            <h4 style={{ margin: "0 0 8px 0" }}>Selected Card</h4>
            <p style={{ margin: 0, color: "var(--bfds-text-secondary)" }}>
              This card is in selected state.
            </p>
          </BfDsCard>

          <BfDsCard disabled>
            <h4 style={{ margin: "0 0 8px 0" }}>Disabled Card</h4>
            <p style={{ margin: 0, color: "var(--bfds-text-secondary)" }}>
              This card is disabled and non-interactive.
            </p>
          </BfDsCard>
        </div>
      </div>

      <div className="bfds-example__section">
        <h3>Complex Card Example</h3>
        <div className="bfds-example__group">
          <BfDsCard
            variant="elevated"
            header={
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <BfDsIcon name="computer" size="small" />
                  <span style={{ fontWeight: "600" }}>Project Dashboard</span>
                </div>
                <span
                  style={{
                    fontSize: "0.75rem",
                    color: "var(--bfds-text-secondary)",
                    background: "var(--bfds-background-hover)",
                    padding: "2px 8px",
                    borderRadius: "12px",
                  }}
                >
                  Active
                </span>
              </div>
            }
            footer={
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span
                  style={{
                    fontSize: "0.875rem",
                    color: "var(--bfds-text-secondary)",
                  }}
                >
                  Last updated: 2 hours ago
                </span>
                <div style={{ display: "flex", gap: "8px" }}>
                  <BfDsButton variant="outline" size="small">
                    Settings
                  </BfDsButton>
                  <BfDsButton variant="primary" size="small">
                    Open
                  </BfDsButton>
                </div>
              </div>
            }
          >
            <div style={{ marginBottom: "12px" }}>
              <h4 style={{ margin: "0 0 8px 0" }}>Evaluation Metrics</h4>
              <p
                style={{
                  margin: "0 0 16px 0",
                  color: "var(--bfds-text-secondary)",
                }}
              >
                Track your AI model performance with comprehensive evaluation
                tools.
              </p>
              <div style={{ display: "flex", gap: "16px" }}>
                <div>
                  <div
                    style={{
                      fontSize: "1.25rem",
                      fontWeight: "600",
                      color: "var(--bfds-text)",
                    }}
                  >
                    85%
                  </div>
                  <div
                    style={{
                      fontSize: "0.875rem",
                      color: "var(--bfds-text-secondary)",
                    }}
                  >
                    Accuracy
                  </div>
                </div>
                <div>
                  <div
                    style={{
                      fontSize: "1.25rem",
                      fontWeight: "600",
                      color: "var(--bfds-text)",
                    }}
                  >
                    1.2s
                  </div>
                  <div
                    style={{
                      fontSize: "0.875rem",
                      color: "var(--bfds-text-secondary)",
                    }}
                  >
                    Response Time
                  </div>
                </div>
                <div>
                  <div
                    style={{
                      fontSize: "1.25rem",
                      fontWeight: "600",
                      color: "var(--bfds-text)",
                    }}
                  >
                    247
                  </div>
                  <div
                    style={{
                      fontSize: "0.875rem",
                      color: "var(--bfds-text-secondary)",
                    }}
                  >
                    Tests Run
                  </div>
                </div>
              </div>
            </div>
          </BfDsCard>
        </div>
      </div>
    </div>
  );
}
