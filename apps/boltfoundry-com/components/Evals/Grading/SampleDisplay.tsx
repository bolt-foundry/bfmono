import { useState } from "react";
import { BfDsIcon } from "@bfmono/apps/bfDs/components/BfDsIcon.tsx";
import { BfDsButton } from "@bfmono/apps/bfDs/components/BfDsButton.tsx";
import { ConversationHistory } from "./ConversationHistory.tsx";
import { GraderEvaluation } from "./GraderEvaluation.tsx";
import { JsonDisplay } from "./JsonDisplay.tsx";
import type { GradingSample } from "@bfmono/apps/boltfoundry-com/types/grading.ts";

interface SampleDisplayProps {
  sample: GradingSample;
  displaySchema?: unknown; // TODO: Use DeckDisplaySchema when available
  onHumanRatingChange: (
    graderId: string,
    rating: -3 | -2 | -1 | 1 | 2 | 3 | null,
    comment: string,
  ) => void;
  currentRatings?: Record<
    string,
    { rating: -3 | -2 | -1 | 1 | 2 | 3 | null; comment: string }
  >;
}

export function SampleDisplay(
  { sample, displaySchema, onHumanRatingChange, currentRatings = {} }:
    SampleDisplayProps,
) {
  const [showRawJson, setShowRawJson] = useState(true);

  // Extract the final assistant response
  const finalResponse = sample.response.body?.choices?.[0]?.message?.content;
  const isJsonResponse = typeof finalResponse === "object" &&
    finalResponse !== null;

  // Get conversation messages excluding the final response
  const conversationMessages = sample.request.body?.messages || [];
  const previousMessages = conversationMessages.slice(0, -1);

  return (
    <div className="sample-display">
      <div className="sample-metadata">
        <div className="metadata-item">
          <BfDsIcon name="clock" size="small" />
          <span>{new Date(sample.timestamp).toLocaleString()}</span>
        </div>
        <div className="metadata-item">
          <BfDsIcon name="zap" size="small" />
          <span>{sample.duration}ms</span>
        </div>
        <div className="metadata-item">
          <BfDsIcon name="server" size="small" />
          <span>{sample.provider}</span>
        </div>
      </div>

      {previousMessages.length > 0 && (
        <ConversationHistory messages={previousMessages} />
      )}

      <div className="sample-response-section">
        <div className="response-header">
          <h3>Assistant Response</h3>
          {isJsonResponse && (
            <BfDsButton
              variant="outline"
              size="small"
              icon={showRawJson ? "table" : "code2"}
              onClick={() => setShowRawJson(!showRawJson)}
            >
              {showRawJson ? "Table View" : "JSON View"}
            </BfDsButton>
          )}
        </div>

        <div className="response-content">
          {isJsonResponse
            ? (
              showRawJson
                ? (
                  <pre className="json-raw">
                {JSON.stringify(finalResponse, null, 2)}
                  </pre>
                )
                : (
                  <JsonDisplay
                    data={finalResponse}
                    schema={displaySchema}
                  />
                )
            )
            : (
              <div className="response-text">
                {finalResponse || "No response content"}
              </div>
            )}
        </div>
      </div>

      {sample.graderEvaluations && sample.graderEvaluations.length > 0 && (
        <div className="grader-evaluations-section">
          <h3>AI Grader Evaluations</h3>
          <div className="grader-evaluations">
            {sample.graderEvaluations.map((evaluation, index) => (
              <GraderEvaluation
                key={index}
                evaluation={evaluation}
                onHumanRatingChange={onHumanRatingChange}
                currentRating={currentRatings[evaluation.graderId]}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
