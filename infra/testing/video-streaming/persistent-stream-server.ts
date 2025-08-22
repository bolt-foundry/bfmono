#!/usr/bin/env -S deno run --allow-net --allow-read --allow-env

import { getLogger } from "@bfmono/packages/logger/logger.ts";
import { getStreamServer } from "./simple-stream-server.ts";

const logger = getLogger(import.meta);

// Standalone streaming server that stays open
async function main() {
  const port = parseInt(Deno.env.get("BF_STREAM_PORT") || "8080");

  const server = Deno.serve({ port }, async (req) => {
    const url = new URL(req.url);

    if (url.pathname === "/e2e-stream") {
      return getStreamServer().handleStreamRequest(req);
    }

    if (url.pathname === "/e2e-viewer") {
      return getStreamServer().handleViewerRequest();
    }

    if (url.pathname === "/stream-frame" && req.method === "POST") {
      try {
        const { frame } = await req.json();
        const binary = atob(frame);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
          bytes[i] = binary.charCodeAt(i);
        }
        getStreamServer().broadcastFrame(bytes);
        return new Response("OK");
      } catch {
        return new Response("Error", { status: 400 });
      }
    }

    if (url.pathname === "/status") {
      return Response.json({
        clients: getStreamServer().getClientCount(),
        uptime: Date.now(),
        streaming: "ready",
      });
    }

    return new Response(
      "E2E Stream Server\n\nRoutes:\n- /e2e-viewer - Watch streams\n- /e2e-stream - SSE endpoint\n- /stream-frame - POST frames\n- /status - Server status",
      {
        headers: { "content-type": "text/plain" },
      },
    );
  });

  logger.info(`🎥 E2E Stream Server running at http://localhost:${port}`);
  logger.info(`📺 View streams at: http://localhost:${port}/e2e-viewer`);
  logger.info(`📊 Server status: http://localhost:${port}/status`);
  logger.info("Set BF_E2E_STREAM=true in your tests to start streaming");

  // Keep server running
  await server.finished;
}

if (import.meta.main) {
  main().catch(console.error);
}
