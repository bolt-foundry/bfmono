#!/usr/bin/env -S bft run

import type { TaskDefinition } from "../bft.ts";
import { type BotConfig, runBot } from "../lib/container-bot-base.ts";
import { ui } from "@bfmono/packages/tui/tui.ts";
import { dirname, join } from "@std/path";

const codebotConfig: BotConfig = {
  name: "codebot",
  envVar: "CODEBOT_CONTAINER",
  githubTokenVar: "CODEBOT_GITHUB_PAT",
  workingDir: "/internalbf/bfmono",
  helpExamples: `
CODEBOT - Claude Code CLI container

USAGE:
  bft codebot [OPTIONS]
  bft codebot build [OPTIONS]

SUBCOMMANDS:
  build                   Build the codebot container image

OPTIONS:
  --workspace <name>      Use specific workspace name (e.g., fuzzy-goat)
  --resume                Resume from existing workspace (interactive selection)
  --cleanup               Delete workspace after exit
  --cleanup-containers    Clean up all stopped containers
  --shell                 Open shell instead of Claude Code CLI
  --exec <command>        Execute command and exit
  --checkout <branch>     Checkout branch with auto shelve/unshelve
  --memory <size>         Container memory limit (e.g., 4g, 8192m)
  --cpus <count>          Number of CPUs (e.g., 4)
  --debug-logs            Enable debug logging for troubleshooting
  --help                  Show this help

BUILD OPTIONS:
  --no-cache              Build without using cache

EXAMPLES:
  bft codebot                           # Start Claude Code CLI (new workspace)
  bft codebot build                     # Build the container image
  bft codebot build --no-cache          # Build without cache
  bft codebot --workspace fuzzy-goat    # Resume running container or reuse workspace
  bft codebot --resume                  # Choose from existing workspaces
  bft codebot --cleanup                 # Start and cleanup workspace when done
  bft codebot --shell                   # Open container shell for debugging
  bft codebot --exec "ls -la"           # Run command and exit
  bft codebot --checkout remote/main    # Checkout branch with auto shelve/unshelve
  bft codebot --memory 8g --cpus 8      # Run with 8GB RAM and 8 CPUs

WORKSPACE INFO:
  - Workspaces are stored in codebot-workspaces/
  - Each workspace is a CoW (copy-on-write) clone for instant creation
  - Use --cleanup to remove workspace after use
  - Use --resume to continue with existing workspace

DEBUGGING:
  - Container name matches workspace name
  - Access via: http://<workspace-name>.codebot.local:8000
  - Shell access: bft codebot --workspace <name> --shell
  - View logs: container logs <workspace-name>
`,
};

async function buildContainer(args: Array<string>): Promise<number> {
  ui.output("🔨 Building codebot container image...");

  // Check for --no-cache flag
  const noCache = args.includes("--no-cache");

  // Get path to the standardized infra Dockerfile
  const currentPath = dirname(import.meta.url.replace("file://", ""));
  const dockerfilePath = join(currentPath, "../../Dockerfile.infra");

  // Check if Dockerfile exists
  try {
    await Deno.stat(dockerfilePath);
  } catch {
    ui.error("❌ Dockerfile not found at: " + dockerfilePath);
    return 1;
  }

  ui.output("📦 Using standardized infra Dockerfile");

  // Get the internalbf directory (parent of bfmono) for build context
  const bfmonoPath = join(currentPath, "../../..");
  const buildContext = dirname(bfmonoPath);

  // Build the image
  ui.output("🏗️  Building codebot image...");

  const buildArgs = [
    "build",
    "-t",
    "codebot",
    "-f",
    dockerfilePath,
  ];

  if (noCache) {
    buildArgs.push("--no-cache");
    ui.output("🚫 Building without cache");
  }

  // Add the build context
  buildArgs.push(buildContext);

  const buildCmd = new Deno.Command("container", {
    args: buildArgs,
    stdout: "inherit",
    stderr: "inherit",
    cwd: buildContext, // Set working directory to internalbf
  });

  const buildResult = await buildCmd.output();

  if (buildResult.success) {
    ui.output("✅ Container image built successfully");
    ui.output("🚀 You can now run: bft codebot");
    return 0;
  } else {
    ui.error("❌ Failed to build container image");
    return 1;
  }
}

export const bftDefinition: TaskDefinition = {
  description: "Claude Code CLI in isolated container",
  fn: async (args: Array<string>) => {
    // Check if first arg is "build"
    if (args.length > 0 && args[0] === "build") {
      // Remove "build" from args and pass the rest
      return await buildContainer(args.slice(1));
    }

    // Otherwise run the container normally
    return await runBot(codebotConfig);
  },
};
