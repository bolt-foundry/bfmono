import { GraphQLObjectBase } from "../GraphQLObjectBase.ts";
import { PublishedDocument } from "@bfmono/apps/bfDb/nodeTypes/PublishedDocument.ts";
import { BlogPost } from "@bfmono/apps/bfDb/nodeTypes/BlogPost.ts";
import { GithubRepoStats } from "@bfmono/apps/bfDb/nodeTypes/GithubRepoStats.ts";
import { CurrentViewer } from "@bfmono/apps/bfDb/classes/CurrentViewer.ts";
import { BfApiKey } from "@bfmono/apps/bfDb/nodeTypes/BfApiKey.ts";
import { BfDeck } from "@bfmono/apps/bfDb/nodeTypes/rlhf/BfDeck.ts";
import { BfOrganization } from "@bfmono/apps/bfDb/nodeTypes/BfOrganization.ts";
import type { BfGid } from "@bfmono/lib/types.ts";

export class Query extends GraphQLObjectBase {
  static override gqlSpec = this.defineGqlNode((field) =>
    field
      .boolean("ok")
      .object("documentsBySlug", () => PublishedDocument, {
        args: (a) => a.string("slug"),
        resolve: async (_root, args, _ctx, _info) => {
          const slug = (args.slug as string) || "getting-started";
          const post = await PublishedDocument.findX(slug).catch(() => null);
          return post;
        },
      })
      .object("blogPost", () => BlogPost, {
        args: (a) => a.string("slug"),
        resolve: async (_root, args, _ctx, _info) => {
          const slug = (args.slug as string) || "README";
          const post = await BlogPost.findX(slug).catch(() => null);
          return post;
        },
      })
      .connection("blogPosts", () => BlogPost, {
        args: (a) =>
          a
            .string("sortDirection")
            .string("filterByYear"),
        resolve: async (_root, args, _ctx) => {
          // Default to reverse chronological order
          const sortDir = (args.sortDirection as "ASC" | "DESC") || "DESC";
          const posts = await BlogPost.listAll(sortDir);

          // Apply year filter if provided
          const filtered = args.filterByYear
            ? posts.filter((p) => p.id.startsWith(args.filterByYear as string))
            : posts;

          // Return relay connection
          return BlogPost.connection(filtered, args);
        },
      })
      .object("githubRepoStats", () => GithubRepoStats, {
        resolve: async () => {
          return await GithubRepoStats.findX();
        },
      })
      .object("deck", () => BfDeck, {
        args: (a) => a.string("slug"),
        resolve: async (_root, args, ctx) => {
          const cv = ctx.getCurrentViewer();
          const slug = args.slug as string;

          if (!slug) {
            return null;
          }

          // Query by slug within organization
          const decks = await BfDeck.query(
            cv,
            { bfOid: cv.orgBfOid, className: "BfDeck" },
            { slug },
            [],
          );

          return decks[0] || null;
        },
      })
      .connection("organizationApiKeys", () => BfApiKey, {
        args: (a) => a.string("organizationId"),
        resolve: async (_root, args, ctx) => {
          const cv = ctx.getCurrentViewer();
          const orgId = (args.organizationId as BfGid) || cv.orgBfOid;

          // Fetch the organization
          const org = await BfOrganization.find(cv, orgId);
          if (!org) {
            return BfApiKey.connection([], args);
          }

          // Return connection using the organization's apiKeys relationship
          return await org.connectionForApiKeys(args);
        },
      })
      .nonNull.object("currentViewer", () => CurrentViewer, {
        resolve: (_root, _args, ctx) => {
          return ctx.getCvForGraphql();
        },
      })
  );

  override toGraphql() {
    return { __typename: "Query", id: "Query" };
  }
}
