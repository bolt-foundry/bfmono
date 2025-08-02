import { getConfigurationVariable } from "@bolt-foundry/get-configuration-var";
import { getLogger } from "@bfmono/packages/logger/logger.ts";

const logger = getLogger(import.meta);

// Global app state
let appProcess: Deno.ChildProcess | null = null;

async function checkAppHealth(): Promise<boolean> {
  try {
    const response = await fetch("http://localhost:8000", {
      signal: AbortSignal.timeout(1000),
    });
    return response.ok;
  } catch {
    return false;
  }
}

export function startContainerBridge(port = 8017) {
  const server = Deno.serve({ port }, async (req) => {
    const url = new URL(req.url);
    const workspaceId = getConfigurationVariable("WORKSPACE_ID") || "unknown";

    if (url.pathname === "/status" && req.method === "GET") {
      const appHealthy = await checkAppHealth();
      const appStatus = appProcess
        ? (await appProcess.status).success === false
          ? "crashed"
          : appHealthy
          ? "running"
          : "starting"
        : "not started";

      return Response.json({
        ready: true,
        services: {
          "boltfoundry-com": {
            status: appStatus,
            healthy: appHealthy,
            url: `http://${workspaceId}.codebot.local:8000`,
          },
        },
        workspaceId,
      });
    }

    if (url.pathname === "/ping" && req.method === "GET") {
      // Ping the host to verify connectivity
      try {
        const hostResponse = await fetch("http://host.codebot.local:8017/pong");
        const hostData = await hostResponse.json();

        return Response.json({
          pong: true,
          timestamp: new Date().toISOString(),
          workspaceId,
          hostPong: hostData,
        });
      } catch (error) {
        return Response.json({
          pong: true,
          timestamp: new Date().toISOString(),
          workspaceId,
          hostError: error instanceof Error ? error.message : String(error),
        });
      }
    }

    return new Response("Not Found", { status: 404 });
  });

  logger.debug(`🌉 Container bridge started on port ${port}`);
  return server;
}

// Container entrypoint script
if (import.meta.main) {
  const bridge = startContainerBridge();

  // Start the app
  appProcess = new Deno.Command("bft", {
    args: ["dev", "boltfoundry-com"],
  }).spawn();

  // Wait for app to be ready
  let ready = false;
  for (let i = 0; i < 30; i++) {
    if (await checkAppHealth()) {
      ready = true;
      break;
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  if (ready) {
    // Tell host to open browser
    const workspaceId = getConfigurationVariable("WORKSPACE_ID") || "unknown";
    await fetch("http://host.codebot.local:8017/browser/open", {
      method: "POST",
      body: JSON.stringify({
        url: `http://${workspaceId}.codebot.local:8000`,
      }),
    });
  } else {
    logger.error("App failed to start after 30 seconds");
  }

  // Keep bridge running
  await bridge.finished;
}
