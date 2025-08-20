import type { ReactNode } from "react";

interface MainContentProps {
  children: ReactNode;
}

/**
 * MainContent - Simple layout component for the main content area
 * Just provides the structural styling for the main content section
 */
export function MainContent({ children }: MainContentProps) {
  return (
    <div className="eval-main-area">
      <div className="eval-main-content">
        {children}
      </div>
    </div>
  );
}
