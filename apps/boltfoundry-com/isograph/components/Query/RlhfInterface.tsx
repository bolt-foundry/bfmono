import { iso } from "@iso-bfc";
import { getLogger } from "@bfmono/packages/logger/logger.ts";

const logger = getLogger(import.meta);

export const RlhfInterface = iso(`
  field Query.RlhfInterface @component {
    __typename
  }
`)(function RlhfInterface({ data }) {
  logger.debug("RLHF Interface data:", data);

  return (
    <div>
      <h1>RLHF Interface</h1>
      <p>Starting clean</p>
    </div>
  );
});
