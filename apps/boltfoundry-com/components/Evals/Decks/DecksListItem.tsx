import { iso } from "@iso-bfc";
import { useRouter } from "@bfmono/apps/boltfoundry-com/contexts/RouterContext.tsx";
import { BfDsListBar } from "@bfmono/apps/bfDs/components/BfDsListBar.tsx";
import { BfDsIcon } from "@bfmono/apps/bfDs/components/BfDsIcon.tsx";
import { BfDsBadge } from "@bfmono/apps/bfDs/components/BfDsBadge.tsx";
import { getLogger } from "@bfmono/packages/logger/logger.ts";

const logger = getLogger(import.meta);

// DecksListItem as an Isograph client field on BfDeck
export const DecksListItem = iso(`
  field BfDeck.DecksListItem @component {
    id
    name
    description
    slug
  }
`)(function DecksListItem({ data }) {
  const { navigate } = useRouter();

  const handleClick = () => {
    logger.debug("Deck clicked:", data.id);
    navigate(`/pg/grade/decks/${data.id}`);
  };

  // Simple deck item UI for now
  // We'll use default values for fields that aren't in GraphQL yet
  const leftContent = (
    <div className="deck-bar-left">
      <div className="deck-bar-title">
        <BfDsIcon name="deck" size="small" />
        <h4>{data.name}</h4>
        <BfDsBadge variant="success">active</BfDsBadge>
      </div>
      <div className="deck-bar-meta">
        <span className="deck-bar-metric">
          <BfDsIcon name="cpu" size="small" />
          0 graders
        </span>
        <span className="deck-bar-metric">
          <BfDsIcon name="checkCircle" size="small" />
          0 tests
        </span>
      </div>
      <p className="deck-bar-description">{data.description}</p>
    </div>
  );

  const rightContent = (
    <div className="deck-bar-right">
      <div className="deck-bar-stat">
        <span className="deck-bar-stat-label">Agreement</span>
        <span className="deck-bar-stat-value">--</span>
      </div>
    </div>
  );

  return (
    <BfDsListBar
      leftContent={leftContent}
      rightContent={rightContent}
      onClick={handleClick}
      className="deck-item"
    />
  );
});
