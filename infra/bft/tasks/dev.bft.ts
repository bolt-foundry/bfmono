#!/usr/bin/env -S bft run

import type { TaskDefinition } from "../bft.ts";
import { ui } from "@bfmono/packages/tui/tui.ts";
import { parseArgs } from "@std/cli";
import { getLogger } from "@bolt-foundry/logger";
import { debounce } from "@std/async/debounce";

const logger = getLogger(import.meta);

async function dev(args: Array<string>): Promise<number> {
  // Define available apps
  const availableApps = {
    "boltfoundry-com": {
      description: "Bolt Foundry landing page",
      port: 8000,
      vitePort: 8080,
      hmrPort: 8081,
    },
  };

  // Check for global help flag
  if (args.length === 1 && (args[0] === "--help" || args[0] === "-h")) {
    ui.output(`Usage: bft dev <app-name> [OPTIONS]

Launch web applications in development mode

Available apps:`);
    for (const [app, config] of Object.entries(availableApps)) {
      ui.output(`  ${app.padEnd(18)} ${config.description}`);
    }
    ui.output(`
Examples:
  bft dev boltfoundry-com           # Run boltfoundry-com in development mode
  bft dev boltfoundry-com --help    # Show app-specific help`);
    return 0;
  }

  if (args.length === 0) {
    ui.error("Usage: bft dev <app-name> [OPTIONS]");
    ui.output("Available apps:");
    for (const [app, config] of Object.entries(availableApps)) {
      ui.output(`  ${app.padEnd(18)} ${config.description}`);
    }
    return 1;
  }

  const appName = args[0];
  const devArgs = args.slice(1);

  if (!(appName in availableApps)) {
    ui.error(`Unknown app: ${appName}`);
    ui.output("Available apps:");
    for (const [app, config] of Object.entries(availableApps)) {
      ui.output(`  ${app.padEnd(18)} ${config.description}`);
    }
    return 1;
  }

  const appConfig = availableApps[appName as keyof typeof availableApps];

  // Handle app in development mode
  const flags = parseArgs(devArgs, {
    boolean: [
      "build",
      "no-open",
      "help",
      "no-log",
      "foreground",
      "stop",
      "restart",
      "no-codegen", // New flag to disable automatic code generation
    ],
    string: ["port", "log-file"],
    default: {
      port: String(appConfig.port),
    },
  });

  if (flags.help) {
    ui.output(`Usage: bft dev ${appName} [OPTIONS]

Launch the ${appConfig.description} in development mode

Options:
  --build            Build assets without starting server
  --stop             Stop the running development server
  --restart          Stop and restart the development server
  --port             Specify server port (default: ${appConfig.port})
  --no-open          Don't auto-open browser on startup
  --log-file         Write logs to specified file instead of default tmp location
  --no-log           Disable logging to file (output to console)
  --foreground       Run in foreground instead of background (default: background)
  --no-codegen       Disable automatic code generation (genGqlTypes and iso)
  --help             Show this help message

Examples:
  bft dev ${appName}                          # Run in background (logs to tmp/${appName}-dev.log)
  bft dev ${appName} --stop                   # Stop the running server
  bft dev ${appName} --restart                # Restart the server
  bft dev ${appName} --build                  # Build assets only
  bft dev ${appName} --port 4000              # Run on port 4000
  bft dev ${appName} --log-file dev.log       # Log to custom file
  bft dev ${appName} --foreground             # Run in foreground
  bft dev ${appName} --no-log --foreground    # Run in foreground with console output
  bft dev ${appName} --no-codegen             # Disable automatic code generation`);
    return 0;
  }

  // Handle --restart flag
  if (flags.restart) {
    ui.output(`Restarting ${appName} development server...`);

    // First stop the server
    const psCommand = new Deno.Command("sh", {
      args: [
        "-c",
        `ps aux | grep -E '(bft dev ${appName}|vite.*${appConfig.vitePort}|server\\.tsx.*${appConfig.port})' | grep -v grep | awk '{print $2}'`,
      ],
      stdout: "piped",
    });

    const psResult = await psCommand.output();
    const pids = new TextDecoder().decode(psResult.stdout).trim().split("\n")
      .filter(Boolean);

    if (pids.length > 0) {
      // Kill the processes
      for (const pid of pids) {
        try {
          const killCommand = new Deno.Command("kill", {
            args: [pid],
          });
          await killCommand.output();
        } catch {
          // Process might have already exited
        }
      }
      ui.output(`Stopped ${pids.length} process(es).`);

      // Wait a moment for processes to fully terminate
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    // Now continue with starting the server
    // Remove --restart from devArgs to avoid infinite loop
    const argsWithoutRestart = devArgs.filter((arg) => arg !== "--restart");

    // Recursively call dev with the remaining args
    return await dev([appName, ...argsWithoutRestart]);
  }

  // Handle --stop flag
  if (flags.stop) {
    ui.output(`Stopping ${appName} development server...`);

    // Find and kill all related processes
    const psCommand = new Deno.Command("sh", {
      args: [
        "-c",
        `ps aux | grep -E '(bft dev ${appName}|vite.*${appConfig.vitePort}|server\\.tsx.*${appConfig.port})' | grep -v grep | awk '{print $2}'`,
      ],
      stdout: "piped",
    });

    const psResult = await psCommand.output();
    const pids = new TextDecoder().decode(psResult.stdout).trim().split("\n")
      .filter(Boolean);

    if (pids.length === 0) {
      ui.output(`No running ${appName} server found.`);
      return 0;
    }

    // Kill the processes
    for (const pid of pids) {
      try {
        const killCommand = new Deno.Command("kill", {
          args: [pid],
        });
        await killCommand.output();
      } catch {
        // Process might have already exited
      }
    }

    ui.output(`Stopped ${pids.length} process(es).`);
    return 0;
  }

  const port = parseInt(flags.port);
  if (isNaN(port)) {
    ui.error(`Invalid port: ${flags.port}`);
    return 1;
  }

  const appPath =
    new URL(import.meta.resolve(`@bfmono/apps/${appName}`)).pathname;

  // Check if we should run in background (default) or foreground
  const runInBackground = !flags.foreground;

  if (runInBackground && !flags.build) {
    // Run the entire command in background using nohup
    ui.output(`Starting ${appName} in background mode...`);

    // Ensure tmp directory exists
    await Deno.mkdir("tmp", { recursive: true });

    // Build the command to run
    const bftPath =
      new URL(import.meta.resolve("@bfmono/infra/bft/bin/bft.ts")).pathname;
    const logPath = `tmp/${appName}-dev.log`;

    // Construct the full command with nohup
    const backgroundCommand =
      `nohup deno run -A ${bftPath} dev ${appName} --foreground ${
        devArgs.filter((arg) => arg !== "--foreground").join(" ")
      } > ${logPath} 2>&1 &`;

    // Use shell to execute the nohup command
    const backgroundProcess = new Deno.Command("sh", {
      args: ["-c", backgroundCommand],
      env: Deno.env.toObject(), // Pass all current env vars including those from .env.secrets
    });

    const result = backgroundProcess.outputSync();

    if (!result.success) {
      ui.error("Failed to start background process");
      return 1;
    }

    // Wait for server to actually be ready by checking if it responds
    ui.output("Waiting for server to start...");

    let serverReady = false;
    const maxRetries = 30; // 30 seconds max wait

    for (let i = 0; i < maxRetries; i++) {
      try {
        const response = await fetch(`http://localhost:${port}`);
        await response.body?.cancel();
        if (response.ok || response.status === 404) { // 404 is ok, means server is responding
          serverReady = true;
          break;
        }
      } catch {
        // Server not ready yet
      }
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    if (!serverReady) {
      ui.error(
        `Server failed to start. Check tmp/${appName}-dev.log for details.`,
      );
      return 1;
    }

    const hostname = Deno.hostname();
    ui.output(`Background server started on http://localhost:${port}`);
    ui.output(`Also available at http://${hostname}.codebot.local:${port}`);
    ui.output(`Logs are being written to tmp/${appName}-dev.log`);
    ui.output(
      `Use 'bft dev ${appName} --foreground' to run in foreground`,
    );

    return 0;
  }

  // Set up logging configuration
  let logFile: Deno.FsFile | undefined;
  let logFilePath: string | undefined;

  // Determine if we should log to file
  const shouldLogToFile = !flags["no-log"];

  if (shouldLogToFile) {
    // Use custom log file path or default to tmp
    logFilePath = flags["log-file"] || `tmp/${appName}-dev.log`;

    try {
      // Ensure tmp directory exists
      if (logFilePath.startsWith("tmp/")) {
        await Deno.mkdir("tmp", { recursive: true });
      }

      logFile = await Deno.open(logFilePath, {
        create: true,
        write: true,
        truncate: true,
      });
      ui.output(`Logging to file: ${logFilePath}`);
    } catch (error) {
      ui.error(`Failed to open log file ${logFilePath}: ${error}`);
      return 1;
    }
  }

  const stdoutOpt = shouldLogToFile ? "piped" : "inherit";
  const stderrOpt = shouldLogToFile ? "piped" : "inherit";

  if (flags.build) {
    ui.output(`Building ${appName} assets...`);

    // Run vite build
    const buildCommand = new Deno.Command("deno", {
      args: ["run", "-A", "--node-modules-dir", "npm:vite", "build"],
      cwd: appPath,
      stdout: "inherit",
      stderr: "inherit",
    });

    const buildProcess = buildCommand.outputSync();

    if (!buildProcess.success) {
      ui.error("Build failed");
      return 1;
    }

    ui.output("Build completed successfully");
    return 0;
  }

  // Set up automatic code generation watchers unless disabled
  let schemaWatcher: Deno.FsWatcher | null = null;
  let isoWatcher: Deno.FsWatcher | null = null;

  if (!flags["no-codegen"]) {
    const watcherMessage = "Setting up automatic code generation watchers...";
    ui.output(watcherMessage);
    if (logFile) {
      const encoder = new TextEncoder();
      await logFile.write(
        encoder.encode(`[${new Date().toISOString()}] ${watcherMessage}\n`),
      );
    }

    // Watch for GraphQL schema changes
    schemaWatcher = await watchGraphQLSchema(port, logFile);

    // Watch for Isograph file changes
    isoWatcher = await watchIsographFiles(appName, port, logFile);
  }

  // Start Vite dev server (always in development mode)
  const vitePort = appConfig.vitePort;

  ui.output(`Starting Vite dev server on port ${vitePort}...`);

  const viteCommand = new Deno.Command("deno", {
    args: [
      "run",
      "-A",
      "--node-modules-dir",
      "npm:vite",
      "--port",
      vitePort.toString(),
    ],
    cwd: appPath,
    stdout: stdoutOpt,
    stderr: stderrOpt,
    env: {
      ...Deno.env.toObject(),
      VITE_HMR_PORT: String(appConfig.hmrPort),
    },
  });

  const viteProcess = viteCommand.spawn();

  // Pipe output to log file if specified
  if (logFile && viteProcess.stdout && viteProcess.stderr) {
    // Create a function to pipe streams to log file with prefixes
    const pipeToLog = async (
      stream: ReadableStream<Uint8Array>,
      prefix: string,
    ) => {
      const reader = stream.getReader();
      const encoder = new TextEncoder();

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const text = new TextDecoder().decode(value);
          const lines = text.split("\n");

          for (const line of lines) {
            if (line.trim()) {
              const logLine = `[${
                new Date().toISOString()
              }] ${prefix}: ${line}\n`;
              await logFile!.write(encoder.encode(logLine));
            }
          }
        }
      } catch (error) {
        logger.error("Error piping to log:", error);
      } finally {
        reader.releaseLock();
      }
    };

    // Start piping both stdout and stderr
    pipeToLog(viteProcess.stdout, "VITE");
    pipeToLog(viteProcess.stderr, "VITE-ERR");
  }

  // Wait for Vite to be ready
  let viteReady = false;
  const maxRetries = 30;

  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(`http://localhost:${vitePort}`);
      await response.body?.cancel();
      if (response.ok) {
        viteReady = true;
        break;
      }
    } catch {
      // Vite not ready yet
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  if (!viteReady) {
    ui.error("Vite dev server failed to start");
    viteProcess.kill();
    return 1;
  }

  ui.output("Vite dev server ready");

  // Start the backend server in development mode with smart watching
  ui.output(`Starting ${appName} server on http://localhost:${port}`);

  const serverArgs = [
    "run",
    "-A",
    new URL(import.meta.resolve(`@bfmono/apps/${appName}/server.tsx`))
      .pathname,
    "--port",
    String(port),
    "--mode",
    "development",
    "--vite-port",
    String(vitePort),
  ];

  const serverCommand = new Deno.Command("deno", {
    args: serverArgs,
    stdout: stdoutOpt,
    stderr: stderrOpt,
  });

  const serverProcess = serverCommand.spawn();

  // Pipe server output to log file if specified
  if (logFile && serverProcess.stdout && serverProcess.stderr) {
    // Reuse the pipeToLog function from above
    const pipeToLog = async (
      stream: ReadableStream<Uint8Array>,
      prefix: string,
    ) => {
      const reader = stream.getReader();
      const encoder = new TextEncoder();

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const text = new TextDecoder().decode(value);
          const lines = text.split("\n");

          for (const line of lines) {
            if (line.trim()) {
              const logLine = `[${
                new Date().toISOString()
              }] ${prefix}: ${line}\n`;
              await logFile!.write(encoder.encode(logLine));
            }
          }
        }
      } catch (error) {
        logger.error("Error piping to log:", error);
      } finally {
        reader.releaseLock();
      }
    };

    // Start piping server output
    pipeToLog(serverProcess.stdout, "SERVER");
    pipeToLog(serverProcess.stderr, "SERVER-ERR");
  }

  // Open browser if not disabled
  if (!flags["no-open"]) {
    // Give the server a moment to start
    await new Promise((resolve) => setTimeout(resolve, 2000));

    try {
      const openCommand = new Deno.Command(
        Deno.build.os === "darwin"
          ? "open"
          : Deno.build.os === "windows"
          ? "start"
          : "xdg-open",
        {
          args: [`http://localhost:${port}`],
          stdout: "null",
          stderr: "null",
        },
      );
      openCommand.outputSync();
    } catch {
      // Ignore errors opening browser
    }
  }

  // Handle cleanup on exit
  const cleanup = () => {
    viteProcess.kill();
    serverProcess.kill();
    if (logFile) {
      try {
        logFile.close();
      } catch (_) {
        // Ignore errors closing log file
      }
    }
    // Clean up watchers
    if (schemaWatcher) {
      try {
        schemaWatcher.close();
      } catch (_) {
        // Ignore errors closing watchers
      }
    }
    if (isoWatcher) {
      try {
        isoWatcher.close();
      } catch (_) {
        // Ignore errors closing watchers
      }
    }
  };

  // Handle various exit signals
  Deno.addSignalListener("SIGINT", cleanup);
  Deno.addSignalListener("SIGTERM", cleanup);
  globalThis.addEventListener("beforeunload", cleanup);

  // Wait for server process to exit
  const serverResult = await serverProcess.status;

  // Clean up Vite process
  viteProcess.kill();

  return serverResult.success ? 0 : 1;
}

// Helper function to restart the backend server
async function restartBackendServer(port: number) {
  ui.output("Restarting backend server...");

  // Find and kill the server process
  const psCommand = new Deno.Command("sh", {
    args: [
      "-c",
      `ps aux | grep -E 'server\\.tsx.*--port.*${port}' | grep -v grep | awk '{print $2}'`,
    ],
    stdout: "piped",
  });

  const psResult = await psCommand.output();
  const pids = new TextDecoder().decode(psResult.stdout).trim().split("\n")
    .filter(Boolean);

  if (pids.length > 0) {
    for (const pid of pids) {
      try {
        await new Deno.Command("kill", {
          args: [pid],
        }).output();
      } catch {
        // Process might have already exited
      }
    }

    // Wait a moment for process to terminate
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Restart the server
    const serverArgs = [
      "run",
      "-A",
      new URL(import.meta.resolve("@bfmono/apps/boltfoundry-com/server.tsx"))
        .pathname,
      "--port",
      String(port),
      "--mode",
      "development",
      "--vite-port",
      "8080",
    ];

    const serverCommand = new Deno.Command("deno", {
      args: serverArgs,
      stdout: "inherit",
      stderr: "inherit",
    });

    serverCommand.spawn();
    ui.output("Backend server restarted successfully");
  }
}

// Helper function to watch GraphQL schema changes
async function watchGraphQLSchema(
  port: number,
  logFile?: Deno.FsFile,
): Promise<Deno.FsWatcher> {
  const message =
    "Watching GraphQL schema files for automatic type generation...";
  ui.output(message);
  if (logFile) {
    const encoder = new TextEncoder();
    await logFile.write(
      encoder.encode(`[${new Date().toISOString()}] ${message}\n`),
    );
  }

  const debouncedGenGqlTypes = debounce(async () => {
    ui.output("GraphQL schema changed, regenerating types...");

    const bftPath =
      new URL(import.meta.resolve("@bfmono/infra/bft/bin/bft.ts")).pathname;
    const process = new Deno.Command("deno", {
      args: [
        "run",
        "-A",
        bftPath,
        "genGqlTypes",
      ],
      stdout: "inherit",
      stderr: "inherit",
    });

    const child = process.spawn();
    const status = await child.status;

    if (status.success) {
      ui.output("GraphQL types regenerated successfully");
      // Restart the backend server to pick up new types
      await restartBackendServer(port);
    } else {
      ui.error("Failed to regenerate GraphQL types");
    }
  }, 500);

  const watchPaths: Array<string> = [];
  try {
    await Deno.stat("apps/bfDb/graphql");
    watchPaths.push("apps/bfDb/graphql");
  } catch {
    // Directory doesn't exist, skip
  }

  try {
    await Deno.stat("apps/bfDb/nodeTypes");
    watchPaths.push("apps/bfDb/nodeTypes");
  } catch {
    // Directory doesn't exist, skip
  }

  try {
    await Deno.stat("packages/bfDb");
    watchPaths.push("packages/bfDb");
  } catch {
    // Directory doesn't exist, skip
  }

  if (watchPaths.length === 0) {
    ui.output("No GraphQL schema directories found to watch");
    return {
      close: () => {},
      [Symbol.asyncIterator]: async function* () {
        // Empty iterator
      },
      [Symbol.dispose]: () => {},
    } as Deno.FsWatcher;
  }

  const watcher = Deno.watchFs(watchPaths, { recursive: true });

  (async () => {
    for await (const event of watcher) {
      // Log all events for debugging
      if (logFile && event.kind !== "access") {
        const encoder = new TextEncoder();
        await logFile.write(
          encoder.encode(
            `[${
              new Date().toISOString()
            }] GraphQL Watcher Event: ${event.kind} - ${
              event.paths.join(", ")
            }\n`,
          ),
        );
      }

      // Only watch for GraphQL-related files
      const relevantFiles = event.paths.filter((path) =>
        path.endsWith(".ts") &&
        !path.includes("__generated__") &&
        !path.includes("node_modules") &&
        (path.includes("schema") || path.includes("types") ||
          path.includes("resolvers") || path.includes("nodeTypes") ||
          path.includes("graphql"))
      );

      if (
        relevantFiles.length > 0 &&
        (event.kind === "modify" || event.kind === "create")
      ) {
        if (logFile) {
          const encoder = new TextEncoder();
          await logFile.write(
            encoder.encode(
              `[${new Date().toISOString()}] GraphQL Watcher Triggered for: ${
                relevantFiles.join(", ")
              }\n`,
            ),
          );
        }
        debouncedGenGqlTypes();
      }
    }
  })();

  return watcher;
}

// Helper function to watch Isograph files
async function watchIsographFiles(
  app: string,
  port: number,
  logFile?: Deno.FsFile,
): Promise<Deno.FsWatcher> {
  const message = `Watching Isograph files for automatic compilation...`;
  ui.output(message);
  if (logFile) {
    const encoder = new TextEncoder();
    await logFile.write(
      encoder.encode(`[${new Date().toISOString()}] ${message}\n`),
    );
  }

  const debouncedIso = debounce(async () => {
    ui.output("Isograph files changed, recompiling...");

    const bftPath =
      new URL(import.meta.resolve("@bfmono/infra/bft/bin/bft.ts")).pathname;
    const process = new Deno.Command("deno", {
      args: [
        "run",
        "-A",
        bftPath,
        "iso",
      ],
      stdout: "inherit",
      stderr: "inherit",
    });

    const child = process.spawn();
    const status = await child.status;

    if (status.success) {
      ui.output("Isograph compilation completed successfully");
      // Restart the backend server to pick up new generated code
      await restartBackendServer(port);
    } else {
      ui.error("Failed to compile Isograph files");
    }
  }, 500);

  const watchPaths: Array<string> = [];
  const appPath = `apps/${app}`;

  try {
    await Deno.stat(appPath);
    watchPaths.push(appPath);
  } catch {
    ui.output(`App directory ${appPath} not found, skipping Isograph watch`);
    return {
      close: () => {},
      [Symbol.asyncIterator]: async function* () {
        // Empty iterator
      },
      [Symbol.dispose]: () => {},
    } as Deno.FsWatcher;
  }

  const watcher = Deno.watchFs(watchPaths, { recursive: true });

  (async () => {
    for await (const event of watcher) {
      // Watch for .iso files and component files that might contain @component
      const relevantFiles = event.paths.filter((path) =>
        (path.endsWith(".iso") ||
          (path.endsWith(".tsx") && !path.includes("__generated__"))) &&
        !path.includes("node_modules")
      );

      if (
        relevantFiles.length > 0 &&
        (event.kind === "modify" || event.kind === "create")
      ) {
        debouncedIso();
      }
    }
  })();

  return watcher;
}

// Export the task definition for autodiscovery
export const bftDefinition = {
  description: "Launch web applications in development mode",
  fn: dev,
} satisfies TaskDefinition;

// When run directly as a script
if (import.meta.main) {
  // Skip "run" and script name from args
  const scriptArgs = Deno.args.slice(2);
  Deno.exit(await dev(scriptArgs));
}
