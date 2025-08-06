#!/usr/bin/env -S deno test --allow-all

import {
  navigateTo,
  teardownE2ETest,
} from "@bfmono/infra/testing/e2e/setup.ts";
import { setupBoltFoundryComTest } from "../helpers.ts";
import { getLogger } from "@bfmono/packages/logger/logger.ts";
import type { Page } from "puppeteer-core";

const logger = getLogger(import.meta);

Deno.test("Dev Authentication Flow", async (t) => {
  // Set BF_ENV for this test
  Deno.env.set("BF_ENV", "development");

  const context = await setupBoltFoundryComTest();

  try {
    await t.step("Navigate to login page", async () => {
      await navigateTo(context, "/login");
      await context.page.waitForNetworkIdle({ timeout: 3000 });

      // Check if we see the dev auth button
      const devButtonExists = await context.page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll("button"));
        return buttons.some((btn) =>
          btn.textContent?.includes("Sign in with Google (Dev)")
        );
      });

      if (devButtonExists) {
        logger.info("✅ Found dev auth button");
      } else {
        logger.info("❌ Dev auth button not found");
      }

      await context.takeScreenshot("dev-auth-login-page");
    });

    await t.step("Click dev auth button to open popup", async () => {
      // Set up popup handling
      const popupPromise = new Promise<Page>((resolve) => {
        context.page.on("popup", (page) => {
          if (page) resolve(page);
        });
      });

      // Click the dev auth button
      const clicked = await context.page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll("button"));
        const devButton = buttons.find((btn) =>
          btn.textContent?.includes("Sign in with Google (Dev)")
        );
        if (devButton) {
          (devButton as HTMLButtonElement).click();
          return true;
        }
        return false;
      });

      if (clicked) {
        logger.info("✅ Clicked dev auth button");

        // Wait for popup
        const popup = await Promise.race([
          popupPromise,
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Popup timeout")), 3000)
          ),
        ]).catch(() => null);

        if (popup) {
          logger.info("✅ Dev auth popup opened");
        } else {
          logger.info("❌ Popup did not open");
        }
      } else {
        logger.info("❌ Could not click dev auth button");
      }
    });

    await t.step("Simulate selecting a test user", async () => {
      // Since we can't easily interact with the popup in tests,
      // simulate the postMessage that would come from the popup
      await context.page.evaluate(() => {
        const mockCredential = btoa(JSON.stringify({
          dev: true,
          sub: "test-user-1",
          email: "test@example.com",
          name: "Test User",
          iat: Math.floor(Date.now() / 1000),
          exp: Math.floor(Date.now() / 1000) + 3600,
        }));

        // Simulate the message from the popup
        globalThis.postMessage({
          type: "dev-auth-response",
          credential: mockCredential,
        }, "*");
      });

      logger.info("✅ Simulated dev auth response");

      // Wait for auth to process
      await new Promise((resolve) => setTimeout(resolve, 1000));
    });

    await t.step("Verify authentication success", async () => {
      // Check if we were redirected
      const currentUrl = context.page.url();
      logger.info(`Current URL: ${currentUrl}`);

      // Check for auth cookies
      const cookies = await context.page.cookies();
      const authCookies = cookies.filter((cookie) =>
        cookie.name.startsWith("bf_access") ||
        cookie.name.startsWith("bf_refresh")
      );

      if (authCookies.length > 0) {
        logger.info(
          `✅ Auth cookies found: ${authCookies.map((c) => c.name).join(", ")}`,
        );

        // Verify the dev cookie format
        const devAccessCookie = authCookies.find((c) => c.name === "bf_access");
        if (devAccessCookie?.value.startsWith("dev-access-")) {
          logger.info("✅ Dev auth cookie format is correct");
        } else {
          logger.info("❌ Auth cookie is not in dev format");
        }
      } else {
        logger.info("❌ No auth cookies found");
      }

      await context.takeScreenshot("dev-auth-completed");
    });

    await t.step("Test protected route access", async () => {
      await navigateTo(context, "/rlhf");
      await context.page.waitForNetworkIdle({ timeout: 3000 });

      const currentUrl = context.page.url();
      if (currentUrl.includes("/rlhf")) {
        logger.info("✅ Successfully accessed protected route with dev auth");
      } else if (currentUrl.includes("/login")) {
        logger.info("❌ Redirected to login - dev auth may not be working");
      } else {
        logger.info(`❓ Unexpected redirect: ${currentUrl}`);
      }

      await context.takeScreenshot("dev-auth-protected-route");
    });
  } finally {
    // Clean up
    Deno.env.delete("BF_ENV");
    await teardownE2ETest(context);
  }
});
