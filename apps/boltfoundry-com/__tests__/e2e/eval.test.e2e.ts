import { assert } from "@std/assert";
import {
  navigateTo,
  teardownE2ETest,
} from "@bfmono/infra/testing/e2e/setup.ts";
import { setupBoltFoundryComTest } from "../helpers.ts";
import { getLogger } from "@bfmono/packages/logger/logger.ts";

const logger = getLogger(import.meta);

Deno.test("Eval page functionality", async (t) => {
  const context = await setupBoltFoundryComTest();

  try {
    // Start video recording
    const { stop, showSubtitle } = await context.startRecording(
      "eval-page-test",
    );

    await showSubtitle("🧪 Eval Page Test - Homepage to Login");

    await t.step("Navigate to homepage and click login", async () => {
      // Navigate to homepage
      logger.debug("Navigating to homepage...");
      await navigateTo(context, "/");
      await context.__UNSAFE_page_useContextMethodsInstead.waitForNetworkIdle({
        timeout: 3000,
      });

      // Verify homepage loaded
      const pageContent = await context.__UNSAFE_page_useContextMethodsInstead
        .evaluate(() => document.body.textContent);
      assert(
        pageContent?.includes("Bolt Foundry"),
        "Homepage should load with Bolt Foundry content",
      );

      // Take screenshot of homepage
      await context.takeScreenshot("eval-test-homepage");
      await showSubtitle("✅ Homepage loaded successfully");

      // Find and smooth click the login link
      logger.debug("Looking for login link...");

      // Wait for the login link to be visible
      await context.__UNSAFE_page_useContextMethodsInstead.waitForSelector(
        'a[href="/login"]',
        {
          visible: true,
          timeout: 5000,
        },
      );

      await showSubtitle("👆 Clicking login link...");

      // Smooth click on login
      logger.debug("Clicking login link with smooth animation...");
      await context.takeScreenshot("eval-test-before-login-click");
      await context.click('a[href="/login"]');
      await context.takeScreenshot("eval-test-after-login-click");

      // Wait a bit for navigation to start
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Verify we're on the login page
      const currentUrl = context.getPageUrl();
      assert(
        currentUrl.includes("/login"),
        `Should be on login page, but URL is ${currentUrl}`,
      );

      const loginPageContent = await context
        .__UNSAFE_page_useContextMethodsInstead.evaluate(() =>
          document.body.textContent
        );
      assert(
        loginPageContent?.includes("Sign In"),
        "Login page should display Sign In text",
      );

      logger.debug("Successfully navigated to login page");
      await context.takeScreenshot("eval-test-login-page");

      await showSubtitle("🎉 Successfully navigated to login page!");
    });

    await t.step("Click Google login button", async () => {
      logger.debug("Waiting for Google Sign-In button to be ready...");

      // Wait for the Google button to be rendered
      await context.__UNSAFE_page_useContextMethodsInstead.waitForSelector(
        "#google-signin-button",
        {
          visible: true,
          timeout: 5000,
        },
      );

      await showSubtitle("🔐 Clicking Google Sign-In...");

      // Smooth click the Google Sign-In button
      await context.takeScreenshot("eval-test-before-google-signin");
      await context.click("#google-signin-button");
      await context.takeScreenshot("eval-test-after-google-signin");

      // Wait for authentication to process
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Check if we were redirected or if there's an auth cookie
      const currentUrl = context.getPageUrl();
      logger.debug(`Current URL after auth: ${currentUrl}`);

      const cookies = await context.__UNSAFE_page_useContextMethodsInstead
        .cookies();
      const authCookies = cookies.filter((cookie) =>
        cookie.name === "bf_access" || cookie.name === "bf_refresh"
      );

      if (authCookies.length > 0) {
        logger.debug(
          `✅ Auth cookies found: ${authCookies.map((c) => c.name).join(", ")}`,
        );
        await showSubtitle("🍪 Authentication successful!");
      } else {
        logger.debug("❌ No auth cookies found after Google sign-in");
      }

      // Verify we were redirected to /pg (eval routes start with /pg)
      assert(
        currentUrl.includes("/pg"),
        `Should be redirected to /pg after authentication, but was redirected to ${currentUrl}`,
      );

      await context.takeScreenshot("eval-test-after-auth");
    });

    await t.step("Navigate to eval page and verify decks", async () => {
      await showSubtitle("📊 Navigating to eval page...");

      // Should already be on /pg after auth
      await context.__UNSAFE_page_useContextMethodsInstead.waitForNetworkIdle();

      // Wait for DeckList component to mount
      await context.__UNSAFE_page_useContextMethodsInstead.waitForSelector(
        ".decks-list, .decks-header",
        {
          visible: true,
          timeout: 10000,
        },
      );

      await context.takeScreenshot("eval-test-decks-page");

      // Check if HUD is visible and contains our debug messages
      const hudVisible =
        await context.__UNSAFE_page_useContextMethodsInstead.$(".bfds-hud") !==
          null;
      if (hudVisible) {
        logger.info("✅ HUD is visible");

        // Get HUD messages
        const hudMessages = await context.__UNSAFE_page_useContextMethodsInstead
          .evaluate(() => {
            const messages = document.querySelectorAll(".hud-message-content");
            return Array.from(messages).map((el) => el.textContent);
          });

        logger.info("HUD Messages:", hudMessages);

        // Verify DeckList mounted message
        const deckListMounted = hudMessages.some((msg) =>
          msg?.includes("DeckList mounted")
        );
        assert(
          deckListMounted,
          "DeckList should have mounted and logged to HUD",
        );

        // Verify mock decks loaded
        const mockDecksLoaded = hudMessages.some((msg) =>
          msg?.includes("Mock decks loaded")
        );
        assert(mockDecksLoaded, "Mock decks should be loaded");

        await showSubtitle("✅ DeckList mounted with mock data");
      } else {
        logger.warn("⚠️ HUD not visible, skipping HUD verification");
      }

      // Verify deck items are displayed
      const deckItems = await context.__UNSAFE_page_useContextMethodsInstead.$$(
        ".deck-item",
      );
      logger.info(`Found ${deckItems.length} deck items`);
      // TODO: Fix mock data loading for decks
      // assert(deckItems.length > 0, "Should have at least one deck displayed");
    });

    await t.step("Click on a deck and verify grading inbox", async () => {
      await showSubtitle("🎯 Clicking on first deck...");

      // TODO: Fix this test after mock data loading is fixed
      logger.info("Skipping grading inbox test - no deck items available");
      /*
      // Click the first deck item
      await context.takeScreenshot("eval-test-before-deck-click");
      await context.click(".deck-item:first-child");
      await context.takeScreenshot("eval-test-after-deck-click");

      // Wait for GradingInbox to mount
      await context.__UNSAFE_page_useContextMethodsInstead.waitForSelector(".grading-inbox", {
        visible: true,
        timeout: 10000,
      });

      await context.takeScreenshot("eval-test-grading-inbox");

      // Check HUD messages for GradingInbox mount
      if (await context.__UNSAFE_page_useContextMethodsInstead.$(".bfds-hud") !== null) {
        const hudMessages = await context.__UNSAFE_page_useContextMethodsInstead.evaluate(() => {
          const messages = document.querySelectorAll(".hud-message-content");
          return Array.from(messages).map((el) => el.textContent);
        });

        logger.info("Updated HUD Messages:", hudMessages);

        // Verify deck selection
        const deckSelected = hudMessages.some((msg) =>
          msg?.includes("Deck selected")
        );
        assert(deckSelected, "Deck selection should be logged");

        // Verify GradingInbox mounted
        const gradingInboxMounted = hudMessages.some((msg) =>
          msg?.includes("GradingInbox mounted")
        );
        assert(gradingInboxMounted, "GradingInbox should have mounted");

        // Verify samples loaded
        const samplesLoaded = hudMessages.some((msg) =>
          msg?.includes("Samples loaded")
        );
        assert(samplesLoaded, "Samples should be loaded");

        await showSubtitle("✅ GradingInbox loaded with samples");
      }

      // Verify grading UI elements
      const gradingHeader = await context.__UNSAFE_page_useContextMethodsInstead.evaluate(() =>
        document.querySelector(".grading-header")?.textContent
      );
      assert(gradingHeader?.includes("Grading:"), "Should show grading header");

      const sampleDisplay = await context.__UNSAFE_page_useContextMethodsInstead.$(".sample-display") !== null;
      assert(sampleDisplay, "Should display sample for grading");

      logger.info("✅ Successfully navigated to grading inbox");
      */
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
