import { iso } from "@iso-bfc";
import { PromptGradeProvider } from "@bfmono/apps/boltfoundry-com/components/PromptGrade/PromptGradeContext.tsx";
import { Header } from "@bfmono/apps/boltfoundry-com/components/PromptGrade/Header.tsx";
import { LeftSidebar } from "@bfmono/apps/boltfoundry-com/components/PromptGrade/LeftSidebar.tsx";
import { MainContent } from "@bfmono/apps/boltfoundry-com/components/PromptGrade/MainContent.tsx";
import { RightSidebar } from "@bfmono/apps/boltfoundry-com/components/PromptGrade/RightSidebar.tsx";
import { useRouter } from "@bfmono/apps/boltfoundry-com/contexts/RouterContext.tsx";
import { DecksView } from "@bfmono/apps/boltfoundry-com/components/Evals/Decks/DecksView.tsx";
import { BfDsEmptyState } from "@bfmono/apps/bfDs/components/BfDsEmptyState.tsx";

function PromptGradeContent() {
  const { currentPath, routeParams, navigate } = useRouter();
  const deckId = routeParams.deckId;

  // Determine what to show in main content based on route
  const renderMainContent = () => {
    // Deck detail view: /pg/grade/decks/:deckId/samples (or other tabs)
    if (currentPath.match(/^\/pg\/grade\/decks\/[^/]+\/[^/]+$/) && deckId) {
      return (
        <BfDsEmptyState
          title="Deck Detail View"
          description={`This will show details for deck ${deckId}. Backend integration needed.`}
          icon="deck"
        />
      );
    }

    // Decks list: /pg/grade/decks
    if (currentPath === "/pg/grade/decks") {
      return <DecksView />;
    }

    // Default/fallback
    return (
      <BfDsEmptyState
        title="Welcome to PromptGrade"
        description="Select a deck from the navigation to get started."
        icon="deck"
      />
    );
  };

  const renderLeftSidebar = () => {
    return (
      <div className="prompt-grade-nav">
        <h3>Navigation</h3>
        <div className="nav-item" onClick={() => navigate("/pg/grade/decks")}>
          📚 Decks
        </div>
        <div className="nav-item" onClick={() => navigate("/pg/analyze")}>
          📊 Analyze (Coming Soon)
        </div>
        <div className="nav-item" onClick={() => navigate("/pg/chat")}>
          💬 Chat (Coming Soon)
        </div>
      </div>
    );
  };

  const renderRightSidebar = () => {
    // Show contextual sidebar content based on current view
    if (deckId) {
      return (
        <div>
          <h4>Deck Actions</h4>
          <p>Contextual actions for the current deck will appear here.</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="eval-page">
      <Header />
      <div className="eval-layout">
        <div className="eval-content">
          <LeftSidebar>
            {renderLeftSidebar()}
          </LeftSidebar>
          <MainContent>
            {renderMainContent()}
          </MainContent>
          <RightSidebar title={deckId ? "Deck Tools" : "Tools"}>
            {renderRightSidebar()}
          </RightSidebar>
        </div>
      </div>
    </div>
  );
}

/**
 * PromptGrade component - Main layout orchestrator for the grading interface
 * Replaces the old Eval.tsx component with proper Isograph patterns
 *
 * This component:
 * - Is exposed as a field on Query type
 * - Provides the PromptGradeContext for state management
 * - Orchestrates the layout with Header, Sidebars, and MainContent
 */
export const PromptGrade = iso(`
  field Query.PromptGrade @component {
    __typename
  }
`)(function PromptGrade(_props) {
  return (
    <PromptGradeProvider>
      <PromptGradeContent />
    </PromptGradeProvider>
  );
});
