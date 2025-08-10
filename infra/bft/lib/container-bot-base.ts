#!/usr/bin/env -S bft run

import { getConfigurationVariable } from "@bolt-foundry/get-configuration-var";
import { parseArgs } from "@std/cli/parse-args";
import { ui } from "@bfmono/packages/tui/tui.ts";
import { getLogger } from "@bfmono/packages/logger/logger.ts";
import { promptSelect } from "@std/cli/unstable-prompt-select";
import { dirname, join } from "@std/path";
import { ensureWildcardCertificate } from "@bfmono/infra/apps/codebot/cert-utils.ts";

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
  sharedPath?: string;
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
  ];

  // Mount the shared folder from the host if provided
  if (config.sharedPath) {
    baseArgs.push("--volume", `${config.sharedPath}:/internalbf/bfmono/shared`);
    ui.output(`📁 Mounting shared folder: ${config.sharedPath}`);
  }

  baseArgs.push(
    "--volume",
    "/tmp:/dev/shm", // Use host /tmp as shared memory for Chrome
    "-e",
    `GITHUB_TOKEN=${config.githubToken}`,
    "-e",
    "BF_E2E_MODE=true", // Enable E2E mode features
    "-e",
    "BF_ENV=development", // Enable dev mode features
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
    "TERM=xterm-256color", // Enable 256 color support in terminal
    "-e",
    "BF_ROOT=/internalbf/bfmono", // Set BF_ROOT to bfmono subdirectory
    "-e",
    "DENO_DIR=/internalbf/bfmono/shared/.deno",
  );

  if (config.interactive) {
    baseArgs.push("-it");
  }

  return baseArgs;
}

async function isContainerRunning(containerName: string): Promise<boolean> {
  try {
    const cmd = new Deno.Command("container", {
      args: ["list"],
      stdout: "piped",
      stderr: "null",
    });

    const result = await cmd.output();
    if (result.success) {
      const output = new TextDecoder().decode(result.stdout);
      // Parse container list output
      // Format: NAME    IMAGE    OS    ARCH    STATUS    IP
      const lines = output.split("\n");
      for (const line of lines) {
        const parts = line.trim().split(/\s+/);
        if (
          parts.length >= 5 && parts[0] === containerName &&
          parts[4] === "running"
        ) {
          return true;
        }
      }
    }
  } catch {
    // Ignore errors
  }
  return false;
}

async function execInContainer(
  containerName: string,
  command: Array<string>,
  interactive: boolean = true,
): Promise<number> {
  const execArgs = ["exec"];

  if (interactive) {
    execArgs.push("-it");
  }

  execArgs.push(containerName, ...command);

  const child = new Deno.Command("container", {
    args: execArgs,
    stdin: "inherit",
    stdout: "inherit",
    stderr: "inherit",
  }).spawn();

  const status = await child.status;
  return status.code;
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

  // Find internalbf directory and go one level up
  let internalbfParentDir: string;
  if (currentPath.includes("/bfmono")) {
    const internalbfDir = currentPath.substring(
      0,
      currentPath.lastIndexOf("/bfmono"),
    );
    internalbfParentDir = dirname(internalbfDir);
  } else {
    internalbfParentDir = dirname(currentPath);
  }

  // Store codebot-workspaces at the same level as internalbf
  return join(internalbfParentDir, "codebot-workspaces");
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

  const dnsServerPath = join(
    dirname(dirname(dirname(import.meta.url.replace("file://", "")))),
    "apps",
    "codebot",
    "dns-server.ts",
  );

  try {
    // Check if DNS server is already running
    const checkCmd = new Deno.Command("pgrep", {
      args: ["-f", "dns-server.ts"],
      stdout: "null",
      stderr: "null",
    });

    const checkResult = await checkCmd.output();

    if (checkResult.success) {
      ui.output("✅ DNS server already running");
      return;
    }

    // Start DNS server
    const startCmd = new Deno.Command("deno", {
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

    startCmd.spawn();

    // Give it a moment to start
    await new Promise((resolve) => setTimeout(resolve, 1000));

    ui.output("✅ DNS server started");
  } catch (error) {
    logger.debug(`DNS server check failed: ${error}`);
    ui.warn(
      "⚠️ Could not start DNS server - *.codebot.local URLs may not work",
    );
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
  // Read the codebot names file
  const namesPath = join(
    dirname(dirname(import.meta.url.replace("file://", ""))),
    "tasks",
    "codebot-names.txt",
  );

  try {
    const namesContent = await Deno.readTextFile(namesPath);
    const names = namesContent
      .split("\n")
      .map((name) => name.trim())
      .filter((name) => name.length > 0);

    if (names.length === 0) {
      throw new Error("No names found in codebot-names.txt");
    }

    // Build separate lists for first and last names
    const firstNames: Array<string> = [];
    const lastNames: Array<string> = [];

    for (const name of names) {
      const firstHyphenIndex = name.indexOf("-");
      if (firstHyphenIndex > 0) {
        // Hyphenated name: split at first hyphen
        const firstName = name.substring(0, firstHyphenIndex);
        const lastName = name.substring(firstHyphenIndex + 1);
        firstNames.push(firstName);
        lastNames.push(lastName);
      } else {
        // Single name: can be used as either first or last
        firstNames.push(name);
        lastNames.push(name);
      }
    }

    // Pick random first and last names
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];

    return `${firstName}-${lastName}`;
  } catch (error) {
    // Fallback to generic names if file read fails
    logger.debug(`Failed to read codebot names: ${error}`);
    const fallbackNames = [
      "happy-coder",
      "swift-debugger",
      "brave-compiler",
      "cool-developer",
      "smart-engineer",
    ];
    return fallbackNames[Math.floor(Math.random() * fallbackNames.length)];
  }
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
  --force-rebuild         (Deprecated - build container manually)
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

  // Ensure container system is started
  ui.output("🚀 Starting container system...");
  const startCmd = new Deno.Command("container", {
    args: ["system", "start"],
    stdout: "null",
    stderr: "null",
  });
  await startCmd.output();

  // Cleanup stopped containers (skip if using --workspace to preserve user's containers)
  if (!parsed.workspace) {
    await cleanupStoppedContainers();
  }

  // Ensure DNS server is running
  await ensureDnsServer();

  // Ensure host bridge is running
  await ensureHostBridge();

  // Ensure wildcard certificate for HTTPS support
  const homeDir = getConfigurationVariable("HOME");
  const sharedCertDir = `${homeDir}/internalbf/bfmono/shared/certs`;
  await ensureWildcardCertificate(sharedCertDir);

  // Check for Claude credentials
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

  // Check if container already exists
  const containerAlreadyExists = await isContainerRunning(workspaceId);

  if (containerAlreadyExists && !reusingWorkspace) {
    ui.output(
      `📦 Container ${workspaceId} already exists, will join it instead of creating new one`,
    );
  }

  // Create workspace and prepare container
  const abortController = new AbortController();

  const copyWorkspacePromise = reusingWorkspace || containerAlreadyExists
    ? Promise.resolve()
    : (async () => {
      await Deno.mkdir(`${workspacePath}`, { recursive: true });
      await Deno.mkdir(`${workspacePath}/tmp`, { recursive: true });

      // Copy Claude config if exists - try multiple locations
      const possiblePaths = [
        `${homeDir}/.claude.json`,
        `${claudeDir}/.claude.json`,
        `${homeDir}/.config/claude/.claude.json`,
      ];

      for (const claudeJsonPath of possiblePaths) {
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
          ui.output(`📋 CoW copied .claude.json from ${claudeJsonPath} to tmp`);
          break; // Stop after first successful copy
        } catch {
          // File doesn't exist, try next location
        }
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

        // Special handling for bfmono directory
        if (entry.name === "bfmono") {
          // Copy bfmono but exclude the shared folder
          const bfmonoSrc = join(internalbfDir, "bfmono");
          const bfmonoDst = join(workspacePath, "bfmono");

          // Create bfmono directory in workspace
          await Deno.mkdir(bfmonoDst, { recursive: true });

          // Copy each subdirectory except shared
          for await (const bfmonoEntry of Deno.readDir(bfmonoSrc)) {
            if (bfmonoEntry.name === "shared") continue;

            const copyCmd = new Deno.Command("cp", {
              args: [
                "--reflink=auto",
                "-R",
                join(bfmonoSrc, bfmonoEntry.name),
                bfmonoDst,
              ],
            });
            copyPromises.push(copyCmd.output());
          }
        } else {
          // Copy other directories normally
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
    // Check if local image exists
    ui.output("🔍 Checking for local container image...");

    const inspectCmd = new Deno.Command("container", {
      args: ["images", "inspect", "codebot"],
      stdout: "piped",
      stderr: "null",
    });

    const inspectResult = await inspectCmd.output();

    if (!inspectResult.success) {
      ui.error(
        "❌ No container image found. Please build the container image first",
      );
      ui.output("💡 Run: bft codebot build");
      throw new Error("Container image not found");
    }

    // Parse the JSON output to get the creation date
    let imageCreatedTime = 0;
    try {
      const inspectData = JSON.parse(
        new TextDecoder().decode(inspectResult.stdout),
      );
      if (inspectData.length > 0 && inspectData[0].Created) {
        imageCreatedTime = new Date(inspectData[0].Created).getTime();
        ui.output(`📅 Container image created: ${inspectData[0].Created}`);
      }
    } catch {
      // If we can't parse, just continue
    }

    // Check if Dockerfile or flake files are newer than the image
    const dockerfilePath = join(
      dirname(dirname(dirname(import.meta.url.replace("file://", "")))),
      "Dockerfile.infra",
    );
    const flakePath = join(
      dirname(
        dirname(dirname(dirname(import.meta.url.replace("file://", "")))),
      ),
      "flake.nix",
    );
    const flakeLockPath = join(
      dirname(
        dirname(dirname(dirname(import.meta.url.replace("file://", "")))),
      ),
      "flake.lock",
    );

    try {
      const dockerfileStat = await Deno.stat(dockerfilePath);
      const flakeStat = await Deno.stat(flakePath);
      const flakeLockStat = await Deno.stat(flakeLockPath);

      const dockerfileModified = dockerfileStat.mtime?.getTime() || 0;
      const flakeModified = flakeStat.mtime?.getTime() || 0;
      const flakeLockModified = flakeLockStat.mtime?.getTime() || 0;

      if (imageCreatedTime > 0) {
        if (dockerfileModified > imageCreatedTime) {
          ui.warn(
            "⚠️ Dockerfile.infra has been modified since the image was built",
          );
          ui.warn("   Consider rebuilding with: bft codebot build");
        } else if (
          flakeModified > imageCreatedTime ||
          flakeLockModified > imageCreatedTime
        ) {
          ui.warn("⚠️ Nix flake has been modified since the image was built");
          ui.warn("   Consider rebuilding with: bft codebot build");
        }
      }
    } catch (error) {
      logger.debug(`Could not check file timestamps: ${error}`);
    }

    ui.output("📦 Container image ready");
  })();

  // Wait for both operations
  if (!containerAlreadyExists) {
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
  }

  // Setup shared directory path
  const currentPath = dirname(
    dirname(dirname(dirname(import.meta.url.replace("file://", "")))),
  );
  let internalbfDir: string;
  if (currentPath.includes("/bfmono")) {
    internalbfDir = currentPath.substring(
      0,
      currentPath.lastIndexOf("/bfmono"),
    );
  } else {
    internalbfDir = currentPath;
  }
  const sharedPath = join(internalbfDir, "bfmono", "shared");

  // Ensure shared directory exists
  try {
    await Deno.mkdir(sharedPath, { recursive: true });
  } catch {
    // Directory might already exist
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
    sharedPath,
  };

  // Check if container already exists and is running
  const containerExists = await isContainerRunning(workspaceId);

  if (containerExists) {
    ui.output(`📦 Container ${workspaceId} is already running, joining it...`);

    // Handle different execution modes
    if (parsed.shell) {
      await execInContainer(workspaceId, ["bash", "-l"]);
    } else if (parsed.exec) {
      await execInContainer(workspaceId, ["bash", "-c", parsed.exec], false);
    } else {
      // Default interactive mode - launch Claude CLI
      await execInContainer(workspaceId, [
        "bash",
        "-c",
        "claude; exec bash -l",
      ]);
    }
  } else {
    // Container doesn't exist, create a new one
    ui.output(`📦 Creating new container ${workspaceId}...`);

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
      // Default interactive mode - launch Claude CLI then drop to shell
      const containerArgs = buildContainerArgs(containerConfig, botConfig);
      containerArgs.push(
        "codebot",
        "-c",
        "claude; exec bash -l",
      );

      const child = new Deno.Command("container", {
        args: containerArgs,
        stdin: "inherit",
        stdout: "inherit",
        stderr: "inherit",
      }).spawn();

      await child.status;
    }
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
