import { handleTelemetryRequest } from "./handlers/telemetry.ts";
import { handleGraphQLRequest } from "./handlers/graphql.ts";
import { handleGoogleAuthRequest } from "./handlers/googleAuth.ts";
import { handleDevAuthPopupRequest } from "./handlers/devAuthPopup.ts";

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
  ];
}
