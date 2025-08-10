#!/usr/bin/env -S deno run --allow-net --allow-read --allow-write

import { getLogger } from "@bolt-foundry/logger";

const logger = getLogger(import.meta);

// Load wildcard certificate from shared folder
const certPath = "/internalbf/bfmono/shared/certs/codebot-wildcard.pem";
const keyPath = "/internalbf/bfmono/shared/certs/codebot-wildcard-key.pem";

// Known backend routes from boltfoundry-com
const backendRoutes = new Set([
  // App routes
  "/",
  "/login",
  "/rlhf",
  "/eval",
  "/plinko",
  "/ui",
  // API routes
  "/health",
  "/api/telemetry",
  "/graphql",
  "/api/auth/google",
  "/api/auth/dev-popup",
]);

const backendPatterns = [
  /^\/ui\/.*/, // /ui/* routes
  /^\/static\/.*/, // Static assets served by backend
];

function shouldRouteToBackend(pathname: string): boolean {
  // Check exact routes
  if (backendRoutes.has(pathname)) return true;

  // Check patterns
  for (const pattern of backendPatterns) {
    if (pattern.test(pathname)) return true;
  }

  return false;
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
        const targetPort = shouldRouteToBackend(url.pathname) ? 8000 : 8080;

        logger.info(
          `HTTPS ${req.method} ${url.pathname} → localhost:${targetPort}`,
        );

        // Proxy to the appropriate service
        const targetUrl = new URL(url);
        targetUrl.protocol = "http:";
        targetUrl.hostname = "localhost";
        targetUrl.port = String(targetPort);

        try {
          const response = await fetch(targetUrl, {
            method: req.method,
            headers: req.headers,
            body: req.body,
          });

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
