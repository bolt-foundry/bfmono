import { assert } from "@std/assert";
import { withIsolatedDb } from "@bfmono/apps/bfDb/bfDb.ts";
import { makeLoggedInCv } from "@bfmono/apps/bfDb/utils/testUtils.ts";
import { BfOrganization } from "@bfmono/apps/bfDb/nodeTypes/BfOrganization.ts";
import { BfDeck } from "@bfmono/apps/bfDb/nodeTypes/rlhf/BfDeck.ts";
import { BfSample } from "@bfmono/apps/bfDb/nodeTypes/rlhf/BfSample.ts";
import {
  navigateTo,
  teardownE2ETest,
} from "@bfmono/infra/testing/e2e/setup.ts";
import { smoothClick } from "@bfmono/infra/testing/video-recording/smooth-ui.ts";
import { setupBoltFoundryComTest } from "../helpers.ts";
import { getLogger } from "@bfmono/packages/logger/logger.ts";

const logger = getLogger(import.meta);

async function setupTestData() {
  const cv = await makeLoggedInCv();

  // Create organization
  const org = await BfOrganization.__DANGEROUS__createUnattached(cv, {
    name: "Test Organization",
    domain: "test.com",
  }, {
    bfGid: cv.orgBfOid,
  });

  // Create a test deck
  const deck = await BfDeck.__DANGEROUS__createUnattached(cv, {
    name: "Fastpitch Test Deck",
    description: "Test deck for GraphQL samples",
    slug: "fastpitch",
  });

  // Create test samples connected to the deck
  const sample1 = await deck.createTargetNode(BfSample, {
    completionData: {
      duration: 1000,
      provider: "openai",
      request: { url: "test", method: "POST", body: {} },
      response: { status: 200, body: { content: "Test response 1" } },
    },
    collectionMethod: "telemetry",
    name: "Test Sample 1",
  });

  const sample2 = await deck.createTargetNode(BfSample, {
    completionData: {
      duration: 2000,
      provider: "anthropic",
      request: { url: "test", method: "POST", body: {} },
      response: { status: 200, body: { content: "Test response 2" } },
    },
    collectionMethod: "telemetry",
    name: "Test Sample 2",
  });

  return { cv, org, deck, samples: [sample1, sample2] };
}

Deno.test("GraphQL samples endpoint - HUD button test", async (t) => {
  await withIsolatedDb(async () => {
    // Setup test data
    await setupTestData();

    const context = await setupBoltFoundryComTest();

    try {
      // Start video recording
      const { stop, showSubtitle } = await context.startAnnotatedVideoRecording(
        "graphql-samples-test",
      );

      await showSubtitle(
        "🧪 GraphQL Samples Test - Testing deck samples endpoint",
      );

      await t.step("Navigate to homepage and login", async () => {
        // Navigate to homepage
        logger.debug("Navigating to homepage...");
        await navigateTo(context, "/");
        await context.page.waitForNetworkIdle({ timeout: 3000 });

        await showSubtitle("✅ Homepage loaded, navigating to login...");

        // Find and smooth click the login link
        await context.page.waitForSelector('a[href="/login"]', {
          visible: true,
          timeout: 5000,
        });

        await smoothClick(context, 'a[href="/login"]');
        await new Promise((resolve) => setTimeout(resolve, 1000));

        await showSubtitle("🔐 Clicking Google Sign-In...");

        // Wait for and click Google Sign-In button
        await context.page.waitForSelector("#google-signin-button", {
          visible: true,
          timeout: 5000,
        });

        await smoothClick(context, "#google-signin-button");
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // Verify we were redirected to /pg
        const authUrl = context.page.url();
        assert(
          authUrl.includes("/pg"),
          `Should be redirected to /pg after authentication, but was redirected to ${authUrl}`,
        );

        await showSubtitle("✅ Logged in successfully!");
      });

      await t.step("Open HUD and test GraphQL samples button", async () => {
        logger.debug("Looking for HUD button in header...");

        // Wait for the HUD button to be visible
        await context.page.waitForSelector('[data-testid="header-hud"]', {
          visible: true,
          timeout: 5000,
        });

        await showSubtitle("🎯 Opening HUD...");

        // Click the HUD button to open it
        await smoothClick(context, '[data-testid="header-hud"]');
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Verify HUD is open
        const hudOpen = await context.page.evaluate(() => {
          const hudPanel = document.querySelector(".hud-container");
          return hudPanel !== null &&
            getComputedStyle(hudPanel).display !== "none";
        });
        assert(hudOpen, "HUD should be open");

        await showSubtitle("🔍 Looking for GraphQL test button...");

        // Look for our GraphQL test button
        const graphqlButtonExists = await context.page.evaluate(() => {
          const buttons = Array.from(document.querySelectorAll("button"));
          return buttons.some((btn) =>
            btn.textContent?.includes("Test GraphQL Samples")
          );
        });

        assert(
          graphqlButtonExists,
          "GraphQL test button should exist in HUD",
        );

        await showSubtitle("🚀 Clicking GraphQL test button...");

        // Click the GraphQL test button
        const buttonSelector = await context.page.evaluateHandle(() => {
          const buttons = Array.from(document.querySelectorAll("button"));
          const graphqlButton = buttons.find((btn) =>
            btn.textContent?.includes("Test GraphQL Samples")
          );
          return graphqlButton;
        });

        if (buttonSelector) {
          await (buttonSelector as any).click();
        }

        // Wait for first error message to appear (1 second delay)
        await new Promise((resolve) => setTimeout(resolve, 1500));

        await showSubtitle("📊 Navigating through error messages...");

        // Click through the HUD messages using navigation buttons
        // The HUD should have navigation arrows to go through messages

        // Try to find and click the next message button multiple times
        for (let i = 0; i < 5; i++) {
          await new Promise((resolve) => setTimeout(resolve, 1000));

          // Check if next button is enabled
          const isNextEnabled = await context.page.evaluate(() => {
            const nextButton = document.querySelector(
              '[aria-label="Next message"]',
            );
            return nextButton && !(nextButton as HTMLButtonElement).disabled;
          });

          if (isNextEnabled) {
            await showSubtitle(`📋 Navigating to message ${i + 2}...`);
            await smoothClick(context, '[aria-label="Next message"]');
            // Wait for animation
            await new Promise((resolve) => setTimeout(resolve, 500));
            // Take a screenshot of each message
            await context.takeScreenshot(`graphql-message-${i + 2}`);
          }
        }

        // Now try to navigate back through messages
        await showSubtitle("⬅️ Navigating back through messages...");

        for (let i = 0; i < 3; i++) {
          await new Promise((resolve) => setTimeout(resolve, 800));

          // Check if previous button is enabled
          const isPrevEnabled = await context.page.evaluate(() => {
            const prevButton = document.querySelector(
              '[aria-label="Previous message"]',
            );
            return prevButton && !(prevButton as HTMLButtonElement).disabled;
          });

          if (isPrevEnabled) {
            await showSubtitle(`⬅️ Going to previous message...`);
            await smoothClick(context, '[aria-label="Previous message"]');
            // Wait for animation
            await new Promise((resolve) => setTimeout(resolve, 500));
          }
        }

        // Wait a bit more to see all messages
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // Check for messages in the HUD console
        const hasMessages = await context.page.evaluate(() => {
          // Look for HUD message elements
          const hudMessages = document.querySelectorAll(
            '[class*="hud-message"], [class*="message"], .bfds-hud__message',
          );
          return hudMessages.length > 0;
        });

        assert(
          hasMessages,
          "Should have messages in HUD console after clicking button",
        );

        // Take screenshot of results
        await context.takeScreenshot("graphql-samples-results");

        await showSubtitle("✅ GraphQL samples test completed!");

        // Close the HUD
        await smoothClick(context, '[aria-label="Close HUD"]');
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
});
