import type React from "react";
import { RefinementProvider } from "./RefinementContext.tsx";

interface MockContextProps {
  children: React.ReactNode;
}

/**
 * MockContext - Provides mock-specific contexts that need to persist across route changes
 * This wraps all mock-related contexts like RefinementContext to ensure they don't
 * get reset when navigating between routes in the main app.
 */
export function MockProvider({ children }: MockContextProps) {
  return (
    <RefinementProvider>
      {children}
    </RefinementProvider>
  );
}
