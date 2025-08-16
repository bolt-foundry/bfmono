import { useState } from "react";
import { useEvalContext } from "@bfmono/apps/boltfoundry-com/contexts/EvalContext.tsx";
import { useRouter } from "@bfmono/apps/boltfoundry-com/contexts/RouterContext.tsx";
import { DeckList } from "./DeckList.tsx";
import { DeckConfigModal } from "./DeckConfigModal.tsx";
import { getLogger } from "@bfmono/packages/logger/logger.ts";

const logger = getLogger(import.meta);

export function DecksView() {
  const { openRightSidebar } = useEvalContext();
  const { navigate, layoutMode } = useRouter();
  const [selectedDeck, _setSelectedDeck] = useState<
    { id: string; name: string } | null
  >(null);
  const [showConfigModal, setShowConfigModal] = useState(false);

  // Mock deck data for config modal
  const mockDeck = {
    id: "1",
    name: "Customer Support Quality",
    description:
      "Evaluates helpfulness, accuracy, and tone of customer support responses",
    systemPrompt: "You are evaluating customer support AI responses...",
    status: "active",
    graderCount: 5,
    graders: [],
  };

  const handleDeckSelect = (deckId: string) => {
    logger.info("Selected deck:", deckId);

    // V2 routing: Update URL for proper routing
    if (layoutMode === "fullscreen") {
      navigate(`/pg/grade/deck/${deckId}`);
    } else {
      navigate(`/pg/grade/decks/${deckId}/samples`);
      // Also open right sidebar to show samples list
      openRightSidebar("Deck Samples");
    }
  };

  const handleDeckConfig = (updates: Record<string, unknown>) => {
    logger.info("Updating deck config:", updates);
    // TODO: Update deck via GraphQL mutation
    setShowConfigModal(false);
  };

  return (
    <div className="decks-view">
      <div className="view-header">
        <h2>Decks</h2>
        <p className="view-description">
          Create and manage evaluation frameworks for grading AI responses
        </p>
      </div>

      <DeckList onDeckSelect={handleDeckSelect} />

      {showConfigModal && selectedDeck && (
        <DeckConfigModal
          deck={mockDeck}
          onClose={() => setShowConfigModal(false)}
          onSave={handleDeckConfig}
        />
      )}
    </div>
  );
}
