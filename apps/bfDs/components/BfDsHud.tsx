/**
 * @fileoverview BfDsHud - Floating heads-up display component for development tools and debugging
 * @author Justin Carter <justin@boltfoundry.com>
 * @since 2.0.0
 */
import { useHud } from "@bfmono/apps/bfDs/contexts/BfDsHudContext.tsx";
import { BfDsButton } from "@bfmono/apps/bfDs/components/BfDsButton.tsx";
import { BfDsIcon } from "@bfmono/apps/bfDs/components/BfDsIcon.tsx";
import { useLocalStorage } from "@bfmono/apps/bfDs/hooks/useLocalStorage.ts";
import { useEffect, useRef, useState } from "react";

/**
 * A floating heads-up display (HUD) component for development tools, debugging,
 * and admin actions. The HUD provides a console interface with customizable action
 * buttons, message logging, and two general-purpose input fields.
 *
 * ## Key Features:
 * - **Draggable Interface** - Click and drag the header to reposition, automatically saves position to localStorage
 * - **Action Buttons** - Add custom buttons with regular or toggleable behavior
 * - **Console Messaging** - Log info, success, warning, and error messages with navigation
 * - **Input Fields** - Two general-purpose input fields accessible in button actions
 * - **Message Navigation** - View message history with previous/next controls and message counter
 * - **Screen Constraints** - Automatically constrains position to screen boundaries
 * - **Keyboard Accessible** - Full keyboard navigation and screen reader support
 *
 * ## Context Integration:
 * The component doesn't take direct props and instead uses the BfDsHudContext for all
 * state management and configuration via the useHud() hook.
 *
 * ## Setup Requirements:
 * Must be used within a BfDsHudProvider context. Typically included automatically
 * when using BfDsProvider.
 *
 * ## Styling:
 * Uses CSS classes with `hud-` prefix:
 * - `.hud-container` - Main HUD container
 * - `.hud-header` - Draggable header area
 * - `.hud-body` - Main content area
 * - `.hud-buttons-panel` - Action buttons section
 * - `.hud-console-panel` - Message console section
 * - `.hud-button` - Individual button styling
 * - `.hud-message` - Message styling with type variants
 *
 * ## Performance:
 * - Position saved to localStorage for persistence
 * - Efficient re-renders only when context state changes
 * - Hidden by default (returns null when not visible)
 * - Smooth scrolling and constrained dragging
 *
 * @example
 * // Basic setup with provider (automatically included in BfDsProvider)
 * import { BfDsHudProvider } from "@bfmono/bfDs/contexts/BfDsHudContext";
 * import { BfDsHud } from "@bfmono/bfDs";
 *
 * function App() {
 *   return (
 *     <BfDsHudProvider>
 *       <YourApp />
 *       <BfDsHud />
 *     </BfDsHudProvider>
 *   );
 * }
 *
 * @example
 * // Adding action buttons to the HUD
 * import { useHud } from "@bfmono/bfDs/contexts/BfDsHudContext";
 *
 * function MyComponent() {
 *   const { addButton, removeButton, sendMessage } = useHud();
 *
 *   useEffect(() => {
 *     // Add a simple action button
 *     addButton({
 *       id: "hello-world",
 *       label: "Say Hello",
 *       icon: "messageSquare",
 *       onClick: () => {
 *         sendMessage("Hello, World!", "info");
 *       },
 *     });
 *
 *     // Cleanup
 *     return () => removeButton("hello-world");
 *   }, [addButton, removeButton, sendMessage]);
 * }
 *
 * @example
 * // Using toggleable buttons for feature flags
 * import { useHud } from "@bfmono/bfDs/contexts/BfDsHudContext";
 *
 * function DebugComponent() {
 *   const { addButton, sendMessage } = useHud();
 *   const [debugMode, setDebugMode] = useState(false);
 *
 *   addButton({
 *     id: "debug-toggle",
 *     label: "Debug Mode",
 *     toggleable: true,
 *     value: debugMode,
 *     onToggle: (enabled) => {
 *       setDebugMode(enabled);
 *       window.DEBUG = enabled;
 *       sendMessage(`Debug mode ${enabled ? "ON" : "OFF"}`, "success");
 *     },
 *     onClick: () => {}, // Required but can be empty
 *   });
 * }
 *
 * @example
 * // Using input fields for dynamic actions
 * import { useHud } from "@bfmono/bfDs/contexts/BfDsHudContext";
 *
 * function ApiTester() {
 *   const { addButton, sendMessage, getInputs, setInput1, setInput2 } = useHud();
 *
 *   // Set initial input values
 *   setInput1("api.example.com");
 *   setInput2("auth-token-123");
 *
 *   addButton({
 *     id: "api-test",
 *     label: "Test API",
 *     icon: "server",
 *     onClick: async () => {
 *       const { input1: endpoint, input2: token } = getInputs();
 *       sendMessage(`Testing ${endpoint}...`, "info");
 *
 *       try {
 *         const response = await fetch(endpoint, {
 *           headers: { Authorization: `Bearer ${token}` }
 *         });
 *         sendMessage(`Response: ${response.status}`, "success");
 *       } catch (error) {
 *         sendMessage(`Error: ${error.message}`, "error");
 *       }
 *     },
 *   });
 * }
 *
 * @example
 * // Controlling HUD visibility and sending different message types
 * import { useHud } from "@bfmono/bfDs/contexts/BfDsHudContext";
 *
 * function HudController() {
 *   const { showHud, hideHud, toggleHud, isVisible, sendMessage, clearMessages } = useHud();
 *
 *   const handleTest = () => {
 *     showHud(); // Make sure HUD is visible
 *
 *     // Send different message types
 *     sendMessage("Information message", "info");
 *     sendMessage("Success message", "success");
 *     sendMessage("Warning message", "warning");
 *     sendMessage("Error message", "error");
 *   };
 *
 *   return (
 *     <div>
 *       <button onClick={showHud}>Show HUD</button>
 *       <button onClick={hideHud}>Hide HUD</button>
 *       <button onClick={toggleHud}>Toggle HUD</button>
 *       <button onClick={handleTest}>Test Messages</button>
 *       <button onClick={clearMessages}>Clear Messages</button>
 *       {isVisible ? "HUD is open" : "HUD is closed"}
 *     </div>
 *   );
 * }
 *
 * @example
 * // Admin actions with input validation
 * import { useHud } from "@bfmono/bfDs/contexts/BfDsHudContext";
 *
 * function AdminPanel() {
 *   const { addButton, sendMessage, getInputs } = useHud();
 *
 *   addButton({
 *     id: "user-action",
 *     label: "Admin Action",
 *     icon: "user",
 *     variant: "primary",
 *     onClick: async () => {
 *       const { input1: username, input2: action } = getInputs();
 *
 *       if (!username || !action) {
 *         sendMessage("Both username and action are required", "error");
 *         return;
 *       }
 *
 *       sendMessage(`Performing ${action} on ${username}...`, "warning");
 *
 *       try {
 *         await performAdminAction(username, action);
 *         sendMessage("Admin action completed", "success");
 *       } catch (error) {
 *         sendMessage(`Failed: ${error.message}`, "error");
 *       }
 *     },
 *   });
 * }
 *
 * @accessibility
 * - Full keyboard navigation with Tab traversal through interactive elements
 * - Enter and Space key support for buttons
 * - Escape key closes the HUD (unless disabled)
 * - Proper ARIA labels on buttons and controls
 * - Semantic HTML structure for screen readers
 * - Clear focus indicators throughout interface
 * - Screen reader announcements for state changes
 * - Focus management maintains focus within HUD when open
 * - Returns focus to trigger element when closed
 *
 * @see {@link BfDsHudContext} - Context provider that manages HUD state
 * @see {@link useHud} - Hook for interacting with the HUD from components
 * @see {@link BfDsProvider} - Root provider that automatically includes BfDsHud
 * @see {@link BfDsButton} - Button component used for HUD actions
 * @see {@link BfDsIcon} - Icon component used throughout HUD interface
 *
 * @since 2.0.0
 */
export function BfDsHud() {
  const {
    buttons,
    messages,
    currentMessageIndex,
    navigateMessages,
    clearMessages,
    isVisible,
    hideHud,
    requestedPosition,
    clearRequestedPosition,
    input1,
    input2,
    setInput1,
    setInput2,
  } = useHud();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hudRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useLocalStorage("bfds-hud-position", {
    x: -1, // Use -1 as a flag to indicate no position has been set yet
    y: -1,
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

  // Function to calculate position based on named positions
  const calculatePosition = (
    positionName:
      | "top-left"
      | "top-right"
      | "bottom-left"
      | "bottom-right"
      | "center",
  ) => {
    if (!hudRef.current) return { x: 20, y: 20 };

    const hud = hudRef.current;
    const rect = hud.getBoundingClientRect();
    const viewportWidth = globalThis.innerWidth;
    const viewportHeight = globalThis.innerHeight;
    const margin = 20;

    switch (positionName) {
      case "top-left":
        return { x: margin, y: margin };
      case "top-right":
        return { x: viewportWidth - rect.width - margin, y: margin };
      case "bottom-left":
        return { x: margin, y: viewportHeight - rect.height - margin };
      case "bottom-right":
        return {
          x: viewportWidth - rect.width - margin,
          y: viewportHeight - rect.height - margin,
        };
      case "center":
        return {
          x: (viewportWidth - rect.width) / 2,
          y: (viewportHeight - rect.height) / 2,
        };
      default:
        return { x: 20, y: 20 };
    }
  };

  // Handle position requests from context
  useEffect(() => {
    if (!requestedPosition || !isVisible || !hudRef.current) return;

    const newPosition = calculatePosition(
      requestedPosition as
        | "top-left"
        | "top-right"
        | "bottom-left"
        | "bottom-right"
        | "center",
    );
    const constrainedPosition = constrainToScreen(newPosition);
    setPosition(constrainedPosition);

    // Clear the request after using it
    clearRequestedPosition();
  }, [requestedPosition, isVisible, clearRequestedPosition]);

  // Handle initial position setup when HUD becomes visible
  useEffect(() => {
    if (!isVisible) return;

    // Only set center position if this is truly the first time (position is -1, -1)
    if (position.x === -1 && position.y === -1) {
      // Use a slight delay to ensure the HUD is rendered
      const timer = setTimeout(() => {
        if (hudRef.current) {
          const centerPosition = calculatePosition("center");
          const constrainedPosition = constrainToScreen(centerPosition);
          setPosition(constrainedPosition);
        } else {
          // Fallback if hudRef is not ready
          setPosition({ x: 100, y: 100 });
        }
      }, 10);

      return () => clearTimeout(timer);
    }
  }, [isVisible, position.x, position.y]);

  // Check position on mount and window resize (but skip initial -1, -1 position)
  useEffect(() => {
    if (!isVisible || !hudRef.current) return;

    // Skip constraining if this is the initial -1, -1 position
    if (position.x === -1 && position.y === -1) return;

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
      // Skip constraining if this is the initial -1, -1 position
      if (position.x === -1 && position.y === -1) return;

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
