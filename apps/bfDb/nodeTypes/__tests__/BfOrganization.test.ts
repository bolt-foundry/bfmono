#! /usr/bin/env -S bft test

import { assertEquals } from "@std/assert";
import { BfOrganization } from "@bfmono/apps/bfDb/nodeTypes/BfOrganization.ts";
import { BfDeck } from "../rlhf/BfDeck.ts";
import { BfGrader } from "../rlhf/BfGrader.ts";
import { BfSample } from "../rlhf/BfSample.ts";
import { withIsolatedDb } from "@bfmono/apps/bfDb/bfDb.ts";
import { makeLoggedInCv } from "@bfmono/apps/bfDb/utils/testUtils.ts";

Deno.test("BfOrganization - Organization isolation", async () => {
  await withIsolatedDb(async () => {
    const cv1 = makeLoggedInCv({ orgSlug: "org1", email: "user1@example.com" });
    const cv2 = makeLoggedInCv({ orgSlug: "org2", email: "user2@example.com" });

    // Create the same workflow in two different organizations
    const sharedProps = {
      deck: {
        name: "Shared Deck",
        content: "Shared system prompt",
        description: "Shared description",
      },
      grader: {
        graderText: "Shared grader text",
      },
      sample: {
        name: "Shared Sample",
        telemetryData: {
          id: "shared-completion",
          object: "chat.completion" as const,
          created: Date.now(),
          model: "gpt-4",
          choices: [
            {
              index: 0,
              message: {
                role: "assistant" as const,
                content: "Shared completion content",
              },
              finish_reason: "stop" as const,
            },
          ],
          usage: {
            prompt_tokens: 100,
            completion_tokens: 50,
            total_tokens: 150,
          },
          messages: [
            {
              role: "user" as const,
              content: "Shared user message",
            },
          ],
        },
        collectionMethod: "manual" as const,
      },
    };

    // Create nodes in organization 1
    const org1 = await BfOrganization.__DANGEROUS__createUnattached(cv1, {
      name: "Organization 1",
      domain: "org1.com",
    });
    await org1.save();

    const deck1 = await org1.createTargetNode(BfDeck, sharedProps.deck);
    const grader1 = await deck1.createTargetNode(BfGrader, sharedProps.grader);
    const sample1 = await deck1.createTargetNode(BfSample, sharedProps.sample);

    // Create nodes in organization 2
    const org2 = await BfOrganization.__DANGEROUS__createUnattached(cv2, {
      name: "Organization 2",
      domain: "org2.com",
    });
    await org2.save();

    const deck2 = await org2.createTargetNode(BfDeck, sharedProps.deck);
    const grader2 = await deck2.createTargetNode(BfGrader, sharedProps.grader);
    const sample2 = await deck2.createTargetNode(BfSample, sharedProps.sample);

    // Verify organizations are isolated
    assertEquals(deck1.metadata.bfOid !== deck2.metadata.bfOid, true);
    assertEquals(grader1.metadata.bfOid !== grader2.metadata.bfOid, true);
    assertEquals(sample1.metadata.bfOid !== sample2.metadata.bfOid, true);

    // Verify each organization can only access its own data
    assertEquals(deck1.metadata.bfOid, cv1.orgBfOid);
    assertEquals(deck2.metadata.bfOid, cv2.orgBfOid);
    assertEquals(grader1.metadata.bfOid, cv1.orgBfOid);
    assertEquals(grader2.metadata.bfOid, cv2.orgBfOid);
    assertEquals(sample1.metadata.bfOid, cv1.orgBfOid);
    assertEquals(sample2.metadata.bfOid, cv2.orgBfOid);

    // Verify the nodes have different IDs even with same properties
    assertEquals(deck1.metadata.bfGid !== deck2.metadata.bfGid, true);
    assertEquals(grader1.metadata.bfGid !== grader2.metadata.bfGid, true);
    assertEquals(sample1.metadata.bfGid !== sample2.metadata.bfGid, true);
  });
});
