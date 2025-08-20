import { assert, assertEquals } from "@std/assert";
import {
  navigateTo,
  teardownE2ETest,
} from "@bfmono/infra/testing/e2e/setup.ts";
import { getLogger } from "@bfmono/packages/logger/logger.ts";
import { setupBoltFoundryComTest } from "../helpers.ts";

const logger = getLogger(import.meta);

Deno.test("UI route renders UIDemo component correctly", async () => {
  const context = await setupBoltFoundryComTest();

  try {
    // Start video recording
    const { stop, showSubtitle } = await context
      .startRecording("ui-route-demo");

    await showSubtitle("UI route rendering test");

    // Navigate to the /ui route
    await navigateTo(context, "/ui");

    // Wait for content to ensure page loaded
    const title = await context.title();
    logger.info(`UI page title: ${title}`);

    // Check the current URL
    const currentUrl = context.url();
    logger.info(`Current URL: ${currentUrl}`);

    // Check the environment and routing state
    const routingInfo = await context.__UNSAFE_page_useContextMethodsInstead
      .evaluate(() => {
        return {
          pathname: globalThis.location.pathname,
          // @ts-expect-error - Accessing global variable
          environment: globalThis.__ENVIRONMENT__,
          // @ts-expect-error - Accessing global variable
          hasRehydrate: typeof globalThis.__REHYDRATE__ !== "undefined",
        };
      });
    logger.info(`Routing info: ${JSON.stringify(routingInfo, null, 2)}`);

    // Wait a bit for hydration to complete
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Verify the page title is correct
    assertEquals(title, "Bolt Foundry", "Page title should be 'Bolt Foundry'");

    // Check if the page contains expected UIDemo content
    const bodyText = await context.__UNSAFE_page_useContextMethodsInstead
      .evaluate(() => document.body.textContent);

    // Verify UIDemo-specific content is present
    assert(
      bodyText?.includes("BfDs Demo"),
      "Page should contain 'BfDs Demo' heading",
    );

    assert(
      bodyText?.includes(
        "Interactive examples of BfDs design system components",
      ),
      "Page should contain UIDemo description",
    );

    assert(
      bodyText?.includes("Button") && bodyText?.includes("Examples"),
      "Page should contain component examples",
    );

    assert(
      bodyText?.includes("Primary"),
      "Page should contain Primary button example",
    );

    assert(
      bodyText?.includes("Secondary"),
      "Page should contain Secondary button example",
    );

    // Take a screenshot to show what the UI route looks like
    await context.takeScreenshot("ui-route-current-state");

    logger.info("UI route test completed successfully");

    // Stop video recording
    const videoResult = await stop();
    if (videoResult) {
      logger.info(`Video saved to: ${videoResult.videoPath}`);
    } else {
      logger.error("Video recording failed: No result returned");
    }
  } catch (error) {
    await context.takeScreenshot("ui-route-test-error");
    logger.error("UI route test failed:", error);
    throw error;
  } finally {
    await teardownE2ETest(context);
  }
});
