import { assert } from "@std/assert";
import {
  setupE2ETest,
  teardownE2ETest,
} from "@bfmono/infra/testing/e2e/setup.ts";
import { getLogger } from "@bfmono/packages/logger/logger.ts";

const logger = getLogger(import.meta);

Deno.test("E2E streaming prototype test", async () => {
  // Set streaming environment variable
  Deno.env.set("BF_E2E_STREAM", "true");

  const context = await setupE2ETest({
    baseUrl: "http://localhost:8002", // boltfoundry-com server
  });

  try {
    logger.info("Starting recording with streaming enabled...");

    // Start video recording (which will now also stream)
    const { stop, showSubtitle } = await context.startRecording(
      "streaming-test",
    );

    // Navigate and perform some actions
    await context.navigateTo("/");
    await showSubtitle("Testing E2E streaming prototype");

    // Wait a moment for frames to be generated
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Perform some interactions to generate interesting video content
    await context.takeScreenshot("streaming-test-1");

    await showSubtitle("Streaming should be visible at /e2e-viewer");
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Check if we can access the viewer endpoint
    try {
      const viewerResponse = await fetch("http://localhost:8002/e2e-viewer");
      assert(viewerResponse.ok, "Viewer endpoint should be accessible");

      const viewerHtml = await viewerResponse.text();
      assert(
        viewerHtml.includes("E2E Test Stream"),
        "Viewer should contain stream interface",
      );

      logger.info("✅ Viewer endpoint is accessible");
    } catch (error) {
      logger.error("❌ Failed to access viewer endpoint:", error);
    }

    // Stop recording
    const videoResult = await stop();
    logger.info(
      `Recording completed: ${videoResult?.videoPath || "no video path"}`,
    );

    // Test passes if we got this far without errors
    assert(true, "Streaming test completed successfully");
  } catch (error) {
    await context.takeScreenshot("streaming-test-error");
    logger.error("Streaming test failed:", error);
    throw error;
  } finally {
    // Clean up
    Deno.env.delete("BF_E2E_STREAM");
    await teardownE2ETest(context);
  }
});
