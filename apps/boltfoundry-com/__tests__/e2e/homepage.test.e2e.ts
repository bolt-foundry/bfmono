import { assert, assertEquals } from "@std/assert";
import {
  navigateTo,
  teardownE2ETest,
} from "@bfmono/infra/testing/e2e/setup.ts";
import { getLogger } from "@bfmono/packages/logger/logger.ts";
import { setupBoltFoundryComTest } from "../helpers.ts";

const logger = getLogger(import.meta);

Deno.test("Homepage loads successfully", async () => {
  const context = await setupBoltFoundryComTest();

  try {
    // Navigate to the home page
    await navigateTo(context, "/");

    // Wait for content to load - longer timeout
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // Basic assertions to verify the page loaded
    const title = await context.getPageTitle();
    logger.info("Page title:", title);

    // Verify we're on the right page
    assertEquals(title, "Bolt Foundry");

    // Verify the page content is present
    const pageContent = await context.evaluate(() => document.body.textContent);
    logger.info("Page content:", pageContent?.substring(0, 200) + "...");
    assert(pageContent, "Page should have content");

    // Debug: Check if React has hydrated
    const reactHydrated = await context.evaluate(() => {
      const root = document.querySelector("#root");
      return root ? root.innerHTML.length > 50 : false;
    });
    logger.info("React hydrated:", reactHydrated);

    // Debug: Check what resources failed to load
    const failedRequests = await context.evaluate(() => {
      const scripts = Array.from(document.querySelectorAll("script[src]"));
      const links = Array.from(document.querySelectorAll("link[href]"));
      return {
        scripts: scripts.map((s) => s.getAttribute("src")),
        links: links.map((l) => l.getAttribute("href")),
        rootContent:
          document.querySelector("#root")?.innerHTML?.substring(0, 100) ||
          "empty",
      };
    });
    logger.info("Resources:", failedRequests);

    // Check if authentication section is present
    const hasAuthSection = pageContent.includes("Authentication");
    logger.info("Authentication section present:", hasAuthSection);

    // Check if we can see authentication state
    const hasAuthState = pageContent.includes("You are not logged in") ||
      pageContent.includes("Welcome! You are logged in");
    logger.info("Authentication state visible:", hasAuthState);

    // Take a screenshot for comparison
    await context.takeScreenshot("homepage-current-state");

    logger.info("Homepage loaded successfully");
  } finally {
    await teardownE2ETest(context);
  }
});
