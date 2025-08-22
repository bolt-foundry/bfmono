import { BfDsCard } from "@bfmono/apps/bfDs/components/BfDsCard.tsx";
import { BfDsButton } from "@bfmono/apps/bfDs/components/BfDsButton.tsx";
import { BfDsBadge } from "@bfmono/apps/bfDs/components/BfDsBadge.tsx";
import { BfDsIcon } from "@bfmono/apps/bfDs/components/BfDsIcon.tsx";

interface GraderScore {
  grader1: number;
  grader2: number;
  grader3: number;
}

interface Disagreement {
  id: string;
  sampleId: string;
  prompt: string;
  response: string;
  graderScores: Record<string, GraderScore>;
  avgDisagreement: number;
  priority: "high" | "medium" | "low";
  status: "pending" | "resolved" | "dismissed";
  createdAt: string;
}

interface DisagreementCardProps {
  disagreement: Disagreement;
  onResolve: () => void;
  onViewDetails: () => void;
}

export function DisagreementCard(
  { disagreement, onResolve, onViewDetails }: DisagreementCardProps,
) {
  const getPriorityVariant = (priority: string) => {
    switch (priority) {
      case "high":
        return "error";
      case "medium":
        return "warning";
      case "low":
        return "default";
      default:
        return "default";
    }
  };

  const getDisagreementColor = (score: number) => {
    if (score >= 10) return "var(--bfds-error)";
    if (score >= 7) return "var(--bfds-warning)";
    return "var(--bfds-success)";
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor(diffMs / (1000 * 60));

    if (diffHours >= 24) {
      return `${Math.floor(diffHours / 24)}d ago`;
    } else if (diffHours >= 1) {
      return `${diffHours}h ago`;
    } else {
      return `${diffMins}m ago`;
    }
  };

  const renderGraderScores = (scores: GraderScore, category: string) => {
    const values = [scores.grader1, scores.grader2, scores.grader3];
    const max = Math.max(...values);
    const min = Math.min(...values);
    const range = max - min;

    return (
      <div className="grader-scores">
        <span className="category-label">{category}</span>
        <div className="scores-row">
          {values.map((score, index) => (
            <span
              key={index}
              className={`score ${
                score === max ? "score-max" : score === min ? "score-min" : ""
              }`}
            >
              {score}
            </span>
          ))}
          <span
            className="range-indicator"
            style={{ color: getDisagreementColor(range) }}
          >
            (±{range})
          </span>
        </div>
      </div>
    );
  };

  return (
    <BfDsCard className="disagreement-card">
      <div className="disagreement-header">
        <div className="disagreement-meta">
          <div className="sample-info">
            <span className="sample-id">#{disagreement.sampleId}</span>
            <span className="timestamp">
              {formatTime(disagreement.createdAt)}
            </span>
          </div>
          <div className="disagreement-badges">
            <BfDsBadge variant={getPriorityVariant(disagreement.priority)}>
              {disagreement.priority} priority
            </BfDsBadge>
            <div className="disagreement-score">
              <BfDsIcon name="exclamationTriangle" size="small" />
              <span
                style={{
                  color: getDisagreementColor(disagreement.avgDisagreement),
                }}
              >
                {disagreement.avgDisagreement}% disagreement
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="disagreement-content">
        <div className="prompt-response">
          <div className="prompt-section">
            <h4>Prompt</h4>
            <p className="prompt-text">{disagreement.prompt}</p>
          </div>
          <div className="response-section">
            <h4>Response</h4>
            <p className="response-text">{disagreement.response}</p>
          </div>
        </div>

        <div className="scores-section">
          <h4>Grader Scores</h4>
          <div className="scores-grid">
            {Object.entries(disagreement.graderScores).map((
              [category, scores],
            ) => (
              <div key={category} className="score-category">
                {renderGraderScores(scores, category)}
              </div>
            ))}
          </div>
          <div className="scores-legend">
            <span className="legend-item">
              <span className="legend-color score-max"></span>
              Highest score
            </span>
            <span className="legend-item">
              <span className="legend-color score-min"></span>
              Lowest score
            </span>
          </div>
        </div>
      </div>

      <div className="disagreement-actions">
        <BfDsButton
          variant="outline"
          size="small"
          onClick={onViewDetails}
        >
          View Details
        </BfDsButton>
        <BfDsButton
          variant="primary"
          size="small"
          onClick={onResolve}
        >
          Resolve
        </BfDsButton>
      </div>
    </BfDsCard>
  );
}
