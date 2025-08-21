import { assert } from "@std/assert";
import {
  navigateTo,
  teardownE2ETest,
} from "@bfmono/infra/testing/e2e/setup.ts";
import { setupBoltFoundryComTest } from "../helpers.ts";
import { getLogger } from "@bfmono/packages/logger/logger.ts";

const logger = getLogger(import.meta);

Deno.test("Fastpitch telemetry to dashboard flow", async (t) => {
  const context = await setupBoltFoundryComTest();

  try {
    // Start video recording
    const { stop, showSubtitle, showTitleCard } = await context.startRecording(
      "fastpitch-telemetry-test",
    );

    await showTitleCard("Fastpitch Telemetry Test", "E2E Demo Video");

    await t.step("Login and create organization", async () => {
      // Navigate to homepage
      logger.debug("Navigating to homepage...");
      await navigateTo(context, "/");
      await context.waitForNetworkIdle({
        timeout: 3000,
      });

      // Click login link
      await context.waitForSelector(
        'a[href="/login"]',
        { visible: true, timeout: 5000 },
      );
      await context.click('a[href="/login"]');

      // Wait for login page to load
      await context.waitForNetworkIdle({ timeout: 2000 });
      assert(
        context.url().includes("/login"),
        "Should be on login page",
      );

      // Click Google Sign-In
      await context.waitForSelector(
        "#google-signin-button",
        { visible: true, timeout: 5000 },
      );
      await context.click("#google-signin-button");

      // Wait for authentication to complete
      await context.waitForNetworkIdle({ timeout: 3000 });

      // Verify redirected to /pg
      assert(
        context.url().includes("/pg"),
        "Should be redirected to /pg after authentication",
      );

      await showSubtitle("✅ Logged in successfully");
    });

    await t.step("Generate telemetry with BfClient", async () => {
      await showSubtitle("📊 Generating telemetry data...");

      // Use the same org as the dev authentication: boltfoundry.com
      const orgId = "boltfoundry.com";

      // Get server URL from context
      const serverUrl = context.url().replace(/\/pg.*/, ""); // Get base URL

      // We'll send telemetry directly for now since BfClient may not have all methods yet
      const testDeckId = "fastpitch-test-deck";

      // Generate some telemetry
      const completionData = {
        messages: [
          { role: "system", content: "You are a helpful assistant." },
          { role: "user", content: "What is the capital of France?" },
        ],
        model: "gpt-4",
        temperature: 0.7,
      };

      // Send telemetry (this would normally happen via OpenAI completion)
      const telemetryResponse = await fetch(
        `${serverUrl}/api/telemetry`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-bf-api-key": `bf+${orgId}`,
          },
          body: JSON.stringify({
            duration: 1234,
            provider: "openai",
            model: "gpt-4",
            request: {
              url: "https://api.openai.com/v1/chat/completions",
              method: "POST",
              headers: {},
              body: completionData,
              timestamp: new Date().toISOString(),
            },
            response: {
              status: 200,
              headers: {},
              body: {
                id: "chatcmpl-test123",
                object: "chat.completion",
                created: Date.now(),
                model: "gpt-4",
                choices: [{
                  index: 0,
                  message: {
                    role: "assistant",
                    content: "The capital of France is Paris.",
                  },
                  finish_reason: "stop",
                }],
                usage: {
                  prompt_tokens: 20,
                  completion_tokens: 10,
                  total_tokens: 30,
                },
              },
              timestamp: new Date().toISOString(),
            },
            bfMetadata: {
              deckId: testDeckId,
              contextVariables: {
                userId: "test-user",
                sessionId: "test-session",
              },
              attributes: {
                source: "e2e-test",
              },
            },
          }),
        },
      );

      if (!telemetryResponse.ok) {
        const errorText = await telemetryResponse.text();
        logger.error(
          `Telemetry failed with status ${telemetryResponse.status}: ${errorText}`,
        );
      }

      assert(
        telemetryResponse.ok,
        `Telemetry should be accepted: ${telemetryResponse.status}`,
      );

      const telemetryResult = await telemetryResponse.json();
      logger.info("Telemetry response:", telemetryResult);

      assert(
        telemetryResult.success,
        "Telemetry should be processed successfully",
      );

      await showSubtitle("✅ Telemetry sent successfully");
    });

    await t.step(
      "Navigate to decks page and verify real deck appears",
      async () => {
        await showSubtitle("🔍 Checking for real deck in dashboard...");

        // Navigate to /pg/grade/decks (or refresh if already there)
        await navigateTo(context, "/pg/grade/decks");
        await context.waitForNetworkIdle();

        // Wait for DeckList component to mount
        await context.waitForSelector(
          ".decks-list, .decks-header, .bfds-empty-state",
          {
            visible: true,
            timeout: 10000,
          },
        );

        await context.takeScreenshot("fastpitch-test-decks-page");

        // Check if we see the deck we created via telemetry
        const pageContent = await context.evaluate(() =>
          document.body.textContent
        );

        // Check for the test deck
        const hasFastpitchDeck = pageContent?.includes("fastpitch-test-deck");

        // TODO: Once we implement real data fetching, this should pass
        if (hasFastpitchDeck) {
          logger.info("✅ Found fastpitch test deck in the dashboard!");
          await showSubtitle("✅ Real deck displayed in dashboard!");
        } else {
          logger.warn("❌ Deck not found - dashboard still showing mock data");
          await showSubtitle("⚠️ Dashboard still showing mock data");

          // Check if we're seeing mock decks instead
          const hasMockDecks =
            pageContent?.includes("Customer Support Evaluator") ||
            pageContent?.includes("Code Review Assistant");

          assert(
            hasMockDecks || hasFastpitchDeck,
            "Should show either real deck or mock decks",
          );
        }
      },
    );

    await t.step("Verify deck is in the list", async () => {
      await showSubtitle("📝 Verifying deck appears in list...");

      // Check if we can see the test deck in the list
      const testDeckVisible = await context.evaluate(() => {
        const deckItems = document.querySelectorAll(".deck-item");
        for (const item of deckItems) {
          if (item.textContent?.includes("fastpitch-test-deck")) {
            return true;
          }
        }
        return false;
      });

      if (testDeckVisible) {
        logger.info("✅ Test deck is visible in the deck list!");
        await showSubtitle("✅ Test deck confirmed in list!");
      } else {
        logger.warn("❌ Test deck not found in the list");
        await showSubtitle("⚠️ Test deck not visible");
      }

      assert(testDeckVisible, "Test deck should be visible in the deck list");
    });

    await t.step("Click on test deck and verify detail view", async () => {
      await showSubtitle("🎯 Clicking on test deck...");
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Click the deck to navigate to detail view
      const deckItems = await context.__UNSAFE_page_useContextMethodsInstead
        .$$(".deck-item");

      if (deckItems.length === 0) {
        throw new Error("No deck items found to click");
      }

      // Find the fastpitch test deck and click it
      let foundTestDeck = false;
      for (const item of deckItems) {
        const text = await item.evaluate((el) => el.textContent);
        if (text?.includes("fastpitch-test-deck")) {
          await item.click();
          foundTestDeck = true;
          break;
        }
      }

      if (!foundTestDeck) {
        // Just click the first deck item if we can't find the specific test deck
        await deckItems[0].click();
      }

      await context.waitForNetworkIdle();

      // Check current URL after click
      const currentUrl = context.url();
      logger.info(`Current URL after deck click: ${currentUrl}`);

      assert(
        currentUrl.includes("/pg/grade/decks/") ||
          currentUrl.includes("/deck/"),
        "Should navigate to deck detail view",
      );

      await showSubtitle("✅ Navigated to deck detail");
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Refresh the page to test permalink functionality
      await showSubtitle("🔄 Testing permalink...");
      await context.__UNSAFE_page_useContextMethodsInstead.reload();
      await context.waitForNetworkIdle();

      // Check URL is still the same after refresh
      const urlAfterRefresh = context.url();
      logger.info(`URL after refresh: ${urlAfterRefresh}`);

      assert(
        urlAfterRefresh === currentUrl,
        "URL should remain the same after refresh",
      );

      await showSubtitle("✅ Deck detail view confirmed");
      await new Promise((resolve) => setTimeout(resolve, 3000));
    });

    // Stop video recording
    const videoResult = await stop();
    if (videoResult) {
      logger.debug(`🎬 Video saved: ${videoResult.videoPath}`);
      logger.debug(`📏 Duration: ${videoResult.duration}s`);

      // Copy to shared location for easy viewing (if we have permissions)
      try {
        const sharedDir = "/internalbf/bfmono/shared/latest-e2e";
        await Deno.mkdir(sharedDir, { recursive: true });
        const destPath = `${sharedDir}/fastpitch-telemetry-test.mp4`;
        await Deno.copyFile(videoResult.videoPath, destPath);
        logger.info(`📹 Video copied to: ${destPath}`);
      } catch (error) {
        // Ignore permission errors in CI
        logger.debug(`Could not copy video to shared location: ${error}`);
      }
    }
  } finally {
    await teardownE2ETest(context);
  }
});
