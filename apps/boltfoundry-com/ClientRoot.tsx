/// <reference types="vite/client" />
import { hydrateRoot } from "react-dom/client";
import { getLogger } from "@bolt-foundry/logger";
import App from "./src/App.tsx";
import "./styles/index.ts";

const logger = getLogger(import.meta);

export interface ClientRootProps {
  environment: Record<string, unknown>;
}

export function ClientRoot({ environment }: ClientRootProps) {
  return (
    <App initialPath={environment.currentPath as string} {...environment} />
  );
}

export function rehydrate(environment: Record<string, unknown>) {
  logger.debug("🔧 rehydrate() called with environment:", environment);
  const root = document.querySelector("#root");
  if (root) {
    logger.debug("🔧 Found #root element, calling hydrateRoot");
    try {
      hydrateRoot(
        root,
        <ClientRoot environment={environment} />,
      );
      logger.debug("🔧 hydrateRoot completed successfully");
    } catch (error) {
      logger.error("🔧 hydrateRoot failed:", error);
    }
  } else {
    logger.error("🔧 Could not find #root element");
  }
}

const isDev = import.meta.env?.DEV;

if (isDev) {
  // Development mode - do initial client-side render
  import("react-dom/client").then(({ createRoot }) => {
    const root = document.querySelector("#root");
    if (root) {
      logger.debug("🔧 Development mode: Creating React root");
      const devEnvironment = {
        mode: "development",
        port: 8000,
        currentPath: globalThis.location.pathname,
        // @ts-expect-error Development global
        GOOGLE_OAUTH_CLIENT_ID: globalThis.__ENVIRONMENT__
          ?.GOOGLE_OAUTH_CLIENT_ID ||
          // @ts-expect-error Vite env
          import.meta.env?.VITE_GOOGLE_OAUTH_CLIENT_ID ||
          "1053566961455-rreuknvho4jqcj184evmj93n7n1nrjun.apps.googleusercontent.com",
        // @ts-expect-error Development global
        BF_E2E_MODE: globalThis.__ENVIRONMENT__?.BF_E2E_MODE ||
          // Check if BF_E2E_MODE is set in environment
          (typeof Deno !== "undefined" &&
            Deno.env?.get?.("BF_E2E_MODE") === "true") ||
          // In codebot, always enable E2E mode
          (typeof window !== "undefined" &&
            globalThis.location.hostname.includes(".codebot.local")),
        // @ts-expect-error Development global
        BF_ENV: globalThis.__ENVIRONMENT__?.BF_ENV || "development",
      };
      createRoot(root).render(<ClientRoot environment={devEnvironment} />);
    }
  });
} else {
  // Production mode - environment is always available in SSR
  // @ts-expect-error Not typed on the window yet
  if (globalThis.__ENVIRONMENT__) {
    logger.debug("🔧 Production mode: Environment found, hydrating");
    // @ts-expect-error Not typed on the window yet
    rehydrate(globalThis.__ENVIRONMENT__);
  } else {
    logger.error(
      "🔧 Production mode: No environment found - this shouldn't happen in SSR",
    );
  }
}
