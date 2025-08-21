import { ensureDir } from "@std/fs";
import { join } from "@std/path";
import { getLogger } from "@bfmono/packages/logger/logger.ts";
import type { Cookie, Page } from "puppeteer-core";

const logger = getLogger(import.meta);

const AUTH_STATE_DIR = "/internalbf/bfmono/tmp/e2e-auth-state";
const AUTH_STATE_FILE = "boltfoundry-com-cookies.json";

interface AuthState {
  cookies: Array<Cookie>;
  timestamp: number;
  url: string;
}

/**
 * Save authentication state (cookies) to disk for reuse in future tests
 */
export async function saveAuthState(
  page: Page,
  name: string = "default",
): Promise<void> {
  try {
    await ensureDir(AUTH_STATE_DIR);

    const cookies = await page.cookies();
    const authState: AuthState = {
      cookies,
      timestamp: Date.now(),
      url: page.url(),
    };

    const filePath = join(AUTH_STATE_DIR, `${name}-${AUTH_STATE_FILE}`);
    await Deno.writeTextFile(filePath, JSON.stringify(authState, null, 2));

    logger.info(`Saved auth state to ${filePath}`, {
      cookieCount: cookies.length,
      url: page.url(),
    });
  } catch (error) {
    logger.error("Failed to save auth state:", error);
    throw error;
  }
}

/**
 * Load and restore authentication state (cookies) from disk
 * Returns true if auth state was successfully loaded, false otherwise
 */
export async function loadAuthState(
  page: Page,
  name: string = "default",
  maxAgeHours: number = 24,
): Promise<boolean> {
  try {
    const filePath = join(AUTH_STATE_DIR, `${name}-${AUTH_STATE_FILE}`);

    let authStateText: string;
    try {
      authStateText = await Deno.readTextFile(filePath);
    } catch (error) {
      if (error instanceof Deno.errors.NotFound) {
        logger.debug(`No saved auth state found at ${filePath}`);
        return false;
      }
      throw error;
    }

    const authState: AuthState = JSON.parse(authStateText);

    // Check if auth state is too old
    const ageHours = (Date.now() - authState.timestamp) / (1000 * 60 * 60);
    if (ageHours > maxAgeHours) {
      logger.debug(`Auth state is too old (${ageHours.toFixed(1)}h), ignoring`);
      return false;
    }

    // Check if any cookies are expired
    const now = Date.now() / 1000;
    const validCookies = authState.cookies.filter((cookie) => {
      // If no expires timestamp, cookie is session-based and still valid
      if (cookie.expires === undefined || cookie.expires === -1) {
        return true;
      }
      return cookie.expires > now;
    });

    if (validCookies.length === 0) {
      logger.debug("All saved cookies are expired");
      return false;
    }

    // Navigate to the same domain first to set cookies properly
    const url = new URL(authState.url);
    const baseUrl = `${url.protocol}//${url.host}`;
    await page.goto(baseUrl);

    // Set the cookies
    await page.setCookie(...validCookies);

    logger.info(`Loaded auth state from ${filePath}`, {
      totalCookies: authState.cookies.length,
      validCookies: validCookies.length,
      ageHours: ageHours.toFixed(1),
      url: baseUrl,
    });

    return true;
  } catch (error) {
    logger.error("Failed to load auth state:", error);
    return false;
  }
}

/**
 * Clear saved authentication state
 */
export async function clearAuthState(name: string = "default"): Promise<void> {
  try {
    const filePath = join(AUTH_STATE_DIR, `${name}-${AUTH_STATE_FILE}`);
    await Deno.remove(filePath);
    logger.info(`Cleared auth state: ${filePath}`);
  } catch (error) {
    if (error instanceof Deno.errors.NotFound) {
      logger.debug("No auth state to clear");
    } else {
      logger.error("Failed to clear auth state:", error);
      throw error;
    }
  }
}

/**
 * Create a mock dev authentication state for testing
 * This bypasses the login flow by creating a dev-access cookie
 */
export async function createMockAuthState(
  page: Page,
  name: string = "default",
  userId: string = "test-user-123",
): Promise<boolean> {
  try {
    // Get current URL (should already be on a proper page)
    const currentUrl = page.url();
    const url = new URL(currentUrl);

    // Create dev authentication cookie
    const devCookie: Cookie = {
      name: `dev-access-${userId}`,
      value: "mock-dev-token",
      domain: url.hostname,
      path: "/",
      httpOnly: true,
      secure: url.protocol === "https:",
      sameSite: "Lax",
      expires: -1, // Session cookie
      size: 0, // Will be calculated by browser
      session: true,
    };

    // Set the cookie
    await page.setCookie(devCookie);

    // Save this state for future use
    await saveAuthState(page, name);

    logger.info(`Created mock auth state for user ${userId}`, {
      cookieName: devCookie.name,
      domain: devCookie.domain,
    });

    return true;
  } catch (error) {
    logger.error("Failed to create mock auth state:", error);
    return false;
  }
}

/**
 * Check if user appears to be authenticated by looking for auth-related cookies
 */
export async function isAuthenticated(page: Page): Promise<boolean> {
  try {
    const cookies = await page.cookies();

    // Look for cookies that suggest authentication
    const authCookieNames = [
      "dev-access", // Dev authentication cookie
      "access_token",
      "auth_token",
      "session_id",
      "bf_session",
    ];

    const hasAuthCookie = cookies.some((cookie) =>
      authCookieNames.some((authName) =>
        cookie.name.includes(authName) ||
        cookie.name.toLowerCase().includes("auth")
      )
    );

    if (hasAuthCookie) {
      logger.debug("Authentication cookies found", {
        cookieNames: cookies.map((c) => c.name).filter((name) =>
          authCookieNames.some((authName) =>
            name.includes(authName) || name.toLowerCase().includes("auth")
          )
        ),
      });
    }

    return hasAuthCookie;
  } catch (error) {
    logger.error("Failed to check authentication status:", error);
    return false;
  }
}
