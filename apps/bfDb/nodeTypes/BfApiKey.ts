import { BfNode, type InferProps } from "@bfmono/apps/bfDb/classes/BfNode.ts";
import type { BfGid } from "@bfmono/lib/types.ts";

export class BfApiKey extends BfNode<InferProps<typeof BfApiKey>> {
  static override gqlSpec = this.defineGqlNode((node) =>
    node
      .string("key")
      .string("description")
      .string("organizationId")
      .string("lastUsedAt")
      .object("organization", () =>
        import("./BfOrganization.ts").then((m) => m.BfOrganization), {
        resolve: async (apiKey, _args, ctx) => {
          if (!apiKey.organizationId) {
            return null;
          }
          const { BfOrganization } = await import("./BfOrganization.ts");
          return await BfOrganization.find(
            ctx.getCurrentViewer(),
            apiKey.organizationId as BfGid,
          );
        },
      })
  );

  static override bfNodeSpec = this.defineBfNode((node) =>
    node
      .string("key")
      .string("description")
      .string("organizationId")
      .string("lastUsedAt")
  );

  /**
   * Generate a unique API key for an organization
   */
  static generateKeyForOrganization(organizationId: string): string {
    // Format: bf+{organizationId}
    return `bf+${organizationId}`;
  }

  /**
   * Verify if a key matches the expected format for an organization
   */
  static verifyKeyForOrganization(
    key: string,
    organizationId: string,
  ): boolean {
    return key === `bf+${organizationId}`;
  }
}
