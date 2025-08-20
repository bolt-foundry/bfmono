import { getLogger } from "@bfmono/packages/logger/logger.ts";
import type { RouteEntrypoint } from "../__generated__/builtRoutes.ts";

const logger = getLogger(import.meta);

/**
 * Checks if a RouteEntrypoint result is a redirect
 */
export function isRedirect(
  result: unknown,
): result is RouteEntrypoint & { status: 302; headers: { Location: string } } {
  return (
    result !== null &&
    typeof result === "object" &&
    "status" in result &&
    result.status === 302 &&
    "headers" in result &&
    typeof (result as Record<string, unknown>).headers === "object" &&
    (result as Record<string, unknown>).headers !== null &&
    "Location" in
      ((result as Record<string, unknown>).headers as Record<
        string,
        unknown
      >) &&
    typeof ((result as Record<string, unknown>).headers as Record<
        string,
        unknown
      >).Location === "string"
  );
}

/**
 * Handles client-side redirects by updating the browser location
 */
export function handleClientRedirect(location: string): void {
  // deno-lint-ignore no-window
  if (typeof window !== "undefined" && window.location) {
    logger.info(`Client-side redirect to: ${location}`);
    // deno-lint-ignore no-window
    window.location.replace(location);
  }
}

/**
 * Creates a server-side redirect Response
 */
export function createServerRedirectResponse(location: string): Response {
  logger.info(`Server-side redirect to: ${location}`);
  return new Response(null, {
    status: 302,
    headers: {
      Location: location,
    },
  });
}

/**
 * Attempts to get redirect information from an Isograph entrypoint
 * without requiring full query data. Returns null if not a redirect.
 */
export function getRedirectFromEntrypoint(
  entrypoint: unknown,
): { location: string } | null {
  try {
    const entrypointObj = entrypoint as Record<string, unknown>;
    const readerWithRefetchQueries = entrypointObj?.readerWithRefetchQueries as
      | Record<string, unknown>
      | undefined;
    const readerArtifact = readerWithRefetchQueries?.readerArtifact as
      | Record<string, unknown>
      | undefined;
    const resolver = readerArtifact?.resolver as
      | ((data: unknown, props: unknown) => unknown)
      | undefined;

    if (!resolver) {
      return null;
    }

    // Call resolver with minimal data to check for redirects
    // This works for redirect-only entrypoints that don't need query data
    const result = resolver(
      { data: {}, parameters: {}, startUpdate: () => {} },
      {},
    );

    if (isRedirect(result)) {
      return { location: result.headers.Location };
    }

    return null;
  } catch (error) {
    // If we can't determine redirect status, return null
    logger.debug(`Could not check redirect status:`, error);
    return null;
  }
}
