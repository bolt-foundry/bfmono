import { BfDsListBar } from "@bfmono/apps/bfDs/components/BfDsListBar.tsx";
import { BfDsIcon } from "@bfmono/apps/bfDs/components/BfDsIcon.tsx";
import { BfDsBadge } from "@bfmono/apps/bfDs/components/BfDsBadge.tsx";
import { BfDsButton } from "@bfmono/apps/bfDs/components/BfDsButton.tsx";
import { getLogger } from "@bfmono/packages/logger/logger.ts";

const logger = getLogger(import.meta);

interface DeckData {
  id: string;
  name: string;
  description: string;
  graderCount: number;
  lastModified: string;
  status: "active" | "inactive";
  agreementRate: number;
  totalTests: number;
}

interface DeckItemProps {
  deck: DeckData;
  onClick?: () => void;
}

export function DeckItem({ deck, onClick }: DeckItemProps) {
  const getStatusVariant = (status: string) => {
    return status === "active" ? "success" : "default";
  };

  const leftContent = (
    <div className="deck-bar-left">
      <div className="deck-bar-title">
        <BfDsIcon name="deck" size="small" />
        <h4>{deck.name}</h4>
        <BfDsBadge variant={getStatusVariant(deck.status)}>
          {deck.status}
        </BfDsBadge>
      </div>
      <div className="deck-bar-meta">
        <span className="deck-bar-metric">
          <BfDsIcon name="cpu" size="small" />
          {deck.graderCount} graders
        </span>
        <span className="deck-bar-metric">
          <BfDsIcon name="checkCircle" size="small" />
          {deck.totalTests.toLocaleString()} tests
        </span>
        <span className="deck-bar-metric">
          <BfDsIcon name="clock" size="small" />
          {deck.lastModified}
        </span>
      </div>
    </div>
  );

  const centerContent = (
    <div className="deck-bar-description">
      {deck.description}
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
          logger.info("Configure deck", deck.id);
        }}
      />
    </div>
  );

  return (
    <BfDsListBar
      left={leftContent}
      center={centerContent}
      right={rightContent}
      clickable
      onClick={onClick}
      className="deck-list-bar"
    />
  );
}
