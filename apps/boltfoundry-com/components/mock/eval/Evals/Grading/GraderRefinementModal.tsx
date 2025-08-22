import { useEffect, useMemo, useState } from "react";
import { BfDsModal } from "@bfmono/apps/bfDs/components/BfDsModal.tsx";
import { BfDsButton } from "@bfmono/apps/bfDs/components/BfDsButton.tsx";
import { BfDsCheckbox } from "@bfmono/apps/bfDs/components/BfDsCheckbox.tsx";
import { BfDsProgressBar } from "@bfmono/apps/bfDs/components/BfDsProgressBar.tsx";
import { BfDsCallout } from "@bfmono/apps/bfDs/components/BfDsCallout.tsx";
import {
  type RefinementProgress,
  type RefinementResult,
  useRefinementContext,
} from "@bfmono//internalbf/bfmono/apps/boltfoundry-com/components/mock/contexts/RefinementContext.tsx";
import type { GradingSample } from "@bfmono/apps/boltfoundry-com/types/grading.ts";

interface GraderRefinementModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedSamples: Array<GradingSample>;
}

interface GraderDeviationData {
  graderId: string;
  graderName: string;
  deviations: Array<number>;
  accuracyWithinOne: number;
}

interface DeviationDistribution {
  [deviation: number]: number; // deviation -> count
}

// Calculate deviation between human and grader scores
function calculateDeviation(humanScore: number, graderScore: number): number {
  return graderScore - humanScore;
}

// Calculate baseline accuracy (percentage within ±1 point)
function calculateAccuracy(deviations: Array<number>): number {
  if (deviations.length === 0) return 0;
  const withinOne = deviations.filter((dev) => Math.abs(dev) <= 1).length;
  return Math.round((withinOne / deviations.length) * 100);
}

// Create distribution map for chart
function createDistribution(deviations: Array<number>): DeviationDistribution {
  const distribution: DeviationDistribution = {};
  for (const dev of deviations) {
    distribution[dev] = (distribution[dev] || 0) + 1;
  }
  return distribution;
}

// Mock refinement API functions
function mockStartRefinement(
  graderIds: Array<string>,
  graderData: Array<GraderDeviationData>,
): Promise<Array<RefinementProgress>> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const progressData = graderIds.map((graderId) => {
        const grader = graderData.find((g) => g.graderId === graderId);
        return {
          graderId,
          graderName: grader?.graderName || "Unknown Grader",
          status: "pending" as const,
          progress: 0,
          currentStage: "analyze" as const,
          stageProgress: {
            analyze: 0,
            adjust: 0,
            test: 0,
          },
          startTime: Date.now(),
        };
      });

      resolve(progressData);
    }, 500);
  });
}

function mockGetResults(
  completedProgress: Array<RefinementProgress>,
  graderData: Array<GraderDeviationData>,
): Array<RefinementResult> {
  const parameterOptions = [
    "confidence_threshold",
    "bias_correction_factor",
    "scoring_sensitivity",
    "context_weight",
    "penalty_scaling",
    "outlier_detection",
  ];

  const biasTypes = [
    "Reduced harsh grading tendency",
    "Corrected lenient scoring bias",
    "Improved consistency across score ranges",
    "Enhanced accuracy for edge cases",
  ];

  return completedProgress
    .filter((p) => p.status === "completed")
    .map((progress) => {
      const grader = graderData.find((g) => g.graderId === progress.graderId);
      const previousAccuracy = grader?.accuracyWithinOne || 0;
      const improvement = Math.random() * 20 + 5; // 5-25% improvement
      const newAccuracy = Math.min(previousAccuracy + improvement, 100);

      // Generate realistic parameter changes
      const numChanges = Math.floor(Math.random() * 3) + 2; // 2-4 parameters
      const parametersAdjusted = parameterOptions
        .sort(() => Math.random() - 0.5)
        .slice(0, numChanges);

      const thresholdChanges = parametersAdjusted.map((param) => ({
        parameter: param,
        oldValue: Math.round((Math.random() * 0.8 + 0.1) * 100) / 100, // 0.1-0.9
        newValue: Math.round((Math.random() * 0.8 + 0.1) * 100) / 100,
      }));

      return {
        graderId: progress.graderId,
        graderName: progress.graderName,
        previousAccuracy,
        newAccuracy,
        samplesProcessed: grader?.deviations.length || 0,
        testSamplesUsed: Math.floor(Math.random() * 50) + 100, // 100-150 test samples
        improvementSummary: improvement > 15
          ? "Significant improvement in accuracy"
          : improvement > 10
          ? "Good improvement in consistency"
          : "Minor accuracy improvements",
        changesApplied: {
          parametersAdjusted,
          biasCorrection:
            biasTypes[Math.floor(Math.random() * biasTypes.length)],
          thresholdChanges,
        },
      };
    });
}

// React Div Deviation Chart Component
function DeviationChart({ deviations }: { deviations: Array<number> }) {
  const distribution = useMemo(() => createDistribution(deviations), [
    deviations,
  ]);
  const maxCount = Math.max(...Object.values(distribution));
  const maxDeviation = 6;
  const chartHeight = 80;

  // Create bars for deviations from -6 to +6
  const bars = [];
  for (let dev = -maxDeviation; dev <= maxDeviation; dev++) {
    const count = distribution[dev] || 0;
    const barHeight = maxCount > 0 ? (count / maxCount) * chartHeight : 0;

    const getBarClass = (deviation: number) => {
      if (deviation === 0) return "deviation-bar--perfect";
      if (Math.abs(deviation) <= 2) return "deviation-bar--good";
      return "deviation-bar--poor";
    };

    const getLabelClass = (deviation: number) => {
      return deviation === 0 ? "deviation-label--perfect" : "deviation-label";
    };

    bars.push(
      <div key={dev} className="deviation-bar-container">
        <div
          className={`deviation-bar ${getBarClass(dev)}`}
          style={{ height: `${barHeight}px` }}
          title={`${
            dev === 0 ? "Perfect" : dev > 0 ? `+${dev}` : dev
          }: ${count} samples`}
        />
        <div className={getLabelClass(dev)}>
          {dev === 0 ? "0" : dev > 0 ? `+${dev}` : dev}
        </div>
      </div>,
    );
  }

  return (
    <div className="deviation-chart">
      <div
        className="deviation-chart-container"
        style={{ height: `${chartHeight + 20}px` }}
      >
        {bars}
        <div className="deviation-chart-centerline" />
      </div>
      <div className="deviation-chart-description">
        Deviation from human grades
      </div>
    </div>
  );
}

export function GraderRefinementModal({
  isOpen,
  onClose,
  selectedSamples,
}: GraderRefinementModalProps) {
  const {
    isRefining,
    refinementProgress,
    startRefinement,
    updateProgressStatus,
  } = useRefinementContext();
  const [step, setStep] = useState<"selection" | "progress" | "results">(
    "selection",
  );
  const [selectedGraderIds, setSelectedGraderIds] = useState<Set<string>>(
    new Set(),
  );
  const [refinementResults, setRefinementResults] = useState<
    Array<RefinementResult>
  >([]);

  // Process grader data from selected samples
  const graderData = useMemo<Array<GraderDeviationData>>(() => {
    const graderMap = new Map<
      string,
      { name: string; deviations: Array<number> }
    >();

    for (const sample of selectedSamples) {
      if (!sample.humanGrade?.grades[0] || !sample.graderEvaluations) continue;

      const humanScore = sample.humanGrade.grades[0].score;

      for (const graderEval of sample.graderEvaluations) {
        const deviation = calculateDeviation(humanScore, graderEval.score);

        if (!graderMap.has(graderEval.graderId)) {
          graderMap.set(graderEval.graderId, {
            name: graderEval.graderName,
            deviations: [],
          });
        }

        graderMap.get(graderEval.graderId)!.deviations.push(deviation);
      }
    }

    return Array.from(graderMap.entries()).map(([graderId, data]) => ({
      graderId,
      graderName: data.name,
      deviations: data.deviations,
      accuracyWithinOne: calculateAccuracy(data.deviations),
    }));
  }, [selectedSamples]);

  // Monitor refinement completion
  useEffect(() => {
    if (!isRefining) return;

    // Check if any items just completed/failed and generate results for them
    const newlyCompleted = refinementProgress.filter((p) =>
      (p.status === "completed" || p.status === "failed") &&
      !refinementResults.some((r) => r.graderId === p.graderId)
    );

    if (newlyCompleted.length > 0) {
      const newResults = mockGetResults(newlyCompleted, graderData);
      setRefinementResults((prev) => [...prev, ...newResults]);
    }

    const allDismissed = refinementProgress.every((p) =>
      p.status === "dismissed"
    );

    if (allDismissed && step === "progress") {
      setStep("results");
    }
  }, [
    isRefining,
    refinementProgress,
    graderData,
    step,
    refinementResults,
  ]);

  const handleClose = () => {
    // Only reset UI state, not refinement progress
    // This allows refinement to continue in background
    setStep("selection");
    setSelectedGraderIds(new Set());
    setRefinementResults([]);
    // Don't reset: setRefinementProgress([]) and setIsRefining(false)
    onClose();
  };

  const handleStartRefinement = async () => {
    const graderIdsArray = Array.from(selectedGraderIds);
    setStep("progress");

    const initialProgress = await mockStartRefinement(
      graderIdsArray,
      graderData,
    );

    // Start refinement using context
    startRefinement(initialProgress);
  };

  const getStageLabel = (stage: RefinementProgress["currentStage"]): string => {
    switch (stage) {
      case "analyze":
        return "Analyzing samples...";
      case "adjust":
        return "Adjusting grader...";
      case "test":
        return "Testing grader...";
      case "complete":
        return "Complete";
      default:
        return "Processing...";
    }
  };

  const getStageDescription = (
    stage: RefinementProgress["currentStage"],
  ): string => {
    switch (stage) {
      case "analyze":
        return "Examining training samples and identifying patterns";
      case "adjust":
        return "Modifying grader parameters and bias corrections";
      case "test":
        return "Running grader through test suite (this may take longer)";
      case "complete":
        return "Refinement process completed";
      default:
        return "";
    }
  };

  const handleGraderSelection = (graderId: string, checked: boolean) => {
    const newSelection = new Set(selectedGraderIds);
    if (checked) {
      newSelection.add(graderId);
    } else {
      newSelection.delete(graderId);
    }
    setSelectedGraderIds(newSelection);
  };

  const renderSelectionStep = () => {
    return (
      <div className="grader-selection-step">
        <p className="grader-selection-description">
          Select graders to refine based on their deviation patterns. Charts
          show how far each grader deviates from human grades.
        </p>

        <div className="grader-cards">
          {graderData.map((grader) => (
            <div
              key={grader.graderId}
              className={`grader-card ${
                selectedGraderIds.has(grader.graderId)
                  ? "grader-card--selected"
                  : ""
              }`}
            >
              <div className="grader-card-content">
                <BfDsCheckbox
                  checked={selectedGraderIds.has(grader.graderId)}
                  onChange={(checked) =>
                    handleGraderSelection(grader.graderId, checked)}
                />

                <div className="grader-card-info">
                  <div className="grader-card-header">
                    <div>
                      <h4 className="grader-card-title">
                        {grader.graderName}
                      </h4>
                      <p className="grader-card-accuracy">
                        {grader.accuracyWithinOne}% within ±1 point
                      </p>
                    </div>

                    <div className="grader-card-sample-count">
                      <div className="grader-card-sample-count-text">
                        {grader.deviations.length} samples
                      </div>
                    </div>
                  </div>

                  <DeviationChart deviations={grader.deviations} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {graderData.length === 0 && (
          <div className="grader-selection-empty">
            No grader data available for the selected samples.
          </div>
        )}
      </div>
    );
  };

  const renderProgressStep = () => {
    return (
      <div className="progress-step">
        <p
          style={{ marginBottom: "20px", color: "var(--bfds-text-secondary)" }}
        >
          Refining selected graders... You can see detailed progress on the
          Graders tab.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {refinementProgress.map((progress) => (
            <BfDsCallout
              key={progress.graderId}
              variant={progress.status === "completed"
                ? "success"
                : progress.status === "failed"
                ? "error"
                : progress.status === "refining"
                ? "info"
                : "info"}
              autoDismiss={progress.status === "completed" ||
                  progress.status === "failed"
                ? 5000
                : 0}
              onDismiss={() =>
                updateProgressStatus(progress.graderId, "dismissed")}
            >
              <div style={{ marginBottom: "8px" }}>
                <span style={{ fontWeight: "600" }}>{progress.graderName}</span>
              </div>

              <BfDsProgressBar
                label={progress.status === "refining"
                  ? getStageLabel(progress.currentStage)
                  : progress.status === "completed"
                  ? "Complete!"
                  : progress.status === "failed"
                  ? "Failed"
                  : "Pending..."}
                value={progress.progress}
                size="small"
                state={progress.status === "failed"
                  ? "error"
                  : progress.status === "completed"
                  ? "success"
                  : "default"}
                showValue
                helpText={progress.status === "refining"
                  ? getStageDescription(progress.currentStage)
                  : progress.status === "completed"
                  ? "Refinement completed successfully"
                  : progress.status === "failed"
                  ? "Refinement failed - may need manual review"
                  : "Waiting to start..."}
              />
            </BfDsCallout>
          ))}
        </div>
      </div>
    );
  };

  const renderResultsStep = () => {
    const successfulResults = refinementResults.filter((r) =>
      r.newAccuracy > r.previousAccuracy
    );
    const failedCount =
      refinementProgress.filter((p) => p.status === "failed").length;

    return (
      <div className="results-step">
        <div style={{ marginBottom: "20px" }}>
          <h3 style={{ margin: "0 0 8px 0", color: "var(--bfds-success)" }}>
            Refinement Complete!
          </h3>
          <p style={{ margin: 0, color: "var(--bfds-text-secondary)" }}>
            {successfulResults.length}{" "}
            grader{successfulResults.length !== 1 ? "s" : ""}{" "}
            successfully improved
            {failedCount > 0 && `, ${failedCount} failed`}
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {refinementResults.map((result) => (
            <div
              key={result.graderId}
              style={{
                padding: "16px",
                border: "1px solid var(--bfds-border)",
                borderRadius: "8px",
                backgroundColor: "var(--bfds-background)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: "12px",
                }}
              >
                <div>
                  <h4 style={{ margin: "0 0 4px 0", fontWeight: "600" }}>
                    {result.graderName}
                  </h4>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "14px",
                      color: "var(--bfds-text-secondary)",
                    }}
                  >
                    {result.improvementSummary}
                  </p>
                </div>

                <div style={{ textAlign: "right" }}>
                  <div
                    style={{
                      fontSize: "12px",
                      color: "var(--bfds-text-muted)",
                    }}
                  >
                    {result.samplesProcessed} training /{" "}
                    {result.testSamplesUsed} test samples
                  </div>
                </div>
              </div>

              <div
                style={{ display: "flex", gap: "24px", alignItems: "center" }}
              >
                <div>
                  <div
                    style={{
                      fontSize: "12px",
                      color: "var(--bfds-text-muted)",
                    }}
                  >
                    Previous
                  </div>
                  <div style={{ fontSize: "18px", fontWeight: "600" }}>
                    {result.previousAccuracy.toFixed(0)}%
                  </div>
                </div>

                <div style={{ color: "var(--bfds-text-muted)" }}>→</div>

                <div>
                  <div
                    style={{
                      fontSize: "12px",
                      color: "var(--bfds-text-muted)",
                    }}
                  >
                    New
                  </div>
                  <div
                    style={{
                      fontSize: "18px",
                      fontWeight: "600",
                      color: "var(--bfds-success)",
                    }}
                  >
                    {result.newAccuracy.toFixed(0)}%
                  </div>
                </div>

                <div
                  style={{
                    marginLeft: "auto",
                    padding: "4px 8px",
                    backgroundColor: "var(--bfds-success-02)",
                    color: "var(--bfds-success)",
                    borderRadius: "4px",
                    fontSize: "12px",
                    fontWeight: "600",
                  }}
                >
                  +{(result.newAccuracy - result.previousAccuracy).toFixed(0)}%
                </div>
              </div>

              {/* Changes Applied - Expandable */}
              <details style={{ marginTop: "16px" }}>
                <summary
                  style={{
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: "600",
                    color: "var(--bfds-text-secondary)",
                    marginBottom: "8px",
                  }}
                >
                  View Changes Applied
                </summary>

                <div
                  style={{
                    padding: "12px",
                    backgroundColor: "var(--bfds-background-02)",
                    borderRadius: "6px",
                    marginTop: "8px",
                  }}
                >
                  <div style={{ marginBottom: "12px" }}>
                    <div
                      style={{
                        fontSize: "13px",
                        fontWeight: "600",
                        marginBottom: "4px",
                      }}
                    >
                      Bias Correction:
                    </div>
                    <div
                      style={{
                        fontSize: "13px",
                        color: "var(--bfds-text-secondary)",
                      }}
                    >
                      {result.changesApplied.biasCorrection}
                    </div>
                  </div>

                  <div style={{ marginBottom: "12px" }}>
                    <div
                      style={{
                        fontSize: "13px",
                        fontWeight: "600",
                        marginBottom: "4px",
                      }}
                    >
                      Parameters Adjusted:
                    </div>
                    <div
                      style={{
                        fontSize: "13px",
                        color: "var(--bfds-text-secondary)",
                      }}
                    >
                      {result.changesApplied.parametersAdjusted.join(", ")}
                    </div>
                  </div>

                  <div>
                    <div
                      style={{
                        fontSize: "13px",
                        fontWeight: "600",
                        marginBottom: "8px",
                      }}
                    >
                      Threshold Changes:
                    </div>
                    {result.changesApplied.thresholdChanges.map((
                      change,
                      index,
                    ) => (
                      <div
                        key={index}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          fontSize: "12px",
                          marginBottom: "4px",
                        }}
                      >
                        <span style={{ color: "var(--bfds-text-secondary)" }}>
                          {change.parameter}:
                        </span>
                        <span>
                          {change.oldValue} → {change.newValue}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </details>
            </div>
          ))}

          {failedCount > 0 && (
            <div
              style={{
                padding: "16px",
                border: "1px solid var(--bfds-error-02)",
                borderRadius: "8px",
                backgroundColor: "var(--bfds-error-01)",
              }}
            >
              <div
                style={{
                  color: "var(--bfds-error)",
                  fontWeight: "600",
                  marginBottom: "4px",
                }}
              >
                {failedCount} grader{failedCount !== 1 ? "s" : ""}{" "}
                failed to refine
              </div>
              <div
                style={{
                  fontSize: "14px",
                  color: "var(--bfds-text-secondary)",
                }}
              >
                These may need manual review or different training data.
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const getStepContent = () => {
    switch (step) {
      case "selection":
        return renderSelectionStep();
      case "progress":
        return renderProgressStep();
      case "results":
        return renderResultsStep();
      default:
        return renderSelectionStep();
    }
  };

  const getTitle = () => {
    switch (step) {
      case "selection":
        return `Refine with ${selectedSamples.length} samples`;
      case "progress":
        return "Refining Graders";
      case "results":
        return "Refinement Complete";
      default:
        return "Refine Graders";
    }
  };

  const getFooter = () => {
    switch (step) {
      case "selection":
        return (
          <>
            <BfDsButton variant="secondary" onClick={handleClose}>
              Cancel
            </BfDsButton>
            <BfDsButton
              variant="primary"
              onClick={handleStartRefinement}
              disabled={selectedGraderIds.size === 0}
            >
              Refine Selected Graders ({selectedGraderIds.size})
            </BfDsButton>
          </>
        );
      case "progress":
        return (
          <BfDsButton variant="secondary" onClick={handleClose}>
            Close
          </BfDsButton>
        );
      case "results":
        return (
          <BfDsButton variant="primary" onClick={handleClose}>
            Done
          </BfDsButton>
        );
      default:
        return null;
    }
  };

  return (
    <BfDsModal
      isOpen={isOpen}
      onClose={handleClose}
      title={getTitle()}
      size="large"
      footer={getFooter()}
    >
      {getStepContent()}
    </BfDsModal>
  );
}
