import { getConfigurationVariable } from "@bolt-foundry/get-configuration-var";
import { getLogger } from "@bolt-foundry/logger";
import { CurrentViewer } from "@bfmono/apps/bfDb/classes/CurrentViewer.ts";
import { setLoginSuccessHeaders } from "@bfmono/apps/bfDb/graphql/utils/graphqlContextUtils.ts";

const logger = getLogger(import.meta);

export async function handleGoogleAuthRequest(
  request: Request,
): Promise<Response> {
  try {
    // Only allow POST requests
    if (request.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }

    // Parse request body
    const body = await request.json();
    const { idToken } = body;

    if (!idToken || typeof idToken !== "string") {
      return new Response(
        JSON.stringify({ error: "Missing or invalid idToken" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    logger.info("Processing Google authentication request");

    // Check if this is a dev token (in dev mode or e2e mode)
    const bfEnv = getConfigurationVariable("BF_ENV");
    const isE2E = getConfigurationVariable("BF_E2E_MODE") === "true";
    if (bfEnv === "development" || bfEnv === "dev" || isE2E) {
      try {
        // Try to decode the token as base64 JSON
        const decodedToken = atob(idToken);
        const tokenData = JSON.parse(decodedToken);

        if (tokenData.dev === true) {
          logger.info("🔧 Detected dev auth token, using mock authentication", {
            email: tokenData.email,
            name: tokenData.name,
          });

          // Set mock authentication cookies for dev
          const headers = new Headers({ "Content-Type": "application/json" });
          headers.append(
            "Set-Cookie",
            `bf_access=dev-access-${tokenData.sub}; HttpOnly; SameSite=Lax; Path=/; Max-Age=900`,
          );
          headers.append(
            "Set-Cookie",
            `bf_refresh=dev-refresh-${tokenData.sub}; HttpOnly; SameSite=Lax; Path=/; Max-Age=2592000`,
          );

          return new Response(
            JSON.stringify({
              success: true,
              message: "Dev authentication successful",
              redirectTo: "/eval",
              user: {
                email: tokenData.email,
                name: tokenData.name,
              },
            }),
            {
              status: 200,
              headers,
            },
          );
        }
      } catch (_e) {
        // Not a dev token, continue with normal flow
        logger.debug("Token is not a dev token, continuing with Google auth");
      }
    }

    // Use the existing CurrentViewer.loginWithGoogleToken method
    // This handles Google token verification, user creation, and returns authenticated viewer
    const viewer = await CurrentViewer.loginWithGoogleToken(idToken);

    // If we get here, authentication was successful (loginWithGoogleToken throws on failure)
    logger.info("Google authentication successful", {
      personGid: viewer.personBfGid,
      orgOid: viewer.orgBfOid,
    });

    // Set authentication cookies using the existing utility
    const headers = new Headers({ "Content-Type": "application/json" });
    await setLoginSuccessHeaders(headers, viewer.personBfGid, viewer.orgBfOid);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Authentication successful",
        redirectTo: "/eval", // Redirect to eval page after successful login
      }),
      {
        status: 200,
        headers,
      },
    );
  } catch (error) {
    logger.error("Google authentication error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}
