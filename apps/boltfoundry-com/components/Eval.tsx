import { iso } from "@iso-bfc";
import { useEffect } from "react";
import { EvalProvider } from "../contexts/EvalContext.tsx";
import { Header } from "./Evals/Layout/Header.tsx";
import { LeftSidebar } from "./Evals/Layout/LeftSidebar.tsx";
import { MainContent } from "./Evals/Layout/MainContent.tsx";
import { RightSidebar } from "./Evals/Layout/RightSidebar.tsx";
import { useHud } from "@bfmono/apps/bfDs/contexts/BfDsHudContext.tsx";
import { useRouter } from "../contexts/RouterContext.tsx";
import { getLogger } from "@bfmono/packages/logger/logger.ts";

const logger = getLogger(import.meta);

function EvalContent() {
  return (
    <div className="eval-page">
      <Header />
      <div className="eval-layout">
        <div className="eval-content">
          <LeftSidebar />
          <MainContent />
          <RightSidebar />
        </div>
      </div>
    </div>
  );
}

export const Eval = iso(`
  field Query.Eval($deckId: String, $sampleId: String) @component {
    currentViewer {
      id
      personBfGid
      orgBfOid
      asCurrentViewerLoggedIn {
        organization {
          id
          name
          domain
          decks(first: 10) {
            edges {
              node {
                id
                name
                description
                slug
              }
            }
          }
        }
      }
    }
    # Conditionally load deck data when deckId is provided
    deck(id: $deckId) @loadable {
      id
      name
      description
      slug
    }
    # Conditionally load sample data when sampleId is provided  
    sample(id: $sampleId) @loadable {
      id
      # Add sample fields as they become available
    }
  }
`)(function Eval({ data: _data }) {
  const { sendMessage: _sendMessage } = useHud();
  const { currentPath, routeParams } = useRouter();

  // Extract route parameters from router context
  const deckId = routeParams.deckId;
  const sampleId = routeParams.sampleId;

  // Determine what content to show based on route parameters
  const showDecksView = !deckId;
  const showSampleView = deckId && sampleId;
  const showGradingView = deckId && currentPath.includes("/inbox");
  const showDeckOverview = deckId && !sampleId && !showGradingView;

  useEffect(() => {
    const routeInfo = {
      currentPath,
      routeParams,
      deckId,
      sampleId,
      showDecksView,
      showDeckOverview,
      showSampleView,
      showGradingView,
    };
    logger.debug("V2 Eval Route Info:", routeInfo);
  }, [currentPath, deckId, sampleId]); // Only trigger when path or key params change

  return (
    <EvalProvider>
      <EvalContent />
    </EvalProvider>
  );
});
