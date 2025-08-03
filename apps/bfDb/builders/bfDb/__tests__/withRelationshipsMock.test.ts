// Test WithRelationships type with mock types to verify type system works
// These tests verify the type definitions without runtime implementation

import { assertEquals } from "@std/assert";
import type { WithRelationships } from "@bfmono/apps/bfDb/builders/bfDb/relationshipMethods.ts";
import { BfNode } from "@bfmono/apps/bfDb/classes/BfNode.ts";
import type { CurrentViewer as _CurrentViewer } from "@bfmono/apps/bfDb/classes/CurrentViewer.ts";

// Create proper mock nodes that extend BfNode
class MockAuthorNode extends BfNode<{ name: string; bio: string }> {
  static override gqlSpec = this.defineGqlNode((gql) =>
    gql.string("name").string("bio")
  );
  static override bfNodeSpec = this.defineBfNode((f) =>
    f.string("name").string("bio")
  );
}

class MockPersonNode extends BfNode<{ name: string }> {
  static override gqlSpec = this.defineGqlNode((gql) => gql.string("name"));
  static override bfNodeSpec = this.defineBfNode((f) => f.string("name"));
}

class MockBookNode extends BfNode<{ title: string; isbn: string }> {
  static override gqlSpec = this.defineGqlNode((gql) =>
    gql.string("title").string("isbn")
  );
  static override bfNodeSpec = this.defineBfNode((f) =>
    f.string("title")
      .string("isbn")
      .one("author", () => MockAuthorNode)
      .one("illustrator", () => MockPersonNode)
  );
}

Deno.test("WithRelationships type augments node with correct methods", () => {
  // Type-level test to verify WithRelationships generates expected methods
  const _typeTest = () => {
    // Create a book with relationship methods
    const book = {} as WithRelationships<typeof MockBookNode>;

    // Verify base properties exist
    const _id: string = book.id;
    const _props: { title: string; isbn: string } = book.props;

    // Verify author relationship methods exist with correct types
    const _findAuthor: () => Promise<MockAuthorNode | null> = book.findAuthor;
    const _findXAuthor: () => Promise<MockAuthorNode> = book.findXAuthor;
    const _createAuthor: (
      props: { name: string; bio: string },
    ) => Promise<MockAuthorNode> = book.createAuthor;
    const _unlinkAuthor: () => Promise<void> = book.unlinkAuthor;
    const _deleteAuthor: () => Promise<void> = book.deleteAuthor;

    // Verify illustrator relationship methods exist with correct types
    const _findIllustrator: () => Promise<MockPersonNode | null> =
      book.findIllustrator;
    const _findXIllustrator: () => Promise<MockPersonNode> =
      book.findXIllustrator;
    const _createIllustrator: (
      props: { name: string },
    ) => Promise<MockPersonNode> = book.createIllustrator;
    const _unlinkIllustrator: () => Promise<void> = book.unlinkIllustrator;
    const _deleteIllustrator: () => Promise<void> = book.deleteIllustrator;
  };

  // Test passes if it compiles
  assertEquals(true, true, "WithRelationships type generates correct methods");
});

Deno.test("WithRelationships handles nodes without relationships", () => {
  const _typeTest = () => {
    // Node without relationships should still work
    const author = {} as WithRelationships<typeof MockAuthorNode>;

    // Base properties should exist
    const _id: string = author.id;
    const _props: { name: string; bio: string } = author.props;

    // No relationship methods should exist
    // TypeScript correctly prevents accessing non-existent methods
    // const _invalid = author.findBook; // ✗ This would be a compile error
  };

  assertEquals(true, true, "Nodes without relationships work correctly");
});

// Export test function to prevent unused variable warnings
export { MockAuthorNode, MockBookNode, MockPersonNode };
