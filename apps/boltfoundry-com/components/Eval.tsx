import { iso } from "@iso-bfc";
import { EvalProvider, useEvalContext } from "../contexts/EvalContext.tsx";
import { Header } from "./Evals/Layout/Header.tsx";
import { LeftSidebar } from "./Evals/Layout/LeftSidebar.tsx";
import { MainContent } from "./Evals/Layout/MainContent.tsx";
import { RightSidebar } from "./Evals/Layout/RightSidebar.tsx";
import { useHud } from "@bfmono/apps/bfDs/contexts/BfDsHudContext.tsx";
import { useEffect } from "react";

function EvalContent() {
  const evalContext = useEvalContext();

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
  field Query.Eval @component {
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
  }
`)(function Eval({ data }) {
  const { sendMessage, showHud } = useHud();

  useEffect(() => {
    // Show HUD and display API key info (runs only once on mount)
    showHud();

    const orgId = data?.currentViewer?.orgBfOid;
    if (orgId) {
      const apiKey = `bf+${orgId}`;
      sendMessage(`Organization ID: ${orgId}`, "success");
      sendMessage(`API Key: ${apiKey}`, "success");
      sendMessage(`To use: export BF_API_KEY="${apiKey}"`, "info");
    } else {
      sendMessage("Not logged in - org ID not available", "warning");
    }
  }, []); // Empty dependency array - runs once on mount

  return (
    <EvalProvider>
      <EvalContent />
    </EvalProvider>
  );
});
