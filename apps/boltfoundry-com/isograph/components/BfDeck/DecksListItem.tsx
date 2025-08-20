import { iso } from "@iso-bfc";
import { BfDsListBar } from "@bfmono/apps/bfDs/components/BfDsListBar.tsx";
import { BfDsIcon } from "@bfmono/apps/bfDs/components/BfDsIcon.tsx";
import { BfDsBadge } from "@bfmono/apps/bfDs/components/BfDsBadge.tsx";
import { BfDsButton } from "@bfmono/apps/bfDs/components/BfDsButton.tsx";
import { getLogger } from "@bfmono/packages/logger/logger.ts";

const logger = getLogger(import.meta);

export const DecksListItem = iso(`
  field BfDeck.DecksListItem @component {
    id
    name
    description
    slug
    graders(first: 100) {
      edges {
        node {
          id
        }
      }
    }
    samples(first: 100) {
      edges {
        node {
          id
        }
      }
    }
  }
`)(function DecksListItem({ data }) {
  const graderCount = data.graders?.edges?.length || 0;
  const sampleCount = data.samples?.edges?.length || 0;

  const handleClick = () => {
    logger.debug("Deck clicked", { deckId: data.id });
    // TODO: Navigate to deck detail page
    // window.location.href = `/pg/grade/decks/${data.id}`;
  };

  const leftContent = (
    <div className="deck-bar-left">
      <div className="deck-bar-title">
        <BfDsIcon name="deck" size="small" />
        <h4>{data.name || "Untitled Deck"}</h4>
        <BfDsBadge variant="success">
          active
        </BfDsBadge>
      </div>
      <div className="deck-bar-meta">
        <span className="deck-bar-metric">
          <BfDsIcon name="cpu" size="small" />
          {graderCount} graders
        </span>
        <span className="deck-bar-metric">
          <BfDsIcon name="checkCircle" size="small" />
          {sampleCount} samples
        </span>
      </div>
    </div>
  );

  const centerContent = (
    <div className="deck-bar-description">
      {data.description || "No description"}
    </div>
  );

  const rightContent = (
    <div className="deck-bar-right">
      <BfDsButton
        variant="ghost"
        size="small"
        icon="settings"
        iconOnly
        onClick={(e) => {
          e.stopPropagation();
          logger.info("Configure deck", data.id);
        }}
      />
    </div>
  );

  return (
    <div className="deck-item">
      <BfDsListBar
        left={leftContent}
        center={centerContent}
        right={rightContent}
        clickable
        onClick={handleClick}
        className="deck-list-bar"
      />
    </div>
  );
});
