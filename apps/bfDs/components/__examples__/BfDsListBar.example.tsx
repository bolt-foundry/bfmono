import { BfDsListBar } from "../BfDsListBar.tsx";
import { BfDsIcon } from "../BfDsIcon.tsx";
import { BfDsButton } from "../BfDsButton.tsx";
import { BfDsBadge } from "../BfDsBadge.tsx";
import { BfDsPill } from "../BfDsPill.tsx";
import { BfDsProgressBar } from "../BfDsProgressBar.tsx";
import { BfDsCodeExample } from "../BfDsCodeExample.tsx";
import { getLogger } from "@bfmono/packages/logger/logger.ts";

const logger = getLogger(import.meta);

export function BfDsListBarExample() {
  return (
    <div className="bfds-example">
      <h2>BfDsListBar Component</h2>

      <div className="bfds-example__section">
        <h3>Usage</h3>
        <BfDsCodeExample
          language="tsx"
          code={`import { BfDsListBar } from "@bfmono/apps/bfDs/components/BfDsListBar.tsx";
import { BfDsList } from "@bfmono/apps/bfDs/components/BfDsList.tsx";

// Basic usage (use with BfDsList)
<BfDsList>
  <BfDsListBar
    left={<span>Title</span>}
    center={<span>Description</span>}
    right={<button>Action</button>}
  />
</BfDsList>

// All available props
<BfDsListBar
  left={<ReactNode />}           // ReactNode (required) - left content
  center={<ReactNode />}          // ReactNode - center content
  right={<ReactNode />}           // ReactNode - right content
  after={<ReactNode />}           // ReactNode - full-width content underneath
  active={false}                  // boolean - show active state
  clickable={false}               // boolean - make clickable
  onClick={() => {}}              // () => void - click handler
  className=""                    // string - additional classes
  value="unique-id"               // string - value for bulk selection
  nonSelectable={false}           // boolean - exclude from bulk selection
/>

// Bulk selection usage
<BfDsList bulkSelect onSelectionChange={(selected) => console.log(selected)}>
  <BfDsListBar
    value="project1"
    left="Project Alpha"
    center="Website redesign project"
    right="In Progress"
  />
  <BfDsListBar
    value="project2" 
    left="Project Beta"
    center="Mobile app development"
    right="Planning"
  />
</BfDsList>`}
        />
      </div>

      <div
        style={{
          padding: "20px",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
        }}
      >
        <h3>Examples</h3>

        <div>
          <h4>Basic List Bar</h4>
          <BfDsListBar
            left={<span>Simple left content</span>}
          />
        </div>

        <div>
          <h4>Full Content List Bar</h4>
          <BfDsListBar
            left={<span>Left section</span>}
            center={<span>Center section with more content</span>}
            right={<span>Right section</span>}
          />
        </div>

        <div>
          <h4>Clickable List Bar</h4>
          <BfDsListBar
            left={<span>Click me!</span>}
            center={<span>This bar is clickable</span>}
            clickable
            onClick={() => alert("List bar clicked!")}
          />
        </div>

        <div>
          <h4>Active List Bar</h4>
          <BfDsListBar
            left={<span>Active item</span>}
            center={<span>This item is currently active</span>}
            active
          />
        </div>

        <div>
          <h4>Rich Content Example</h4>
          <BfDsListBar
            left={
              <div
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <BfDsIcon name="autoframe" size="small" />
                <div>
                  <div style={{ fontWeight: "600", marginBottom: "4px" }}>
                    Project Name
                  </div>
                  <div
                    style={{
                      fontSize: "13px",
                      color: "var(--bfds-text-secondary)",
                    }}
                  >
                    Created 2 days ago
                  </div>
                </div>
                <BfDsBadge variant="success">Active</BfDsBadge>
              </div>
            }
            center={
              <div
                style={{
                  color: "var(--bfds-text-secondary)",
                  fontSize: "14px",
                }}
              >
                A comprehensive description of this project that spans multiple
                lines and provides detailed information about its purpose and
                functionality.
              </div>
            }
            right={
              <div
                style={{ display: "flex", alignItems: "center", gap: "12px" }}
              >
                <BfDsPill variant="success" text="98% complete" />
                <BfDsButton
                  variant="ghost"
                  size="small"
                  icon="settings"
                  iconOnly
                />
              </div>
            }
            clickable
            onClick={() => logger.info("Rich content bar clicked")}
          />
        </div>

        <div>
          <h4>Multiple List Bars</h4>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {[
              { name: "Customer Support Quality", status: "active", rate: 92 },
              { name: "Code Generation Accuracy", status: "active", rate: 87 },
              { name: "Content Moderation", status: "inactive", rate: 95 },
            ].map((item, index) => (
              <BfDsListBar
                key={index}
                left={
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <BfDsIcon name="autoframe" size="small" />
                    <span style={{ fontWeight: "600" }}>{item.name}</span>
                    <BfDsBadge
                      variant={item.status === "active" ? "success" : "default"}
                    >
                      {item.status}
                    </BfDsBadge>
                  </div>
                }
                center={
                  <span style={{ color: "var(--bfds-text-secondary)" }}>
                    Evaluation deck for {item.name.toLowerCase()}
                  </span>
                }
                right={
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                    }}
                  >
                    <BfDsPill
                      variant={item.rate >= 90 ? "success" : "warning"}
                      text={`${item.rate}% agreement`}
                    />
                    <BfDsButton
                      variant="ghost"
                      size="small"
                      icon="settings"
                      iconOnly
                    />
                  </div>
                }
                clickable
                onClick={() => logger.info(`Clicked ${item.name}`)}
              />
            ))}
          </div>
        </div>

        <div>
          <h4>List Bar with 'after' Content</h4>
          <BfDsListBar
            left={
              <div
                style={{ display: "flex", alignItems: "center", gap: "12px" }}
              >
                <BfDsIcon name="cpu" size="small" />
                <div>
                  <div style={{ fontWeight: "600" }}>Accuracy Grader</div>
                  <div
                    style={{
                      fontSize: "13px",
                      color: "var(--bfds-text-secondary)",
                    }}
                  >
                    Evaluates response accuracy against expected outputs
                  </div>
                </div>
              </div>
            }
            right={
              <div
                style={{ display: "flex", alignItems: "center", gap: "12px" }}
              >
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontWeight: "600" }}>92.5%</div>
                  <div
                    style={{
                      fontSize: "13px",
                      color: "var(--bfds-text-secondary)",
                    }}
                  >
                    Accuracy
                  </div>
                </div>
                <BfDsBadge variant="warning">Refining</BfDsBadge>
              </div>
            }
            after={
              <BfDsProgressBar
                label="Analyzing samples..."
                value={67}
                size="small"
                showValue
                helpText="Examining training samples and identifying patterns"
              />
            }
            clickable
            onClick={() => logger.info("Grader clicked")}
          />
        </div>
      </div>
    </div>
  );
}
