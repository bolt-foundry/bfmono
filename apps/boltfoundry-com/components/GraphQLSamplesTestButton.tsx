import { useEffect } from "react";
import { useHud } from "@bfmono/apps/bfDs/contexts/BfDsHudContext.tsx";
import { getLogger } from "@bfmono/packages/logger/logger.ts";

const logger = getLogger(import.meta);

export function GraphQLSamplesTestButton() {
  const { addButton, removeButton, sendMessage } = useHud();

  useEffect(() => {
    addButton({
      id: "test-graphql-samples",
      label: "Test GraphQL Samples",
      icon: "server",
      variant: "primary",
      onClick: async () => {
        sendMessage("Testing GraphQL samples endpoint...", "info");

        try {
          // Fetch samples via GraphQL - using currentViewer.organization.decks connection
          // Need to use inline fragment since CurrentViewer is an interface
          const query = `
            query TestDeckSamples {
              currentViewer {
                ... on CurrentViewerLoggedIn {
                  organization {
                    id
                    name
                    decks(first: 10) {
                      edges {
                        node {
                          id
                          name
                          description
                          slug
                          samples(first: 10) {
                            edges {
                              node {
                                id
                                name
                                completionData
                                collectionMethod
                              }
                            }
                            pageInfo {
                              hasNextPage
                              hasPreviousPage
                              startCursor
                              endCursor
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          `;

          const response = await fetch("/graphql", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({ query }),
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const data = await response.json();

          if (data.errors) {
            // Send each error as a separate message with a 1 second delay for readability
            data.errors.forEach((error: any, index: number) => {
              setTimeout(() => {
                sendMessage(
                  `GraphQL Error ${index + 1}: ${error.message}`,
                  "error",
                );
              }, (index + 1) * 1000); // 1 second delay for first error, 2 seconds for second, etc.
            });

            // Send the full error details after all individual errors
            setTimeout(() => {
              sendMessage(
                `Full error details: ${JSON.stringify(data.errors, null, 2)}`,
                "error",
              );
            }, (data.errors.length + 1) * 1000);

            logger.error("GraphQL errors:", data.errors);
          } else if (data.data?.currentViewer?.organization) {
            const org = data.data.currentViewer.organization;
            const deckCount = org.decks?.edges?.length || 0;

            sendMessage(`✅ GraphQL query successful!`, "success");
            sendMessage(`Organization: ${org.name}`, "info");
            sendMessage(`Found ${deckCount} deck(s)`, "info");

            // Process each deck
            let totalSamples = 0;
            org.decks?.edges?.forEach((deckEdge: any) => {
              const deck = deckEdge.node;
              const sampleCount = deck.samples?.edges?.length || 0;
              totalSamples += sampleCount;

              sendMessage(
                `📁 Deck "${deck.name}" (${deck.slug}): ${sampleCount} sample(s)`,
                "info",
              );

              // Show first few samples from each deck
              if (deck.samples?.edges?.length > 0) {
                deck.samples.edges.slice(0, 3).forEach(
                  (sampleEdge: any, idx: number) => {
                    const sample = sampleEdge.node;
                    sendMessage(
                      `  • Sample ${idx + 1}: ${
                        sample.name || sample.id
                      } (${sample.collectionMethod})`,
                      "info",
                    );
                  },
                );

                if (deck.samples.edges.length > 3) {
                  sendMessage(
                    `  ... and ${deck.samples.edges.length - 3} more samples`,
                    "info",
                  );
                }
              }
            });

            sendMessage(
              `Total samples across all decks: ${totalSamples}`,
              "success",
            );

            // Log detailed info to console
            logger.info("Organization data:", org);

            // Show the full response for debugging (delayed)
            setTimeout(() => {
              sendMessage(
                `Full response: ${JSON.stringify(data.data, null, 2)}`,
                "info",
              );
            }, 2000);
          } else if (data.data) {
            sendMessage(
              `Response received but no organization found. Data: ${
                JSON.stringify(data.data, null, 2)
              }`,
              "warning",
            );
          } else {
            sendMessage("Empty response from GraphQL", "warning");
          }
        } catch (error) {
          const errorMessage = error instanceof Error
            ? error.message
            : String(error);
          sendMessage(`Error fetching samples: ${errorMessage}`, "error");
          logger.error("Error testing GraphQL samples:", error);
        }
      },
    });

    // Cleanup
    return () => {
      removeButton("test-graphql-samples");
    };
  }, [addButton, removeButton, sendMessage]);

  return null; // This component doesn't render anything visible
}
