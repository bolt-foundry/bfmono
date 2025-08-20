import { iso } from "@iso-bfc";
import { getLogger } from "@bfmono/packages/logger/logger.ts";

const logger = getLogger(import.meta);

export const EntrypointHome = iso(`
  field Query.EntrypointHome {
    Home
  }
`)(function EntrypointHome({ data }) {
  const Body = data.Home;
  logger.debug("dataer", data);
  const title = "Bolt Foundry: Unit Tests for LLMs.";
  return { Body, title };
});
