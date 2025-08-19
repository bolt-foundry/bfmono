import { BfDsTabs } from "@bfmono/apps/bfDs/components/BfDsTabs.tsx";
import { BfDsEmptyState } from "@bfmono/apps/bfDs/components/BfDsEmptyState.tsx";
import { BfDsButton } from "@bfmono/apps/bfDs/components/BfDsButton.tsx";
import { useRouter } from "@bfmono/apps/boltfoundry-com/contexts/RouterContext.tsx";
import { useRefinementContext } from "@bfmono/apps/boltfoundry-com/contexts/RefinementContext.tsx";
import { GradingSamplesList } from "../Grading/GradingSamplesList.tsx";
import { GradingContainer } from "../Grading/GradingContainer.tsx";
import { GradersView } from "../Graders/GradersView.tsx";
import { DeckTab } from "@bfmono/apps/boltfoundry-com/types/deck.ts";
import type { GradingSample } from "@bfmono/apps/boltfoundry-com/types/grading.ts";

interface DeckDetailViewProps {
  deckId: string;
  deckName: string;
  currentTab: DeckTab;
  samples: Array<GradingSample>;
  loading: boolean;
  justCompletedIds: Array<string>;
  completionSummary?: { totalGraded: number; averageScore: number };
}

export function DeckDetailView({
  deckId,
  deckName,
  currentTab,
  samples,
  loading,
  justCompletedIds,
  completionSummary,
}: DeckDetailViewProps) {
  const { navigate } = useRouter();
  const { isRefining } = useRefinementContext();

  const handleTabChange = (newTab: string) => {
    navigate(`/pg/grade/decks/${deckId}/${newTab}`);
  };

  const renderSamplesContent = () => {
    if (loading) {
      return (
        <div className="grading-samples-list grading-loading">
          <div className="grading-loading-content">
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                padding: "2rem",
              }}
            >
              Loading samples...
            </div>
          </div>
        </div>
      );
    }

    // Show empty state if no samples
    if (!loading && (!samples || samples.length === 0)) {
      return (
        <BfDsEmptyState
          title="No samples yet"
          description="Get started by installing the Bolt Foundry SDK and sending your first evaluation samples to this deck."
          icon="code"
          action={{
            label: "View SDK Documentation",
            onClick: () =>
              globalThis.open(
                "https://www.npmjs.com/package/@bolt-foundry/bolt-foundry",
                "_blank",
              ),
            variant: "primary",
          }}
          secondaryAction={{
            label: "Installation Guide",
            onClick: () =>
              globalThis.open(
                "https://github.com/bolt-foundry/bfmono/blob/main/packages/bolt-foundry/README.md",
                "_blank",
              ),
          }}
        />
      );
    }

    return (
      <GradingSamplesList
        onStartGrading={() => {
          // Navigate to inbox tab
          navigate(`/pg/grade/decks/${deckId}/inbox`);
        }}
        onViewSample={(sample) => {
          // Navigate to sample detail view
          navigate(`/pg/grade/samples/${sample.id}`);
        }}
        availableSamples={samples || []}
        justCompletedIds={justCompletedIds}
        completionSummary={completionSummary}
      />
    );
  };

  const renderGradersContent = () => {
    return <GradersView deckId={deckId} />;
  };

  const renderInboxContent = () => {
    return (
      <GradingContainer
        deckId={deckId}
        deckName={deckName}
        onClose={() => navigate(`/pg/grade/decks/${deckId}/samples`)}
      />
    );
  };

  return (
    <div className="deck-detail-view">
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
        <span className="breadcrumb-current">{deckName}</span>
      </div>
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
            badge: isRefining ? "Refining" : undefined,
            badgeVariant: isRefining ? "warning" : undefined,
          },
          {
            id: DeckTab.Inbox,
            label: "Inbox",
            content: renderInboxContent(),
            badge: "New",
            badgeVariant: "warning",
          },
        ]}
        activeTab={currentTab}
        onTabChange={handleTabChange}
      />
    </div>
  );
}
