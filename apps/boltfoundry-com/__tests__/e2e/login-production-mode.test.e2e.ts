import { assert } from "@std/assert";
import {
  navigateTo,
  teardownE2ETest,
} from "@bfmono/infra/testing/e2e/setup.ts";
import { setupBoltFoundryComTest } from "../helpers.ts";

Deno.test("Login page does not show development warnings in production mode", async () => {
  const context = await setupBoltFoundryComTest();

  try {
    // Start video recording
    const { stop, showSubtitle } = await context.startRecording(
      "login-production-mode-fix",
    );

    await showSubtitle("Production Login Page - No Development Warnings");

    // Navigate to login page
    await navigateTo(context, "/login");
    await context.__UNSAFE_page_useContextMethodsInstead.waitForNetworkIdle({
      timeout: 3000,
    });

    // Get page content
    const bodyText = await context.__UNSAFE_page_useContextMethodsInstead
      .evaluate(() => document.body.textContent);

    // Verify login page loaded
    assert(
      bodyText?.includes("Sign In to Bolt Foundry"),
      "Login page should load",
    );

    // Verify NO development warnings appear
    assert(
      !bodyText?.includes("Development Environment"),
      "Should NOT show 'Development Environment' warning in production",
    );

    assert(
      !bodyText?.includes("Codebot Environment"),
      "Should NOT show 'Codebot Environment' warning in production",
    );

    assert(
      !bodyText?.includes("SSH port forwarding"),
      "Should NOT show SSH port forwarding instructions in production",
    );

    assert(
      !bodyText?.includes("Development Options"),
      "Should NOT show 'Development Options' section in production",
    );

    // Take screenshot for visual verification
    await context.takeScreenshot("login-page-production-mode");

    await showSubtitle("✅ Clean production login page - no warnings!");

    // Stop video recording
    const videoResult = await stop();
    if (videoResult) {
      // Video recording completed successfully
    }
  } finally {
    await teardownE2ETest(context);
  }
});
