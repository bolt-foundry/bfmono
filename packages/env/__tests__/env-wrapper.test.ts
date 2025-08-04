import { assertEquals, assertExists } from "@std/assert";
import { env } from "../mod.ts";

Deno.test("env wrapper - basic functionality", async (t) => {
  await t.step("can access system environment variables", () => {
    // PATH should always exist
    assertExists(env.PATH);
    assertEquals(typeof env.PATH, "string");
  });

  await t.step("returns undefined for non-existent variables", () => {
    assertEquals(env.DEFINITELY_DOES_NOT_EXIST_VAR_12345, undefined);
  });

  await t.step("provides special computed properties", () => {
    // These should always have values
    assertEquals(typeof env.MODE, "string");
    assertEquals(typeof env.PROD, "boolean");
    assertEquals(typeof env.DEV, "boolean");
    assertEquals(typeof env.SSR, "boolean");
    assertEquals(typeof env.BASE_URL, "string");

    // In test environment
    assertEquals(env.MODE, "development");
    assertEquals(env.PROD as boolean, false);
    assertEquals(env.DEV as boolean, true);
    assertEquals(env.SSR as boolean, true);
    assertEquals(env.BASE_URL, "/");
  });

  await t.step("converts string booleans to actual booleans", () => {
    // Set test env vars
    Deno.env.set("TEST_TRUE", "true");
    Deno.env.set("TEST_FALSE", "false");
    Deno.env.set("TEST_STRING", "hello");

    assertEquals(env.TEST_TRUE as boolean, true);
    assertEquals(env.TEST_FALSE as boolean, false);
    assertEquals(env.TEST_STRING, "hello");

    // Cleanup
    Deno.env.delete("TEST_TRUE");
    Deno.env.delete("TEST_FALSE");
    Deno.env.delete("TEST_STRING");
  });

  await t.step("supports 'in' operator", () => {
    // System env should exist
    assertEquals("PATH" in env, true);
    assertEquals("HOME" in env, true);

    // Special keys should exist
    assertEquals("MODE" in env, true);
    assertEquals("PROD" in env, true);

    // Non-existent should return false
    assertEquals("DEFINITELY_DOES_NOT_EXIST_VAR_12345" in env, false);
  });

  await t.step("supports Object.keys()", () => {
    const keys = Object.keys(env);

    // Should include system env vars
    assertEquals(keys.includes("PATH"), true);

    // Should include special keys
    assertEquals(keys.includes("MODE"), true);
    assertEquals(keys.includes("PROD"), true);
    assertEquals(keys.includes("DEV"), true);
    assertEquals(keys.includes("SSR"), true);
    assertEquals(keys.includes("BASE_URL"), true);
  });
});

Deno.test("env wrapper - file loading", async (t) => {
  const testDir = await Deno.makeTempDir({ prefix: "env-wrapper-test-" });
  const originalCwd = Deno.cwd();

  try {
    // Change to test directory
    Deno.chdir(testDir);

    await t.step("loads variables from .env files", async () => {
      // Create test env files
      await Deno.writeTextFile(".env.config", "CONFIG_VAR=config_value\n");
      await Deno.writeTextFile(".env.secrets", "SECRET_VAR=secret_value\n");
      await Deno.writeTextFile(
        ".env.local",
        "LOCAL_VAR=local_value\nCONFIG_VAR=overridden\n",
      );

      // Import a fresh module to test loading
      const { env: testEnv } = await import(`../mod.ts?test=${Date.now()}`);

      assertEquals(testEnv.CONFIG_VAR, "overridden"); // .env.local overrides
      assertEquals(testEnv.SECRET_VAR, "secret_value");
      assertEquals(testEnv.LOCAL_VAR, "local_value");
    });

    await t.step("system env overrides file values", async () => {
      // Set system env
      Deno.env.set("CONFIG_VAR", "system_value");

      // Import a fresh module
      const { env: testEnv } = await import(`../mod.ts?test=${Date.now()}-2`);

      assertEquals(testEnv.CONFIG_VAR, "system_value");

      // Cleanup
      Deno.env.delete("CONFIG_VAR");
    });
  } finally {
    // Restore original directory
    Deno.chdir(originalCwd);
    // Cleanup test directory
    await Deno.remove(testDir, { recursive: true });
  }
});

Deno.test("env wrapper - TypeScript usage", () => {
  // This test verifies that TypeScript usage compiles correctly
  // The actual runtime behavior is tested above

  // Basic usage
  const apiKey: string | undefined = env.OPENAI_API_KEY as string | undefined;
  const logLevel: string = (env.LOG_LEVEL as string | undefined) ?? "info";

  // Special properties have known types
  const mode: string = env.MODE as string;
  const isProd: boolean = env.PROD as boolean;
  const isDev: boolean = env.DEV as boolean;
  const isSSR: boolean = env.SSR as boolean;
  const baseUrl: string = env.BASE_URL as string;

  // Can use with nullish coalescing
  const port = env.PORT ?? "3000";

  // Can use with optional chaining (though not needed for our proxy)
  const optional = env.OPTIONAL_VAR?.toString();

  // Type assertions to satisfy compiler
  assertEquals(
    typeof apiKey === "string" || typeof apiKey === "undefined",
    true,
  );
  assertEquals(typeof logLevel, "string");
  assertEquals(typeof mode, "string");
  assertEquals(typeof isProd, "boolean");
  assertEquals(typeof isDev, "boolean");
  assertEquals(typeof isSSR, "boolean");
  assertEquals(typeof baseUrl, "string");
  assertEquals(typeof port, "string");
  assertEquals(typeof optional, "undefined");
});
