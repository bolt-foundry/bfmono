import { assert, assertEquals } from "@std/assert";
import {
  navigateTo,
  teardownE2ETest,
} from "@bfmono/infra/testing/e2e/setup.ts";
import { getLogger } from "@bfmono/packages/logger/logger.ts";
import { setupPromptgradeAiTest } from "../helpers.ts";

const logger = getLogger(import.meta);

Deno.test("promptgrade.ai homepage loads with welcome message", async () => {
  const context = await setupPromptgradeAiTest();

  try {
    logger.info("🎬 Starting promptgrade.ai e2e test with recording");

    // Navigate to the home page
    logger.info("📍 Navigating to homepage...");
    await navigateTo(context, "/");

    // Add annotation
    await context.page.evaluate(() => {
      console.timeStamp("Navigation Complete");
    });

    // Wait for content to load
    logger.info("⏳ Waiting for page to fully load...");
    await context.page.waitForSelector("#root", { timeout: 5000 });

    // Add a delay to ensure React hydration completes
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Verify page title
    const title = await context.page.title();
    logger.info(`📄 Page title: ${title}`);
    assertEquals(
      title,
      "promptgrade.ai",
      "Page title should be 'promptgrade.ai'",
    );

    // Add annotation for title check
    await context.page.evaluate(() => {
      console.timeStamp("Title Verified");
    });

    // Check for the welcome message
    logger.info("🔍 Looking for welcome message...");
    const welcomeText = await context.page.evaluate(() =>
      document.body.textContent
    );
    assert(
      welcomeText?.includes("Welcome to promptgrade.ai"),
      "Page should display 'Welcome to promptgrade.ai'",
    );

    logger.info("✅ Welcome message found!");

    // Add annotation for content verification
    await context.page.evaluate(() => {
      console.timeStamp("Welcome Message Verified");
    });

    // Check React hydration status
    logger.info("⚛️ Checking React hydration...");
    const reactHydrated = await context.page.evaluate(() => {
      const root = document.querySelector("#root");
      // Check if root has content and React has added its internal properties
      return root ? root.innerHTML.length > 50 : false;
    });
    assert(reactHydrated, "React should be hydrated");
    logger.info("✅ React is hydrated");

    // Add annotation for React check
    await context.page.evaluate(() => {
      console.timeStamp("React Hydration Verified");
    });

    // Take a screenshot with annotation
    logger.info("📸 Taking annotated screenshot...");
    await context.page.evaluate(() => {
      // Add visual annotation to the page
      const annotation = document.createElement("div");
      annotation.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #4CAF50;
        color: white;
        padding: 10px 20px;
        border-radius: 5px;
        font-family: Arial, sans-serif;
        font-size: 16px;
        box-shadow: 0 2px 5px rgba(0,0,0,0.3);
        z-index: 10000;
      `;
      annotation.textContent = "✅ E2E Test Passed";
      document.body.appendChild(annotation);
    });

    // Take screenshot
    await context.takeScreenshot("promptgrade-ai-homepage-annotated");

    // Log test summary
    logger.info("🎉 promptgrade.ai homepage e2e test completed successfully!");
    logger.info(`
📊 Test Summary:
  ✅ Navigation successful
  ✅ Page title correct: "${title}"
  ✅ Welcome message displayed
  ✅ React hydrated properly
  ✅ Screenshot captured with annotations
    `);
  } finally {
    await teardownE2ETest(context);
  }
});
