import { useFragmentReader } from "@iso-bfc";
import { useEffect, useState } from "react";
import type { GradingSample } from "@bfmono/apps/boltfoundry-com/types/grading.ts";
import {
  extractBfSamplesFromEdges,
  transformBfSamplesToGradingSamples,
} from "@bfmono/apps/boltfoundry-com/utils/sampleDataTransform.ts";
import type { BfDeck__DeckSamples__output_type } from "@bfmono/apps/boltfoundry-com/__generated__/__isograph/BfDeck/DeckSamples/output_type.ts";
import { getLogger } from "@bfmono/packages/logger/logger.ts";

const logger = getLogger(import.meta);

/**
 * Hook to load real deck samples via Isograph instead of mock data
 *
 * This hook replaces the mock useDeckSamples hook with real GraphQL data fetching.
 * It uses the DeckSamples fragment to get sample data and transforms it to GradingSample format.
 */
export function useIsographDeckSamples(
  deckData: BfDeck__DeckSamples__output_type | null,
  deckId: string,
) {
  const [samples, setSamples] = useState<GradingSample[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!deckData) {
      setLoading(true);
      return;
    }

    try {
      logger.debug("Processing deck samples from Isograph", {
        deckId,
        sampleCount: deckData.samples?.edges?.length || 0,
      });

      // Extract samples from GraphQL connection edges
      const bfSamples = extractBfSamplesFromEdges(
        deckData.samples?.edges || [],
      );

      // Transform to GradingSample format
      const transformedSamples = transformBfSamplesToGradingSamples(
        bfSamples,
        deckData.name || "Unknown Deck",
      );

      setSamples(transformedSamples);
      setError(null);
      setLoading(false);

      logger.debug("Samples transformed successfully", {
        deckId,
        originalCount: bfSamples.length,
        transformedCount: transformedSamples.length,
        sampleIds: transformedSamples.map((s) => s.id),
      });
    } catch (err) {
      logger.error("Failed to process deck samples", err);
      setError(
        err instanceof Error ? err.message : "Unknown error processing samples",
      );
      setLoading(false);
    }
  }, [deckData, deckId]);

  // TODO: Implement saveGrade functionality with real GraphQL mutations
  const saveGrade = async (
    sampleId: string,
    grades: Array<{
      graderId: string;
      score: -3 | -2 | -1 | 1 | 2 | 3;
      reason: string;
    }>,
  ) => {
    logger.debug("Saving grade (not yet implemented for real GraphQL)", {
      deckId,
      sampleId,
      grades,
    });

    // For now, this is a no-op. In a full implementation, this would:
    // 1. Create BfGraderResult records
    // 2. Update the sample's grader evaluations
    // 3. Trigger a re-fetch or optimistic update

    return await Promise.resolve();
  };

  return {
    samples,
    loading,
    error,
    saveGrade,
    saving: false, // For compatibility with existing interfaces
  };
}
