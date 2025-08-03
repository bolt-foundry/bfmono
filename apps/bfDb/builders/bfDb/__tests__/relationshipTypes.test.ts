import { assertEquals } from "@std/assert";
import { BfNode } from "@bfmono/apps/bfDb/classes/BfNode.ts";
import type { InferProps as _InferProps } from "@bfmono/apps/bfDb/classes/BfNode.ts";
import type { CurrentViewer } from "@bfmono/apps/bfDb/classes/CurrentViewer.ts";
import type { BfGid } from "@bfmono/lib/types.ts";

// Test nodes for type checking
class BfAuthor extends BfNode<{ name: string; bio: string }> {
  static override gqlSpec = this.defineGqlNode((gql) =>
    gql.string("name").string("bio")
  );
  static override bfNodeSpec = this.defineBfNode((f) =>
    f.string("name").string("bio")
  );
}

class BfPerson extends BfNode<{ name: string }> {
  static override gqlSpec = this.defineGqlNode((gql) => gql.string("name"));
  static override bfNodeSpec = this.defineBfNode((f) => f.string("name"));
}

class BfBook extends BfNode<{ title: string; isbn: string }> {
  static override gqlSpec = this.defineGqlNode((gql) =>
    gql.string("title").string("isbn")
  );
  static override bfNodeSpec = this.defineBfNode((f) =>
    f.string("title")
      .string("isbn")
      .one("author", () => BfAuthor)
  );
}

// Book with multiple relationships to the same type
class BfBookWithMultiple extends BfNode<{ title: string }> {
  static override gqlSpec = this.defineGqlNode((f) => f.string("title"));
  static override bfNodeSpec = this.defineBfNode((f) =>
    f.string("title")
      .one("author", () => BfPerson)
      .one("illustrator", () => BfPerson)
  );
}

Deno.test("Type test - relationship methods are automatically available", () => {
  // This test verifies that TypeScript types work correctly
  // The actual runtime implementation comes in Phase 2
  // For Phase 1, we only check that the types compile correctly

  // Create a type-level test function that won't execute
  const _typeTest = async () => {
    const cv = {} as CurrentViewer;
    const book = await BfBook.findX(cv, "test-id" as BfGid);

    // These should all be valid method calls with proper types
    // TypeScript will check these at compile time
    const _author1: Promise<BfAuthor | null> = book.findAuthor();
    const _author2: Promise<BfAuthor> = book.findXAuthor();
    const _author3: Promise<BfAuthor> = book.createAuthor({
      name: "test",
      bio: "test bio",
    });
    const _author4: Promise<void> = book.unlinkAuthor();
    const _author5: Promise<void> = book.deleteAuthor();

    // Test find vs findX distinction - findX never returns null
    // This is valid in TypeScript (assigning non-nullable to nullable)
    const _validAssignment: Promise<BfAuthor | null> = book.findXAuthor();

    // But this would be an error (assigning nullable to non-nullable)
    // @ts-expect-error - findAuthor returns BfAuthor | null, not BfAuthor
    const _wrongType: Promise<BfAuthor> = book.findAuthor();
  };

  // Type test passes if it compiles
  assertEquals(true, true, "Type definitions compile successfully");
});

Deno.test("Type test - multiple relationships to same type", () => {
  // Type-level test for multiple relationships
  const _typeTest = async () => {
    const cv = {} as CurrentViewer;
    const bookMulti = await BfBookWithMultiple.findX(cv, "test-id" as BfGid);

    // Each relationship should have its own methods
    const _author1: Promise<BfPerson | null> = bookMulti.findAuthor();
    const _illustrator1: Promise<BfPerson | null> = bookMulti.findIllustrator();

    // Methods should be properly typed
    const _author2: Promise<BfPerson> = bookMulti.createAuthor({
      name: "Author Name",
    });
    const _illustrator2: Promise<BfPerson> = bookMulti.createIllustrator({
      name: "Illustrator Name",
    });
  };

  assertEquals(true, true, "Multiple relationship types compile successfully");
});

Deno.test("Type test - nodes without relationships work correctly", () => {
  const _typeTest = async () => {
    const cv = {} as CurrentViewer;
    const author = await BfAuthor.findX(cv, "test-id" as BfGid);

    // BfAuthor has no relationships, so no relationship methods should exist
    // TypeScript correctly prevents accessing non-existent methods
    // const _shouldNotExist = author.findBook; // ✗ This would be a compile error

    // Regular BfNode methods should still work
    const _save = author.save;
    const _load = author.load;
  };

  assertEquals(true, true, "Nodes without relationships compile correctly");
});

// Type-level tests (these won't run but will catch type errors at compile time)
type _TestRelationshipMethodsExist = () => void;
const _testTypes: _TestRelationshipMethodsExist = async () => {
  const cv = {} as CurrentViewer;

  // Test that query also returns nodes with relationship methods
  const books = await BfBook.query(cv, {}, {}, []);
  const firstBook = books[0];
  const _a: Promise<BfAuthor | null> = firstBook.findAuthor();

  // Test that __DANGEROUS__createUnattached also includes relationship methods
  const newBook = await BfBook.__DANGEROUS__createUnattached(cv, {
    title: "New Book",
    isbn: "123456",
  });
  const _b: Promise<BfAuthor> = newBook.createAuthor({
    name: "New Author",
    bio: "Bio",
  });
};
