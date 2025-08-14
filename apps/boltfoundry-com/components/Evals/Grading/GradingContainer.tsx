import { useState } from "react";
import { GradingSamplesList } from "./GradingSamplesList.tsx";
import { GradingInbox } from "./GradingInbox.tsx";
import { SampleDisplay } from "./SampleDisplay.tsx";
import { BfDsButton } from "@bfmono/apps/bfDs/components/BfDsButton.tsx";
import { useGradingSamplesWithGraphQL } from "@bfmono/apps/boltfoundry-com/hooks/useGradingSamplesWithGraphQL.ts";
import type { GradingSample } from "@bfmono/apps/boltfoundry-com/types/grading.ts";

interface GradingContainerProps {
  deckId: string;
  deckName: string;
  onClose: () => void;
}

type ViewMode = "list" | "grading" | "viewing";

export function GradingContainer({
  deckId,
  deckName,
  onClose,
}: GradingContainerProps) {
  const { samples, saveGrade, saving, submitSampleResponseElement } =
    useGradingSamplesWithGraphQL(deckId);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [viewingSample, setViewingSample] = useState<GradingSample | null>(
    null,
  );
  const [justCompletedIds, setJustCompletedIds] = useState<Array<string>>([]);
  const [completionSummary, setCompletionSummary] = useState<
    {
      totalGraded: number;
      averageScore: number;
    } | undefined
  >();

  const handleStartGrading = () => {
    setViewMode("grading");
    setCompletionSummary(undefined); // Clear any previous completion summary
  };

  const handleViewSample = (sample: GradingSample) => {
    setViewingSample(sample);
    setViewMode("viewing");
  };

  const handleGradingComplete = (
    gradedSampleIds: Array<string>,
    avgScore: number,
  ) => {
    setJustCompletedIds(gradedSampleIds);
    setCompletionSummary({
      totalGraded: gradedSampleIds.length,
      averageScore: avgScore,
    });
    setViewMode("list");
  };

  const handleBackToList = () => {
    setViewMode("list");
    setViewingSample(null);
  };

  if (viewMode === "grading") {
    return (
      <>
        <GradingInbox
          deckId={deckId}
          deckName={deckName}
          onClose={onClose}
          onComplete={handleGradingComplete}
          samples={samples}
          saveGrade={saveGrade}
          saving={saving}
        />
        {submitSampleResponseElement}
      </>
    );
  }

  if (viewMode === "viewing" && viewingSample) {
    return (
      <>
        <div className="grading-sample-view">
          <div className="grading-header">
            <div className="grading-header-left">
              <BfDsButton
                variant="ghost"
                size="small"
                icon="arrowLeft"
                onClick={handleBackToList}
              >
                Back to List
              </BfDsButton>
              <h2>Sample Details</h2>
            </div>
            <BfDsButton
              variant="ghost"
              size="small"
              icon="cross"
              onClick={onClose}
              aria-label="Close"
            />
          </div>
          <div className="grading-body">
            <SampleDisplay
              sample={viewingSample}
              onHumanRatingChange={() => {}}
              currentRatings={{}}
            />
          </div>
        </div>
        {submitSampleResponseElement}
      </>
    );
  }

  return (
    <>
      <GradingSamplesList
        deckId={deckId}
        deckName={deckName}
        onStartGrading={handleStartGrading}
        onViewSample={handleViewSample}
        justCompletedIds={justCompletedIds}
        completionSummary={completionSummary}
        availableSamples={samples || []}
      />
      {submitSampleResponseElement}
    </>
  );
}
