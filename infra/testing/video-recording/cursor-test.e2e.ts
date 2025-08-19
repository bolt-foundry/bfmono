import { assert, assertEquals } from "@std/assert";
import {
  setupE2ETest,
  teardownE2ETest,
} from "@bfmono/infra/testing/e2e/setup.ts";
import { getLogger } from "@bfmono/packages/logger/logger.ts";
// Using context methods for click and hover, but keeping smoothMoveTo for cursor positioning
import { smoothMoveTo } from "./smooth-mouse.ts";

const logger = getLogger(import.meta);

Deno.test.ignore("Cursor overlay test with video recording", async () => {
  const context = await setupE2ETest({
    baseUrl: "https://example.com",
  });

  try {
    // Start video recording with cursor overlay
    const { stop, showSubtitle } = await context
      .startRecording(
        "cursor-test",
        {
          outputFormat: "mp4",
          quality: "medium",
          framerate: 15,
          deleteFrames: true,
        },
      );

    await showSubtitle("Cursor overlay demonstration");

    // Navigate to a simple page
    await context.navigateTo("/");

    // Wait for page to load
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Test cursor movements and interactions
    logger.info("Testing cursor overlay with various movements...");

    // Move to different areas of the page to show cursor
    await smoothMoveTo(
      context.__UNSAFE_page_useContextMethodsInstead,
      200,
      200,
      1000,
    );
    await new Promise((resolve) => setTimeout(resolve, 500));

    await smoothMoveTo(
      context.__UNSAFE_page_useContextMethodsInstead,
      600,
      300,
      1000,
    );
    await new Promise((resolve) => setTimeout(resolve, 500));

    await smoothMoveTo(
      context.__UNSAFE_page_useContextMethodsInstead,
      400,
      500,
      1000,
    );
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Try to find and hover over a link
    const links = await context.__UNSAFE_page_useContextMethodsInstead.$$("a");
    if (links.length > 0) {
      logger.info("Hovering over first link...");
      await context.hover("a");
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    // Try to interact with the page
    logger.info("Demonstrating click animation...");
    try {
      await context.click("body");
      await new Promise((resolve) => setTimeout(resolve, 500));
    } catch (_error) {
      logger.debug("Click test completed");
    }

    // More cursor movements
    await smoothMoveTo(
      context.__UNSAFE_page_useContextMethodsInstead,
      100,
      100,
      800,
    );
    await new Promise((resolve) => setTimeout(resolve, 500));

    await smoothMoveTo(
      context.__UNSAFE_page_useContextMethodsInstead,
      700,
      400,
      800,
    );
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Get page title to verify test ran
    const title = await context.__UNSAFE_page_useContextMethodsInstead.title();
    logger.info(`Page title: ${title}`);

    // Basic assertions
    assertEquals(typeof title, "string", "Page title should be a string");
    assert(title.length > 0, "Page title should not be empty");

    // Stop video recording and get the result
    const videoResult = await stop();

    if (videoResult) {
      logger.info(`Cursor test video completed: ${videoResult.videoPath}`);
      logger.info(
        `Video stats: ${videoResult.duration}s, ${videoResult.frameCount} frames, ${videoResult.fileSize} bytes`,
      );

      assert(
        videoResult.videoPath.endsWith(".mp4"),
        "Video should be MP4 format",
      );
      assert(videoResult.frameCount > 0, "Should have captured frames");
      assert(videoResult.fileSize > 0, "Video file should have content");
    } else {
      logger.warn("Video recording failed, but test continues");
    }

    logger.info("Cursor overlay test completed successfully");
  } catch (error) {
    await context.takeScreenshot("cursor-test-error");
    logger.error("Test failed:", error);
    throw error;
  } finally {
    await teardownE2ETest(context);
  }
});
