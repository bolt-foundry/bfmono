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
  field Query.Eval @component {}
`)(function Eval() {
  return (
    <EvalProvider>
      <EvalContent />
    </EvalProvider>
  );
});
