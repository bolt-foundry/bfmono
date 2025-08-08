import { assert } from "@std/assert";
import {
  navigateTo,
  teardownE2ETest,
} from "@bfmono/infra/testing/e2e/setup.ts";
import { smoothClick } from "@bfmono/infra/testing/video-recording/smooth-ui.ts";
import { setupBoltFoundryComTest } from "../helpers.ts";
import { getLogger } from "@bfmono/packages/logger/logger.ts";

const logger = getLogger(import.meta);

Deno.test("Eval page functionality", async (t) => {
  const context = await setupBoltFoundryComTest();

  try {
    // Start video recording
    const { stop, showSubtitle } = await context.startAnnotatedVideoRecording(
      "eval-page-test",
    );

    await showSubtitle("🧪 Eval Page Test - Homepage to Login");

    await t.step("Navigate to homepage and click login", async () => {
      // Navigate to homepage
      logger.debug("Navigating to homepage...");
      await navigateTo(context, "/");
      await context.page.waitForNetworkIdle({ timeout: 3000 });

      // Verify homepage loaded
      const pageContent = await context.page.evaluate(() =>
        document.body.textContent
      );
      assert(
        pageContent?.includes("Bolt Foundry"),
        "Homepage should load with Bolt Foundry content",
      );

      // Take screenshot of homepage
      await context.takeScreenshot("eval-test-homepage");
      await showSubtitle("✅ Homepage loaded successfully");

      // Find and smooth click the login link
      logger.debug("Looking for login link...");

      // Wait for the login link to be visible
      await context.page.waitForSelector('a[href="/login"]', {
        visible: true,
        timeout: 5000,
      });

      await showSubtitle("👆 Clicking login link...");

      // Smooth click on login
      logger.debug("Clicking login link with smooth animation...");
      await smoothClick(context, 'a[href="/login"]', {
        before: "eval-test-before-login-click",
        after: "eval-test-after-login-click",
      });

      // Wait a bit for navigation to start
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Verify we're on the login page
      const currentUrl = context.page.url();
      assert(
        currentUrl.includes("/login"),
        `Should be on login page, but URL is ${currentUrl}`,
      );

      const loginPageContent = await context.page.evaluate(() =>
        document.body.textContent
      );
      assert(
        loginPageContent?.includes("Sign In"),
        "Login page should display Sign In text",
      );

      logger.debug("Successfully navigated to login page");
      await context.takeScreenshot("eval-test-login-page");

      await showSubtitle("🎉 Successfully navigated to login page!");
    });

    await t.step("Click Google login button", async () => {
      logger.debug("Waiting for Google Sign-In button to be ready...");

      // Wait for the Google button to be rendered
      await context.page.waitForSelector("#google-signin-button", {
        visible: true,
        timeout: 5000,
      });

      await showSubtitle("🔐 Clicking Google Sign-In...");

      // Smooth click the Google Sign-In button
      await smoothClick(context, "#google-signin-button", {
        before: "eval-test-before-google-signin",
        after: "eval-test-after-google-signin",
      });

      // Wait for authentication to process
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Check if we were redirected or if there's an auth cookie
      const currentUrl = context.page.url();
      logger.debug(`Current URL after auth: ${currentUrl}`);

      const cookies = await context.page.cookies();
      const authCookies = cookies.filter((cookie) =>
        cookie.name === "bf_access" || cookie.name === "bf_refresh"
      );

      if (authCookies.length > 0) {
        logger.debug(
          `✅ Auth cookies found: ${authCookies.map((c) => c.name).join(", ")}`,
        );
        await showSubtitle("🍪 Authentication successful!");
      } else {
        logger.debug("❌ No auth cookies found after Google sign-in");
      }

      // Verify we were redirected to /eval
      assert(
        currentUrl.includes("/eval"),
        `Should be redirected to /eval after authentication, but was redirected to ${currentUrl}`,
      );

      await context.takeScreenshot("eval-test-after-auth");
    });

    // TODO: Add more test steps for eval functionality

    // Stop video recording
    const videoResult = await stop();
    if (videoResult) {
      logger.debug(`🎬 Video saved: ${videoResult.videoPath}`);
      logger.debug(`📏 Duration: ${videoResult.duration}s`);
    }
  } finally {
    await teardownE2ETest(context);
  }
});
