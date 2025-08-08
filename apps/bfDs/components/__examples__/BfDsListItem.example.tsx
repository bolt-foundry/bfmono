import { useState } from "react";
import { BfDsListItem } from "../BfDsListItem.tsx";
import { BfDsCallout } from "../BfDsCallout.tsx";
import { BfDsCodeExample } from "../BfDsCodeExample.tsx";

export function BfDsListItemExample() {
  const [notification, setNotification] = useState({
    message: "",
    visible: false,
  });
  return (
    <div className="bfds-example">
      <h2>BfDsListItem Examples</h2>

      <div className="bfds-example__section">
        <h3>Usage</h3>
        <BfDsCodeExample
          language="tsx"
          code={`import { BfDsListItem } from "@bfmono/apps/bfDs/components/BfDsListItem.tsx";
import { BfDsList } from "@bfmono/apps/bfDs/components/BfDsList.tsx";

// Basic usage (use with BfDsList)
<BfDsList>
  <BfDsListItem>Item 1</BfDsListItem>
  <BfDsListItem>Item 2</BfDsListItem>
</BfDsList>

// All available props
<BfDsListItem
  active={false}                  // boolean - show active state
  disabled={false}                // boolean - disable interaction
  onClick={() => {}}              // () => void - click handler
  className=""                    // string - additional CSS classes
  expandContents={<div />}        // ReactNode - expandable content
>
  List item content
</BfDsListItem>`}
        />
      </div>

      <div className="bfds-example__section">
        <h3>Item States</h3>
        <ul className="bfds-list">
          <BfDsListItem>Normal Item</BfDsListItem>
          <BfDsListItem active>Active Item</BfDsListItem>
          <BfDsListItem disabled>Disabled Item</BfDsListItem>
        </ul>
      </div>

      <div className="bfds-example__section">
        <h3>Clickable Items</h3>
        <ul className="bfds-list">
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
            disabled
          >
            Disabled Clickable Item
          </BfDsListItem>
        </ul>
      </div>

      <div className="bfds-example__section">
        <h3>Mixed Usage</h3>
        <ul className="bfds-list">
          <BfDsListItem>Static Item</BfDsListItem>
          <BfDsListItem
            active
            onClick={() =>
              setNotification({
                message: "Active and clickable",
                visible: true,
              })}
          >
            Active Clickable Item
          </BfDsListItem>
          <BfDsListItem
            onClick={() =>
              setNotification({ message: "Just clickable", visible: true })}
          >
            Clickable Item
          </BfDsListItem>
          <BfDsListItem disabled>Disabled Item</BfDsListItem>
        </ul>
      </div>

      <div className="bfds-example__section">
        <h3>Expandable Items</h3>
        <p>
          Items with expandContents show an arrow icon and can be expanded to
          reveal additional content.
        </p>
        <ul className="bfds-list">
          <BfDsListItem
            expandContents={
              <div
                style={{
                  padding: "12px",
                  backgroundColor: "var(--bfds-surface-secondary)",
                }}
              >
                <p>This content is revealed when the item is expanded.</p>
                <p>
                  You can include any React content here, including buttons,
                  forms, or other components.
                </p>
              </div>
            }
          >
            Basic Expandable Item
          </BfDsListItem>
          <BfDsListItem
            active
            expandContents={
              <div
                style={{
                  padding: "12px",
                  backgroundColor: "var(--bfds-surface-secondary)",
                }}
              >
                <p>This item is both active and expandable.</p>
                <button type="button">Action Button</button>
              </div>
            }
          >
            Active Expandable Item
          </BfDsListItem>
          <BfDsListItem
            onClick={() =>
              setNotification({
                message: "Clicked expandable item",
                visible: true,
              })}
            expandContents={
              <div
                style={{
                  padding: "12px",
                  backgroundColor: "var(--bfds-surface-secondary)",
                }}
              >
                <p>This item is both clickable and expandable.</p>
                <p>
                  The onClick handler and expand functionality work together.
                </p>
              </div>
            }
          >
            Clickable + Expandable Item
          </BfDsListItem>
          <BfDsListItem>
            Regular Item (no expand icon)
          </BfDsListItem>
        </ul>
      </div>

      <div className="bfds-example__section">
        <h3>Rich Expandable Content</h3>
        <ul className="bfds-list">
          <BfDsListItem
            expandContents={
              <div
                style={{
                  padding: "12px",
                  backgroundColor: "var(--bfds-surface-secondary)",
                }}
              >
                <h4>Project Details</h4>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "8px",
                    marginTop: "8px",
                  }}
                >
                  <div>
                    <strong>Status:</strong> In Progress
                  </div>
                  <div>
                    <strong>Due Date:</strong> Dec 31, 2024
                  </div>
                  <div>
                    <strong>Assignee:</strong> John Doe
                  </div>
                  <div>
                    <strong>Priority:</strong> High
                  </div>
                </div>
                <div style={{ marginTop: "12px", display: "flex", gap: "8px" }}>
                  <button
                    type="button"
                    style={{ padding: "4px 8px", fontSize: "12px" }}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    style={{ padding: "4px 8px", fontSize: "12px" }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            }
          >
            📋 Project Alpha
          </BfDsListItem>
          <BfDsListItem
            expandContents={
              <div
                style={{
                  padding: "12px",
                  backgroundColor: "var(--bfds-surface-secondary)",
                }}
              >
                <h4>User Information</h4>
                <div style={{ marginTop: "8px" }}>
                  <p>
                    <strong>Email:</strong> user@example.com
                  </p>
                  <p>
                    <strong>Role:</strong> Administrator
                  </p>
                  <p>
                    <strong>Last Login:</strong> 2 hours ago
                  </p>
                  <p>
                    <strong>Permissions:</strong> Read, Write, Delete
                  </p>
                </div>
              </div>
            }
          >
            👤 User Account
          </BfDsListItem>
          <BfDsListItem
            expandContents={
              <div
                style={{
                  padding: "12px",
                  backgroundColor: "var(--bfds-surface-secondary)",
                }}
              >
                <h4>Settings Panel</h4>
                <div
                  style={{
                    marginTop: "8px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                  }}
                >
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <input type="checkbox" defaultChecked />
                    Enable notifications
                  </label>
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <input type="checkbox" />
                    Dark mode
                  </label>
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    Auto-save:
                    <select style={{ marginLeft: "8px" }}>
                      <option>Every 5 minutes</option>
                      <option>Every 10 minutes</option>
                      <option>Never</option>
                    </select>
                  </label>
                </div>
              </div>
            }
          >
            ⚙️ Configuration
          </BfDsListItem>
        </ul>
      </div>

      <BfDsCallout
        variant="info"
        visible={notification.visible}
        onDismiss={() => setNotification({ message: "", visible: false })}
        autoDismiss={3000}
      >
        {notification.message}
      </BfDsCallout>
    </div>
  );
}
