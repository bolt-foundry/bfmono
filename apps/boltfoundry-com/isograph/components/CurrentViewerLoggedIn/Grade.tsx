import { iso } from "@iso-bfc";
import { PromptGradeProvider } from "@bfmono/apps/boltfoundry-com/components/PromptGrade/PromptGradeContext.tsx";
import { Header } from "@bfmono/apps/boltfoundry-com/components/PromptGrade/Header.tsx";
import { LeftSidebar } from "@bfmono/apps/boltfoundry-com/components/PromptGrade/LeftSidebar.tsx";
import { MainContent } from "@bfmono/apps/boltfoundry-com/components/PromptGrade/MainContent.tsx";
import { RightSidebar } from "@bfmono/apps/boltfoundry-com/components/PromptGrade/RightSidebar.tsx";
import { SidebarNav } from "@bfmono/apps/boltfoundry-com/components/PromptGrade/SidebarNav.tsx";
import { BfDsEmptyState } from "@bfmono/apps/bfDs/components/BfDsEmptyState.tsx";
import { useRouter } from "@bfmono/apps/boltfoundry-com/contexts/RouterContext.tsx";

/**
 * Grade component - Main component for the evaluation/grading system
 * This is a field on CurrentViewerLoggedIn that renders the full eval interface
 * Provides the full layout with navigation, sidebars, and main content
 */
export const Grade = iso(`
  field CurrentViewerLoggedIn.Grade @component {
    organization {
      id
      name
      DecksList
      decks(first: 100) {
        edges {
          node {
            id
            DeckDetailView
          }
        }
      }
    }
  }
`)(function Grade({ data }) {
  const { currentPath, routeParams } = useRouter();
  const deckId = routeParams.deckId;

  // Determine what to show based on route
  const isDecksListPage = currentPath === "/pg/grade/decks" ||
    currentPath === "/pg/grade" ||
    currentPath === "/pg";
  const isDeckDetailPage =
    currentPath.match(/^\/pg\/grade\/decks\/[^/]+\/[^/]+$/) && deckId;

  // Render content based on route
  const renderMainContent = () => {
    if (isDecksListPage && data.organization) {
      return (
        <div className="decks-view">
          <div className="view-header">
            <h2>Decks</h2>
            <p className="view-description">
              Create and manage evaluation frameworks for grading AI responses
            </p>
          </div>
          <data.organization.DecksList />
        </div>
      );
    }

    if (isDeckDetailPage && deckId && data.organization) {
      // Find the specific deck by ID
      const deck = data.organization.decks?.edges?.find(
        (edge) => edge?.node?.id === deckId,
      )?.node;

      if (deck) {
        const DeckDetailView = deck.DeckDetailView;
        return <DeckDetailView />;
      }

      // Deck not found
      return (
        <BfDsEmptyState
          title="Deck Not Found"
          description={`Deck with ID ${deckId} was not found.`}
          icon="exclamationDeck"
        />
      );
    }

    // Default content for other routes
    return (
      <BfDsEmptyState
        title="Welcome to PromptGrade"
        description="Select a deck from the navigation to get started."
        icon="home"
      />
    );
  };

  return (
    <PromptGradeProvider>
      <div className="eval-page">
        <Header />
        <div className="eval-layout">
          <div className="eval-content">
            <LeftSidebar>
              <div className="eval-sidebar-content">
                <SidebarNav />
              </div>
            </LeftSidebar>
            <MainContent>
              {renderMainContent()}
            </MainContent>
            <RightSidebar title="Sidebar">
              <div>Optional sidebar content</div>
            </RightSidebar>
          </div>
        </div>
      </div>
    </PromptGradeProvider>
  );
});
