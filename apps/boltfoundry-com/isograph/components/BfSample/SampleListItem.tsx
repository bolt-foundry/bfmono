import { iso } from "@iso-bfc";
import { BfDsCard } from "@bfmono/apps/bfDs/components/BfDsCard.tsx";
import { BfDsButton } from "@bfmono/apps/bfDs/components/BfDsButton.tsx";
import { useRouter } from "@bfmono/apps/boltfoundry-com/contexts/RouterContext.tsx";

/**
 * BfSample.SampleListItem - Component for displaying individual samples in lists
 *
 * This component extracts the essential fields from BfSample and renders them
 * in a card format suitable for sample lists.
 */
export const SampleListItem = iso(`
  field BfSample.SampleListItem @component {
    id
    name
    completionData
    collectionMethod
  }
`)(function SampleListItem({ data }) {
  const { navigate } = useRouter();

  // Parse completion data to extract useful info
  let parsedData;
  try {
    parsedData = typeof data.completionData === "string"
      ? JSON.parse(data.completionData)
      : data.completionData;
  } catch (e) {
    parsedData = null;
  }

  const handleViewSample = () => {
    navigate(`/pg/grade/samples/${data.id}`);
  };

  return (
    <BfDsCard className="sample-list-item">
      <div className="sample-header">
        <h4 className="sample-name">
          {data.name || `Sample ${data.id.slice(0, 8)}`}
        </h4>
        <div className="sample-metadata">
          <span className="collection-method">
            {data.collectionMethod || "Unknown"}
          </span>
        </div>
      </div>

      {parsedData && (
        <div className="sample-preview">
          {parsedData.choices?.[0]?.message?.content && (
            <div className="completion-preview">
              <strong>Response:</strong>
              <p className="completion-text">
                {parsedData.choices[0].message.content.slice(0, 200)}
                {parsedData.choices[0].message.content.length > 200
                  ? "..."
                  : ""}
              </p>
            </div>
          )}

          {parsedData.usage && (
            <div className="usage-info">
              <small>
                Tokens: {parsedData.usage.prompt_tokens +
                  parsedData.usage.completion_tokens}
                ({parsedData.usage.prompt_tokens} +{" "}
                {parsedData.usage.completion_tokens})
              </small>
            </div>
          )}
        </div>
      )}

      <div className="sample-actions">
        <BfDsButton
          variant="secondary"
          size="small"
          onClick={handleViewSample}
        >
          View Details
        </BfDsButton>
      </div>
    </BfDsCard>
  );
});
