import { useState } from "react";
import { BfDsList } from "../BfDsList.tsx";
import { BfDsListItem } from "../BfDsListItem.tsx";
import { BfDsListBar } from "../BfDsListBar.tsx";
import { BfDsButton } from "../BfDsButton.tsx";
import { BfDsCallout } from "../BfDsCallout.tsx";
import { BfDsCodeExample } from "../BfDsCodeExample.tsx";

export function BfDsListExample() {
  const [notification, setNotification] = useState({
    message: "",
    visible: false,
  });
  const [_selectedItems, setSelectedItems] = useState<Array<string>>([]);

  return (
    <div className="bfds-example">
      <h2>BfDsList Examples</h2>

      <div className="bfds-example__section">
        <h3>Usage</h3>
        <BfDsCodeExample
          language="tsx"
          code={`import { BfDsList } from "@bfmono/apps/bfDs/components/BfDsList.tsx";
import { BfDsListItem } from "@bfmono/apps/bfDs/components/BfDsListItem.tsx";
import { BfDsListBar } from "@bfmono/apps/bfDs/components/BfDsListBar.tsx";
import { BfDsButton } from "@bfmono/apps/bfDs/components/BfDsButton.tsx";

// Basic usage
<BfDsList>
  <BfDsListItem>Item 1</BfDsListItem>
  <BfDsListItem>Item 2</BfDsListItem>
  <BfDsListItem>Item 3</BfDsListItem>
</BfDsList>

// All available props
<BfDsList
  accordion={false}               // boolean - only one item expanded at a time
  header="List Title"             // string - optional header text
  className=""                    // string - additional CSS classes
  bulkSelect={true}               // boolean - enable bulk selection
  initialSelectedValues={["item1"]} // array - initial selected values
  onSelectionChange={(selected) => console.log(selected)} // callback for selection changes
  bulkActions={(selected, clear) => (   // render function for bulk actions
    <div style={{ display: "flex", gap: "8px" }}>
      <BfDsButton size="small" onClick={() => deleteItems(selected)}>
        Delete ({selected.length})
      </BfDsButton>
      <BfDsButton variant="ghost" size="small" onClick={clear}>
        Clear
      </BfDsButton>
    </div>
  )}
>
  <BfDsListItem value="item1">Item 1</BfDsListItem>
  <BfDsListItem value="item2">Item 2</BfDsListItem>
  <BfDsListItem value="item3" nonSelectable>Non-selectable Item</BfDsListItem>
</BfDsList>

// Using with BfDsListBar for structured data
<BfDsList bulkSelect>
  <BfDsListBar
    value="project1"
    left="Project Name"
    center="Description"
    right="Status"
  />
</BfDsList>`}
        />
      </div>

      <div className="bfds-example__section">
        <h3>Simple List</h3>
        <BfDsList>
          <BfDsListItem>Home</BfDsListItem>
          <BfDsListItem>About</BfDsListItem>
          <BfDsListItem>Services</BfDsListItem>
          <BfDsListItem>Contact</BfDsListItem>
        </BfDsList>
      </div>

      <div className="bfds-example__section">
        <h3>Navigation List</h3>
        <BfDsList>
          <BfDsListItem active>Dashboard</BfDsListItem>
          <BfDsListItem>Projects</BfDsListItem>
          <BfDsListItem>Team</BfDsListItem>
          <BfDsListItem disabled>Settings</BfDsListItem>
        </BfDsList>
      </div>

      <div className="bfds-example__section">
        <h3>Clickable List</h3>
        <BfDsList>
          <BfDsListItem
            onClick={() =>
              setNotification({ message: "Clicked Item 1", visible: true })}
          >
            Clickable Item 1
          </BfDsListItem>
          <BfDsListItem
            onClick={() =>
              setNotification({ message: "Clicked Item 2", visible: true })}
          >
            Clickable Item 2
          </BfDsListItem>
          <BfDsListItem
            onClick={() =>
              setNotification({ message: "Clicked Item 3", visible: true })}
          >
            Clickable Item 3
          </BfDsListItem>
        </BfDsList>
        <BfDsCallout
          variant="info"
          visible={notification.visible}
          onDismiss={() => setNotification({ message: "", visible: false })}
          autoDismiss={3000}
        >
          {notification.message}
        </BfDsCallout>
      </div>

      <div className="bfds-example__section">
        <h3>Expandable List (Independent)</h3>
        <p>Each item can be expanded independently of others.</p>
        <BfDsList>
          <BfDsListItem
            expandContents={
              <div
                style={{
                  padding: "12px",
                  backgroundColor: "var(--bfds-surface-secondary)",
                }}
              >
                <p>
                  This is the expanded content for the first item. You can put
                  any React content here.
                </p>
                <button type="button">Example Button</button>
              </div>
            }
          >
            Expandable Item 1
          </BfDsListItem>
          <BfDsListItem
            expandContents={
              <div
                style={{
                  padding: "12px",
                  backgroundColor: "var(--bfds-surface-secondary)",
                }}
              >
                <p>Different content for the second item:</p>
                <ul>
                  <li>Bullet point 1</li>
                  <li>Bullet point 2</li>
                  <li>Bullet point 3</li>
                </ul>
              </div>
            }
          >
            Expandable Item 2
          </BfDsListItem>
          <BfDsListItem>
            Regular Item (not expandable)
          </BfDsListItem>
          <BfDsListItem
            expandContents={
              <div
                style={{
                  padding: "12px",
                  backgroundColor: "var(--bfds-surface-secondary)",
                }}
              >
                <p>
                  Third expandable item with some{" "}
                  <strong>formatted text</strong>.
                </p>
              </div>
            }
          >
            Expandable Item 3
          </BfDsListItem>
        </BfDsList>
      </div>

      <div className="bfds-example__section">
        <h3>Accordion List</h3>
        <p>
          Only one item can be expanded at a time. Opening a new item closes the
          previously opened one.
        </p>
        <BfDsList accordion>
          <BfDsListItem
            expandContents={
              <div
                style={{
                  padding: "12px",
                  backgroundColor: "var(--bfds-surface-secondary)",
                }}
              >
                <h4>Section 1 Details</h4>
                <p>
                  This is the first section of the accordion. When you expand
                  another section, this one will automatically close.
                </p>
              </div>
            }
          >
            Section 1: Getting Started
          </BfDsListItem>
          <BfDsListItem
            expandContents={
              <div
                style={{
                  padding: "12px",
                  backgroundColor: "var(--bfds-surface-secondary)",
                }}
              >
                <h4>Section 2 Details</h4>
                <p>
                  This is the second section. Notice how the accordion behavior
                  ensures only one section is open at a time.
                </p>
                <p>This helps keep the interface clean and focused.</p>
              </div>
            }
          >
            Section 2: Advanced Features
          </BfDsListItem>
          <BfDsListItem
            expandContents={
              <div
                style={{
                  padding: "12px",
                  backgroundColor: "var(--bfds-surface-secondary)",
                }}
              >
                <h4>Section 3 Details</h4>
                <div>
                  <p>The third section can contain complex content:</p>
                  <div
                    style={{ display: "flex", gap: "8px", marginTop: "8px" }}
                  >
                    <button type="button" style={{ padding: "4px 8px" }}>
                      Action 1
                    </button>
                    <button type="button" style={{ padding: "4px 8px" }}>
                      Action 2
                    </button>
                  </div>
                </div>
              </div>
            }
          >
            Section 3: Configuration
          </BfDsListItem>
          <BfDsListItem
            expandContents={
              <div
                style={{
                  padding: "12px",
                  backgroundColor: "var(--bfds-surface-secondary)",
                }}
              >
                <h4>Section 4 Details</h4>
                <p>The final section of our accordion example.</p>
              </div>
            }
          >
            Section 4: Support
          </BfDsListItem>
        </BfDsList>
      </div>

      <div className="bfds-example__section">
        <h3>Bulk Selection List</h3>
        <p>
          Select multiple items with checkboxes. Actions appear when items are
          selected.
        </p>
        <BfDsList
          bulkSelect
          onSelectionChange={setSelectedItems}
          bulkActions={(selected, clearSelection) => (
            <div style={{ display: "flex", gap: "8px" }}>
              <BfDsButton
                variant="secondary"
                size="small"
                onClick={() => {
                  setNotification({
                    message: `Deleted ${selected.length} items`,
                    visible: true,
                  });
                  clearSelection();
                }}
              >
                Delete ({selected.length})
              </BfDsButton>
              <BfDsButton
                variant="outline"
                size="small"
                onClick={() => {
                  setNotification({
                    message: `Exported ${selected.length} items`,
                    visible: true,
                  });
                }}
              >
                Export ({selected.length})
              </BfDsButton>
              <BfDsButton
                variant="ghost"
                size="small"
                onClick={clearSelection}
              >
                Clear
              </BfDsButton>
            </div>
          )}
        >
          <BfDsListItem value="bulk1">Selectable Item 1</BfDsListItem>
          <BfDsListItem value="bulk2">Selectable Item 2</BfDsListItem>
          <BfDsListItem value="bulk3">Selectable Item 3</BfDsListItem>
          <BfDsListItem nonSelectable>Non-selectable Item</BfDsListItem>
          <BfDsListItem value="bulk4">Selectable Item 4</BfDsListItem>
        </BfDsList>
      </div>

      <div className="bfds-example__section">
        <h3>Bulk Selection with BfDsListBar</h3>
        <p>
          Using BfDsListBar components with bulk selection for structured data.
        </p>
        <BfDsList
          bulkSelect
          header="Project List"
          onSelectionChange={(selected) =>
            setNotification({
              message: `Selected: ${selected.join(", ")}`,
              visible: true,
            })}
          bulkActions={(selected, clearSelection) => (
            <div style={{ display: "flex", gap: "8px" }}>
              <BfDsButton variant="outline" size="small">
                Archive ({selected.length})
              </BfDsButton>
              <BfDsButton variant="outline" size="small">
                Move ({selected.length})
              </BfDsButton>
              <BfDsButton variant="ghost" size="small" onClick={clearSelection}>
                Cancel
              </BfDsButton>
            </div>
          )}
        >
          <BfDsListBar
            value="project1"
            left={
              <div
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <span style={{ fontWeight: "600" }}>Website Redesign</span>
              </div>
            }
            center={<span>Complete redesign with modern UI</span>}
            right={<span style={{ color: "green" }}>92% complete</span>}
          />
          <BfDsListBar
            value="project2"
            left={<span style={{ fontWeight: "600" }}>Mobile App</span>}
            center={<span>Native iOS and Android application</span>}
            right={<span style={{ color: "orange" }}>45% complete</span>}
          />
          <BfDsListBar
            value="project3"
            left={<span style={{ fontWeight: "600" }}>API Documentation</span>}
            center={<span>Complete API reference and guides</span>}
            right={<span style={{ color: "blue" }}>In review</span>}
          />
        </BfDsList>
      </div>
    </div>
  );
}
