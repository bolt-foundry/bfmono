import { useEffect } from "react";
import { useEvalContext } from "@bfmono/apps/boltfoundry-com/contexts/EvalContext.tsx";
import type { GradingSample } from "@bfmono/apps/boltfoundry-com/types/grading.ts";
import { getLogger } from "@bfmono/packages/logger/logger.ts";

const logger = getLogger(import.meta);

/**
 * Hook to manage deck samples through EvalContext
 * Loads samples into context on first use, then returns context state
 */
export function useDeckSamples(deckId: string) {
  const {
    deckSamples,
    samplesLoading,
    setSamplesForDeck,
    setSamplesLoading,
    updateSampleGrade,
  } = useEvalContext();

  const samples = deckSamples[deckId] || [];
  const loading = samplesLoading[deckId] || false;

  useEffect(() => {
    if (!deckId) return;

    // If already loading, don't start another load
    if (loading) return;

    // If samples exist in context (even empty array), don't load again
    if (deckSamples[deckId] !== undefined) return;

    logger.debug("Loading samples for deck into context", { deckId });
    setSamplesLoading(deckId, true);

    // Simulate async loading (same as useGradingSamples)
    setTimeout(async () => {
      try {
        let samples: Array<GradingSample>;

        if (deckId === "fastpitch") {
          const { fastpitchGradingSamples } = await import(
            "@bfmono/apps/boltfoundry-com/mocks/fastpitchSamples.ts"
          );
          samples = fastpitchGradingSamples;
        } else if (deckId === "1") {
          // Customer Support Quality deck - empty for demo
          samples = [];
        } else {
          const { mockGradingSamples } = await import(
            "@bfmono/apps/boltfoundry-com/mocks/gradingSamples.ts"
          );
          samples = mockGradingSamples;
        }

        setSamplesForDeck(deckId, samples);
        setSamplesLoading(deckId, false);
        logger.debug("Samples loaded into context", {
          deckId,
          count: samples.length,
        });
      } catch (err) {
        logger.error("Failed to load samples", err);
        setSamplesLoading(deckId, false);
      }
    }, 100); // Minimal delay for smooth UX
  }, [deckId, samples.length, loading, setSamplesForDeck, setSamplesLoading]);

  const saveGrade = async (
    sampleId: string,
    grades: Array<{
      graderId: string;
      score: -3 | -2 | -1 | 1 | 2 | 3;
      reason: string;
    }>,
  ) => {
    logger.debug("Saving grade to context", { deckId, sampleId, grades });

    const humanGrade = {
      grades,
      gradedBy: "current-user",
      gradedAt: new Date().toISOString(),
    };

    updateSampleGrade(deckId, sampleId, humanGrade);

    // Return resolved promise to match interface
    return await Promise.resolve();
  };

  return {
    samples,
    loading,
    saveGrade,
    saving: false, // For compatibility with existing interfaces
  };
}
