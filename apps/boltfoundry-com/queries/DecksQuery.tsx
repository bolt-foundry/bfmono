import { iso } from "@bfmono/apps/boltfoundry-com/__generated__/__isograph/iso.ts";
import { getLogger } from "@bfmono/packages/logger/logger.ts";
import { DeckList } from "@bfmono/apps/boltfoundry-com/components/Evals/Decks/DeckList.tsx";

const logger = getLogger(import.meta);

export const DecksQuery = iso(`
  field CurrentViewer.Decks @component {
    asCurrentViewerLoggedIn {
      organization {
      decks(first: 50) {
        edges {
          node {
            id
            name
            description
            slug
            content
            graders {
              edges {
                node {
                  id
                  graderText
                }
              }
            }
            samples(first: 5) {
              edges {
                node {
                  id
                }
              }
            }
          }
        }
      }
    }
    }
  }
`)(
  function DecksQueryComponent(
    { data, onDeckSelect }: {
      data: any;
      onDeckSelect?: (deckId: string) => void;
    },
  ) {
    logger.debug("DecksQuery data", data);

    const decks = data.asCurrentViewerLoggedIn?.organization?.decks?.edges?.map(
      (edge: any) => {
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
      },
    ) || [];

    return <DeckList decks={decks} onDeckSelect={onDeckSelect} />;
  },
);
