import { useState } from "react";
import { BfDsButton } from "@bfmono/apps/bfDs/components/BfDsButton.tsx";
import { BfDsEmptyState } from "@bfmono/apps/bfDs/components/BfDsEmptyState.tsx";
import { BfDsInput } from "@bfmono/apps/bfDs/components/BfDsInput.tsx";
import { DeckItem } from "./DeckItem.tsx";
import { DeckCreateModal, type DeckFormData } from "./DeckCreateModal.tsx";
import { useEvalContext } from "@bfmono/apps/boltfoundry-com/components/mock/contexts/EvalContext.tsx";
import { getLogger } from "@bfmono/packages/logger/logger.ts";
import { mockDecks } from "@bfmono/apps/boltfoundry-com/mocks/deckData.ts";

const logger = getLogger(import.meta);

interface DeckListProps {
  onDeckSelect?: (deckId: string) => void;
}

export function DeckList({ onDeckSelect }: DeckListProps) {
  const { startDeckCreation } = useEvalContext();
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [decks] = useState(mockDecks);

  const filteredDecks = decks.filter((deck) =>
    deck.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    deck.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateDeck = (deckData: DeckFormData) => {
    logger.debug("Creating deck:", deckData);
    // TODO: Implement deck creation with GraphQL mutation
    setShowCreateModal(false);
  };

  const handleDeckClick = (deckId: string) => {
    // V3 routing: Let parent handle navigation to avoid duplicate calls
    logger.debug("Deck clicked", { deckId });
    onDeckSelect?.(deckId);
  };

  if (decks.length === 0 && searchQuery === "") {
    return (
      <>
        <BfDsEmptyState
          icon="deck"
          title="No decks yet"
          description="Create your first evaluation deck to start grading AI responses"
          action={{
            label: "Create deck",
            onClick: startDeckCreation,
          }}
          secondaryAction={{
            label: "Learn more",
            onClick: () => logger.debug("Learn more"),
          }}
        />
        {showCreateModal && (
          <DeckCreateModal
            onClose={() => setShowCreateModal(false)}
            onSubmit={handleCreateDeck}
          />
        )}
      </>
    );
  }

  return (
    <>
      <div className="decks-header">
        <div className="decks-search">
          <BfDsInput
            placeholder="Search decks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <BfDsButton
          variant="primary"
          icon="plus"
          onClick={startDeckCreation}
        >
          Create deck
        </BfDsButton>
      </div>

      {filteredDecks.length === 0
        ? (
          <BfDsEmptyState
            icon="settings"
            title="No decks found"
            description={`No decks match "${searchQuery}"`}
            size="small"
          />
        )
        : (
          <div className="decks-list">
            {filteredDecks.map((deck) => (
              <DeckItem
                key={deck.id}
                deck={deck}
                onClick={() => handleDeckClick(deck.id)}
              />
            ))}
          </div>
        )}

      {showCreateModal && (
        <DeckCreateModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateDeck}
        />
      )}
    </>
  );
}
