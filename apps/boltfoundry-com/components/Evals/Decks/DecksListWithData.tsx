import { DeckList } from "./DeckList.tsx";
import { getLogger } from "@bfmono/packages/logger/logger.ts";

const logger = getLogger(import.meta);

interface DecksListWithDataProps {
  currentViewer: any;
  onDeckSelect?: (deckId: string) => void;
}

export function DecksListWithData(
  { currentViewer, onDeckSelect }: DecksListWithDataProps,
) {
  logger.debug("DecksListWithData currentViewer:", currentViewer);

  // Extract deck data from currentViewer
  const rawDecks =
    currentViewer?.asCurrentViewerLoggedIn?.organization?.decks?.edges || [];

  const decks = rawDecks.map((edge: any) => {
    const node = edge.node;
    return {
      id: node.id,
      name: node.name || "Untitled Deck",
      description: node.description || "",
      graderCount: node.graders?.edges?.length || 0,
      lastModified: new Date().toISOString().split("T")[0], // TODO: Add real lastModified field
      status: "active" as const,
      agreementRate: 85, // TODO: Calculate real agreement rate
      totalTests: node.samples?.edges?.length || 0,
    };
  });

  return <DeckList decks={decks} onDeckSelect={onDeckSelect} />;
}
