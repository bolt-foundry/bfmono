import { BfDsList } from "@bfmono/apps/bfDs/components/BfDsList.tsx";
import { BfDsListItem } from "@bfmono/apps/bfDs/components/BfDsListItem.tsx";
import { useEffect, useRef } from "react";
import { useEvalContext } from "@bfmono/apps/boltfoundry-com/components/mock/contexts/EvalContext.tsx";
import { useRouter } from "@bfmono/apps/boltfoundry-com/contexts/RouterContext.tsx";

export function LeftSidebar() {
  const {
    leftSidebarOpen,
    rightSidebarOpen,
  } = useEvalContext();
  const { currentPath, navigate } = useRouter();
  const hasAnimated = useRef(false);

  // Determine which section is active based on current path
  const isGradeActive = currentPath.startsWith("/mock/pg/grade") ||
    currentPath === "/mock/pg";
  const isAnalyzeActive = currentPath === "/mock/pg/analyze";
  const isChatActive = currentPath === "/mock/pg/chat";

  useEffect(() => {
    // Mark that we've had at least one state change after initial render
    hasAnimated.current = true;
  }, [leftSidebarOpen, rightSidebarOpen]);

  // Always render placeholder, animate based on right sidebar state or left sidebar state
  const placeholderClass = rightSidebarOpen
    ? `eval-left-sidebar-placeholder eval-left-sidebar--hidden ${
      hasAnimated.current ? "eval-left-sidebar-placeholder--animate" : ""
    }`
    : `eval-left-sidebar-placeholder ${
      !leftSidebarOpen ? "eval-left-sidebar--hidden" : ""
    } ${hasAnimated.current ? "eval-left-sidebar-placeholder--animate" : ""}`;

  // Sidebar always uses the same animation (transform), but positioning changes
  const sidebarClass = rightSidebarOpen
    ? `eval-left-sidebar eval-left-sidebar-overlay ${
      !leftSidebarOpen ? "eval-left-sidebar--hidden" : ""
    }`
    : `eval-left-sidebar eval-left-sidebar-side-by-side ${
      !leftSidebarOpen ? "eval-left-sidebar--hidden" : ""
    }`;

  return (
    <>
      <div className={placeholderClass}></div>
      <div className={sidebarClass}>
        <div className="eval-sidebar-content">
          <BfDsList header="Navigation">
            <BfDsListItem
              active={isGradeActive}
              onClick={() => navigate("/mock/pg/grade/decks")}
            >
              Grade
            </BfDsListItem>
            <BfDsListItem
              active={isAnalyzeActive}
              onClick={() => navigate("/mock/pg/analyze")}
            >
              Analyze
            </BfDsListItem>
            <BfDsListItem
              active={isChatActive}
              onClick={() => navigate("/mock/pg/chat")}
            >
              Chat
            </BfDsListItem>
          </BfDsList>
        </div>
      </div>
    </>
  );
}
