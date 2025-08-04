import { assertEquals, assertInstanceOf, assertRejects } from "@std/assert";
import { BfNode } from "@bfmono/apps/bfDb/classes/BfNode.ts";
import { CurrentViewer } from "@bfmono/apps/bfDb/classes/CurrentViewer.ts";
import { BfOrganization } from "@bfmono/apps/bfDb/nodeTypes/BfOrganization.ts";
import { BfErrorNotFound } from "@bfmono/lib/BfError.ts";
import type { BfGid } from "@bfmono/lib/types.ts";

// Mock node classes for testing
class BfPerson extends BfNode<{ name: string }> {
  static override gqlSpec = this.defineGqlNode((gql) => gql.string("name"));
  static override bfNodeSpec = this.defineBfNode((f) => f.string("name"));
}

class BfAuthor extends BfNode<{ name: string; bio: string }> {
  static override gqlSpec = this.defineGqlNode((gql) =>
    gql.string("name")
      .string("bio")
  );
  static override bfNodeSpec = this.defineBfNode((f) =>
    f.string("name")
      .string("bio")
  );
}

class BfBook extends BfNode<{ title: string; isbn: string }> {
  static override gqlSpec = this.defineGqlNode((gql) =>
    gql.string("title")
      .string("isbn")
  );
  static override bfNodeSpec = this.defineBfNode((f) =>
    f.string("title")
      .string("isbn")
      .one("author", () => BfAuthor)
  );
}

// Note: With our Phase 1 implementation, BfBook instances automatically have relationship methods

// Class with multiple relationships to the same type
class BfBookWithMultiple extends BfNode<{ title: string }> {
  static override gqlSpec = this.defineGqlNode((f) => f.string("title"));
  static override bfNodeSpec = this.defineBfNode((f) =>
    f.string("title")
      .one("author", () => BfPerson)
      .one("illustrator", () => BfPerson)
  );
}

// Note: BfBookWithMultiple instances automatically have methods for both relationships

// Helper function to setup test environment
async function setupTestEnvironment() {
  // Create a test org and CV
  const org = await BfOrganization.__DANGEROUS__createUnattached(
    CurrentViewer.__DANGEROUS_USE_IN_SCRIPTS_ONLY__createLoggedIn(
      import.meta,
    ),
    {
      name: "Test Org",
      domain: "test.com",
    },
  );
  const cv = CurrentViewer.__DANGEROUS_USE_IN_SCRIPTS_ONLY__createLoggedIn(
    import.meta,
    "test@test.com",
    org.id,
  );

  // Create test nodes
  const author = await BfAuthor.__DANGEROUS__createUnattached(cv, {
    name: "Jane Doe",
    bio: "A great author",
  });

  const book = await BfBook.__DANGEROUS__createUnattached(cv, {
    title: "Test Book",
    isbn: "123-456",
  });

  return { cv, book, author };
}

Deno.test("relationshipMethods - should generate findAuthor method", async () => {
  const { book } = await setupTestEnvironment();

  // The method should exist
  assertEquals(typeof book.findAuthor, "function");

  // Should return null when no relationship exists
  const result = await book.findAuthor();
  assertEquals(result, null);
});

Deno.test("relationshipMethods - should generate findXAuthor method", async () => {
  const { book } = await setupTestEnvironment();

  // The method should exist
  assertEquals(typeof book.findXAuthor, "function");

  // Should throw when no relationship exists
  await assertRejects(
    () => book.findXAuthor(),
    BfErrorNotFound,
    "Author not found",
  );
});

Deno.test("relationshipMethods - should generate createAuthor method", async () => {
  const { book } = await setupTestEnvironment();

  // The method should exist
  assertEquals(typeof book.createAuthor, "function");

  // Should create a new author and link it
  const newAuthor = await book.createAuthor({
    name: "John Smith",
    bio: "Another author",
  });

  assertInstanceOf(newAuthor, BfAuthor);
  assertEquals(newAuthor.props.name, "John Smith");
  assertEquals(newAuthor.props.bio, "Another author");

  // Now that edge creation is implemented, the author should be findable
  const foundAuthor = await book.findAuthor();
  assertEquals(foundAuthor?.id, newAuthor.id);
  assertEquals(foundAuthor?.props.name, "John Smith");
  assertEquals(foundAuthor?.props.bio, "Another author");
});

Deno.test("relationshipMethods - should generate unlinkAuthor method", async () => {
  const { cv, book, author } = await setupTestEnvironment();

  // The method should exist
  assertEquals(typeof book.unlinkAuthor, "function");

  // Method should be callable without throwing (stub implementation)
  await book.unlinkAuthor();

  // Find should still return null (no relationship was created)
  const foundAfter = await book.findAuthor();
  assertEquals(foundAfter, null);

  // Author node should still exist independently
  const authorStillExists = await BfAuthor.find(cv, author.id as BfGid);
  assertEquals(authorStillExists?.id, author.id);
  assertEquals(authorStillExists?.props.name, author.props.name);
  assertEquals(authorStillExists?.props.bio, author.props.bio);
});

Deno.test("relationshipMethods - should generate deleteAuthor method", async () => {
  const { cv, book, author } = await setupTestEnvironment();

  // The method should exist
  assertEquals(typeof book.deleteAuthor, "function");

  // Method should be callable without throwing (stub implementation)
  await book.deleteAuthor();

  // Since no relationship exists, findAuthor should still return null
  const foundAuthor = await book.findAuthor();
  assertEquals(foundAuthor, null);

  // Author node should still exist (no relationship to delete)
  const authorStillExists = await BfAuthor.find(cv, author.id as BfGid);
  assertEquals(authorStillExists?.id, author.id);
  assertEquals(authorStillExists?.props.name, author.props.name);
  assertEquals(authorStillExists?.props.bio, author.props.bio);
});

Deno.test("relationshipMethods - should handle multiple relationships to the same type", async () => {
  const { cv } = await setupTestEnvironment();

  const bookMulti = await BfBookWithMultiple.__DANGEROUS__createUnattached(
    cv,
    {
      title: "Illustrated Book",
    },
  );

  // Should have separate methods for each relationship
  assertEquals(
    typeof bookMulti.findAuthor,
    "function",
  );
  assertEquals(
    typeof bookMulti.findIllustrator,
    "function",
  );
  assertEquals(
    typeof bookMulti.createAuthor,
    "function",
  );
  assertEquals(
    typeof bookMulti.createIllustrator,
    "function",
  );

  // Create different people for each role
  const author = await bookMulti.createAuthor({
    name: "Author Name",
  });
  const illustrator = await bookMulti.createIllustrator({
    name: "Illustrator Name",
  });

  assertEquals(author.props.name, "Author Name");
  assertEquals(illustrator.props.name, "Illustrator Name");

  // Now that relationships are persisted, the created persons should be findable
  const foundAuthor = await bookMulti.findAuthor();
  const foundIllustrator = await bookMulti.findIllustrator();

  assertEquals(foundAuthor?.id, author.id);
  assertEquals(foundAuthor?.props.name, "Author Name");
  assertEquals(foundIllustrator?.id, illustrator.id);
  assertEquals(foundIllustrator?.props.name, "Illustrator Name");
});

Deno.test("relationshipMethods - should handle nodes with no relationships", async () => {
  class BfSimpleNode extends BfNode<{ name: string }> {
    static override gqlSpec = this.defineGqlNode((gql) => gql.string("name"));
    static override bfNodeSpec = this.defineBfNode((f) => f.string("name"));
  }

  const cv = CurrentViewer.__DANGEROUS_USE_IN_SCRIPTS_ONLY__createLoggedIn(
    import.meta,
  );
  const node = await BfSimpleNode.__DANGEROUS__createUnattached(cv, {
    name: "Simple",
  });

  // Should not have any relationship methods
  // @ts-expect-error - findAuthor doesn't exist on BfSimpleNode
  assertEquals(node.findAuthor, undefined);
  // @ts-expect-error - createAuthor doesn't exist on BfSimpleNode
  assertEquals(node.createAuthor, undefined);
});
