import { iso } from "@iso-bfc";
import { getLogger } from "@bfmono/packages/logger/logger.ts";

const logger = getLogger(import.meta);

export const EntrypointAnalyze = iso(`
  field Query.EntrypointAnalyze {
    Analyze
  }
`)(function EntrypointAnalyze({ data }) {
  const Body = data.Analyze;
  logger.debug("EntrypointAnalyze data:", data);
  const title = "Analyze - Bolt Foundry";
  return { Body, title };
});
