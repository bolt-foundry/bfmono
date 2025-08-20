import { assertEquals } from "@std/assert";
import { BfNode } from "@bfmono/apps/bfDb/classes/BfNode.ts";
import { CurrentViewer } from "@bfmono/apps/bfDb/classes/CurrentViewer.ts";
import { BfOrganization } from "@bfmono/apps/bfDb/nodeTypes/BfOrganization.ts";
import type { Connection, ConnectionArguments } from "graphql-relay";
import type { JSONValue } from "@bfmono/apps/bfDb/bfDb.ts";

// Mock node classes for testing many relationships
class BfReview extends BfNode<{ rating: number; text: string }> {
  static override gqlSpec = this.defineGqlNode((gql) =>
    gql.int("rating")
      .string("text")
  );
  static override bfNodeSpec = this.defineBfNode((f) =>
    f.number("rating")
      .string("text")
  );
}

class BfBookWithManyReviews extends BfNode<{ title: string; isbn: string }> {
  static override gqlSpec = this.defineGqlNode((gql) =>
    gql.string("title")
      .string("isbn")
  );
  static override bfNodeSpec = this.defineBfNode((f) =>
    f.string("title")
      .string("isbn")
      .many("reviews", () => BfReview)
  );
}

// The relationship methods are automatically generated via RelationshipMethods<T> in BfNode

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
  const book = await BfBookWithManyReviews.__DANGEROUS__createUnattached(cv, {
    title: "Test Book",
    isbn: "123-456",
  });

  return { cv, book };
}

Deno.test("Many relationship methods - findAll{RelationName}() should be generated", async () => {
  const { book } = await setupTestEnvironment();

  // Verify the method exists
  assertEquals(typeof book.findAllReviews, "function");

  // Call the method - should return empty array initially
  const reviews = await book.findAllReviews();
  assertEquals(Array.isArray(reviews), true);
  assertEquals(reviews.length, 0);
});

Deno.test("Many relationship methods - connectionFor{RelationName}() should be generated", async () => {
  const { book } = await setupTestEnvironment();

  // Verify the method exists
  assertEquals(typeof book.connectionForReviews, "function");

  // Call the method - should return a GraphQL connection
  const connection: Connection<BfReview> = await book
    .connectionForReviews();

  // Verify connection structure
  assertEquals(typeof connection, "object");
  assertEquals(Array.isArray(connection.edges), true);
  assertEquals(typeof connection.pageInfo, "object");
  assertEquals(typeof connection.pageInfo.hasNextPage, "boolean");
  assertEquals(typeof connection.pageInfo.hasPreviousPage, "boolean");
  assertEquals(connection.edges.length, 0);
});

Deno.test("Many relationship methods - connectionFor{RelationName}() with args should work", async () => {
  const { book } = await setupTestEnvironment();

  // Call with connection arguments
  const connection: Connection<BfReview> = await book
    .connectionForReviews({
      first: 10,
      where: { rating: 5 },
    });

  // Should still return valid connection structure
  assertEquals(typeof connection, "object");
  assertEquals(Array.isArray(connection.edges), true);
  assertEquals(typeof connection.pageInfo, "object");
});

Deno.test("Many relationship methods - query{RelationName}() should be generated", async () => {
  const { cv, book } = await setupTestEnvironment();

  // Verify the method exists
  assertEquals(typeof book.queryReviews, "function");

  // Create some test reviews
  const review1 = await book.createReviewsItem({
    rating: 5,
    text: "Great book!",
  });

  const review2 = await book.createReviewsItem({
    rating: 3,
    text: "Average book",
  });

  // Query all reviews
  const allReviews = await book.queryReviews();
  assertEquals(allReviews.length, 2);

  // Query with filter
  const fiveStarReviews = await book.queryReviews({ rating: 5 });
  assertEquals(fiveStarReviews.length, 1);
  assertEquals(fiveStarReviews[0].props.rating, 5);
});

Deno.test("Many relationship methods - create{RelationName}Item() should be generated", async () => {
  const { book } = await setupTestEnvironment();

  // Verify the method exists
  assertEquals(typeof book.createReviewsItem, "function");

  // Create a review using the new method
  const review = await book.createReviewsItem({
    rating: 4,
    text: "Good read!",
  });

  // Verify the review was created
  assertEquals(review.props.rating, 4);
  assertEquals(review.props.text, "Good read!");

  // Verify it's linked to the book
  const allReviews = await book.findAllReviews();
  assertEquals(allReviews.length, 1);
  assertEquals(allReviews[0].id, review.id);
});

Deno.test("Many relationship methods - type safety verification", async () => {
  // This test verifies that TypeScript compilation passes with correct types
  // We use a real instance to test the type system
  const { book } = await setupTestEnvironment();

  // These should compile without errors if types are correct
  const _findAllReviewsType: () => Promise<Array<BfReview>> =
    book.findAllReviews;
  const _queryReviewsType: (
    where?: Record<string, JSONValue>,
  ) => Promise<Array<BfReview>> = book.queryReviews;
  const _createReviewsItemType: (
    props: { rating: number; text: string },
  ) => Promise<BfReview> = book.createReviewsItem;
  const _connectionForReviewsType: (
    args?: ConnectionArguments & { where?: Record<string, JSONValue> },
  ) => Promise<Connection<BfReview>> = book.connectionForReviews;

  // If we get here without TypeScript errors, the types are working
  assertEquals(true, true);
});
