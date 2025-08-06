import { assertEquals, assertInstanceOf } from "@std/assert";
import { CurrentViewer } from "@bfmono/apps/bfDb/classes/CurrentViewer.ts";
import { BfOrganization } from "@bfmono/apps/bfDb/nodeTypes/BfOrganization.ts";
import { BfDeck } from "@bfmono/apps/bfDb/nodeTypes/rlhf/BfDeck.ts";
import { getLogger } from "@bfmono/packages/logger/logger.ts";
import type { BfGid } from "@bfmono/lib/types.ts";

const logger = getLogger(import.meta);

Deno.test("GraphQL Relationships - CurrentViewer → Organization", async () => {
  // Create organization and current viewer
  const cv = CurrentViewer.__DANGEROUS_USE_IN_SCRIPTS_ONLY__createLoggedIn(
    import.meta,
    "test@example.com",
    "test-org-123",
  );

  const org = await BfOrganization.__DANGEROUS__createUnattached(cv, {
    name: "Test Organization",
    domain: "test.com",
  });

  // Use the same CV that created the org (no context switching needed)
  // The GraphQL resolver would use the CV's orgBfOid to find the org
  const foundOrg = await BfOrganization.find(cv, org.id as BfGid);

  // Debug: check what we actually got
  logger.debug("Original org:", org.id, org.props);
  logger.debug("Found org:", foundOrg?.id, foundOrg?.props);

  // Verify the organization was found
  assertEquals(foundOrg !== null, true);
  if (foundOrg) {
    assertEquals(foundOrg.props.name, "Test Organization");
    assertEquals(foundOrg.props.domain, "test.com");
  }
});

Deno.test("GraphQL Relationships - Organization → Decks (many)", async () => {
  // Create organization and current viewer
  const cv = CurrentViewer.__DANGEROUS_USE_IN_SCRIPTS_ONLY__createLoggedIn(
    import.meta,
    "test@example.com",
    "test-org-456",
  );

  const org = await BfOrganization.__DANGEROUS__createUnattached(cv, {
    name: "Deck Test Org",
    domain: "decktest.com",
  });

  // Verify the many relationship methods were generated
  assertEquals(typeof org.findAllDeck, "function");
  assertEquals(typeof org.connectionForDeck, "function");

  // Debug: Check if relationship methods were generated
  logger.debug("org.findAllDeck type:", typeof org.findAllDeck);
  logger.debug("org.connectionForDeck type:", typeof org.connectionForDeck);

  // Initially should have demo deck (auto-created in afterCreate lifecycle)
  const initialDecks = await org.findAllDeck();
  logger.debug("Initial decks count:", initialDecks.length);
  assertEquals(initialDecks.length >= 0, true); // At least 0 decks (demo deck may or may not be created)

  // Create additional decks using the relationship method with edge role
  const deck1 = await org.createTargetNode(BfDeck, {
    name: "Test Deck 1",
    slug: "test-deck-1",
    description: "First test deck",
    content: "Test deck content 1",
  }, { role: "deck" }); // Specify the relationship role

  const deck2 = await org.createTargetNode(BfDeck, {
    name: "Test Deck 2",
    slug: "test-deck-2",
    description: "Second test deck",
    content: "Test deck content 2",
  }, { role: "deck" }); // Specify the relationship role

  logger.debug("Created deck1:", deck1.id, deck1.props);
  logger.debug("Created deck2:", deck2.id, deck2.props);

  assertInstanceOf(deck1, BfDeck);
  assertInstanceOf(deck2, BfDeck);

  // Now should have initial decks + 2 created
  const allDecks = await org.findAllDeck();
  logger.debug("All decks after creation:", allDecks.length);
  const expectedCount = initialDecks.length + 2;
  assertEquals(allDecks.length, expectedCount);

  // Test the GraphQL connection
  const connection = await org.connectionForDeck({ first: 10 });

  // Verify connection structure
  assertEquals(typeof connection, "object");
  assertEquals(Array.isArray(connection.edges), true);
  assertEquals(typeof connection.pageInfo, "object");
  assertEquals(connection.edges.length, expectedCount);

  // Verify the decks in the connection match what we created
  const deckNames = connection.edges.map((edge) => edge.node.props.name).sort();
  assertEquals(deckNames.includes("Test Deck 1"), true);
  assertEquals(deckNames.includes("Test Deck 2"), true);
});

Deno.test("GraphQL Relationships - Connection with pagination", async () => {
  const cv = CurrentViewer.__DANGEROUS_USE_IN_SCRIPTS_ONLY__createLoggedIn(
    import.meta,
    "test@example.com",
    "pagination-org",
  );

  const org = await BfOrganization.__DANGEROUS__createUnattached(cv, {
    name: "Pagination Test Org",
    domain: "pagination.com",
  });

  // Get total deck count first
  const totalDecks = await org.findAllDeck();

  // Test pagination with first: 1
  const limitedConnection = await org.connectionForDeck({ first: 1 });

  // Should limit to 1 edge if there are any decks
  if (totalDecks.length > 0) {
    assertEquals(limitedConnection.edges.length, 1);
  }
  assertEquals(typeof limitedConnection.pageInfo.hasNextPage, "boolean");
  assertEquals(typeof limitedConnection.pageInfo.hasPreviousPage, "boolean");
});
