import { assert, assertEquals } from "@std/assert";
import {
  setupE2ETest,
  teardownE2ETest,
} from "@bfmono/infra/testing/e2e/setup.ts";
import { getLogger } from "@bfmono/packages/logger/logger.ts";
import {
  injectCursorOverlayOnAllPages,
  setCursorStyle,
  showCursor,
  updateCursorPosition,
} from "./cursor-overlay-page-injection.ts";
// Using context.click() but keeping smoothMoveTo for cursor positioning tests
import { smoothMoveTo } from "./smooth-mouse.ts";

const logger = getLogger(import.meta);

Deno.test("Debug cursor overlay visibility with screenshots", async () => {
  const context = await setupE2ETest({
    baseUrl: "https://example.com",
  });

  try {
    logger.info("Step 1: Taking screenshot before cursor injection");
    await context.takeScreenshot("cursor-debug-1-before-injection");

    // Manually inject cursor overlay to debug
    logger.info("Step 2: Injecting cursor overlay");
    await injectCursorOverlayOnAllPages(
      context.__UNSAFE_page_useContextMethodsInstead,
    );

    // Give it a moment
    await new Promise<void>((resolve) => setTimeout(resolve, 500));

    logger.info("Step 3: Taking screenshot after cursor injection");
    await context.takeScreenshot("cursor-debug-2-after-injection");

    // Set cursor position manually
    logger.info("Step 4: Setting cursor position to center");
    await updateCursorPosition(
      context.__UNSAFE_page_useContextMethodsInstead,
      640,
      360,
    );
    await new Promise<void>((resolve) => setTimeout(resolve, 500));

    logger.info("Step 5: Taking screenshot with cursor at center");
    await context.takeScreenshot("cursor-debug-3-cursor-center");

    // Navigate to page
    logger.info("Step 6: Navigating to page");
    await context.navigateTo("/");
    await new Promise((resolve) => setTimeout(resolve, 1000));

    logger.info("Step 7: Taking screenshot after page load");
    await context.takeScreenshot("cursor-debug-4-after-page-load");

    // Check if cursor element still exists
    const cursorExists = await context.__UNSAFE_page_useContextMethodsInstead
      .evaluate(() => {
        const cursor = document.getElementById("e2e-cursor-overlay");
        if (cursor) {
          return {
            exists: true,
            display: cursor.style.display,
            position: cursor.style.position,
            zIndex: cursor.style.zIndex,
            left: cursor.style.left,
            top: cursor.style.top,
            visibility: getComputedStyle(cursor).visibility,
            opacity: getComputedStyle(cursor).opacity,
          };
        }
        return { exists: false };
      });

    logger.info("Cursor state after page load:", cursorExists);

    // Force show cursor and set position again
    logger.info("Step 8: Force showing cursor and setting position");
    await showCursor(context.__UNSAFE_page_useContextMethodsInstead);
    await updateCursorPosition(
      context.__UNSAFE_page_useContextMethodsInstead,
      400,
      300,
    );
    await setCursorStyle(
      context.__UNSAFE_page_useContextMethodsInstead,
      "default",
    );
    await new Promise<void>((resolve) => setTimeout(resolve, 500));

    logger.info("Step 9: Taking screenshot after force showing cursor");
    await context.takeScreenshot("cursor-debug-5-force-show-cursor");

    // Try moving cursor to different positions
    logger.info("Step 10: Moving cursor to top-left");
    await updateCursorPosition(
      context.__UNSAFE_page_useContextMethodsInstead,
      100,
      100,
    );
    await setCursorStyle(
      context.__UNSAFE_page_useContextMethodsInstead,
      "hover",
    );
    await new Promise<void>((resolve) => setTimeout(resolve, 500));
    await context.takeScreenshot("cursor-debug-6-top-left-hover");

    logger.info("Step 11: Moving cursor to bottom-right");
    await updateCursorPosition(
      context.__UNSAFE_page_useContextMethodsInstead,
      700,
      500,
    );
    await setCursorStyle(
      context.__UNSAFE_page_useContextMethodsInstead,
      "click",
    );
    await new Promise<void>((resolve) => setTimeout(resolve, 500));
    await context.takeScreenshot("cursor-debug-7-bottom-right-click");

    // Test smooth movement
    logger.info("Step 12: Testing smooth movement");
    await smoothMoveTo(
      context.__UNSAFE_page_useContextMethodsInstead,
      320,
      240,
      1000,
    );
    await new Promise<void>((resolve) => setTimeout(resolve, 500));
    await context.takeScreenshot("cursor-debug-8-after-smooth-move");

    // Try clicking on page
    logger.info("Step 13: Testing smooth click on body");
    try {
      await context.click("body");
      await new Promise<void>((resolve) => setTimeout(resolve, 500));
      await context.takeScreenshot("cursor-debug-9-after-click");
    } catch (error) {
      logger.warn("Click failed:", error);
    }

    // Final cursor state check
    const finalCursorState = await context
      .__UNSAFE_page_useContextMethodsInstead.evaluate(() => {
        const cursor = document.getElementById("e2e-cursor-overlay");
        if (cursor) {
          const rect = cursor.getBoundingClientRect();
          const computed = getComputedStyle(cursor);
          return {
            exists: true,
            boundingRect: {
              left: rect.left,
              top: rect.top,
              width: rect.width,
              height: rect.height,
            },
            styles: {
              display: cursor.style.display,
              visibility: computed.visibility,
              opacity: computed.opacity,
              zIndex: computed.zIndex,
              position: computed.position,
              transform: computed.transform,
            },
            innerHTML: cursor.innerHTML,
          };
        }
        return { exists: false };
      });

    logger.info("Final cursor state:", finalCursorState);

    // Get page title to verify test ran
    const title = await context.__UNSAFE_page_useContextMethodsInstead.title();
    logger.info(`Page title: ${title}`);

    // Basic assertions
    assertEquals(typeof title, "string", "Page title should be a string");
    assert(title.length > 0, "Page title should not be empty");

    logger.info("Cursor debug test completed successfully");
  } catch (error) {
    await context.takeScreenshot("cursor-debug-error");
    logger.error("Test failed:", error);
    throw error;
  } finally {
    await teardownE2ETest(context);
  }
});
