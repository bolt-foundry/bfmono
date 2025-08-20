#! /usr/bin/env -S bft test

import { assertEquals, assertExists } from "@std/assert";
import { withIsolatedDb } from "@bfmono/apps/bfDb/bfDb.ts";
import { makeLoggedInCv } from "@bfmono/apps/bfDb/utils/testUtils.ts";
import { BfOrganization } from "@bfmono/apps/bfDb/nodeTypes/BfOrganization.ts";
import { BfDeck } from "@bfmono/apps/bfDb/nodeTypes/rlhf/BfDeck.ts";
import { BfSample } from "@bfmono/apps/bfDb/nodeTypes/rlhf/BfSample.ts";
import { BfSampleFeedback } from "@bfmono/apps/bfDb/nodeTypes/rlhf/BfSampleFeedback.ts";
import { BfGraderResult } from "@bfmono/apps/bfDb/nodeTypes/rlhf/BfGraderResult.ts";

Deno.test("RLHF Workflow - Create deck via sample submission, add AI evaluation and human feedback", async () => {
  await withIsolatedDb(async () => {
    const cv = await makeLoggedInCv();

    // Create org
    const org = await BfOrganization.__DANGEROUS__createUnattached(cv, {
      name: "Test Org",
      domain: "test.com",
    }, { bfGid: cv.orgBfOid });

    // Create deck (simulating telemetry endpoint)
    const deck = await org.createTargetNode(BfDeck, {
      name: "customer-service",
      content: "You are a helpful customer service agent.",
      description: "Auto-created from telemetry",
      slug: "test-org_customer-service",
    });

    // Create sample (simulating telemetry endpoint)
    const sample = await deck.createTargetNode(BfSample, {
      completionData: JSON.stringify({
        request: { messages: [{ role: "user", content: "Help me" }] },
        response: {
          choices: [{
            message: { role: "assistant", content: "How can I help?" },
          }],
        },
      }),
      collectionMethod: "telemetry",
      name: "Customer Support Sample",
    });

    // Mock AI evaluation by directly creating a grader result
    const { createBfNode } = await import(
      "@bfmono/apps/bfDb/builders/bfDb/createBfNode.ts"
    );
    await createBfNode(BfGraderResult, {
      score: 1,
      explanation: "Response is helpful but could be more specific",
      reasoningProcess:
        "AI evaluation: response acknowledges user but lacks detail",
    }, { sourceBfGid: sample.id });

    // Add human feedback that disagrees with AI
    const feedback = await createBfNode(BfSampleFeedback, {
      score: 3,
      explanation: "Actually this is a perfect response - clear and friendly",
    }, { sourceBfGid: sample.id });

    // Verify workflow
    assertEquals(deck.props.name, "customer-service");
    assertEquals(sample.props.collectionMethod, "telemetry");
    assertEquals(sample.props.name, "Customer Support Sample");
    assertEquals(feedback.props.score, 3);
    assertExists(feedback.props.explanation);
  });
});
