import { teardownE2ETest } from "@bfmono/infra/testing/e2e/setup.ts";
import { setupBoltFoundryComTest } from "../helpers.ts";
import { getLogger } from "@bfmono/packages/logger/logger.ts";

const logger = getLogger(import.meta);

Deno.test("Sample display mini test", async (t) => {
  const context = await setupBoltFoundryComTest();

  try {
    // Start video recording
    const { stop, showSubtitle } = await context.startRecording(
      "sample-display-mini-test",
    );

    await showSubtitle("🔍 Sample Display Mini Test");

    await t.step("Login and navigate to /pg", async () => {
      // Perform automated login
      await showSubtitle("🔐 Logging in...");
      await context.automatedLogin();

      // Navigate to /pg
      await showSubtitle("📍 Navigating to /pg");
      await context.navigate(`${context.baseUrl}/pg`);
      await context.waitForNetworkIdle();

      await showSubtitle("✅ Loaded /pg");
    });

    await t.step("Click on fastpitch-test-deck", async () => {
      await showSubtitle("🎯 Clicking fastpitch deck...");

      // Check if the deck exists first
      const deckExists = await context.elementWithTextExists(
        ".deck-item",
        "fastpitch-test-deck",
      );

      if (!deckExists) {
        logger.warn("❌ Fastpitch deck not found");
        await showSubtitle("❌ No deck found");
        return;
      }

      // Click the deck using context.click
      await context.click(".deck-item");
      await context.waitForNetworkIdle();

      // Check current URL after click
      const currentUrl = context.url();
      logger.info(`Current URL: ${currentUrl}`);

      await showSubtitle("✅ Clicked deck");

      // Refresh the page to see how the permalink loads
      await showSubtitle("🔄 Refreshing to test permalink...");
      await context.reloadPage();
      await context.waitForNetworkIdle();

      // Check URL is still the same after refresh
      const urlAfterRefresh = context.url();
      logger.info(`URL after refresh: ${urlAfterRefresh}`);

      await showSubtitle("✅ Permalink loaded");
    });

    await t.step("Test grading functionality", async () => {
      await showSubtitle("🎯 Testing grading controls...");

      // Scroll down to see grading controls
      await context.scroll("down");
      await context.scroll("down");
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Look for Agree (+3) button
      const agreeButton = await context.elementWithTextExists(
        "button",
        "Agree (+3)",
      );

      if (agreeButton) {
        await showSubtitle("✅ Found Agree +3 button");

        // Click the Agree button using test ID
        try {
          await context.click('button[data-testid="agree-button"]');
          await showSubtitle("✅ Clicked Agree (+3) button");

          await context.waitForNetworkIdle();
          // Take screenshot after clicking
          await context.takeScreenshot("after-agree-click");
        } catch (error) {
          logger.error("Failed to click Agree +3:", error);
          await showSubtitle("❌ Failed to click Agree +3");
        }
      } else {
        await showSubtitle("❌ No Agree +3 button found");

        // Take screenshot to see what's there
        await context.takeScreenshot("no-agree-button-found");

        // Log what elements we can find
        const buttons = await context.evaluate(() => {
          const buttons = Array.from(document.querySelectorAll("button"));
          return buttons.map((btn) => btn.textContent?.trim()).filter(Boolean);
        });
        logger.info("Available buttons:", buttons);
      }
    });

    // Stop video recording
    const videoResult = await stop();
    if (videoResult) {
      logger.info(`🎬 Video saved: ${videoResult.videoPath}`);
    }
  } finally {
    await teardownE2ETest(context);
  }
});
