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

// TODO: Rebuild this component with proper Isograph patterns
// The old implementation mixed routing logic with data fetching
// New version should follow "resolvers all the way down" pattern

export const Eval = iso(`
  field Query.Eval @component {
    __typename
  }
`)(function Eval() {
  const { sendMessage: _sendMessage } = useHud();

  // Temporary placeholder while we rebuild with proper Isograph components
  return (
    <EvalProvider>
      <EvalContent />
    </EvalProvider>
  );
});
