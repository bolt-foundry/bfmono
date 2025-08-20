import { iso } from "@iso-bfc";
import { BfDsTabs } from "@bfmono/apps/bfDs/components/BfDsTabs.tsx";
import { BfDsEmptyState } from "@bfmono/apps/bfDs/components/BfDsEmptyState.tsx";
import { BfDsButton } from "@bfmono/apps/bfDs/components/BfDsButton.tsx";
import { useRouter } from "@bfmono/apps/boltfoundry-com/contexts/RouterContext.tsx";
import { DeckTab } from "@bfmono/apps/boltfoundry-com/types/deck.ts";
import { getLogger } from "@bfmono/packages/logger/logger.ts";

const logger = getLogger(import.meta);

// BfDeckDetailView as an Isograph client field on BfDeck
export const BfDeckDetailView = iso(`
  field BfDeck.BfDeckDetailView @component {
    id
    name
    description
    samples(first: 100) {
      edges {
        node {
          id
          name
          completionData
          collectionMethod
        }
      }
    }
  }
`)(function BfDeckDetailView({ data }) {
  const { navigate, routeParams } = useRouter();
  // currentPath not used

  // Get tab from route params, default to samples tab if no tab specified
  const currentTab = (routeParams.tab as DeckTab) || DeckTab.Samples;

  // Handle tab navigation
  const handleTabChange = (newTab: string) => {
    navigate(`/pg/grade/decks/${data.id}/${newTab}`);
  };

  // Get samples from edges
  const samples = data.samples?.edges?.map((edge) =>
    edge?.node
  ).filter(Boolean) || [];

  logger.debug("BfDeckDetailView rendering", {
    deckId: data.id,
    deckName: data.name,
    currentTab,
    samplesCount: samples.length,
  });

  const renderSamplesContent = () => {
    if (!samples || samples.length === 0) {
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

    // Display samples list
    return (
      <div className="samples-list">
        <div className="samples-header">
          <h3>Samples ({samples.length})</h3>
        </div>
        {samples.map((sample) => {
          if (!sample) return null;
          // Extract prompt and response from completionData
          const completionData = sample.completionData
            ? (typeof sample.completionData === "string"
              ? JSON.parse(sample.completionData)
              : sample.completionData)
            : null;
          const messages = completionData?.messages || [];
          // deno-lint-ignore no-explicit-any
          const promptMessage = messages.find((m: any) =>
            m.role === "user"
          )?.content || "";
          const responseMessage =
            completionData?.choices?.[0]?.message?.content || "";

          return (
            <div key={sample?.id} className="sample-item">
              {sample?.name && (
                <div className="sample-name">
                  <strong>{sample?.name}</strong>
                </div>
              )}
              <div className="sample-prompt">
                <strong>Prompt:</strong> {promptMessage}
              </div>
              {responseMessage && (
                <div className="sample-response">
                  <strong>Response:</strong> {responseMessage}
                </div>
              )}
              <div className="sample-metadata">
                <small>
                  Collection: {sample?.collectionMethod || "manual"}
                </small>
                {completionData?.model && (
                  <small>| Model: {completionData.model}</small>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderGradersContent = () => {
    return (
      <BfDsEmptyState
        title="Graders"
        description="Graders will be displayed here"
        icon="cpu"
      />
    );
  };

  const renderInboxContent = () => {
    return (
      <BfDsEmptyState
        title="Inbox"
        description="New samples to grade will appear here"
        icon="inbox"
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
        <span className="breadcrumb-current">{data.name}</span>
      </div>

      <div className="deck-header">
        <h2>{data.name}</h2>
        {data.description && (
          <p className="deck-description">{data.description}</p>
        )}
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
});
