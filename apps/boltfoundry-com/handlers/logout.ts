import { getLogger } from "@bolt-foundry/logger";

const logger = getLogger(import.meta);

export async function handleLogoutRequest(
  _request: Request,
): Promise<Response> {
  logger.info("Processing logout request");

  // Clear authentication cookies by setting them with expired dates
  const headers = new Headers({
    "Location": "/",
    // Clear bf_access cookie
    "Set-Cookie":
      "bf_access=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT",
  });

  // Add second Set-Cookie header for bf_refresh cookie
  headers.append(
    "Set-Cookie",
    "bf_refresh=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT",
  );

  logger.info("Logout successful, clearing cookies and redirecting to /");

  // Return redirect response with cookie-clearing headers
  return new Response(null, {
    status: 302,
    headers,
  });
}
