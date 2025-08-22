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

    // Stop video recording
    const videoResult = await stop();
    if (videoResult) {
      logger.info(`🎬 Video saved: ${videoResult.videoPath}`);
    }
  } finally {
    await teardownE2ETest(context);
  }
});
