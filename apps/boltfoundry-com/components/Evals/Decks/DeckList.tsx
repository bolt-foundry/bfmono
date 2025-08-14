import { useState } from "react";
import { BfDsButton } from "@bfmono/apps/bfDs/components/BfDsButton.tsx";
import { BfDsEmptyState } from "@bfmono/apps/bfDs/components/BfDsEmptyState.tsx";
import { BfDsInput } from "@bfmono/apps/bfDs/components/BfDsInput.tsx";
import { DeckItem } from "./DeckItem.tsx";
import { DeckCreateModal, type DeckFormData } from "./DeckCreateModal.tsx";
import { useEvalContext } from "@bfmono/apps/boltfoundry-com/contexts/EvalContext.tsx";
import { getLogger } from "@bfmono/packages/logger/logger.ts";
import CreateDeckMutation from "@iso-bfc/Mutation/CreateDeck/entrypoint.ts";
import { useMutation } from "@bfmono/apps/boltfoundry-com/hooks/isographPrototypes/useMutation.tsx";

const logger = getLogger(import.meta);

// Mock data for demonstration
const mockDecks = [
  {
    id: "fastpitch",
    name: "Fastpitch Story Selection",
    description:
      "Evaluates the quality of curated AI news story selections from the latest articles",
    graderCount: 3,
    lastModified: "2025-08-12",
    status: "active" as const,
    agreementRate: 88,
    totalTests: 156,
  },
  {
    id: "1",
    name: "Customer Support Quality",
    description:
      "Evaluates helpfulness, accuracy, and tone of customer support responses",
    graderCount: 5,
    lastModified: "2025-07-24",
    status: "active" as const,
    agreementRate: 92,
    totalTests: 1250,
  },
  {
    id: "2",
    name: "Code Generation Accuracy",
    description:
      "Tests correctness, efficiency, and best practices in generated code",
    graderCount: 8,
    lastModified: "2025-07-23",
    status: "active" as const,
    agreementRate: 87,
    totalTests: 3420,
  },
  {
    id: "3",
    name: "Content Moderation",
    description: "Ensures appropriate content filtering and safety guidelines",
    graderCount: 3,
    lastModified: "2025-07-22",
    status: "inactive" as const,
    agreementRate: 95,
    totalTests: 892,
  },
];

interface DeckListProps {
  onDeckSelect?: (deckId: string) => void;
  decks?: Array<{
    id: string;
    name: string;
    description: string;
    graderCount: number;
    lastModified: string;
    status: "active" | "inactive";
    agreementRate: number;
    totalTests: number;
  }>;
}

export function DeckList({ onDeckSelect, decks = mockDecks }: DeckListProps) {
  const { startDeckCreation, startGrading } = useEvalContext();
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const createDeckMutation = useMutation(CreateDeckMutation);

  const filteredDecks = decks.filter((deck) =>
    deck.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    deck.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateDeck = (deckData: DeckFormData) => {
    logger.info("Creating deck:", deckData);

    // TODO: In the future, integrate with the chat-based deck creation flow
    // The startDeckCreation() function in EvalContext provides a chat interface
    // for deck creation that should be connected to this modal workflow

    // Generate a slug from the deck name
    const slug = deckData.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    createDeckMutation.commit({
      name: deckData.name,
      description: deckData.description,
      content: deckData.systemPrompt, // Map systemPrompt to content
      slug: slug,
    }, {
      onComplete: ({ createDeck }) => {
        logger.info("Deck created successfully:", createDeck);
        setShowCreateModal(false);
        // TODO: Refresh the deck list or add the new deck to the list
      },
      onError: () => {
        logger.error("Failed to create deck");
        // TODO: Show error message to user
      },
    });
  };

  const handleDeckClick = (deckId: string) => {
    const deck = decks.find((d) => d.id === deckId);
    if (deck) {
      // Samples will be fetched by GradingInbox using GraphQL
      startGrading(deckId, deck.name);
    }
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
            label: "Create Deck",
            onClick: () => setShowCreateModal(true),
          }}
          secondaryAction={{
            label: "Learn More",
            onClick: () => logger.info("Learn more"),
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
          onClick={() => setShowCreateModal(true)}
        >
          Create Deck
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

      {/* Render mutation response element for Isograph */}
      {createDeckMutation.responseElement}
    </>
  );
}
