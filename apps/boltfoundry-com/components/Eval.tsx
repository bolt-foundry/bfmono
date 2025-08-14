import { iso } from "@iso-bfc";
import { useEffect } from "react";
import { EvalProvider } from "../contexts/EvalContext.tsx";
import { Header } from "./Evals/Layout/Header.tsx";
import { LeftSidebar } from "./Evals/Layout/LeftSidebar.tsx";
import { MainContent } from "./Evals/Layout/MainContent.tsx";
import { RightSidebar } from "./Evals/Layout/RightSidebar.tsx";
import { useHud } from "@bfmono/apps/bfDs/contexts/BfDsHudContext.tsx";

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
  field Query.Eval @component {
    currentViewer {
      id
      personBfGid
      orgBfOid
      asCurrentViewerLoggedIn {
        person {
          id
          name
          email
        }
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
    sendMessage(`Isograph data:\n${JSON.stringify(data, null, 2)}`, "info");
  }, []);

  return (
    <EvalProvider>
      <EvalContent />
    </EvalProvider>
  );
});
