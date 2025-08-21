import type { GradingSample } from "@bfmono/apps/boltfoundry-com/types/grading.ts";
import type { BfSampleCompletionData } from "@bfmono/apps/bfDb/nodeTypes/rlhf/BfSample.ts";

/**
 * Raw BfSample data structure as returned by Isograph
 */
export interface BfSampleData {
  id: string;
  name?: string;
  completionData: BfSampleCompletionData;
  collectionMethod: string;
}

/**
 * Transform BfSample data from GraphQL into GradingSample format expected by UI components
 *
 * This function converts the BfSample.completionData JSON structure into the format
 * used by the existing UI components (SampleDisplay, GradingSamplesList, etc.)
 */
export function transformBfSampleToGradingSample(
  bfSample: BfSampleData,
  deckName: string = "Unknown Deck",
): GradingSample {
  const { completionData } = bfSample;

  // Extract timing information from completion data
  const completionCreatedTimestamp = completionData.created * 1000; // OpenAI uses seconds, we use milliseconds

  // Use OpenAI completion timestamp as the primary timestamp
  // Calculate duration as a reasonable estimate (most AI calls take 1-5 seconds)
  const duration = 2000; // Default to 2 seconds - we could enhance this with actual timing data later

  // Transform to GradingSample format
  return {
    id: bfSample.id,
    timestamp: new Date(completionCreatedTimestamp).toISOString(),
    duration,
    provider: "openai", // Based on the model names, this appears to be OpenAI
    request: {
      url: "/v1/chat/completions", // Standard OpenAI endpoint
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: {
        model: completionData.model,
        messages: completionData.messages as Array<
          { role: "user" | "assistant" | "system"; content: string }
        >,
        // Include optional parameters if they exist
        ...(completionData.temperature !== undefined &&
          { temperature: completionData.temperature }),
        ...(completionData.max_tokens !== undefined &&
          { max_tokens: completionData.max_tokens }),
        ...(completionData.top_p !== undefined &&
          { top_p: completionData.top_p }),
        ...(completionData.frequency_penalty !== undefined &&
          { frequency_penalty: completionData.frequency_penalty }),
        ...(completionData.presence_penalty !== undefined &&
          { presence_penalty: completionData.presence_penalty }),
        ...(completionData.stop !== undefined && { stop: completionData.stop }),
      },
    },
    response: {
      status: 200, // Assume success since we have completion data
      headers: {
        "Content-Type": "application/json",
      },
      body: {
        id: completionData.id,
        object: completionData.object,
        created: completionData.created,
        model: completionData.model,
        usage: completionData.usage,
        choices: completionData.choices,
      },
    },
    // TODO: Add grader evaluations from related BfGraderResult records
    graderEvaluations: [],
    // TODO: Add human grade from context if available
    humanGrade: undefined,
    bfMetadata: {
      deckName,
      deckContent: "", // TODO: Get actual deck content if needed
      contextVariables: {
        sampleName: bfSample.name || "",
        collectionMethod: bfSample.collectionMethod,
        completionTimestamp: completionCreatedTimestamp,
      },
    },
  };
}

/**
 * Transform an array of BfSample data into GradingSample array
 */
export function transformBfSamplesToGradingSamples(
  bfSamples: Array<BfSampleData>,
  deckName: string = "Unknown Deck",
): Array<GradingSample> {
  return bfSamples.map((sample) =>
    transformBfSampleToGradingSample(sample, deckName)
  );
}

/**
 * Extract BfSample data from Isograph connection edges
 */
export function extractBfSamplesFromEdges(
  edges: Array<{ node: BfSampleData }>,
): Array<BfSampleData> {
  return edges.map((edge) => edge.node);
}
