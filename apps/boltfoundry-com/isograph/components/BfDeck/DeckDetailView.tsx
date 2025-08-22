import { iso } from "@iso-bfc";
import { BfDsTabs } from "@bfmono/apps/bfDs/components/BfDsTabs.tsx";
import { BfDsButton } from "@bfmono/apps/bfDs/components/BfDsButton.tsx";
import { useRouter } from "@bfmono/apps/boltfoundry-com/contexts/RouterContext.tsx";
import { useRefinementContext } from "@bfmono/apps/boltfoundry-com/contexts/RefinementContext.tsx";
import { DeckTab } from "@bfmono/apps/boltfoundry-com/types/deck.ts";

export const DeckDetailView = iso(`
  field BfDeck.DeckDetailView @component {
    id
    name
    description
    DeckSamplesTab
    DeckGradersTab
    DeckInboxTab
  }
`)(function DeckDetailView({ data }) {
  const { navigate, routeParams } = useRouter();
  const { isRefining } = useRefinementContext();
  const currentTab = (routeParams.tab as DeckTab) || DeckTab.Samples;

  const handleTabChange = (newTab: string) => {
    navigate(`/pg/grade/decks/${data.id}/${newTab}`);
  };

  return (
    <div className="deck-detail-view">
      <div className="view-header">
        <div className="deck-detail-breadcrumb flexRow alignItemsCenter">
          <BfDsButton
            variant="ghost"
            size="small"
            icon="arrowLeft"
            onClick={() => navigate("/pg/grade/decks")}
          >
            Decks
          </BfDsButton>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-current">
            {data.name || "Unnamed Deck"}
          </span>
        </div>
      </div>

      <div className="deck-detail-content">
        <BfDsTabs
          tabs={[
            {
              id: DeckTab.Inbox,
              label: "Inbox",
              content: <data.DeckInboxTab />,
              badge: "New",
              badgeVariant: "warning",
            },
            {
              id: DeckTab.Samples,
              label: "Samples",
              content: <data.DeckSamplesTab />,
            },
            {
              id: DeckTab.Graders,
              label: "Graders",
              content: <data.DeckGradersTab />,
              badge: isRefining ? "Refining" : undefined,
              badgeVariant: isRefining ? "warning" : undefined,
            },
          ]}
          activeTab={currentTab}
          onTabChange={handleTabChange}
        />
      </div>
    </div>
  );
});
