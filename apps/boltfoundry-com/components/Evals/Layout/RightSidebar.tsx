import { BfDsButton } from "@bfmono/apps/bfDs/components/BfDsButton.tsx";
import { useEffect, useRef } from "react";
import { useEvalContext } from "@bfmono/apps/boltfoundry-com/contexts/EvalContext.tsx";
import { GradingContainer } from "../Grading/GradingContainer.tsx";

export function RightSidebar() {
  const {
    rightSidebarOpen,
    rightSidebarContent,
    rightSidebarMode,
    closeRightSidebar,
    chatMode,
    gradingDeckId,
    gradingDeckName,
    exitGrading,
  } = useEvalContext();
  const hasAnimated = useRef(false);

  useEffect(() => {
    // Mark that we've had at least one state change after initial render
    hasAnimated.current = true;
  }, [rightSidebarOpen]);

  const renderDeckCreationContent = () => {
    return (
      <>
        <h3 style={{ marginBottom: "1rem", color: "#ccc" }}>
          Your Grader System
        </h3>
        <div
          style={{
            color: "#999",
            fontSize: "0.875rem",
            marginBottom: "1.5rem",
          }}
        >
          Graders appear here as we build them
        </div>

        <div className="deck-creation-progress">
          <div className="generated-card">
            <div className="card-header">
              <span className="card-title">Code Accuracy</span>
              <span className="grader-badge building">Building</span>
            </div>
            <p style={{ fontSize: "0.875rem", color: "#999" }}>
              Validates syntax and logic
            </p>
          </div>

          <div className="generated-card">
            <div className="card-header">
              <span className="card-title">Language Simplicity</span>
              <span className="grader-badge building">Building</span>
            </div>
            <p style={{ fontSize: "0.875rem", color: "#999" }}>
              Checks for clear, simple explanations
            </p>
          </div>

          <div className="generated-card">
            <div className="card-header">
              <span className="card-title">Helpfulness</span>
              <span className="grader-badge building">Building</span>
            </div>
            <p style={{ fontSize: "0.875rem", color: "#999" }}>
              Ensures responses solve the problem
            </p>
          </div>

          <div className="generated-card">
            <div className="card-header">
              <span className="card-title">Explanation Quality</span>
              <span className="grader-badge building">Building</span>
            </div>
            <p style={{ fontSize: "0.875rem", color: "#999" }}>
              Evaluates clarity and completeness
            </p>
          </div>
        </div>
      </>
    );
  };

  // Always render placeholder, animate based on right sidebar state
  const placeholderClass = rightSidebarOpen
    ? `eval-right-sidebar-placeholder eval-right-sidebar-placeholder--open ${
      hasAnimated.current ? "eval-right-sidebar-placeholder--animate" : ""
    } ${
      rightSidebarMode === "grading"
        ? "eval-right-sidebar-placeholder--grading"
        : ""
    }`
    : `eval-right-sidebar-placeholder ${
      hasAnimated.current ? "eval-right-sidebar-placeholder--animate" : ""
    }`;

  // Sidebar always uses transform animation
  const sidebarClass = `eval-right-sidebar ${
    !rightSidebarOpen ? "eval-right-sidebar--hidden" : ""
  } ${rightSidebarMode === "grading" ? "eval-right-sidebar--grading" : ""}`;

  return (
    <>
      <div className={placeholderClass}></div>
      <div className={sidebarClass}>
        {rightSidebarMode === "grading" && gradingDeckId && gradingDeckName
          ? (
            <GradingContainer
              deckId={gradingDeckId}
              deckName={gradingDeckName}
              onClose={exitGrading}
            />
          )
          : (
            <div className="eval-sidebar-content">
              <div className="eval-sidebar-header">
                <h3>{rightSidebarContent}</h3>
                <BfDsButton
                  variant="ghost"
                  icon="cross"
                  iconOnly
                  onClick={closeRightSidebar}
                />
              </div>
              <div className="eval-sidebar-body">
                {chatMode === "createDeck" &&
                    rightSidebarContent === "Deck Creation"
                  ? renderDeckCreationContent()
                  : <p>Content for: {rightSidebarContent}</p>}
              </div>
            </div>
          )}
      </div>
    </>
  );
}
