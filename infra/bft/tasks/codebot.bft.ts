#!/usr/bin/env -S bft run

import type { TaskDefinition } from "../bft.ts";
import { type BotConfig, runBot } from "../lib/container-bot-base.ts";

const codebotConfig: BotConfig = {
  name: "codebot",
  envVar: "CODEBOT_CONTAINER",
  githubTokenVar: "BF_CODEBOT_GITHUB_TOKEN",
  workingDir: "/internalbf/bfmono",
  helpExamples: `
CODEBOT - Claude Code CLI container

USAGE:
  bft codebot [OPTIONS]

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

BUILD CONTAINER:
  bft codebot-build       Build or rebuild the container image

EXAMPLES:
  bft codebot                           # Start Claude Code CLI (new workspace)
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

export const bftDefinition: TaskDefinition = {
  description: "Claude Code CLI in isolated container",
  fn: async () => {
    return await runBot(codebotConfig);
  },
};
