import { getConfigurationVariable } from "@bolt-foundry/get-configuration-var";
import { assertEquals } from "@std/assert";
import { handleGoogleAuthRequest } from "./googleAuth.ts";

Deno.test("Dev auth token handling", async (t) => {
  // Save original env
  const originalBfEnv = getConfigurationVariable("BF_ENV");

  try {
    await t.step(
      "should accept dev tokens when BF_ENV=development",
      async () => {
        Deno.env.set("BF_ENV", "development");

        const mockDevToken = btoa(JSON.stringify({
          dev: true,
          sub: "test-user-123",
          email: "test@example.com",
          name: "Test User",
          iat: Math.floor(Date.now() / 1000),
          exp: Math.floor(Date.now() / 1000) + 3600,
        }));

        const request = new Request("http://localhost/api/auth/google", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ idToken: mockDevToken }),
        });

        const response = await handleGoogleAuthRequest(request);

        assertEquals(response.status, 200);

        const body = await response.json();
        assertEquals(body.success, true);
        assertEquals(body.message, "Dev authentication successful");
        assertEquals(body.user.email, "test@example.com");

        // Check cookies
        const cookies = response.headers.get("Set-Cookie");
        assertEquals(cookies?.includes("dev-access-test-user-123"), true);
      },
    );

    await t.step(
      "should reject dev tokens when BF_ENV is not development",
      async () => {
        Deno.env.set("BF_ENV", "production");

        const mockDevToken = btoa(JSON.stringify({
          dev: true,
          sub: "test-user-123",
          email: "test@example.com",
          name: "Test User",
          iat: Math.floor(Date.now() / 1000),
          exp: Math.floor(Date.now() / 1000) + 3600,
        }));

        const request = new Request("http://localhost/api/auth/google", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ idToken: mockDevToken }),
        });

        const response = await handleGoogleAuthRequest(request);

        // Should fail since CurrentViewer.loginWithGoogleToken will reject invalid tokens
        assertEquals(response.status, 500);
      },
    );

    await t.step("should handle non-JSON tokens gracefully", async () => {
      Deno.env.set("BF_ENV", "development");

      const request = new Request("http://localhost/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken: "not-a-valid-base64-json" }),
      });

      const response = await handleGoogleAuthRequest(request);

      // Should continue to normal Google auth flow and fail
      assertEquals(response.status, 500);
    });

    await t.step("should reject GET requests", async () => {
      const request = new Request("http://localhost/api/auth/google", {
        method: "GET",
      });

      const response = await handleGoogleAuthRequest(request);
      assertEquals(response.status, 405);
    });
  } finally {
    // Restore original env
    if (originalBfEnv) {
      Deno.env.set("BF_ENV", originalBfEnv);
    } else {
      Deno.env.delete("BF_ENV");
    }
  }
});
