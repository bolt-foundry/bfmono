import { BfNode, type InferProps } from "@bfmono/apps/bfDb/classes/BfNode.ts";
import { BfDeck } from "@bfmono/apps/bfDb/nodeTypes/rlhf/BfDeck.ts";

export class BfOrganization extends BfNode<InferProps<typeof BfOrganization>> {
  static override gqlSpec = this.defineGqlNode((node) =>
    node
      .string("name")
      .string("domain")
      .connection("decks", () => BfDeck, {
        resolve: async (org, args) => {
          return await org.connectionForDeck(args);
        },
      })
    // Removing the members relationship for now to focus on 1:1
  );
  static override bfNodeSpec = this.defineBfNode((node) =>
    node
      .string("name")
      .string("domain")
      .many("deck", () => BfDeck)
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
    const deckPath = new URL(
      import.meta.resolve("./rlhf/demo-decks/customer-support-demo.deck.md"),
    ).pathname;
    const deckProps = await BfDeck.readPropsFromFile(deckPath);
    await this.createTargetNode(BfDeck, deckProps);
  }
}
