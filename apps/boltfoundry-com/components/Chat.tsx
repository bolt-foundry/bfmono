import { iso } from "@iso-bfc";
import { BfDsEmptyState } from "@bfmono/apps/bfDs/components/BfDsEmptyState.tsx";
import { getLogger } from "@bfmono/packages/logger/logger.ts";

const logger = getLogger(import.meta);

export const Chat = iso(`
  field Query.Chat @component {
    __typename
  }
`)(function Chat({ data }) {
  logger.debug("Chat data:", data);

  return (
    <div className="chat-page">
      <div className="view-header">
        <h2>Chat</h2>
        <p className="view-description">
          Interactive chat interface for testing and evaluation
        </p>
      </div>

      <BfDsEmptyState
        icon="chat"
        title="Chat coming soon"
        description="This feature is under development"
      />
    </div>
  );
});
