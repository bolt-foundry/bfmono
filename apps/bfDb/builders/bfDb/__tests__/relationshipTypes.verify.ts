// This file verifies that TypeScript correctly handles relationship methods
// It uses @ts-expect-error to ensure errors happen where they should

import { BfNode } from "@bfmono/apps/bfDb/classes/BfNode.ts";
import type { CurrentViewer } from "@bfmono/apps/bfDb/classes/CurrentViewer.ts";
import type { BfGid } from "@bfmono/lib/types.ts";

// Test nodes
class BfAuthor extends BfNode<{ name: string; bio: string }> {
  static override gqlSpec = this.defineGqlNode((gql) =>
    gql.string("name").string("bio")
  );
  static override bfNodeSpec = this.defineBfNode((f) =>
    f.string("name").string("bio")
  );
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

class BfMagazine extends BfNode<{ title: string }> {
  static override gqlSpec = this.defineGqlNode((f) => f.string("title"));
  static override bfNodeSpec = this.defineBfNode((f) => f.string("title"));
}

// Verify correct methods exist
async function verifyCorrectMethods() {
  const cv = {} as CurrentViewer;
  const book = await BfBook.findX(cv, "id" as BfGid);

  // These should all work without errors
  book.findAuthor();
  book.findXAuthor();
  book.createAuthor({ name: "test", bio: "test bio" });
  book.unlinkAuthor();
  book.deleteAuthor();
}

// Verify incorrect methods don't exist
async function verifyIncorrectMethods() {
  const cv = {} as CurrentViewer;
  const book = await BfBook.findX(cv, "id" as BfGid);

  // @ts-expect-error - findPublisher doesn't exist
  book.findPublisher();

  // @ts-expect-error - findIllustrator doesn't exist
  book.findIllustrator();

  // @ts-expect-error - createEditor doesn't exist
  book.createEditor({ name: "test" });
}

// Verify nodes without relationships don't have methods
async function verifyNoRelationships() {
  const cv = {} as CurrentViewer;
  const magazine = await BfMagazine.findX(cv, "id" as BfGid);

  // @ts-expect-error - findAuthor doesn't exist on BfMagazine
  magazine.findAuthor();

  // @ts-expect-error - createAuthor doesn't exist on BfMagazine
  magazine.createAuthor({ name: "test" });
}

// Verify wrong parameter types are caught
async function verifyParameterTypes() {
  const cv = {} as CurrentViewer;
  const book = await BfBook.findX(cv, "id" as BfGid);

  // @ts-expect-error - missing required property 'bio'
  book.createAuthor({ name: "test" });

  // @ts-expect-error - wrong property type
  book.createAuthor({ name: "test", bio: 123 });

  // @ts-expect-error - extra property
  book.createAuthor({ name: "test", bio: "test", extraProp: true });
}

// Verify return types are correct
async function verifyReturnTypes() {
  const cv = {} as CurrentViewer;
  const book = await BfBook.findX(cv, "id" as BfGid);

  // Correct types
  const _author1: Promise<BfAuthor | null> = book.findAuthor();
  const _author2: Promise<BfAuthor> = book.findXAuthor();
  const _author3: Promise<BfAuthor> = book.createAuthor({
    name: "test",
    bio: "bio",
  });
  const _void1: Promise<void> = book.unlinkAuthor();
  const _void2: Promise<void> = book.deleteAuthor();

  // @ts-expect-error - findAuthor returns BfAuthor | null, not BfAuthor
  const _wrongType1: Promise<BfAuthor> = book.findAuthor();

  // Test the distinction between find and findX
  // find can return null
  const _canBeNull: Promise<BfAuthor | null> = book.findAuthor();

  // findX never returns null (it throws instead)
  const _neverNull: Promise<BfAuthor> = book.findXAuthor();

  // The point is: findXAuthor returns Promise<BfAuthor> (never null/undefined)
  // TypeScript correctly allows assigning this to Promise<BfAuthor | undefined>
  // because BfAuthor is a valid member of the union type
  const _thisIsValid: Promise<BfAuthor | undefined> = book.findXAuthor();

  // @ts-expect-error - createAuthor returns BfAuthor, not void
  const _wrongType3: Promise<void> = book.createAuthor({
    name: "test",
    bio: "bio",
  });
}

// Export to prevent unused variable errors
export {
  verifyCorrectMethods,
  verifyIncorrectMethods,
  verifyNoRelationships,
  verifyParameterTypes,
  verifyReturnTypes,
};
