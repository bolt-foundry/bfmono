import { useEffect, useRef, useState } from "react";
import { BfDsButton } from "@bfmono/apps/bfDs/components/BfDsButton.tsx";
import { BfDsTextArea } from "@bfmono/apps/bfDs/components/BfDsTextArea.tsx";

interface HumanGradingControlsProps {
  sampleId: string;
  onGrade: (score: -3 | 3, reason: string) => void;
  isLastSample: boolean;
}

export function HumanGradingControls({
  sampleId,
  onGrade,
  isLastSample,
}: HumanGradingControlsProps) {
  const [selectedScore, setSelectedScore] = useState<-3 | 3 | null>(null);
  const [reason, setReason] = useState("");
  const reasonInputRef = useRef<HTMLTextAreaElement>(null);

  // Reset state when sample changes
  useEffect(() => {
    setSelectedScore(null);
    setReason("");
  }, [sampleId]);

  // Focus reason input when score is selected
  useEffect(() => {
    if (selectedScore !== null && reasonInputRef.current) {
      reasonInputRef.current.focus();
    }
  }, [selectedScore]);

  const handleScoreSelect = (score: -3 | 3) => {
    setSelectedScore(score);
  };

  const handleSubmit = () => {
    if (selectedScore !== null) {
      onGrade(selectedScore, reason);
      setSelectedScore(null);
      setReason("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="human-grading-controls">
      <div className="grading-buttons">
        <BfDsButton
          variant={selectedScore === -3 ? "secondary" : "outline"}
          size="large"
          icon="thumbDown"
          onClick={() => handleScoreSelect(-3)}
          className="grade-button thumbs-down"
        >
          <span>Incorrect</span>
        </BfDsButton>

        <BfDsButton
          variant={selectedScore === 3 ? "primary" : "outline"}
          size="large"
          icon="thumbUp"
          onClick={() => handleScoreSelect(3)}
          className="grade-button thumbs-up"
        >
          <span>Correct</span>
        </BfDsButton>
      </div>

      {selectedScore !== null && (
        <div className="reason-section">
          <label htmlFor="reason-input">
            Reason (optional) - Press Enter to submit
          </label>
          <BfDsTextArea
            id="reason-input"
            ref={reasonInputRef}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Add a reason for your rating..."
            rows={3}
          />

          <div className="grading-actions">
            <BfDsButton
              variant="primary"
              icon="arrowRight"
              iconPosition="right"
              onClick={handleSubmit}
              disabled={selectedScore === null}
            >
              {isLastSample ? "Complete grading" : "Save & next"}
            </BfDsButton>
          </div>
        </div>
      )}

      <div className="grading-help">
        <p className="help-text">
          Select a rating to evaluate this response. You can add an optional
          reason before moving to the next sample.
        </p>
      </div>
    </div>
  );
}
