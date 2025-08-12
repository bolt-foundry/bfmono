import { useEffect, useState } from "react";
import { BfDsButton } from "@bfmono/apps/bfDs/components/BfDsButton.tsx";
import { BfDsTextArea } from "@bfmono/apps/bfDs/components/BfDsTextArea.tsx";

interface GraderHumanRatingProps {
  graderId: string;
  graderName: string;
  aiGraderScore: -3 | -2 | -1 | 1 | 2 | 3;
  initialRating?: -3 | -2 | -1 | 1 | 2 | 3 | null;
  initialComment?: string;
  onRatingChange: (
    graderId: string,
    rating: -3 | -2 | -1 | 1 | 2 | 3 | null,
    comment: string,
    shouldProceedNext?: boolean,
  ) => void;
  onAgreeAndNext?: () => void;
  canProceed?: boolean;
}

export function GraderHumanRating({
  graderId,
  graderName,
  aiGraderScore,
  initialRating = null,
  initialComment = "",
  onRatingChange,
  onAgreeAndNext,
  canProceed,
}: GraderHumanRatingProps) {
  const [selectedScore, setSelectedScore] = useState<
    -3 | -2 | -1 | 1 | 2 | 3 | null
  >(
    initialRating,
  );
  const [comment, setComment] = useState(initialComment);

  // Reset state when initial values change (i.e., when moving to a new sample)
  useEffect(() => {
    setSelectedScore(initialRating);
    setComment(initialComment);
  }, [initialRating, initialComment, graderId]);

  const handleScoreSelect = (score: -3 | -2 | -1 | 1 | 2 | 3) => {
    const newScore = selectedScore === score ? null : score;
    setSelectedScore(newScore);
    onRatingChange(graderId, newScore, comment, false);
  };

  const handleCommentChange = (newComment: string) => {
    setComment(newComment);
    onRatingChange(graderId, selectedScore, newComment, false);
  };

  const handleAgreeClick = async () => {
    setSelectedScore(aiGraderScore);
    setComment("Agree with AI grader assessment");
    // Signal that we want to proceed to next after this rating change
    onRatingChange(
      graderId,
      aiGraderScore,
      "Agree with AI grader assessment",
      true,
    );
  };

  return (
    <div className="grader-human-rating">
      <div className="human-rating-header">
        <h4>Your rating of {graderName}:</h4>
      </div>

      <div className="human-rating-buttons">
        <BfDsButton
          variant={selectedScore === -3 ? "primary" : "outline"}
          size="small"
          onClick={() => handleScoreSelect(-3)}
          className="human-rating-button negative"
        >
          <span>-3</span>
        </BfDsButton>

        <BfDsButton
          variant={selectedScore === -2 ? "primary" : "outline"}
          size="small"
          onClick={() => handleScoreSelect(-2)}
          className="human-rating-button negative"
        >
          <span>-2</span>
        </BfDsButton>

        <BfDsButton
          variant={selectedScore === -1 ? "primary" : "outline"}
          size="small"
          onClick={() => handleScoreSelect(-1)}
          className="human-rating-button negative"
        >
          <span>-1</span>
        </BfDsButton>

        <BfDsButton
          variant={selectedScore === 1 ? "primary" : "outline"}
          size="small"
          onClick={() => handleScoreSelect(1)}
          className="human-rating-button positive"
        >
          <span>+1</span>
        </BfDsButton>

        <BfDsButton
          variant={selectedScore === 2 ? "primary" : "outline"}
          size="small"
          onClick={() => handleScoreSelect(2)}
          className="human-rating-button positive"
        >
          <span>+2</span>
        </BfDsButton>

        <BfDsButton
          variant={selectedScore === 3 ? "primary" : "outline"}
          size="small"
          onClick={() => handleScoreSelect(3)}
          className="human-rating-button positive"
        >
          <span>+3</span>
        </BfDsButton>

        <div
          className="rating-divider"
          style={{ margin: "0 8px", color: "#ccc", alignSelf: "center" }}
        >
          |
        </div>

        <BfDsButton
          variant={selectedScore === aiGraderScore
            ? "secondary"
            : "outline-secondary"}
          size="small"
          onClick={handleAgreeClick}
          className="human-rating-button agree"
        >
          <span>Agree ({aiGraderScore > 0 ? "+" : ""}{aiGraderScore})</span>
        </BfDsButton>
      </div>

      <div className="human-rating-comment">
        <label htmlFor={`comment-${graderId}`}>
          Reason (optional)
        </label>
        <BfDsTextArea
          id={`comment-${graderId}`}
          value={comment}
          onChange={(e) => handleCommentChange(e.target.value)}
          placeholder={`Why do you rate ${graderName} this way?`}
          rows={2}
        />
      </div>
    </div>
  );
}
