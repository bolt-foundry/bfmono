import { handleTelemetryRequest } from "./handlers/telemetry.ts";
import { handleGraphQLRequest } from "./handlers/graphql.ts";
import { handleGoogleAuthRequest } from "./handlers/googleAuth.ts";
import { handleDevAuthPopupRequest } from "./handlers/devAuthPopup.ts";
import { handleLogoutRequest } from "./handlers/logout.ts";
import { getLogger } from "@bolt-foundry/logger";

const logger = getLogger(import.meta);

export interface ApiRoute {
  pattern: URLPattern;
  handler: (request: Request) => Response | Promise<Response>;
}

export function createApiRoutes(
  serverInfo: { isDev: boolean; port: number },
): Array<ApiRoute> {
  return [
    {
      pattern: new URLPattern({ pathname: "/health" }),
      handler: () => {
        const healthInfo = {
          status: "OK",
          timestamp: new Date().toISOString(),
          mode: serverInfo.isDev ? "development" : "production",
          port: serverInfo.port,
          uptime: Math.floor(performance.now() / 1000) + " seconds",
        };
        return new Response(JSON.stringify(healthInfo, null, 2), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      },
    },
    {
      pattern: new URLPattern({ pathname: "/sl" }),
      handler: async () => {
        if (!serverInfo.isDev) {
          return new Response("Not found", { status: 404 });
        }

        try {
          const command = new Deno.Command("sl", {
            args: ["web", "--json"],
            stdout: "piped",
            stderr: "piped",
          });

          const { stdout, stderr, code } = await command.output();

          if (code !== 0) {
            const errorText = new TextDecoder().decode(stderr);
            logger.error("Failed to get Sapling web info:", errorText);
            return new Response("Failed to get Sapling web info", {
              status: 500,
            });
          }

          const outputText = new TextDecoder().decode(stdout);
          const webInfo = JSON.parse(outputText);

          // Get the URL from sl web and replace localhost with hostname.codebot.local
          const hostname = Deno.hostname();
          const saplingUrl = webInfo.url.replace(
            "localhost",
            `${hostname}.codebot.local`,
          );

          return new Response(null, {
            status: 302,
            headers: {
              "Location": saplingUrl,
            },
          });
        } catch (error) {
          logger.error("Error handling /sl redirect:", error);
          return new Response("Error redirecting to Sapling web", {
            status: 500,
          });
        }
      },
    },
    {
      pattern: new URLPattern({ pathname: "/api/telemetry" }),
      handler: handleTelemetryRequest,
    },
    {
      pattern: new URLPattern({ pathname: "/graphql" }),
      handler: handleGraphQLRequest,
    },
    {
      pattern: new URLPattern({ pathname: "/api/auth/google" }),
      handler: handleGoogleAuthRequest,
    },
    {
      pattern: new URLPattern({ pathname: "/api/auth/dev-popup" }),
      handler: handleDevAuthPopupRequest,
    },
    {
      pattern: new URLPattern({ pathname: "/logout" }),
      handler: handleLogoutRequest,
    },
  ];
}
