import { BfDsIcon } from "@bfmono/apps/bfDs/components/BfDsIcon.tsx";
import { BfDsBadge } from "@bfmono/apps/bfDs/components/BfDsBadge.tsx";
import { GraderHumanRating } from "./GraderHumanRating.tsx";

interface GraderEvaluationProps {
  evaluation: {
    graderId: string;
    graderName: string;
    score: number;
    reason: string;
    humanGrade?: {
      score: -3 | -2 | -1 | 1 | 2 | 3;
      comment: string;
      gradedBy: string;
      gradedAt: string;
    };
  };
  onHumanRatingChange: (
    graderId: string,
    rating: -3 | -2 | -1 | 1 | 2 | 3 | null,
    comment: string,
  ) => void;
  currentRating?: { rating: -3 | -2 | -1 | 1 | 2 | 3 | null; comment: string };
}

export function GraderEvaluation(
  {
    evaluation,
    onHumanRatingChange,
    currentRating,
  }: GraderEvaluationProps,
) {
  const getScoreColor = (score: number): "success" | "error" | "warning" => {
    if (score >= 2) return "success";
    if (score <= -2) return "error";
    return "warning";
  };

  const getScoreIcon = (score: number): string => {
    if (score >= 2) return "thumbUpSolid";
    if (score <= -2) return "thumbDownSolid";
    return "minus";
  };

  return (
    <div className="grader-evaluation">
      <div className="evaluation-header">
        <div className="grader-info">
          <BfDsIcon name="cpu" size="small" />
          <span className="grader-name">{evaluation.graderName}</span>
        </div>
        <div className="grader-score">
          <BfDsBadge
            variant={getScoreColor(evaluation.score)}
            size="small"
          >
            <BfDsIcon name={getScoreIcon(evaluation.score)} size="small" />
            <span>{evaluation.score > 0 ? "+" : ""}{evaluation.score}</span>
          </BfDsBadge>
        </div>
      </div>
      <div className="evaluation-reason">
        <p>{evaluation.reason}</p>
      </div>
      <div className="evaluation-human-rating">
        <GraderHumanRating
          graderId={evaluation.graderId}
          graderName={evaluation.graderName}
          aiGraderScore={evaluation.score as -3 | -2 | -1 | 1 | 2 | 3}
          initialRating={currentRating?.rating || null}
          initialComment={currentRating?.comment || ""}
          onRatingChange={onHumanRatingChange}
        />
      </div>
    </div>
  );
}
