import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { appRoutes, isographAppRoutes } from "../routes.ts";
import { getLogger } from "@bfmono/packages/logger/logger.ts";

const logger = getLogger(import.meta);

type MatchedRoute = {
  match: boolean;
  params: Record<string, string>;
  queryParams: Record<string, string>;
};

export function matchRouteWithParams(
  pathRaw = "",
  pathTemplate?: string,
): MatchedRoute {
  const [rawPath, search] = pathRaw.split("?");
  const searchParams = new URLSearchParams(search || "");
  const queryParams = Object.fromEntries(searchParams.entries());

  if (!pathTemplate) {
    return {
      match: false,
      params: {},
      queryParams,
    };
  }

  // Handle exact match
  if (rawPath === pathTemplate) {
    return {
      match: true,
      params: {},
      queryParams,
    };
  }

  // Handle wildcard patterns like "/ui/*"
  if (pathTemplate.endsWith("/*")) {
    const baseTemplate = pathTemplate.slice(0, -2); // Remove "/*"
    if (rawPath === baseTemplate || rawPath.startsWith(baseTemplate + "/")) {
      return {
        match: true,
        params: {},
        queryParams,
      };
    }
  }

  // NEW: Handle parameterized routes like "/deck/:deckId" or "/eval/decks/:deckId/sample/:sampleId"
  const templateParts = pathTemplate.split("/");
  const pathParts = rawPath.split("/");

  if (templateParts.length !== pathParts.length) {
    return {
      match: false,
      params: {},
      queryParams,
    };
  }

  const params: Record<string, string> = {};
  let matches = true;

  for (let i = 0; i < templateParts.length; i++) {
    const templatePart = templateParts[i];
    const pathPart = pathParts[i];

    if (templatePart.startsWith(":")) {
      // Extract parameter
      const paramName = templatePart.slice(1);
      params[paramName] = pathPart;
    } else if (templatePart !== pathPart) {
      matches = false;
      break;
    }
  }

  return {
    match: matches,
    params,
    queryParams,
  };
}

export type LayoutMode = "normal" | "fullscreen";

export function getLayoutMode(pathname: string): LayoutMode {
  // V2: Fullscreen mode uses singular forms: /pg/grade/deck/ or /pg/grade/sample/
  return (pathname.includes("/grade/deck/") ||
      pathname.includes("/grade/sample/"))
    ? "fullscreen"
    : "normal";
}

export function toggleLayoutMode(currentPath: string): string {
  // V2: Specific toggle patterns based on the PDF spec
  const [pathWithoutQuery, query] = currentPath.split("?");
  const queryString = query ? `?${query}` : "";

  // Pattern: /pg/grade/decks/{deck.id}/samples ↔ /pg/grade/deck/{deck.id}
  if (pathWithoutQuery.match(/^\/pg\/grade\/decks\/[^/]+\/samples$/)) {
    const deckId = pathWithoutQuery.split("/")[4];
    return `/pg/grade/deck/${deckId}${queryString}`;
  }
  if (pathWithoutQuery.match(/^\/pg\/grade\/deck\/[^/]+$/)) {
    const deckId = pathWithoutQuery.split("/")[4];
    return `/pg/grade/decks/${deckId}/samples${queryString}`;
  }

  // Pattern: /pg/grade/decks/{deck.id}/sample/{sample.id} ↔ /pg/grade/sample/{sample.id}
  if (pathWithoutQuery.match(/^\/pg\/grade\/decks\/[^/]+\/sample\/[^/]+$/)) {
    const sampleId = pathWithoutQuery.split("/")[6];
    return `/pg/grade/sample/${sampleId}${queryString}`;
  }
  if (pathWithoutQuery.match(/^\/pg\/grade\/sample\/[^/]+$/)) {
    // For sample-only view, we can't easily toggle back without knowing the deck
    // Return as-is for now - this might require additional context
    return currentPath;
  }

  // Pattern: /pg/grade/decks/{deck.id}/samples/grading ↔ /pg/grade/deck/{deck.id}/samples/grading
  if (pathWithoutQuery.match(/^\/pg\/grade\/decks\/[^/]+\/samples\/grading$/)) {
    const deckId = pathWithoutQuery.split("/")[4];
    return `/pg/grade/deck/${deckId}/samples/grading${queryString}`;
  }
  if (pathWithoutQuery.match(/^\/pg\/grade\/deck\/[^/]+\/samples\/grading$/)) {
    const deckId = pathWithoutQuery.split("/")[4];
    return `/pg/grade/decks/${deckId}/samples/grading${queryString}`;
  }

  // No toggle available for this route
  return currentPath;
}

type RouterContextType = {
  currentPath: string;
  navigate: (path: string) => void;
  routeParams: Record<string, string>;
  queryParams: Record<string, string>;
  layoutMode: LayoutMode;
  toggleLayoutMode: () => void;
};

const RouterContext = createContext<RouterContextType | null>(null);

export function RouterProvider({
  children,
  initialPath,
}: {
  children: React.ReactNode;
  initialPath?: string;
}) {
  const [currentPath, setCurrentPath] = useState(() => {
    if (typeof window === "undefined") {
      return initialPath || "/";
    }
    return globalThis.location.pathname;
  });

  const [routeParams, setRouteParams] = useState<Record<string, string>>({});
  const [queryParams, setQueryParams] = useState<Record<string, string>>({});

  const navigate = useCallback((path: string) => {
    logger.info("RouterContext navigate called", { to: path });
    setCurrentPath(path);
    if (typeof window !== "undefined") {
      globalThis.history.pushState({}, "", path);
      logger.info("History updated", { url: globalThis.location.pathname });
    }
  }, []); // Remove currentPath dependency to prevent re-creation

  // NEW: Update route params when path changes
  useEffect(() => {
    // Find matching route and extract parameters
    const allRoutes = [...appRoutes.keys(), ...isographAppRoutes.keys()];
    for (const routePattern of allRoutes) {
      const match = matchRouteWithParams(currentPath, routePattern);
      if (match.match) {
        // Only update if params actually changed to prevent infinite re-renders
        setRouteParams((prevParams) => {
          const paramsChanged =
            JSON.stringify(prevParams) !== JSON.stringify(match.params);
          return paramsChanged ? match.params : prevParams;
        });
        setQueryParams((prevQuery) => {
          const queryChanged =
            JSON.stringify(prevQuery) !== JSON.stringify(match.queryParams);
          return queryChanged ? match.queryParams : prevQuery;
        });
        break;
      }
    }
  }, [currentPath]);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(globalThis.location.pathname);
      const searchParams = new URLSearchParams(globalThis.location.search);
      setQueryParams(Object.fromEntries(searchParams.entries()));
    };

    if (typeof window !== "undefined") {
      globalThis.addEventListener("popstate", handlePopState);
      return () => globalThis.removeEventListener("popstate", handlePopState);
    }
  }, []);

  // Memoize computed values to prevent unnecessary re-renders
  const layoutMode = useMemo(() => getLayoutMode(currentPath), [currentPath]);

  const handleToggleLayoutMode = useCallback(() => {
    const newPath = toggleLayoutMode(currentPath);
    navigate(newPath);
  }, [currentPath, navigate]);

  const contextValue: RouterContextType = useMemo(
    () => ({
      currentPath,
      navigate,
      routeParams,
      queryParams,
      layoutMode,
      toggleLayoutMode: handleToggleLayoutMode,
    }),
    [
      currentPath,
      navigate,
      routeParams,
      queryParams,
      layoutMode,
      handleToggleLayoutMode,
    ],
  );

  return (
    <RouterContext.Provider value={contextValue}>
      {children}
    </RouterContext.Provider>
  );
}

export function useRouter(): RouterContextType {
  const context = useContext(RouterContext);
  if (!context) {
    throw new Error("useRouter must be used within a RouterProvider");
  }
  return context;
}
