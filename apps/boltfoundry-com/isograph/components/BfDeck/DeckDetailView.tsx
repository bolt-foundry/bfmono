import { iso } from "@iso-bfc";
import { BfDsTabs } from "@bfmono/apps/bfDs/components/BfDsTabs.tsx";
import { BfDsButton } from "@bfmono/apps/bfDs/components/BfDsButton.tsx";
import { BfDsEmptyState } from "@bfmono/apps/bfDs/components/BfDsEmptyState.tsx";
import { useRouter } from "@bfmono/apps/boltfoundry-com/contexts/RouterContext.tsx";
import { DeckTab } from "@bfmono/apps/boltfoundry-com/types/deck.ts";

export const DeckDetailView = iso(`
  field BfDeck.DeckDetailView @component {
    id
    name
    description
    DeckSamplesList
  }
`)(function DeckDetailView({ data }) {
  const { navigate, routeParams } = useRouter();
  const currentTab = (routeParams.tab as DeckTab) || DeckTab.Inbox;

  const handleTabChange = (newTab: string) => {
    navigate(`/pg/grade/decks/${data.id}/${newTab}`);
  };

  const renderSamplesContent = () => {
    const SamplesList = data.DeckSamplesList;
    return <SamplesList />;
  };

  const renderGradersContent = () => {
    return (
      <BfDsEmptyState
        title="Graders Configuration"
        description={`Configure graders for deck ${data.name || data.id}`}
        icon="cpu"
      />
    );
  };

  const renderInboxContent = () => {
    return (
      <BfDsEmptyState
        title="Grading Inbox"
        description={`Start grading samples for deck ${data.name || data.id}`}
        icon="inbox"
      />
    );
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
              id: DeckTab.Samples,
              label: "Samples",
              content: renderSamplesContent(),
            },
            {
              id: DeckTab.Graders,
              label: "Graders",
              content: renderGradersContent(),
            },
            {
              id: DeckTab.Inbox,
              label: "Inbox",
              content: renderInboxContent(),
            },
          ]}
          activeTab={currentTab}
          onTabChange={handleTabChange}
        />
      </div>
    </div>
  );
});
