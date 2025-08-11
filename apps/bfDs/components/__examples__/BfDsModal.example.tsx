import { useState } from "react";
import { BfDsModal } from "../BfDsModal.tsx";
import { BfDsButton } from "../BfDsButton.tsx";
import { BfDsInput } from "../BfDsInput.tsx";
import { BfDsTextArea } from "../BfDsTextArea.tsx";
import { BfDsCodeExample } from "../BfDsCodeExample.tsx";
import { getLogger } from "@bfmono/packages/logger/logger.ts";

const logger = getLogger(import.meta);

export function BfDsModalExample() {
  const [basicModalOpen, setBasicModalOpen] = useState(false);
  const [sizeModalOpen, setSizeModalOpen] = useState<
    "small" | "medium" | "large" | "fullscreen" | null
  >(null);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [noFooterModalOpen, setNoFooterModalOpen] = useState(false);
  const [preventCloseModalOpen, setPreventCloseModalOpen] = useState(false);

  const [formData, setFormData] = useState({ name: "", description: "" });

  const handleFormSave = () => {
    logger.info("Form data:", formData);
    setFormModalOpen(false);
    setFormData({ name: "", description: "" });
  };

  return (
    <div className="bfds-example">
      <h2>BfDsModal Component</h2>

      <div className="bfds-example__section">
        <h3>Usage</h3>
        <BfDsCodeExample
          language="tsx"
          code={`import { BfDsModal } from "@bfmono/apps/bfDs/components/BfDsModal.tsx";

// Basic usage
<BfDsModal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Modal title"
>
  <p>Modal content</p>
</BfDsModal>

// All available props
<BfDsModal
  isOpen={true}                   // boolean (required) - visibility
  onClose={() => {}}              // () => void (required) - close handler
  title="Modal title"             // string - header title
  footer={<div />}                // ReactNode - custom footer
  size="medium"                   // "small" | "medium" | "large" | "fullscreen"
  closeOnBackdropClick={true}     // boolean - close on backdrop click
  closeOnEscape={true}            // boolean - close on ESC key
  className=""                    // string - additional CSS
  showCloseButton={true}          // boolean - show X button
>
  {/* Modal content */}
</BfDsModal>`}
        />
      </div>

      <div className="bfds-example__section">
        <h3>Basic Modal</h3>
        <div className="bfds-example__group">
          <BfDsButton onClick={() => setBasicModalOpen(true)}>
            Open basic modal
          </BfDsButton>
        </div>

        <BfDsModal
          isOpen={basicModalOpen}
          onClose={() => setBasicModalOpen(false)}
          title="Basic Modal Example"
          footer={
            <>
              <BfDsButton
                variant="outline"
                onClick={() => setBasicModalOpen(false)}
              >
                Cancel
              </BfDsButton>
              <BfDsButton
                variant="primary"
                onClick={() => {
                  logger.info("Save clicked");
                  setBasicModalOpen(false);
                }}
              >
                Save changes
              </BfDsButton>
            </>
          }
        >
          <p>
            This is a basic modal with a title, content, and footer buttons.
            Click the backdrop or press Escape to close it.
          </p>
        </BfDsModal>
      </div>

      <div className="bfds-example__section">
        <h3>Modal Sizes</h3>
        <div className="bfds-example__group">
          <BfDsButton onClick={() => setSizeModalOpen("small")}>
            Small Modal
          </BfDsButton>
          <BfDsButton onClick={() => setSizeModalOpen("medium")}>
            Medium Modal
          </BfDsButton>
          <BfDsButton onClick={() => setSizeModalOpen("large")}>
            Large Modal
          </BfDsButton>
          <BfDsButton onClick={() => setSizeModalOpen("fullscreen")}>
            Fullscreen Modal
          </BfDsButton>
        </div>

        {sizeModalOpen && (
          <BfDsModal
            isOpen
            onClose={() => setSizeModalOpen(null)}
            title={`${
              sizeModalOpen.charAt(0).toUpperCase() + sizeModalOpen.slice(1)
            } modal`}
            size={sizeModalOpen}
            footer={
              <BfDsButton
                variant="primary"
                onClick={() => setSizeModalOpen(null)}
              >
                Close
              </BfDsButton>
            }
          >
            <p>This is a {sizeModalOpen} sized modal.</p>
            <p>
              The modal width and height adjust based on the size prop.
              Fullscreen modals take up the entire viewport.
            </p>
          </BfDsModal>
        )}
      </div>

      <div className="bfds-example__section">
        <h3>Form Modal</h3>
        <div className="bfds-example__group">
          <BfDsButton onClick={() => setFormModalOpen(true)}>
            Open Form Modal
          </BfDsButton>
        </div>

        <BfDsModal
          isOpen={formModalOpen}
          onClose={() => setFormModalOpen(false)}
          title="Create new item"
          footer={
            <>
              <BfDsButton
                variant="outline"
                onClick={() => {
                  setFormModalOpen(false);
                  setFormData({ name: "", description: "" });
                }}
              >
                Cancel
              </BfDsButton>
              <BfDsButton
                variant="primary"
                onClick={handleFormSave}
                disabled={!formData.name}
              >
                Create
              </BfDsButton>
            </>
          }
        >
          <div
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
          >
            <BfDsInput
              label="Name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter item name"
              required
            />
            <BfDsTextArea
              label="Description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter item description"
              rows={4}
            />
          </div>
        </BfDsModal>
      </div>

      <div className="bfds-example__section">
        <h3>Modal Variants</h3>
        <div className="bfds-example__group">
          <BfDsButton onClick={() => setNoFooterModalOpen(true)}>
            No Footer Modal
          </BfDsButton>
          <BfDsButton onClick={() => setPreventCloseModalOpen(true)}>
            Prevent Close Modal
          </BfDsButton>
        </div>

        <BfDsModal
          isOpen={noFooterModalOpen}
          onClose={() => setNoFooterModalOpen(false)}
          title="Modal without footer"
        >
          <p>
            This modal has no footer. It's useful for informational content that
            doesn't require user actions.
          </p>
          <p>
            You can still close it using the X button, backdrop click, or Escape
            key.
          </p>
        </BfDsModal>

        <BfDsModal
          isOpen={preventCloseModalOpen}
          onClose={() => setPreventCloseModalOpen(false)}
          title="Important action required"
          closeOnBackdropClick={false}
          closeOnEscape={false}
          showCloseButton={false}
          footer={
            <BfDsButton
              variant="primary"
              onClick={() => setPreventCloseModalOpen(false)}
            >
              I understand
            </BfDsButton>
          }
        >
          <p>
            This modal cannot be closed by clicking the backdrop or pressing
            Escape. The close button is also hidden.
          </p>
          <p>
            This pattern is useful for critical actions that require explicit
            user confirmation.
          </p>
        </BfDsModal>
      </div>
    </div>
  );
}
