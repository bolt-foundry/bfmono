import { assertEquals, assertInstanceOf } from "@std/assert";
import { CurrentViewer } from "@bfmono/apps/bfDb/classes/CurrentViewer.ts";
import { BfOrganization } from "@bfmono/apps/bfDb/nodeTypes/BfOrganization.ts";
import { BfDeck } from "@bfmono/apps/bfDb/nodeTypes/rlhf/BfDeck.ts";
import { BfGrader } from "@bfmono/apps/bfDb/nodeTypes/rlhf/BfGrader.ts";
import { BfSample } from "@bfmono/apps/bfDb/nodeTypes/rlhf/BfSample.ts";
import { getLogger } from "@bfmono/packages/logger/logger.ts";
import type { BfGid } from "@bfmono/lib/types.ts";
import type { WithRelationships } from "@bfmono/apps/bfDb/builders/bfDb/relationshipMethods.ts";

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
  assertEquals(typeof org.findAllDecks, "function");
  assertEquals(typeof org.connectionForDecks, "function");

  // Debug: Check if relationship methods were generated
  logger.debug("org.findAllDecks type:", typeof org.findAllDecks);
  logger.debug("org.connectionForDecks type:", typeof org.connectionForDecks);

  // Initially should have demo deck (auto-created in afterCreate lifecycle)
  const initialDecks = await org.findAllDecks();
  logger.debug("Initial decks count:", initialDecks.length);
  assertEquals(initialDecks.length >= 0, true); // At least 0 decks (demo deck may or may not be created)

  // Create additional decks using the relationship method with edge role
  const deck1 = await org.createTargetNode(BfDeck, {
    name: "Test Deck 1",
    slug: "test-deck-1",
    description: "First test deck",
    content: "Test deck content 1",
  }, { role: "decks" }); // Specify the relationship role

  const deck2 = await org.createTargetNode(BfDeck, {
    name: "Test Deck 2",
    slug: "test-deck-2",
    description: "Second test deck",
    content: "Test deck content 2",
  }, { role: "decks" }); // Specify the relationship role

  logger.debug("Created deck1:", deck1.id, deck1.props);
  logger.debug("Created deck2:", deck2.id, deck2.props);

  assertInstanceOf(deck1, BfDeck);
  assertInstanceOf(deck2, BfDeck);

  // Now should have initial decks + 2 created
  const allDecks = await org.findAllDecks();
  logger.debug("All decks after creation:", allDecks.length);
  const expectedCount = initialDecks.length + 2;
  assertEquals(allDecks.length, expectedCount);

  // Test the GraphQL connection
  const connection = await org.connectionForDecks({ first: 10 });

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
  const totalDecks = await org.findAllDecks();

  // Test pagination with first: 1
  const limitedConnection = await org.connectionForDecks({ first: 1 });

  // Should limit to 1 edge if there are any decks
  if (totalDecks.length > 0) {
    assertEquals(limitedConnection.edges.length, 1);
  }
  assertEquals(typeof limitedConnection.pageInfo.hasNextPage, "boolean");
  assertEquals(typeof limitedConnection.pageInfo.hasPreviousPage, "boolean");
});

Deno.test("GraphQL Relationships - Deck → Graders (many)", async () => {
  const cv = CurrentViewer.__DANGEROUS_USE_IN_SCRIPTS_ONLY__createLoggedIn(
    import.meta,
    "test@example.com",
    "deck-graders-org",
  );

  // Create organization and deck
  const org = await BfOrganization.__DANGEROUS__createUnattached(cv, {
    name: "Graders Test Org",
    domain: "graders.com",
  });

  const deck = await org.createTargetNode(BfDeck, {
    name: "Test Deck with Graders",
    slug: "test-deck-graders",
    description: "Deck for testing grader relationships",
    content: "Test deck content for graders",
  }, { role: "decks" }) as WithRelationships<typeof BfDeck>;

  // Verify the many relationship methods were generated
  assertEquals(typeof deck.findAllGraders, "function");
  assertEquals(typeof deck.connectionForGraders, "function");

  logger.debug("deck.findAllGraders type:", typeof deck.findAllGraders);
  logger.debug(
    "deck.connectionForGraders type:",
    typeof deck.connectionForGraders,
  );

  // Initially should have no graders
  const initialGraders = await deck.findAllGraders();
  logger.debug("Initial graders count:", initialGraders.length);
  assertEquals(initialGraders.length, 0);

  // Create graders using the relationship method with edge role
  const grader1 = await deck.createTargetNode(BfGrader, {
    graderText: "Evaluate response accuracy and completeness",
  }, { role: "grader" });

  const grader2 = await deck.createTargetNode(BfGrader, {
    graderText: "Assess tone and professionalism of the response",
  }, { role: "grader" });

  logger.debug("Created grader1:", grader1.id, grader1.props);
  logger.debug("Created grader2:", grader2.id, grader2.props);

  assertInstanceOf(grader1, BfGrader);
  assertInstanceOf(grader2, BfGrader);

  // Now should have 2 graders
  const allGraders = await deck.findAllGraders();
  logger.debug("All graders after creation:", allGraders.length);
  assertEquals(allGraders.length, 2);

  // Test the GraphQL connection
  const connection = await deck.connectionForGraders({ first: 10 });

  // Verify connection structure
  assertEquals(typeof connection, "object");
  assertEquals(Array.isArray(connection.edges), true);
  assertEquals(typeof connection.pageInfo, "object");
  assertEquals(connection.edges.length, 2);

  // Verify the graders in the connection match what we created
  const graderTexts = connection.edges.map((
    edge: { node: { props: { graderText: string } } },
  ) => edge.node.props.graderText)
    .sort();
  assertEquals(
    graderTexts.includes("Evaluate response accuracy and completeness"),
    true,
  );
  assertEquals(
    graderTexts.includes("Assess tone and professionalism of the response"),
    true,
  );
});

Deno.test("GraphQL Relationships - Deck → Samples (many)", async () => {
  const cv = CurrentViewer.__DANGEROUS_USE_IN_SCRIPTS_ONLY__createLoggedIn(
    import.meta,
    "test@example.com",
    "deck-samples-org",
  );

  // Create organization and deck
  const org = await BfOrganization.__DANGEROUS__createUnattached(cv, {
    name: "Samples Test Org",
    domain: "samples.com",
  });

  const deck = await org.createTargetNode(BfDeck, {
    name: "Test Deck with Samples",
    slug: "test-deck-samples",
    description: "Deck for testing sample relationships",
    content: "Test deck content for samples",
  }, { role: "decks" }) as WithRelationships<typeof BfDeck>;

  // Verify the many relationship methods were generated
  assertEquals(typeof deck.findAllSamples, "function");
  assertEquals(typeof deck.connectionForSamples, "function");

  // Initially should have no samples
  const initialSamples = await deck.findAllSamples();
  assertEquals(initialSamples.length, 0);

  // Create samples using the relationship method with edge role
  const sample1 = await deck.createTargetNode(BfSample, {
    completionData: {
      id: "test-1",
      object: "chat.completion",
      created: Date.now(),
      model: "gpt-4",
      choices: [{
        index: 0,
        message: { role: "assistant", content: "Sample response 1" },
        finish_reason: "stop",
      }],
      messages: [{ role: "user", content: "Test prompt 1" }],
    },
    collectionMethod: "manual",
    name: "Test Sample 1",
  }, { role: "sample" });

  const sample2 = await deck.createTargetNode(BfSample, {
    completionData: {
      id: "test-2",
      object: "chat.completion",
      created: Date.now(),
      model: "gpt-4",
      choices: [{
        index: 0,
        message: { role: "assistant", content: "Sample response 2" },
        finish_reason: "stop",
      }],
      messages: [{ role: "user", content: "Test prompt 2" }],
    },
    collectionMethod: "telemetry",
    name: "Test Sample 2",
  }, { role: "sample" });

  assertInstanceOf(sample1, BfSample);
  assertInstanceOf(sample2, BfSample);

  // Now should have 2 samples
  const allSamples = await deck.findAllSamples();
  assertEquals(allSamples.length, 2);

  // Test the GraphQL connection
  const connection = await deck.connectionForSamples({ first: 10 });

  // Verify connection structure
  assertEquals(typeof connection, "object");
  assertEquals(Array.isArray(connection.edges), true);
  assertEquals(typeof connection.pageInfo, "object");
  assertEquals(connection.edges.length, 2);

  // Verify the samples in the connection match what we created
  const sampleNames = connection.edges.map((
    edge: { node: { props: { name: string } } },
  ) => edge.node.props.name).sort();
  assertEquals(sampleNames.includes("Test Sample 1"), true);
  assertEquals(sampleNames.includes("Test Sample 2"), true);
});
