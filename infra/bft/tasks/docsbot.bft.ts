#!/usr/bin/env -S bft run

import { getConfigurationVariable } from "@bolt-foundry/get-configuration-var";
import type { TaskDefinition } from "../bft.ts";
import { parseArgs } from "@std/cli/parse-args";
import { ui } from "@bfmono/packages/tui/tui.ts";
import { getLogger } from "@bfmono/packages/logger/logger.ts";
import { promptSelect } from "@std/cli/unstable-prompt-select";
import { dirname, join } from "@std/path";

const logger = getLogger(import.meta);

interface CodebotArgs {
  shell?: boolean;
  exec?: string;
  help?: boolean;
  "force-rebuild"?: boolean;
  cleanup?: boolean;
  "cleanup-containers"?: boolean;
  workspace?: string;
  memory?: string;
  cpus?: string;
  resume?: boolean;
  checkout?: string;
}

async function generateRandomName(): Promise<string> {
  try {
    const namesFile = await Deno.readTextFile(
      "./infra/bft/tasks/codebot-names.txt",
    );
    const names = namesFile.trim().split("\n");

    // Split each name into first-last parts
    const nameParts = names.map((name) => {
      const [first, ...rest] = name.split("-");
      const last = rest.length > 0 ? rest.join("-") : first;
      return { first, last };
    });

    // Pick random first and last from different entries
    const randomFirst =
      nameParts[Math.floor(Math.random() * nameParts.length)].first;
    const randomLast =
      nameParts[Math.floor(Math.random() * nameParts.length)].last;

    return `${randomFirst}-${randomLast}`;
  } catch (error) {
    logger.error("Error generating random name:", error);
    // Fallback to timestamp-based name
    return `workspace-${Date.now()}`;
  }
}

interface WorkspaceInfo {
  name: string;
  path: string;
  isRunning: boolean;
  lastModified?: Date;
}

function getWorkspacesDirectory(): string {
  const internalbfRoot = Deno.env.get("INTERNALBF_ROOT");
  if (!internalbfRoot) {
    // Fallback to old behavior for backward compatibility
    const bfmonoPath = new URL(import.meta.resolve("@bfmono/")).pathname;
    return join(dirname(bfmonoPath), "codebot-workspaces");
  }
  return join(internalbfRoot, "codebot-workspaces");
}

async function getWorkspacesWithStatus(): Promise<Array<WorkspaceInfo>> {
  const workspacesDir = getWorkspacesDirectory();
  const workspaces: Array<WorkspaceInfo> = [];

  try {
    // Get all running containers
    const listCmd = new Deno.Command("container", {
      args: ["list", "--format", "{{.Names}}"],
      stdout: "piped",
    });
    const listResult = await listCmd.output();
    const runningContainers = new TextDecoder().decode(listResult.stdout)
      .trim()
      .split("\n")
      .filter((name) => name.length > 0);

    // Get all workspace directories
    for await (const entry of Deno.readDir(workspacesDir)) {
      if (entry.isDirectory) {
        const workspacePath = `${workspacesDir}/${entry.name}`;
        const stat = await Deno.stat(workspacePath);

        workspaces.push({
          name: entry.name,
          path: workspacePath,
          isRunning: runningContainers.includes(entry.name),
          lastModified: stat.mtime || undefined,
        });
      }
    }

    // Sort by last modified date (newest first)
    workspaces.sort((a, b) => {
      if (!a.lastModified || !b.lastModified) return 0;
      return b.lastModified.getTime() - a.lastModified.getTime();
    });
  } catch (error) {
    logger.debug(`Failed to get workspaces: ${error}`);
  }

  return workspaces;
}

interface ContainerConfig {
  workspaceId: string;
  workspacePath: string;
  claudeDir: string;
  githubToken: string;
  memory: string;
  cpus: string;
  interactive?: boolean;
  removeOnExit?: boolean;
}

function buildContainerArgs(config: ContainerConfig): Array<string> {
  const baseArgs = [
    "run",
    "--name",
    config.workspaceId,
    "--memory",
    config.memory,
    "--cpus",
    config.cpus,
    "--volume",
    `${config.claudeDir}:/home/codebot/.claude`,
    "--volume",
    `${config.workspacePath}:/internalbf`,
    "-w",
    "/internalbf/bfmono",
    "--volume",
    "/tmp:/dev/shm", // Use host /tmp as shared memory for Chrome
    "-e",
    `GITHUB_TOKEN=${config.githubToken}`,
    "-e",
    "BF_E2E_MODE=true",
    "-e",
    "PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable",
    "-e",
    "PUPPETEER_DISABLE_DEV_SHM_USAGE=true",
    "-e",
    "PUPPETEER_NO_SANDBOX=true", // Container already provides isolation
    "-e",
    "DISPLAY=:99", // Virtual display for headless Chrome
    "-e",
    "DOCSBOT_CONTAINER=true", // Identify we're in a docsbot container
    "-e",
    "TERM=xterm-256color", // Enable proper color support in terminal
  ];

  if (config.removeOnExit) {
    baseArgs.splice(1, 0, "--rm");
  }

  if (config.interactive) {
    baseArgs.splice(1, 0, "-it");
  }

  return baseArgs;
}

async function codebot(args: Array<string>): Promise<number> {
  const logger = getLogger("codebot");

  const parsed = parseArgs(args, {
    boolean: [
      "shell",
      "help",
      "force-rebuild",
      "cleanup",
      "cleanup-containers",
      "resume",
    ],
    string: ["exec", "workspace", "memory", "cpus", "checkout"],
    alias: { h: "help" },
  }) as CodebotArgs;

  // Auto-calculate maximum resources if not specified
  let autoMemory = "4g";
  let autoCpus = "8";

  if (!parsed.memory || !parsed.cpus) {
    try {
      // Get total system memory in bytes
      const memCmd = new Deno.Command("sysctl", {
        args: ["-n", "hw.memsize"],
        stdout: "piped",
      });
      const memResult = await memCmd.output();

      if (memResult.success) {
        const totalMemBytes = parseInt(
          new TextDecoder().decode(memResult.stdout).trim(),
        );
        // Use 100% of total memory
        const containerMemGb = Math.floor(
          (totalMemBytes / 1024 / 1024 / 1024) * 1.0,
        );
        autoMemory = `${containerMemGb}g`;
      }

      // Get total CPU cores
      const cpuCmd = new Deno.Command("sysctl", {
        args: ["-n", "hw.ncpu"],
        stdout: "piped",
      });
      const cpuResult = await cpuCmd.output();

      if (cpuResult.success) {
        const totalCpus = parseInt(
          new TextDecoder().decode(cpuResult.stdout).trim(),
        );
        // Use all available CPUs (container framework handles scheduling)
        autoCpus = totalCpus.toString();
      }

      logger.info(
        `Auto-detected system resources: ${autoMemory} RAM (100% of system), ${autoCpus} CPUs (all available)`,
      );
    } catch (error) {
      logger.warn(
        "Failed to auto-detect system resources, using defaults",
        error,
      );
    }
  }

  if (parsed.help) {
    ui.output(`
Usage: bft codebot [OPTIONS]

Run Claude Code in an isolated container environment with Chrome/Puppeteer support.

By default, starts Claude Code CLI and preserves the workspace for debugging.
Automatically cleans up stopped containers to prevent disk space issues.
Includes Google Chrome Stable with all dependencies for E2E testing.

OPTIONS:
  --shell              Enter container shell for debugging
  --exec CMD           Execute command in container
  --checkout BRANCH    Checkout branch with automatic shelve/unshelve of changes
  --workspace NAME     Reuse existing workspace or create new one with specific name
                       If a container is already running with this name, attach to it
  --resume             Show list of workspaces and choose one to resume
  --cleanup            Remove workspace after completion (default: keep)
  --force-rebuild      Force rebuild container image before starting
  --memory SIZE        Container memory limit (e.g., 4g, 8g, 16g) (default: auto-detect 100% of system RAM)
  --cpus COUNT         Number of CPUs (e.g., 2, 4, 8) (default: auto-detect all available CPUs)
  --help               Show this help message

EXAMPLES:
  bft codebot                           # Start Claude Code CLI (new workspace)
  bft docsbot --workspace fuzzy-goat    # Resume running container or reuse workspace
  bft codebot --resume                  # Choose from existing workspaces
  bft codebot --cleanup                 # Start and cleanup workspace when done
  bft docsbot --shell                   # Open container shell for debugging
  bft codebot --exec "ls -la"           # Run command and exit
  bft codebot --checkout remote/main    # Checkout branch with auto shelve/unshelve
  bft codebot --memory 8g --cpus 8      # Run with 8GB RAM and 8 CPUs

FIRST TIME SETUP:
  On first run, you'll need to authenticate inside the container:
  1. Run 'bft codebot'
  2. Inside the container, run 'claude login'
  3. Follow the authentication prompts
  4. Credentials will persist for future runs
`);
    return 0;
  }

  // Handle --resume flag
  if (parsed.resume) {
    const workspaces = await getWorkspacesWithStatus();

    if (workspaces.length === 0) {
      ui.output("No workspaces found. Run 'bft codebot' to create one.");
      return 0;
    }

    // Format workspace options for display
    const displayOptions = workspaces.map((ws) => {
      const status = ws.isRunning ? "🟢 RUNNING" : "⚪ stopped";
      const modified = ws.lastModified
        ? new Date(ws.lastModified).toLocaleString()
        : "unknown";
      return `${ws.name} [${status}] - Last modified: ${modified}`;
    });

    // Add option to create new workspace
    displayOptions.push("➕ Create new workspace");

    const selected = await promptSelect(
      "Choose a workspace to resume or start:",
      displayOptions,
    );

    if (selected === null) {
      // User cancelled
      return 0;
    }

    if (selected === "➕ Create new workspace") {
      // User selected "Create new workspace"
      // Continue with normal flow to create new workspace
      // Don't set parsed.workspace so a new one will be generated
    } else {
      // Extract workspace name from the display string
      const workspaceName = selected.split(" ")[0];
      parsed.workspace = workspaceName;
    }
  }

  // Automatically clean up stopped containers (except running ones)
  try {
    ui.output("🧹 Cleaning up stopped containers...");
    const listCmd = new Deno.Command("container", {
      args: ["list", "--all", "--quiet"],
    });
    const listResult = await listCmd.output();

    if (listResult.success) {
      const containerIds = new TextDecoder().decode(listResult.stdout)
        .trim().split("\n").filter((id) => id.length > 0);

      if (containerIds.length > 0) {
        // Filter out running containers
        const runningCmd = new Deno.Command("container", {
          args: ["list", "--quiet"],
        });
        const runningResult = await runningCmd.output();
        const runningIds = new TextDecoder().decode(runningResult.stdout)
          .trim().split("\n").filter((id) => id.length > 0);

        const stoppedIds = containerIds.filter((id) =>
          !runningIds.includes(id)
        );

        if (stoppedIds.length > 0) {
          const deleteCmd = new Deno.Command("container", {
            args: ["delete", ...stoppedIds],
          });
          await deleteCmd.output();
          ui.output(`✅ Cleaned up ${stoppedIds.length} stopped containers`);
        } else {
          ui.output("✅ No stopped containers to clean up");
        }
      }
    }
  } catch (error) {
    // Don't fail the entire command if cleanup fails
    ui.output(
      `⚠️ Container cleanup failed: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }

  // Ensure DNS server is running for *.codebot.local resolution
  try {
    ui.output("🌐 Checking DNS server for *.codebot.local...");

    // Check if DNS server is already running
    const psCmd = new Deno.Command("pgrep", {
      args: ["-f", "dns-server.ts"],
    });
    const psResult = await psCmd.output();

    if (!psResult.success) {
      // DNS server not running, start it
      ui.output("🚀 Starting DNS server for *.codebot.local resolution...");

      const dnsServerPath = "./infra/apps/codebot/dns-server.ts";
      const dnsCmd = new Deno.Command("deno", {
        args: [
          "run",
          "--allow-net",
          "--allow-run",
          "--allow-env",
          dnsServerPath,
        ],
        stdout: "null",
        stderr: "null",
      });

      // Start DNS server in background
      const dnsChild = dnsCmd.spawn();

      // Give it a moment to start and check if it's still running
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Verify DNS server started successfully
      const verifyCmd = new Deno.Command("pgrep", {
        args: ["-f", "dns-server.ts"],
      });
      const verifyResult = await verifyCmd.output();

      if (verifyResult.success) {
        ui.output("✅ DNS server started for *.codebot.local domains");
        ui.output("📝 To access *.codebot.local from your host:");
        ui.output("   Add to /etc/resolver/codebot.local:");
        ui.output("   nameserver 127.0.0.1");
        ui.output("   port 15353");
        dnsChild.unref(); // Don't wait for it to finish
      } else {
        ui.output("⚠️ DNS server may have failed to start");
        // Don't fail the entire command, but warn user
      }
    } else {
      ui.output("✅ DNS server already running");
    }
  } catch (error) {
    // Don't fail the entire command if DNS server fails
    ui.output(
      `⚠️ DNS server check failed: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }

  // Ensure host bridge is running for container-to-host communication
  try {
    ui.output("🌉 Checking host bridge...");

    // Check if host bridge is already running
    const psBridgeCmd = new Deno.Command("pgrep", {
      args: ["-f", "host-bridge.ts"],
    });
    const psBridgeResult = await psBridgeCmd.output();

    if (!psBridgeResult.success) {
      // Host bridge not running, start it
      ui.output("🚀 Starting host bridge on port 8017...");

      const hostBridgePath = "./infra/apps/codebot/host-bridge.ts";
      const bridgeCmd = new Deno.Command("deno", {
        args: [
          "run",
          "--allow-net",
          "--allow-run",
          "--allow-env",
          hostBridgePath,
        ],
        stdout: "null",
        stderr: "null",
      });

      // Start host bridge in background
      const bridgeChild = bridgeCmd.spawn();

      // Give it a moment to start and check if it's still running
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Verify host bridge started successfully
      const verifyBridgeCmd = new Deno.Command("pgrep", {
        args: ["-f", "host-bridge.ts"],
      });
      const verifyBridgeResult = await verifyBridgeCmd.output();

      if (verifyBridgeResult.success) {
        ui.output("✅ Host bridge started on port 8017");
        bridgeChild.unref(); // Don't wait for it to finish
      } else {
        ui.output("⚠️ Host bridge may have failed to start");
        // Don't fail the entire command, but warn user
      }
    } else {
      ui.output("✅ Host bridge already running");
    }
  } catch (error) {
    // Don't fail the entire command if host bridge fails
    ui.output(
      `⚠️ Host bridge check failed: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }

  // Check for .claude directory in user's home
  const homeDir = getConfigurationVariable("HOME");
  if (!homeDir) {
    ui.error("❌ HOME environment variable not found");
    return 1;
  }

  const claudeDir = `${homeDir}/.claude`;

  // Check .claude directory exists (will be mounted for credentials)
  try {
    const claudeDirStat = await Deno.stat(claudeDir);
    if (!claudeDirStat.isDirectory) {
      ui.error(`❌ ${claudeDir} exists but is not a directory`);
      return 1;
    }
  } catch {
    // Create .claude directory if it doesn't exist
    ui.output("📁 Creating .claude directory...");
    await Deno.mkdir(claudeDir, { recursive: true });
  }

  // Check if credentials exist
  const credentialsPath = `${claudeDir}/.credentials.json`;
  try {
    await Deno.stat(credentialsPath);
    ui.output("✅ Found existing Claude credentials");
  } catch {
    ui.output(
      "📝 No credentials found - run 'claude login' in the container on first use",
    );
  }

  // Get GitHub token from host
  let githubToken = "";
  try {
    const ghTokenCmd = new Deno.Command("gh", {
      args: ["auth", "token"],
      stdout: "piped",
      stderr: "null",
    });
    const ghTokenResult = await ghTokenCmd.output();
    if (ghTokenResult.success) {
      githubToken = new TextDecoder().decode(ghTokenResult.stdout).trim();
    }
  } catch {
    // gh command not available or failed, continue without token
  }

  // Handle workspace selection
  let workspaceId: string;
  let workspacePath: string;
  let reusingWorkspace = false;

  if (parsed.workspace) {
    // Use existing workspace
    workspaceId = parsed.workspace;
    const workspacesBaseDir = getWorkspacesDirectory();
    workspacePath = join(workspacesBaseDir, workspaceId);

    try {
      await Deno.stat(workspacePath);
      reusingWorkspace = true;
      ui.output(`🔄 Reusing existing workspace: ${workspaceId}`);
    } catch {
      ui.error(`❌ Workspace '${workspaceId}' not found at ${workspacePath}`);
      ui.output("Available workspaces:");
      try {
        const workspacesBaseDir = getWorkspacesDirectory();
        for await (
          const entry of Deno.readDir(workspacesBaseDir)
        ) {
          if (entry.isDirectory) {
            ui.output(`  - ${entry.name}`);
          }
        }
      } catch {
        ui.output("  (no workspaces found)");
      }
      return 1;
    }
  } else {
    // Create new workspace
    workspaceId = await generateRandomName();
    const workspacesBaseDir = getWorkspacesDirectory();
    workspacePath = join(workspacesBaseDir, workspaceId);

    // Ensure codebot-workspaces directory exists
    await Deno.mkdir(workspacesBaseDir, {
      recursive: true,
    });
  }

  if (!reusingWorkspace) {
    // Check if workspace already exists and find a unique one
    let counter = 1;
    while (true) {
      try {
        await Deno.stat(workspacePath);
        // Directory exists, try with a suffix
        ui.output(
          "🔍 TRACE: Workspace already exists, indicating duplicate execution",
        );
        ui.output(new Error().stack || "No stack trace available");
        ui.output(
          `⚠️ Workspace ${workspaceId} already exists, trying ${workspaceId}-${counter}`,
        );
        workspaceId = `${await generateRandomName()}-${counter}`;
        const workspacesBaseDir = getWorkspacesDirectory();
        workspacePath = join(workspacesBaseDir, workspaceId);
        counter++;
        if (counter > 10) {
          ui.error("❌ Unable to find unique workspace name after 10 attempts");
          return 1;
        }
      } catch {
        // Directory doesn't exist, we can use this name
        break;
      }
    }

    ui.output(`📁 Creating workspace: ${workspaceId}`);
  }

  // Update Ghostty titlebar with workspace name as soon as we know it
  try {
    await Deno.stdout.write(
      new TextEncoder().encode(`\x1b]0;codebot: ${workspaceId}\x07`),
    );
  } catch {
    // Ignore errors if not running in a terminal that supports title updates
  }

  // Announce workspace URL
  ui.output(
    `📡 Workspace will be available at: http://${workspaceId}.codebot.local:8000`,
  );

  // Open the workspace folder in Finder on macOS immediately after creating/selecting workspace
  if (!reusingWorkspace) {
    try {
      const openCmd = new Deno.Command("open", {
        args: [workspacePath],
        stdout: "null",
        stderr: "null",
      });
      await openCmd.output();
      ui.output(`📂 Opened workspace folder in Finder`);
    } catch (error) {
      // Don't fail if open command fails, just log it
      logger.debug(`Failed to open workspace folder: ${error}`);
    }
  }

  // Create abort controller for cancelling operations
  const abortController = new AbortController();

  // Start workspace copying and container preparation in parallel
  const copyWorkspacePromise = reusingWorkspace
    ? Promise.resolve()
    : (async () => {
      // Create the workspace directory structure first to avoid race conditions
      await Deno.mkdir(`${workspacePath}`, { recursive: true });

      // Copy Claude config files using CoW to workspace if they exist
      const homeDir = getConfigurationVariable("HOME");

      // Create tmp directory for Claude config
      await Deno.mkdir(`${workspacePath}/tmp`, { recursive: true });

      // Copy .claude.json if it exists (for project history)
      const claudeJsonPath = `${homeDir}/.claude.json`;
      try {
        await Deno.stat(claudeJsonPath);
        const copyClaudeJson = new Deno.Command("cp", {
          args: [
            "--reflink=auto",
            claudeJsonPath,
            `${workspacePath}/tmp/.claude.json`,
          ],
        });
        await copyClaudeJson.output();
        ui.output("📋 CoW copied .claude.json to tmp");
      } catch {
        // File doesn't exist, skip
      }

      // Skip copying .config/gh - use GITHUB_TOKEN environment variable instead

      // Copy entire directory using CoW (copy-on-write) for instant copying
      // Use Deno native fs to list directory contents and parallel cp --reflink
      const copyPromises = [];

      for await (const entry of Deno.readDir(".")) {
        // Skip .bft, tmp, and .codebot-metadata directories entirely
        if (
          entry.name === ".bft" || entry.name === "tmp" ||
          entry.name === ".codebot-metadata"
        ) continue;

        const copyCmd = new Deno.Command("cp", {
          args: [
            "--reflink=auto",
            "-R",
            entry.name,
            `${workspacePath}/`,
          ],
        });

        copyPromises.push(copyCmd.output());
      }

      // Run all copies in parallel
      const copyResults = await Promise.all(copyPromises);

      // Check if any copies failed
      for (const result of copyResults) {
        if (!result.success) {
          const errorText = new TextDecoder().decode(result.stderr);
          logger.info(
            "🔍 WORKSPACE COPY FAILURE STACK TRACE:",
            new Error().stack || "No stack trace available",
          );
          ui.output(
            "🔍 TRACE: Workspace copy failed, indicating duplicate execution",
          );
          abortController.abort(); // Cancel container build
          throw new Error(`💥 CRITICAL: Workspace copy failed - ${errorText}`);
        }
      }

      ui.output("📂 Workspace copy complete");

      // Store current branch before checkout
      ui.output("📍 Storing current branch information...");
      const whereAmICmd = new Deno.Command("sl", {
        args: ["whereami"],
        cwd: workspacePath,
        stdout: "piped",
        stderr: "piped",
      });

      const whereAmIResult = await whereAmICmd.output();
      let originalCommit = "";
      if (whereAmIResult.success) {
        originalCommit = new TextDecoder().decode(whereAmIResult.stdout).trim();

        // Write current commit to a file for later reference
        const metadataPath = `${workspacePath}/.codebot-metadata`;
        await Deno.mkdir(metadataPath, { recursive: true });
        await Deno.writeTextFile(
          `${metadataPath}/original-commit`,
          originalCommit,
        );
        ui.output(`📝 Stored original commit: ${originalCommit}`);
      }

      // Checkout remote/main in the new workspace
      ui.output("🔄 Checking out remote/main in workspace...");
      const checkoutCmd = new Deno.Command("sl", {
        args: ["goto", "remote/main"],
        cwd: workspacePath,
        stdout: "piped",
        stderr: "piped",
      });

      const checkoutResult = await checkoutCmd.output();
      if (!checkoutResult.success) {
        const errorText = new TextDecoder().decode(checkoutResult.stderr);
        ui.error(`⚠️ Failed to checkout remote/main: ${errorText}`);
        // Don't fail the workspace creation, just warn
      } else {
        ui.output("✅ Checked out remote/main");
        if (originalCommit) {
          ui.output(
            `💡 To return to original commit: sl goto ${originalCommit}`,
          );
        }
      }
    })();

  // Container preparation (check if we need to pull or build)
  const containerReadyPromise = (async () => {
    // Ensure container system is running
    try {
      const statusCmd = new Deno.Command("container", {
        args: ["system", "status"],
      });
      const statusResult = await statusCmd.output();

      if (!statusResult.success) {
        ui.output("🚀 Starting container system...");
        const startCmd = new Deno.Command("container", {
          args: ["system", "start"],
          stdout: "inherit",
          stderr: "inherit",
        });
        const startResult = await startCmd.output();

        if (!startResult.success) {
          throw new Error("Failed to start container system");
        }
        ui.output("✅ Container system started");
      }
    } catch {
      ui.output("🚀 Starting container system...");
      const startCmd = new Deno.Command("container", {
        args: ["system", "start"],
        stdout: "inherit",
        stderr: "inherit",
      });
      const startResult = await startCmd.output();

      if (!startResult.success) {
        throw new Error("Failed to start container system");
      }
      ui.output("✅ Container system started");
    }

    const ghcrImage = "ghcr.io/bolt-foundry/bolt-foundry/codebot:latest";
    let needsRebuild = parsed["force-rebuild"];
    let useLocalBuild = false;
    let rebuildReason = "";

    if (needsRebuild) {
      rebuildReason = "Force rebuild flag (--force-rebuild) was specified";
      useLocalBuild = true;
    } else {
      // First, try to pull from ghcr.io
      ui.output("🌐 Checking for pre-built container image...");
      const pullCmd = new Deno.Command("container", {
        args: ["pull", ghcrImage],
        stdout: "piped",
        stderr: "piped",
      });
      const pullResult = await pullCmd.output();

      if (pullResult.success) {
        ui.output("✅ Successfully pulled pre-built container from ghcr.io");

        // Tag it as 'codebot' for local use
        const tagCmd = new Deno.Command("container", {
          args: ["tag", ghcrImage, "codebot"],
        });
        const tagResult = await tagCmd.output();

        if (!tagResult.success) {
          ui.output("⚠️ Failed to tag remote image, will use local build");
          useLocalBuild = true;
        }
      } else {
        // Pull failed, check if we have a local image
        ui.output(
          "⚠️ Could not pull from ghcr.io, checking for local image...",
        );

        const inspectCmd = new Deno.Command("container", {
          args: ["images", "inspect", "codebot"],
        });
        const inspectResult = await inspectCmd.output();
        const inspectOutput = new TextDecoder().decode(inspectResult.stdout)
          .trim();

        if (!inspectResult.success || inspectOutput === "[]") {
          needsRebuild = true;
          useLocalBuild = true;
          rebuildReason = "No container image found (neither remote nor local)";
          ui.output("📦 Container image not found - local build required");
        } else {
          // Check if local image is outdated
          try {
            const imageData = JSON.parse(inspectOutput);
            const lastHistoryEntry = imageData[0]?.variants?.[0]?.config
              ?.history
              ?.slice(-1)[0];
            const imageCreatedStr = lastHistoryEntry?.created;

            if (imageCreatedStr) {
              const imageCreated = new Date(imageCreatedStr);
              ui.output(
                `📅 Local container image created: ${imageCreated.toISOString()}`,
              );

              // Check modification times of flake files and Dockerfile
              const flakeNixStat = await Deno.stat("flake.nix");
              const flakeLockStat = await Deno.stat("flake.lock");
              const dockerfileStat = await Deno.stat(
                "infra/apps/codebot/Dockerfile",
              );

              const modifiedFiles = [];
              if (flakeNixStat.mtime && flakeNixStat.mtime > imageCreated) {
                modifiedFiles.push(
                  `flake.nix (${flakeNixStat.mtime.toISOString()})`,
                );
              }
              if (flakeLockStat.mtime && flakeLockStat.mtime > imageCreated) {
                modifiedFiles.push(
                  `flake.lock (${flakeLockStat.mtime.toISOString()})`,
                );
              }
              if (dockerfileStat.mtime && dockerfileStat.mtime > imageCreated) {
                modifiedFiles.push(
                  `Dockerfile (${dockerfileStat.mtime.toISOString()})`,
                );
              }

              if (modifiedFiles.length > 0) {
                needsRebuild = true;
                useLocalBuild = true;
                rebuildReason =
                  `Build files newer than local container image: ${
                    modifiedFiles.join(", ")
                  }`;
                ui.output(
                  `🔄 Files modified since image creation: ${
                    modifiedFiles.join(", ")
                  }`,
                );
              } else {
                ui.output("✅ Local container image is up to date");
              }
            } else {
              needsRebuild = true;
              useLocalBuild = true;
              rebuildReason =
                "Could not determine image creation time from container metadata";
              ui.output(
                "⚠️ Could not determine image creation time - rebuild required",
              );
            }
          } catch (error) {
            needsRebuild = true;
            useLocalBuild = true;
            rebuildReason = `Failed to parse image metadata: ${
              error instanceof Error ? error.message : String(error)
            }`;
            ui.output("⚠️ Failed to parse image info - rebuild required");
          }
        }
      }
    }

    if (needsRebuild && useLocalBuild) {
      ui.output(`🔨 Building container image locally...`);
      ui.output(`📝 Reason: ${rebuildReason}`);
      const buildCmd = new Deno.Command("container", {
        args: [
          "build",
          "-f",
          "infra/apps/codebot/Dockerfile",
          "-t",
          "codebot",
          ".",
        ],
        stdout: "inherit",
        stderr: "inherit",
        signal: abortController.signal,
      }).spawn();

      const buildResult = await buildCmd.status;
      if (!buildResult.success) {
        abortController.abort(); // Cancel workspace copy if still running
        throw new Error("Failed to rebuild container");
      }
      ui.output("✅ Container build complete");
    } else if (!needsRebuild) {
      ui.output("📦 Container image ready");
    }
  })();

  // Wait for both operations to complete
  try {
    ui.output(`⚡ Starting parallel workspace copy and container prep...`);
    await Promise.all([copyWorkspacePromise, containerReadyPromise]);
    ui.output(`✅ Workspace ready: ${workspaceId}`);
  } catch (error) {
    ui.error(`❌ ${error instanceof Error ? error.message : String(error)}`);
    // Clean up workspace on error
    try {
      await Deno.remove(workspacePath, { recursive: true });
    } catch {
      // Ignore cleanup errors
    }
    return 1;
  }

  // Check if container is already running with this workspace name
  if (parsed.workspace) {
    try {
      const inspectCmd = new Deno.Command("container", {
        args: ["inspect", workspaceId, "--format", "{{.State.Running}}"],
        stdout: "piped",
        stderr: "null",
      });
      const inspectResult = await inspectCmd.output();

      if (inspectResult.success) {
        const isRunning =
          new TextDecoder().decode(inspectResult.stdout).trim() === "true";

        if (isRunning) {
          ui.output(
            `🔄 Container '${workspaceId}' is already running - attaching to it...`,
          );

          // Attach to the running container
          const attachCmd = new Deno.Command("container", {
            args: ["attach", workspaceId],
            stdin: "inherit",
            stdout: "inherit",
            stderr: "inherit",
          });

          const attachChild = attachCmd.spawn();
          const { success } = await attachChild.status;

          // Don't cleanup workspace for resumed containers
          ui.output(`📁 Workspace preserved at: ${workspacePath}`);
          return success ? 0 : 1;
        }
      }
    } catch (error) {
      // Container doesn't exist, continue with normal flow
      logger.debug(
        `Container check failed: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }

  if (parsed.shell) {
    const containerArgs = buildContainerArgs({
      workspaceId,
      workspacePath,
      claudeDir,
      githubToken,
      memory: parsed.memory || autoMemory,
      cpus: parsed.cpus || autoCpus,
      interactive: true,
      removeOnExit: true,
    });

    // Add container image
    containerArgs.push("docsbot");

    const child = new Deno.Command("container", {
      args: containerArgs,
      stdin: "inherit",
      stdout: "inherit",
      stderr: "inherit",
    }).spawn();

    await child.status;

    // Cleanup workspace only if --cleanup flag is provided
    if (parsed.cleanup) {
      ui.output(`🧹 Cleaning up workspace: ${workspaceId}`);
      await Deno.remove(workspacePath, { recursive: true });
    } else {
      ui.output(`📁 Workspace preserved at: ${workspacePath}`);
    }
    return 0;
  }

  if (parsed.checkout) {
    ui.output(`🔄 Running checkout in workspace: ${workspaceId}`);
    ui.output(`📍 Target branch: ${parsed.checkout}`);

    // Run checkout on the host in the workspace directory
    // This avoids copy-on-write issues in the container
    const checkoutCmd = new Deno.Command("bft", {
      args: ["sl", "checkout", parsed.checkout],
      cwd: workspacePath,
      stdin: "inherit",
      stdout: "inherit",
      stderr: "inherit",
    });

    const checkoutChild = checkoutCmd.spawn();
    const { success } = await checkoutChild.status;

    if (!success) {
      ui.error("❌ Checkout failed");
      return 1;
    }

    ui.output("✅ Checkout completed successfully");
    ui.output(`📁 Workspace preserved at: ${workspacePath}`);
    return 0;
  }

  if (parsed.exec) {
    const containerArgs = buildContainerArgs({
      workspaceId,
      workspacePath,
      claudeDir,
      githubToken,
      memory: parsed.memory || autoMemory,
      cpus: parsed.cpus || autoCpus,
      interactive: false,
      removeOnExit: true,
    });

    // Add container image and command
    containerArgs.push("docsbot", "-c", parsed.exec);

    // Debug: log the full container command
    ui.output(
      `🔍 DEBUG: Container command: container ${containerArgs.join(" ")}`,
    );

    const child = new Deno.Command("container", {
      args: containerArgs,
      stdin: "inherit",
      stdout: "inherit",
      stderr: "inherit",
    }).spawn();

    const { success } = await child.status;

    // Cleanup workspace only if --cleanup flag is provided
    if (parsed.cleanup) {
      ui.output(`🧹 Cleaning up workspace: ${workspaceId}`);
      await Deno.remove(workspacePath, { recursive: true });
    } else {
      ui.output(`📁 Workspace preserved at: ${workspacePath}`);
    }
    return success ? 0 : 1;
  }

  // Default mode: Start Claude Code CLI
  ui.output("🤖 Starting Claude Code...");
  ui.output(
    `💾 Memory: ${parsed.memory || autoMemory} | CPUs: ${
      parsed.cpus || autoCpus
    }`,
  );

  // Check if this is first run (no credentials)
  try {
    await Deno.stat(`${claudeDir}/.credentials.json`);
  } catch {
    ui.output(
      "📝 First time? Run 'claude login' inside the container to authenticate",
    );
  }

  const containerArgs = buildContainerArgs({
    workspaceId,
    workspacePath,
    claudeDir,
    githubToken,
    memory: parsed.memory || autoMemory,
    cpus: parsed.cpus || autoCpus,
    interactive: true,
    removeOnExit: true,
  });

  // Add container image and command
  containerArgs.push(
    "codebot",
    "-c",
    "claude --dangerously-skip-permissions; exec /bin/bash",
  );

  const child = new Deno.Command("container", {
    args: containerArgs,
    stdin: "inherit",
    stdout: "inherit",
    stderr: "inherit",
  }).spawn();

  const { success } = await child.status;

  // Cleanup workspace only if --cleanup flag is provided
  if (parsed.cleanup) {
    ui.output(`🧹 Cleaning up workspace: ${workspaceId}`);
    await Deno.remove(workspacePath, { recursive: true });
  } else {
    ui.output(`📁 Workspace preserved at: ${workspacePath}`);
  }
  return success ? 0 : 1;
}

// Export the task definition for autodiscovery
export const bftDefinition = {
  description: "Run Claude Code in isolated container for documentation work",
  fn: codebot,
} satisfies TaskDefinition;

// When run directly as a script
if (import.meta.main) {
  const scriptArgs = Deno.args.slice(2);
  const result = await codebot(scriptArgs);
  Deno.exit(result);
}
