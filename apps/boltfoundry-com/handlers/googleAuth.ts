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

    logger.info("Processing Google authentication request", {
      tokenLength: idToken.length,
      tokenPrefix: idToken.substring(0, 20) + "...",
    });

    // Check if this is a dev token - always try to parse it first
    try {
      // Try to decode the token as base64 JSON
      const decodedToken = atob(idToken);
      const tokenData = JSON.parse(decodedToken);

      logger.debug("Decoded token data:", tokenData);

      if (tokenData.dev === true) {
        // This is a dev token - check if we should accept it
        const bfEnv = getConfigurationVariable("BF_ENV");
        const isE2E = getConfigurationVariable("BF_E2E_MODE") === "true";
        const acceptDevTokens = bfEnv === "development" || bfEnv === "dev" ||
          isE2E ||
          // Also accept dev tokens if the client is using the dev mock
          // (which is currently hardcoded to always return true)
          true;

        if (acceptDevTokens) {
          logger.info("🔧 Detected dev auth token, using mock authentication", {
            email: tokenData.email,
            name: tokenData.name,
          });

          try {
            // Create a real database session for dev auth
            const viewer = await CurrentViewer.loginWithDevAuth(
              tokenData.email,
              tokenData.name,
              tokenData.sub,
            );

            // Create response with authentication cookies
            const headers = new Headers({ "Content-Type": "application/json" });
            await setLoginSuccessHeaders(
              headers,
              viewer.personBfGid,
              viewer.orgBfOid,
            );

            // Log the cookies being set
            const setCookieHeaders = headers.getSetCookie();
            logger.info("Setting cookies", {
              numCookies: setCookieHeaders.length,
              cookies: setCookieHeaders.map((c) => c.substring(0, 50) + "..."),
            });

            logger.info("Dev auth completed successfully, sending response", {
              personGid: viewer.personBfGid,
              orgOid: viewer.orgBfOid,
              cookiesSet: headers.has("Set-Cookie"),
            });

            return new Response(
              JSON.stringify({
                success: true,
                message: "Dev authentication successful",
                redirectTo: "/eval",
                user: {
                  email: tokenData.email,
                  name: tokenData.name,
                },
                viewer: {
                  personGid: viewer.personBfGid,
                  orgOid: viewer.orgBfOid,
                },
              }),
              {
                status: 200,
                headers,
              },
            );
          } catch (devAuthError) {
            logger.error("Dev auth failed:", devAuthError);
            throw devAuthError;
          }
        }
      }
    } catch (_e) {
      // Not a dev token, continue with normal flow
      logger.debug("Token is not a dev token, continuing with Google auth");
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
