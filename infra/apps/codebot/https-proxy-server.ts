#!/usr/bin/env -S deno run --allow-net --allow-read --allow-write

import { getLogger } from "@bolt-foundry/logger";

const logger = getLogger(import.meta);

// Load wildcard certificate from shared folder
const certPath = "/internalbf/bfmono/shared/certs/codebot-wildcard.pem";
const keyPath = "/internalbf/bfmono/shared/certs/codebot-wildcard-key.pem";

// Alternative: Try backend first, fallback to Vite on 404
async function tryBackendFirst(req: Request): Promise<Response | null> {
  const url = new URL(req.url);
  const targetUrl = new URL(url);
  targetUrl.protocol = "http:";
  targetUrl.hostname = "localhost";
  targetUrl.port = "8000";

  try {
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: req.headers,
      body: req.body,
      // Don't follow redirects automatically so we can preserve them
      redirect: "manual",
    });

    // If backend handles it (not a 404), use that response
    if (response.status !== 404) {
      return response;
    }
  } catch (error) {
    logger.debug(`Backend request failed, will try Vite: ${error}`);
  }

  return null;
}

async function startHTTPSProxy() {
  try {
    // Check if certificate files exist
    try {
      await Deno.stat(certPath);
      await Deno.stat(keyPath);
    } catch (error) {
      logger.error("Certificate files not found:", error);
      logger.error(`Expected cert at: ${certPath}`);
      logger.error(`Expected key at: ${keyPath}`);
      logger.error("Please run certificate generation first");
      Deno.exit(1);
    }

    // Read certificate and key
    const cert = await Deno.readTextFile(certPath);
    const key = await Deno.readTextFile(keyPath);

    logger.info("Starting HTTPS proxy server on port 443...");

    // HTTPS proxy server
    const httpsServer = Deno.serve({
      port: 443,
      cert,
      key,
      hostname: "0.0.0.0",
      handler: async (req) => {
        const url = new URL(req.url);

        // Handle WebSocket upgrade for Vite HMR
        if (
          url.pathname === "/vite-hmr" &&
          req.headers.get("upgrade") === "websocket"
        ) {
          logger.info(`WebSocket upgrade request for Vite HMR`);

          // Forward WebSocket to Vite directly
          const viteWsUrl = new URL(url);
          viteWsUrl.protocol = "ws:";
          viteWsUrl.hostname = "localhost";
          viteWsUrl.port = "8080";

          // Note: Deno doesn't have native WebSocket proxy support
          // We'll need to handle this differently or use Vite's built-in proxy
          // For now, let Vite handle it through its own WebSocket server
        }

        // Smart routing: Try backend first for non-asset paths
        // This eliminates the need to maintain a hardcoded route list
        const isLikelyAsset = url.pathname.includes(".") &&
          !url.pathname.endsWith(".html") &&
          !url.pathname.startsWith("/api") &&
          !url.pathname.startsWith("/vite-hmr");

        let response: Response | null = null;

        if (!isLikelyAsset) {
          // Try backend first for routes that might be handled there
          response = await tryBackendFirst(req.clone());

          if (response) {
            logger.info(
              `HTTPS ${req.method} ${url.pathname} → backend:8000 (${response.status})`,
            );

            // Create new headers to avoid immutable headers issue
            const headers = new Headers();
            response.headers.forEach((value, key) => {
              // Skip hop-by-hop headers
              if (
                !["connection", "keep-alive", "transfer-encoding"].includes(
                  key.toLowerCase(),
                )
              ) {
                headers.set(key, value);
              }
            });

            return new Response(response.body, {
              status: response.status,
              statusText: response.statusText,
              headers,
            });
          }
        }

        // Fallback to Vite for assets and unhandled routes
        logger.info(
          `HTTPS ${req.method} ${url.pathname} → vite:8080`,
        );

        const viteUrl = new URL(url);
        viteUrl.protocol = "http:";
        viteUrl.hostname = "localhost";
        viteUrl.port = "8080";

        try {
          const viteResponse = await fetch(viteUrl, {
            method: req.method,
            headers: req.headers,
            body: req.body,
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

          return new Response(viteResponse.body, {
            status: viteResponse.status,
            statusText: viteResponse.statusText,
            headers,
          });
        } catch (error) {
          logger.error(`Failed to proxy request: ${error}`);
          return new Response("Bad Gateway", { status: 502 });
        }
      },
      onListen: ({ hostname, port }) => {
        logger.info(`HTTPS server listening on https://${hostname}:${port}`);
      },
    });

    logger.info("Starting HTTP redirect server on port 80...");

    // HTTP redirect server
    const httpServer = Deno.serve({
      port: 80,
      hostname: "0.0.0.0",
      handler: (req) => {
        const url = new URL(req.url);
        const httpsUrl = `https://${url.host}${url.pathname}${url.search}`;

        logger.info(
          `HTTP ${req.method} ${url.pathname} → redirect to ${httpsUrl}`,
        );

        return Response.redirect(httpsUrl, 301);
      },
      onListen: ({ hostname, port }) => {
        logger.info(
          `HTTP redirect server listening on http://${hostname}:${port}`,
        );
      },
    });

    // Wait for both servers
    await Promise.all([httpsServer.finished, httpServer.finished]);
  } catch (error) {
    logger.error("Failed to start proxy server:", error);
    Deno.exit(1);
  }
}

// Handle graceful shutdown
const shutdown = () => {
  logger.info("Shutting down proxy servers...");
  Deno.exit(0);
};

Deno.addSignalListener("SIGINT", shutdown);
Deno.addSignalListener("SIGTERM", shutdown);

// Start the proxy
await startHTTPSProxy();
