import React from "react";
import { useEvalContext } from "@bfmono/apps/boltfoundry-com/contexts/EvalContext.tsx";
import { useRouter } from "@bfmono/apps/boltfoundry-com/contexts/RouterContext.tsx";
import { DecksView } from "../Decks/DecksView.tsx";
import { DeckDetailView } from "../Decks/DeckDetailView.tsx";
import { AnalyzeView } from "../Analyze/AnalyzeView.tsx";
import { ChatView } from "../Chat/ChatView.tsx";
import { GradingContainer } from "../Grading/GradingContainer.tsx";
import { useDeckSamples } from "@bfmono/apps/boltfoundry-com/hooks/useDeckSamples.ts";
import {
  type DeckTab,
  isDeckTab,
} from "@bfmono/apps/boltfoundry-com/types/deck.ts";
import { getDeckNameById } from "@bfmono/apps/boltfoundry-com/mocks/deckData.ts";
import { getLogger } from "@bfmono/packages/logger/logger.ts";

const logger = getLogger(import.meta);

export function MainContent() {
  const { rightSidebarMode, recentlyCompletedSamples, completionSummaries } =
    useEvalContext();
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
        isDecksListPage: currentPath === "/pg/grade/decks",
        isDeckDetailPageWithoutTab:
          currentPath.match(/^\/pg\/grade\/decks\/[^/]+$/) &&
          deckId && !tab,
        isDeckDetailPageWithTab:
          currentPath.match(/^\/pg\/grade\/decks\/[^/]+\/[^/]+$/) &&
          deckId && tab && isDeckTab(tab),
        isSamplesListPage: currentPath === "/pg/grade/samples",
        isSampleDetailPage:
          currentPath.match(/^\/pg\/grade\/samples\/[^/]+$/) && sampleId,
        isGradingPage:
          currentPath.match(/^\/pg\/grade\/decks\/[^/]+\/grade$/) && deckId,
        isAnalyzePage: currentPath === "/pg/analyze",
        isChatPage: currentPath === "/pg/chat",
      };
    }, [currentPath, deckId, sampleId, tab]);

  // Load samples into context when needed
  const shouldLoadSamples = React.useMemo(() => {
    return (isDeckDetailPageWithTab || isSampleDetailPage || isGradingPage) &&
      deckId;
  }, [isDeckDetailPageWithTab, isSampleDetailPage, isGradingPage, deckId]);

  // Use context-based samples hook
  const { samples, loading } = useDeckSamples(shouldLoadSamples ? deckId : "");

  // V3 Routing: Handle redirects and determine content
  // /pg and /pg/grade should redirect to /pg/grade/decks
  // /pg/grade/decks/:deckId should redirect to /pg/grade/decks/:deckId/samples
  React.useEffect(() => {
    if (currentPath === "/pg" || currentPath === "/pg/grade") {
      navigate("/pg/grade/decks");
    } else if (isDeckDetailPageWithoutTab && deckId) {
      navigate(`/pg/grade/decks/${deckId}/samples`);
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
    currentPath === "/pg" || currentPath === "/pg/grade" ||
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
      // Sample detail view: /pg/grade/samples/:sampleId
      return <div>Sample Detail View for {sampleId}</div>;
    }

    if (isSamplesListPage) {
      // Samples list: /pg/grade/samples
      return <div>All Samples List</div>;
    }

    if (isGradingPage) {
      // Grading interface: /pg/grade/decks/:deckId/grade
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
          onClose={() => navigate("/pg/grade/decks")}
        />
      );
    }

    if (isDeckDetailPageWithTab && tab && isDeckTab(tab)) {
      // Deck detail view with tabs: /pg/grade/decks/:deckId/:tab
      return (
        <DeckDetailView
          deckId={deckId}
          deckName={getDeckNameById(deckId)}
          currentTab={tab as DeckTab}
          samples={samples || []}
          loading={loading}
          justCompletedIds={recentlyCompletedSamples[deckId] || []}
          completionSummary={completionSummaries[deckId]}
        />
      );
    }

    if (isAnalyzePage) {
      // Analyze view: /pg/analyze
      return <AnalyzeView />;
    }

    if (isChatPage) {
      // Chat view: /pg/chat
      return <ChatView />;
    }

    // Default: show decks list for /pg/grade/decks
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
