import { iso } from "@iso-bfc";
import { GradersView } from "@bfmono/apps/boltfoundry-com/components/Evals/Graders/GradersView.tsx";

export const DeckGradersTab = iso(`
  field BfDeck.DeckGradersTab @component {
    id
    name
  }
`)(function DeckGradersTab({ data }) {
  // For now, we're using the existing GradersView component
  // In the future, this could be refactored to be a proper Isograph component
  return <GradersView deckId={data.id} />;
});
