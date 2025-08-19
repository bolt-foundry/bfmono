import { assert } from "@std/assert";
import {
  navigateTo,
  teardownE2ETest,
} from "@bfmono/infra/testing/e2e/setup.ts";
import { setupBoltFoundryComTest } from "../helpers.ts";
import { getLogger } from "@bfmono/packages/logger/logger.ts";

const logger = getLogger(import.meta);

Deno.test("HUD functionality", async (t) => {
  const context = await setupBoltFoundryComTest();

  try {
    // Start video recording
    const { stop, showSubtitle } = await context.startRecording(
      "hud-test",
    );

    await showSubtitle("🧪 HUD Test - Testing HUD open/close functionality");

    await t.step("Navigate to homepage and login", async () => {
      // Navigate to homepage
      logger.debug("Navigating to homepage...");
      await navigateTo(context, "/");
      await context.__UNSAFE_page_useContextMethodsInstead.waitForNetworkIdle({
        timeout: 3000,
      });

      // Verify homepage loaded
      const pageContent = await context.evaluate(() =>
        document.body.textContent
      );
      assert(
        pageContent?.includes("Bolt Foundry"),
        "Homepage should load with Bolt Foundry content",
      );

      await showSubtitle("✅ Homepage loaded, navigating to login...");

      // Find and smooth click the login link
      await context.waitForSelector('a[href="/login"]', {
        visible: true,
        timeout: 5000,
      });

      await context.click('a[href="/login"]');

      // Wait a bit for navigation to start
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Verify we're on the login page
      const currentUrl = context.url();
      assert(
        currentUrl.includes("/login"),
        `Should be on login page, but URL is ${currentUrl}`,
      );

      await showSubtitle("🔐 Clicking Google Sign-In...");

      // Wait for and click Google Sign-In button
      await context.waitForSelector("#google-signin-button", {
        visible: true,
        timeout: 5000,
      });

      await context.click("#google-signin-button");

      // Wait for authentication to process
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Verify we were redirected to /pg (eval routes start with /pg)
      const authUrl = context.url();
      assert(
        authUrl.includes("/pg"),
        `Should be redirected to /pg after authentication, but was redirected to ${authUrl}`,
      );

      await showSubtitle("✅ Logged in successfully!");
    });

    await t.step("Open HUD by clicking header button", async () => {
      logger.debug("Looking for HUD button in header...");

      // Wait for the HUD button to be visible
      await context.waitForSelector('[data-testid="header-hud"]', {
        visible: true,
        timeout: 5000,
      });

      await showSubtitle("🎯 Clicking HUD button to open...");

      // Take screenshot before clicking
      await context.takeScreenshot("hud-test-before-open");

      // Smooth click the HUD button
      await context.takeScreenshot("hud-test-before-hud-click");
      await context.click('[data-testid="header-hud"]');
      await context.takeScreenshot("hud-test-after-hud-click");

      // Wait for HUD to open
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Verify HUD is visible by checking if button variant changed to primary
      const hudButtonVariant = await context.evaluate(() => {
        const button = document.querySelector('[data-testid="header-hud"]');
        return button?.className;
      });

      assert(
        hudButtonVariant?.includes("primary"),
        "HUD button should have primary variant when HUD is open",
      );

      // Verify HUD panel is visible
      const hudPanelVisible = await context.evaluate(() => {
        const hudPanel = document.querySelector(".hud-container");
        return hudPanel !== null &&
          getComputedStyle(hudPanel).display !== "none";
      });

      assert(
        hudPanelVisible,
        "HUD panel should be visible after clicking button",
      );

      logger.debug("✅ HUD opened successfully");
      await context.takeScreenshot("hud-test-hud-open");

      await showSubtitle("🎉 HUD opened successfully!");
    });

    await t.step("Close HUD using X button", async () => {
      logger.debug("Looking for HUD close button...");

      // Wait for the close button to be visible
      await context.waitForSelector('[aria-label="Close HUD"]', {
        visible: true,
        timeout: 5000,
      });

      await showSubtitle("❌ Clicking HUD close button...");

      // Smooth click the close button
      await context.takeScreenshot("hud-test-before-hud-close");
      await context.click('[aria-label="Close HUD"]');
      await context.takeScreenshot("hud-test-after-hud-close");

      // Wait for HUD to close
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Verify HUD is closed by checking if button variant changed back to ghost
      const hudButtonVariant = await context.evaluate(() => {
        const button = document.querySelector('[data-testid="header-hud"]');
        return button?.className;
      });

      assert(
        hudButtonVariant?.includes("ghost"),
        "HUD button should have ghost variant when HUD is closed",
      );

      // Verify HUD panel is no longer visible
      const hudPanelHidden = await context.evaluate(() => {
        const hudPanel = document.querySelector(".hud-container");
        return hudPanel === null ||
          getComputedStyle(hudPanel).display === "none";
      });

      assert(hudPanelHidden, "HUD panel should be hidden after clicking close");

      logger.debug("✅ HUD closed successfully");
      await context.takeScreenshot("hud-test-hud-closed");

      await showSubtitle("✅ HUD closed successfully!");
    });

    await t.step("Re-open HUD with header button", async () => {
      await showSubtitle("🔄 Testing re-open functionality...");

      // Click HUD button to open again
      await context.click('[data-testid="header-hud"]');
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Verify it opened
      const hudOpenAgain = await context.evaluate(() => {
        const button = document.querySelector('[data-testid="header-hud"]');
        return button?.className?.includes("primary");
      });
      assert(hudOpenAgain, "HUD should open again when clicking header button");

      // Verify HUD panel is visible again
      const hudVisible = await context.evaluate(() => {
        const hudPanel = document.querySelector(".hud-container");
        return hudPanel !== null &&
          getComputedStyle(hudPanel).display !== "none";
      });
      assert(hudVisible, "HUD panel should be visible after re-opening");

      await context.takeScreenshot("hud-test-reopened");
      await showSubtitle("✅ HUD re-opened successfully!");
    });

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
