import { getLogger } from "@bolt-foundry/logger";
import { clearAuthCookies } from "@bfmono/apps/bfDb/graphql/utils/graphqlContextUtils.ts";

const logger = getLogger(import.meta);

export function handleLogoutRequest(
  _request: Request,
): Response {
  logger.info("Processing logout request");

  // Clear authentication cookies using the utility function
  const headers = new Headers({
    "Location": "/",
  });

  clearAuthCookies(headers);

  logger.info("Logout successful, clearing cookies and redirecting to /");

  // Return redirect response with cookie-clearing headers
  return new Response(null, {
    status: 302,
    headers,
  });
}
