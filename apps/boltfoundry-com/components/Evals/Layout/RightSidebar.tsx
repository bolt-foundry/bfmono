import type { ReactNode } from "react";
import { usePromptGradeContext } from "@bfmono/apps/boltfoundry-com/contexts/PromptGradeContext.tsx";
import { useEffect, useRef } from "react";
import { BfDsButton } from "@bfmono/apps/bfDs/components/BfDsButton.tsx";

interface RightSidebarProps {
  children?: ReactNode;
  title?: string;
}

/**
 * RightSidebar - Simple layout component for the right sidebar
 * Handles visibility state and animations based on context
 */
export function RightSidebar({ children, title }: RightSidebarProps) {
  const { rightSidebarOpen, closeRightSidebar } = usePromptGradeContext();
  const hasAnimated = useRef(false);

  useEffect(() => {
    // Mark that we've had at least one state change after initial render
    hasAnimated.current = true;
  }, [rightSidebarOpen]);

  const placeholderClass = `eval-right-sidebar-placeholder ${
    !rightSidebarOpen ? "eval-right-sidebar--hidden" : ""
  } ${hasAnimated.current ? "eval-right-sidebar-placeholder--animate" : ""}`;

  const sidebarClass = `eval-right-sidebar ${
    !rightSidebarOpen ? "eval-right-sidebar--hidden" : ""
  }`;

  if (!rightSidebarOpen && !children) {
    return null;
  }

  return (
    <>
      <div className={placeholderClass}></div>
      <div className={sidebarClass}>
        <div className="eval-sidebar-header">
          {title && <h2>{title}</h2>}
          <BfDsButton
            variant="secondary"
            size="small"
            onClick={closeRightSidebar}
          >
            Close
          </BfDsButton>
        </div>
        <div className="eval-sidebar-content">
          {children}
        </div>
      </div>
    </>
  );
}
