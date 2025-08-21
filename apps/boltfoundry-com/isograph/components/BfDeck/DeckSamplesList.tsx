import { iso } from "@iso-bfc";
import { BfDsEmptyState } from "@bfmono/apps/bfDs/components/BfDsEmptyState.tsx";

export const DeckSamplesList = iso(`
  field BfDeck.DeckSamplesList @component {
    id
    samples(first: 100) {
      edges {
        node {
          SampleListItem
        }
      }
    }
  }
`)(function DeckSamplesList({ data }) {
  const sampleItems = data.samples?.edges?.filter((edge) =>
    edge != null && edge.node != null
  ).map((edge) => edge!.node!.SampleListItem) || [];

  // Show empty state if no samples
  if (sampleItems.length === 0) {
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
    <div className="deck-samples-list">
      {sampleItems.map((SampleItem, i) => <SampleItem key={i} />)}
    </div>
  );
});
