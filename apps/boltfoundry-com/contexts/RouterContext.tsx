import {
  createContext,
  type ReactNode,
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
  const [rawPathWithSlash, search] = pathRaw.split("?");
  // Normalize path by removing trailing slash (except for root "/")
  const rawPath = rawPathWithSlash === "/"
    ? "/"
    : rawPathWithSlash.replace(/\/$/, "");
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

// V3: Simplified routing - no layout modes needed

type RouterContextType = {
  currentPath: string;
  navigate: (path: string) => void;
  routeParams: Record<string, string>;
  queryParams: Record<string, string>;
};

const RouterContext = createContext<RouterContextType | null>(null);

export function RouterProvider({
  children,
  initialPath,
}: {
  children: ReactNode;
  initialPath?: string;
}) {
  const [currentPath, setCurrentPath] = useState(() => {
    if (typeof window === "undefined") {
      return initialPath || "/";
    }
    const pathname = globalThis.location.pathname;
    // Normalize trailing slash in browser URL
    const normalized = pathname === "/" ? "/" : pathname.replace(/\/$/, "");
    if (pathname !== normalized) {
      // Update browser URL to remove trailing slash
      globalThis.history.replaceState(
        {},
        "",
        normalized + globalThis.location.search + globalThis.location.hash,
      );
    }
    return normalized;
  });

  // Extract route and query params synchronously to avoid undefined -> value flicker
  const { routeParams, queryParams } = useMemo(() => {
    const allRoutes = [...appRoutes.keys(), ...isographAppRoutes.keys()];
    for (const routePattern of allRoutes) {
      const match = matchRouteWithParams(currentPath, routePattern);
      if (match.match) {
        return {
          routeParams: match.params,
          queryParams: match.queryParams,
        };
      }
    }
    return { routeParams: {}, queryParams: {} };
  }, [currentPath]);

  const navigate = useCallback((path: string) => {
    logger.debug("RouterContext navigate called", { to: path });
    setCurrentPath(path);
    if (typeof window !== "undefined") {
      globalThis.history.pushState({}, "", path);
      logger.debug("History updated", { url: globalThis.location.pathname });
    }
  }, []); // Remove currentPath dependency to prevent re-creation

  useEffect(() => {
    const handlePopState = () => {
      const pathname = globalThis.location.pathname;
      // Normalize trailing slash in browser URL
      const normalized = pathname === "/" ? "/" : pathname.replace(/\/$/, "");
      if (pathname !== normalized) {
        // Update browser URL to remove trailing slash
        globalThis.history.replaceState(
          {},
          "",
          normalized + globalThis.location.search + globalThis.location.hash,
        );
        setCurrentPath(normalized);
      } else {
        setCurrentPath(pathname);
      }
    };

    if (typeof window !== "undefined") {
      globalThis.addEventListener("popstate", handlePopState);
      return () => globalThis.removeEventListener("popstate", handlePopState);
    }
  }, []);

  const contextValue: RouterContextType = useMemo(
    () => ({
      currentPath,
      navigate,
      routeParams,
      queryParams,
    }),
    [currentPath, navigate, routeParams, queryParams],
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
