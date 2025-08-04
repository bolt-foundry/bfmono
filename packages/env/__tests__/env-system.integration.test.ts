import { assertEquals } from "@std/assert";
import { formatEnvFile, parseEnvFile } from "../utils.ts";
import { join } from "@std/path";

// Create a test directory for isolated testing
const testDir = await Deno.makeTempDir({ prefix: "env-test-" });

// Helper to create test files
async function createTestFile(filename: string, content: string) {
  await Deno.writeTextFile(join(testDir, filename), content);
}

// Helper to read test files
async function readTestFile(filename: string): Promise<string> {
  return await Deno.readTextFile(join(testDir, filename));
}

// Helper to run commands in test directory
async function runCommand(
  cmd: Array<string>,
  cwd = testDir,
): Promise<{ stdout: string; stderr: string; code: number }> {
  const command = new Deno.Command(cmd[0], {
    args: cmd.slice(1),
    cwd,
    stdout: "piped",
    stderr: "piped",
    env: {
      ...Deno.env.toObject(),
      // Override to use test directory
      DENO_DIR: join(testDir, ".deno"),
    },
  });

  const child = command.spawn();
  const output = await child.output();

  return {
    stdout: new TextDecoder().decode(output.stdout),
    stderr: new TextDecoder().decode(output.stderr),
    code: output.code,
  };
}

Deno.test("Environment System Integration Tests", async (t) => {
  // Set up test environment files
  await t.step("setup test environment", async () => {
    await createTestFile(
      ".env.config.example",
      `# Config variables
POSTHOG_API_KEY=phc_test_key
LOG_LEVEL=debug
GOOGLE_OAUTH_CLIENT_ID=test.apps.googleusercontent.com
`,
    );

    await createTestFile(
      ".env.secrets.example",
      `# Secret variables
DATABASE_URL=postgresql://test:test@localhost:5432/test
JWT_SECRET=test_secret_key_at_least_32_chars_long
OPENAI_API_KEY=sk-test-key
EMAIL_HOST=smtp.test.com
`,
    );
  });

  await t.step("parseEnvFile correctly parses environment files", () => {
    const content = `# Comment line
KEY1=value1
KEY2="quoted value"
KEY3='single quoted'
EMPTY=
MULTIWORD=hello world
SPECIAL_CHARS=test@example.com
WITH_EQUALS=key=value
ESCAPED="line1\\nline2"
`;

    const parsed = parseEnvFile(content);

    assertEquals(parsed.KEY1, "value1");
    assertEquals(parsed.KEY2, "quoted value");
    assertEquals(parsed.KEY3, "single quoted");
    assertEquals(parsed.EMPTY, "");
    assertEquals(parsed.MULTIWORD, "hello world");
    assertEquals(parsed.SPECIAL_CHARS, "test@example.com");
    assertEquals(parsed.WITH_EQUALS, "key=value");
    assertEquals(parsed.ESCAPED, "line1\nline2");
  });

  await t.step("formatEnvFile correctly formats variables", () => {
    const vars = {
      SIMPLE: "value",
      WITH_SPACE: "hello world",
      WITH_QUOTE: 'value with "quotes"',
      WITH_NEWLINE: "line1\nline2",
      EMPTY: "",
    };

    const formatted = formatEnvFile(vars);

    assertEquals(formatted.includes("SIMPLE=value"), true);
    assertEquals(formatted.includes('WITH_SPACE="hello world"'), true);
    assertEquals(
      formatted.includes('WITH_QUOTE="value with \\"quotes\\""'),
      true,
    );
    assertEquals(formatted.includes('WITH_NEWLINE="line1\\nline2"'), true);
    assertEquals(formatted.includes("EMPTY="), true);
  });

  await t.step("env wrapper loads variables correctly", async () => {
    // Create test env files
    await createTestFile(
      ".env.config",
      "TEST_VAR=client_value\nCLIENT_ONLY=true",
    );
    await createTestFile(
      ".env.secrets",
      "TEST_VAR=server_value\nSERVER_ONLY=true",
    );
    await createTestFile(".env.local", "TEST_VAR=local_value\nLOCAL_ONLY=true");

    // Test the env wrapper
    const testScript = `
import { env } from "${
      new URL(import.meta.resolve("@bfmono/packages/env/mod.ts")).pathname
    }";

console.log(JSON.stringify({
  TEST_VAR: env.TEST_VAR,
  CLIENT_ONLY: env.CLIENT_ONLY,
  SERVER_ONLY: env.SERVER_ONLY,
  LOCAL_ONLY: env.LOCAL_ONLY,
  MODE: env.MODE,
  PROD: env.PROD,
  DEV: env.DEV,
  SSR: env.SSR,
}));
`;

    await createTestFile("test-env-wrapper.ts", testScript);

    const result = await runCommand([
      "deno",
      "run",
      "--allow-read",
      "--allow-env",
      "--import-map",
      join(Deno.cwd(), "deno.jsonc"),
      "test-env-wrapper.ts",
    ]);
    assertEquals(result.code, 0, `Script failed: ${result.stderr}`);

    const output = JSON.parse(result.stdout);

    // .env.local should override others
    assertEquals(output.TEST_VAR, "local_value");
    assertEquals(output.CLIENT_ONLY, true); // Should be converted to boolean
    assertEquals(output.SERVER_ONLY, true);
    assertEquals(output.LOCAL_ONLY, true);

    // Check computed properties
    assertEquals(output.MODE, "development");
    assertEquals(output.PROD, false);
    assertEquals(output.DEV, true);
    assertEquals(output.SSR, true);
  });

  await t.step(
    "bft sitevar sync creates env files (SKIPPED - requires 1Password)",
    () => {
      // Skip this test as it requires 1Password authorization
      // deno-lint-ignore no-console
      console.log("Skipping test - requires 1Password authorization");
      return;
    },
  );

  await t.step(
    "type generation creates correct TypeScript definitions",
    async () => {
      const genScript = `
import { generateEnvTypes } from "${
        new URL(import.meta.resolve("@bfmono/packages/env/generate-types.ts"))
          .pathname
      }";

// Change to test directory
Deno.chdir("${testDir}");

// Generate types
const types = await generateEnvTypes();
await Deno.writeTextFile("env.d.ts", types);
`;

      await createTestFile("test-generate.ts", genScript);

      const result = await runCommand([
        "deno",
        "run",
        "--allow-read",
        "--allow-write",
        "test-generate.ts",
      ]);

      assertEquals(result.code, 0, `Generate failed: ${result.stderr}`);

      // Check generated types
      const types = await readTestFile("env.d.ts");

      // Should include config variables
      assertEquals(types.includes("readonly POSTHOG_API_KEY?: string;"), true);
      assertEquals(types.includes("readonly LOG_LEVEL?: string;"), true);

      // Should include secret variables
      assertEquals(types.includes("readonly DATABASE_URL?: string;"), true);
      assertEquals(types.includes("readonly JWT_SECRET?: string;"), true);

      // Should have environment-aware interfaces
      assertEquals(
        types.includes("interface Client extends BaseImportMetaEnv"),
        true,
      );
      assertEquals(
        types.includes("interface Server extends BaseImportMetaEnv"),
        true,
      );
    },
  );

  await t.step("vite plugin only exposes config variables", async () => {
    // This tests the security boundary
    const viteScript = `
import { boltFoundryEnvPlugin } from "${
      new URL(import.meta.resolve("@bfmono/packages/env/vite-plugin.ts"))
        .pathname
    }";

// Change to test directory
Deno.chdir("${testDir}");

// Create test env files
await Deno.writeTextFile(".env.config", "CLIENT_VAR=client_value\\n");
await Deno.writeTextFile(".env.secrets", "SERVER_SECRET=secret_value\\n");

// Mock Vite config
const mockConfig = { base: "/" };
const plugin = boltFoundryEnvPlugin();

// Call the config hook
const result = plugin.config(mockConfig, { mode: "development" });

// Check that only config vars are defined
const hasClientVar = "import.meta.env.CLIENT_VAR" in result.define;
const hasServerVar = "import.meta.env.SERVER_SECRET" in result.define;

console.log(JSON.stringify({
  hasClientVar,
  hasServerVar,
  clientValue: result.define["import.meta.env.CLIENT_VAR"],
}));
`;

    await createTestFile("test-vite.ts", viteScript);

    const result = await runCommand([
      "deno",
      "run",
      "--allow-read",
      "--allow-write",
      "--allow-env",
      "test-vite.ts",
    ]);

    assertEquals(result.code, 0, `Vite plugin test failed: ${result.stderr}`);

    const output = JSON.parse(result.stdout);

    // Config var should be included
    assertEquals(output.hasClientVar, true);
    assertEquals(output.clientValue, '"client_value"'); // JSON stringified

    // Secret var should NOT be included (security boundary)
    assertEquals(output.hasServerVar, false);
  });

  await t.step("TypeScript definitions are properly generated", async () => {
    // Test that TypeScript compilation works with the generated types
    const typeTestScript = `
/// <reference path="${
      new URL(import.meta.resolve("@bfmono/env.d.ts")).pathname
    }" />

// This should compile without errors showing that types work
function testTypes() {
  // Config-safe types should be available
  const clientVar: string | undefined = undefined as unknown as ImportMetaEnv.Client['GOOGLE_OAUTH_CLIENT_ID'];
  
  // Secret types should be available
  const serverVar: string | undefined = undefined as unknown as ImportMetaEnv.Server['GOOGLE_OAUTH_CLIENT_SECRET'];
  
  // This compiling means the types are properly set up
  console.log("Type compilation successful");
}

testTypes();
console.log("SUCCESS");
`;

    await createTestFile("test-types.ts", typeTestScript);

    const result = await runCommand([
      "deno",
      "run",
      "--allow-read",
      "--allow-env",
      "--check",
      "test-types.ts",
    ]);

    assertEquals(result.code, 0, `Type test failed: ${result.stderr}`);
    assertEquals(result.stdout.includes("SUCCESS"), true);
  });
});

// Cleanup
Deno.test("cleanup", () => {
  Deno.removeSync(testDir, { recursive: true });
});
