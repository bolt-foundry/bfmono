#! /usr/bin/env -S bff

// FILE: infra/bff/friends/ci.bff.ts

import { register } from "@bfmono/infra/bff/bff.ts";
import { runShellCommandWithOutput } from "@bfmono/infra/bff/shellBase.ts";
import { getLogger } from "@bfmono/packages/logger/logger.ts";
import { loggerGithub } from "@bfmono/infra/bff/githubLogger.ts";
import { refreshAllSecrets } from "@bfmono/packages/get-configuration-var/get-configuration-var.ts";

const logger = getLogger(import.meta);

type GhMeta = {
  file?: string;
  line?: number;
  col?: number;
};

// Quick helpers to unify normal logging & GH annotations
const logCI = {
  info: (msg: string) => {
    logger.info(msg);
  },
  error: (msg: string, meta?: GhMeta) => {
    if (meta) {
      loggerGithub.error(msg, meta);
    } else {
      logger.error(msg);
    }
  },
  warn: (msg: string, meta?: GhMeta) => {
    if (meta) {
      loggerGithub.warn(msg, meta);
    } else {
      logger.warn(msg);
    }
  },
  debug: (msg: string, meta?: GhMeta) => {
    if (meta) {
      loggerGithub.warn(msg, meta);
    } else {
      logger.debug(msg);
    }
  },
};

// ----------------------------------------------------------------------------
// 1. Lint step
// ----------------------------------------------------------------------------

async function runLintStep(useGithub: boolean): Promise<number> {
  logger.info("Running deno lint");
  // If useGithub, do `deno lint --json` so we can parse it ourselves
  const cmdArray = ["deno", "lint"];
  if (useGithub) {
    cmdArray.push("--json");
  }

  const { code: errorCode, stdout } = await runShellCommandWithOutput(
    cmdArray,
    {},
    /* useSpinner */ true,
    /* silent */ useGithub, // or "false" if you still want logs
  );

  // If GitHub annotations mode, parse JSON output and emit annotations
  if (useGithub) {
    logger.debug(`Received lint output (${stdout.length} bytes)`);

    // Try to determine if output is valid JSON
    let isValidJson = false;
    try {
      JSON.parse(stdout);
      isValidJson = true;
      logger.debug("Lint output is valid JSON");
    } catch (e) {
      logger.error("Lint output is not valid JSON:", (e as Error).message);
      logger.debug("First 200 chars of output:", stdout.substring(0, 200));
    }

    if (isValidJson) {
      parseDenoLintJsonOutput(stdout);
    } else {
      logger.warn("Skipping JSON parsing for lint output - invalid JSON");
    }
  }
  return errorCode;
}

/** If `deno lint --json` was used, parse JSON and emit GH Annotations. */
function parseDenoLintJsonOutput(jsonString: string) {
  try {
    // Debug log the raw JSON to understand the structure
    logger.debug(
      "Raw lint JSON output sample (first 500 chars):",
      jsonString.length > 500
        ? jsonString.substring(0, 500) + "..."
        : jsonString,
    );

    const parsed = JSON.parse(jsonString); // shape: { diagnostics: [...], errors: [...] }

    // Log the full structure of the first diagnostic and error (if any)
    if (parsed.diagnostics?.length > 0) {
      logger.debug(
        "First diagnostic object structure:",
        JSON.stringify(parsed.diagnostics[0], null, 2),
      );
    } else {
      logger.debug("No diagnostics found in lint output");
    }

    if (parsed.errors?.length > 0) {
      logger.debug(
        "First error object structure:",
        JSON.stringify(parsed.errors[0], null, 2),
      );
    } else {
      logger.debug("No errors found in lint output");
    }

    // 1) diagnostics
    for (const diag of parsed.diagnostics ?? []) {
      // The filename might be in a different location in the object structure
      // Try multiple possible locations where filename might be stored
      const filePath = (diag.filename ||
        diag.location?.filename ||
        diag.file?.filename ||
        diag.file ||
        "unknown.ts").replace("file://", "");

      const start = diag.location?.range?.start || diag.range?.start;
      const line = (typeof start?.line === "number")
        ? start.line + 1
        : undefined;
      const col = (typeof start?.character === "number")
        ? start.character + 1
        : undefined;
      const message = diag.message ?? "Unknown lint problem";

      logger.debug(
        `Processing diagnostic: ${filePath}:${line}:${col} - ${
          message.substring(0, 50)
        }...`,
      );
      logCI.debug(message, { file: filePath, line, col });
    }

    // 2) errors
    for (const err of parsed.errors ?? []) {
      const filePath = err.filename ||
        err.location?.filename ||
        err.file?.filename ||
        err.file ||
        "unknown.ts";

      const start = err.location?.range?.start || err.range?.start;
      const line = (typeof start?.line === "number") ? start.line : undefined;
      const col = (typeof start?.character === "number")
        ? start.character
        : undefined;
      const message = err.message ?? "Unknown lint error";

      logger.debug(
        `Processing error: ${filePath}:${line}:${col} - ${
          message.substring(0, 50)
        }...`,
      );
      logCI.error(message, { file: filePath, line, col });
    }
  } catch (err) {
    logger.error("Error parsing deno lint --json output:", err);
  }
}

// ----------------------------------------------------------------------------
// 2. Fmt step
// ----------------------------------------------------------------------------

async function runFormatStep(useGithub: boolean): Promise<number> {
  logger.info("Checking formatting (deno fmt --check)...");
  const { code, stdout } = await runShellCommandWithOutput(
    ["deno", "fmt", "--check"],
    {},
    /* useSpinner */ true,
    /* silent */ useGithub,
  );

  // If GitHub annotations mode, parse the text output
  if (useGithub) {
    parseDenoFmtOutput(stdout);
  }
  return code;
}

/**
 * Parse the plain-text output of `deno fmt --check` for lines referencing file paths, line numbers,
 * etc. This is a simple example that looks for:
 *    from /full/path/to/file.ts:
 *      12 | -    ...
 * and so on, then logs GH annotations as warnings.
 */
function parseDenoFmtOutput(fullOutput: string) {
  // Debug log a sample of the output to understand structure
  logger.debug(
    "Format check output sample (first 500 chars):",
    fullOutput.length > 500 ? fullOutput.substring(0, 500) + "..." : fullOutput,
  );

  const lines = fullOutput.split("\n");
  logger.debug(`Parsing ${lines.length} lines from format output`);
  let currentFile: string | undefined;

  for (const line of lines) {
    // e.g. "from /home/runner/workspace/infra/bff/friends/githubAnnotations.ts:"
    const fromMatch = line.match(/^from\s+([^:]+):$/);
    if (fromMatch) {
      currentFile = fromMatch[1].trim();
      logger.debug(`Found file reference: ${currentFile}`);
      continue;
    }

    // e.g. "  60 | -    const foo = 123;"
    // We'll parse out the line number & mark it as a "warning" annotation
    if (currentFile) {
      // check for blank line => done with that file
      if (line.trim() === "") {
        logger.debug(`End of section for file: ${currentFile}`);
        currentFile = undefined;
        continue;
      }

      const lineMatch = line.match(/^\s+(\d+)\s+\|\s+(.*)$/);
      if (lineMatch) {
        const lineNum = parseInt(lineMatch[1], 10);
        const snippet = lineMatch[2];
        logger.debug(
          `Found format issue at ${currentFile}:${lineNum} - ${
            snippet.substring(0, 50)
          }`,
        );
        // You can produce a more descriptive message if you want
        // e.g. "File not formatted according to deno fmt!"
        logCI.warn(snippet, { file: currentFile, line: lineNum });
        continue;
      } else {
        logger.debug(`Unmatched line in file section: "${line}"`);
      }
    }

    // If we see `error: Found X not formatted files in Y files`
    // we'll mark that as an error annotation.
    if (line.includes("error: Found") && line.includes("not formatted files")) {
      logger.debug(`Found summary error line: ${line}`);
      logCI.error(line.trim());
    }
  }
}

// ----------------------------------------------------------------------------
// 3. Build step
// ----------------------------------------------------------------------------

async function runBuildStep(
  useGithub: boolean,
  _args: Array<string>,
): Promise<number> {
  logger.info("Build step removed - bff build deprecated");
  return 0;
}

// ----------------------------------------------------------------------------
// 4. Test step
// ----------------------------------------------------------------------------

async function runTestStep(_useGithub: boolean): Promise<number> {
  logger.info("Running tests...");
  const testArgs = [
    "bff",
    "test",
  ];

  const envVars = {
    "DENO_WEBGPU": "0",
  };

  const { code } = await runShellCommandWithOutput(
    testArgs,
    envVars,
    true,
  );
  return code;
}

async function runE2ETestStep(_useGithub: boolean): Promise<number> {
  logger.info("Running E2E tests...");

  // Use the newer BFT e2e command that supports dual server setup
  const e2eArgs = [
    "bft",
    "e2e",
    "--build",
  ];

  const { code } = await runShellCommandWithOutput(
    e2eArgs,
    {},
    true,
    false, // Always show e2e output for debugging
  );
  return code;
}

// ----------------------------------------------------------------------------
// 5. Type check step
// ----------------------------------------------------------------------------

async function runTypecheckStep(useGithub: boolean): Promise<number> {
  logger.info("Running deno check for type checking");
  const { code } = await runShellCommandWithOutput(
    ["deno", "check", "packages/**/*.ts", "packages/**/*.tsx"],
    {},
    /* useSpinner */ true,
    /* silent */ useGithub,
  );
  return code;
}

// ----------------------------------------------------------------------------
// 6. Install step
// ----------------------------------------------------------------------------

async function runInstallStep(_useGithub: boolean): Promise<number> {
  const useGithub = false;
  logger.info("Caching dependencies via deno cache .");
  // For the example, we re-use "deno install" since your logs do that.
  // But you might prefer "deno cache --reload ." or similar in your real pipeline.
  const { code } = await runShellCommandWithOutput(
    ["deno", "install"],
    {},
    true,
    useGithub,
  );
  return code;
}

// ----------------------------------------------------------------------------
// MAIN CI pipeline
// ----------------------------------------------------------------------------

async function ciCommand(options: Array<string>) {
  await refreshAllSecrets();
  logger.info("Running CI checks...");
  const useGithub = options.includes("-g");

  // 1) Install / “deno cache”
  const installResult = await runInstallStep(useGithub);

  // 2) Build step
  const buildResult = await runBuildStep(useGithub, options);

  // 3) Lint (with or without JSON mode)
  const lintResult = await runLintStep(useGithub);

  // 4) Unit Test
  const testResult = await runTestStep(useGithub);

  // 5) E2E Test
  const e2eTestResult = await runE2ETestStep(useGithub);

  // 6) Format check
  const fmtResult = await runFormatStep(useGithub);

  // 7) Type check
  const typecheckResult = await runTypecheckStep(useGithub);

  const hasErrors = Boolean(
    installResult || buildResult || lintResult || testResult || e2eTestResult ||
      fmtResult ||
      typecheckResult,
  );

  logger.info("\n📊 CI Checks Summary:");
  logger.info(`Install:   ${installResult === 0 ? "✅" : "❌"}`);
  logger.info(`Build:     ${buildResult === 0 ? "✅" : "❌"}`);
  logger.info(`Lint:      ${lintResult === 0 ? "✅" : "❌"}`);
  logger.info(`Test:      ${testResult === 0 ? "✅" : "❌"}`);
  logger.info(`E2E Test:  ${e2eTestResult === 0 ? "✅" : "❌"}`);
  logger.info(`Format:    ${fmtResult === 0 ? "✅" : "❌"}`);
  logger.info(`TypeCheck: ${typecheckResult === 0 ? "✅" : "❌"}`);

  if (hasErrors) {
    logCI.error("CI checks failed");
    return 1;
  } else {
    logger.info("All CI checks passed");
    return 0;
  }
}

register(
  "ci",
  "Run CI checks (lint, test, build, format). E.g. `bff ci -g` for GH annotations.",
  ciCommand,
  [],
);
