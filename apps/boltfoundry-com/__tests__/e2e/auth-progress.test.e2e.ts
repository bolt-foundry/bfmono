#!/usr/bin/env -S bff e2e

import {
  navigateTo,
  teardownE2ETest,
} from "@bfmono/infra/testing/e2e/setup.ts";
import { setupBoltFoundryComTest } from "../helpers.ts";
import { getLogger } from "@bfmono/packages/logger/logger.ts";

const logger = getLogger(import.meta);

Deno.test("🎬 Frontend Authentication Implementation Progress", async (t) => {
  const context = await setupBoltFoundryComTest();

  try {
    // Mock Google OAuth before any navigation
    await context.__UNSAFE_page_useContextMethodsInstead.setRequestInterception(
      true,
    );
    context.__UNSAFE_page_useContextMethodsInstead.on("request", (req) => {
      const url = req.url();

      // Block the real Google Identity Services JS and replace with mock
      if (url.startsWith("https://accounts.google.com/gsi/client")) {
        return req.respond({
          status: 200,
          contentType: "text/javascript",
          body: "", // empty stub - we'll inject our own mock
        });
      }

      // Mock Google's tokeninfo endpoint for backend authentication
      if (url.startsWith("https://oauth2.googleapis.com/tokeninfo")) {
        return req.respond({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            email: "demo@example.com",
            email_verified: true,
            sub: "123456789",
            hd: "example.com",
            name: "Demo User",
          }),
        });
      }

      // Don't mock the backend - let it handle the mock token
      req.continue();
    });

    // Inject complete Google OAuth mock
    await context.__UNSAFE_page_useContextMethodsInstead.evaluateOnNewDocument(
      () => {
        let interceptedCallback:
          | ((response: { credential: string; select_by: string }) => void)
          | undefined;

        // Mock the entire google.accounts.id API
        (globalThis as { google?: unknown }).google = {
          accounts: {
            id: {
              initialize(
                { callback }: {
                  callback: (
                    response: { credential: string; select_by: string },
                  ) => void;
                },
              ) {
                interceptedCallback = callback;
              },
              renderButton(el: HTMLElement) {
                el.innerHTML =
                  '<button id="mock-google-signin" style="padding: 12px 24px; border: 1px solid #dadce0; border-radius: 4px; background: white; cursor: pointer; font-size: 16px; font-weight: 500; font-family: system-ui, -apple-system, sans-serif; color: #3c4043; min-width: 200px; display: flex; align-items: center; justify-content: center; gap: 8px;">🔧 Mock Google Sign‑In</button>';
                el.querySelector("button")?.addEventListener("click", () => {
                  // Simulate successful Google OAuth response
                  interceptedCallback?.({
                    credential: "mock.jwt.token.for.testing",
                    select_by: "btn",
                  });
                });
              },
              // No-op helpers
              prompt() {},
              disableAutoSelect() {},
            },
          },
        };
      },
    );

    // 🎬 Start video recording for the entire authentication progress demo
    const { stop, showSubtitle } = await context
      .startRecording("auth-implementation-progress");

    await showSubtitle("Frontend Authentication Implementation Progress Demo");

    await t.step(
      "📍 Step 1: Test protected route access without authentication",
      async () => {
        logger.info("📝 Testing access to /rlhf without authentication");
        await navigateTo(context, "/rlhf");
        await context.waitForNetworkIdle({ timeout: 3000 });

        const currentUrl = context.getPageUrl();
        const wasRedirectedToLogin = currentUrl.includes("/login");
        const stayedOnProtectedRoute = currentUrl.includes("/rlhf");

        if (wasRedirectedToLogin) {
          logger.info(
            "✅ Protected route redirects unauthenticated users to login",
          );
        } else if (stayedOnProtectedRoute) {
          logger.info("❌ Can access protected route without authentication");
          logger.info("   📋 TODO: Add route protection middleware");
        } else {
          logger.info("❌ Unexpected redirect behavior");
          logger.info(`   Current URL: ${currentUrl}`);
        }

        await context.takeScreenshot("step1-unauthenticated-route-access");
      },
    );

    await t.step("📍 Step 2: Check if /login route exists", async () => {
      await navigateTo(context, "/login");
      await context.waitForNetworkIdle({ timeout: 3000 });

      const pageContent = await context.__UNSAFE_page_useContextMethodsInstead
        .content();
      const hasError = pageContent.includes("404") ||
        pageContent.includes("not found");

      if (hasError) {
        logger.info("❌ /login route doesn't exist yet");
        logger.info("   📋 TODO: Create login page route");
      } else {
        logger.info("✅ /login route exists");
      }

      await context.takeScreenshot("step2-login-route");
    });

    await t.step("🔍 Step 3: Look for Google Sign-In button", async () => {
      // Try to stay on login page, or go to home if login failed
      const currentUrl = context.url();
      if (currentUrl.includes("404") || !currentUrl.includes("login")) {
        logger.info("📝 Checking home page since /login not available");
        await navigateTo(context, "/");
        await context.waitForNetworkIdle({ timeout: 3000 });
      }

      const pageText = await context.__UNSAFE_page_useContextMethodsInstead
        .evaluate(() => document.body.innerText.toLowerCase());
      const hasGoogleText = pageText.includes("google") ||
        pageText.includes("sign in");

      if (hasGoogleText) {
        logger.info("✅ Found Google/sign-in text on page");

        // Try to click the Google Sign-In button
        try {
          logger.info("🔧 Attempting to smooth click Google Sign-In button...");
          await context.__UNSAFE_page_useContextMethodsInstead.waitForSelector(
            "button",
            { timeout: 2000 },
          );

          // Smooth click the first button (should be our Google Sign-In button)
          await context.takeScreenshot("before-google-click");
          await context.click("button");
          await context.takeScreenshot("after-google-click");
          logger.info("✅ Successfully smooth clicked Google Sign-In button");

          // Wait a moment to see the authentication response
          await new Promise((resolve) => setTimeout(resolve, 1000));

          // Check if login was successful or if we got an error
          const currentUrl = context.getPageUrl();
          logger.info(`📍 Current URL after login attempt: ${currentUrl}`);

          // Verify authentication by checking cookies
          const cookies = await context.__UNSAFE_page_useContextMethodsInstead
            .cookies();
          const authCookies = cookies.filter((cookie) =>
            cookie.name === "bf_access" || cookie.name === "bf_refresh"
          );

          if (authCookies.length > 0) {
            logger.info(
              `✅ Authentication cookies found: ${
                authCookies.map((c) => c.name).join(", ")
              }`,
            );
          } else {
            logger.info("❌ No authentication cookies found");
          }

          // Check if page content indicates we're logged in
          const pageContentAfterAuth = await context
            .__UNSAFE_page_useContextMethodsInstead.evaluate(() =>
              document.body.innerText.toLowerCase()
            );

          const loggedInIndicators = [
            "welcome back",
            "signed in",
            "logout",
            "dashboard",
          ];

          const hasLoggedInContent = loggedInIndicators.some((indicator) =>
            pageContentAfterAuth.includes(indicator)
          );

          if (hasLoggedInContent) {
            logger.info("✅ Page shows logged-in content");
          } else {
            logger.info("❌ No logged-in indicators on page");
          }
        } catch (error) {
          logger.info(
            `❌ Failed to click Google Sign-In button: ${
              (error as Error).message
            }`,
          );
          logger.info("   📋 TODO: Implement /api/auth/google endpoint");
        }
      } else {
        logger.info("❌ No Google sign-in elements found");
        logger.info("   📋 TODO: Add Google Sign-In button component");
      }

      await context.takeScreenshot("step3-google-button");
    });

    await t.step(
      "🔐 Step 4: Test protected route access after authentication",
      async () => {
        logger.info("📝 Testing access to /rlhf after authentication");
        await navigateTo(context, "/rlhf");
        await context.waitForNetworkIdle({ timeout: 3000 });

        const currentUrl = context.getPageUrl();
        const stayedOnProtectedRoute = currentUrl.includes("/rlhf");
        const wasRedirectedToLogin = currentUrl.includes("/login");

        if (stayedOnProtectedRoute) {
          logger.info("✅ Can access protected route after authentication");
        } else if (wasRedirectedToLogin) {
          logger.info(
            "❌ Still redirected to login - authentication may not be working",
          );
          logger.info("   📋 TODO: Fix authentication persistence");
        } else {
          logger.info("❌ Unexpected redirect behavior");
          logger.info(`   Current URL: ${currentUrl}`);
        }

        await context.takeScreenshot("step4-protected-route");
      },
    );

    await t.step("📊 Step 5: Implementation Progress Summary", async () => {
      logger.info("=".repeat(50));
      logger.info("🎯 AUTHENTICATION IMPLEMENTATION PROGRESS");
      logger.info("=".repeat(50));

      const checklist = [
        { item: "Login page route (/login)", done: false },
        { item: "Google Sign-In button", done: false },
        { item: "Protected route guards", done: false },
        { item: "Authentication context", done: false },
        { item: "Session management", done: false },
      ];

      checklist.forEach(({ item, done }) => {
        const status = done ? "✅" : "❌";
        logger.info(`${status} ${item}`);
      });

      logger.info("=".repeat(50));
      logger.info("🎬 Perfect for screencast - shows clear progress!");

      await context.takeScreenshot("step5-progress-summary");
    });

    // 🎬 Stop recording and get the video file
    const videoResult = await stop();
    if (videoResult) {
      logger.info("🎬 Screencast recorded successfully!");
      logger.info(`   📹 Video: ${videoResult.videoPath}`);
      logger.info(`   📊 Duration: ${videoResult.duration}s`);
      logger.info(`   📏 Frames: ${videoResult.frameCount}`);
      logger.info(`   📏 Size: ${videoResult.fileSize} bytes`);
    }
  } finally {
    await teardownE2ETest(context);
  }
});
