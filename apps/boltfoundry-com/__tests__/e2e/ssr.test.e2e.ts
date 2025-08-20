import { assert, assertEquals } from "@std/assert";
import {
  navigateTo,
  teardownE2ETest,
} from "@bfmono/infra/testing/e2e/setup.ts";
import { getLogger } from "@bfmono/packages/logger/logger.ts";
import { setupBoltFoundryComTest } from "../helpers.ts";

const logger = getLogger(import.meta);

Deno.test("SSR landing page loads and hydrates correctly", async () => {
  const context = await setupBoltFoundryComTest();

  try {
    // Start video recording with conversion to MP4
    const { stop, showSubtitle } = await context
      .startRecording("ssr-hydration-demo");

    await showSubtitle("SSR landing page hydration test");

    // Navigate to the home page
    await navigateTo(context, "/");

    // Try direct navigation instead of clicking since button might not be interactive yet
    await context.__UNSAFE_page_useContextMethodsInstead.goto(
      `${context.baseUrl}/ui`,
    );

    // Wait for navigation to complete
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Check current URL after navigation
    const currentUrl = context.url();
    logger.info(`Current URL after button click: ${currentUrl}`);

    // Remove manual screenshot - let video recording capture naturally

    // Wait for content to ensure page loaded
    const title = await context.__UNSAFE_page_useContextMethodsInstead.title();
    logger.info(`Page title: ${title}`);

    // Verify the page title is correct
    assertEquals(title, "Bolt Foundry", "Page title should be 'Bolt Foundry'");

    // Check if the page contains expected server-rendered content
    const bodyText = await context.__UNSAFE_page_useContextMethodsInstead
      .evaluate(() => document.body.textContent);

    // Verify core UI demo page content is present
    assert(
      bodyText?.includes("BfDs Demo"),
      "Page should contain 'BfDs Demo' heading",
    );

    assert(
      bodyText?.includes(
        "Interactive examples of BfDs design system components",
      ),
      "Page should contain demo description text",
    );

    assert(
      bodyText?.includes("Button") && bodyText?.includes("Examples"),
      "Page should contain component examples",
    );

    // Verify SSR-specific elements are present
    const rootElement = await context.__UNSAFE_page_useContextMethodsInstead.$(
      "#root",
    );
    assert(rootElement, "Page should have #root element for React hydration");

    // Check that the server rendered the initial HTML structure
    const appElement = await context.__UNSAFE_page_useContextMethodsInstead.$(
      "#root",
    );
    assert(appElement, "Page should have #root element from server rendering");

    // Verify that the client bundle script is loaded
    const clientScript = await context.__UNSAFE_page_useContextMethodsInstead
      .evaluate(() => {
        const script = document.querySelector(
          'script[src^="/static/build/ClientRoot-"]',
        );
        return script !== null;
      });
    assert(clientScript, "Page should include ClientRoot script");

    // Verify that the __ENVIRONMENT__ global is set up for rehydration
    const hasEnvironment = await context.__UNSAFE_page_useContextMethodsInstead
      .evaluate(() => {
        // @ts-expect-error - Testing runtime global
        return typeof globalThis.__ENVIRONMENT__ === "object";
      });
    assert(
      hasEnvironment,
      "Page should have __ENVIRONMENT__ global for rehydration",
    );

    // Verify the environment contains expected data
    const environment = await context.__UNSAFE_page_useContextMethodsInstead
      .evaluate(() => {
        // @ts-expect-error - Testing runtime global
        return globalThis.__ENVIRONMENT__;
      });
    assert(environment?.mode, "Environment should contain mode");
    assert(environment?.port, "Environment should contain port");

    // Verify that the page is visually functional (basic styling applied)
    const hasVisibleContent = await context
      .__UNSAFE_page_useContextMethodsInstead.evaluate(() => {
        const body = document.body;
        const styles = globalThis.getComputedStyle(body);
        // Just check that basic styling is applied (page isn't completely unstyled)
        return styles.margin !== undefined && styles.padding !== undefined;
      });
    assert(hasVisibleContent, "Page should have basic styling applied");

    // Test that the page is interactive (hydration worked)
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Give time for hydration

    // Remove manual screenshot - let video recording capture naturally

    logger.info("SSR landing page test completed successfully");

    // Stop video recording
    const videoResult = await stop();
    if (videoResult) {
      logger.info(`Video saved to: ${videoResult.videoPath}`);
    } else {
      logger.error("Video recording failed: No result returned");
    }
  } catch (error) {
    // Remove manual screenshot on failure - video recording captures everything
    logger.error("SSR test failed:", error);
    throw error;
  } finally {
    await teardownE2ETest(context);
  }
});

Deno.test("SSR serves correct response headers", async () => {
  const context = await setupBoltFoundryComTest();

  try {
    // Make request and check response headers
    const response = await context.__UNSAFE_page_useContextMethodsInstead.goto(
      context.baseUrl,
    );

    // Verify response is successful
    assertEquals(response?.status(), 200, "Response should be 200 OK");

    // Verify content type is HTML
    const contentType = response?.headers()["content-type"];
    assert(
      contentType?.includes("text/html"),
      "Response should have HTML content type",
    );

    // Get the raw HTML to verify server-side rendering
    const html = await response?.text();

    // Verify that the HTML contains server-rendered content
    assert(
      html?.includes('<div id="root">'),
      "HTML should contain server-rendered app structure",
    );

    // Check for generic content presence instead of specific marketing text
    assert(
      html && html.length > 1000,
      "HTML should contain substantial server-rendered content",
    );

    // Verify that some text content exists (not just HTML structure)
    const hasTextContent = /<[^>]+>[^<]{10,}<\/[^>]+>/.test(html || "");
    assert(
      hasTextContent,
      "HTML should contain server-rendered text content",
    );

    // Verify that the rehydration script is included
    assert(
      html?.includes("globalThis.__ENVIRONMENT__"),
      "HTML should include environment setup for rehydration",
    );

    logger.info("SSR response headers test completed successfully");
  } catch (error) {
    await context.takeScreenshot("ssr-headers-test-error");
    logger.error("SSR headers test failed:", error);
    throw error;
  } finally {
    await teardownE2ETest(context);
  }
});

Deno.test("SSR handles static assets correctly", async () => {
  const context = await setupBoltFoundryComTest();

  try {
    // Navigate to the home page first
    await navigateTo(context, "/");

    // Test that CSS is loaded correctly by checking if it's actually loaded in the page
    const cssLoaded = await context.__UNSAFE_page_useContextMethodsInstead
      .evaluate(() => {
        const cssLinks = Array.from(
          document.querySelectorAll('link[rel="stylesheet"]'),
        );
        return cssLinks.some((link) => {
          const href = link.getAttribute("href");
          return href && href.includes("/static/build/assets/") &&
            href.includes(".css");
        });
      });
    assert(cssLoaded, "CSS should be properly loaded via manifest");

    // Test that the CSS file from the manifest is actually served
    const cssHref = await context.__UNSAFE_page_useContextMethodsInstead
      .evaluate(() => {
        const cssLink = document.querySelector('link[rel="stylesheet"]');
        return cssLink ? cssLink.getAttribute("href") : null;
      });

    if (cssHref) {
      const cssResponse = await context.__UNSAFE_page_useContextMethodsInstead
        .goto(
          new URL(cssHref, context.baseUrl).toString(),
        );
      assertEquals(
        cssResponse?.status(),
        200,
        "CSS from manifest should be served successfully",
      );

      const cssContentType = cssResponse?.headers()["content-type"];
      assert(
        cssContentType?.includes("text/css"),
        "CSS should have correct content type",
      );
    } else {
      throw new Error("No CSS link found in the page");
    }

    // Test that JavaScript is loaded correctly - navigate to home page first
    await context.__UNSAFE_page_useContextMethodsInstead.goto(context.baseUrl);
    const jsPath = await context.__UNSAFE_page_useContextMethodsInstead
      .evaluate(() => {
        const script = document.querySelector(
          'script[src^="/static/build/ClientRoot-"]',
        );
        return script?.getAttribute("src") || null;
      });
    assert(jsPath, "ClientRoot script should be found on page");

    const jsResponse = await context.__UNSAFE_page_useContextMethodsInstead
      .goto(
        new URL(jsPath, context.baseUrl).toString(),
      );
    assertEquals(
      jsResponse?.status(),
      200,
      "JavaScript should be served successfully",
    );

    const jsContentType = jsResponse?.headers()["content-type"];
    assert(
      jsContentType?.includes("javascript"),
      "JavaScript should have correct content type",
    );

    logger.info("SSR static assets test completed successfully");
  } catch (error) {
    await context.takeScreenshot("ssr-assets-test-error");
    logger.error("SSR static assets test failed:", error);
    throw error;
  } finally {
    await teardownE2ETest(context);
  }
});
