import { useMemo, useState } from "react";
import { BfDsModal } from "@bfmono/apps/bfDs/components/BfDsModal.tsx";
import { BfDsButton } from "@bfmono/apps/bfDs/components/BfDsButton.tsx";
import { BfDsCheckbox } from "@bfmono/apps/bfDs/components/BfDsCheckbox.tsx";
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
  const [step, setStep] = useState<"selection" | "progress" | "results">(
    "selection",
  );
  const [selectedGraderIds, setSelectedGraderIds] = useState<Set<string>>(
    new Set(),
  );

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

  const handleClose = () => {
    setStep("selection");
    setSelectedGraderIds(new Set());
    onClose();
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
        <p>Refining selected graders...</p>
        <p>See details on the Graders tab</p>
        {/* TODO: Add progress indicators */}
      </div>
    );
  };

  const renderResultsStep = () => {
    return (
      <div className="results-step">
        <p>Refinement completed!</p>
        {/* TODO: Add results summary */}
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
              onClick={() => setStep("progress")}
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
