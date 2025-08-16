import { iso } from "@iso-bfc";
import { getLogger } from "@bfmono/packages/logger/logger.ts";

const logger = getLogger(import.meta);

export const EntrypointEval = iso(`
  field Query.EntrypointEval($deckId: String, $sampleId: String) {
    Eval(deckId: $deckId, sampleId: $sampleId)
  }
`)(function EntrypointEval({ data }) {
  const Body = data.Eval;
  logger.debug("EntrypointEval data with parameters:", data);
  const title = "Eval - Bolt Foundry";
  return { Body, title };
});
