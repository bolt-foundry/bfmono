import { iso } from "@iso-bfc";
import { getLogger } from "@bfmono/packages/logger/logger.ts";

const logger = getLogger(import.meta);

// DecksView as an Isograph client field on BfOrganization
export const DecksView = iso(`
  field BfOrganization.DecksView @component {
    DeckList
  }
`)(function DecksView({ data }) {
  logger.debug("DecksView rendering, data:", data);

  // Get the DeckList component from the data
  const DeckList = data.DeckList;

  return (
    <div className="decks-view">
      <div className="view-header">
        <h2>Decks</h2>
        <p className="view-description">
          Create and manage evaluation frameworks for grading AI responses
        </p>
      </div>

      {DeckList ? <DeckList /> : <div>Loading decks...</div>}
    </div>
  );
});
