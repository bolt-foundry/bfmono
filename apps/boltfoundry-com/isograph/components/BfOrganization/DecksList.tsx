import { iso } from "@iso-bfc";
import { useState } from "react";
import { BfDsButton } from "@bfmono/apps/bfDs/components/BfDsButton.tsx";
import { BfDsEmptyState } from "@bfmono/apps/bfDs/components/BfDsEmptyState.tsx";
import { BfDsInput } from "@bfmono/apps/bfDs/components/BfDsInput.tsx";
import { getLogger } from "@bfmono/packages/logger/logger.ts";

const logger = getLogger(import.meta);

/**
 * DecksList component - Shows list of decks for an organization
 * This is a field on BfOrganization that fetches and displays decks
 */
export const DecksList = iso(`
  field BfOrganization.DecksList @component {
    id
    name
    decks(first: 100) {
      edges {
        node {
          id
          name
          description
          DecksListItem
        }
      }
    }
  }
`)(function DecksList({ data }) {
  const [searchQuery, setSearchQuery] = useState("");

  const decks = data.decks?.edges?.filter((edge) =>
    edge?.node
  ).map((edge) => edge!.node!) || [];

  const filteredDecks = decks.filter((deck) =>
    (deck?.name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
    (deck?.description?.toLowerCase() || "").includes(searchQuery.toLowerCase())
  );

  const handleCreateDeck = () => {
    logger.debug("Create deck clicked");
    // TODO: Implement deck creation
  };

  if (decks.length === 0 && searchQuery === "") {
    return (
      <BfDsEmptyState
        icon="deck"
        title="No decks yet"
        description="Create your first evaluation deck to start grading AI responses"
        action={{
          label: "Create deck",
          onClick: handleCreateDeck,
        }}
        secondaryAction={{
          label: "Learn more",
          onClick: () =>
            logger.debug("Learn more"),
        }}
      />
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
          onClick={handleCreateDeck}
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
            {filteredDecks.map((deck) => {
              if (!deck) return null;
              const DecksListItem = deck.DecksListItem;
              return <DecksListItem key={deck.id} />;
            })}
          </div>
        )}
    </>
  );
});
