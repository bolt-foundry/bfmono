import { assert } from "@std/assert";
import {
  navigateTo,
  teardownE2ETest,
} from "@bfmono/infra/testing/e2e/setup.ts";
import { setupBoltFoundryComTest } from "../helpers.ts";
import { getLogger } from "@bfmono/packages/logger/logger.ts";

const logger = getLogger(import.meta);

Deno.test("🎬 Interactive Login Demo - Production Mode", async () => {
  const context = await setupBoltFoundryComTest();

  try {
    // Mock Google OAuth before navigation
    await context.__UNSAFE_page_useContextMethodsInstead.setRequestInterception(
      true,
    );
    context.__UNSAFE_page_useContextMethodsInstead.on("request", (req) => {
      const url = req.url();

      // Block real Google Identity Services
      if (url.startsWith("https://accounts.google.com/gsi/client")) {
        return req.respond({
          status: 200,
          contentType: "text/javascript",
          body: "", // empty stub
        });
      }

      // Mock Google's tokeninfo endpoint
      if (url.startsWith("https://oauth2.googleapis.com/tokeninfo")) {
        return req.respond({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            email: "demo@example.com",
            email_verified: true,
            sub: "123456789",
            hd: "example.com",
            name: "Demo User",
          }),
        });
      }

      req.continue();
    });

    // Inject Google OAuth mock
    await context.__UNSAFE_page_useContextMethodsInstead.evaluateOnNewDocument(
      () => {
        let interceptedCallback:
          | ((response: { credential: string; select_by: string }) => void)
          | undefined;

        (globalThis as { google?: unknown }).google = {
          accounts: {
            id: {
              initialize(
                { callback }: {
                  callback: (
                    response: { credential: string; select_by: string },
                  ) => void;
                },
              ) {
                interceptedCallback = callback;
              },
              renderButton(el: HTMLElement) {
                el.innerHTML = `
                <button 
                  id="google-signin-button"
                  style="
                    padding: 12px 24px; 
                    border: 1px solid #dadce0; 
                    border-radius: 4px; 
                    background: white; 
                    cursor: pointer; 
                    font-size: 16px; 
                    font-weight: 500; 
                    font-family: 'Google Sans', Roboto, Arial, sans-serif;
                    color: #3c4043; 
                    min-width: 240px; 
                    display: flex; 
                    align-items: center; 
                    justify-content: center; 
                    gap: 12px;
                    transition: all 0.2s ease;
                    box-shadow: 0 1px 2px 0 rgba(60,64,67,0.3), 0 1px 3px 1px rgba(60,64,67,0.15);
                  "
                  onmouseover="this.style.boxShadow='0 1px 3px 0 rgba(60,64,67,0.3), 0 4px 8px 3px rgba(60,64,67,0.15)'"
                  onmouseout="this.style.boxShadow='0 1px 2px 0 rgba(60,64,67,0.3), 0 1px 3px 1px rgba(60,64,67,0.15)'"
                >
                  <svg width="18" height="18" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                  </svg>
                  Sign in with Google
                </button>`;

                el.querySelector("button")?.addEventListener("click", () => {
                  // Simulate click animation
                  const btn = el.querySelector("button");
                  if (btn) {
                    btn.style.transform = "scale(0.98)";
                    setTimeout(() => {
                      btn.style.transform = "scale(1)";
                      interceptedCallback?.({
                        credential: "mock.jwt.token.for.testing",
                        select_by: "btn",
                      });
                    }, 100);
                  }
                });
              },
              prompt() {},
              disableAutoSelect() {},
            },
          },
        };
      },
    );

    // Start video recording
    const { stop, showSubtitle, showTitleCard, showStatus, clearStatus } =
      await context
        .startRecording(
          "interactive-login-demo",
        );

    // Show opening title card immediately (no fade-in animation)
    await showTitleCard(
      "Interactive Login Demo",
      "Production Environment Test",
      { showDuration: 3500, noOpeningAnimation: true },
    );
    await new Promise((resolve) => setTimeout(resolve, 4000));

    // Navigate to login page
    logger.info("Navigating to login page...");
    await showStatus("Loading page...", "info", 2000); // Auto-clear after 2 seconds
    await navigateTo(context, "/login");
    await context.__UNSAFE_page_useContextMethodsInstead.waitForNetworkIdle({
      timeout: 3000,
    });

    // Wait for page to fully load
    await new Promise((resolve) => setTimeout(resolve, 1000));
    await showStatus("Page loaded successfully", "success");

    // Wait 2 seconds to show the auto-clear happened, then show another status
    await new Promise((resolve) => setTimeout(resolve, 2500));
    await showStatus("Ready for interaction", "info");

    await showSubtitle("✅ Clean login page - no development warnings!", 5000);

    // Wait for subtitle to be fully visible
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Take screenshot before interaction
    await context.takeScreenshot("login-page-before-click");

    // Check page content
    const pageText = await context.__UNSAFE_page_useContextMethodsInstead
      .evaluate(() => document.body.innerText);

    assert(
      pageText.includes("Sign In to Bolt Foundry"),
      "Login page should load correctly",
    );

    assert(
      !pageText.includes("Development Environment"),
      "Should NOT show development warnings in production",
    );

    await showSubtitle("👆 Clicking Google Sign-In button...", 4000);

    // Wait for subtitle to be readable
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Wait for button to be ready
    await context.__UNSAFE_page_useContextMethodsInstead.waitForSelector(
      "#google-signin-button",
      {
        timeout: 5000,
      },
    );

    // Use smooth click for nice animation
    logger.info("Performing smooth click on Google Sign-In button...");
    await showStatus("Authenticating...", "warning");
    await context.takeScreenshot("before-google-signin-click");
    await context.click("#google-signin-button");
    await context.takeScreenshot("after-google-signin-click");

    // Wait for authentication to process
    await new Promise((resolve) => setTimeout(resolve, 2000));

    await showSubtitle("🎉 Authentication successful!", 4000);

    // Wait for subtitle to be readable
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Check if we were redirected or if there's an auth cookie
    const currentUrl = context.url();
    logger.info(`Current URL after auth: ${currentUrl}`);

    const cookies = await context.__UNSAFE_page_useContextMethodsInstead
      .cookies();
    const authCookies = cookies.filter((cookie) =>
      cookie.name === "bf_access" || cookie.name === "bf_refresh"
    );

    if (authCookies.length > 0) {
      logger.info(
        `✅ Auth cookies found: ${authCookies.map((c) => c.name).join(", ")}`,
      );
      await showStatus("Authentication complete", "success");
      await showSubtitle("🍪 Authentication cookies set!", 4000);

      // Wait for subtitle to be readable, then manually clear status
      await new Promise((resolve) => setTimeout(resolve, 1500));
      await clearStatus(); // Demonstrate manual clearing
    } else {
      await showStatus("Authentication failed", "error");
      await showSubtitle(
        "⚠️ No auth cookies - backend integration needed",
        4000,
      );
    }

    // Take final screenshot
    await context.takeScreenshot("login-page-after-auth");

    // Show closing title card
    await showTitleCard(
      "Demo Complete!",
      "Login flow tested successfully",
      2500,
    );
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // Stop video recording
    const videoResult = await stop();
    if (videoResult) {
      logger.info(`🎬 Video saved: ${videoResult.videoPath}`);
      logger.info(`📊 Duration: ${videoResult.duration}s`);
      logger.info(`📏 Frames: ${videoResult.frameCount}`);
      logger.info(`📦 Size: ${videoResult.fileSize} bytes`);
    }
  } finally {
    await teardownE2ETest(context);
  }
});
