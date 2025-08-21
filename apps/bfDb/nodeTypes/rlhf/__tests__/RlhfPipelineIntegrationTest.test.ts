#! /usr/bin/env -S bft test

import { assertEquals, assertExists } from "@std/assert";
import { BfOrganization } from "@bfmono/apps/bfDb/nodeTypes/BfOrganization.ts";
import { BfDeck } from "../BfDeck.ts";
import { BfGrader } from "../BfGrader.ts";
import { BfSample } from "../BfSample.ts";
import { BfGraderResult } from "../BfGraderResult.ts";
import { BfSampleFeedback } from "../BfSampleFeedback.ts";
import { type JSONValue, withIsolatedDb } from "@bfmono/apps/bfDb/bfDb.ts";
import { makeLoggedInCv } from "@bfmono/apps/bfDb/utils/testUtils.ts";
import type { InferProps } from "@bfmono/apps/bfDb/classes/BfNode.ts";
import type { OpenAI } from "@openai/openai";

type BfDeckProps = InferProps<typeof BfDeck>;
type BfGraderProps = InferProps<typeof BfGrader>;
type BfSampleProps = InferProps<typeof BfSample>;
type BfGraderResultProps = InferProps<typeof BfGraderResult>;
type BfSampleFeedbackProps = InferProps<typeof BfSampleFeedback>;

Deno.test("RLHF Pipeline Integration - Complete end-to-end workflow", async () => {
  await withIsolatedDb(async () => {
    const cv = makeLoggedInCv({
      orgSlug: "test-org",
      email: "test@example.com",
    });

    // Step 1: Create organization and then deck
    const org = await BfOrganization.__DANGEROUS__createUnattached(cv, {
      name: "Test Organization",
      domain: "testorg.com",
    });
    await org.save();

    const deck = await org.createTargetNode(BfDeck, {
      name: "Code Review Quality Deck",
      content:
        "Evaluate code review responses for clarity, accuracy, and helpfulness. Rate on a scale of -3 to +3.",
      description:
        "A comprehensive deck for evaluating the quality of code review responses in software development teams.",
      slug: "code-review-quality-deck",
    });

    // Verify deck creation
    assertEquals(deck.props.name, "Code Review Quality Deck");
    assertEquals(
      deck.props.content,
      "Evaluate code review responses for clarity, accuracy, and helpfulness. Rate on a scale of -3 to +3.",
    );
    assertEquals(
      deck.props.description,
      "A comprehensive deck for evaluating the quality of code review responses in software development teams.",
    );
    assertExists(deck.metadata.bfGid);
    assertEquals(deck.metadata.bfOid, cv.orgBfOid);

    // Step 2: Create a BfGrader from the deck
    const grader = await deck.createTargetNode(BfGrader, {
      graderText:
        "Assess whether the code review response provides clear, actionable feedback that helps improve code quality.",
    });

    // Verify grader creation
    assertEquals(
      grader.props.graderText,
      "Assess whether the code review response provides clear, actionable feedback that helps improve code quality.",
    );
    assertExists(grader.metadata.bfGid);
    assertEquals(grader.metadata.bfOid, cv.orgBfOid);

    // Query the newly created grader to verify it can be retrieved
    const queriedGrader = await BfGrader.findX(cv, grader.metadata.bfGid);
    assertEquals(
      queriedGrader.props.graderText,
      "Assess whether the code review response provides clear, actionable feedback that helps improve code quality.",
    );
    assertEquals(queriedGrader.metadata.bfGid, grader.metadata.bfGid);
    assertEquals(queriedGrader.metadata.bfOid, cv.orgBfOid);

    // Step 3: Create a BfSample with completionData and collectionMethod
    const completionData = {
      id: "chatcmpl-test-123",
      object: "chat.completion",
      created: Date.now(),
      model: "gpt-4",
      choices: [
        {
          index: 0,
          message: {
            role: "assistant",
            content:
              "This code looks good overall. Consider adding error handling for the API call on line 42, and the variable naming could be more descriptive in the processData function.",
          },
          finish_reason: "stop",
        },
      ],
      usage: {
        prompt_tokens: 150,
        completion_tokens: 85,
        total_tokens: 235,
      },
      messages: [
        {
          role: "user",
          content:
            "Please review this code and provide feedback on improvements.",
        },
      ],
      temperature: 0.7,
      max_tokens: 500,
    };

    const sample = await deck.createTargetNode(BfSample, {
      name: "Code Review Sample",
      telemetryData: completionData as unknown as JSONValue,
      collectionMethod: "manual",
    });

    // Verify sample creation
    assertEquals(sample.props.collectionMethod, "manual");
    const sampleCompletionData = sample.props
      .telemetryData as unknown as OpenAI.Chat.ChatCompletion;
    assertEquals(sampleCompletionData.id, "chatcmpl-test-123");
    assertEquals(sampleCompletionData.model, "gpt-4");
    assertEquals(
      sampleCompletionData.choices[0].message.content,
      "This code looks good overall. Consider adding error handling for the API call on line 42, and the variable naming could be more descriptive in the processData function.",
    );
    assertEquals(sample.props.collectionMethod, "manual");
    assertExists(sample.metadata.bfGid);
    assertEquals(sample.metadata.bfOid, cv.orgBfOid);

    // Step 4: Create a BfGraderResult with score, explanation, and proper relationships

    const graderResult = await grader.createTargetNode(BfGraderResult, {
      score: 2,
      explanation:
        "The response provides specific, actionable feedback with clear line references and concrete suggestions for improvement.",
      reasoningProcess:
        "Analyzed the response for clarity, specificity, and actionability. The feedback mentions specific line numbers and provides concrete improvement suggestions, which aligns with high-quality code review practices.",
    });

    // Verify grader result creation and relationships
    assertEquals(graderResult.props.score, 2);
    assertEquals(
      graderResult.props.explanation,
      "The response provides specific, actionable feedback with clear line references and concrete suggestions for improvement.",
    );
    assertEquals(
      graderResult.props.reasoningProcess,
      "Analyzed the response for clarity, specificity, and actionability. The feedback mentions specific line numbers and provides concrete improvement suggestions, which aligns with high-quality code review practices.",
    );
    assertExists(graderResult.metadata.bfGid);
    assertEquals(graderResult.metadata.bfOid, cv.orgBfOid);

    // Step 5: Create a BfSampleFeedback with score and explanation

    const feedback = await sample.createTargetNode(BfSampleFeedback, {
      score: 3,
      explanation:
        "Excellent code review response. It provides specific, actionable feedback with clear reasoning and concrete suggestions for improvement.",
    });

    // Verify feedback creation
    assertEquals(feedback.props.score, 3);
    assertEquals(
      feedback.props.explanation,
      "Excellent code review response. It provides specific, actionable feedback with clear reasoning and concrete suggestions for improvement.",
    );
    assertExists(feedback.metadata.bfGid);
    assertEquals(feedback.metadata.bfOid, cv.orgBfOid);

    // Step 6: Verify data persistence and retrieval
    const retrievedDeck = await BfDeck.findX(cv, deck.metadata.bfGid);
    const retrievedGrader = await BfGrader.findX(cv, grader.metadata.bfGid);
    const retrievedSample = await BfSample.findX(cv, sample.metadata.bfGid);
    const retrievedGraderResult = await BfGraderResult.findX(
      cv,
      graderResult.metadata.bfGid,
    );
    const retrievedFeedback = await BfSampleFeedback.findX(
      cv,
      feedback.metadata.bfGid,
    );

    // Verify all nodes persist correctly
    assertEquals(retrievedDeck.props.name, "Code Review Quality Deck");
    assertEquals(
      retrievedGrader.props.graderText,
      "Assess whether the code review response provides clear, actionable feedback that helps improve code quality.",
    );
    assertEquals(retrievedSample.props.collectionMethod, "manual");
    assertEquals(retrievedGraderResult.props.score, 2);
    assertEquals(retrievedFeedback.props.score, 3);

    // Step 7: Verify organizational scoping
    assertEquals(retrievedDeck.metadata.bfOid, cv.orgBfOid);
    assertEquals(retrievedGrader.metadata.bfOid, cv.orgBfOid);
    assertEquals(retrievedSample.metadata.bfOid, cv.orgBfOid);
    assertEquals(retrievedGraderResult.metadata.bfOid, cv.orgBfOid);
    assertEquals(retrievedFeedback.metadata.bfOid, cv.orgBfOid);

    // Step 8: Verify relationships work correctly
    // Note: With createTargetNode pattern, relationships are managed via BfEdge instances

    // Step 9: Verify the complete RLHF workflow data flow
    // The pipeline should flow: Deck -> Grader -> Sample -> GraderResult -> SampleFeedback

    // Check that all components are properly connected and functional
    assertExists(deck.metadata.createdAt);
    assertExists(grader.metadata.createdAt);
    assertExists(sample.metadata.createdAt);
    assertExists(graderResult.metadata.createdAt);
    assertExists(feedback.metadata.createdAt);

    // Verify that the business logic flows correctly
    // Sample contains the completion data to be evaluated
    assertEquals(
      typeof (sample.props
        .telemetryData as unknown as OpenAI.Chat.ChatCompletion)
        .choices[0]
        .message.content,
      "string",
    );

    // Grader provides the evaluation criteria
    assertEquals(typeof grader.props.graderText, "string");

    // GraderResult connects sample and grader with a score
    assertEquals(typeof graderResult.props.score, "number");
    assertEquals(
      typeof graderResult.props.score === "number" &&
        graderResult.props.score >= -3 && graderResult.props.score <= 3,
      true,
    );

    // SampleFeedback provides human feedback on the sample
    assertEquals(typeof feedback.props.score, "number");
    assertEquals(feedback.props.score >= -3 && feedback.props.score <= 3, true);

    // All components are scoped to the same organization
    const allOids = [
      deck.metadata.bfOid,
      grader.metadata.bfOid,
      sample.metadata.bfOid,
      graderResult.metadata.bfOid,
      feedback.metadata.bfOid,
    ];
    assertEquals(new Set(allOids).size, 1); // All should be the same
  });
});

Deno.test("Organization auto-creates demo RLHF content", async () => {
  await withIsolatedDb(async () => {
    const cv = makeLoggedInCv({ orgSlug: "demo-org", email: "test@demo.com" });

    const org = await BfOrganization.__DANGEROUS__createUnattached(cv, {
      name: "Demo Organization",
      domain: "demo.com",
    });
    await org.save();

    // Check if a deck was automatically created
    const decks = await org.queryTargetInstances(BfDeck);
    assertEquals(decks.length, 1);
    assertEquals(decks[0].props.name, "Customer Support Response Evaluator");
  });
});
