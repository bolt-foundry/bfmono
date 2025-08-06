import { runShellCommand } from "@bfmono/infra/bff/shellBase.ts";
import { getLogger } from "@bfmono/packages/logger/logger.ts";
import type { TaskDefinition } from "@bfmono/infra/bft/bft.ts";
import { parseArgs } from "@std/cli/parse-args";

const logger = getLogger(import.meta);

export async function testCommand(options: Array<string>): Promise<number> {
  // Parse arguments to extract verbose flag
  const parsed = parseArgs(options, {
    boolean: ["verbose", "v"],
    alias: { v: "verbose" },
  });

  const verbose = parsed.verbose || parsed.v;
  const remainingArgs = parsed._.map(String);

  if (!verbose) {
    logger.info("Running tests (errors only)...");
  } else {
    logger.info("Running tests...");
  }
  logger.debug("Test command options:", options);

  const args = ["deno", "test", "-A", "--no-check"];

  // Remove --quiet flag when verbose mode is enabled
  if (!verbose) {
    args.push("--quiet");
  }

  // Exclude E2E tests by default unless specifically requested
  const hasE2EFlag = remainingArgs.some((opt) =>
    opt.includes("e2e") || opt.includes("E2E")
  );
  if (!hasE2EFlag) {
    args.push("--ignore=**/*.e2e.ts");
    logger.debug("Added E2E exclusion");
  }

  // Exclude Sapling backup files
  args.push("--ignore=.sl/**");

  // Exclude shared folder
  args.push("--ignore=shared/**");

  // Pass through remaining arguments to deno test
  args.push(...remainingArgs);

  logger.debug("Final test command args:", args);

  if (!verbose) {
    // Capture output and filter for errors only
    const command = new Deno.Command(args[0], {
      args: args.slice(1),
      stdout: "piped",
      stderr: "piped",
    });

    const process = command.spawn();

    // Collect output
    let outputBuffer = "";
    let errorBuffer = "";

    const [_stdout, _stderr, status] = await Promise.all([
      process.stdout.pipeTo(
        new WritableStream({
          write(chunk) {
            const text = new TextDecoder().decode(chunk);
            outputBuffer += text;
          },
        }),
      ),
      process.stderr.pipeTo(
        new WritableStream({
          write(chunk) {
            const text = new TextDecoder().decode(chunk);
            errorBuffer += text;
          },
        }),
      ),
      process.status,
    ]);

    // Process the collected output after the process completes
    const lines = outputBuffer.split("\n");
    let _hasShownError = false;

    for (const line of lines) {
      // Show lines that contain errors, failures, or are part of error context
      if (
        line.includes("error") ||
        line.includes("Error") ||
        line.includes("FAILED") ||
        line.includes("failure") ||
        line.includes("✗") ||
        line.includes("at ") || // Stack traces
        line.match(/^\s*at\s+/) || // Stack trace lines
        line.includes("expected") ||
        line.includes("received") ||
        line.includes("AssertionError") ||
        line.match(/^\s*\d+\s+\|/) || // Line numbers in error context
        (line.includes("test result:") && line.includes("failed"))
      ) {
        logger.info(line);
        _hasShownError = true;
      }
    }

    // Always show stderr if there's any content
    if (errorBuffer.trim()) {
      logger.error(errorBuffer);
    }

    const result = status.code;

    if (result === 0) {
      logger.info("✨ All tests passed!");
    } else {
      logger.error("❌ Tests failed");
    }

    return result;
  } else {
    // Verbose mode: show all output
    const result = await runShellCommand(args);

    if (result === 0) {
      logger.info("✨ All tests passed!");
    } else {
      logger.error("❌ Tests failed");
    }

    return result;
  }
}

export const bftDefinition = {
  description: "Run Deno tests",
  fn: testCommand,
} satisfies TaskDefinition;
