#!/usr/bin/env -S bft run

import { getConfigurationVariable } from "@bolt-foundry/get-configuration-var";
import { parseArgs } from "@std/cli/parse-args";
import { ui } from "@bfmono/packages/tui/tui.ts";
import { getLogger } from "@bfmono/packages/logger/logger.ts";
import { promptSelect } from "@std/cli/unstable-prompt-select";
import { dirname, join, resolve } from "@std/path";

const logger = getLogger(import.meta);

export interface BotConfig {
  name: string;
  envVar: string;
  githubTokenVar?: string;
  helpExamples?: string;
  workingDir?: string; // Default: /internalbf
}

export interface ContainerArgs {
  shell?: boolean;
  exec?: string;
  help?: boolean;
  "force-rebuild"?: boolean;
  cleanup?: boolean;
  "cleanup-containers"?: boolean;
  workspace?: string;
  resume?: boolean;
  memory?: string;
  cpus?: string;
  checkout?: string;
  "debug-logs"?: boolean;
}

interface ContainerConfig {
  workspaceId: string;
  workspacePath: string;
  claudeDir: string;
  githubToken: string;
  memory: string;
  cpus: string;
  interactive: boolean;
  removeOnExit: boolean;
}

function buildContainerArgs(
  config: ContainerConfig,
  botConfig: BotConfig,
): Array<string> {
  const baseArgs = [
    "run",
    config.removeOnExit ? "--rm" : "-d",
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
    botConfig.workingDir || "/internalbf",
    "--volume",
    "/tmp:/dev/shm", // Use host /tmp as shared memory for Chrome
    "-e",
    `GITHUB_TOKEN=${config.githubToken}`,
    "-e",
    "BF_E2E_MODE=true", // Enable E2E mode features
    "-e",
    "PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable",
    "-e",
    "PUPPETEER_DISABLE_DEV_SHM_USAGE=true",
    "-e",
    "PUPPETEER_NO_SANDBOX=true",
    "-e",
    "DISPLAY=:99", // Virtual display for headless Chrome
    "-e",
    `${botConfig.envVar}=true`, // Bot-specific container identifier
    "-e",
    "TERM=xterm-256color", // Enable proper color support in terminal
  ];

  if (config.interactive) {
    baseArgs.push("-it");
  }

  return baseArgs;
}

async function getGithubToken(botConfig: BotConfig): Promise<string> {
  // First, check for bot-specific GitHub token if configured
  if (botConfig.githubTokenVar) {
    const botToken = getConfigurationVariable(botConfig.githubTokenVar);
    if (botToken) {
      ui.output(`✅ Using ${botConfig.name}-specific GitHub token`);
      return botToken;
    }
  }

  // Fall back to gh CLI token
  try {
    const ghTokenCmd = new Deno.Command("gh", {
      args: ["auth", "token"],
      stdout: "piped",
      stderr: "null",
    });
    const ghTokenResult = await ghTokenCmd.output();
    if (ghTokenResult.success) {
      const token = new TextDecoder().decode(ghTokenResult.stdout).trim();
      ui.output("✅ Using GitHub token from gh CLI");
      return token;
    }
  } catch (error) {
    logger.debug(`Failed to get GitHub token from gh CLI: ${error}`);
  }

  ui.warn("⚠️ No GitHub token found - some features may be limited");
  return "";
}

function getWorkspacesDirectory(): string {
  // Go up from lib to bft to infra to bfmono to internalbf
  const currentPath = dirname(
    dirname(dirname(dirname(import.meta.url.replace("file://", "")))),
  );

  // Find internalbf directory
  let internalbfDir: string;
  if (currentPath.includes("/bfmono")) {
    internalbfDir = currentPath.substring(
      0,
      currentPath.lastIndexOf("/bfmono"),
    );
  } else {
    internalbfDir = currentPath;
  }

  return join(internalbfDir, "codebot-workspaces");
}

async function cleanupStoppedContainers(): Promise<void> {
  ui.output("🧹 Cleaning up stopped containers...");

  try {
    const psCmd = new Deno.Command("container", {
      args: ["ps", "-a", "--filter", "status=exited", "--format", "{{.Names}}"],
      stdout: "piped",
      stderr: "null",
    });

    const psResult = await psCmd.output();

    if (psResult.success) {
      const containerNames = new TextDecoder().decode(psResult.stdout)
        .trim()
        .split("\n")
        .filter((name) => name && (name.includes("-") && !name.includes("/")));

      if (containerNames.length > 0) {
        const rmCmd = new Deno.Command("container", {
          args: ["rm", ...containerNames],
          stdout: "null",
          stderr: "null",
        });

        await rmCmd.output();
        ui.output(
          `✅ Cleaned up ${containerNames.length} stopped container(s)`,
        );
      } else {
        ui.output("✅ No stopped containers to clean up");
      }
    }
  } catch (error) {
    logger.debug(`Container cleanup failed: ${error}`);
  }
}

async function ensureDnsServer(): Promise<void> {
  ui.output("🌐 Checking DNS server for *.codebot.local...");

  try {
    const checkCmd = new Deno.Command("container", {
      args: ["ps", "--filter", "name=codebot-dns", "--format", "{{.Status}}"],
      stdout: "piped",
      stderr: "null",
    });

    const checkResult = await checkCmd.output();
    const status = new TextDecoder().decode(checkResult.stdout).trim();

    if (status && status.includes("Up")) {
      ui.output("✅ DNS server already running");
      return;
    }

    // Start DNS server
    const startCmd = new Deno.Command("container", {
      args: [
        "run",
        "-d",
        "--rm",
        "--name",
        "codebot-dns",
        "-p",
        "127.0.0.1:15353:53/udp",
        "-p",
        "127.0.0.1:15353:53/tcp",
        "strm/dnsmasq",
        "--address=/codebot.local/127.0.0.1",
        "--no-resolv",
        "--server=1.1.1.1",
        "--server=8.8.8.8",
      ],
      stdout: "null",
      stderr: "null",
    });

    const startResult = await startCmd.output();

    if (startResult.success) {
      ui.output("✅ DNS server started successfully");
    } else {
      ui.warn(
        "⚠️ Could not start DNS server - *.codebot.local URLs may not work",
      );
    }
  } catch (error) {
    logger.debug(`DNS server check failed: ${error}`);
    ui.warn("⚠️ Could not check DNS server status");
  }
}

async function ensureHostBridge(): Promise<void> {
  ui.output("🌉 Checking host bridge...");

  const hostBridgePath = join(
    dirname(dirname(dirname(import.meta.url.replace("file://", "")))),
    "apps",
    "codebot",
    "host-bridge.ts",
  );

  try {
    const checkCmd = new Deno.Command("pgrep", {
      args: ["-f", "host-bridge.ts"],
      stdout: "null",
      stderr: "null",
    });

    const checkResult = await checkCmd.output();

    if (checkResult.success) {
      ui.output("✅ Host bridge already running");
      return;
    }

    // Start host bridge
    const startCmd = new Deno.Command("deno", {
      args: [
        "run",
        "--allow-net",
        "--allow-run",
        "--allow-env",
        "--allow-read",
        "--allow-write",
        hostBridgePath,
      ],
      stdout: "null",
      stderr: "null",
    });

    startCmd.spawn();

    // Give it a moment to start
    await new Promise((resolve) => setTimeout(resolve, 1000));

    ui.output("✅ Host bridge started");
  } catch (error) {
    logger.debug(`Host bridge check failed: ${error}`);
    ui.warn("⚠️ Could not start host bridge - some features may be limited");
  }
}

async function generateRandomName(): Promise<string> {
  const adjectives = [
    "happy",
    "fuzzy",
    "bright",
    "smart",
    "quick",
    "cool",
    "warm",
    "wild",
    "calm",
    "bold",
  ];
  const nouns = [
    "panda",
    "koala",
    "tiger",
    "eagle",
    "shark",
    "wolf",
    "fox",
    "bear",
    "lion",
    "hawk",
  ];

  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];

  return `${adjective}-${noun}`;
}

export async function runBot(botConfig: BotConfig): Promise<number> {
  const args = Deno.args;

  if (args.length === 0 || args.includes("--help") || args.includes("-h")) {
    ui.output(
      botConfig.helpExamples || `
${botConfig.name.toUpperCase()} - Interactive container environment

USAGE:
  bft ${botConfig.name} [OPTIONS]

OPTIONS:
  --workspace <name>      Use specific workspace name
  --resume                Resume from existing workspace
  --cleanup               Delete workspace after exit
  --cleanup-containers    Clean up all stopped containers
  --shell                 Open shell instead of default command
  --exec <command>        Execute command and exit
  --checkout <branch>     Checkout branch with auto shelve/unshelve
  --memory <size>         Container memory limit (e.g., 4g, 8192m)
  --cpus <count>          Number of CPUs (e.g., 4)
  --force-rebuild         (Deprecated - use 'bft codebot-build' instead)
  --debug-logs            Enable debug logging
  --help                  Show this help
`,
    );
    return 0;
  }

  // Handle cleanup-containers first
  const parsed = parseArgs(args, {
    boolean: [
      "shell",
      "help",
      "force-rebuild",
      "cleanup",
      "cleanup-containers",
      "resume",
      "debug-logs",
    ],
    string: ["exec", "workspace", "memory", "cpus", "checkout"],
  }) as ContainerArgs;

  if (parsed["cleanup-containers"]) {
    await cleanupStoppedContainers();
    return 0;
  }

  // Handle force-rebuild
  if (parsed["force-rebuild"]) {
    ui.output("🔨 Force rebuilding container image...");

    // Path to Dockerfile
    const dockerfilePath = join(
      dirname(dirname(dirname(import.meta.url.replace("file://", "")))),
      "apps",
      "codebot",
      "Dockerfile",
    );

    // Build context should be the internalbf directory (parent of bfmono)
    const currentPath = Deno.cwd();
    let buildContext: string;

    if (currentPath.includes("/bfmono")) {
      buildContext = currentPath.substring(
        0,
        currentPath.lastIndexOf("/bfmono"),
      );
    } else {
      buildContext = currentPath;
    }

    // Build the container
    const buildCmd = new Deno.Command("container", {
      args: [
        "build",
        "-t",
        "codebot",
        "-f",
        dockerfilePath,
        buildContext, // Use internalbf as build context
      ],
      stdout: "inherit",
      stderr: "inherit",
    });

    const buildResult = await buildCmd.output();

    if (buildResult.success) {
      ui.output("✅ Container image rebuilt successfully");
      return 0;
    } else {
      ui.error("❌ Failed to rebuild container image");
      return 1;
    }
  }

  // Validate memory format
  if (parsed.memory && !parsed.memory.match(/^\d+[gmGM]?$/)) {
    ui.error("❌ Invalid memory format. Use format like '4g' or '8192m'");
    return 1;
  }

  // Validate cpus format
  if (
    parsed.cpus &&
    (!parsed.cpus.match(/^\d+(\.\d+)?$/) || parseFloat(parsed.cpus) <= 0)
  ) {
    ui.error("❌ Invalid CPU count. Must be a positive number");
    return 1;
  }

  // Auto-detect system resources
  const systemInfo = await getSystemResources();
  const autoMemory = `${systemInfo.memory}g`;
  const autoCpus = systemInfo.cpus.toString();

  ui.output(
    `INFO: Auto-detected system resources: ${autoMemory} RAM (${systemInfo.memoryPercent}% of system), ${autoCpus} CPUs (${systemInfo.cpuNote})`,
  );

  // Cleanup stopped containers
  await cleanupStoppedContainers();

  // Ensure DNS server is running
  await ensureDnsServer();

  // Ensure host bridge is running
  await ensureHostBridge();

  // Check for Claude credentials
  const homeDir = getConfigurationVariable("HOME");
  const claudeDir = `${homeDir}/.claude`;

  try {
    await Deno.stat(claudeDir);
    ui.output("✅ Found existing Claude credentials");
  } catch {
    ui.warn("⚠️ No Claude credentials found - you'll need to authenticate");
  }

  // Get GitHub token
  const githubToken = await getGithubToken(botConfig);

  // Handle workspace selection
  let workspaceId = "";
  let workspacePath = "";
  let reusingWorkspace = false;

  if (parsed.resume && parsed.workspace) {
    ui.error("❌ Cannot use both --resume and --workspace options");
    return 1;
  }

  if (parsed.resume) {
    // List existing workspaces
    const workspacesDir = getWorkspacesDirectory();
    const workspaces: Array<{ name: string; modified: Date }> = [];

    try {
      for await (const entry of Deno.readDir(workspacesDir)) {
        if (entry.isDirectory) {
          const workspacePath = `${workspacesDir}/${entry.name}`;
          const stat = await Deno.stat(workspacePath);
          workspaces.push({
            name: entry.name,
            modified: new Date(stat.mtime || Date.now()),
          });
        }
      }
    } catch {
      // No workspaces directory yet
    }

    if (workspaces.length === 0) {
      ui.warn("⚠️ No existing workspaces found, creating new one...");
    } else {
      // Sort by most recently modified
      workspaces.sort((a, b) => b.modified.getTime() - a.modified.getTime());

      const choices = workspaces.map((w) => {
        const age = Date.now() - w.modified.getTime();
        const ageStr = age < 3600000
          ? `${Math.floor(age / 60000)}m ago`
          : age < 86400000
          ? `${Math.floor(age / 3600000)}h ago`
          : `${Math.floor(age / 86400000)}d ago`;
        return `${w.name} (${ageStr})`;
      });

      const selected = await promptSelect(
        "Select a workspace to resume:",
        choices,
      );
      if (!selected) {
        ui.error("❌ No workspace selected");
        return 1;
      }
      workspaceId = selected.split(" ")[0];
      workspacePath = `${workspacesDir}/${workspaceId}`;
      reusingWorkspace = true;
      ui.output(`📁 Resuming workspace: ${workspaceId}`);
    }
  } else if (parsed.workspace) {
    workspaceId = parsed.workspace;
    const workspacesBaseDir = getWorkspacesDirectory();
    workspacePath = join(workspacesBaseDir, workspaceId);

    try {
      await Deno.stat(workspacePath);
      reusingWorkspace = true;
      ui.output(`📁 Reusing existing workspace: ${workspaceId}`);
    } catch {
      ui.output(`📁 Creating new workspace: ${workspaceId}`);
    }
  }

  if (!workspaceId) {
    // Generate unique workspace name
    let counter = 0;
    while (true) {
      workspaceId = await generateRandomName();
      const workspacesBaseDir = getWorkspacesDirectory();
      workspacePath = join(workspacesBaseDir, workspaceId);

      try {
        await Deno.stat(workspacePath);
        // Directory exists, try again with counter
        workspaceId = `${await generateRandomName()}-${counter}`;
        workspacePath = join(workspacesBaseDir, workspaceId);
        counter++;
        if (counter > 10) {
          ui.error("❌ Failed to generate unique workspace name");
          return 1;
        }
      } catch {
        // Directory doesn't exist, we can use it
        break;
      }
    }
    ui.output(`📁 Creating workspace: ${workspaceId}`);
  }

  // Create workspace and prepare container
  const abortController = new AbortController();

  const copyWorkspacePromise = reusingWorkspace
    ? Promise.resolve()
    : (async () => {
      await Deno.mkdir(`${workspacePath}`, { recursive: true });
      await Deno.mkdir(`${workspacePath}/tmp`, { recursive: true });

      // Copy Claude config if exists
      const claudeJsonPath = `${claudeDir}/.claude.json`;
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

      // Copy workspace files
      const copyPromises = [];

      // Find the internalbf directory
      const currentPath = Deno.cwd();
      let internalbfDir: string;

      if (currentPath.includes("/bfmono")) {
        internalbfDir = currentPath.substring(
          0,
          currentPath.lastIndexOf("/bfmono"),
        );
      } else {
        internalbfDir = currentPath;
      }

      for await (const entry of Deno.readDir(internalbfDir)) {
        if (
          entry.name === ".bft" || entry.name === "tmp" ||
          entry.name === ".codebot-metadata" ||
          entry.name === "codebot-workspaces"
        ) continue;

        const copyCmd = new Deno.Command("cp", {
          args: [
            "--reflink=auto",
            "-R",
            join(internalbfDir, entry.name),
            `${workspacePath}/`,
          ],
        });

        copyPromises.push(copyCmd.output());
      }

      const copyResults = await Promise.all(copyPromises);

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
          abortController.abort();
          throw new Error(
            `Workspace already exists or copy failed: ${errorText}. Use --resume to continue with existing workspace.`,
          );
        }
      }

      ui.output("📂 Workspace copy complete");

      // Store current branch info and checkout if needed
      if (parsed.checkout) {
        // Implementation would go here
        ui.output(`🔄 Checking out ${parsed.checkout}...`);
      }
    })();

  const containerReadyPromise = (async () => {
    // Check for container image
    ui.output("🌐 Checking for pre-built container image...");

    // Try to pull from GitHub Container Registry
    const pullCmd = new Deno.Command("container", {
      args: ["pull", "ghcr.io/bolt-foundry/codebot:latest"],
      stdout: "null",
      stderr: "null",
      signal: abortController.signal,
    });

    const pullResult = await pullCmd.output();

    if (pullResult.success) {
      ui.output("✅ Successfully pulled latest container image");

      // Tag it as 'codebot' for local use
      const tagCmd = new Deno.Command("container", {
        args: ["tag", "ghcr.io/bolt-foundry/codebot:latest", "codebot"],
        stdout: "null",
        stderr: "null",
      });
      await tagCmd.output();
    } else {
      ui.warn("⚠️ Could not pull from ghcr.io, checking for local image...");

      // Check if local image exists
      const inspectCmd = new Deno.Command("container", {
        args: ["images", "inspect", "codebot"],
        stdout: "piped",
        stderr: "null",
      });

      const inspectResult = await inspectCmd.output();

      if (!inspectResult.success) {
        ui.error(
          "❌ No container image found. Please run 'bft codebot-build' first",
        );
        throw new Error("Container image not found");
      }

      // Parse the JSON output to get the creation date
      let imageDate = "Unknown";
      try {
        const inspectData = JSON.parse(
          new TextDecoder().decode(inspectResult.stdout),
        );
        if (inspectData.length > 0 && inspectData[0].Created) {
          imageDate = inspectData[0].Created;
        }
      } catch {
        // If we can't parse, just continue with "Unknown"
      }
      ui.output(`📅 Local container image created: ${imageDate}`);

      // Check if image is recent (within 7 days)
      const created = new Date(imageDate);
      const ageInDays = (Date.now() - created.getTime()) /
        (1000 * 60 * 60 * 24);

      if (ageInDays > 7) {
        ui.warn(
          `⚠️ Container image is ${
            Math.floor(ageInDays)
          } days old - consider rebuilding with --force-rebuild`,
        );
      } else {
        ui.output("✅ Local container image is up to date");
      }
    }

    ui.output("📦 Container image ready");
  })();

  // Wait for both operations
  try {
    ui.output(`⚡ Starting parallel workspace copy and container prep...`);
    await Promise.all([copyWorkspacePromise, containerReadyPromise]);
    ui.output(`✅ Workspace ready: ${workspaceId}`);
  } catch (error) {
    ui.error(`❌ ${error instanceof Error ? error.message : String(error)}`);
    try {
      await Deno.remove(workspacePath, { recursive: true });
    } catch {
      // Ignore cleanup errors
    }
    return 1;
  }

  // Build container configuration
  const containerConfig: ContainerConfig = {
    workspaceId,
    workspacePath,
    claudeDir,
    githubToken,
    memory: parsed.memory || autoMemory,
    cpus: parsed.cpus || autoCpus,
    interactive: parsed.shell || !parsed.exec,
    removeOnExit: true,
  };

  // Handle different execution modes
  if (parsed.shell) {
    const containerArgs = buildContainerArgs(containerConfig, botConfig);
    containerArgs.push("codebot");

    const child = new Deno.Command("container", {
      args: containerArgs,
      stdin: "inherit",
      stdout: "inherit",
      stderr: "inherit",
    }).spawn();

    await child.status;
  } else if (parsed.exec) {
    const containerArgs = buildContainerArgs(containerConfig, botConfig);
    containerArgs.push("codebot", "-c", parsed.exec);

    if (parsed["debug-logs"]) {
      ui.output(
        `🔍 DEBUG: Container command: container ${containerArgs.join(" ")}`,
      );
    }

    const child = new Deno.Command("container", {
      args: containerArgs,
      stdin: "inherit",
      stdout: "inherit",
      stderr: "inherit",
    }).spawn();

    await child.status;
  } else {
    // Default interactive mode
    const containerArgs = buildContainerArgs(containerConfig, botConfig);
    containerArgs.push("codebot");

    const child = new Deno.Command("container", {
      args: containerArgs,
      stdin: "inherit",
      stdout: "inherit",
      stderr: "inherit",
    }).spawn();

    await child.status;
  }

  // Cleanup or preserve workspace
  if (parsed.cleanup) {
    ui.output(`🧹 Cleaning up workspace: ${workspaceId}`);
    await Deno.remove(workspacePath, { recursive: true });
  } else {
    ui.output(`📁 Workspace preserved at: ${workspacePath}`);
  }

  return 0;
}

async function getSystemResources(): Promise<{
  memory: number;
  memoryPercent: number;
  cpus: number;
  cpuNote: string;
}> {
  let memory = 4; // Default 4GB
  let memoryPercent = 50;
  let cpus = 4; // Default 4 CPUs
  let cpuNote = "default";

  try {
    // Get total system memory
    const memCmd = new Deno.Command("sysctl", {
      args: ["-n", "hw.memsize"],
      stdout: "piped",
      stderr: "null",
    });

    const memResult = await memCmd.output();
    if (memResult.success) {
      const totalMemBytes = parseInt(
        new TextDecoder().decode(memResult.stdout).trim(),
      );
      const totalMemGB = Math.floor(totalMemBytes / (1024 * 1024 * 1024));

      // Use 100% of available memory for container
      memory = totalMemGB;
      memoryPercent = 100;
    }

    // Get CPU count
    const cpuCmd = new Deno.Command("sysctl", {
      args: ["-n", "hw.ncpu"],
      stdout: "piped",
      stderr: "null",
    });

    const cpuResult = await cpuCmd.output();
    if (cpuResult.success) {
      cpus = parseInt(new TextDecoder().decode(cpuResult.stdout).trim());
      cpuNote = "all available";
    }
  } catch {
    // Fallback for non-macOS systems or if commands fail
    try {
      const memInfo = await Deno.readTextFile("/proc/meminfo");
      const match = memInfo.match(/MemTotal:\s+(\d+)\s+kB/);
      if (match) {
        const totalMemKB = parseInt(match[1]);
        const totalMemGB = Math.floor(totalMemKB / (1024 * 1024));
        memory = Math.floor(totalMemGB * 0.5); // Use 50% on Linux
        memoryPercent = 50;
      }
    } catch {
      // Keep defaults
    }

    try {
      const cpuInfo = await Deno.readTextFile("/proc/cpuinfo");
      const matches = cpuInfo.match(/processor\s*:/g);
      if (matches) {
        cpus = matches.length;
        cpuNote = "all available";
      }
    } catch {
      // Keep defaults
    }
  }

  return { memory, memoryPercent, cpus, cpuNote };
}
