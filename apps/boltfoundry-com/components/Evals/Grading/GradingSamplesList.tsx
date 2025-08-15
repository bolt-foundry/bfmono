import { useEffect, useState } from "react";
import { BfDsButton } from "@bfmono/apps/bfDs/components/BfDsButton.tsx";
import { BfDsIcon } from "@bfmono/apps/bfDs/components/BfDsIcon.tsx";
import { BfDsSpinner } from "@bfmono/apps/bfDs/components/BfDsSpinner.tsx";
import { BfDsBadge } from "@bfmono/apps/bfDs/components/BfDsBadge.tsx";
import type { GradingSample } from "@bfmono/apps/boltfoundry-com/types/grading.ts";
import { getLogger } from "@bfmono/packages/logger/logger.ts";

const logger = getLogger(import.meta);

interface GradingSamplesListProps {
  deckId: string;
  deckName: string;
  onStartGrading: () => void;
  onViewSample: (sample: GradingSample) => void;
  justCompletedIds?: Array<string>;
  completionSummary?: {
    totalGraded: number;
    averageScore: number;
  };
  availableSamples?: Array<GradingSample>;
}

// Generate mock historical samples
function generateMockHistoricalSamples(count: number): Array<GradingSample> {
  const samples: Array<GradingSample> = [];
  const now = Date.now();

  for (let i = 0; i < count; i++) {
    const timestamp = new Date(now - (i + 1) * 86400000).toISOString(); // Days ago
    samples.push({
      id: `historical-${i + 1}`,
      timestamp,
      provider: ["gpt-4", "claude-3", "gpt-3.5-turbo"][i % 3],
      duration: Math.floor(Math.random() * 2000) + 500,
      request: {
        body: {
          messages: [
            { role: "user", content: `Historical prompt ${i + 1}` },
          ],
        },
      },
      response: {
        body: {
          choices: [{
            message: {
              content: {
                result: `Historical response ${i + 1}`,
                score: Math.random(),
              },
            },
          }],
        },
      },
      graderEvaluations: [
        {
          graderId: "grader-1",
          graderName: "Accuracy Grader",
          score: [-3, -2, -1, 1, 2, 3][Math.floor(Math.random() * 6)],
          reason: "Historical evaluation",
        },
      ],
      humanGrade: {
        grades: [{
          graderId: "grader-1",
          score: [-3, -2, -1, 1, 2, 3][Math.floor(Math.random() * 6)] as
            | -3
            | -2
            | -1
            | 1
            | 2
            | 3,
          reason: "Historical human grade",
        }],
        gradedBy: "user123",
        gradedAt: timestamp,
      },
      bfMetadata: {
        deckName: "Test Deck",
        deckContent: "Sample deck content",
        contextVariables: {},
      },
    });
  }

  return samples;
}

// Convert difference between AI and human scores to agreement grade
function getAgreementGrade(aiScore: number, humanScore: number): string {
  const difference = Math.abs(aiScore - humanScore);
  if (difference <= 0.5) return "A"; // Excellent agreement
  if (difference <= 1.0) return "B"; // Good agreement
  if (difference <= 2.0) return "C"; // Fair agreement
  if (difference <= 3.0) return "D"; // Poor agreement
  return "F"; // Very poor agreement
}

// Get badge variant for agreement grade
function getAgreementVariant(
  grade: string,
): "success" | "warning" | "error" | "default" {
  switch (grade) {
    case "A":
      return "success";
    case "B":
      return "success";
    case "C":
      return "warning";
    case "D":
      return "error";
    case "F":
      return "error";
    default:
      return "default";
  }
}

export function GradingSamplesList({
  deckId,
  deckName,
  onStartGrading,
  onViewSample,
  justCompletedIds = [],
  completionSummary,
  availableSamples = [],
}: GradingSamplesListProps) {
  const [loading, setLoading] = useState(true);
  const [gradedSamples, setGradedSamples] = useState<Array<GradingSample>>([]);
  const [ungradedCount, setUngradedCount] = useState(0);

  useEffect(() => {
    // Simulate loading samples
    logger.info("Loading samples list for deck", { deckId });
    setLoading(true);

    setTimeout(() => {
      // Get graded samples from the available samples (those with humanGrade)
      const actualGradedSamples = availableSamples.filter((sample) =>
        sample.humanGrade
      );

      // Generate mock historical data (but fewer since we now have real data)
      const historicalSamples = generateMockHistoricalSamples(7);

      // Combine actual graded samples with historical ones, with actual ones first
      const allGradedSamples = [...actualGradedSamples, ...historicalSamples];

      setGradedSamples(allGradedSamples);

      // Count ungraded samples from available samples
      const actualUngradedCount = availableSamples.filter((sample) =>
        !sample.humanGrade
      ).length;
      setUngradedCount(actualUngradedCount);

      setLoading(false);
    }, 500);
  }, [deckId, availableSamples]);

  if (loading) {
    return (
      <div className="grading-samples-list grading-loading">
        <div className="grading-header">
          <h2>Loading samples for {deckName}...</h2>
        </div>
        <div className="grading-loading-content">
          <BfDsSpinner size={48} />
        </div>
      </div>
    );
  }

  return (
    <div className="grading-samples-list">
      <div className="grading-header">
        <h2>{deckName} - Grading overview</h2>
      </div>

      {/* Completion summary callout */}
      {completionSummary && (
        <div className="grading-summary-callout success">
          <BfDsIcon name="checkCircle" size="medium" />
          <div className="callout-content">
            <h3>Grading session complete!</h3>
            <p>
              You graded {completionSummary.totalGraded}{" "}
              samples with an average human score of{" "}
              {completionSummary.averageScore > 0 ? "+" : ""}
              {completionSummary.averageScore.toFixed(1)}
            </p>
          </div>
        </div>
      )}

      {/* Ungraded samples callout */}
      {ungradedCount > 0 && !completionSummary && (
        <div
          className="grading-summary-callout"
          onClick={onStartGrading}
          style={{ cursor: "pointer" }}
        >
          <BfDsIcon name="bell" size="medium" />
          <div className="callout-content">
            <h3>
              {ungradedCount} new sample{ungradedCount !== 1 ? "s" : ""}{" "}
              to Grade
            </h3>
            <p>New samples are ready for human evaluation</p>
          </div>
          <BfDsButton
            variant="primary"
            onClick={onStartGrading}
            icon="grade"
          >
            Start grading
          </BfDsButton>
        </div>
      )}

      <div className="samples-list-section">
        <h3>Graded samples history</h3>
        <div className="samples-list">
          {gradedSamples.map((sample) => {
            const isJustCompleted = justCompletedIds.includes(sample.id);
            const avgScore = (sample.graderEvaluations?.reduce(
              (sum, e) => sum + e.score,
              0,
            ) || 0) / (sample.graderEvaluations?.length || 1);
            const humanScore = sample.humanGrade?.grades[0]?.score || 0;
            const agreementGrade = getAgreementGrade(avgScore, humanScore);

            return (
              <div
                key={sample.id}
                className="sample-list-item"
                onClick={() => onViewSample(sample)}
              >
                {isJustCompleted && (
                  <BfDsBadge variant="success">
                    new
                  </BfDsBadge>
                )}
                <div className="sample-info">
                  <div className="sample-timestamp">
                    {new Date(sample.timestamp).toLocaleString()}
                  </div>
                  <div className="sample-meta">
                    <span className="provider">{sample.provider}</span>
                    <span className="duration">{sample.duration}ms</span>
                  </div>
                </div>
                <div className="sample-scores">
                  <div className="ai-score">
                    <span className="score-label">AI:</span>
                    <span
                      className={`score-value ${
                        avgScore >= 2
                          ? "positive"
                          : avgScore <= -2
                          ? "negative"
                          : "neutral"
                      }`}
                    >
                      {avgScore > 0 ? "+" : ""}
                      {avgScore.toFixed(1)}
                    </span>
                  </div>
                  {sample.humanGrade && (
                    <div className="human-score">
                      <span className="score-label">Human:</span>
                      <span
                        className={`score-value ${
                          sample.humanGrade.grades[0].score > 0
                            ? "positive"
                            : "negative"
                        }`}
                      >
                        {sample.humanGrade.grades[0].score > 0 ? "+" : ""}
                        {sample.humanGrade.grades[0].score}
                      </span>
                    </div>
                  )}
                  {sample.humanGrade && (
                    <div className="agreement-badge">
                      <BfDsBadge variant={getAgreementVariant(agreementGrade)}>
                        {agreementGrade}
                      </BfDsBadge>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
