import { useState } from "react";
import { BfDsEmptyState } from "../BfDsEmptyState.tsx";
import { BfDsList } from "../BfDsList.tsx";
import { BfDsListItem } from "../BfDsListItem.tsx";
import { BfDsButton } from "../BfDsButton.tsx";
import { BfDsCodeExample } from "../BfDsCodeExample.tsx";
import { getLogger } from "@bfmono/packages/logger/logger.ts";

const logger = getLogger(import.meta);

export function BfDsEmptyStateExample() {
  const [items, setItems] = useState<Array<string>>([]);

  const handleAddItem = () => {
    setItems([...items, `Item ${items.length + 1}`]);
  };

  const handleClearItems = () => {
    setItems([]);
  };

  return (
    <div className="bfds-example">
      <h2>BfDsEmptyState Component</h2>

      <div className="bfds-example__section">
        <h3>Usage</h3>
        <BfDsCodeExample
          language="tsx"
          code={`import { BfDsEmptyState } from "@bfmono/apps/bfDs/components/BfDsEmptyState.tsx";

// Basic usage
<BfDsEmptyState
  title="No items found"
  icon="plus"
/>

// All available props
<BfDsEmptyState
  icon="plus"                     // BfDsIconName (optional)
  title="No items found"          // string (required)
  description="Add some items"    // string (optional)
  size="medium"                   // "small" | "medium" | "large"
  action={{                       // Optional primary action
    label: "Add Item",
    onClick: () => {},
    variant: "primary"            // "primary" | "secondary" | "outline"
  }}
  secondaryAction={{              // Optional secondary action
    label: "Learn More",
    onClick: () => {}
  }}
  className=""                    // string (optional)
>
  {/* Optional custom content */}
</BfDsEmptyState>`}
        />
      </div>

      <div className="bfds-example__section">
        <h3>Basic Empty State</h3>
        <div
          style={{
            background: "var(--bfds-background)",
            padding: "3rem",
            borderRadius: "8px",
            border: "1px solid var(--bfds-border)",
          }}
        >
          <BfDsEmptyState
            icon="computer"
            title="No files found"
            description="Upload your first file to get started with the project"
          />
        </div>
      </div>

      <div className="bfds-example__section">
        <h3>With Action Button</h3>
        <div
          style={{
            background: "var(--bfds-background)",
            padding: "3rem",
            borderRadius: "8px",
            border: "1px solid var(--bfds-border)",
          }}
        >
          <BfDsEmptyState
            icon="plus"
            title="Create your first deck"
            description="Evaluation decks help you maintain consistent AI feedback"
            action={{
              label: "Create Deck",
              onClick: () => logger.info("Create deck clicked"),
              variant: "primary",
            }}
          />
        </div>
      </div>

      <div className="bfds-example__section">
        <h3>With Multiple Actions</h3>
        <div
          style={{
            background: "var(--bfds-background)",
            padding: "3rem",
            borderRadius: "8px",
            border: "1px solid var(--bfds-border)",
          }}
        >
          <BfDsEmptyState
            icon="exclamationCircle"
            title="No results found"
            description="Try adjusting your search criteria or filters"
            action={{
              label: "Clear Filters",
              onClick: () => logger.info("Clear filters clicked"),
              variant: "primary",
            }}
            secondaryAction={{
              label: "Learn More",
              onClick: () => logger.info("Learn more clicked"),
            }}
          />
        </div>
      </div>

      <div className="bfds-example__section">
        <h3>Size Variants</h3>
        <div
          className="bfds-example__group"
          style={{ gap: "2rem", alignItems: "stretch" }}
        >
          <div
            style={{
              background: "var(--bfds-background)",
              padding: "2rem",
              borderRadius: "8px",
              border: "1px solid var(--bfds-border)",
              flex: 1,
            }}
          >
            <BfDsEmptyState
              icon="exclamationTriangle"
              title="Small empty state"
              description="Compact version"
              size="small"
            />
          </div>

          <div
            style={{
              background: "var(--bfds-background)",
              padding: "2rem",
              borderRadius: "8px",
              border: "1px solid var(--bfds-border)",
              flex: 1,
            }}
          >
            <BfDsEmptyState
              icon="infoCircle"
              title="Medium empty state"
              description="Default size"
              size="medium"
            />
          </div>

          <div
            style={{
              background: "var(--bfds-background)",
              padding: "2rem",
              borderRadius: "8px",
              border: "1px solid var(--bfds-border)",
              flex: 1,
            }}
          >
            <BfDsEmptyState
              icon="checkCircle"
              title="Large empty state"
              description="Prominent display"
              size="large"
            />
          </div>
        </div>
      </div>

      <div className="bfds-example__section">
        <h3>With Custom Content</h3>
        <div
          style={{
            background: "var(--bfds-background)",
            padding: "3rem",
            borderRadius: "8px",
            border: "1px solid var(--bfds-border)",
          }}
        >
          <BfDsEmptyState
            icon="exclamationStop"
            title="Connection failed"
            description="We couldn't connect to the server"
          >
            <div
              style={{
                marginTop: "1rem",
                padding: "1rem",
                background: "var(--bfds-error-01)",
                borderRadius: "6px",
                fontSize: "0.875rem",
                color: "var(--bfds-error)",
              }}
            >
              Error details: Connection timeout after 30 seconds
            </div>
          </BfDsEmptyState>
        </div>
      </div>

      <div className="bfds-example__section">
        <h3>Interactive Example</h3>
        <div
          style={{
            background: "var(--bfds-background)",
            padding: "2rem",
            borderRadius: "8px",
            border: "1px solid var(--bfds-border)",
            minHeight: "300px",
          }}
        >
          {items.length === 0
            ? (
              <BfDsEmptyState
                icon="plus"
                title="No items in your list"
                description="Add some items to see them displayed here"
                action={{
                  label: "Add First Item",
                  onClick: handleAddItem,
                  variant: "primary",
                }}
              />
            )
            : (
              <div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "1rem",
                  }}
                >
                  <h4 style={{ margin: 0 }}>Your Items ({items.length})</h4>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <BfDsButton
                      onClick={handleAddItem}
                      variant="primary"
                      size="small"
                    >
                      Add Item
                    </BfDsButton>
                    <BfDsButton
                      onClick={handleClearItems}
                      variant="outline"
                      size="small"
                    >
                      Clear All
                    </BfDsButton>
                  </div>
                </div>
                <BfDsList>
                  {items.map((item, index) => (
                    <BfDsListItem key={index}>
                      {item}
                    </BfDsListItem>
                  ))}
                </BfDsList>
              </div>
            )}
        </div>
      </div>

      <div className="bfds-example__section">
        <h3>Different Icon Examples</h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "1rem",
          }}
        >
          <div
            style={{
              background: "var(--bfds-background)",
              padding: "2rem",
              borderRadius: "8px",
              border: "1px solid var(--bfds-border)",
            }}
          >
            <BfDsEmptyState
              icon="exclamationCircle"
              title="No search results"
              size="small"
            />
          </div>

          <div
            style={{
              background: "var(--bfds-background)",
              padding: "2rem",
              borderRadius: "8px",
              border: "1px solid var(--bfds-border)",
            }}
          >
            <BfDsEmptyState
              icon="friend"
              title="No users found"
              size="small"
            />
          </div>

          <div
            style={{
              background: "var(--bfds-background)",
              padding: "2rem",
              borderRadius: "8px",
              border: "1px solid var(--bfds-border)",
            }}
          >
            <BfDsEmptyState
              icon="star"
              title="No data available"
              size="small"
            />
          </div>

          <div
            style={{
              background: "var(--bfds-background)",
              padding: "2rem",
              borderRadius: "8px",
              border: "1px solid var(--bfds-border)",
            }}
          >
            <BfDsEmptyState
              icon="settings"
              title="No settings configured"
              size="small"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
