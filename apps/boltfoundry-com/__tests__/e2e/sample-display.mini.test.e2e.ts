import {
  navigateTo,
  teardownE2ETest,
} from "@bfmono/infra/testing/e2e/setup.ts";
import { setupBoltFoundryComTest } from "../helpers.ts";
import { getLogger } from "@bfmono/packages/logger/logger.ts";
import { loadAuthState } from "@bfmono/infra/testing/e2e/authState.ts";

const logger = getLogger(import.meta);

Deno.test("Sample display mini test", async (t) => {
  const context = await setupBoltFoundryComTest();

  try {
    // Start video recording
    const { stop, showSubtitle } = await context.startRecording(
      "sample-display-mini-test",
    );

    await showSubtitle("🔍 Sample Display Mini Test");
    await new Promise((resolve) => setTimeout(resolve, 1000));

    await t.step("Load cached auth and navigate to /pg", async () => {
      // Load saved authentication state
      const authLoaded = await loadAuthState(
        context.__UNSAFE_page_useContextMethodsInstead,
        "boltfoundry-com",
      );

      if (authLoaded) {
        logger.info("✅ Using saved authentication state");
        await showSubtitle("✅ Using cached auth");
      } else {
        logger.warn("❌ No cached auth found");
        await showSubtitle("❌ No cached auth");
      }

      // Navigate to /pg
      await navigateTo(context, "/pg");
      await context.waitForNetworkIdle();

      await showSubtitle("✅ Loaded /pg");
      await new Promise((resolve) => setTimeout(resolve, 1000));
    });

    await t.step("Click on fastpitch-test-deck", async () => {
      await showSubtitle("🎯 Clicking fastpitch deck...");

      // Check if the deck exists first
      const deckExists = await context.evaluate(() => {
        const deckItems = document.querySelectorAll(".deck-item");
        for (const item of deckItems) {
          if (item.textContent?.includes("fastpitch-test-deck")) {
            return true;
          }
        }
        return false;
      });

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
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Refresh the page to see how the permalink loads
      await showSubtitle("🔄 Refreshing to test permalink...");
      await context.__UNSAFE_page_useContextMethodsInstead.reload();
      await context.waitForNetworkIdle();

      // Check URL is still the same after refresh
      const urlAfterRefresh = context.url();
      logger.info(`URL after refresh: ${urlAfterRefresh}`);

      await showSubtitle("✅ Permalink loaded");
      await new Promise((resolve) => setTimeout(resolve, 2000));
    });

    // Stop video recording
    const videoResult = await stop();
    if (videoResult) {
      logger.info(`🎬 Video saved: ${videoResult.videoPath}`);

      // Copy to shared location
      try {
        const sharedDir = "/internalbf/bfmono/shared/latest-e2e";
        await Deno.mkdir(sharedDir, { recursive: true });
        const destPath = `${sharedDir}/sample-display-mini-test.mp4`;
        await Deno.copyFile(videoResult.videoPath, destPath);
        logger.info(`📹 Video copied to: ${destPath}`);
      } catch (error) {
        logger.debug(`Could not copy video: ${error}`);
      }
    }
  } finally {
    await teardownE2ETest(context);
  }
});
