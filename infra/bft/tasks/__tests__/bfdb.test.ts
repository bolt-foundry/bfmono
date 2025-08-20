import { getConfigurationVariable } from "@bolt-foundry/get-configuration-var";
import { assertEquals, assertExists } from "@std/assert";
import { bftDefinition } from "../bfdb.bft.ts";
import { ui } from "@bfmono/packages/tui/tui.ts";

Deno.test("bfdb command - smoke test for file existence", () => {
  // Just verify the function exists and is callable
  assertExists(bftDefinition);
  assertExists(bftDefinition.fn);
  assertEquals(typeof bftDefinition.fn, "function");
});

Deno.test("bfdb command - validates query argument", () => {
  // Capture ui output
  const originalError = ui.error;
  const originalOutput = ui.output;

  let errorOutput = "";
  let _logOutput = "";

  ui.error = (msg: string) => {
    errorOutput = msg;
  };
  ui.output = (msg: string) => {
    _logOutput = msg;
  };

  const exitCode = bftDefinition.fn([]);

  // Restore originals
  ui.error = originalError;
  ui.output = originalOutput;

  // Verify error handling
  assertEquals(errorOutput, "Error: --query or -q argument is required");
  assertEquals(exitCode, 1);
});

Deno.test("bfdb command - handles non-existent database gracefully", () => {
  // Create a temp test database path that doesn't exist
  const testDbPath = `tmp/test-nonexistent-${Date.now()}.sqlite`;

  // Set environment variable for test
  const originalEnv = getConfigurationVariable("SQLITE_DB_PATH");
  Deno.env.set("SQLITE_DB_PATH", testDbPath);

  const originalError = ui.error;

  let _errorOutput = "";

  ui.error = (msg: string) => {
    _errorOutput = msg;
  };

  const exitCode = bftDefinition.fn(["--query", "SELECT 1"]);

  // Restore
  ui.error = originalError;
  if (originalEnv) {
    Deno.env.set("SQLITE_DB_PATH", originalEnv);
  } else {
    Deno.env.delete("SQLITE_DB_PATH");
  }

  // Should fail gracefully
  assertEquals(exitCode, 1);
});
