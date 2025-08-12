import { useState } from "react";
import { BfDsButton } from "@bfmono/apps/bfDs/components/BfDsButton.tsx";
import { BfDsIcon } from "@bfmono/apps/bfDs/components/BfDsIcon.tsx";
import { BfDsSpinner } from "@bfmono/apps/bfDs/components/BfDsSpinner.tsx";
import { SampleDisplay } from "./SampleDisplay.tsx";
import { useGradingSamples } from "@bfmono/apps/boltfoundry-com/hooks/useGradingSamples.ts";
import { getLogger } from "@bfmono/packages/logger/logger.ts";

const logger = getLogger(import.meta);

interface GradingInboxProps {
  deckId: string;
  deckName: string;
  onClose: () => void;
  onComplete?: (gradedSampleIds: Array<string>, avgScore: number) => void;
}

export function GradingInbox({
  deckId,
  deckName,
  onClose,
  onComplete,
}: GradingInboxProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [gradedSampleIds, setGradedSampleIds] = useState<Array<string>>([]);
  const [humanScores, setHumanScores] = useState<Array<number>>([]);
  const [draftGrades, setDraftGrades] = useState<
    Record<
      string,
      Record<
        string,
        { rating: -3 | -2 | -1 | 1 | 2 | 3 | null; comment: string }
      >
    >
  >({});

  // Use the Isograph hook to fetch and manage samples
  const { samples, loading, error, saveGrade, saving } = useGradingSamples(
    deckId,
  );

  // Handle loading and error states
  if (loading) {
    return (
      <div className="grading-inbox grading-loading">
        <div className="grading-header">
          <h2>Loading samples...</h2>
          <BfDsButton
            variant="ghost"
            size="small"
            icon="cross"
            onClick={onClose}
            aria-label="Close grading"
          />
        </div>
        <div className="grading-loading-content">
          <BfDsSpinner size={48} />
          <p>Fetching grading samples for "{deckName}"</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="grading-inbox grading-error">
        <div className="grading-header">
          <h2>Error loading samples</h2>
          <BfDsButton
            variant="ghost"
            size="small"
            icon="cross"
            onClick={onClose}
            aria-label="Close grading"
          />
        </div>
        <div className="grading-error-content">
          <BfDsIcon name="alertCircle" size="large" />
          <p>{error}</p>
          <BfDsButton
            variant="primary"
            onClick={() => globalThis.location.reload()}
          >
            Retry
          </BfDsButton>
        </div>
      </div>
    );
  }

  if (!samples || samples.length === 0) {
    return (
      <div className="grading-inbox grading-empty">
        <div className="grading-header">
          <h2>No samples found</h2>
          <BfDsButton
            variant="ghost"
            size="small"
            icon="cross"
            onClick={onClose}
            aria-label="Close grading"
          />
        </div>
        <div className="grading-empty-content">
          <BfDsIcon name="inbox" size="large" />
          <p>No grading samples available for "{deckName}"</p>
          <BfDsButton
            variant="primary"
            onClick={onClose}
          >
            Return to Decks
          </BfDsButton>
        </div>
      </div>
    );
  }

  const currentSample = samples[currentIndex];
  const totalSamples = samples.length;
  const remainingSamples = totalSamples - completedCount;

  const handleHumanRatingChange = (
    graderId: string,
    rating: -3 | -2 | -1 | 1 | 2 | 3 | null,
    comment: string,
    shouldProceedNext = false,
  ) => {
    // Store draft grades locally
    setDraftGrades((prev) => ({
      ...prev,
      [currentSample.id]: {
        ...prev[currentSample.id],
        [graderId]: { rating, comment },
      },
    }));

    // If shouldProceedNext is true, trigger handleNext after state update
    if (shouldProceedNext) {
      setTimeout(() => {
        handleNextWithAutoAdvance(graderId, rating, comment);
      }, 100);
    }
  };

  // Get current draft ratings for this sample, or use existing saved grades
  const currentSampleDrafts = draftGrades[currentSample?.id] || {};
  const existingGrades = currentSample?.humanGrade?.grades || [];
  const currentSampleRatings: Record<
    string,
    { rating: -3 | -2 | -1 | 1 | 2 | 3 | null; comment: string }
  > = {};

  // Populate with existing grades first
  existingGrades.forEach((grade) => {
    currentSampleRatings[grade.graderId] = {
      rating: grade.score,
      comment: grade.reason,
    };
  });

  // Override with draft grades
  Object.assign(currentSampleRatings, currentSampleDrafts);

  const graderIds = currentSample?.graderEvaluations?.map((e) => e.graderId) ||
    [];
  const allGradersRated = graderIds.length > 0 &&
    graderIds.every((id) =>
      currentSampleRatings[id]?.rating !== null &&
      currentSampleRatings[id]?.rating !== undefined
    );

  const handleNextWithAutoAdvance = async (
    graderId: string,
    rating: -3 | -2 | -1 | 1 | 2 | 3 | null,
    comment: string,
  ) => {
    logger.info("Saving sample grades (auto-advance)", {
      sampleId: currentSample.id,
      graderId,
      rating,
      comment,
    });

    try {
      // Prepare grades for submission - just the one grader from agree action
      const gradesToSave = [{
        graderId,
        score: rating!,
        reason: comment,
      }];

      // Save via GraphQL mutation
      await saveGrade(currentSample.id, gradesToSave);

      // Track graded sample and scores
      setGradedSampleIds((prev) => [...prev, currentSample.id]);
      const avgHumanScore = rating!;
      setHumanScores((prev) => [...prev, avgHumanScore]);

      // Clear draft for this sample
      setDraftGrades((prev) => {
        const updated = { ...prev };
        delete updated[currentSample.id];
        return updated;
      });

      setCompletedCount((prev) => prev + 1);

      // Move to next sample
      if (currentIndex < samples.length - 1) {
        setCurrentIndex((prev) => prev + 1);
      } else {
        // All samples graded - trigger completion callback
        logger.info("All samples graded", {
          deckId,
          completedCount: completedCount + 1,
        });

        if (onComplete) {
          const finalGradedIds = [...gradedSampleIds, currentSample.id];
          const finalScores = [...humanScores, avgHumanScore];
          const overallAvg = finalScores.reduce((sum, s) => sum + s, 0) /
            finalScores.length;
          onComplete(finalGradedIds, overallAvg);
        } else {
          onClose();
        }
      }
    } catch (error) {
      logger.error("Failed to save grade (auto-advance)", error);
      // Keep the draft and let user retry
    }
  };

  const handleNext = async () => {
    if (!allGradersRated) {
      return;
    }

    logger.info("Saving sample grades", {
      sampleId: currentSample.id,
      ratings: currentSampleRatings,
    });

    try {
      // Prepare grades for submission
      const gradesToSave = graderIds.map((graderId) => ({
        graderId,
        score: currentSampleRatings[graderId].rating!,
        reason: currentSampleRatings[graderId].comment,
      }));

      // Save via GraphQL mutation
      await saveGrade(currentSample.id, gradesToSave);

      // Track graded sample and scores
      setGradedSampleIds((prev) => [...prev, currentSample.id]);
      const avgHumanScore = gradesToSave.reduce((sum, g) => sum + g.score, 0) /
        gradesToSave.length;
      setHumanScores((prev) => [...prev, avgHumanScore]);

      // Clear draft for this sample
      setDraftGrades((prev) => {
        const updated = { ...prev };
        delete updated[currentSample.id];
        return updated;
      });

      setCompletedCount((prev) => prev + 1);

      // Move to next sample
      if (currentIndex < samples.length - 1) {
        setCurrentIndex((prev) => prev + 1);
      } else {
        // All samples graded - trigger completion callback
        logger.info("All samples graded", {
          deckId,
          completedCount: completedCount + 1,
        });

        if (onComplete) {
          const finalGradedIds = [...gradedSampleIds, currentSample.id];
          const finalScores = [...humanScores, avgHumanScore];
          const overallAvg = finalScores.reduce((sum, s) => sum + s, 0) /
            finalScores.length;
          onComplete(finalGradedIds, overallAvg);
        } else {
          onClose();
        }
      }
    } catch (error) {
      logger.error("Failed to save grade", error);
      // Keep the draft and let user retry
    }
  };

  const handleSkip = () => {
    if (currentIndex < samples.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  if (!currentSample) {
    return (
      <div className="grading-inbox grading-complete">
        <div className="grading-header">
          <h2>Grading Complete</h2>
          <BfDsButton
            variant="ghost"
            size="small"
            icon="cross"
            onClick={onClose}
            aria-label="Close grading"
          />
        </div>
        <div className="grading-complete-message">
          <BfDsIcon name="checkCircle" size="xlarge" />
          <h3>All samples have been graded!</h3>
          <p>You've graded {completedCount} samples from "{deckName}"</p>
          <BfDsButton
            variant="primary"
            onClick={onClose}
          >
            Return to Decks
          </BfDsButton>
        </div>
      </div>
    );
  }

  return (
    <div className="grading-inbox">
      <div className="grading-header">
        <div className="grading-header-info">
          <h2>Grading: {deckName}</h2>
          <div className="grading-progress">
            <span className="progress-text">
              Sample {currentIndex + 1} of {totalSamples}
            </span>
            <span className="progress-completed">
              {completedCount} completed
            </span>
            {remainingSamples > 0 && (
              <span className="progress-remaining">
                {remainingSamples} remaining
              </span>
            )}
          </div>
        </div>
        <div className="grading-header-actions">
          {graderIds.length > 0 && (
            <span className="rating-progress">
              {Object.values(currentSampleRatings).filter((r) =>
                r?.rating !== null && r?.rating !== undefined
              ).length}/{graderIds.length} rated
            </span>
          )}
          <BfDsButton
            variant="ghost"
            size="small"
            onClick={handleSkip}
            disabled={currentIndex >= samples.length - 1}
          >
            Skip
          </BfDsButton>
          <BfDsButton
            variant="primary"
            size="small"
            icon={saving ? undefined : "arrowRight"}
            iconPosition="right"
            onClick={handleNext}
            disabled={!allGradersRated || saving}
          >
            {saving
              ? (
                <>
                  <BfDsSpinner size={16} />
                  Saving...
                </>
              )
              : (
                <>
                  {currentIndex === samples.length - 1 ? "Complete" : "Next"}
                </>
              )}
          </BfDsButton>
          <BfDsButton
            variant="ghost"
            size="small"
            icon="cross"
            onClick={onClose}
            aria-label="Close grading"
          />
        </div>
      </div>

      <div className="grading-content">
        <SampleDisplay
          sample={currentSample}
          onHumanRatingChange={handleHumanRatingChange}
          currentRatings={currentSampleRatings}
          onAgreeAndNext={handleNext}
          canProceed={allGradersRated && !saving}
        />
      </div>
    </div>
  );
}
