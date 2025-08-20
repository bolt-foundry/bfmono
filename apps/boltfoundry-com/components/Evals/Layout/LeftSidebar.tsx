import type { ReactNode } from "react";
import { usePromptGradeContext } from "@bfmono/apps/boltfoundry-com/contexts/PromptGradeContext.tsx";
import { useEffect, useRef } from "react";

interface LeftSidebarProps {
  children: ReactNode;
}

/**
 * LeftSidebar - Simple layout component for the left sidebar
 * Handles visibility state and animations based on context
 */
export function LeftSidebar({ children }: LeftSidebarProps) {
  const { leftSidebarOpen, rightSidebarOpen } = usePromptGradeContext();
  const hasAnimated = useRef(false);

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
          {children}
        </div>
      </div>
    </>
  );
}
