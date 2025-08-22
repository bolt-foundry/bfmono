import { useMemo, useState } from "react";
import { BfDsButton } from "@bfmono/apps/bfDs/components/BfDsButton.tsx";
import { BfDsIcon } from "@bfmono/apps/bfDs/components/BfDsIcon.tsx";
import { BfDsBadge } from "@bfmono/apps/bfDs/components/BfDsBadge.tsx";
import { BfDsList } from "@bfmono/apps/bfDs/components/BfDsList.tsx";
import { BfDsListBar } from "@bfmono/apps/bfDs/components/BfDsListBar.tsx";
import type { GradingSample } from "@bfmono/apps/boltfoundry-com/types/grading.ts";
import { useRouter } from "@bfmono/apps/boltfoundry-com/contexts/RouterContext.tsx";
import { GraderRefinementModal } from "./GraderRefinementModal.tsx";

interface GradingSamplesListProps {
  onStartGrading: () => void;
  onViewSample: (sample: GradingSample) => void;
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
  onStartGrading,
  onViewSample,
  availableSamples = [],
}: GradingSamplesListProps) {
  const { navigate } = useRouter();
  const [isRefinementModalOpen, setIsRefinementModalOpen] = useState(false);
  const [selectedSamplesForRefinement, setSelectedSamplesForRefinement] =
    useState<Array<GradingSample>>([]);

  // Process samples synchronously - no loading delay needed
  const gradedSamples = useMemo(() => {
    // Get graded samples from the available samples (those with humanGrade)
    const actualGradedSamples = availableSamples.filter((sample) =>
      sample.humanGrade
    );

    // Generate mock historical data (but fewer since we now have real data)
    const historicalSamples = generateMockHistoricalSamples(7);

    // Combine actual graded samples with historical ones, with actual ones first
    return [...actualGradedSamples, ...historicalSamples];
  }, [availableSamples]);

  const ungradedCount = useMemo(() => {
    return availableSamples.filter((sample) => !sample.humanGrade).length;
  }, [availableSamples]);

  const handleBulkDelete = (_selectedIds: Array<string>) => {
    // TODO: Implement actual delete functionality
  };

  const handleBulkRefine = (selectedIds: Array<string>) => {
    // Get the selected samples from the gradedSamples array
    const selectedSamples = gradedSamples.filter((sample) =>
      selectedIds.includes(sample.id)
    );
    setSelectedSamplesForRefinement(selectedSamples);
    setIsRefinementModalOpen(true);
  };

  const handleBulkCancel = () => {
    // Cancel will be handled by the clearSelection function from BfDsList
  };

  const renderBulkActions = (
    selectedIds: Array<string>,
    clearSelection: () => void,
  ) => {
    return (
      <div className="bulk-actions-toolbar flexRow gapSmall">
        <BfDsButton
          variant="secondary"
          size="small"
          icon="trash"
          onClick={() => {
            handleBulkDelete(selectedIds);
            clearSelection();
          }}
        >
          Delete ({selectedIds.length})
        </BfDsButton>
        <BfDsButton
          variant="primary"
          size="small"
          icon="edit"
          onClick={() => {
            handleBulkRefine(selectedIds);
            clearSelection();
          }}
        >
          Refine ({selectedIds.length})
        </BfDsButton>
        <BfDsButton
          variant="ghost"
          size="small"
          onClick={() => {
            handleBulkCancel();
            clearSelection();
          }}
        >
          Cancel
        </BfDsButton>
      </div>
    );
  };

  // No loading state needed - samples are processed synchronously

  return (
    <>
      <GraderRefinementModal
        isOpen={isRefinementModalOpen}
        onClose={() => setIsRefinementModalOpen(false)}
        selectedSamples={selectedSamplesForRefinement}
      />
      <div className="grading-samples-list">
        {/* Ungraded samples callout */}
        {ungradedCount > 0 && (
          <div
            className="grading-summary-callout clickable"
            onClick={onStartGrading}
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
          <BfDsList
            header="Graded samples history"
            bulkSelect
            bulkActions={renderBulkActions}
          >
            {gradedSamples.map((sample) => {
              const avgScore = (sample.graderEvaluations?.reduce(
                (sum, e) => sum + e.score,
                0,
              ) || 0) / (sample.graderEvaluations?.length || 1);
              const humanScore = sample.humanGrade?.grades[0]?.score || 0;
              const agreementGrade = getAgreementGrade(avgScore, humanScore);

              return (
                <BfDsListBar
                  key={sample.id}
                  value={sample.id}
                  clickable
                  onClick={() => {
                    // V3 routing: Navigate to sample view fullscreen
                    navigate(`/mock/pg/grade/sample/${sample.id}`);
                    // Keep the original callback for backward compatibility
                    onViewSample(sample);
                  }}
                  left={
                    <div className="sample-primary-info">
                      <div>
                        <div className="sample-timestamp">
                          {new Date(sample.timestamp).toLocaleString()}
                        </div>
                        <div className="sample-meta">
                          <span className="provider">{sample.provider}</span>
                          <span style={{ margin: "0 8px" }}>•</span>
                          <span className="duration">{sample.duration}ms</span>
                        </div>
                      </div>
                    </div>
                  }
                  right={
                    <div className="sample-scores-and-grade">
                      <div className="sample-scores">
                        <div className="ai-score">
                          <span className="score-label">
                            AI:
                          </span>
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
                            <span className="score-label">
                              Human:
                            </span>
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
                      </div>
                      {sample.humanGrade && (
                        <BfDsBadge
                          variant={getAgreementVariant(agreementGrade)}
                        >
                          {agreementGrade}
                        </BfDsBadge>
                      )}
                    </div>
                  }
                />
              );
            })}
          </BfDsList>
        </div>
      </div>
    </>
  );
}
