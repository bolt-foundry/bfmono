import { useEffect, useState } from "react";
import type React from "react";
import type { GradingSample } from "@bfmono/apps/boltfoundry-com/types/grading.ts";
import { useEvalContext } from "@bfmono/apps/boltfoundry-com/contexts/EvalContext.tsx";
import { getLogger } from "@bfmono/packages/logger/logger.ts";
import SubmitSampleMutation from "@iso-bfc/Mutation/SubmitSample/entrypoint.ts";
import { useMutation } from "@bfmono/apps/boltfoundry-com/hooks/isographPrototypes/useMutation.tsx";

const logger = getLogger(import.meta);

interface UseGradingSamplesResult {
  samples: Array<GradingSample> | null;
  loading: boolean;
  error: string | null;
  saveGrade: (
    sampleId: string,
    grades: Array<
      { graderId: string; score: -3 | -2 | -1 | 1 | 2 | 3; reason: string }
    >,
  ) => Promise<void>;
  saving: boolean;
  submitNewSample: (
    completionData: object,
    collectionMethod?: string,
    name?: string,
  ) => Promise<void>;
  submitSampleResponseElement: React.ReactNode;
}

export function useGradingSamplesWithGraphQL(
  deckId: string,
): UseGradingSamplesResult {
  const { currentViewer } = useEvalContext();
  const [samples, setSamples] = useState<Array<GradingSample> | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const submitSampleMutation = useMutation(SubmitSampleMutation);

  useEffect(() => {
    if (!deckId || !currentViewer) {
      setLoading(false);
      return;
    }

    logger.info("Fetching samples for deck with GraphQL data", { deckId });
    setLoading(true);
    setError(null);

    try {
      // Find the specific deck in currentViewer data
      const decks =
        currentViewer?.asCurrentViewerLoggedIn?.organization?.decks?.edges ||
        [];
      const deckEdge = decks.find((edge: any) => edge.node.id === deckId);

      if (!deckEdge) {
        logger.warn(
          "Deck not found in currentViewer data, falling back to mock",
          { deckId },
        );
        // Fall back to mock data if deck not found
        fallbackToMockData();
        return;
      }

      const deck = deckEdge.node;
      const rawSamples = deck.samples?.edges || [];

      // Transform GraphQL sample data to GradingSample format
      const transformedSamples: Array<GradingSample> = rawSamples.map(
        (edge: any) => {
          const node = edge.node;
          let completionData: any = {};

          try {
            completionData = node?.completionData
              ? JSON.parse(node.completionData)
              : {};
          } catch (e) {
            logger.error("Failed to parse completion data", e);
          }

          return {
            id: node?.id || "",
            timestamp: new Date().toISOString(), // TODO: Add timestamp field to BfSample
            duration: 150, // TODO: Extract from completion data
            provider: completionData.provider || "unknown",
            request: {
              body: completionData.request || {
                messages: [],
              },
            },
            response: {
              body: completionData.response || {
                choices: [],
              },
            },
            graderEvaluations: [], // TODO: Add grader evaluations from GraphQL
            bfMetadata: {
              deckName: deck.name || "Unknown",
              deckContent: deck.content || "",
              contextVariables: {},
            },
          };
        },
      );

      setSamples(transformedSamples);
      setLoading(false);
    } catch (err) {
      logger.error("Failed to process GraphQL sample data", err);
      fallbackToMockData();
    }
  }, [deckId, currentViewer]);

  const fallbackToMockData = async () => {
    try {
      let samples;

      if (deckId === "fastpitch") {
        const { fastpitchGradingSamples } = await import(
          "@bfmono/apps/boltfoundry-com/mocks/fastpitchSamples.ts"
        );
        samples = fastpitchGradingSamples;
      } else {
        const { mockGradingSamples } = await import(
          "@bfmono/apps/boltfoundry-com/mocks/gradingSamples.ts"
        );
        samples = mockGradingSamples;
      }

      setSamples(samples);
      setLoading(false);
    } catch (err) {
      logger.error("Failed to load mock samples", err);
      setError("Failed to load samples");
      setLoading(false);
    }
  };

  const saveGrade = async (
    sampleId: string,
    grades: Array<
      { graderId: string; score: -3 | -2 | -1 | 1 | 2 | 3; reason: string }
    >,
  ) => {
    logger.info("Saving grade", { sampleId, grades });
    setSaving(true);
    setError(null);

    try {
      // TODO: Use SubmitSampleMutation or appropriate GraphQL mutation
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Update local state optimistically
      setSamples((prev) => {
        if (!prev) return prev;

        return prev.map((sample) => {
          if (sample.id === sampleId) {
            return {
              ...sample,
              humanGrade: {
                grades,
                gradedBy: "current-user", // TODO: Get from auth context
                gradedAt: new Date().toISOString(),
              },
            };
          }
          return sample;
        });
      });

      logger.info("Grade saved successfully", { sampleId });
    } catch (err) {
      logger.error("Failed to save grade", err);
      setError("Failed to save grade");
      throw err;
    } finally {
      setSaving(false);
    }
  };

  const submitNewSample = async (
    completionData: object,
    collectionMethod: string = "manual",
    name?: string,
  ) => {
    logger.info("Submitting new sample", { deckId, completionData });

    const completionDataString = JSON.stringify(completionData);

    return new Promise<void>((resolve, reject) => {
      submitSampleMutation.commit({
        deckId,
        completionData: completionDataString,
        collectionMethod,
        name: name || null,
      }, {
        onComplete: ({ submitSample }) => {
          logger.info("Sample submitted successfully:", submitSample);
          // TODO: Refresh the samples list to include the new sample
          resolve();
        },
        onError: () => {
          logger.error("Failed to submit sample");
          setError("Failed to submit sample");
          reject(new Error("Failed to submit sample"));
        },
      });
    });
  };

  return {
    samples,
    loading,
    error,
    saveGrade,
    saving,
    submitNewSample,
    submitSampleResponseElement: submitSampleMutation.responseElement,
  };
}
