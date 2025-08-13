import { getConfigurationVariable } from "@bolt-foundry/get-configuration-var";
import { runShellCommand } from "@bfmono/infra/bff/shellBase.ts";
import { getLogger } from "@bfmono/packages/logger/logger.ts";
import type { TaskDefinition } from "@bfmono/infra/bft/bft.ts";
import {
  getRequiredServers,
  type ServerConfig,
} from "@bfmono/infra/testing/e2e/server-registry.ts";
import { expandGlob } from "@std/fs";
import { resolve } from "@std/path";
import { parseArgs } from "@std/cli";
import { join } from "@std/path";

const logger = getLogger(import.meta);

/**
 * Storage for running servers to clean up later
 */
const runningServers = new Map<string, Deno.ChildProcess>();

/**
 * Lock file management for preventing concurrent E2E test runs
 */
const LOCK_FILE_PATH = join(Deno.cwd(), "tmp", "e2e.lock");
const LOCK_CHECK_INTERVAL = 1000; // Check every second
const MAX_WAIT_TIME = 30000; // Wait up to 30 seconds

/**
 * Acquire E2E lock, waiting if another process has it
 */
async function acquireE2ELock(): Promise<void> {
  const startTime = Date.now();

  while (Date.now() - startTime < MAX_WAIT_TIME) {
    try {
      // Try to create lock file exclusively
      await Deno.mkdir(join(Deno.cwd(), "tmp"), { recursive: true });

      // Check if lock file exists
      try {
        const lockInfo = await Deno.readTextFile(LOCK_FILE_PATH);
        const lockData = JSON.parse(lockInfo);

        // Check if the process that created the lock is still running
        try {
          // Try to kill with signal 0 (no-op) to test if process exists
          Deno.kill(lockData.pid, "SIGTERM");
          // If we get here, process exists, so wait
          logger.info(
            `⏳ E2E tests already running (PID: ${lockData.pid}). Waiting...`,
          );
          await new Promise((resolve) =>
            setTimeout(resolve, LOCK_CHECK_INTERVAL)
          );
          continue;
        } catch {
          // Process doesn't exist, remove stale lock
          logger.info("🧹 Removing stale E2E lock file");
          await Deno.remove(LOCK_FILE_PATH);
        }
      } catch {
        // Lock file doesn't exist, proceed to create it
      }

      // Create lock file
      const lockData = {
        pid: Deno.pid,
        timestamp: new Date().toISOString(),
        command: "bft e2e",
      };

      await Deno.writeTextFile(
        LOCK_FILE_PATH,
        JSON.stringify(lockData, null, 2),
      );
      logger.info(`🔒 Acquired E2E lock (PID: ${Deno.pid})`);
      return;
    } catch (error) {
      if (error instanceof Deno.errors.AlreadyExists) {
        // Lock file was created by another process, wait and retry
        await new Promise((resolve) =>
          setTimeout(resolve, LOCK_CHECK_INTERVAL)
        );
        continue;
      }
      throw error;
    }
  }

  throw new Error(
    `Failed to acquire E2E lock after ${MAX_WAIT_TIME}ms. Another E2E test may be running.`,
  );
}

/**
 * Release the E2E lock
 */
async function releaseE2ELock(): Promise<void> {
  try {
    await Deno.remove(LOCK_FILE_PATH);
    logger.info("🔓 Released E2E lock");
  } catch (error) {
    if (!(error instanceof Deno.errors.NotFound)) {
      logger.warn("Failed to remove E2E lock file:", error);
    }
  }
}

/**
 * Find available port starting from the default port
 */
function findAvailablePort(defaultPort: number): number {
  let port = defaultPort;
  while (port < defaultPort + 100) {
    try {
      const listener = Deno.listen({ port });
      listener.close();
      return port;
    } catch {
      port++;
    }
  }
  throw new Error(`Could not find available port starting from ${defaultPort}`);
}

/**
 * Check if a server is already running on common ports
 */
async function checkExistingServer(
  server: ServerConfig,
  verbose = false,
): Promise<string | undefined> {
  // Check multiple common ports for the server
  const portsToCheck = [server.defaultPort];

  // Add common dev server ports for boltfoundry-com
  if (server.name === "boltfoundry-com") {
    portsToCheck.push(8000); // Common dev server port
  }

  for (const port of portsToCheck) {
    const url = `http://localhost:${port}`;
    try {
      if (verbose) {
        logger.info(`🔍 Checking for existing ${server.name} server at ${url}`);
      }
      const response = await fetch(`${url}/health`);
      if (response.ok) {
        if (verbose) {
          logger.info(`✅ Found existing ${server.name} server at ${url}`);
        }
        return url;
      }
    } catch {
      // Server not running on this port, try next
    }
  }

  return undefined;
}

/**
 * Start a server and wait for it to be ready
 */
async function startServer(
  server: ServerConfig,
  verbose = false,
): Promise<string> {
  const port = await findAvailablePort(server.defaultPort);
  const serverUrl = `http://localhost:${port}`;

  logger.info(`🔄 Starting ${server.name} on port ${port}...`);

  // Start the server process
  const isBinary = !server.serverPath.endsWith(".ts") &&
    !server.serverPath.endsWith(".tsx");

  let command: Deno.Command;
  if (server.name === "aibff-gui") {
    // Special case for aibff-gui: use aibff command directly
    command = new Deno.Command("aibff", {
      args: ["gui", "--port", port.toString()],
      env: { ...Deno.env.toObject(), ...server.env },
      stdout: "piped",
      stderr: "piped",
    });
  } else if (isBinary) {
    command = new Deno.Command(server.serverPath, {
      args: ["--port", port.toString()],
      env: { ...Deno.env.toObject(), ...server.env },
      stdout: server.name === "boltfoundry-com" ? "inherit" : "piped",
      stderr: server.name === "boltfoundry-com" ? "inherit" : "piped",
    });
  } else {
    // Use production mode for boltfoundry-com to serve built assets
    const args = ["run", "-A", server.serverPath, "--port", port.toString()];
    if (server.name === "boltfoundry-com") {
      args.push("--mode", "production");
    }

    command = new Deno.Command("deno", {
      args,
      env: { ...Deno.env.toObject(), ...server.env },
      stdout: "piped",
      stderr: "piped",
    });
  }

  const process = command.spawn();
  runningServers.set(server.name, process);

  // Wait for server to be ready by checking health
  const maxRetries = 30;
  if (verbose) {
    logger.info(`🔍 Starting health check for ${server.name} at ${serverUrl}`);
  }
  for (let i = 0; i < maxRetries; i++) {
    try {
      if (verbose) {
        logger.info(
          `🔍 Health check attempt ${i + 1}/${maxRetries} for ${serverUrl}`,
        );
      }
      const response = await fetch(`${serverUrl}/health`);
      if (verbose) {
        logger.info(
          `🔍 Got response: status=${response.status}, ok=${response.ok}`,
        );
      }
      if (response.ok) {
        if (verbose) {
          logger.info(`✅ ${server.name} server ready at ${serverUrl}`);
        }
        return serverUrl;
      }
    } catch (error) {
      if (verbose) {
        logger.info(`🔍 Health check ${i + 1} failed: ${error}`);
      }
      // Server not ready yet
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  throw new Error(
    `${server.name} server failed to start within ${maxRetries} seconds`,
  );
}

/**
 * Stop all running servers
 */
async function stopAllServers(verbose = false): Promise<void> {
  if (runningServers.size > 0) {
    logger.info("🛑 Stopping servers...");
    for (const [name, process] of runningServers) {
      if (verbose) {
        logger.info(`Stopping ${name} server...`);
      }
      process.kill();
      await process.status;
    }
    runningServers.clear();
  }
}

/**
 * Resolve test file paths from patterns
 */
async function resolveTestFiles(
  patterns: Array<string>,
): Promise<Array<string>> {
  const allFiles: Array<string> = [];

  for (const pattern of patterns) {
    if (pattern.endsWith(".e2e.ts") && !pattern.includes("*")) {
      // Direct file path
      allFiles.push(resolve(pattern));
    } else {
      // Glob pattern
      for await (const file of expandGlob(pattern, { root: Deno.cwd() })) {
        if (file.isFile && file.path.endsWith(".e2e.ts")) {
          allFiles.push(file.path);
        }
      }
    }
  }

  return allFiles;
}

/**
 * E2E test runner with server management
 */
export async function e2eCommand(options: Array<string>): Promise<number> {
  // Parse command line arguments
  const parsed = parseArgs(options, {
    boolean: ["build", "verbose", "show-browser"],
    string: ["show-browser"],
    alias: {
      b: "build",
      v: "verbose",
    },
    default: {
      "show-browser": false,
      verbose: false,
    },
    unknown: () => {
      // Allow unknown args to be passed through to deno test
      return true;
    },
  });

  const shouldShowBrowser = parsed["show-browser"] === true;
  const verbose = parsed.verbose;

  // Acquire E2E lock to prevent concurrent runs
  await acquireE2ELock();

  logger.info("🧪 Running E2E tests...");

  // Get remaining args for deno test (excluding our parsed flags)
  const denoTestOptions = options.filter((opt) =>
    !opt.startsWith("--show-browser") && opt !== "--build" && opt !== "-b" &&
    opt !== "--verbose" && opt !== "-v"
  );

  const testFilePatterns = denoTestOptions.filter((opt) =>
    !opt.startsWith("--") && !opt.startsWith("-") && opt.endsWith(".e2e.ts")
  );

  // Set browser visibility via environment variable
  if (shouldShowBrowser) {
    Deno.env.set("BF_E2E_SHOW_BROWSER", "true");
    logger.debug("🖥️  Running with visible browser (--show-browser)");
  } else {
    Deno.env.set("BF_E2E_SHOW_BROWSER", "false");
    logger.debug(
      "🕶️  Running in headless mode (use --show-browser to see browser)",
    );
  }

  // Set up cleanup handler
  let cleanupCalled = false;
  const cleanup = async () => {
    if (cleanupCalled) return;
    cleanupCalled = true;
    await stopAllServers(verbose);
    await releaseE2ELock();
  };

  // Handle cleanup on exit
  Deno.addSignalListener("SIGINT", cleanup);
  Deno.addSignalListener("SIGTERM", cleanup);

  let testResult = 1;

  try {
    // Resolve test file patterns to actual files
    const patterns = testFilePatterns.length > 0
      ? testFilePatterns
      : ["apps/**/*.e2e.ts"];
    const testFiles = await resolveTestFiles(patterns);

    if (testFiles.length === 0) {
      logger.info("No E2E test files found matching patterns");
      return 0;
    }

    // Determine which servers are needed
    const requiredServers = getRequiredServers(testFiles);

    if (requiredServers.length > 0) {
      // First, check which servers are already running (either via env var or on common ports)
      const serversToStart: Array<ServerConfig> = [];
      const existingServers: Array<{ server: ServerConfig; url: string }> = [];

      for (const server of requiredServers) {
        // Check if URL is explicitly set via environment variable
        let existingUrl = getConfigurationVariable(server.envVar);

        // If not explicitly set, check if server is already running on common ports
        if (!existingUrl) {
          existingUrl = await checkExistingServer(server, verbose);
        }

        if (existingUrl) {
          existingServers.push({ server, url: existingUrl });
          // Set the env var so it's available later
          Deno.env.set(server.envVar, existingUrl);
        } else {
          serversToStart.push(server);
        }
      }

      if (existingServers.length > 0) {
        logger.info(
          `🔗 Using existing server${
            existingServers.length === 1 ? "" : "s"
          }: ${
            existingServers.map((e) => `${e.server.name} at ${e.url}`).join(
              ", ",
            )
          }`,
        );
      }

      if (serversToStart.length > 0) {
        logger.info(
          `📡 Starting ${serversToStart.length} required server${
            serversToStart.length === 1 ? "" : "s"
          }: ${serversToStart.map((s) => s.name).join(", ")}`,
        );

        // Only compile if we need to start boltfoundry-com
        if (serversToStart.some((s) => s.name === "boltfoundry-com")) {
          logger.info("🔨 Compiling boltfoundry-com...");
          const buildResult = await runShellCommand(
            ["bft", "compile", "boltfoundry-com", "--quiet"],
            Deno.cwd(),
            {},
            true,
            true, // Always suppress output for cleaner logs
          );
          if (buildResult !== 0) {
            throw new Error(
              "boltfoundry-com compilation failed - cannot start servers",
            );
          }
          logger.info("✅ boltfoundry-com compiled");
        }
      }

      // Check if any servers we need to start require binaries to be compiled
      for (const server of serversToStart) {
        if (
          !server.serverPath.endsWith(".ts") &&
          !server.serverPath.endsWith(".tsx")
        ) {
          try {
            await Deno.stat(server.serverPath);
          } catch {
            // Binary doesn't exist, need to compile it
            logger.info(`🔨 Compiling ${server.name} binary...`);

            // Check if this is a compilable app (has a bft compile command)
            const compilableApps = [
              "aibff-gui",
              "boltfoundry-com",
              "promptgrade-ai",
            ];
            if (compilableApps.includes(server.name)) {
              const compileResult = await runShellCommand(
                [
                  "bft",
                  "compile",
                  server.name,
                ],
                Deno.cwd(),
                {},
                true,
                !verbose,
              );
              if (compileResult !== 0) {
                throw new Error(`Failed to compile ${server.name} binary`);
              }
              logger.info(`✅ ${server.name} binary compiled`);
            } else {
              throw new Error(
                `No compile command available for ${server.name}`,
              );
            }
          }
        }
      }

      // Start servers that aren't already running
      for (const server of serversToStart) {
        const serverUrl = await startServer(server, verbose);
        // Set environment variable for the server
        Deno.env.set(server.envVar, serverUrl);
        logger.debug(`✅ ${server.name} ready at ${serverUrl}`);
      }
    } else {
      logger.info("🎯 No servers required for these tests");
    }

    // Run E2E tests
    logger.info(
      `🧪 Running ${testFiles.length} test file${
        testFiles.length === 1 ? "" : "s"
      }...`,
    );

    const testArgs = ["deno", "test", "-A"];

    // Add all deno test options (including --no-check, etc.)
    const denoFlags = denoTestOptions.filter((opt) =>
      opt.startsWith("--") || opt.startsWith("-")
    );
    testArgs.push(...denoFlags);

    // Add resolved test files
    testArgs.push(...testFiles);

    testResult = await runShellCommand(
      testArgs,
      Deno.cwd(),
      {},
      true,
      !verbose, // Suppress output unless verbose mode
    );

    if (testResult === 0) {
      logger.info("✅ All tests passed!");
    } else {
      logger.error("❌ Tests failed");
    }
  } catch (error) {
    logger.error("❌ E2E test setup failed:", error);
    testResult = 1;
  } finally {
    // Cleanup servers
    await cleanup();
  }

  return testResult;
}

export const bftDefinition = {
  description:
    "Run end-to-end tests. Options: --show-browser, --verbose/-v, --build/-b, plus all deno test flags (--no-check, etc.)",
  fn: e2eCommand,
} satisfies TaskDefinition;
