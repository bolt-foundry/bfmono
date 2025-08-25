import { useState } from "react";
import { BfDsIcon } from "@bfmono/apps/bfDs/components/BfDsIcon.tsx";
import { BfDsButton } from "@bfmono/apps/bfDs/components/BfDsButton.tsx";

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

interface ConversationHistoryProps {
  messages: Array<Message>;
}

export function ConversationHistory({ messages }: ConversationHistoryProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (messages.length === 0) {
    return null;
  }

  return (
    <div className="conversation-history">
      <BfDsButton
        variant="ghost"
        size="small"
        onClick={() => setIsExpanded(!isExpanded)}
        className="conversation-toggle"
      >
        <BfDsIcon
          name={isExpanded ? "chevronDown" : "chevronRight"}
          size="small"
        />
        <span>
          Conversation History ({messages.length} messages)
        </span>
      </BfDsButton>

      {isExpanded && (
        <div className="conversation-messages">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`conversation-message message-${message.role}`}
            >
              <div className="message-role">
                <BfDsIcon
                  name={message.role === "user" ? "user" : "cpu"}
                  size="small"
                />
                <span>{message.role}</span>
              </div>
              <div className="message-content">
                {message.content}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
