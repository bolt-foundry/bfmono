import { useHud } from "@bfmono/apps/boltfoundry-com/contexts/HudContext.tsx";
import { BfDsButton } from "@bfmono/apps/bfDs/components/BfDsButton.tsx";
import { BfDsIcon } from "@bfmono/apps/bfDs/components/BfDsIcon.tsx";
import { useEffect, useRef } from "react";

export function Hud() {
  const {
    buttons,
    messages,
    currentMessageIndex,
    navigateMessages,
    clearMessages,
    isVisible,
    hideHud,
    input1,
    input2,
    setInput1,
    setInput2,
  } = useHud();

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Get current message
  const currentMessage = messages[currentMessageIndex];
  const hasMessages = messages.length > 0;
  const hasPrevMessage = currentMessageIndex > 0;
  const hasNextMessage = currentMessageIndex < messages.length - 1;

  // Auto-scroll to current message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentMessageIndex]);

  if (!isVisible) {
    return null;
  }

  const getMessageIcon = (type?: string) => {
    switch (type) {
      case "success":
        return "checkCircle";
      case "warning":
        return "alertTriangle";
      case "error":
        return "alertCircle";
      default:
        return "info";
    }
  };

  const getMessageClass = (type?: string) => {
    return `hud-message hud-message--${type || "info"}`;
  };

  return (
    <div className="hud-container">
      <div className="hud-header">
        <h3>HUD Console</h3>
        <BfDsButton
          variant="ghost"
          size="small"
          icon="cross"
          onClick={hideHud}
          aria-label="Close HUD"
        />
      </div>

      <div className="hud-body">
        {/* Buttons Panel */}
        <div className="hud-buttons-panel">
          <h4>Actions</h4>
          <div className="hud-buttons-list">
            {buttons.length === 0
              ? <p className="hud-no-buttons">No actions available</p>
              : (
                buttons.map((button) => (
                  <BfDsButton
                    key={button.id}
                    variant={button.variant || "secondary"}
                    size="small"
                    icon={button.icon}
                    onClick={button.onClick}
                    className="hud-button"
                  >
                    {button.label}
                  </BfDsButton>
                ))
              )}
          </div>
        </div>

        {/* Console Panel */}
        <div className="hud-console-panel">
          <div className="hud-inputs">
            <input
              type="text"
              value={input1}
              onChange={(e) => setInput1(e.target.value)}
              placeholder="Input 1"
              className="hud-input"
            />
            <input
              type="text"
              value={input2}
              onChange={(e) => setInput2(e.target.value)}
              placeholder="Input 2"
              className="hud-input"
            />
          </div>

          <div className="hud-messages">
            <div className="hud-messages-header">
              <h4>Console ({messages.length})</h4>
              <div className="hud-messages-controls">
                <BfDsButton
                  variant="ghost"
                  size="small"
                  icon="chevronLeft"
                  onClick={() => navigateMessages("prev")}
                  disabled={!hasPrevMessage}
                  aria-label="Previous message"
                />
                <span className="hud-message-counter">
                  {hasMessages
                    ? `${currentMessageIndex + 1}/${messages.length}`
                    : "0/0"}
                </span>
                <BfDsButton
                  variant="ghost"
                  size="small"
                  icon="chevronRight"
                  onClick={() => navigateMessages("next")}
                  disabled={!hasNextMessage}
                  aria-label="Next message"
                />
                <BfDsButton
                  variant="ghost"
                  size="small"
                  icon="trash"
                  onClick={clearMessages}
                  disabled={!hasMessages}
                  aria-label="Clear messages"
                />
              </div>
            </div>

            <div className="hud-messages-content">
              {!hasMessages
                ? (
                  <div className="hud-no-messages">
                    <BfDsIcon name="messageSquare" size="large" />
                    <p>No console messages</p>
                  </div>
                )
                : (
                  <div className={getMessageClass(currentMessage.type)}>
                    <BfDsIcon
                      name={getMessageIcon(currentMessage.type)}
                      size="small"
                    />
                    <div className="hud-message-body">
                      <div className="hud-message-content">
                        {currentMessage.content}
                      </div>
                      <div className="hud-message-timestamp">
                        {new Date(currentMessage.timestamp)
                          .toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                )}
              <div ref={messagesEndRef} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Re-export the hook from context for convenience
export { useHudInputs } from "@bfmono/apps/boltfoundry-com/contexts/HudContext.tsx";
