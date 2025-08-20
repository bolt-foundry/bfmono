import { iso } from "@iso-bfc";
import { BfDsEmptyState } from "@bfmono/apps/bfDs/components/BfDsEmptyState.tsx";
import { getLogger } from "@bfmono/packages/logger/logger.ts";

const logger = getLogger(import.meta);

// DeckList as an Isograph client field on BfOrganization
export const DeckList = iso(`
  field BfOrganization.DeckList @component {
    decks(first: 100) {
      edges {
        node {
          DecksListItem
        }
      }
    }
  }
`)(function DeckList({ data }) {
  // Get DecksListItem components from edges
  const deckItems = data.decks?.edges?.map((edge) =>
    edge?.node?.DecksListItem
  ).filter(Boolean) ||
    [];

  if (deckItems.length === 0) {
    return (
      <BfDsEmptyState
        icon="deck"
        title="No decks yet"
        description="Run fastpitch generate to create evaluation decks"
      />
    );
  }

  return (
    <div className="decks-list">
      {deckItems.map((DecksListItem, index) =>
        DecksListItem ? <DecksListItem key={index} /> : null
      )}
    </div>
  );
});
