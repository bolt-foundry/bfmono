interface ChoiceOption {
  id: string;
  label: string;
  icon?: string;
  onClick: (id: string) => void;
}

interface MessageContentBlock {
  type: "text" | "choices" | "code" | "status";
  content: string;
  choices?: Array<ChoiceOption>;
  language?: string;
  status?: {
    type: "building" | "success" | "error";
    message: string;
  };
}

interface MessageContentProps {
  blocks: Array<MessageContentBlock>;
}

export function MessageContent({ blocks }: MessageContentProps) {
  return (
    <div className="message-content-blocks">
      {blocks.map((block, index) => (
        <div key={index} className="content-block">
          {block.type === "text" && (
            <div
              className="text-block"
              dangerouslySetInnerHTML={{ __html: block.content }}
            />
          )}

          {block.type === "choices" && (
            <div className="choices-block">
              {block.content && (
                <p className="choices-prompt">{block.content}</p>
              )}
              <div className="choice-options">
                {block.choices?.map((choice) => (
                  <ChoiceCard
                    key={choice.id}
                    label={choice.label}
                    icon={choice.icon}
                    onClick={() => choice.onClick(choice.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {block.type === "code" && (
            <div className="code-block">
              <pre>
                <code className={`language-${block.language || 'text'}`}>
                  {block.content}
                </code>
              </pre>
            </div>
          )}

          {block.type === "status" && (
            <div className={`status-block status-${block.status?.type}`}>
              <div className="status-content">
                <span className="status-message">{block.status?.message}</span>
                {block.status?.type === "building" && (
                  <div className="loading-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

interface ChoiceCardProps {
  label: string;
  icon?: string;
  onClick: () => void;
}

export function ChoiceCard({ label, icon, onClick }: ChoiceCardProps) {
  return (
    <button
      className="choice-card"
      onClick={onClick}
      type="button"
    >
      {icon && <span className="choice-icon">{icon}</span>}
      <span className="choice-label">{label}</span>
    </button>
  );
}
