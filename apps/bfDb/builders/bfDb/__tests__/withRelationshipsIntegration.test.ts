// Integration test for WithRelationships with real BfNode instances
// Verifies type system works with actual BfNode.findX, create, and query methods

import { assertEquals } from "@std/assert";
import { BfNode } from "@bfmono/apps/bfDb/classes/BfNode.ts";
import type { WithRelationships } from "@bfmono/apps/bfDb/builders/bfDb/relationshipMethods.ts";
import type { CurrentViewer } from "@bfmono/apps/bfDb/classes/CurrentViewer.ts";
import type { BfGid } from "@bfmono/lib/types.ts";

// Real test nodes
class IntegrationAuthor extends BfNode<{ name: string; bio: string }> {
  static override gqlSpec = this.defineGqlNode((gql) =>
    gql.string("name").string("bio")
  );
  static override bfNodeSpec = this.defineBfNode((f) =>
    f.string("name").string("bio")
  );
}

class IntegrationBook extends BfNode<{ title: string; isbn: string }> {
  static override gqlSpec = this.defineGqlNode((gql) =>
    gql.string("title").string("isbn")
  );
  static override bfNodeSpec = this.defineBfNode((f) =>
    f.string("title")
      .string("isbn")
      .one("author", () => IntegrationAuthor)
  );
}

Deno.test("WithRelationships - integration with BfNode.findX", () => {
  const _typeTest = async () => {
    const cv = {} as CurrentViewer;

    // BfNode.findX should return WithRelationships type
    const book: WithRelationships<typeof IntegrationBook> =
      await IntegrationBook.findX(cv, "test-id" as BfGid);

    // All relationship methods should be available
    const _findAuthor: Promise<IntegrationAuthor | null> = book.findAuthor();
    const _findXAuthor: Promise<IntegrationAuthor> = book.findXAuthor();
    const _createAuthor: Promise<IntegrationAuthor> = book.createAuthor({
      name: "Jane Doe",
      bio: "Author bio",
    });
    const _unlinkAuthor: Promise<void> = book.unlinkAuthor();
    const _deleteAuthor: Promise<void> = book.deleteAuthor();
  };

  assertEquals(true, true, "BfNode.findX returns WithRelationships type");
});

Deno.test("WithRelationships - integration with BfNode.find", () => {
  const _typeTest = async () => {
    const cv = {} as CurrentViewer;

    // BfNode.find should return WithRelationships type or null
    const book: WithRelationships<typeof IntegrationBook> | null =
      await IntegrationBook.find(cv, "test-id" as BfGid);

    if (book) {
      // All relationship methods should be available
      const _author: Promise<IntegrationAuthor | null> = book.findAuthor();
    }
  };

  assertEquals(true, true, "BfNode.find returns WithRelationships type | null");
});

Deno.test("WithRelationships - integration with BfNode.query", () => {
  const _typeTest = async () => {
    const cv = {} as CurrentViewer;

    // BfNode.query should return array of WithRelationships
    const books: Array<WithRelationships<typeof IntegrationBook>> =
      await IntegrationBook.query(cv, {}, {}, []);

    const firstBook = books[0];
    if (firstBook) {
      // All relationship methods should be available
      const _author: Promise<IntegrationAuthor | null> = firstBook.findAuthor();
    }
  };

  assertEquals(true, true, "BfNode.query returns Array<WithRelationships>");
});

Deno.test("WithRelationships - integration with BfNode.__DANGEROUS__createUnattached", () => {
  const _typeTest = async () => {
    const cv = {} as CurrentViewer;

    // BfNode.__DANGEROUS__createUnattached should return WithRelationships type
    const newBook: WithRelationships<typeof IntegrationBook> =
      await IntegrationBook.__DANGEROUS__createUnattached(cv, {
        title: "New Book",
        isbn: "123456",
      });

    // All relationship methods should be available
    const _author: Promise<IntegrationAuthor> = newBook.createAuthor({
      name: "New Author",
      bio: "Bio",
    });
  };

  assertEquals(
    true,
    true,
    "BfNode.__DANGEROUS__createUnattached returns WithRelationships",
  );
});

// Export to prevent unused warnings
export { IntegrationAuthor, IntegrationBook };
