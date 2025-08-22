import { iso } from "@iso-bfc";
import { useRouter } from "@bfmono/apps/boltfoundry-com/contexts/RouterContext.tsx";
import { GradingContainer } from "@bfmono/apps/boltfoundry-com/components/Evals/Grading/GradingContainer.tsx";

export const DeckInboxTab = iso(`
  field BfDeck.DeckInboxTab @component {
    id
    name
  }
`)(function DeckInboxTab({ data }) {
  const { navigate } = useRouter();

  return (
    <GradingContainer
      deckId={data.id}
      deckName={data.name || "Unnamed Deck"}
      onClose={() => navigate(`/pg/grade/decks/${data.id}/samples`)}
    />
  );
});
