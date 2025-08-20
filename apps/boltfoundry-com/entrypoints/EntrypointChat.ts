import { iso } from "@iso-bfc";
import { getLogger } from "@bfmono/packages/logger/logger.ts";

const logger = getLogger(import.meta);

export const EntrypointChat = iso(`
  field Query.EntrypointChat {
    Chat
  }
`)(function EntrypointChat({ data }) {
  const Body = data.Chat;
  logger.debug("EntrypointChat data:", data);
  const title = "Chat - Bolt Foundry";
  return { Body, title };
});
