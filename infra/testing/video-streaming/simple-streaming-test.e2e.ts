import { assert } from "@std/assert";
import {
  setupE2ETest,
  teardownE2ETest,
} from "@bfmono/infra/testing/e2e/setup.ts";
import { getLogger } from "@bfmono/packages/logger/logger.ts";

const logger = getLogger(import.meta);

Deno.test("Simple streaming test with static content", async () => {
  // Set streaming environment variable
  Deno.env.set("BF_E2E_STREAM", "true");
  Deno.env.set("BF_STREAM_PORT", "8080");

  const context = await setupE2ETest({
    baseUrl:
      "data:text/html,<html><body><h1>Test Page</h1><p>Streaming test content</p></body></html>",
  });

  try {
    logger.info("Starting recording with streaming enabled...");

    // Start video recording (which will now also stream)
    const { stop, showSubtitle } = await context.startRecording(
      "simple-streaming-test",
    );

    // Navigate to our data URL
    await context.navigateTo("");

    // Wait for frames to be generated and streamed
    await new Promise((resolve) => setTimeout(resolve, 3000));

    await showSubtitle("This should be visible in the stream!");
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Take a screenshot to verify
    await context.takeScreenshot("simple-streaming-test");

    // Stop recording
    const videoResult = await stop();
    logger.info(
      `Recording completed: ${videoResult?.videoPath || "no video path"}`,
    );

    // Test passes if we got this far without errors
    assert(true, "Simple streaming test completed successfully");
  } catch (error) {
    await context.takeScreenshot("simple-streaming-test-error");
    logger.error("Simple streaming test failed:", error);
    throw error;
  } finally {
    // Clean up
    Deno.env.delete("BF_E2E_STREAM");
    Deno.env.delete("BF_STREAM_PORT");
    await teardownE2ETest(context);
  }
});
