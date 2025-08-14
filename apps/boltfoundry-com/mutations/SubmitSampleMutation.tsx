import { iso } from "@bfmono/apps/boltfoundry-com/__generated__/__isograph/iso.ts";
import { getLogger } from "@bfmono/packages/logger/logger.ts";

const logger = getLogger(import.meta);

export const SubmitSampleMutation = iso(`
  field Mutation.SubmitSample($deckId: String!, $completionData: String!, $collectionMethod: String, $name: String) {
    submitSample(deckId: $deckId, completionData: $completionData, collectionMethod: $collectionMethod, name: $name) {
      id
      name
      completionData
      collectionMethod
    }
  }
`)(function SubmitSample({ data }) {
  logger.debug("SubmitSample mutation result", data);
  return data.submitSample;
});
