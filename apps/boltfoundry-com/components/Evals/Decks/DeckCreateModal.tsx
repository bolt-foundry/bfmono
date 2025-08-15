import { useState } from "react";
import { BfDsModal } from "@bfmono/apps/bfDs/components/BfDsModal.tsx";
import { BfDsInput } from "@bfmono/apps/bfDs/components/BfDsInput.tsx";
import { BfDsTextArea } from "@bfmono/apps/bfDs/components/BfDsTextArea.tsx";
import { BfDsButton } from "@bfmono/apps/bfDs/components/BfDsButton.tsx";
import { BfDsCallout } from "@bfmono/apps/bfDs/components/BfDsCallout.tsx";

interface DeckCreateModalProps {
  onClose: () => void;
  onSubmit: (data: DeckFormData) => void;
}

interface DeckFormData {
  name: string;
  description: string;
  systemPrompt: string;
  graders?: Array<unknown>;
}

export type { DeckFormData };

export function DeckCreateModal({ onClose, onSubmit }: DeckCreateModalProps) {
  const [formData, setFormData] = useState<DeckFormData>({
    name: "",
    description: "",
    systemPrompt: "",
  });
  const [errors, setErrors] = useState<Partial<DeckFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Partial<DeckFormData> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Deck name is required";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }

    if (!formData.systemPrompt.trim()) {
      newErrors.systemPrompt = "System prompt is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  const modalFooter = (
    <>
      <BfDsButton
        variant="ghost"
        onClick={onClose}
        disabled={isSubmitting}
      >
        Cancel
      </BfDsButton>
      <BfDsButton
        variant="primary"
        onClick={handleSubmit}
        disabled={isSubmitting}
      >
        {isSubmitting ? "Creating..." : "Create deck"}
      </BfDsButton>
    </>
  );

  return (
    <BfDsModal
      isOpen
      onClose={onClose}
      title="Create new deck"
      size="medium"
      footer={modalFooter}
    >
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="deck-name">Deck name</label>
          <BfDsInput
            id="deck-name"
            placeholder="e.g., Customer Support Quality"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            errorMessage={errors.name}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="deck-description">Description</label>
          <BfDsTextArea
            id="deck-description"
            placeholder="Describe what this deck evaluates..."
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })}
            errorMessage={errors.description}
            rows={3}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="system-prompt">System prompt</label>
          <BfDsCallout variant="info">
            This prompt sets the context for all graders in this deck
          </BfDsCallout>
          <BfDsTextArea
            id="system-prompt"
            placeholder="You are evaluating AI responses for..."
            value={formData.systemPrompt}
            onChange={(e) =>
              setFormData({ ...formData, systemPrompt: e.target.value })}
            errorMessage={errors.systemPrompt}
            rows={5}
            required
          />
        </div>
      </form>
    </BfDsModal>
  );
}
