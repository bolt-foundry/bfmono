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
  const { addButton, removeButton, sendMessage } = useHud();

  useEffect(() => {
    // Add button to show eval context state
    addButton({
      id: "show-eval-state",
      label: "Show Eval State",
      onClick: () => {
        sendMessage(JSON.stringify(evalContext, null, 2), "info");
      },
      icon: "info",
    });

    // Cleanup buttons on unmount
    return () => {
      removeButton("show-eval-state");
    };
  }, [evalContext, addButton, removeButton, sendMessage]);
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
  const { sendMessage } = useHud();

  useEffect(() => {
    sendMessage("Eval component data:", "info");
    sendMessage(JSON.stringify(data, null, 2), "info");

    // Log deck data specifically
    if (data?.currentViewer?.asCurrentViewerLoggedIn?.organization?.decks) {
      sendMessage("Decks found:", "success");
      const decks =
        data.currentViewer.asCurrentViewerLoggedIn.organization.decks;
      sendMessage(`Total deck edges: ${decks.edges?.length || 0}`, "info");
      decks.edges?.forEach((edge, index) => {
        if (edge && edge.node) {
          sendMessage(
            `Deck ${index + 1}: ${edge.node.name} (${edge.node.id})`,
            "info",
          );
        }
      });
    } else {
      sendMessage("No decks found in GraphQL response", "warning");
    }
  }, [data, sendMessage]);

  return (
    <EvalProvider>
      <EvalContent />
    </EvalProvider>
  );
});
