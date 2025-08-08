import { useHud } from "@bfmono/apps/bfDs/contexts/BfDsHudContext.tsx";
import { BfDsButton } from "@bfmono/apps/bfDs/components/BfDsButton.tsx";
import { BfDsIcon } from "@bfmono/apps/bfDs/components/BfDsIcon.tsx";
import { useLocalStorage } from "@bfmono/apps/bfDs/hooks/useLocalStorage.ts";
import { useEffect, useRef, useState } from "react";

export function BfDsHud() {
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
  const hudRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useLocalStorage("bfds-hud-position", {
    x: 20,
    y: 20,
  });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Get current message
  const currentMessage = messages[currentMessageIndex];
  const hasMessages = messages.length > 0;
  const hasPrevMessage = currentMessageIndex > 0;
  const hasNextMessage = currentMessageIndex < messages.length - 1;

  // Function to constrain position to screen bounds
  const constrainToScreen = (pos: { x: number; y: number }) => {
    if (!hudRef.current) return pos;

    const hud = hudRef.current;
    const rect = hud.getBoundingClientRect();
    const viewportWidth = globalThis.innerWidth;
    const viewportHeight = globalThis.innerHeight;

    let { x, y } = pos;

    // Constrain to left edge
    if (x < 0) x = 0;
    // Constrain to right edge
    if (x + rect.width > viewportWidth) x = viewportWidth - rect.width;
    // Constrain to top edge
    if (y < 0) y = 0;
    // Constrain to bottom edge
    if (y + rect.height > viewportHeight) y = viewportHeight - rect.height;

    return { x, y };
  };

  // Check position on mount and window resize
  useEffect(() => {
    if (!isVisible || !hudRef.current) return;

    const constrainedPosition = constrainToScreen(position);
    if (
      constrainedPosition.x !== position.x ||
      constrainedPosition.y !== position.y
    ) {
      setPosition(constrainedPosition);
    }
  }, [isVisible, position, setPosition]);

  useEffect(() => {
    const handleResize = () => {
      if (!isVisible) return;
      const constrainedPosition = constrainToScreen(position);
      if (
        constrainedPosition.x !== position.x ||
        constrainedPosition.y !== position.y
      ) {
        setPosition(constrainedPosition);
      }
    };

    globalThis.addEventListener("resize", handleResize);
    return () => globalThis.removeEventListener("resize", handleResize);
  }, [isVisible, position, setPosition]);

  // Auto-scroll to current message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentMessageIndex]);

  // Handle drag start
  const handleDragStart = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  // Handle drag
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const newPosition = constrainToScreen({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
      setPosition(newPosition);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, dragStart]);

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
    <div
      ref={hudRef}
      className="hud-container"
      style={{
        position: "fixed",
        left: `${position.x}px`,
        top: `${position.y}px`,
        cursor: isDragging ? "grabbing" : "auto",
      }}
    >
      <div className="hud-header">
        <div
          className="hud-drag-handle"
          onMouseDown={handleDragStart}
        >
          <BfDsIcon name="drag" size="small" />
        </div>
        <h3 onMouseDown={handleDragStart}>
          HUD Console
        </h3>
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
                buttons.map((button) => {
                  // Handle toggleable buttons
                  if (button.toggleable) {
                    const toggleIcon = button.value
                      ? "toggleRight"
                      : "toggleLeft";
                    return (
                      <BfDsButton
                        key={button.id}
                        variant={button.variant || "secondary"}
                        size="small"
                        icon={toggleIcon}
                        onClick={() => {
                          const newValue = !button.value;
                          button.onToggle?.(newValue);
                          button.onClick();
                        }}
                        className="hud-button hud-button--toggle"
                      >
                        {button.label}
                      </BfDsButton>
                    );
                  }

                  // Regular button
                  return (
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
                  );
                })
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
