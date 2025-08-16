import { useEvalContext } from "@bfmono/apps/boltfoundry-com/contexts/EvalContext.tsx";
import { DecksView } from "../Decks/DecksView.tsx";
import { AnalyzeView } from "../Analyze/AnalyzeView.tsx";
import { ChatView } from "../Chat/ChatView.tsx";

export function MainContent() {
  const { activeMainContent, rightSidebarMode } = useEvalContext();

  const renderMainContent = () => {
    switch (activeMainContent) {
      case "Decks":
        return <DecksView />;
      case "Analyze":
        return <AnalyzeView />;
      case "Chat":
        return <ChatView />;
      default:
        return <DecksView />;
    }
  };

  return (
    <div
      className={`eval-main-area ${
        rightSidebarMode === "grading" ? "eval-main-area--compressed" : ""
      }`}
    >
      <div className="eval-main-content">
        {renderMainContent()}
      </div>
    </div>
  );
}
