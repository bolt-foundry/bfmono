import { useState } from "react";
import { BfDsModal } from "@bfmono/apps/bfDs/components/BfDsModal.tsx";
import { BfDsTabs } from "@bfmono/apps/bfDs/components/BfDsTabs.tsx";
import { BfDsInput } from "@bfmono/apps/bfDs/components/BfDsInput.tsx";
import { BfDsTextArea } from "@bfmono/apps/bfDs/components/BfDsTextArea.tsx";
import { BfDsButton } from "@bfmono/apps/bfDs/components/BfDsButton.tsx";
import { BfDsToggle } from "@bfmono/apps/bfDs/components/BfDsToggle.tsx";
import { BfDsList } from "@bfmono/apps/bfDs/components/BfDsList.tsx";
import { BfDsListItem } from "@bfmono/apps/bfDs/components/BfDsListItem.tsx";
import { BfDsIcon } from "@bfmono/apps/bfDs/components/BfDsIcon.tsx";
import { getLogger } from "@bfmono/packages/logger/logger.ts";

const logger = getLogger(import.meta);
import { BfDsBadge } from "@bfmono/apps/bfDs/components/BfDsBadge.tsx";
import { BfDsEmptyState } from "@bfmono/apps/bfDs/components/BfDsEmptyState.tsx";

interface DeckConfigModalProps {
  deck: {
    id: string;
    name: string;
    description: string;
    systemPrompt?: string;
    status?: string;
    graders: Array<unknown>;
    graderCount: number;
  }; // TODO: Use proper Deck type from GraphQL
  onClose: () => void;
  onSave: (updates: Record<string, unknown>) => void;
}

export function DeckConfigModal(
  { deck, onClose, onSave }: DeckConfigModalProps,
) {
  const [activeTab, setActiveTab] = useState("general");
  const [formData, setFormData] = useState({
    name: deck.name,
    description: deck.description,
    systemPrompt: deck.systemPrompt || "",
    isActive: deck.status === "active",
  });

  const tabs = [
    {
      id: "general",
      label: "General",
      icon: "settings" as const,
      content: null,
    },
    { id: "graders", label: "Graders", icon: "friend" as const, content: null },
    {
      id: "advanced",
      label: "Advanced",
      icon: "settings" as const,
      content: null,
    },
  ];

  const handleSave = () => {
    onSave(formData);
  };

  const modalFooter = (
    <>
      <BfDsButton variant="ghost" onClick={onClose}>
        Cancel
      </BfDsButton>
      <BfDsButton variant="primary" onClick={handleSave}>
        Save Changes
      </BfDsButton>
    </>
  );

  return (
    <BfDsModal
      isOpen
      onClose={onClose}
      title="Deck Configuration"
      size="large"
      footer={modalFooter}
    >
      <BfDsTabs
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {activeTab === "general" && (
        <form>
          <div className="form-group">
            <label htmlFor="deck-name">Deck Name</label>
            <BfDsInput
              id="deck-name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label htmlFor="deck-description">Description</label>
            <BfDsTextArea
              id="deck-description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          <div className="form-group">
            <label htmlFor="system-prompt">System Prompt</label>
            <BfDsTextArea
              id="system-prompt"
              value={formData.systemPrompt}
              onChange={(e) =>
                setFormData({ ...formData, systemPrompt: e.target.value })}
              rows={6}
            />
          </div>

          <div className="form-group">
            <label htmlFor="deck-status">Status</label>
            <div className="toggle-group">
              <BfDsToggle
                id="deck-status"
                checked={formData.isActive}
                onChange={(checked) =>
                  setFormData({ ...formData, isActive: checked })}
              />
              <span>{formData.isActive ? "Active" : "Inactive"}</span>
            </div>
          </div>
        </form>
      )}

      {activeTab === "graders" && (
        <div className="graders-tab">
          <div className="graders-header">
            <p>Manage the graders that evaluate responses for this deck</p>
            <BfDsButton variant="outline" size="small" icon="plus">
              Add Grader
            </BfDsButton>
          </div>

          {deck.graderCount === 0
            ? (
              <BfDsEmptyState
                icon="friend"
                title="No graders yet"
                description="Add graders to start evaluating responses"
                size="small"
                action={{
                  label: "Add First Grader",
                  onClick: () => logger.info("Add grader"),
                }}
              />
            )
            : (
              <BfDsList>
                <BfDsListItem>
                  <div className="grader-item">
                    <BfDsIcon name="friend" size="small" />
                    <div className="grader-info">
                      <h5>Helpfulness Grader</h5>
                      <p>Evaluates how helpful the response is</p>
                    </div>
                    <BfDsBadge variant="success">Active</BfDsBadge>
                    <BfDsButton
                      variant="ghost"
                      size="small"
                      icon="settings"
                      iconOnly
                    />
                  </div>
                </BfDsListItem>
                <BfDsListItem>
                  <div className="grader-item">
                    <BfDsIcon name="friend" size="small" />
                    <div className="grader-info">
                      <h5>Accuracy Grader</h5>
                      <p>Checks factual correctness</p>
                    </div>
                    <BfDsBadge variant="success">Active</BfDsBadge>
                    <BfDsButton
                      variant="ghost"
                      size="small"
                      icon="settings"
                      iconOnly
                    />
                  </div>
                </BfDsListItem>
              </BfDsList>
            )}
        </div>
      )}

      {activeTab === "advanced" && (
        <form>
          <div className="form-group">
            <label>Evaluation Settings</label>
            <div className="settings-grid">
              <div className="setting-item">
                <BfDsToggle id="auto-evaluate" defaultChecked />
                <label htmlFor="auto-evaluate">
                  Auto-evaluate new responses
                </label>
              </div>
              <div className="setting-item">
                <BfDsToggle id="require-consensus" />
                <label htmlFor="require-consensus">
                  Require grader consensus
                </label>
              </div>
              <div className="setting-item">
                <BfDsToggle id="enable-versioning" defaultChecked />
                <label htmlFor="enable-versioning">
                  Enable deck versioning
                </label>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="min-agreement">Minimum Agreement Threshold</label>
            <BfDsInput
              id="min-agreement"
              type="number"
              min="0"
              max="100"
              defaultValue="80"
            />
          </div>

          <div className="form-group">
            <label htmlFor="sample-size">Default Sample Size</label>
            <BfDsInput
              id="sample-size"
              type="number"
              min="1"
              defaultValue="100"
            />
          </div>
        </form>
      )}
    </BfDsModal>
  );
}
