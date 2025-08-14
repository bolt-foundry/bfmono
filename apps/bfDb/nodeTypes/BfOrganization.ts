import { BfNode, type InferProps } from "@bfmono/apps/bfDb/classes/BfNode.ts";
import { BfDeck } from "@bfmono/apps/bfDb/nodeTypes/rlhf/BfDeck.ts";

export class BfOrganization extends BfNode<InferProps<typeof BfOrganization>> {
  static override gqlSpec = this.defineGqlNode((node) =>
    node
      .string("name")
      .string("domain")
      .connection("decks", () => BfDeck, {
        resolve: async (org, args, ctx) => {
          // The 'org' here is a plain object from toGraphql(), not a BfOrganization instance
          // We need to fetch the actual organization instance to use its methods
          const actualOrg = await BfOrganization.find(
            ctx.getCurrentViewer(),
            org.id,
          );
          if (!actualOrg) {
            throw new Error(`Organization not found: ${org.id}`);
          }
          return await actualOrg.connectionForDecks(args);
        },
      })
    // Removing the members relationship for now to focus on 1:1
  );
  static override bfNodeSpec = this.defineBfNode((node) =>
    node
      .string("name")
      .string("domain")
      .many("decks", () => BfDeck)
  );

  /**
   * Lifecycle hook: Auto-create demo RLHF content for new organizations
   */
  protected override async afterCreate(): Promise<void> {
    await this.addDemoDeck();
  }

  /**
   * Create demo RLHF deck for this organization
   */
  async addDemoDeck(): Promise<void> {
    try {
      // TODO: Remove this demo deck when we have a real database with actual user decks
      const deckPath = new URL(
        import.meta.resolve("./rlhf/demo-decks/fastpitch-demo.deck.md"),
      ).pathname;
      const deckProps = await BfDeck.readPropsFromFile(deckPath);
      await this.createTargetNode(BfDeck, deckProps);
    } catch (_error) {
      // In compiled binaries, the deck file might not be available
      // Create a simple fastpitch deck instead
      const logger = (await import("@bfmono/packages/logger/logger.ts"))
        .getLogger(import.meta);
      logger.info(
        "Could not load demo deck file, creating fastpitch demo deck",
      );
      await this.createTargetNode(BfDeck, {
        name: "Fastpitch Story Selection",
        slug: "fastpitch",
        description:
          "Evaluates the quality of curated AI news story selections from the latest articles",
        content:
          "# Fastpitch Story Selection\n\nEvaluates the quality of curated AI news story selections from the latest articles.",
      });
    }
  }
}
