#!/usr/bin/env -S deno run --allow-env --allow-read --allow-write --allow-net --watch

import { parseArgs } from "@std/cli";
import { getLogger } from "@bolt-foundry/logger";
import { renderToReadableStream } from "react-dom/server";
import { ServerRenderedPage } from "./server/components/ServerRenderedPage.tsx";
import App from "./src/App.tsx";
import { appRoutes, isographAppRoutes } from "./routes.ts";
import { createApiRoutes } from "./apiRoutes.ts";
import { getIsographEnvironment } from "./server/isographEnvironment.ts";
import { getConfigurationVariable } from "@bolt-foundry/get-configuration-var";
import { matchRouteWithParams } from "./contexts/RouterContext.tsx";
import { handleStreamRoutes } from "@bfmono/infra/testing/video-streaming/simple-stream-server.ts";

const logger = getLogger(import.meta);
const requestLogger = getLogger("boltfoundry-com/requests");

// Types for Vite manifest
interface ViteManifestEntry {
  file: string;
  css?: Array<string>;
}

interface ViteManifest {
  [key: string]: ViteManifestEntry;
}

// Read Vite manifest to get asset paths
async function loadAssetPaths(
  isDev: boolean,
): Promise<{ cssPath?: string; jsPath: string }> {
  if (isDev) {
    // In dev mode, these paths aren't used since Vite handles everything
    const devPaths = {
      cssPath: undefined,
      jsPath: "/dev-not-used", // Vite handles all assets in dev mode
    };
    logger.info("Using dev asset paths (not used - Vite handles everything)");
    return devPaths;
  }

  try {
    const manifestUrl = import.meta.resolve(
      "./static/build/.vite/manifest.json",
    );
    const manifestPath = new URL(manifestUrl).pathname;
    const manifestData = await Deno.readFile(manifestPath);
    const manifestText = new TextDecoder().decode(manifestData);
    const manifest: ViteManifest = JSON.parse(manifestText);

    const entry = manifest["ClientRoot.tsx"];
    if (entry) {
      const jsPath = `/static/build/${entry.file}`;
      const cssPath = entry.css?.[0]
        ? `/static/build/${entry.css[0]}`
        : undefined;

      logger.info(`Loaded assets: CSS=${cssPath || "none"}, JS=${jsPath}`);
      return { cssPath, jsPath };
    }
  } catch (error) {
    logger.warn("Failed to read Vite manifest:", error);
  }

  // Fallback to hardcoded paths (should rarely be used)
  const fallback = {
    cssPath: undefined,
    jsPath: "/static/build/ClientRoot-[hash].js", // This should be updated after build
  };
  logger.info("Using fallback asset paths");
  return fallback;
}

// Check if a path should be handled by React routing
function shouldHandleWithReact(pathname: string): boolean {
  // Check exact matches first
  if (isographAppRoutes.has(pathname) || appRoutes.has(pathname)) {
    return true;
  }

  // Use the same parameter matching logic as client-side
  for (const [routePath] of [...isographAppRoutes, ...appRoutes]) {
    const match = matchRouteWithParams(pathname, routePath);
    if (match.match) {
      return true;
    }
  }

  return false;
}

// Parse command line arguments
const flags = parseArgs(Deno.args, {
  string: ["port", "mode", "vite-port"],
  default: {
    port: "8000",
    mode: "production",
  },
});

const port = parseInt(flags.port);
if (isNaN(port)) {
  logger.printErr(`Invalid port: ${flags.port}`);
  Deno.exit(1);
}

const isDev = flags.mode === "development";
const vitePort = flags["vite-port"] ? parseInt(flags["vite-port"]) : undefined;

// Load asset paths at startup
const assetPaths = await loadAssetPaths(isDev);

// Create API routes
const apiRoutes = createApiRoutes({ isDev, port });

const logResponse = (
  requestId: string,
  response: Response,
  startTime: number,
  method: string,
  pathname: string,
  search: string,
  info?: string,
) => {
  const duration = Date.now() - startTime;
  const statusColor = response.status >= 500
    ? "🔴"
    : response.status >= 400
    ? "🟡"
    : "🟢";
  const sizeInfo = response.headers.get("content-length")
    ? ` | ${response.headers.get("content-length")} bytes`
    : "";
  const extraInfo = info ? ` | ${info}` : "";

  requestLogger.info(
    `[${requestId}] ← ${statusColor} ${response.status} ${method} ${pathname}${search} | ${duration}ms${sizeInfo}${extraInfo}`,
  );
};

const handler = async (request: Request): Promise<Response> => {
  const startTime = Date.now();
  const url = new URL(request.url);
  const method = request.method;
  const userAgent = request.headers.get("user-agent") || "unknown";
  const referer = request.headers.get("referer") || "-";
  const requestId = crypto.randomUUID();

  requestLogger.info(
    `[${requestId}] → ${method} ${url.pathname}${url.search} | UA: ${userAgent} | Referer: ${referer}`,
  );

  try {
    // Check for streaming routes first
    const streamResponse = handleStreamRoutes(request);
    if (streamResponse) {
      logResponse(
        requestId,
        streamResponse,
        startTime,
        method,
        url.pathname,
        url.search,
        "E2E Stream",
      );
      return streamResponse;
    }

    // Try to match against API routes
    for (const route of apiRoutes) {
      if (route.pattern.test(url)) {
        const response = await route.handler(request);
        logResponse(
          requestId,
          response,
          startTime,
          method,
          url.pathname,
          url.search,
          "API",
        );
        return response;
      }
    }

    // Check if this should be handled by React routing
    if (shouldHandleWithReact(url.pathname)) {
      // In dev mode, let Vite handle all UI routes
      if (isDev && vitePort) {
        try {
          const viteUrl =
            `http://localhost:${vitePort}${url.pathname}${url.search}`;
          const viteResponse = await fetch(viteUrl, {
            method: request.method,
            headers: request.headers,
            body: request.body,
          });

          // Create new headers to avoid immutable headers issue
          const headers = new Headers();
          viteResponse.headers.forEach((value, key) => {
            // Skip hop-by-hop headers
            if (
              !["connection", "keep-alive", "transfer-encoding"].includes(
                key.toLowerCase(),
              )
            ) {
              headers.set(key, value);
            }
          });

          const response = new Response(viteResponse.body, {
            status: viteResponse.status,
            statusText: viteResponse.statusText,
            headers,
          });
          logResponse(
            requestId,
            response,
            startTime,
            method,
            url.pathname,
            url.search,
            "Vite Proxy",
          );
          return response;
        } catch (error) {
          logger.error(`[${requestId}] Error proxying to Vite:`, error);
          const errorResponse = new Response(
            "Error proxying to Vite dev server",
            {
              status: 502,
            },
          );
          logResponse(
            requestId,
            errorResponse,
            startTime,
            method,
            url.pathname,
            url.search,
            "Vite Proxy Error",
          );
          return errorResponse;
        }
      }

      // Production mode: Handle with React SSR

      // First, check if this route has an Isograph entrypoint that returns a redirect
      let matchedEntrypoint = null;
      for (const [routePath, entrypoint] of isographAppRoutes) {
        const match = matchRouteWithParams(url.pathname, routePath);
        if (match.match) {
          matchedEntrypoint = entrypoint;
          break;
        }
      }

      // If we have an Isograph entrypoint, check if it wants to redirect
      if (matchedEntrypoint) {
        logger.info(`[${requestId}] Checking for redirect on ${url.pathname}`);
        const { getRedirectFromEntrypoint, createServerRedirectResponse } =
          await import("./lib/redirectHandler.ts");
        const redirect = getRedirectFromEntrypoint(matchedEntrypoint);

        if (redirect) {
          const redirectResponse = createServerRedirectResponse(
            redirect.location,
          );
          logResponse(
            requestId,
            redirectResponse,
            startTime,
            method,
            url.pathname,
            url.search,
            "SSR Redirect",
          );
          return redirectResponse;
        }
      }

      const environment = {
        mode: isDev ? "development" : "production",
        port: port,
        currentPath: url.pathname,
        GOOGLE_OAUTH_CLIENT_ID: getConfigurationVariable(
          "GOOGLE_OAUTH_CLIENT_ID",
        ),
        BF_E2E_MODE: getConfigurationVariable("BF_E2E_MODE") === "true",
        BF_ENV: getConfigurationVariable("BF_ENV"),
      };

      // Create server-side Isograph environment
      const isographServerEnvironment = getIsographEnvironment(request);

      const element = (
        <ServerRenderedPage environment={environment} assetPaths={assetPaths}>
          <App
            initialPath={url.pathname}
            IS_SERVER_RENDERING
            isographServerEnvironment={isographServerEnvironment}
            mode={environment.mode}
            port={environment.port}
            currentPath={environment.currentPath}
          />
        </ServerRenderedPage>
      );

      try {
        const stream = await renderToReadableStream(element);
        const response = new Response(stream, {
          headers: { "content-type": "text/html; charset=utf-8" },
        });
        logResponse(
          requestId,
          response,
          startTime,
          method,
          url.pathname,
          url.search,
          "React SSR",
        );
        return response;
      } catch (error) {
        logger.error(`[${requestId}] Error rendering React app:`, error);
        const errorResponse = new Response("Internal Server Error", {
          status: 500,
        });
        logResponse(
          requestId,
          errorResponse,
          startTime,
          method,
          url.pathname,
          url.search,
          "React SSR Error",
        );
        return errorResponse;
      }
    }

    // In dev mode, proxy to Vite for frontend assets (but not React routes)
    if (isDev && vitePort) {
      try {
        const viteUrl =
          `http://localhost:${vitePort}${url.pathname}${url.search}`;
        const viteResponse = await fetch(viteUrl, {
          method: request.method,
          headers: request.headers,
          body: request.body,
        });

        // Create new headers to avoid immutable headers issue
        const headers = new Headers();
        viteResponse.headers.forEach((value, key) => {
          // Skip hop-by-hop headers
          if (
            !["connection", "keep-alive", "transfer-encoding"].includes(
              key.toLowerCase(),
            )
          ) {
            headers.set(key, value);
          }
        });

        const response = new Response(viteResponse.body, {
          status: viteResponse.status,
          statusText: viteResponse.statusText,
          headers,
        });
        logResponse(
          requestId,
          response,
          startTime,
          method,
          url.pathname,
          url.search,
          "Vite Asset Proxy",
        );
        return response;
      } catch (error) {
        logger.error(`[${requestId}] Error proxying to Vite:`, error);
        const errorResponse = new Response(
          "Error proxying to Vite dev server",
          {
            status: 502,
          },
        );
        logResponse(
          requestId,
          errorResponse,
          startTime,
          method,
          url.pathname,
          url.search,
          "Vite Asset Proxy Error",
        );
        return errorResponse;
      }
    }

    // Handle static assets first
    if (url.pathname.startsWith("/static/")) {
      const filePath = url.pathname.replace("/static/", "");

      try {
        const assetUrl = import.meta.resolve(`./static/${filePath}`);

        // Convert file:// URL to path for Deno.readFile
        const assetPath = new URL(assetUrl).pathname;
        const fileData = await Deno.readFile(assetPath);

        // Generate ETag from file content
        const hash = await crypto.subtle.digest("SHA-256", fileData);
        const etag = `"${
          Array.from(new Uint8Array(hash)).map((b) =>
            b.toString(16).padStart(2, "0")
          ).join("").slice(0, 16)
        }"`;

        // Check if client has the same version
        const clientETag = request.headers.get("if-none-match");
        if (clientETag === etag) {
          return new Response(null, { status: 304 });
        }

        // Determine content type
        let contentType = "application/octet-stream";
        if (filePath.endsWith(".html")) contentType = "text/html";
        else if (filePath.endsWith(".js")) {
          contentType = "application/javascript";
        } else if (filePath.endsWith(".css")) contentType = "text/css";
        else if (filePath.endsWith(".json")) contentType = "application/json";
        else if (filePath.endsWith(".svg")) contentType = "image/svg+xml";
        else if (filePath.endsWith(".png")) contentType = "image/png";
        else if (filePath.endsWith(".ico")) contentType = "image/x-icon";

        const headers = {
          "Content-Type": contentType,
          "Content-Length": fileData.length.toString(),
          "ETag": etag,
          "Cache-Control":
            filePath.includes("-") && filePath.match(/\.(js|css)$/)
              ? "public, max-age=31536000, immutable" // Long cache for hashed assets
              : "public, max-age=86400, must-revalidate", // Standard cache for other files
        };

        const response = new Response(fileData, { headers });
        logResponse(
          requestId,
          response,
          startTime,
          method,
          url.pathname,
          url.search,
          "Static Asset",
        );
        return response;
      } catch {
        logger.error(`[${requestId}] ❌ Static asset not found: ${filePath}`);
        logger.error(
          `   Resolved URL: ${import.meta.resolve(`./static/${filePath}`)}`,
        );

        // Log what's actually available in the static directory
        try {
          const staticDirUrl = import.meta.resolve("./static");
          const staticDirPath = new URL(staticDirUrl).pathname;
          const entries = [];
          for await (const entry of Deno.readDir(staticDirPath)) {
            entries.push(
              `${entry.isDirectory ? "DIR" : "FILE"}: ${entry.name}`,
            );
          }
          logger.error(`   Available in static/: ${entries.join(", ")}`);
        } catch (dirError) {
          logger.error(`   Cannot read static directory: ${dirError}`);
        }

        const notFoundResponse = new Response("Not Found", { status: 404 });
        logResponse(
          requestId,
          notFoundResponse,
          startTime,
          method,
          url.pathname,
          url.search,
          "Static Asset Not Found",
        );
        return notFoundResponse;
      }
    }

    // API routes should return 404 if not found
    if (url.pathname.startsWith("/api/")) {
      const notFoundResponse = new Response("Not Found", { status: 404 });
      logResponse(
        requestId,
        notFoundResponse,
        startTime,
        method,
        url.pathname,
        url.search,
        "API Not Found",
      );
      return notFoundResponse;
    }

    // For all other unknown routes, return 404
    const notFoundResponse = new Response("Not Found", { status: 404 });
    logResponse(
      requestId,
      notFoundResponse,
      startTime,
      method,
      url.pathname,
      url.search,
      "Route Not Found",
    );
    return notFoundResponse;
  } catch (error) {
    logger.error(`[${requestId}] Unhandled error in request handler:`, error);
    const errorResponse = new Response("Internal Server Error", {
      status: 500,
    });
    logResponse(
      requestId,
      errorResponse,
      startTime,
      method,
      url.pathname,
      url.search,
      "Unhandled Error",
    );
    return errorResponse;
  }
};

// Start the server
const server = Deno.serve({ port, hostname: "0.0.0.0" }, handler);

logger.println(`BoltFoundry.com server running at http://localhost:${port}`);
logger.println(`Mode: ${isDev ? "development" : "production"}`);
if (isDev && vitePort) {
  logger.println(
    `Proxying frontend requests to Vite at http://localhost:${vitePort}`,
  );
}

// Wait for server to finish
await server.finished;
