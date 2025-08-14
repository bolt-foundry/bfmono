import { iso } from "@bfmono/apps/boltfoundry-com/__generated__/__isograph/iso.ts";
import { getLogger } from "@bfmono/packages/logger/logger.ts";
import type { GradingSample } from "@bfmono/apps/boltfoundry-com/types/grading.ts";

const logger = getLogger(import.meta);

export const SamplesQuery = iso(`
  field BfDeck.SamplesForGrading @component {
    id
    name
    content
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
`)(function SamplesQueryComponent({ data }) {
  logger.debug("SamplesQuery data", data);

  const deck = data;

  const samples: Array<GradingSample> =
    deck.samples?.edges?.map((edge: any) => {
      const node = edge.node;
      let completionData: any = {};

      try {
        completionData = node?.completionData
          ? JSON.parse(node.completionData)
          : {};
      } catch (e) {
        logger.error("Failed to parse completion data", e);
      }

      return {
        id: node?.id || "",
        timestamp: new Date().toISOString(), // TODO: Add timestamp field to BfSample
        duration: 150, // TODO: Extract from completion data
        provider: completionData.provider || "unknown",
        request: {
          body: completionData.request || {
            messages: [],
          },
        },
        response: {
          body: completionData.response || {
            choices: [],
          },
        },
        graderEvaluations: [], // TODO: Add grader evaluations from GraphQL
        bfMetadata: {
          deckName: deck.name || "Unknown",
          deckContent: deck.content || "",
          contextVariables: {},
        },
      };
    }) || [];

  return {
    samples,
    deckName: deck.name || "Unknown Deck",
  };
});
