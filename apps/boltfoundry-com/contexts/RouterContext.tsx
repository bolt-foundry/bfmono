import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { appRoutes, isographAppRoutes } from "../routes.ts";

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
  return pathname.startsWith("/deck/") ? "fullscreen" : "normal";
}

export function toggleLayoutMode(currentPath: string): string {
  if (currentPath.startsWith("/eval/decks/")) {
    // Convert /eval/decks/abc123/sample/xyz789 → /deck/abc123/sample/xyz789
    return currentPath.replace("/eval/decks/", "/deck/");
  } else if (currentPath.startsWith("/deck/")) {
    // Convert /deck/abc123/sample/xyz789 → /eval/decks/abc123/sample/xyz789
    return currentPath.replace("/deck/", "/eval/decks/");
  }
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
    setCurrentPath(path);
    if (typeof window !== "undefined") {
      globalThis.history.pushState({}, "", path);
    }
  }, []);

  const handleToggleLayoutMode = useCallback(() => {
    const newPath = toggleLayoutMode(currentPath);
    navigate(newPath);
  }, [currentPath, navigate]);

  // NEW: Update route params when path changes
  useEffect(() => {
    // Find matching route and extract parameters
    const allRoutes = [...appRoutes.keys(), ...isographAppRoutes.keys()];
    for (const routePattern of allRoutes) {
      const match = matchRouteWithParams(currentPath, routePattern);
      if (match.match) {
        setRouteParams(match.params);
        setQueryParams(match.queryParams);
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

  const contextValue: RouterContextType = {
    currentPath,
    navigate,
    routeParams,
    queryParams,
    layoutMode: getLayoutMode(currentPath),
    toggleLayoutMode: handleToggleLayoutMode,
  };

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
