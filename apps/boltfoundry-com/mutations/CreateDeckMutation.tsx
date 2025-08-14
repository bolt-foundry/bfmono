import { iso } from "@bfmono/apps/boltfoundry-com/__generated__/__isograph/iso.ts";
import { getLogger } from "@bfmono/packages/logger/logger.ts";

const logger = getLogger(import.meta);

export const CreateDeckMutation = iso(`
  field Mutation.CreateDeck($name: String!, $description: String, $content: String!, $slug: String!) {
    createDeck(name: $name, description: $description, content: $content, slug: $slug) {
      id
      name
      description
      slug
      content
    }
  }
`)(function CreateDeck({ data }) {
  logger.debug("CreateDeck mutation result", data);
  return data.createDeck;
});
