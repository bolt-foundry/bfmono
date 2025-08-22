import React from "react";
import { useEvalContext } from "@bfmono/apps/boltfoundry-com/components/mock/contexts/EvalContext.tsx";
import { useRouter } from "@bfmono/apps/boltfoundry-com/contexts/RouterContext.tsx";
import { DecksView } from "../Decks/DecksView.tsx";
import { DeckDetailView } from "../Decks/DeckDetailView.tsx";
import { AnalyzeView } from "../Analyze/AnalyzeView.tsx";
import { ChatView } from "../Chat/ChatView.tsx";
import { GradingContainer } from "../Grading/GradingContainer.tsx";
import { useDeckSamples } from "@bfmono/apps/boltfoundry-com/components/mock/hooks/useDeckSamples.ts";
import {
  type DeckTab,
  isDeckTab,
} from "@bfmono/apps/boltfoundry-com/types/deck.ts";
import { getDeckNameById } from "@bfmono/apps/boltfoundry-com/mocks/deckData.ts";
import { getLogger } from "@bfmono/packages/logger/logger.ts";

const logger = getLogger(import.meta);

export function MainContent() {
  const { rightSidebarMode } = useEvalContext();
  const { currentPath, routeParams, navigate } = useRouter();

  const deckId = routeParams.deckId;
  const sampleId = routeParams.sampleId;
  const tab = routeParams.tab;

  // Determine what to show based on V3 routes (before any conditional logic)
  const {
    isDecksListPage,
    isDeckDetailPageWithoutTab,
    isDeckDetailPageWithTab,
    isSamplesListPage,
    isSampleDetailPage,
    isGradingPage,
    isAnalyzePage,
    isChatPage,
  } = React
    .useMemo(() => {
      return {
        isDecksListPage: currentPath === "/mock/pg/grade/decks",
        isDeckDetailPageWithoutTab:
          currentPath.match(/^\/mock\/pg\/grade\/decks\/[^/]+$/) &&
          deckId && !tab,
        isDeckDetailPageWithTab:
          currentPath.match(/^\/mock\/pg\/grade\/decks\/[^/]+\/[^/]+$/) &&
          deckId && tab && isDeckTab(tab),
        isSamplesListPage: currentPath === "/mock/pg/grade/samples",
        isSampleDetailPage:
          currentPath.match(/^\/mock\/pg\/grade\/samples\/[^/]+$/) && sampleId,
        isGradingPage:
          currentPath.match(/^\/mock\/pg\/grade\/decks\/[^/]+\/grade$/) &&
          deckId,
        isAnalyzePage: currentPath === "/mock/pg/analyze",
        isChatPage: currentPath === "/mock/pg/chat",
      };
    }, [currentPath, deckId, sampleId, tab]);

  // Load samples into context when needed
  const shouldLoadSamples = React.useMemo(() => {
    return (isDeckDetailPageWithTab || isSampleDetailPage || isGradingPage) &&
      deckId;
  }, [isDeckDetailPageWithTab, isSampleDetailPage, isGradingPage, deckId]);

  // Use context-based samples hook
  const { samples, loading } = useDeckSamples(shouldLoadSamples ? deckId : "");

  // Mock Routing: Handle redirects and determine content
  // /mock/pg and /mock/pg/grade should redirect to /mock/pg/grade/decks
  // /mock/pg/grade/decks/:deckId should redirect to /mock/pg/grade/decks/:deckId/samples
  React.useEffect(() => {
    if (currentPath === "/mock/pg" || currentPath === "/mock/pg/grade") {
      navigate("/mock/pg/grade/decks");
    } else if (isDeckDetailPageWithoutTab && deckId) {
      navigate(`/mock/pg/grade/decks/${deckId}/samples`);
    }
  }, [currentPath, navigate, isDeckDetailPageWithoutTab, deckId]);

  // Debug logging
  React.useEffect(() => {
    logger.debug("MainContent route detection", {
      currentPath,
      deckId,
      sampleId,
      tab,
      isDecksListPage,
      isDeckDetailPageWithoutTab,
      isDeckDetailPageWithTab,
      isSamplesListPage,
      isSampleDetailPage,
      isGradingPage,
      isAnalyzePage,
      isChatPage,
      shouldLoadSamples,
    });
  }, [
    currentPath,
    deckId,
    sampleId,
    tab,
    isDecksListPage,
    isDeckDetailPageWithoutTab,
    isDeckDetailPageWithTab,
    isSamplesListPage,
    isSampleDetailPage,
    isGradingPage,
    isAnalyzePage,
    isChatPage,
    shouldLoadSamples,
  ]);

  // Handle redirect early return AFTER all hooks are called
  if (
    currentPath === "/mock/pg" || currentPath === "/mock/pg/grade" ||
    isDeckDetailPageWithoutTab
  ) {
    return <div>Redirecting...</div>;
  }

  const renderMainContent = () => {
    // Debug: Log which page type is detected
    logger.debug("renderMainContent - route decision", {
      currentPath,
      isDecksListPage,
      isDeckDetailPageWithTab,
      isSamplesListPage,
      isSampleDetailPage,
      isGradingPage,
      isAnalyzePage,
      isChatPage,
      tab,
    });

    if (isSampleDetailPage) {
      // Sample detail view: /mock/pg/grade/samples/:sampleId
      return <div>Sample Detail View for {sampleId}</div>;
    }

    if (isSamplesListPage) {
      // Samples list: /mock/pg/grade/samples
      return <div>All Samples List</div>;
    }

    if (isGradingPage) {
      // Grading interface: /mock/pg/grade/decks/:deckId/grade
      logger.debug("Rendering GradingContainer", {
        deckId,
        hasRouteParams: !!deckId,
      });

      // Ensure we have deckId before rendering grading interface
      if (!deckId) {
        logger.warn("GradingPage route detected but deckId not available yet", {
          currentPath,
          routeParams,
        });
        return (
          <div style={{ padding: "2rem", textAlign: "center" }}>
            Loading grading interface...
          </div>
        );
      }

      return (
        <GradingContainer
          deckId={deckId}
          deckName={getDeckNameById(deckId)}
          onClose={() => navigate("/mock/pg/grade/decks")}
        />
      );
    }

    if (isDeckDetailPageWithTab && tab && isDeckTab(tab)) {
      // Deck detail view with tabs: /mock/pg/grade/decks/:deckId/:tab
      return (
        <DeckDetailView
          deckId={deckId}
          deckName={getDeckNameById(deckId)}
          currentTab={tab as DeckTab}
          samples={samples || []}
          loading={loading}
        />
      );
    }

    if (isAnalyzePage) {
      // Analyze view: /mock/pg/analyze
      return <AnalyzeView />;
    }

    if (isChatPage) {
      // Chat view: /mock/pg/chat
      return <ChatView />;
    }

    // Default: show decks list for /mock/pg/grade/decks
    if (isDecksListPage) {
      return <DecksView />;
    }

    // Fallback for unknown routes
    return <DecksView />;
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
