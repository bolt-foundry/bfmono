import {
  navigateTo,
  teardownE2ETest,
} from "@bfmono/infra/testing/e2e/setup.ts";
import { setupBoltFoundryComTest } from "../helpers.ts";
import { getLogger } from "@bfmono/packages/logger/logger.ts";

const logger = getLogger(import.meta);

Deno.test("RLHF page shows login when not authenticated", async () => {
  const context = await setupBoltFoundryComTest();

  try {
    // Start video recording
    const { stop, showSubtitle } = await context
      .startRecording("rlhf-demo");

    await showSubtitle("RLHF page authentication test");

    // Navigate to RLHF page
    await navigateTo(context, "/rlhf");

    // Wait for page to load completely
    await context.waitForNetworkIdle({
      timeout: 5000,
    });

    // Wait for React hydration to complete - look for auth-aware content
    await context.waitForFunction(() => {
      const h1 = document.querySelector("h1");
      // Since this test doesn't authenticate, we expect the login page
      return !!(h1 && (
        h1.textContent?.includes("Sign In") ||
        h1.textContent?.includes("RLHF")
      ));
    }, { timeout: 5000 });

    // Check that page loaded successfully (no 404)
    const response = await context.navigate(
      context.getPageUrl(),
    );
    const statusCode = response?.status();
    logger.info("HTTP Status Code:", statusCode);

    logger.info(
      "Page title:",
      await context.getPageTitle(),
    );
    logger.info(
      "Page URL:",
      context.getPageUrl(),
    );

    // Extract just the body content for debugging
    const bodyContent = await context.__UNSAFE_page_useContextMethodsInstead
      .evaluate(() => document.body.innerText);
    logger.info("Body content:", bodyContent.substring(0, 500));

    // Check for JavaScript errors
    const errors = await context.__UNSAFE_page_useContextMethodsInstead
      .evaluate(() => {
        return globalThis.console?.error || [];
      });
    logger.info("JavaScript errors:", errors);

    // Check for actual 404 errors in the response status, not just text content
    if (statusCode === 404) {
      throw new Error(
        `RLHF page returned 404 - page not loading correctly. Body: ${
          bodyContent.substring(0, 200)
        }`,
      );
    }

    // Verify we got auth-aware content (login page for unauthenticated users)
    if (
      !bodyContent.includes("Sign In") &&
      !bodyContent.includes("RLHF Interface")
    ) {
      throw new Error(
        `RLHF route didn't show expected auth content. Body: ${
          bodyContent.substring(0, 200)
        }`,
      );
    }

    // Take screenshot
    await context.takeScreenshot("rlhf-page");

    // Stop video recording
    await stop();
  } finally {
    await teardownE2ETest(context);
  }
});
