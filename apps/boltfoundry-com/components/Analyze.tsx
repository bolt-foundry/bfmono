import { iso } from "@iso-bfc";
import { BfDsEmptyState } from "@bfmono/apps/bfDs/components/BfDsEmptyState.tsx";
import { getLogger } from "@bfmono/packages/logger/logger.ts";

const logger = getLogger(import.meta);

export const Analyze = iso(`
  field Query.Analyze @component {
    __typename
  }
`)(function Analyze({ data }) {
  logger.debug("Analyze data:", data);

  return (
    <div className="analyze-page">
      <div className="view-header">
        <h2>Analyze</h2>
        <p className="view-description">
          Analyze patterns and insights from your evaluation data
        </p>
      </div>

      <BfDsEmptyState
        icon="chart"
        title="Analysis coming soon"
        description="This feature is under development"
      />
    </div>
  );
});
