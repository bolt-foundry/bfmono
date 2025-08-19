import { assert, assertEquals } from "@std/assert";
import {
  setupE2ETest,
  teardownE2ETest,
} from "@bfmono/infra/testing/e2e/setup.ts";
import { getLogger } from "@bfmono/packages/logger/logger.ts";
// Using context.hover() instead of importing smoothHover

const logger = getLogger(import.meta);

Deno.test.ignore("Video recording proof of concept", async () => {
  const context = await setupE2ETest({
    baseUrl: "https://example.com",
  });

  try {
    // Start video recording
    const { stop, showSubtitle } = await context
      .startRecording("poc-test");

    // Navigate to a simple page
    await context.navigateTo("/");

    // Show initial subtitle
    await showSubtitle("Video recording proof of concept test");
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Take a screenshot for comparison
    await context.takeScreenshot("video-poc-initial");

    // Perform some smooth mouse movements for the video
    const links = await context.__UNSAFE_page_useContextMethodsInstead.$$("a");
    if (links.length > 0) {
      await showSubtitle("Hovering over page links");
      await context.hover("a");
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    // Scroll the page smoothly
    await showSubtitle("Scrolling the page");
    await context.__UNSAFE_page_useContextMethodsInstead.evaluate(() => {
      globalThis.scrollTo({ top: 300, behavior: "smooth" });
    });
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Get page title to verify test ran
    const title = await context.__UNSAFE_page_useContextMethodsInstead.title();
    logger.info(`Page title: ${title}`);

    // Basic assertions
    assertEquals(typeof title, "string", "Page title should be a string");
    assert(title.length > 0, "Page title should not be empty");

    // Stop video recording
    const videoResult = await stop();

    if (videoResult) {
      logger.info(
        `Video recording completed successfully: ${videoResult.videoPath}`,
      );
      assert(
        videoResult.videoPath.includes("poc-test"),
        "Video path should contain test name",
      );
    } else {
      logger.warn("Video recording failed, but test continues");
    }

    await context.takeScreenshot("video-poc-completed");

    logger.info("Video recording proof of concept test completed");
  } catch (error) {
    await context.takeScreenshot("video-poc-error");
    logger.error("Test failed:", error);
    throw error;
  } finally {
    await teardownE2ETest(context);
  }
});
