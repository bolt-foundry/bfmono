// Verification tests for WithRelationships type
// Uses @ts-expect-error to ensure type errors occur where expected

import type { WithRelationships } from "@bfmono/apps/bfDb/builders/bfDb/relationshipMethods.ts";
import { BfNode } from "@bfmono/apps/bfDb/classes/BfNode.ts";

// Test nodes
class VerifyAuthor extends BfNode<{ name: string; bio: string }> {
  static override gqlSpec = this.defineGqlNode((gql) =>
    gql.string("name").string("bio")
  );
  static override bfNodeSpec = this.defineBfNode((f) =>
    f.string("name").string("bio")
  );
}

class VerifyBook extends BfNode<{ title: string; isbn: string }> {
  static override gqlSpec = this.defineGqlNode((gql) =>
    gql.string("title").string("isbn")
  );
  static override bfNodeSpec = this.defineBfNode((f) =>
    f.string("title")
      .string("isbn")
      .one("author", () => VerifyAuthor)
  );
}

// Verify incorrect methods don't exist
function verifyTypeErrors() {
  const book = {} as WithRelationships<typeof VerifyBook>;

  // @ts-expect-error - findPublisher doesn't exist
  book.findPublisher();

  // @ts-expect-error - findIllustrator doesn't exist
  book.findIllustrator();

  // @ts-expect-error - createEditor doesn't exist
  book.createEditor({ name: "test" });

  const author = {} as WithRelationships<typeof VerifyAuthor>;

  // @ts-expect-error - findBook doesn't exist on VerifyAuthor
  author.findBook();

  // @ts-expect-error - createBook doesn't exist on VerifyAuthor
  author.createBook({ title: "test", isbn: "123" });
}

// Verify wrong parameter types are caught
function verifyParameterTypes() {
  const book = {} as WithRelationships<typeof VerifyBook>;

  // @ts-expect-error - missing required property 'bio'
  book.createAuthor({ name: "test" });

  // @ts-expect-error - wrong property type
  book.createAuthor({ name: "test", bio: 123 });

  // @ts-expect-error - extra property
  book.createAuthor({ name: "test", bio: "test", extraProp: true });
}

// Verify return types are correct
function verifyReturnTypes() {
  const book = {} as WithRelationships<typeof VerifyBook>;

  // Correct types
  const _author1: Promise<VerifyAuthor | null> = book.findAuthor();
  const _author2: Promise<VerifyAuthor> = book.findXAuthor();
  const _author3: Promise<VerifyAuthor> = book.createAuthor({
    name: "test",
    bio: "bio",
  });
  const _void1: Promise<void> = book.unlinkAuthor();
  const _void2: Promise<void> = book.deleteAuthor();

  // @ts-expect-error - findAuthor returns VerifyAuthor | null, not VerifyAuthor
  const _wrongType1: Promise<VerifyAuthor> = book.findAuthor();

  // @ts-expect-error - createAuthor returns VerifyAuthor, not void
  const _wrongType3: Promise<void> = book.createAuthor({
    name: "test",
    bio: "bio",
  });
}

// Export to prevent unused variable errors
export {
  VerifyAuthor,
  VerifyBook,
  verifyParameterTypes,
  verifyReturnTypes,
  verifyTypeErrors,
};
