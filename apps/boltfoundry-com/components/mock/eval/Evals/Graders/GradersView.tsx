import type React from "react";
import { useEffect, useState } from "react";
import { BfDsList } from "@bfmono/apps/bfDs/components/BfDsList.tsx";
import { BfDsListBar } from "@bfmono/apps/bfDs/components/BfDsListBar.tsx";
import { BfDsBadge } from "@bfmono/apps/bfDs/components/BfDsBadge.tsx";
import { BfDsButton } from "@bfmono/apps/bfDs/components/BfDsButton.tsx";
import { BfDsEmptyState } from "@bfmono/apps/bfDs/components/BfDsEmptyState.tsx";
import { BfDsProgressBar } from "@bfmono/apps/bfDs/components/BfDsProgressBar.tsx";
import { BfDsCallout } from "@bfmono/apps/bfDs/components/BfDsCallout.tsx";
import { useRefinementContext } from "@bfmono//internalbf/bfmono/apps/boltfoundry-com/components/mock/contexts/RefinementContext.tsx";

export interface Grader {
  id: string;
  name: string;
  description: string;
  accuracy: number;
  samplesEvaluated: number;
  lastUpdated: string;
  status: "active" | "refining" | "inactive";
  refinementProgress?: {
    stage: "analyze" | "adjust" | "test" | "complete";
    progress: number;
    eta: string;
  };
}

interface GradersViewProps {
  deckId: string;
  showMockData?: boolean; // Allow hiding mock data to test empty state
}

// Mock grader data - IDs must match sample data for context integration
function generateMockGraders(): Array<Grader> {
  return [
    {
      id: "grader-1",
      name: "Accuracy Grader",
      description: "Evaluates response accuracy against expected outputs",
      accuracy: 92.5,
      samplesEvaluated: 1247,
      lastUpdated: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      status: "active",
    },
    {
      id: "grader-2",
      name: "Helpfulness Grader",
      description: "Measures the practical value and usefulness of responses",
      accuracy: 85.7,
      samplesEvaluated: 943,
      lastUpdated: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      status: "active",
    },
    {
      id: "grader-3",
      name: "Coherence Grader",
      description: "Evaluates logical flow and clarity of responses",
      accuracy: 90.1,
      samplesEvaluated: 876,
      lastUpdated: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      status: "inactive",
    },
  ];
}

export function GradersView(
  { deckId: _deckId, showMockData = true }: GradersViewProps,
) {
  const [graders, setGraders] = useState<Array<Grader>>(
    showMockData ? generateMockGraders() : [],
  );
  const { isRefining, refinementProgress, updateProgressStatus } =
    useRefinementContext();

  // Update grader status based on context refinement progress
  useEffect(() => {
    if (!isRefining || refinementProgress.length === 0) {
      // Only reset graders if isRefining is false AND we don't have any completed progress showing
      setGraders((prev) =>
        prev.map((grader) => {
          // If grader has completed progress, only clear it when isRefining becomes false
          if (grader.refinementProgress?.stage === "complete" && isRefining) {
            return grader; // Keep completed progress during isRefining=true
          }
          return {
            ...grader,
            status: grader.status === "refining" ? "active" : grader.status,
            refinementProgress: undefined,
          };
        })
      );
      return;
    }

    // Update graders with current refinement progress
    setGraders((prev) =>
      prev.map((grader) => {
        const progressItem = refinementProgress.find((p) =>
          p.graderId === grader.id
        );
        if (progressItem) {
          if (progressItem.status === "completed") {
            // Only update if grader isn't already completed
            if (
              grader.refinementProgress?.stage !== "complete" ||
              grader.refinementProgress?.eta !== "Complete"
            ) {
              return {
                ...grader,
                status: "active" as const,
                accuracy: Math.random() * 20 + 80, // Mock improved accuracy
                lastUpdated: new Date().toISOString(),
                refinementProgress: {
                  stage: "complete" as const,
                  progress: 100,
                  eta: "Complete",
                },
              };
            }
            return grader; // No change needed, already completed
          } else if (progressItem.status === "failed") {
            // Only update if grader isn't already failed
            if (
              grader.refinementProgress?.stage !== "complete" ||
              grader.refinementProgress?.eta !== "Failed"
            ) {
              return {
                ...grader,
                status: "active" as const,
                refinementProgress: {
                  stage: "complete" as const,
                  progress: 100,
                  eta: "Failed",
                },
              };
            }
            return grader; // No change needed, already failed
          } else if (progressItem.status === "dismissed") {
            // Grader callout has been dismissed - clear progress
            return {
              ...grader,
              status: "active" as const,
              refinementProgress: undefined,
            };
          } else {
            // Grader is currently refining
            return {
              ...grader,
              status: "refining" as const,
              refinementProgress: {
                stage: progressItem.currentStage,
                progress: progressItem.progress,
                eta: progressItem.currentStage === "complete"
                  ? "Complete"
                  : progressItem.progress < 50
                  ? "2-3 min"
                  : progressItem.progress < 80
                  ? "1-2 min"
                  : "< 1 min",
              },
            };
          }
        }
        return grader;
      })
    );
  }, [isRefining, refinementProgress]);

  const getStatusVariant = (status: Grader["status"]) => {
    switch (status) {
      case "active":
        return "success";
      case "refining":
        return "warning";
      case "inactive":
        return "default";
      default:
        return "default";
    }
  };

  const getStatusLabel = (status: Grader["status"]) => {
    switch (status) {
      case "active":
        return "Active";
      case "refining":
        return "Refining";
      case "inactive":
        return "Inactive";
      default:
        return "Unknown";
    }
  };

  const formatAccuracy = (accuracy: number) => {
    return `${accuracy.toFixed(1)}%`;
  };

  const formatLastUpdated = (date: string) => {
    const now = new Date();
    const updated = new Date(date);
    const diffMs = now.getTime() - updated.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return "Today";
    } else if (diffDays === 1) {
      return "Yesterday";
    } else {
      return `${diffDays} days ago`;
    }
  };

  const getStageLabel = (
    stage: "analyze" | "adjust" | "test" | "complete",
  ): string => {
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
    stage: "analyze" | "adjust" | "test" | "complete",
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

  const renderRefinementProgress = (grader: Grader) => {
    // First check context progress for this grader
    const contextProgress = refinementProgress.find((p) =>
      p.graderId === grader.id
    );

    // If there's context progress, use that; otherwise fall back to grader's local progress
    if (contextProgress) {
      const isComplete = contextProgress.status === "completed";
      const isFailed = contextProgress.status === "failed";

      if (contextProgress.status === "dismissed") {
        return null; // Don't render anything for dismissed items
      }

      const calloutProps: React.ComponentProps<typeof BfDsCallout> = {
        variant: isComplete ? "success" : isFailed ? "error" : "info",
        autoDismiss: isComplete || isFailed ? 5000 : 0,
      };

      if (isComplete || isFailed) {
        calloutProps.onDismiss = () =>
          updateProgressStatus(grader.id, "dismissed");
      }

      return (
        <BfDsCallout {...calloutProps}>
          <BfDsProgressBar
            label={isComplete
              ? "Complete!"
              : isFailed
              ? "Failed"
              : getStageLabel(contextProgress.currentStage)}
            value={contextProgress.progress}
            size="small"
            state={isFailed ? "error" : isComplete ? "success" : "default"}
            showValue
            helpText={isComplete
              ? "Refinement completed successfully"
              : isFailed
              ? "Refinement failed - may need manual review"
              : getStageDescription(contextProgress.currentStage)}
          />
        </BfDsCallout>
      );
    }

    // Fallback to local grader progress if no context progress
    if (!grader.refinementProgress) return null;

    const { stage, progress, eta } = grader.refinementProgress;
    const isComplete = stage === "complete" && eta === "Complete";
    const isFailed = stage === "complete" && eta === "Failed";

    const calloutProps: React.ComponentProps<typeof BfDsCallout> = {
      variant: isComplete ? "success" : isFailed ? "error" : "info",
      autoDismiss: isComplete || isFailed ? 5000 : 0,
    };

    if (isComplete || isFailed) {
      calloutProps.onDismiss = () =>
        updateProgressStatus(grader.id, "dismissed");
    }

    return (
      <BfDsCallout {...calloutProps}>
        <BfDsProgressBar
          label={isComplete
            ? "Complete!"
            : isFailed
            ? "Failed"
            : getStageLabel(stage)}
          value={progress}
          size="small"
          state={isFailed ? "error" : isComplete ? "success" : "default"}
          showValue
          helpText={isComplete
            ? "Refinement completed successfully"
            : isFailed
            ? "Refinement failed - may need manual review"
            : getStageDescription(stage)}
        />
      </BfDsCallout>
    );
  };

  // Show empty state if no graders
  if (graders.length === 0) {
    return (
      <BfDsEmptyState
        title="No graders yet"
        description="Grader management is coming soon. You'll be able to add and manage graders for this deck here."
        icon="cpu"
      />
    );
  }

  return (
    <div className="graders-tab">
      <div className="graders-header">
        <div className="view-header">
          <h2>Graders</h2>
          <p className="view-description">
            Manage the AI graders that automatically evaluate responses for this
            deck.
            {graders.filter((g) => g.status === "refining").length > 0 && (
              <span className="refining-notice">
                {" "}Some graders are currently being refined.
              </span>
            )}
          </p>
        </div>
        <div className="graders-actions">
          <BfDsButton variant="secondary" icon="plus">
            Add Grader
          </BfDsButton>
          <BfDsButton variant="primary" icon="settings">
            Configure
          </BfDsButton>
        </div>
      </div>

      <div className="graders-content">
        <BfDsList header={`${graders.length} graders configured`}>
          {graders.map((grader) => (
            <BfDsListBar
              key={grader.id}
              value={grader.id}
              clickable
              onClick={() => {
                // TODO: Navigate to grader detail view
              }}
              left={
                <div className="grader-item">
                  <div className="grader-info">
                    <h5>{grader.name}</h5>
                    <p>{grader.description}</p>
                  </div>
                </div>
              }
              right={
                <div className="grader-metrics">
                  <div className="metric-group">
                    <div className="metric">
                      <span className="metric-label">Accuracy</span>
                      <span className="metric-value">
                        {formatAccuracy(grader.accuracy)}
                      </span>
                    </div>
                    <div className="metric">
                      <span className="metric-label">Samples</span>
                      <span className="metric-value">
                        {grader.samplesEvaluated.toLocaleString()}
                      </span>
                    </div>
                    <div className="metric">
                      <span className="metric-label">Updated</span>
                      <span className="metric-value">
                        {formatLastUpdated(grader.lastUpdated)}
                      </span>
                    </div>
                  </div>
                  <BfDsBadge variant={getStatusVariant(grader.status)}>
                    {getStatusLabel(grader.status)}
                  </BfDsBadge>
                </div>
              }
              after={grader.status === "refining" ||
                  refinementProgress.some((p) =>
                    p.graderId === grader.id &&
                    (p.status === "completed" || p.status === "failed")
                  )
                ? renderRefinementProgress(grader)
                : undefined}
            />
          ))}
        </BfDsList>
      </div>
    </div>
  );
}
