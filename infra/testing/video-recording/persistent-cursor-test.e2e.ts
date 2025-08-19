import { assert, assertEquals } from "@std/assert";
import {
  setupE2ETest,
  teardownE2ETest,
} from "@bfmono/infra/testing/e2e/setup.ts";
import { getLogger } from "@bfmono/packages/logger/logger.ts";
import {
  ensureCursorVisible,
  injectPersistentCursorOverlay,
  removePersistentCursorOverlay,
  setPersistentCursorStyle,
  updatePersistentCursorPosition,
} from "./cursor-overlay-persistent.ts";

const logger = getLogger(import.meta);

Deno.test("Persistent cursor overlay test with screenshots", async () => {
  const context = await setupE2ETest({
    baseUrl: "https://example.com",
  });

  try {
    logger.info("Step 1: Taking screenshot before cursor injection");
    await context.takeScreenshot("persistent-cursor-1-before-injection");

    // Inject persistent cursor overlay
    logger.info("Step 2: Injecting persistent cursor overlay");
    await injectPersistentCursorOverlay(context.__UNSAFE_page_useContextMethodsInstead);

    // Give it a moment
    await new Promise((resolve) => setTimeout(resolve, 500));

    logger.info("Step 3: Taking screenshot after cursor injection");
    await context.takeScreenshot("persistent-cursor-2-after-injection");

    // Set cursor position manually
    logger.info("Step 4: Setting cursor position to top-left");
    await updatePersistentCursorPosition(context.__UNSAFE_page_useContextMethodsInstead, 100, 100);
    await new Promise((resolve) => setTimeout(resolve, 500));

    logger.info("Step 5: Taking screenshot with cursor at top-left");
    await context.takeScreenshot("persistent-cursor-3-top-left");

    // Navigate to page (this is where the cursor was disappearing before)
    logger.info("Step 6: Navigating to page");
    await context.navigateTo("/");
    await new Promise((resolve) => setTimeout(resolve, 2000)); // Give more time for page load and cursor recreation

    logger.info("Step 7: Taking screenshot after page load");
    await context.takeScreenshot("persistent-cursor-4-after-page-load");

    // Ensure cursor is visible after navigation
    logger.info("Step 8: Ensuring cursor is visible after navigation");
    await ensureCursorVisible(context.__UNSAFE_page_useContextMethodsInstead);
    await updatePersistentCursorPosition(context.__UNSAFE_page_useContextMethodsInstead, 400, 300);
    await new Promise((resolve) => setTimeout(resolve, 500));

    logger.info("Step 9: Taking screenshot after ensuring cursor visibility");
    await context.takeScreenshot("persistent-cursor-5-ensured-visible");

    // Test different cursor styles
    logger.info("Step 10: Testing hover style");
    await setPersistentCursorStyle(context.__UNSAFE_page_useContextMethodsInstead, "hover");
    await updatePersistentCursorPosition(context.__UNSAFE_page_useContextMethodsInstead, 300, 200);
    await new Promise((resolve) => setTimeout(resolve, 500));
    await context.takeScreenshot("persistent-cursor-6-hover-style");

    logger.info("Step 11: Testing click style");
    await setPersistentCursorStyle(context.__UNSAFE_page_useContextMethodsInstead, "click");
    await updatePersistentCursorPosition(context.__UNSAFE_page_useContextMethodsInstead, 500, 400);
    await new Promise((resolve) => setTimeout(resolve, 500));
    await context.takeScreenshot("persistent-cursor-7-click-style");

    logger.info("Step 12: Back to default style");
    await setPersistentCursorStyle(context.__UNSAFE_page_useContextMethodsInstead, "default");
    await updatePersistentCursorPosition(context.__UNSAFE_page_useContextMethodsInstead, 640, 360);
    await new Promise((resolve) => setTimeout(resolve, 500));
    await context.takeScreenshot("persistent-cursor-8-default-style");

    // Check final cursor state
    const finalCursorState = await context.__UNSAFE_page_useContextMethodsInstead.evaluate(() => {
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
            background: cursor.style.background,
          },
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
    assert(
      finalCursorState.exists,
      "Cursor should still exist after page navigation",
    );

    logger.info("Persistent cursor test completed successfully");

    // Clean up
    await removePersistentCursorOverlay(context.__UNSAFE_page_useContextMethodsInstead);
  } catch (error) {
    await context.takeScreenshot("persistent-cursor-error");
    logger.error("Test failed:", error);
    throw error;
  } finally {
    await teardownE2ETest(context);
  }
});
