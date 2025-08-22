import { useState } from "react";
import { GradingSamplesList } from "./GradingSamplesList.tsx";
import { GradingInbox } from "./GradingInbox.tsx";
import { SampleDisplay } from "./SampleDisplay.tsx";
import { BfDsButton } from "@bfmono/apps/bfDs/components/BfDsButton.tsx";
import { useDeckSamples } from "@bfmono/apps/boltfoundry-com/components/mock/hooks/useDeckSamples.ts";
import { useRouter } from "@bfmono/apps/boltfoundry-com/contexts/RouterContext.tsx";
import { useEvalContext } from "@bfmono/apps/boltfoundry-com/components/mock/contexts/EvalContext.tsx";
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
  const { samples, saveGrade, saving } = useDeckSamples(deckId);
  const { navigate } = useRouter();
  const [viewMode, setViewMode] = useState<ViewMode>("grading");
  const [viewingSample, setViewingSample] = useState<GradingSample | null>(
    null,
  );

  const handleStartGrading = () => {
    setViewMode("grading");
  };

  const handleViewSample = (sample: GradingSample) => {
    setViewingSample(sample);
    setViewMode("viewing");
  };

  const handleGradingComplete = (
    gradedSampleIds: Array<string>,
    avgScore: number,
  ) => {
    // Navigate back to deck detail samples tab
    navigate(`/mock/pg/grade/decks/${deckId}/samples`);
  };

  const handleBackToList = () => {
    setViewMode("list");
    setViewingSample(null);
  };

  if (viewMode === "grading") {
    return (
      <GradingInbox
        deckId={deckId}
        deckName={deckName}
        onClose={onClose}
        onComplete={handleGradingComplete}
        samples={samples}
        saveGrade={saveGrade}
        saving={saving}
      />
    );
  }

  if (viewMode === "viewing" && viewingSample) {
    return (
      <div className="grading-sample-view">
        <div className="grading-header">
          <div className="grading-header-left">
            <BfDsButton
              variant="ghost"
              size="small"
              icon="arrowLeft"
              onClick={handleBackToList}
            >
              Back to list
            </BfDsButton>
            <h2>Sample details</h2>
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
    );
  }

  return (
    <GradingSamplesList
      onStartGrading={handleStartGrading}
      onViewSample={handleViewSample}
      availableSamples={samples || []}
    />
  );
}
